import { NextResponse } from "next/server";
import { NO_STORE, requireNoteActor } from "@/lib/member-notes-server";

export const runtime = "nodejs";

// Marca como lidas todas as anotações que o membro recebeu.
export async function POST(request: Request) {
  const actor = await requireNoteActor(request);
  if (actor instanceof NextResponse) return actor;

  const { error } = await actor.admin
    .from("member_notes")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", actor.user.id)
    .is("read_at", null);
  if (error) {
    console.error("Falha ao marcar as anotações como lidas", error.code);
    return NextResponse.json({ error: "Não foi possível marcar como lidas." }, { status: 500, headers: NO_STORE });
  }
  return NextResponse.json({ success: true }, { headers: NO_STORE });
}
