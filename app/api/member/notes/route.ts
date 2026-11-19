import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { NOTE_MAX, cleanNoteBody } from "@/lib/member-notes";
import { NO_STORE, isUuid, requireNoteActor } from "@/lib/member-notes-server";

export const runtime = "nodejs";

/** Recusa com o motivo certo: não pode escrever nada, ou não pode escrever para este membro. */
async function denied(supabase: SupabaseClient) {
  const { data: canWriteAny } = await supabase.rpc("can_write_member_notes");
  const error = canWriteAny
    ? "Pelas regras atuais, você não pode escrever para este membro."
    : "Você não tem permissão para escrever anotações.";
  return NextResponse.json({ error }, { status: 403, headers: NO_STORE });
}

// Cria uma anotação. O selo de comandante é calculado pelo banco (gatilho), a
// partir dos perfis do autor e do destinatário: nada do que vem no corpo o influencia.
export async function POST(request: Request) {
  const actor = await requireNoteActor(request);
  if (actor instanceof NextResponse) return actor;

  const payload = await request.json().catch(() => null);
  const recipientId = payload?.recipientId;
  const body = cleanNoteBody(payload?.body);
  if (!isUuid(recipientId)) return NextResponse.json({ error: "Escolha para quem é a anotação." }, { status: 400, headers: NO_STORE });
  if (!body) return NextResponse.json({ error: `Escreva a anotação (até ${NOTE_MAX} caracteres).` }, { status: 400, headers: NO_STORE });
  if (recipientId === actor.user.id) return NextResponse.json({ error: "Escolha outro membro: não dá para anotar para si mesmo." }, { status: 400, headers: NO_STORE });

  const { data: recipient } = await actor.admin.from("profiles").select("id,status").eq("id", recipientId).maybeSingle();
  if (!recipient || recipient.status !== "aprovado") return NextResponse.json({ error: "Membro não encontrado." }, { status: 404, headers: NO_STORE });

  // Quem decide é o banco (migração 026): modo de escrita, patente mínima e alcance do comandante.
  const { data: allowedTo } = await actor.supabase.rpc("can_write_note_to", { recipient: recipientId });
  if (!allowedTo) return denied(actor.supabase);

  const { data: note, error } = await actor.admin
    .from("member_notes")
    .insert({ author_id: actor.user.id, recipient_id: recipientId, body })
    .select("*")
    .single();
  // O gatilho repete a checagem: cobre a mudança de regra entre a pergunta e a gravação.
  if (error?.code === "42501") return denied(actor.supabase);
  if (error || !note) {
    console.error("Falha ao salvar a anotação", error?.code);
    return NextResponse.json({ error: "Não foi possível salvar a anotação." }, { status: 500, headers: NO_STORE });
  }
  // Sem logEvent de propósito: nem o conteúdo nem a relação autor/destinatário vão para os logs.
  return NextResponse.json({ note }, { status: 201, headers: NO_STORE });
}
