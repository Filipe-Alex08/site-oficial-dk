import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, LogOut, Settings, Shield, Swords, UserRound } from "lucide-react";
import PageHero from "@/components/PageHero";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Painel do Membro" };

export default async function MemberPage() {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <>
        <PageHero eyebrow="Configuração necessária" title="Área do Membro" description="Conecte o projeto ao Supabase para habilitar autenticação e dados internos." />
        <section className="section"><div className="container info-band"><strong>Consulte o arquivo docs/SETUP.md</strong><p>O guia explica como criar o banco e configurar as variáveis do projeto.</p></div></section>
      </>
    );
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/area-do-membro/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile || profile.status !== "aprovado") redirect("/area-do-membro/login");

  const { data: adminRoles } = await supabase.from("user_admin_roles").select("role").eq("user_id", user.id);
  const isAdmin = Boolean(adminRoles?.length);

  return (
    <>
      <section className="member-heading">
        <div className="container member-heading-inner">
          <div><p className="eyebrow">Área interna</p><h1>Salve, {profile.nickname}!</h1><p>Seu perfil e os acessos internos do DK estão reunidos aqui.</p></div>
          <form action="/auth/signout" method="post"><button className="button button-ghost" type="submit"><LogOut size={18} /> Sair</button></form>
        </div>
      </section>
      <section className="section">
        <div className="container member-grid">
          <article className="profile-card">
            <div className="profile-avatar"><UserRound /></div>
            <h2>{profile.full_name}</h2>
            <p>@{profile.nickname}</p>
            <span className="badge aprovado">Membro aprovado</span>
            <dl>
              <div><dt>Patente</dt><dd>{profile.rank || "Não informada"}</dd></div>
              <div><dt>Ordem</dt><dd>{profile.graduation_order || "Não informada"}</dd></div>
              <div><dt>Casa</dt><dd>{profile.house || "Não informada"}</dd></div>
              <div><dt>Camisa</dt><dd>{profile.shirt_number ?? "—"}</dd></div>
              <div><dt>Build principal</dt><dd>{profile.primary_build || "Não informada"}</dd></div>
              <div><dt>Build secundária</dt><dd>{profile.secondary_build || "Não informada"}</dd></div>
              <div><dt>Signo</dt><dd>{profile.zodiac_sign || "—"}</dd></div>
            </dl>
          </article>
          <div className="member-options">
            <article className="card"><span className="card-icon"><CalendarDays /></span><h3>Calendário interno</h3><p>Acompanhe compromissos e informações destinadas aos membros.</p></article>
            <article className="card"><span className="card-icon"><Swords /></span><h3>Conteúdos do DK</h3><p>Espaço preparado para manuais, documentos e registros internos.</p></article>
            <article className="card"><span className="card-icon"><Shield /></span><h3>Graduação</h3><p>Consulte posteriormente sua evolução e registros.</p></article>
            {isAdmin && <Link className="card admin-access" href="/admin"><span className="card-icon"><Settings /></span><h3>Painel administrativo</h3><p>Gerencie as áreas permitidas para seu perfil.</p></Link>}
          </div>
        </div>
      </section>
    </>
  );
}
