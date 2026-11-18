"use client";

import { ArrowLeft, BookOpenCheck, CalendarPlus, ChevronRight, FileText, ImagePlus, LayoutDashboard, PanelLeftClose, PanelLeftOpen, ScrollText, Search, ShieldCheck, TicketPlus, UserCog } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRealtimeTables } from "@/components/RealtimeProvider";
import { AdminDataProvider, type AdminData, type AdminNavItem, type AdminSection, type Invite, type MemberTab } from "@/components/admin/AdminDataContext";
import AdminBottomBar from "@/components/admin/AdminBottomBar";
import AssessmentAdmin, { assessmentAdminQueryKey, fetchAssessmentAdminData } from "@/components/admin/AssessmentAdmin";
import AttendanceManager from "@/components/admin/AttendanceManager";
import CommandPalette from "@/components/admin/CommandPalette";
import DocumentManager from "@/components/admin/DocumentManager";
import LogsViewer from "@/components/admin/LogsViewer";
import { useToast } from "@/components/admin/ToastProvider";
import { useStoredFlag } from "@/components/admin/useStoredFlag";
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

  // Modelo único de navegação: barra lateral, barra inferior e paleta de comandos leem a mesma lista.
  const nav: AdminNavItem[] = [
    { id: "resumo", label: "Resumo", icon: <LayoutDashboard />, group: "Visão geral" },
    ...(canMedia ? [{ id: "midias" as const, label: "Mídias", icon: <ImagePlus />, group: "Conteúdo" }] : []),
    ...(canCalendar ? [{ id: "calendario" as const, label: "Calendário", icon: <CalendarPlus />, group: "Conteúdo" }] : []),
    ...(canMembers ? [{ id: "documentos" as const, label: "Documentos", icon: <FileText />, group: "Conteúdo" }] : []),
    ...(canMembers ? [{ id: "membros" as const, label: "Membros", icon: <UserCog />, group: "Pessoas", badge: membersNeedingAction, badgeLabel: "membros aguardando ação" }] : []),
    ...(canMembers ? [{ id: "convites" as const, label: "Convites", icon: <TicketPlus />, group: "Pessoas" }] : []),
    ...(canCalendar ? [{ id: "presencas" as const, label: "Presenças", icon: <ShieldCheck />, group: "Pessoas" }] : []),
    ...(canManageAssessments ? [{ id: "simulados" as const, label: "Avaliações", icon: <BookOpenCheck />, group: "Gestão", badge: pendingReviews, badgeLabel: "respostas a corrigir" }] : []),
    ...(canViewLogs ? [{ id: "logs" as const, label: "Logs", icon: <ScrollText />, group: "Gestão" }] : []),
  ];
  const navGroups = nav.reduce<Array<{ label: string; items: AdminNavItem[] }>>((all, item) => {
    const group = all.find((entry) => entry.label === item.group);
    if (group) group.items.push(item); else all.push({ label: item.group, items: [item] });
    return all;
  }, []);
  const currentLabel = nav.find((item) => item.id === section)?.label ?? "Resumo";

  const [collapsed, setCollapsed] = useStoredFlag("dk-admin-sidebar-collapsed");
  const [paletteOpen, setPaletteOpen] = useState(false);
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Ao trocar de seção o foco vai para o título dela: leitores de tela anunciam a mudança e o teclado continua dali.
  const previousSection = useRef(section);
  useEffect(() => {
    if (previousSection.current === section) return;
    previousSection.current = section;
    const heading = Array.from(document.querySelectorAll<HTMLElement>(".admin-content h2")).find((element) => element.offsetParent !== null);
    heading?.setAttribute("tabindex", "-1");
    heading?.focus({ preventScroll: true });
  }, [section]);

  const data: AdminData = {
    supabase, currentUserId, principal, canMedia, canCalendar, canMembers, canManageAssessments, canViewLogs,
    posts, activities, members, memberRoles, invites, setInvites,
    loading: dashboardQuery.isPending, refetch: refetchDashboard,
    membersNeedingAction, pendingReviews,
    section, setSection, setMemberTab, goToQueue,
  };

  return (
    <AdminDataProvider value={data}>
      <section className="admin-shell" data-collapsed={collapsed ? "true" : "false"}>
        <aside className="admin-sidebar">
          <div className="admin-sidebar-head">
            <Image className="admin-brand-mark" src="/images/dk-emblem.webp" alt="" width={34} height={34} />
            <div className="admin-brand-text"><strong>DK</strong><span>Comando</span></div>
            <button className="admin-collapse" type="button" onClick={() => setCollapsed(!collapsed)} aria-pressed={collapsed} aria-label={collapsed ? "Expandir barra lateral" : "Recolher barra lateral"} title={collapsed ? "Expandir" : "Recolher"}>
              {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            </button>
          </div>
          <nav aria-label="Seções do painel">
            {navGroups.map((group) => <div className="admin-nav-group" key={group.label}>
              <span className="admin-nav-label">{group.label}</span>
              {group.items.map((item) => <AdminNav key={item.id} item={item} active={section === item.id} onClick={() => setSection(item.id)} />)}
            </div>)}
          </nav>
          <Link className="admin-sidebar-back" href="/membro" title="Voltar ao painel do membro" aria-label="Voltar ao painel do membro"><ArrowLeft /><span>Painel do membro</span></Link>
        </aside>

        <div className="admin-content">
          <div className="admin-topbar">
            <nav className="admin-crumbs" aria-label="Você está em">
              <span>Administração</span><ChevronRight aria-hidden="true" /><span aria-current="page">{currentLabel}</span>
            </nav>
            <span className="admin-live" role="status">
              {dashboardQuery.isFetching && !dashboardQuery.isError
                ? <><span className="inline-spinner" aria-hidden="true" /> {dashboardQuery.isPending ? "Carregando…" : "Atualizando…"}</>
                : <><span className={`admin-live-dot${dashboardQuery.isError ? " is-off" : ""}`} aria-hidden="true" /> {dashboardQuery.isError ? "Sem conexão" : "Ao vivo"}</>}
            </span>
            <button className="admin-palette-trigger" type="button" onClick={() => setPaletteOpen(true)} aria-label="Buscar ou ir para (Ctrl+K)">
              <Search aria-hidden="true" /><span>Buscar…</span><kbd>Ctrl K</kbd>
            </button>
          </div>

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

        <AdminBottomBar nav={nav} section={section} onSelect={setSection} />
        {paletteOpen && <CommandPalette
          nav={nav}
          members={canMembers ? members : []}
          onClose={() => setPaletteOpen(false)}
          onGoToSection={(item) => { setPaletteOpen(false); setSection(item.id); }}
          onGoToMember={(member) => { setPaletteOpen(false); navigate(`${pathname}?secao=membros&aba=todos&busca=${encodeURIComponent(member.nickname)}`); }}
        />}
      </section>
    </AdminDataProvider>
  );
}

function AdminNav({ item, active, onClick }: { item: AdminNavItem; active: boolean; onClick: () => void }) {
  return <button type="button" className={active ? "active" : ""} aria-current={active ? "page" : undefined} title={item.label} onClick={onClick}>{item.icon}<span>{item.label}</span><CountBadge count={item.badge ?? 0} label={item.badgeLabel ?? "pendências"} /></button>;
}
