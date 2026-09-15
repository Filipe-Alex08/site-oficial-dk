import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, FileText, LogOut, Settings, Shield, UserRound } from "lucide-react";
import PageHero from "@/components/PageHero";
import { graduationLabels, memberKindLabels, rankLabels } from "@/lib/member-access";
import type { MemberProfile } from "@/lib/types";
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

  const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const profile = profileData as MemberProfile | null;
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
            <div className="profile-badges">
              <span className="badge aprovado">{memberKindLabels[profile.member_kind]}</span>
              <span className="badge graduation">{graduationLabels[profile.graduation_level]}</span>
            </div>
            <dl>
              <div><dt>Patente</dt><dd>{rankLabels[profile.rank]}</dd></div>
              <div><dt>Graduação</dt><dd>{graduationLabels[profile.graduation_level]}</dd></div>
              <div><dt>Ordem</dt><dd>{profile.graduation_order || "Não informada"}</dd></div>
              <div><dt>Casa</dt><dd>{profile.house || "Não informada"}</dd></div>
              <div><dt>Camisa</dt><dd>{profile.shirt_number ?? "—"}</dd></div>
              <div><dt>Build principal</dt><dd>{profile.primary_build || "Não informada"}</dd></div>
              <div><dt>Build secundária</dt><dd>{profile.secondary_build || "Não informada"}</dd></div>
              <div><dt>Signo</dt><dd>{profile.zodiac_sign || "—"}</dd></div>
            </dl>
          </article>
          <div className="member-options">
            <Link className="card" href="/membro/atividades"><span className="card-icon"><CalendarDays /></span><h3>Atividades e presença</h3><p>Confirme sua participação, consulte a lista e compartilhe pelo WhatsApp.</p></Link>
            <Link className="card" href="/membro/documentos"><span className="card-icon"><FileText /></span><h3>Documentos internos</h3><p>Acesse somente os documentos liberados para seu perfil e sua patente.</p></Link>
            <Link className="card" href="/membro/documentos"><span className="card-icon"><Shield /></span><h3>Conteúdos de graduação</h3><p>Consulte os materiais disponíveis para seu nível de Bronze, Prata ou Ouro.</p></Link>
            {isAdmin && <Link className="card admin-access" href="/admin"><span className="card-icon"><Settings /></span><h3>Painel administrativo</h3><p>Gerencie as áreas permitidas para seu perfil.</p></Link>}
          </div>
        </div>
      </section>
    </>
  );
}
