"use client";

import { CalendarPlus, CheckCircle2, ChevronRight, ImagePlus, ShieldCheck, UserCog, Users } from "lucide-react";
import type { ReactNode } from "react";
import { useAdminData } from "@/components/admin/AdminDataContext";
import AdminTitle from "@/components/admin/AdminTitle";

export default function OverviewSection() {
  const { canMedia, canCalendar, canMembers, canManageAssessments, principal, posts, activities, members, membersNeedingAction, pendingReviews, setSection, setMemberTab, goToQueue } = useAdminData();

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

  return <div>
    <AdminTitle eyebrow="Visão geral" title="Resumo" description="O que está acontecendo no site e o que precisa da sua atenção." />
    <div className="metric-grid">
      {canMedia && <Metric icon={<ImagePlus />} label="Publicações" value={posts.length} onClick={() => setSection("midias")} />}
      {canCalendar && <Metric icon={<CalendarPlus />} label="Atividades" value={activities.length} onClick={() => setSection("calendario")} />}
      {canMembers && <Metric icon={<Users />} label="Membros" value={members.length} onClick={() => setMemberTab("todos")} />}
      {canMembers && <Metric icon={<UserCog />} label="Aguardando aprovação" value={members.filter((member) => member.status === "pendente").length} highlight onClick={goToQueue} />}
      {canMembers && principal && <Metric icon={<ShieldCheck />} label="Graduação a revisar" value={members.filter((member) => member.graduation_review_needed).length} highlight onClick={goToQueue} />}
    </div>
    {(canMembers || canManageAssessments) && <section className="admin-panel attention-panel" aria-labelledby="attention-title">
      <div className="admin-panel-head"><div><h3 id="attention-title">Precisa da sua atenção</h3><p>Pendências que dependem de um administrador.</p></div></div>
      {attention.length
        ? <ul className="attention-list">{attention.map((item) => <li key={item.key}><button type="button" onClick={item.onClick}><span><strong>{item.title}</strong><small>{item.hint}</small></span><ChevronRight aria-hidden="true" /></button></li>)}</ul>
        : <p className="attention-empty"><CheckCircle2 aria-hidden="true" /> Tudo em dia. Nenhuma pendência no momento.</p>}
    </section>}
  </div>;
}

function Metric({ icon, label, value, onClick, highlight = false }: { icon: ReactNode; label: string; value: number; onClick: () => void; highlight?: boolean }) {
  return <button type="button" className={"metric-card" + (highlight && value > 0 ? " is-highlight" : "")} onClick={onClick}><span className="metric-icon" aria-hidden="true">{icon}</span><span className="metric-text"><strong>{value}</strong><span>{label}</span></span></button>;
}
