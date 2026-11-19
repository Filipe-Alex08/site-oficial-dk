import type { SupabaseClient } from "@supabase/supabase-js";
import { graduationTracks, isCommander, rankOptions } from "@/lib/member-access";
import type { DkRank, DocumentTrack, GraduationLevel, MemberProfile } from "@/lib/types";

/** Tamanho máximo de uma anotação (o banco confere o mesmo limite). */
export const NOTE_MAX = 2000;

/** Colunas do perfil que as telas de anotação podem mostrar do outro membro. */
export const NOTE_COUNTERPART_COLUMNS = "id,full_name,nickname,avatar_path,rank,graduation_cavalaria,graduation_arquearia,commander_cavalaria,commander_arquearia";

/** Posição na hierarquia: a mesma ordem de rank_weight() no banco. */
const rankIndex = (rank: DkRank) => rankOptions.findIndex((option) => option.value === rank);

export function isRank(value: unknown): value is DkRank {
  return typeof value === "string" && rankOptions.some((option) => option.value === value);
}

/** Patente igual ou superior à mínima. Patente desconhecida nunca passa. */
export function rankAtLeast(rank: DkRank, minimum: DkRank): boolean {
  const index = rankIndex(rank);
  return index >= 0 && index >= rankIndex(minimum);
}

// ---------------------------------------------------------------------------
// Configurações (site_settings, migrações 025 e 026)
// ---------------------------------------------------------------------------

/** Quem escreve: só comandantes de trilha, só a patente mínima, ou os dois. */
export type NotesWriters = "commanders" | "ranks" | "both";
/** Para quem o comandante escreve: qualquer membro, quem é da trilha dele, ou da trilha e do nível dele. */
export type NotesCommanderScope = "any" | "track" | "track_level";

export type NotesSettings = {
  enabled: boolean;
  writers: NotesWriters;
  commanderScope: NotesCommanderScope;
  minRank: DkRank;
};

/** Vale quando nada foi configurado: é o comportamento da migração 025. */
export const DEFAULT_NOTES_SETTINGS: NotesSettings = { enabled: true, writers: "both", commanderScope: "any", minRank: "subtenente" };

export const notesWritersOptions: Array<{ value: NotesWriters; label: string; description: string }> = [
  { value: "both", label: "Comandantes e patentes", description: "Comandantes de graduação e quem tem a patente mínima ou superior." },
  { value: "commanders", label: "Só comandantes", description: "Apenas comandantes de Cavalaria ou Arquearia. A patente não conta." },
  { value: "ranks", label: "Só patentes", description: "Apenas quem tem a patente mínima ou superior. Ser comandante não conta." },
];

export const notesScopeOptions: Array<{ value: NotesCommanderScope; label: string; description: string }> = [
  { value: "any", label: "Qualquer membro", description: "O comandante escreve para qualquer membro aprovado." },
  { value: "track", label: "Só a mesma trilha", description: "O comandante escreve para quem tem graduação na trilha que ele comanda, em qualquer nível." },
  { value: "track_level", label: "Mesma trilha e graduação", description: "O comandante escreve só para quem tem a mesma trilha e o mesmo nível dele (ex.: Cavaleiro de Bronze)." },
];

export const NOTES_SETTING_KEYS = ["notes_enabled", "notes_writers", "notes_commander_scope", "notes_min_rank"] as const;

const isWriters = (value: unknown): value is NotesWriters => notesWritersOptions.some((option) => option.value === value);
const isScope = (value: unknown): value is NotesCommanderScope => notesScopeOptions.some((option) => option.value === value);

/** Monta as configurações a partir das linhas de site_settings. Ausente ou inválido volta ao padrão (como o banco). */
export function parseNotesSettings(rows: Array<{ key: string; value: unknown }> | null | undefined): NotesSettings {
  const byKey = new Map((rows ?? []).map((row) => [row.key, row.value]));
  const writers = byKey.get("notes_writers");
  const scope = byKey.get("notes_commander_scope");
  const minRank = byKey.get("notes_min_rank");
  return {
    enabled: byKey.get("notes_enabled") !== false,
    writers: isWriters(writers) ? writers : DEFAULT_NOTES_SETTINGS.writers,
    commanderScope: isScope(scope) ? scope : DEFAULT_NOTES_SETTINGS.commanderScope,
    minRank: isRank(minRank) ? minRank : DEFAULT_NOTES_SETTINGS.minRank,
  };
}

export async function loadNotesSettings(supabase: SupabaseClient): Promise<NotesSettings> {
  const { data } = await supabase.from("site_settings").select("key,value").in("key", [...NOTES_SETTING_KEYS]);
  return parseNotesSettings(data);
}

// ---------------------------------------------------------------------------
// Quem pode escrever e para quem (espelho de note_write_allowed(), migração 026)
// ---------------------------------------------------------------------------

