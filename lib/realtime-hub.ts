import { Client } from "pg";

// Hub de tempo real do servidor.
//
// Mantém UMA conexão com o Postgres escutando o canal dk_changes (LISTEN) e
// repassa cada aviso a quem estiver inscrito (as conexões SSE de app/api/realtime).
// Os avisos vêm dos gatilhos da migração 023 e carregam só { table, op }.
//
// Por que não o Supabase Realtime: o gateway (Envoy) só aceita a apikey idêntica
// ao ANON_KEY dele, e essa chave não tem `exp`, que o serviço Realtime exige.
//
// A conexão só existe enquanto há alguém inscrito. Ao cair, reconecta sozinha e
// manda um aviso { table: "*" } para todos refazerem a busca (avisos podem ter
// sido perdidos durante a queda).

const CHANNEL = "dk_changes";
const IDLE_CLOSE_MS = 60_000;
const MAX_BACKOFF_MS = 30_000;
const CONNECT_TIMEOUT_MS = 10_000;

export const RESYNC_MESSAGE = JSON.stringify({ table: "*", op: "RESYNC" });

type Listener = (message: string) => void;

type Hub = {
  listeners: Set<Listener>;
  client: Client | null;
  starting: Promise<boolean> | null;
  backoff: number;
  retryTimer: ReturnType<typeof setTimeout> | null;
  idleTimer: ReturnType<typeof setTimeout> | null;
  wasDown: boolean;
};

// globalThis: o modo dev recarrega módulos e criaria um hub (e uma conexão) por recarga.
const holder = globalThis as typeof globalThis & { __dkRealtimeHub?: Hub };
const hub: Hub = (holder.__dkRealtimeHub ??= {
  listeners: new Set(),
  client: null,
  starting: null,
  backoff: 1000,
  retryTimer: null,
  idleTimer: null,
  wasDown: false,
});

// Limite de conexões abertas por endereço (várias abas do mesmo visitante cabem; um
// script abrindo centenas, não). Contado aqui, junto do hub, para sobreviver ao
// recarregamento de módulos do modo dev.
export const MAX_STREAMS_PER_IP = 6;
const ipHolder = globalThis as typeof globalThis & { __dkRealtimeIps?: Map<string, number> };
const ipCounts: Map<string, number> = (ipHolder.__dkRealtimeIps ??= new Map());

/**
 * Reserva uma vaga para o endereço. Devolve a função que a libera (idempotente) ou
 * `null` se o endereço já está no limite. Sem endereço conhecido não há limite por IP
 * (só o teto global da rota), para nunca barrar todo mundo por falta de cabeçalho.
 */
export function reserveConnection(ip: string | null): (() => void) | null {
  if (!ip) return () => undefined;
  const current = ipCounts.get(ip) ?? 0;
  if (current >= MAX_STREAMS_PER_IP) return null;
  ipCounts.set(ip, current + 1);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    const left = (ipCounts.get(ip) ?? 1) - 1;
    if (left <= 0) ipCounts.delete(ip);
    else ipCounts.set(ip, left);
  };
}

export function isRealtimeConfigured() {
  return Boolean(process.env.REALTIME_DATABASE_URL?.trim());
}

export function subscriberCount() {
  return hub.listeners.size;
}

function emit(message: string) {
  for (const listener of hub.listeners) {
    try {
      listener(message);
    } catch {
      // Um assinante com problema não pode derrubar os outros.
    }
  }
}

function scheduleRetry() {
  if (hub.retryTimer || hub.listeners.size === 0) return;
  hub.retryTimer = setTimeout(() => {
    hub.retryTimer = null;
    void start();
  }, hub.backoff);
  hub.backoff = Math.min(hub.backoff * 2, MAX_BACKOFF_MS);
}

function handleDown(client: Client) {
  if (hub.client !== client) return;
  hub.client = null;
  hub.wasDown = true;
  client.removeAllListeners();
  client.on("error", () => undefined); // evita "unhandled error" em fechamentos tardios
  void client.end().catch(() => undefined);
  scheduleRetry();
}

function start(): Promise<boolean> {
  if (hub.client) return Promise.resolve(true);
  if (hub.starting) return hub.starting;
  const connectionString = process.env.REALTIME_DATABASE_URL?.trim();
  if (!connectionString) return Promise.resolve(false);

  hub.starting = (async () => {
    const client = new Client({
      connectionString,
      application_name: "dk-realtime",
      keepAlive: true,
      connectionTimeoutMillis: CONNECT_TIMEOUT_MS,
    });
    try {
      client.on("notification", (message) => {
        if (message.channel === CHANNEL && message.payload) emit(message.payload);
      });
      client.on("error", () => handleDown(client));
      client.on("end", () => handleDown(client));
      await client.connect();
      await client.query(`LISTEN ${CHANNEL}`);
      hub.client = client;
      hub.backoff = 1000;
      if (hub.wasDown) {
        hub.wasDown = false;
        emit(RESYNC_MESSAGE);
      }
      return true;
    } catch {
      client.removeAllListeners();
      client.on("error", () => undefined);
      void client.end().catch(() => undefined);
      hub.wasDown = true;
      scheduleRetry();
      return false;
    } finally {
      hub.starting = null;
    }
  })();
  return hub.starting;
}

function closeIfIdle() {
  if (hub.listeners.size > 0) return;
  const client = hub.client;
  hub.client = null;
  hub.wasDown = false;
  if (hub.retryTimer) { clearTimeout(hub.retryTimer); hub.retryTimer = null; }
  if (client) {
    client.removeAllListeners();
    client.on("error", () => undefined);
    void client.end().catch(() => undefined);
  }
}

/**
 * Inscreve um ouvinte. Resolve com `false` se o banco não está acessível (ou não
 * configurado); nesse caso nada foi inscrito. O retorno `unsubscribe` é sempre seguro.
 */
export async function subscribe(listener: Listener): Promise<{ ok: boolean; unsubscribe: () => void }> {
  if (!isRealtimeConfigured()) return { ok: false, unsubscribe: () => undefined };

  if (hub.idleTimer) { clearTimeout(hub.idleTimer); hub.idleTimer = null; }
  hub.listeners.add(listener);
  const unsubscribe = () => {
    hub.listeners.delete(listener);
    if (hub.listeners.size === 0 && !hub.idleTimer) {
      hub.idleTimer = setTimeout(() => { hub.idleTimer = null; closeIfIdle(); }, IDLE_CLOSE_MS);
    }
  };

  const ok = await start();
  if (!ok) {
    unsubscribe();
    return { ok: false, unsubscribe: () => undefined };
  }
  return { ok: true, unsubscribe };
}
