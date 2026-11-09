import type { Metadata } from "next";
import { Download, FileText } from "lucide-react";
import { redirect } from "next/navigation";
import AppPageHeader from "@/components/member/AppPageHeader";
import DocumentAccessBadge from "@/components/member/DocumentAccessBadge";
import Unavailable from "@/components/member/Unavailable";
import { createClient } from "@/lib/supabase/server";
import type { InternalDocument, MemberProfile } from "@/lib/types";

export const metadata: Metadata = { title: "Documentos internos" };

export default async function MemberDocumentsPage() {
  const supabase = await createClient();
  if (!supabase) return <Unavailable />;

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
      <AppPageHeader title="Documentos" crumbs={[{ label: "Painel", href: "/membro" }]} />
      <section className="section">
        <div className="container">
          {documents.length ? (
            <div className="document-grid">
              {documents.map((document) => (
                <article className="document-card" key={document.id}>
                  <FileText />
                  <div className="document-card-content"><h2>{document.title}</h2>{document.description && <p>{document.description}</p>}<small>{document.file_name}</small></div>
                  <a className="button button-primary" href={`/api/documents/${document.id}/download`} target="_blank" rel="noreferrer"><Download size={17} /> Abrir PDF</a>
                  <DocumentAccessBadge rules={document.access_rules ?? []} logic={document.access_logic ?? "or"} />
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state"><FileText /><h2>Nenhum documento disponível</h2></div>
          )}
        </div>
      </section>
    </>
  );
}
