"use client";

import { ArrowLeft, BookOpenCheck, CalendarPlus, FileText, ImagePlus, LayoutDashboard, ScrollText, ShieldCheck, TicketPlus, UserCog } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRealtimeTables } from "@/components/RealtimeProvider";
import { AdminDataProvider, type AdminData, type AdminSection, type Invite, type MemberTab } from "@/components/admin/AdminDataContext";
import AssessmentAdmin, { assessmentAdminQueryKey, fetchAssessmentAdminData } from "@/components/admin/AssessmentAdmin";
import AttendanceManager from "@/components/admin/AttendanceManager";
import DocumentManager from "@/components/admin/DocumentManager";
import LogsViewer from "@/components/admin/LogsViewer";
import { useToast } from "@/components/admin/ToastProvider";
import CalendarSection from "@/components/admin/sections/CalendarSection";
import InvitesSection from "@/components/admin/sections/InvitesSection";
import MediaSection from "@/components/admin/sections/MediaSection";
import MembersSection from "@/components/admin/sections/MembersSection";
import OverviewSection from "@/components/admin/sections/OverviewSection";
import CountBadge from "@/components/ui/CountBadge";
import { createClient } from "@/lib/supabase/client";
import type { Activity, AdminRole, MemberProfile, Post } from "@/lib/types";

type DashboardSnapshot = { posts: Post[]; activities: Activity[]; members: MemberProfile[]; memberRoles: Record<string, AdminRole[]>; invites: Invite[] };

/**
 * Casca do painel: permissões, navegação por URL, carga e tempo real dos dados
 * compartilhados. O conteúdo de cada aba mora em components/admin/sections.
 */
