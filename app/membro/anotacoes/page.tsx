import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LiveRefresh from "@/components/LiveRefresh";
import AppPageHeader from "@/components/member/AppPageHeader";
import NoteComposer from "@/components/member/notes/NoteComposer";
import NoteList, { type NoteItem } from "@/components/member/notes/NoteList";
import Unavailable from "@/components/member/Unavailable";
import { NOTE_COUNTERPART_COLUMNS, canWriteNoteTo, canWriteNotes, noteDisplayName, recipientRestriction } from "@/lib/member-notes";
import { getNotesSettings } from "@/lib/notes-settings";
import { createAdminClient } from "@/lib/supabase/admin";
import type { MemberNote, NoteCounterpart } from "@/lib/types";
import { getAuth, getMember } from "@/lib/viewer";

export const metadata: Metadata = { title: "Anotações" };

export default async function MemberNotesPage({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const { supabase, user } = await getAuth();
  if (!supabase) return <Unavailable />;
  if (!user) redirect("/area-do-membro/login");

  const [{ profile }, { aba }] = await Promise.all([getMember(), searchParams]);
  if (!profile || profile.status !== "aprovado") redirect("/area-do-membro/login");

  // Sistema desligado no painel: a página some (as anotações continuam guardadas).
  const settings = await getNotesSettings();
  if (!settings.enabled) redirect("/membro");

  // O RLS já limita as linhas ao autor e ao destinatário.
  const { data: noteRows } = await supabase.from("member_notes").select("*").order("created_at", { ascending: false });
  const canWrite = canWriteNotes(profile, settings);
  const notes = (noteRows ?? []) as MemberNote[];

  // Perfis dos outros membros: o RLS de profiles não os libera, então vêm do servidor, só com as colunas da tela.
  const counterpartIds = [...new Set(notes.map((note) => (note.author_id === user.id ? note.recipient_id : note.author_id)))];
  const admin = createAdminClient();
  const [counterpartResult, recipientResult] = admin
    ? await Promise.all([
        counterpartIds.length ? admin.from("profiles").select(NOTE_COUNTERPART_COLUMNS).in("id", counterpartIds) : Promise.resolve({ data: [] }),
        canWrite ? admin.from("profiles").select(NOTE_COUNTERPART_COLUMNS).eq("status", "aprovado").neq("id", user.id) : Promise.resolve({ data: [] }),
      ])
    : [{ data: [] }, { data: [] }];
  const counterparts = new Map(((counterpartResult.data ?? []) as unknown as NoteCounterpart[]).map((member) => [member.id, member]));
  // Só aparecem os membros para quem as regras atuais deixam este autor escrever.
  const recipients = ((recipientResult.data ?? []) as unknown as NoteCounterpart[])
    .filter((member) => canWriteNoteTo(profile, member, settings))
    .sort((a, b) => noteDisplayName(a).localeCompare(noteDisplayName(b), "pt-BR"));

  const toItem = (note: MemberNote): NoteItem => ({
    note,
    counterpart: counterparts.get(note.author_id === user.id ? note.recipient_id : note.author_id) ?? null,
  });
  const received = notes.filter((note) => note.recipient_id === user.id).map(toItem);
  const sent = notes.filter((note) => note.author_id === user.id).map(toItem);

  return (
    <>
      <LiveRefresh tables={["member_notes"]} />
      <AppPageHeader
        title="Anotações"
        crumbs={[{ label: "Início", href: "/membro" }]}
      />
      <section className="section">
        <div className="container m-notes-page">
          {canWrite && <NoteComposer author={profile} recipients={recipients} restriction={recipientRestriction(profile, settings)} startOpen={sent.length === 0} />}
          <div className="m-notes-main">
            <NoteList received={received} sent={sent} canWrite={canWrite} initialTab={aba === "enviadas" ? "enviadas" : "recebidas"} />
          </div>
        </div>
      </section>
    </>
  );
}
