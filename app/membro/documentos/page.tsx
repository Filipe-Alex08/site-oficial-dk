import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download, FileText, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { graduationLabels, rankLabels } from "@/lib/member-access";
import { createClient } from "@/lib/supabase/server";
import type { InternalDocument, MemberProfile } from "@/lib/types";

export const metadata: Metadata = { title: "Documentos internos" };

function accessLabel(document: InternalDocument) {
  if (document.audience === "todos") return "Todos os membros aprovados";
  if (document.audience === "oficiais") return `Oficiais a partir de ${rankLabels[document.minimum_rank!]}`;
  return `Graduação ${graduationLabels[document.minimum_graduation!]} ou superior`;
}

export default async function MemberDocumentsPage() {
  const supabase = await createClient();
  if (!supabase) {
    return <section className="section"><div className="container info-band"><strong>Banco ainda não conectado</strong><p>Configure o Supabase para ativar os documentos internos.</p></div></section>;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/area-do-membro/login");

  const [{ data: profileData }, { data: documentData }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("documents").select("*").eq("active", true).order("created_at", { ascending: false }),
  ]);
  const profile = profileData as MemberProfile | null;
  if (!profile || profile.status !== "aprovado") redirect("/area-do-membro/login");
  const documents = (documentData ?? []) as InternalDocument[];

  return (
    <>
      <section className="member-heading">
        <div className="container member-heading-inner">
          <div><p className="eyebrow">Área interna</p><h1>Documentos</h1><p>Materiais liberados para o perfil de {profile.nickname}.</p></div>
          <Link className="button button-ghost" href="/membro"><ArrowLeft size={18} /> Voltar</Link>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="access-summary"><ShieldCheck /><p>O acesso é calculado pelo tipo de membro, patente e graduação. Materiais de graduação seguem a progressão Bronze → Prata → Ouro.</p></div>
          {documents.length ? (
            <div className="document-grid">
              {documents.map((document) => (
                <article className="document-card" key={document.id}>
                  <FileText />
                  <div><span>{accessLabel(document)}</span><h2>{document.title}</h2><p>{document.description || "Documento interno do DK."}</p><small>{document.file_name}</small></div>
                  <a className="button button-primary" href={`/api/documents/${document.id}/download`} target="_blank" rel="noreferrer"><Download size={17} /> Abrir PDF</a>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state"><FileText /><h2>Nenhum documento disponível</h2><p>Os materiais aparecerão aqui quando forem cadastrados e liberados para o seu perfil.</p></div>
          )}
        </div>
      </section>
    </>
  );
}