export default function AdminDashboard({ roles, canManageAssessments = false, canViewLogs = false, currentUserId = "" }: { roles: AdminRole[]; canManageAssessments?: boolean; canViewLogs?: boolean; currentUserId?: string }) {
  const supabase = useMemo(() => createClient(), []);
  const toast = useToast();
  const principal = roles.includes("principal");
  const canMedia = principal || roles.includes("midias");
  const canCalendar = principal || roles.includes("atividades");
  const canMembers = principal || roles.includes("membros");
  const allowed: AdminSection[] = [
    "resumo",
    ...(canMedia ? ["midias" as const] : []),
    ...(canCalendar ? ["calendario" as const, "presencas" as const] : []),
    ...(canMembers ? ["membros" as const, "convites" as const] : []),
    ...(canMembers ? ["documentos" as const] : []),
    ...(canManageAssessments ? ["simulados" as const] : []),
    ...(canViewLogs ? ["logs" as const] : []),
  ];

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedSection = searchParams.get("secao");
  const section: AdminSection = (allowed as string[]).includes(requestedSection ?? "") ? (requestedSection as AdminSection) : "resumo";
  // As abas só mudam a URL: pushState atualiza useSearchParams sem pedir a página
  // de novo ao servidor (router.push repetia getUser e as consultas de permissão).
  const navigate = useCallback((url: string) => { window.history.pushState(null, "", url); }, []);
  const setSection = useCallback((next: AdminSection) => navigate(next === "resumo" ? pathname : `${pathname}?secao=${next}`), [navigate, pathname]);
  const setMemberTab = useCallback((next: MemberTab) => navigate(`${pathname}?secao=membros&aba=${next}`), [navigate, pathname]);
  const goToQueue = useCallback(() => setMemberTab("pendentes"), [setMemberTab]);

  // Os dados ficam em useState, mas o resultado da busca também vai para o cache da query.
  // Ao voltar para o painel (seta do navegador) o componente monta de novo com o estado
  // vazio; como o cache ainda é "fresco", a busca não roda, e sem isto a tela ficava vazia.
  const queryClient = useQueryClient();
  const dashboardKey = useMemo(() => ["admin-dashboard", roles] as const, [roles]);
  const cached = queryClient.getQueryData<DashboardSnapshot>(dashboardKey);
  const [posts, setPosts] = useState<Post[]>(() => cached?.posts ?? []);
  const [activities, setActivities] = useState<Activity[]>(() => cached?.activities ?? []);
  const [members, setMembers] = useState<MemberProfile[]>(() => cached?.members ?? []);
  const [memberRoles, setMemberRoles] = useState<Record<string, AdminRole[]>>(() => cached?.memberRoles ?? {});
  const [invites, setInvites] = useState<Invite[]>(() => cached?.invites ?? []);

  const load = useCallback(async (): Promise<DashboardSnapshot> => {
    const snapshot: DashboardSnapshot = { posts: [], activities: [], members: [], memberRoles: {}, invites: [] };
    if (!supabase) return snapshot;
    const jobs: Array<PromiseLike<unknown>> = [];
    if (canMedia) jobs.push(supabase.from("posts").select("*").order("created_at", { ascending: false }).then(({ data }) => { snapshot.posts = (data || []) as Post[]; setPosts(snapshot.posts); }));
    if (canCalendar) jobs.push(supabase.from("activities").select("*").order("starts_at").then(({ data }) => { snapshot.activities = (data || []) as Activity[]; setActivities(snapshot.activities); }));
    if (canMembers) {
      jobs.push(supabase.from("profiles").select("*").order("created_at", { ascending: false }).then(({ data }) => { snapshot.members = (data || []) as MemberProfile[]; setMembers(snapshot.members); }));
      jobs.push(supabase.from("invites").select("*").order("created_at", { ascending: false }).then(({ data }) => { snapshot.invites = (data || []) as Invite[]; setInvites(snapshot.invites); }));
    }
    if (principal) {
      jobs.push(supabase.from("user_admin_roles").select("user_id, role").then(({ data }) => {
        const grouped: Record<string, AdminRole[]> = {};
        data?.forEach((item) => {
          const role = item.role as AdminRole;
          grouped[item.user_id] = [...(grouped[item.user_id] || []), role];
        });
        snapshot.memberRoles = grouped;
        setMemberRoles(grouped);
      }));
    }
    await Promise.all(jobs);
    return snapshot;
  }, [supabase, canMedia, canCalendar, canMembers, principal]);

  const dashboardQuery = useQuery({ queryKey: dashboardKey, queryFn: load, enabled: Boolean(supabase) });

  // Selos das abas: só contam o que exige ação e somem quando a ação é feita.
  // Membros: cadastro pendente, dados a conferir ou (ADM Principal) graduação a revisar.
  const membersNeedingAction = useMemo(() => members.filter((member) =>
    member.status === "pendente" || (Boolean(member.access_request_id) && member.id !== currentUserId) || (principal && member.graduation_review_needed),
  ).length, [members, principal, currentUserId]);

  // Mesma chave de cache da aba Avaliações: corrigir uma resposta lá atualiza o selo aqui.
  // O tempo real (abaixo) atualiza na hora; o intervalo longo é só uma rede de segurança.
  const assessmentBadgeQuery = useQuery({
    queryKey: assessmentAdminQueryKey,
    queryFn: fetchAssessmentAdminData,
    enabled: canManageAssessments,
    refetchInterval: 5 * 60_000,
  });
  const pendingReviews = assessmentBadgeQuery.data?.reviews.length ?? 0;

  // Tempo real: outra pessoa (ou outra aba) mudou algo que esta tela mostra.
  const refetchDashboard = dashboardQuery.refetch;
  const refetchAssessmentBadge = assessmentBadgeQuery.refetch;
  useRealtimeTables(["profiles", "user_admin_roles", "invites", "posts", "activities"], () => { void refetchDashboard(); });
  useRealtimeTables(["assessment_assignments", "assessment_answers"], () => { if (canManageAssessments) void refetchAssessmentBadge(); });

  const dashboardFailed = dashboardQuery.isError;
  useEffect(() => {
    if (dashboardFailed) toast.error("Não foi possível atualizar os dados.", { label: "Tentar novamente", onClick: () => void refetchDashboard() });
  }, [dashboardFailed, toast, refetchDashboard]);

  // As abas com formulário continuam montadas (só escondidas) depois da primeira visita:
  // trocar de aba no meio de uma publicação não descarta o que foi digitado.
  const [visited, setVisited] = useState<ReadonlySet<AdminSection>>(() => new Set([section]));
  if (!visited.has(section)) setVisited(new Set(visited).add(section));
  const keep = (name: AdminSection, content: ReactNode) => visited.has(name) ? <div hidden={section !== name}>{content}</div> : null;

  const data: AdminData = {
    supabase, currentUserId, principal, canMedia, canCalendar, canMembers, canManageAssessments, canViewLogs,
    posts, activities, members, memberRoles, invites, setInvites,
    loading: dashboardQuery.isPending, refetch: refetchDashboard,
    membersNeedingAction, pendingReviews,
    section, setSection, setMemberTab, goToQueue,
  };

  return (
    <AdminDataProvider value={data}>
      <section className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-head">
            <h1>Administração</h1>
          </div>
          <nav aria-label="Seções do painel">
            <div className="admin-nav-group">
              <span className="admin-nav-label">Visão geral</span>
              <AdminNav icon={<LayoutDashboard />} label="Resumo" active={section === "resumo"} onClick={() => setSection("resumo")} />
            </div>
            <div className="admin-nav-group">
              <span className="admin-nav-label">Conteúdo</span>
              {canMedia && <AdminNav icon={<ImagePlus />} label="Mídias" active={section === "midias"} onClick={() => setSection("midias")} />}
              {canCalendar && <AdminNav icon={<CalendarPlus />} label="Calendário" active={section === "calendario"} onClick={() => setSection("calendario")} />}
              {canMembers && <AdminNav icon={<FileText />} label="Documentos" active={section === "documentos"} onClick={() => setSection("documentos")} />}
            </div>
            {(canMembers || canCalendar) && <div className="admin-nav-group">
              <span className="admin-nav-label">Pessoas</span>
              {canMembers && <AdminNav icon={<UserCog />} label="Membros" active={section === "membros"} onClick={() => setSection("membros")} badge={membersNeedingAction} badgeLabel="membros aguardando ação" />}
              {canMembers && <AdminNav icon={<TicketPlus />} label="Convites" active={section === "convites"} onClick={() => setSection("convites")} />}
              {canCalendar && <AdminNav icon={<ShieldCheck />} label="Presenças" active={section === "presencas"} onClick={() => setSection("presencas")} />}
            </div>}
            {(canManageAssessments || canViewLogs) && <div className="admin-nav-group">
              <span className="admin-nav-label">Gestão</span>
              {canManageAssessments && <AdminNav icon={<BookOpenCheck />} label="Avaliações" active={section === "simulados"} onClick={() => setSection("simulados")} badge={pendingReviews} badgeLabel="respostas a corrigir" />}
              {canViewLogs && <AdminNav icon={<ScrollText />} label="Logs" active={section === "logs"} onClick={() => setSection("logs")} />}
            </div>}
          </nav>
          <Link className="admin-sidebar-back" href="/membro" title="Voltar ao painel do membro" aria-label="Voltar ao painel do membro"><ArrowLeft /><span>Painel do membro</span></Link>
        </aside>

        <div className="admin-content">
          {dashboardQuery.isFetching && !dashboardQuery.isError && <div className="admin-sync" role="status"><span className="inline-spinner" aria-hidden="true" /> {dashboardQuery.isPending ? "Carregando…" : "Atualizando…"}</div>}

          {section === "presencas" && canCalendar && <AttendanceManager />}
          {section === "resumo" && <OverviewSection />}
          {canMedia && keep("midias", <MediaSection active={section === "midias"} />)}
          {canCalendar && keep("calendario", <CalendarSection />)}
          {canMembers && keep("membros", <MembersSection />)}
          {canMembers && keep("convites", <InvitesSection />)}
          {section === "documentos" && canMembers && <DocumentManager />}
          {section === "simulados" && canManageAssessments && <AssessmentAdmin />}
          {section === "logs" && canViewLogs && <LogsViewer />}
        </div>
      </section>
    </AdminDataProvider>
  );
}

function AdminNav({ icon, label, active, onClick, badge = 0, badgeLabel = "pendências" }: { icon: ReactNode; label: string; active: boolean; onClick: () => void; badge?: number; badgeLabel?: string }) {
  return <button type="button" className={active ? "active" : ""} aria-current={active ? "page" : undefined} onClick={onClick}>{icon}<span>{label}</span><CountBadge count={badge} label={badgeLabel} /></button>;
}
