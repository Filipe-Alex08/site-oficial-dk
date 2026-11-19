import { NextResponse } from "next/server";
import { NOTE_MAX, cleanNoteBody } from "@/lib/member-notes";
import { NO_STORE, isUuid, requireNoteActor } from "@/lib/member-notes-server";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

const fail = (error: string, status: number) => NextResponse.json({ error }, { status, headers: NO_STORE });

/** Carrega a anotação só se o membro for uma das pontas; quem não é recebe 404, como se ela não existisse. */
async function loadNote(actor: Exclude<Awaited<ReturnType<typeof requireNoteActor>>, NextResponse>, id: string) {
  const { data } = await actor.admin.from("member_notes").select("id,author_id,recipient_id").eq("id", id).maybeSingle();
  if (!data || (data.author_id !== actor.user.id && data.recipient_id !== actor.user.id)) return null;
  return data as { id: string; author_id: string; recipient_id: string };
}

// Autor: edita o texto. Destinatário: marca como lida ({ read: true }) ou não lida ({ read: false }).
export async function PATCH(request: Request, { params }: Context) {
  const actor = await requireNoteActor(request);
  if (actor instanceof NextResponse) return actor;

  const { id } = await params;
  if (!isUuid(id)) return fail("Anotação inválida.", 400);
  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object") return fail("Dados inválidos.", 400);
  const editing = "body" in payload;
  const marking = "read" in payload;
  if (editing === marking || (marking && typeof payload.read !== "boolean")) return fail("Dados inválidos.", 400);

  const note = await loadNote(actor, id);
  if (!note) return fail("Anotação não encontrada.", 404);

  let changes: { body: string } | { read_at: string | null };
  if (editing) {
    if (note.author_id !== actor.user.id) return fail("Só quem escreveu pode editar a anotação.", 403);
    const body = cleanNoteBody(payload.body);
    if (!body) return fail(`Escreva a anotação (até ${NOTE_MAX} caracteres).`, 400);
    const { data: allowed } = await actor.supabase.rpc("can_write_member_notes");
    if (!allowed) return fail("Você não tem mais permissão para escrever anotações.", 403);
    changes = { body };
  } else {
    if (note.recipient_id !== actor.user.id) return fail("Só quem recebeu pode marcar a anotação como lida.", 403);
    changes = { read_at: payload.read ? new Date().toISOString() : null };
  }

  const { data: updated, error } = await actor.admin.from("member_notes").update(changes).eq("id", id).select("*").single();
  if (error || !updated) {
    console.error("Falha ao atualizar a anotação", error?.code);
    return fail("Não foi possível atualizar a anotação.", 500);
  }
  return NextResponse.json({ note: updated }, { headers: NO_STORE });
}

// Só o autor apaga (a anotação some para os dois lados).
export async function DELETE(request: Request, { params }: Context) {
  const actor = await requireNoteActor(request);
  if (actor instanceof NextResponse) return actor;

  const { id } = await params;
  if (!isUuid(id)) return fail("Anotação inválida.", 400);

  const note = await loadNote(actor, id);
  if (!note) return fail("Anotação não encontrada.", 404);
  if (note.author_id !== actor.user.id) return fail("Só quem escreveu pode apagar a anotação.", 403);

  const { error } = await actor.admin.from("member_notes").delete().eq("id", id);
  if (error) {
    console.error("Falha ao apagar a anotação", error.code);
    return fail("Não foi possível apagar a anotação.", 500);
  }
  return NextResponse.json({ success: true }, { headers: NO_STORE });
}
