"use client";

import { CalendarPlus, CheckCircle2, ChevronRight, ImagePlus, Plus, ShieldCheck, TicketPlus, UserCog, Users } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { useAdminData } from "@/components/admin/AdminDataContext";
import AdminTitle from "@/components/admin/AdminTitle";
import Avatar from "@/components/admin/ui/Avatar";
import Panel from "@/components/admin/ui/Panel";
import StatusBadge from "@/components/admin/ui/StatusBadge";

const TIME_ZONE = "America/Sao_Paulo";
const DAY = 24 * 60 * 60 * 1000;

export default function OverviewSection() {
  const { canMedia, canCalendar, canMembers, canManageAssessments, principal, posts, activities, members, invites, membersNeedingAction, pendingReviews, setSection, setMemberTab, goToQueue } = useAdminData();
  // O "agora" é fixado na abertura da tela; os dados em si se atualizam em tempo real.
  const [now] = useState(() => Date.now());

  const upcoming = useMemo(() => activities
    .filter((activity) => activity.status !== "cancelado" && new Date(activity.starts_at).getTime() >= now && new Date(activity.starts_at).getTime() <= now + 7 * DAY)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
    .slice(0, 5), [activities, now]);

  const inviteStats = useMemo(() => {
    const open = invites.filter((invite) => invite.active && new Date(invite.expires_at).getTime() > now && invite.current_uses < invite.max_uses);
    return { open: open.length, expiring: open.filter((invite) => new Date(invite.expires_at).getTime() - now < 3 * DAY).length };
  }, [invites, now]);

  // A carga já vem ordenada do mais novo para o mais antigo.
  const recent = useMemo(() => members.slice(0, 5), [members]);

  const attention: Array<{ key: string; title: string; hint: string; onClick: () => void }> = [];
  if (canMembers && membersNeedingAction > 0) {
    attention.push({
      key: "membros",
      title: `${membersNeedingAction} ${membersNeedingAction === 1 ? "membro aguardando ação" : "membros aguardando ação"}`,
      hint: "Cadastros novos, dados a conferir e graduações a revisar.",
      onClick: goToQueue,
    });
  }
  if (canManageAssessments && pendingReviews > 0) {
    attention.push({
      key: "avaliacoes",
      title: `${pendingReviews} ${pendingReviews === 1 ? "resposta a corrigir" : "respostas a corrigir"}`,
      hint: "Respostas abertas das avaliações esperando classificação.",
      onClick: () => setSection("simulados"),
    });
  }

  return <div className="overview">
    <AdminTitle
      eyebrow="Visão geral"
      title="Resumo"
      description="O que está acontecendo no site e o que precisa da sua atenção."
      action={<>
        {canMedia && <button className="button button-ghost button-small" type="button" onClick={() => setSection("midias")}><Plus size={16} /> Publicação</button>}
        {canCalendar && <button className="button button-ghost button-small" type="button" onClick={() => setSection("calendario")}><Plus size={16} /> Atividade</button>}
        {canMembers && <button className="button button-ghost button-small" type="button" onClick={() => setSection("convites")}><TicketPlus size={16} /> Convite</button>}
      </>}
    />

    <div className="kpi-strip">
      {canMedia && <Kpi icon={<ImagePlus />} label="Publicações" value={posts.length} onClick={() => setSection("midias")} />}
      {canCalendar && <Kpi icon={<CalendarPlus />} label="Atividades" value={activities.length} onClick={() => setSection("calendario")} />}
      {canMembers && <Kpi icon={<Users />} label="Membros" value={members.length} onClick={() => setMemberTab("todos")} />}
      {canMembers && <Kpi icon={<UserCog />} label="Aguardando aprovação" value={members.filter((member) => member.status === "pendente").length} highlight onClick={goToQueue} />}
      {canMembers && principal && <Kpi icon={<ShieldCheck />} label="Graduação a revisar" value={members.filter((member) => member.graduation_review_needed).length} highlight onClick={goToQueue} />}
    </div>

    <div className="overview-grid">
      <div className="overview-main">
        {(canMembers || canManageAssessments) && <Panel title="Precisa da sua atenção" description="Pendências que dependem de um administrador." flush id="attention">
          {attention.length
            ? <ul className="attention-list">{attention.map((item) => <li key={item.key}><button type="button" onClick={item.onClick}><span><strong>{item.title}</strong><small>{item.hint}</small></span><ChevronRight aria-hidden="true" /></button></li>)}</ul>
            : <p className="attention-empty"><CheckCircle2 aria-hidden="true" /> Tudo em dia. Nenhuma pendência no momento.</p>}
        </Panel>}

        {canCalendar && <Panel title="Próximos 7 dias" description="Atividades marcadas para esta semana." flush actions={<button className="text-button" type="button" onClick={() => setSection("calendario")}>Abrir calendário</button>}>
          {upcoming.length
            ? <ul className="upcoming-list">{upcoming.map((activity) => {
              const start = new Date(activity.starts_at);
              return <li key={activity.id}><button type="button" onClick={() => setSection("calendario")}>
                <span className="date-chip" aria-hidden="true"><strong>{start.toLocaleDateString("pt-BR", { day: "2-digit", timeZone: TIME_ZONE })}</strong><small>{start.toLocaleDateString("pt-BR", { month: "short", timeZone: TIME_ZONE }).replace(".", "")}</small></span>
                <span className="upcoming-text">
                  <strong>{activity.title}</strong>
                  <small>{start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TIME_ZONE })} · {activity.location} · lista {activity.attendance_open ? "aberta" : "fechada"}</small>
                </span>
                <StatusBadge status={activity.status} />
              </button></li>;
            })}</ul>
            : <p className="attention-empty">Nenhuma atividade marcada para os próximos 7 dias.</p>}
        </Panel>}
      </div>

      {canMembers && <div className="overview-side">
        <Panel title="Convites" flush actions={<button className="text-button" type="button" onClick={() => setSection("convites")}>Gerenciar</button>}>
          <dl className="stat-list">
            <div><dt>Disponíveis</dt><dd>{inviteStats.open}</dd></div>
            <div><dt>Vencem em até 3 dias</dt><dd className={inviteStats.expiring ? "is-warn" : ""}>{inviteStats.expiring}</dd></div>
          </dl>
        </Panel>

        <Panel title="Cadastros recentes" flush actions={<button className="text-button" type="button" onClick={() => setMemberTab("todos")}>Ver todos</button>}>
          {recent.length
            ? <ul className="recent-list">{recent.map((member) => <li key={member.id}>
              <Avatar name={member.nickname} path={member.avatar_path} />
              <span className="recent-text"><strong>{member.nickname}</strong><small>{member.full_name}</small></span>
              <StatusBadge status={member.status} />
            </li>)}</ul>
            : <p className="attention-empty">Nenhum cadastro ainda.</p>}
        </Panel>
      </div>}
    </div>
  </div>;
}

function Kpi({ icon, label, value, onClick, highlight = false }: { icon: ReactNode; label: string; value: number; onClick: () => void; highlight?: boolean }) {
  return <button type="button" className={"kpi" + (highlight && value > 0 ? " is-highlight" : "")} onClick={onClick}>
    <span className="kpi-label"><span aria-hidden="true">{icon}</span>{label}</span>
    <strong>{value}</strong>
  </button>;
}
