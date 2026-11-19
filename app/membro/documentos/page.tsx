import type { Metadata } from "next";
import { ExternalLink, FileText } from "lucide-react";
import { redirect } from "next/navigation";
import Panel from "@/components/admin/ui/Panel";
import AppPageHeader from "@/components/member/AppPageHeader";
import DocumentAccessBadge from "@/components/member/DocumentAccessBadge";
import Unavailable from "@/components/member/Unavailable";
import { getAuth, getMember } from "@/lib/viewer";
import type { InternalDocument } from "@/lib/types";

export const metadata: Metadata = { title: "Documentos internos" };

export default async function MemberDocumentsPage() {
  const { supabase, user } = await getAuth();
  if (!supabase) return <Unavailable />;
  if (!user) redirect("/area-do-membro/login");

  const [{ profile }, { data: documentData }] = await Promise.all([
    getMember(),
    supabase.from("documents").select("*").eq("active", true).order("created_at", { ascending: false }),
  ]);
  if (!profile || profile.status !== "aprovado") redirect("/area-do-membro/login");
  const documents = (documentData ?? []) as InternalDocument[];

  return (
    <>
      <AppPageHeader title="Documentos" crumbs={[{ label: "Início", href: "/membro" }]} />
      <section className="section">
        <div className="container">
          {documents.length ? (
            <Panel title="Documentos" description={`${documents.length} ${documents.length === 1 ? "documento liberado" : "documentos liberados"} para o seu perfil`} flush>
              <ul className="m-docs">
                {documents.map((document) => (
                  <li key={document.id}>
                    <span className="m-doc-icon" aria-hidden="true"><FileText /></span>
                    <div className="m-doc-text">
                      <h2>{document.title}</h2>
                      {document.description && <p>{document.description}</p>}
                      <small>{document.file_name}</small>
                      <DocumentAccessBadge rules={document.access_rules ?? []} logic={document.access_logic ?? "or"} />
                    </div>
                    <a className="button button-primary" href={`/api/documents/${document.id}/download`} target="_blank" rel="noreferrer" aria-label={`Abrir PDF: ${document.title}`}><ExternalLink aria-hidden="true" /> Abrir</a>
                  </li>
                ))}
              </ul>
            </Panel>
          ) : (
            <div className="empty-state"><FileText /><h2>Nenhum documento disponível</h2></div>
          )}
        </div>
      </section>
    </>
  );
}