type WriterFields = Pick<MemberProfile, "status" | "rank" | "graduation_cavalaria" | "graduation_arquearia" | "commander_cavalaria" | "commander_arquearia">;
type RecipientFields = Pick<MemberProfile, "graduation_cavalaria" | "graduation_arquearia">;

const hasRankAccess = (profile: WriterFields, settings: NotesSettings) =>
  settings.writers !== "commanders" && rankAtLeast(profile.rank, settings.minRank);

/** Trilhas em que o membro vale como comandante nesta configuração (o modo "só patentes" ignora o comando). */
function commandedTracks(profile: WriterFields, settings: NotesSettings) {
  if (settings.writers === "ranks") return [];
  return graduationTracks.filter((track) => isCommander(profile[track.field], profile[track.commanderField]));
}

/**
 * Pode escrever anotações? Sistema ligado, membro aprovado e, conforme o modo,
 * comandante de uma trilha e/ou com a patente mínima. O banco decide de verdade;
 * aqui serve para mostrar ou esconder telas.
 */
export function canWriteNotes(profile: WriterFields | null | undefined, settings: NotesSettings): boolean {
  if (!profile || !settings.enabled || profile.status !== "aprovado") return false;
  return hasRankAccess(profile, settings) || commandedTracks(profile, settings).length > 0;
}

/**
 * Pode escrever para este membro? A restrição de trilha/graduação vale para quem
 * escreve só como comandante; a patente mínima escreve para qualquer membro.
 */
export function canWriteNoteTo(author: WriterFields | null | undefined, recipient: RecipientFields, settings: NotesSettings): boolean {
  if (!author || !canWriteNotes(author, settings)) return false;
  if (hasRankAccess(author, settings) || settings.commanderScope === "any") return true;
  return commandedTracks(author, settings).some((track) => {
    const theirs = recipient[track.field] ?? "sem_graduacao";
    return settings.commanderScope === "track"
      ? theirs !== "sem_graduacao"
      : theirs === (author[track.field] ?? "sem_graduacao");
  });
}

/** Frase que explica a quem este membro pode escrever, ou null quando não há restrição. */
export function recipientRestriction(author: WriterFields | null | undefined, settings: NotesSettings): string | null {
  if (!author || !canWriteNotes(author, settings) || hasRankAccess(author, settings) || settings.commanderScope === "any") return null;
  const tracks = commandedTracks(author, settings).map((track) => track.label).join(" e ");
  return settings.commanderScope === "track"
    ? `Como comandante, você escreve para quem tem graduação em ${tracks}.`
    : `Como comandante, você escreve para quem tem a mesma graduação que a sua em ${tracks}.`;
}

// ---------------------------------------------------------------------------
// Selo
// ---------------------------------------------------------------------------

export type NoteSeal = { track: DocumentTrack; level: Exclude<GraduationLevel, "sem_graduacao"> };

type SealAuthor = Pick<MemberProfile, "graduation_cavalaria" | "graduation_arquearia" | "commander_cavalaria" | "commander_arquearia">;
type SealRecipient = Pick<MemberProfile, "graduation_cavalaria" | "graduation_arquearia">;

/**
 * Selos que uma anotação levaria: um por trilha em que o autor é comandante e o
 * destinatário tem graduação (qualquer nível). A cor vem do nível do comandante.
 * Espelha o gatilho member_notes_before_write(); a prévia do formulário usa isto.
 */
export function noteSealsFor(author: SealAuthor, recipient: SealRecipient): NoteSeal[] {
  return graduationTracks.flatMap((track) => {
    const level = author[track.field] ?? "sem_graduacao";
    const recipientLevel = recipient[track.field] ?? "sem_graduacao";
    if (!isCommander(level, author[track.commanderField]) || recipientLevel === "sem_graduacao" || level === "sem_graduacao") return [];
    return [{ track: track.value, level }];
  });
}

/** Selos gravados numa anotação (o que o banco decidiu na criação). */
export function sealsOfNote(note: { seal_cavalaria: GraduationLevel | null; seal_arquearia: GraduationLevel | null }): NoteSeal[] {
  const seals: NoteSeal[] = [];
  if (note.seal_cavalaria && note.seal_cavalaria !== "sem_graduacao") seals.push({ track: "cavalaria", level: note.seal_cavalaria });
  if (note.seal_arquearia && note.seal_arquearia !== "sem_graduacao") seals.push({ track: "arquearia", level: note.seal_arquearia });
  return seals;
}

// ---------------------------------------------------------------------------
// Texto
// ---------------------------------------------------------------------------

/** Texto limpo de uma anotação, ou null se vazio, longo demais ou não for texto. */
export function cleanNoteBody(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const body = value.replace(/\r\n/g, "\n").trim();
  return body.length > 0 && body.length <= NOTE_MAX ? body : null;
}

/** Nome para mostrar: apelido quando há, senão o nome completo. */
export function noteDisplayName(member: { nickname?: string | null; full_name: string }): string {
  return member.nickname?.trim() || member.full_name;
}
