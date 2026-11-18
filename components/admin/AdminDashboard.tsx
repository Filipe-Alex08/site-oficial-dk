"use client";

import { ArrowLeft, BookOpenCheck, CalendarPlus, CheckCircle2, ChevronDown, ChevronRight, Copy, Edit3, FileText, ImagePlus, LayoutDashboard, RefreshCw, ScrollText, Search, ShieldCheck, TicketPlus, Trash2, UserCog, Users, XCircle } from "lucide-react";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import BirthdayBadge from "@/components/member/BirthdayBadge";
import AdminDialog from "@/components/admin/AdminDialog";
import AdminTitle from "@/components/admin/AdminTitle";
import FormSectionHead from "@/components/admin/FormSectionHead";
import InfoTip from "@/components/ui/InfoTip";
import MemberQueue, { type RequestAdjustments } from "@/components/admin/MemberQueue";
import DocumentManager from "@/components/admin/DocumentManager";
import AttendanceManager from "@/components/admin/AttendanceManager";
import AssessmentAdmin, { assessmentAdminQueryKey, fetchAssessmentAdminData } from "@/components/admin/AssessmentAdmin";
import LogsViewer from "@/components/admin/LogsViewer";
import MediaGalleryManager from "@/components/admin/MediaGalleryManager";
import CountBadge from "@/components/ui/CountBadge";
import Select from "@/components/ui/Select";
import { GraduationInsignias, RankInsignia } from "@/components/member/Insignia";
import { adminRoleOptions, graduationLabels, graduationOptions, graduationTracks, highestGraduation, memberKindLabels, memberKindOptions, rankGroups, rankLabels } from "@/lib/member-access";
import { friendlyError } from "@/lib/friendly-error";
import { createClient } from "@/lib/supabase/client";
import type { Activity, ActivityStatus, AdminRole, DkRank, GraduationLevel, MemberKind, MemberProfile, Post } from "@/lib/types";

type Section = "resumo" | "midias" | "calendario" | "presencas" | "membros" | "convites" | "documentos" | "simulados" | "logs";
type Invite = { id: string; code: string; expires_at: string; max_uses: number; current_uses: number; active: boolean };
type MemberAccessForm = {
  id: string;
  full_name: string;
  nickname: string;
  member_kind: MemberKind;
  rank: DkRank;
  graduation_cavalaria: GraduationLevel;
  graduation_arquearia: GraduationLevel;
};

type MemberTab = "pendentes" | "todos";
type MemberStatusFilter = "todos" | MemberProfile["status"];

const memberStatusOptions: Array<{ value: MemberStatusFilter; label: string }> = [
  { value: "todos", label: "Todas as situações" },
  { value: "aprovado", label: "Aprovados" },
  { value: "pendente", label: "Pendentes" },
  { value: "suspenso", label: "Suspensos" },
  { value: "recusado", label: "Recusados" },
];

const statusLabels: Record<string, string> = {
  pendente: "Pendente", aprovado: "Aprovado", suspenso: "Suspenso", recusado: "Recusado",
  confirmado: "Confirmado", a_definir: "A definir", adiado: "Adiado", cancelado: "Cancelado", finalizado: "Finalizado",
};
const statusLabel = (status: string) => statusLabels[status] ?? status;

const emptyPost = { title: "", slug: "", excerpt: "", content: "", category: "Treinos", cover_url: "", youtube_url: "", tiktok_url: "", published: false };
const emptyActivity = { title: "", starts_at: "", ends_at: "", location: "", type: "Treino", status: "confirmado" as ActivityStatus, description: "", attendance_open: true };

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function toDateTimeInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function toDateInput(value: Date) {
  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function defaultInstagramDateRange() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  return { start: toDateInput(start), end: toDateInput(end) };
}

export default function AdminDashboard({ roles, canManageAssessments = false, canViewLogs = false, currentUserId = "" }: { roles: AdminRole[]; canManageAssessments?: boolean; canViewLogs?: boolean; currentUserId?: string }) {
  const supabase = useMemo(() => createClient(), []);
  const principal = roles.includes("principal");
  const canMedia = principal || roles.includes("midias");
  const canCalendar = principal || roles.includes("atividades");
  const canMembers = principal || roles.includes("membros");
  const allowed: Section[] = [
    "resumo",
    ...(canMedia ? ["midias" as const] : []),
    ...(canCalendar ? ["calendario" as const, "presencas" as const] : []),
    ...(canMembers ? ["membros" as const, "convites" as const] : []),
    ...(canMembers ? ["documentos" as const] : []),
    ...(canManageAssessments ? ["simulados" as const] : []),
    ...(canViewLogs ? ["logs" as const] : []),
  ];

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedSection = searchParams.get("secao");
  const section: Section = (allowed as string[]).includes(requestedSection ?? "") ? (requestedSection as Section) : "resumo";
  function setSection(next: Section) {
    router.push(next === "resumo" ? pathname : `${pathname}?secao=${next}`, { scroll: false });
  }
  const [posts, setPosts] = useState<Post[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [memberRoles, setMemberRoles] = useState<Record<string, AdminRole[]>>({});
  const [invites, setInvites] = useState<Invite[]>([]);
  const [postForm, setPostForm] = useState(emptyPost);
  const [activityForm, setActivityForm] = useState(emptyActivity);
  const [memberForm, setMemberForm] = useState<MemberAccessForm | null>(null);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ text: string; kind: "success" | "error" } | null>(null);
  const [syncingInstagram, setSyncingInstagram] = useState(false);
  const [quota, setQuota] = useState<{ used: number; limit: number; start: string | null; end: string | null } | null>(null);
  const [quotaError, setQuotaError] = useState("");
  const [loadingQuota, setLoadingQuota] = useState(false);
  const [instagramDateRange, setInstagramDateRange] = useState(defaultInstagramDateRange);
  const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(new Set());
  const [inviteBusy, setInviteBusy] = useState<string | null>(null);
  const [busyMemberId, setBusyMemberId] = useState<string | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberStatus, setMemberStatus] = useState<MemberStatusFilter>("todos");

  const load = useCallback(async () => {
    if (!supabase) return;
    const jobs: Array<PromiseLike<unknown>> = [];
    if (canMedia) jobs.push(supabase.from("posts").select("*").order("created_at", { ascending: false }).then(({ data }) => setPosts((data || []) as Post[])));
    if (canCalendar) jobs.push(supabase.from("activities").select("*").order("starts_at").then(({ data }) => setActivities((data || []) as Activity[])));
    if (canMembers) {
      jobs.push(supabase.from("profiles").select("*").order("created_at", { ascending: false }).then(({ data }) => setMembers((data || []) as MemberProfile[])));
      jobs.push(supabase.from("invites").select("*").order("created_at", { ascending: false }).then(({ data }) => setInvites((data || []) as Invite[])));
    }
    if (principal) {
      jobs.push(supabase.from("user_admin_roles").select("user_id, role").then(({ data }) => {
        const grouped: Record<string, AdminRole[]> = {};
        data?.forEach((item) => {
          const role = item.role as AdminRole;
          grouped[item.user_id] = [...(grouped[item.user_id] || []), role];
        });
        setMemberRoles(grouped);
      }));
    }
    await Promise.all(jobs);
  }, [supabase, canMedia, canCalendar, canMembers, principal]);

  const dashboardQuery = useQuery({ queryKey: ["admin-dashboard", roles], queryFn: async () => { await load(); return true; }, enabled: Boolean(supabase) });

  // Badges das abas: só contam o que exige ação e some quando a ação é feita.
  // Membros: cadastro pendente, dados a conferir ou (ADM Principal) graduação a revisar.
  const membersNeedingAction = useMemo(() => members.filter((member) =>
    member.status === "pendente" || (Boolean(member.access_request_id) && member.id !== currentUserId) || (principal && member.graduation_review_needed),
  ).length, [members, principal, currentUserId]);
  // Inclui a própria solicitação do admin: aparece só como aviso e não entra no badge.
  const membersQueue = useMemo(() => members.filter((member) =>
    member.status === "pendente" || Boolean(member.access_request_id) || (principal && Boolean(member.graduation_review_needed)),
  ), [members, principal]);
  const filteredMembers = useMemo(() => {
    const term = memberSearch.trim().toLocaleLowerCase("pt-BR");
    return members.filter((member) =>
      (memberStatus === "todos" || member.status === memberStatus)
      && (!term || [member.nickname, member.full_name, member.email ?? ""].some((value) => value.toLocaleLowerCase("pt-BR").includes(term))),
    );
  }, [members, memberSearch, memberStatus]);
  const requestedTab = searchParams.get("aba");
  const memberTab: MemberTab = requestedTab === "pendentes" || requestedTab === "todos"
    ? requestedTab
    : (dashboardQuery.isPending || membersNeedingAction > 0 ? "pendentes" : "todos");
  function setMemberTab(next: MemberTab) {
    router.push(`${pathname}?secao=membros&aba=${next}`, { scroll: false });
  }
  function goToQueue() {
    router.push(`${pathname}?secao=membros&aba=pendentes`, { scroll: false });
  }
  // Mesma chave de cache da aba Avaliações: corrigir uma resposta lá atualiza o badge aqui.
  const assessmentBadgeQuery = useQuery({
    queryKey: assessmentAdminQueryKey,
    queryFn: fetchAssessmentAdminData,
    enabled: canManageAssessments,
    refetchInterval: 60_000,
  });
  const pendingReviews = assessmentBadgeQuery.data?.reviews.length ?? 0;

  // Permissão "Ver logs": só o ADM Principal enxerga e altera, via API (a tabela é só do servidor).
  const logViewersQuery = useQuery({
    queryKey: ["admin-log-viewers"],
    enabled: principal,
    queryFn: async () => {
      const response = await fetch("/api/admin/log-permissions", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível carregar as permissões de logs.");
      return new Set<string>(data.userIds as string[]);
    },
  });

  async function toggleLogViewer(userId: string, granted: boolean) {
    if (!principal) return;
    try {
      const response = await fetch("/api/admin/log-permissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, granted }) });
      const data = await response.json();
      show(response.ok ? "Permissão de logs atualizada." : data.error || "Não foi possível salvar a permissão.");
    } catch {
      show("Não foi possível salvar a permissão: sem conexão.");
    }
    await logViewersQuery.refetch();
  }

  function show(text: string) {
    // Erros costumam começar com negação ou citar falha; o resto é confirmação.
    const kind = /^n[aã]o\b|falha|erro|inv[aá]lid|permiss[aã]o|precisa ser|sem conex/i.test(text) ? "error" : "success";
    setNotice({ text, kind });
    window.setTimeout(() => setNotice(null), 4500);
  }

  async function savePost(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    const payload = { ...postForm, slug: postForm.slug || slugify(postForm.title), cover_url: postForm.cover_url || null, youtube_url: postForm.youtube_url || null, tiktok_url: postForm.tiktok_url || null, published_at: new Date().toISOString() };
    const result = editingPost ? await supabase.from("posts").update(payload).eq("id", editingPost) : await supabase.from("posts").insert(payload);
    if (result.error) return show(friendlyError(result.error));
    setPostForm(emptyPost);
    setEditingPost(null);
    show("Publicação salva.");
    await dashboardQuery.refetch();
  }

  async function removePost(id: string) {
    if (!supabase || !window.confirm("Excluir esta publicação?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    setSelectedPostIds((current) => { const next = new Set(current); next.delete(id); return next; });
    show(error ? friendlyError(error) : "Publicação excluída.");
    await dashboardQuery.refetch();
  }

  function togglePostSelection(id: string) {
    setSelectedPostIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllPostSelection() {
    setSelectedPostIds((current) => current.size === posts.length
      ? new Set()
      : new Set(posts.map((post) => post.id)));
  }

  async function removeSelectedPosts() {
    if (!supabase || !selectedPostIds.size) return;
    const count = selectedPostIds.size;
    if (!window.confirm(`Excluir ${count} publicação(ões) selecionada(s)? Esta ação não pode ser desfeita.`)) return;
    const { error } = await supabase.from("posts").delete().in("id", Array.from(selectedPostIds));
    if (!error) setSelectedPostIds(new Set());
    show(error ? friendlyError(error) : `${count} publicação(ões) excluída(s).`);
    await dashboardQuery.refetch();
  }

  async function syncInstagram() {
    if (!instagramDateRange.start || !instagramDateRange.end || instagramDateRange.start > instagramDateRange.end) {
      return show("Selecione um intervalo de datas válido.");
    }
    setSyncingInstagram(true);
    try {
      const response = await fetch("/api/admin/instagram/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(instagramDateRange),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível sincronizar o Instagram.");
      show(`${result.imported} nova(s), ${result.refreshed || 0} atualizada(s) e ${result.skipped} sem alteração.${result.failed ? ` Falhas: ${result.failed}.` : ""}`);
      await dashboardQuery.refetch();
    } catch (error) {
      show(friendlyError(error, "Não foi possível sincronizar o Instagram."));
    } finally {
      setSyncingInstagram(false);
      void refreshQuota();
    }
  }

  const refreshQuota = useCallback(async () => {
    setLoadingQuota(true);
    setQuotaError("");
    try {
      const response = await fetch("/api/admin/instagram/quota", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Falha ao consultar a cota.");
      setQuota(result);
    } catch (error) {
      setQuotaError(friendlyError(error, "Falha ao consultar a cota."));
    } finally {
      setLoadingQuota(false);
    }
  }, []);

  useEffect(() => {
    if (section !== "midias" || !canMedia) return;
    void refreshQuota();
    const interval = window.setInterval(() => void refreshQuota(), 5 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, [section, canMedia, refreshQuota]);

  async function saveActivity(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    const payload = {
      ...activityForm,
      starts_at: new Date(activityForm.starts_at).toISOString(),
      ends_at: activityForm.ends_at ? new Date(activityForm.ends_at).toISOString() : null,
    };
    const result = editingActivity ? await supabase.from("activities").update(payload).eq("id", editingActivity) : await supabase.from("activities").insert(payload);
    if (result.error) return show(friendlyError(result.error));
    setActivityForm(emptyActivity);
    setEditingActivity(null);
    show("Atividade salva.");
    await dashboardQuery.refetch();
  }

  async function removeActivity(id: string) {
    if (!supabase || !window.confirm("Excluir esta atividade e sua lista de presença?")) return;
    const { error } = await supabase.from("activities").delete().eq("id", id);
    show(error ? friendlyError(error) : "Atividade excluída.");
    await dashboardQuery.refetch();
  }

  async function updateMemberStatus(id: string, status: string, success = "Cadastro atualizado.") {
    setBusyMemberId(id);
    try {
      const response = await fetch(`/api/admin/members/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const result = await response.json();
      show(response.ok ? success : friendlyError(result.error));
    } catch {
      show("Não foi possível atualizar o cadastro: sem conexão.");
    } finally {
      setBusyMemberId(null);
    }
    await dashboardQuery.refetch();
  }

  async function decideRegistration(member: MemberProfile, status: "aprovado" | "recusado") {
    if (status === "recusado" && !window.confirm(`Recusar o cadastro de ${member.nickname}? A pessoa não terá acesso à área do membro.`)) return;
    await updateMemberStatus(member.id, status, status === "aprovado" ? `Cadastro de ${member.nickname} aprovado.` : `Cadastro de ${member.nickname} recusado.`);
  }

  function editMember(member: MemberProfile) {
    if (!canEditAccess(member)) return show("Esta conta só pode ser alterada por outro ADM Principal.");
    setMemberForm({
      id: member.id,
      full_name: member.full_name,
      nickname: member.nickname,
      member_kind: member.member_kind,
      rank: member.rank,
      graduation_cavalaria: member.graduation_cavalaria ?? "sem_graduacao",
      graduation_arquearia: member.graduation_arquearia ?? "sem_graduacao",
    });
  }

  async function reviewAccessRequest(member: MemberProfile, action: "approve" | "reject", adjustments?: RequestAdjustments) {
    if (member.id === currentUserId) return show("Sua própria solicitação precisa ser analisada por outro administrador.");
    if (action === "reject" && !window.confirm(`Recusar a alteração de dados de ${member.nickname}?`)) return;
    setBusyMemberId(member.id);
    try {
      const response = await fetch(`/api/admin/members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_request_action: action, access_request_id: member.access_request_id, ...(adjustments ? { adjustments } : {}) }),
      });
      const result = await response.json();
      const approved = adjustments ? "Dados aprovados com ajustes e acessos atualizados." : "Dados aprovados e acessos atualizados.";
      show(response.ok ? (action === "approve" ? approved : "Solicitação recusada.") : friendlyError(result.error));
    } catch {
      show("Não foi possível analisar a solicitação: sem conexão.");
    } finally {
      setBusyMemberId(null);
    }
    await dashboardQuery.refetch();
  }

  async function saveMemberAccess(event: FormEvent) {
    event.preventDefault();
    if (!memberForm) return;
    const response = await fetch(`/api/admin/members/${memberForm.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(principal ? {
        member_kind: memberForm.member_kind,
        rank: memberForm.rank,
        graduation_cavalaria: memberForm.graduation_cavalaria,
        graduation_arquearia: memberForm.graduation_arquearia,
      } : { member_kind: memberForm.member_kind }),
    });
    const result = await response.json();
    if (!response.ok) return show(friendlyError(result.error));
    show("Acessos internos atualizados.");
    setMemberForm(null);
    await dashboardQuery.refetch();
  }

  async function toggleAdminRole(userId: string, role: AdminRole, enabled: boolean) {
    if (!supabase || !principal) return;
    if (!enabled && userId === currentUserId && role === "principal") return show("Você não pode remover o próprio acesso de ADM Principal.");
    const result = enabled
      ? await supabase.from("user_admin_roles").insert({ user_id: userId, role })
      : await supabase.from("user_admin_roles").delete().eq("user_id", userId).eq("role", role);
    show(result.error ? friendlyError(result.error) : "Permissão administrativa atualizada.");
    await dashboardQuery.refetch();
  }

  // Quem o painel pode alterar. O servidor rejeita o resto; estes auxiliares
  // existem para não oferecer botões que terminariam em erro. A lista de papéis
  // alheios só é visível ao ADM Principal, então para os demais o painel confia
  // na checagem do servidor.
  function isSelfTarget(member: MemberProfile) {
    return member.id === currentUserId;
  }

  function isOtherPrincipal(member: MemberProfile) {
    return !isSelfTarget(member) && (memberRoles[member.id] || []).includes("principal");
  }

  function canEditAccess(member: MemberProfile) {
    return principal || (!isSelfTarget(member) && !isOtherPrincipal(member));
  }

  function canManageMember(member: MemberProfile) {
    return !isSelfTarget(member) && !(memberRoles[member.id] || []).includes("principal");
  }

  async function deleteMember(id: string) {
    if (!window.confirm("Excluir permanentemente este membro e seu acesso?")) return;
    const response = await fetch(`/api/admin/members/${id}`, { method: "DELETE" });
    const result = await response.json();
    show(response.ok ? "Membro excluído." : friendlyError(result.error));
    await dashboardQuery.refetch();
  }

  async function createInvite() {
    if (!supabase || inviteBusy) return;
    setInviteBusy("create");
    try {
      const code = `DK-${crypto.randomUUID().replace(/-/g, "").toUpperCase()}`;
      const expires = new Date();
      expires.setDate(expires.getDate() + 15);
      const { data, error } = await supabase.from("invites").insert({ code, expires_at: expires.toISOString(), max_uses: 1 }).select("*").single();
      if (error) throw error;
      setInvites((current) => [data as Invite, ...current]);
      show("Convite criado.");
    } catch (error) {
      show(friendlyError(error, "Não foi possível criar o convite."));
    } finally {
      setInviteBusy(null);
    }
  }

  async function copyInviteLink(code: string) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/area-do-membro/cadastro?convite=${code}`);
      show("Link do convite copiado.");
    } catch {
      show("Não foi possível copiar o link.");
    }
  }

  async function disableInvite(id: string) {
    if (!supabase || inviteBusy) return;
    setInviteBusy(id);
    try {
      const { data, error } = await supabase.from("invites").update({ active: false }).eq("id", id).select("*").single();
      if (error) throw error;
      setInvites((current) => current.map((invite) => invite.id === id ? data as Invite : invite));
      show("Convite desativado.");
    } catch (error) {
      show(friendlyError(error, "Não foi possível desativar o convite."));
    } finally {
      setInviteBusy(null);
    }
  }

  // Lê os dados salvos, não o formulário: senão o bloco opcional fecharia ao apagar o último campo.
  const editingPostData = editingPost ? posts.find((post) => post.id === editingPost) : undefined;

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

  return (
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
        <div className="toast-stack" aria-live="polite">
          {notice && <div className={`toast is-${notice.kind}`} role={notice.kind === "error" ? "alert" : "status"}>{notice.text}</div>}
          {dashboardQuery.isError && <div className="toast is-error" role="alert">Não foi possível atualizar os dados. <button className="text-button" type="button" onClick={() => void dashboardQuery.refetch()}>Tentar novamente</button></div>}
          {dashboardQuery.isFetching && !dashboardQuery.isError && <div className="toast" role="status"><span className="inline-spinner" /> {dashboardQuery.isPending ? "Carregando…" : "Atualizando…"}</div>}
        </div>

        {section === "presencas" && canCalendar && <AttendanceManager />}

        {section === "resumo" && <div>
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
        </div>}

        {section === "midias" && canMedia && <div>
          <AdminTitle eyebrow="Conteúdo" title="Mídias" description="Publicações do site, importação do Instagram e galerias de fotos e vídeos." />
          <div className="admin-panel-grid">
            <section className="admin-panel" aria-labelledby="apify-quota-title">
              <div className="admin-panel-head">
                <div><h3 id="apify-quota-title">Cota de importação</h3><p>Consumo mensal da importação do Instagram.</p></div>
                <button className="apify-quota-refresh" type="button" onClick={() => void refreshQuota()} disabled={loadingQuota}><RefreshCw size={14} className={loadingQuota ? "spin" : ""} />{loadingQuota ? "Consultando…" : "Atualizar"}</button>
              </div>
              <div className="admin-panel-body">
                {quotaError && <p className="apify-quota-error" role="alert">{quotaError}</p>}
                {quota
                  ? <div className="apify-quota-metric">
                    <div className="apify-quota-values"><div><span>Utilizado neste ciclo</span><strong>US$ {quota.used.toFixed(2)}</strong></div><div><span>Limite mensal</span><strong>{quota.limit > 0 ? `US$ ${quota.limit.toFixed(2)}` : "Indisponível"}</strong></div></div>
                    {quota.limit > 0 && <div className="apify-quota-progress" role="progressbar" aria-label="Cota mensal utilizada" aria-valuenow={Math.min(100, Math.round(quota.used / quota.limit * 100))} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${Math.min(100, Math.max(0, quota.used / quota.limit * 100))}%` }} /></div>}
                    <div className="apify-quota-footer"><span>{quota.limit > 0 ? `${Math.round(quota.used / quota.limit * 100)}% do limite utilizado` : "Limite não informado pela Apify"}</span>{quota.start && quota.end && <span>Ciclo: {new Date(quota.start).toLocaleDateString("pt-BR")} a {new Date(quota.end).toLocaleDateString("pt-BR")}</span>}</div>
                  </div>
                  : !quotaError && <p className="apify-quota-empty">{loadingQuota ? "Consultando a cota…" : "Cota ainda não consultada."}</p>}
              </div>
            </section>
            <section className="admin-panel" aria-labelledby="instagram-sync-title">
              <div className="admin-panel-head"><div className="title-tip"><h3 id="instagram-sync-title">Importar do Instagram</h3><InfoTip label="Mais informações sobre a importação">Traz as publicações do período escolhido.</InfoTip></div></div>
              <div className="admin-panel-body">
                <div className="instagram-import-controls">
                  <div className="field"><label htmlFor="instagram-start-date">De</label><input id="instagram-start-date" type="date" value={instagramDateRange.start} max={instagramDateRange.end} onChange={(event) => setInstagramDateRange({ ...instagramDateRange, start: event.target.value })} /></div>
                  <div className="field"><label htmlFor="instagram-end-date">Até</label><input id="instagram-end-date" type="date" value={instagramDateRange.end} min={instagramDateRange.start} onChange={(event) => setInstagramDateRange({ ...instagramDateRange, end: event.target.value })} /></div>
                  <button className="button button-ghost" type="button" onClick={() => void syncInstagram()} disabled={syncingInstagram}>
                    <RefreshCw size={17} className={syncingInstagram ? "spin" : ""} />
                    {syncingInstagram ? "Buscando publicações…" : "Importar do Instagram"}
                  </button>
                </div>
              </div>
            </section>
          </div>

          <section className="admin-panel">
            <div className="admin-panel-head"><h3>{editingPost ? "Editar publicação" : "Nova publicação"}</h3></div>
            <div className="admin-panel-body">
              <form className="admin-form" onSubmit={savePost}>
                <section className="form-section">
                  <FormSectionHead title="Texto" hint="O que aparece na página da publicação." />
                  <div className="form-section-body">
                    <div className="field">
                      <label htmlFor="post-title">Título</label>
                      <input id="post-title" value={postForm.title} onChange={(event) => setPostForm({ ...postForm, title: event.target.value, slug: slugify(event.target.value) })} required />                    </div>
                    <div className="field"><label htmlFor="post-excerpt">Resumo</label><textarea id="post-excerpt" className="is-short" value={postForm.excerpt} onChange={(event) => setPostForm({ ...postForm, excerpt: event.target.value })} required={posts.find((post) => post.id === editingPost)?.source !== "instagram"} /></div>
                    <div className="field"><label htmlFor="post-content">Conteúdo</label><textarea id="post-content" value={postForm.content} onChange={(event) => setPostForm({ ...postForm, content: event.target.value })} required /></div>
                  </div>
                </section>
                <section className="form-section">
                  <FormSectionHead title="Publicação" hint="Onde a publicação entra e quando fica visível." />
                  <div className="form-section-body">
                    <div className="field"><label htmlFor="post-category">Categoria</label><Select id="post-category" value={postForm.category} options={["Treinos", "Eventos", "Encontros", "Comunicados"].map((value) => ({ value, label: value }))} onChange={(value) => setPostForm({ ...postForm, category: value })} /></div>
                    <label className="switch-field"><span><strong>Publicar agora</strong></span><input type="checkbox" checked={postForm.published} onChange={(event) => setPostForm({ ...postForm, published: event.target.checked })} /></label>
                    <details className="form-more" key={editingPost ?? "nova"} open={Boolean(editingPostData?.cover_url || editingPostData?.youtube_url || editingPostData?.tiktok_url)}>
                      <summary><span>Capa e links<small>opcional</small></span><ChevronDown aria-hidden="true" /></summary>
                      <div className="form-more-body">
                        <div className="field"><label htmlFor="post-cover">Imagem de capa<span className="opt">URL</span></label><input id="post-cover" type="url" inputMode="url" placeholder="https://" value={postForm.cover_url} onChange={(event) => setPostForm({ ...postForm, cover_url: event.target.value })} /></div>
                        <div className="field"><label htmlFor="post-youtube">YouTube<span className="opt">URL</span></label><input id="post-youtube" type="url" inputMode="url" placeholder="https://" value={postForm.youtube_url} onChange={(event) => setPostForm({ ...postForm, youtube_url: event.target.value })} /></div>
                        <div className="field"><label htmlFor="post-tiktok">TikTok<span className="opt">URL</span></label><input id="post-tiktok" type="url" inputMode="url" placeholder="https://" value={postForm.tiktok_url} onChange={(event) => setPostForm({ ...postForm, tiktok_url: event.target.value })} /></div>
                        <div className="field"><label htmlFor="post-slug">Endereço personalizado</label><input id="post-slug" value={postForm.slug} onChange={(event) => setPostForm({ ...postForm, slug: event.target.value })} /><p className="field-hint">Gerado a partir do título. Só altere se precisar.</p></div>
                      </div>
                    </details>
                  </div>
                </section>
                <div className="form-actions"><button className="button button-primary" type="submit">{editingPost ? "Salvar alterações" : "Criar publicação"}</button>{editingPost && <button className="button button-ghost" type="button" onClick={() => { setEditingPost(null); setPostForm(emptyPost); }}>Cancelar</button>}</div>
              </form>
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-head">
              <div><h3>Publicações</h3><p>{posts.length} {posts.length === 1 ? "publicação" : "publicações"}</p></div>
              <div className="admin-toolbar-meta">
                <label className="check-field"><input type="checkbox" checked={posts.length > 0 && selectedPostIds.size === posts.length} onChange={toggleAllPostSelection} /> Selecionar todos</label>
                <button className="button button-danger button-small" type="button" onClick={() => void removeSelectedPosts()} disabled={!selectedPostIds.size}>
                  <Trash2 size={16} /> Excluir selecionados{selectedPostIds.size ? ` (${selectedPostIds.size})` : ""}
                </button>
              </div>
            </div>
            <AdminTable headers={["Selecionar", "Publicação", "Categoria", "Situação", "Ações"]} count={posts.length} empty="Nenhuma publicação ainda.">{posts.map((post) => <tr key={post.id}><td><input type="checkbox" aria-label={`Selecionar ${post.title}`} checked={selectedPostIds.has(post.id)} onChange={() => togglePostSelection(post.id)} /></td><td><strong>{post.title}</strong><small>/midias/{post.slug}</small></td><td>{post.category}</td><td><span className={`badge ${post.published ? "aprovado" : "pendente"}`}>{post.published ? "Publicada" : "Rascunho"}</span></td><td className="row-actions"><button title="Editar" aria-label={`Editar ${post.title}`} onClick={() => { setEditingPost(post.id); setPostForm({ title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content, category: post.category, cover_url: post.cover_url || "", youtube_url: post.youtube_url || "", tiktok_url: post.tiktok_url || "", published: post.published }); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Edit3 /></button><button className="is-danger" title="Excluir" aria-label={`Excluir ${post.title}`} onClick={() => removePost(post.id)}><Trash2 /></button></td></tr>)}</AdminTable>
          </section>
          <MediaGalleryManager posts={posts} />
        </div>}

        {section === "calendario" && canCalendar && <div>
          <AdminTitle eyebrow="Conteúdo" title="Calendário" description="Treinos, eventos e encontros que aparecem no site e na lista de presença." />
          <section className="admin-panel">
            <div className="admin-panel-head"><h3>{editingActivity ? "Editar atividade" : "Nova atividade"}</h3></div>
            <div className="admin-panel-body">
              <form className="admin-form" onSubmit={saveActivity}>
                <section className="form-section">
                  <FormSectionHead title="Atividade" hint="Nome, tipo e situação atual." />
                  <div className="form-section-body is-two">
                    <div className="field is-full"><label htmlFor="activity-title">Nome</label><input id="activity-title" value={activityForm.title} onChange={(event) => setActivityForm({ ...activityForm, title: event.target.value })} required /></div>
                    <div className="field"><label htmlFor="activity-type">Tipo</label><input id="activity-type" value={activityForm.type} placeholder="Treino, encontro, evento…" onChange={(event) => setActivityForm({ ...activityForm, type: event.target.value })} required /></div>
                    <div className="field"><label htmlFor="activity-status">Situação</label><Select id="activity-status" value={activityForm.status} options={[{ value: "confirmado", label: "Confirmado" }, { value: "a_definir", label: "A definir" }, { value: "adiado", label: "Adiado" }, { value: "cancelado", label: "Cancelado" }, { value: "finalizado", label: "Finalizado" }]} onChange={(value) => setActivityForm({ ...activityForm, status: value as ActivityStatus })} /></div>
                  </div>
                </section>
                <section className="form-section">
                  <FormSectionHead title="Quando e onde" hint="Data, horário e local do encontro." />
                  <div className="form-section-body is-two">
                    <div className="field"><label htmlFor="activity-start">Início</label><input id="activity-start" type="datetime-local" value={activityForm.starts_at} onChange={(event) => setActivityForm({ ...activityForm, starts_at: event.target.value })} required /></div>
                    <div className="field"><label htmlFor="activity-end">Término<span className="opt">opcional</span></label><input id="activity-end" type="datetime-local" value={activityForm.ends_at} onChange={(event) => setActivityForm({ ...activityForm, ends_at: event.target.value })} /></div>
                    <div className="field is-full"><label htmlFor="activity-location">Local</label><input id="activity-location" value={activityForm.location} onChange={(event) => setActivityForm({ ...activityForm, location: event.target.value })} required /></div>
                  </div>
                </section>
                <section className="form-section">
                  <FormSectionHead title="Detalhes" hint="Informações extras e lista de presença." />
                  <div className="form-section-body">
                    <div className="field"><label htmlFor="activity-description">Descrição<span className="opt">opcional</span></label><textarea id="activity-description" className="is-short" value={activityForm.description} onChange={(event) => setActivityForm({ ...activityForm, description: event.target.value })} /></div>
                    <label className="switch-field"><span><strong>Permitir confirmação de presença</strong></span><input type="checkbox" checked={activityForm.attendance_open} onChange={(event) => setActivityForm({ ...activityForm, attendance_open: event.target.checked })} /></label>
                  </div>
                </section>
                <div className="form-actions"><button className="button button-primary" type="submit">{editingActivity ? "Salvar alterações" : "Adicionar ao calendário"}</button>{editingActivity && <button className="button button-ghost" type="button" onClick={() => { setEditingActivity(null); setActivityForm(emptyActivity); }}>Cancelar</button>}</div>
              </form>
            </div>
          </section>
          <AdminTable headers={["Atividade", "Data", "Lista", "Situação", "Ações"]} count={activities.length} empty="Nenhuma atividade cadastrada.">{activities.map((item) => <tr key={item.id}><td><strong>{item.title}</strong><small>{item.location}</small></td><td>{new Date(item.starts_at).toLocaleString("pt-BR")}</td><td>{item.attendance_open ? "Aberta" : "Fechada"}</td><td><span className={`badge ${item.status}`}>{statusLabel(item.status)}</span></td><td className="row-actions"><button title="Editar" aria-label={`Editar ${item.title}`} onClick={() => { setEditingActivity(item.id); setActivityForm({ title: item.title, starts_at: toDateTimeInput(item.starts_at), ends_at: toDateTimeInput(item.ends_at), location: item.location, type: item.type, status: item.status, description: item.description || "", attendance_open: item.attendance_open ?? true }); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Edit3 /></button><button className="is-danger" title="Excluir" aria-label={`Excluir ${item.title}`} onClick={() => removeActivity(item.id)}><Trash2 /></button></td></tr>)}</AdminTable>
        </div>}

        {section === "membros" && canMembers && <div>
          <AdminTitle eyebrow="Pessoas" title="Membros" description="Aprove cadastros e pedidos de alteração de dados, ou consulte e gerencie todos os membros." />
          <div className="admin-subtabs" role="tablist" aria-label="Seções de membros">
            <button type="button" role="tab" aria-selected={memberTab === "pendentes"} className={memberTab === "pendentes" ? "active" : ""} onClick={() => setMemberTab("pendentes")}>Aguardando ação <CountBadge count={membersNeedingAction} label="membros aguardando ação" /></button>
            <button type="button" role="tab" aria-selected={memberTab === "todos"} className={memberTab === "todos" ? "active" : ""} onClick={() => setMemberTab("todos")}>Todos os membros</button>
          </div>

          {memberTab === "pendentes" && <div role="tabpanel">
            {dashboardQuery.isPending && !members.length
              ? <p className="admin-hint" role="status">Carregando…</p>
              : <MemberQueue
                members={membersQueue}
                currentUserId={currentUserId}
                principal={principal}
                busyId={busyMemberId}
                canManage={canManageMember}
                canEditAccess={canEditAccess}
                onSetStatus={(member, status) => void decideRegistration(member, status)}
                onReviewRequest={(member, action, adjustments) => void reviewAccessRequest(member, action, adjustments)}
                onEditAccess={editMember}
              />}
          </div>}

          {memberTab === "todos" && <div role="tabpanel">
            <div className="admin-toolbar">
              <div className="admin-toolbar-filters">
                <label className="admin-search"><span className="sr-only">Buscar membro</span><Search aria-hidden="true" /><input value={memberSearch} onChange={(event) => setMemberSearch(event.target.value)} placeholder="Buscar por apelido, nome ou e-mail" /></label>
                <Select id="member-status-filter" value={memberStatus} options={memberStatusOptions} onChange={(value) => setMemberStatus(value as MemberStatusFilter)} />
              </div>
              <div className="admin-toolbar-meta">
                <span>{filteredMembers.length} {filteredMembers.length === 1 ? "membro" : "membros"}</span>
                {!principal && <span>Funções de administrador são gerenciadas pelo ADM Principal.</span>}
              </div>
            </div>
            <AdminTable headers={["Membro", "Acesso interno", "Patente e graduação", "Situação", "Ações"]} count={filteredMembers.length} empty="Nenhum membro encontrado para esses filtros.">{filteredMembers.map((member) => <tr key={member.id}><td><strong>{member.nickname}</strong><BirthdayBadge birthDate={member.birth_date} /><small>{member.full_name} • {member.email}</small></td><td><span className="badge graduation">{memberKindLabels[member.member_kind]}</span><small>{principal ? ((memberRoles[member.id] || []).map((role) => adminRoleOptions.find((option) => option.value === role)?.label ?? role).join(", ") || "Sem função de administrador") : ""}</small></td><td><div className="member-rank-insignias"><RankInsignia rank={member.rank} />{highestGraduation(member) !== "sem_graduacao" ? <GraduationInsignias profile={member} /> : <small>Sem graduação</small>}{member.graduation_review_needed && <span className="badge pendente" title="Tinha graduação, mas a ordem não dizia a trilha. Defina o nível em cada trilha.">Graduação a revisar</span>}</div></td><td><span className={`badge ${member.status}`}>{statusLabel(member.status)}</span></td><td className="row-actions">{canEditAccess(member) && <button title="Editar acessos" aria-label={`Editar acessos de ${member.nickname}`} onClick={() => editMember(member)}><Edit3 /></button>}{canManageMember(member) && <>{member.status !== "aprovado" && <button className="is-ok" title="Aprovar" aria-label={`Aprovar ${member.nickname}`} onClick={() => updateMemberStatus(member.id, "aprovado")}><ShieldCheck /></button>}<button className="is-danger" title="Suspender" aria-label={`Suspender ${member.nickname}`} onClick={() => updateMemberStatus(member.id, "suspenso")}><XCircle /></button><button className="is-danger" title="Excluir" aria-label={`Excluir ${member.nickname}`} onClick={() => deleteMember(member.id)}><Trash2 /></button></>}{!canEditAccess(member) && !canManageMember(member) && <small>{isSelfTarget(member) ? "Sua própria conta" : "Protegido: outro ADM Principal"}</small>}</td></tr>)}</AdminTable>
          </div>}

          {memberForm && <AdminDialog
            title={`Acessos de ${memberForm.nickname}`}
            description={memberForm.full_name}
            onClose={() => setMemberForm(null)}
            onSubmit={saveMemberAccess}
            footer={<><button className="button button-ghost" type="button" onClick={() => setMemberForm(null)}>Cancelar</button><button className="button button-primary" type="submit">Salvar acessos</button></>}
          >
            <section className="form-section">
              <FormSectionHead title="Vínculo" hint="Define o que a pessoa vê na área do membro." />
              <div className="form-section-body">
                <div className="field"><label htmlFor="member-kind">Nível interno</label><Select id="member-kind" value={memberForm.member_kind} options={memberKindOptions} onChange={(value) => setMemberForm({ ...memberForm, member_kind: value as MemberKind })} /></div>
              </div>
            </section>
            <section className="form-section">
              <FormSectionHead title="Patente e graduação" hint={principal ? "Alterações valem na hora." : "Somente o ADM Principal altera estes dados."} />
              <div className="form-section-body">
                {principal ? <>
                  <div className="field"><label htmlFor="member-rank">Patente</label><Select id="member-rank" value={memberForm.rank} options={rankGroups.flatMap((group) => group.ranks.map((rank) => ({ value: rank.value, label: rank.label, group: group.category })))} onChange={(value) => setMemberForm({ ...memberForm, rank: value as DkRank })} /></div>
                  {graduationTracks.map((track) => <div className="field" key={track.value}><label htmlFor={`member-${track.field}`}>Graduação em {track.label}</label><Select id={`member-${track.field}`} value={memberForm[track.field]} options={graduationOptions.map((item) => ({ value: item.value, label: item.label }))} onChange={(value) => setMemberForm({ ...memberForm, [track.field]: value as GraduationLevel })} /></div>)}
                </> : <dl className="readonly-list">
                  <div><dt>Patente</dt><dd>{rankLabels[memberForm.rank]}</dd></div>
                  {graduationTracks.map((track) => <div key={track.value}><dt>Graduação em {track.label}</dt><dd>{graduationLabels[memberForm[track.field]]}</dd></div>)}
                </dl>}
              </div>
            </section>
            {principal && <section className="form-section">
              <FormSectionHead title="Permissões administrativas" hint="O que esta pessoa pode gerenciar no painel." />
              <div className="form-section-body switch-list" role="group" aria-label="Permissões administrativas">
                {adminRoleOptions.map((item) => <label className="switch-field" key={item.value}><span><strong>{item.label}</strong></span><input type="checkbox" checked={(memberRoles[memberForm.id] || []).includes(item.value)} onChange={(event) => toggleAdminRole(memberForm.id, item.value, event.target.checked)} /></label>)}
                <label className="switch-field"><span><strong>Ver logs</strong></span><input type="checkbox" disabled={!logViewersQuery.data} checked={logViewersQuery.data?.has(memberForm.id) ?? false} onChange={(event) => void toggleLogViewer(memberForm.id, event.target.checked)} /></label>
              </div>
            </section>}
          </AdminDialog>}
        </div>}

        {section === "convites" && canMembers && <div>
          <AdminTitle eyebrow="Pessoas" title="Convites" description="Links de cadastro de uso único, válidos por 15 dias." action={<button className="button button-primary" disabled={Boolean(inviteBusy)} onClick={createInvite}>{inviteBusy === "create" ? <span className="inline-spinner" aria-hidden="true" /> : <TicketPlus size={18} />} {inviteBusy === "create" ? "Gerando…" : "Gerar convite"}</button>} />
          <AdminTable headers={["Código", "Validade", "Uso", "Situação", "Ações"]} count={invites.length} empty="Nenhum convite gerado ainda.">{invites.map((invite) => <tr key={invite.id}><td><strong>{invite.code}</strong></td><td>{new Date(invite.expires_at).toLocaleDateString("pt-BR")}</td><td>{invite.current_uses}/{invite.max_uses}</td><td><span className={`badge ${invite.active ? "aprovado" : "suspenso"}`}>{invite.active ? "Ativo" : "Inativo"}</span></td><td className="row-actions"><button title="Copiar link" aria-label="Copiar link do convite" onClick={() => void copyInviteLink(invite.code)}><Copy /></button><button className="is-danger" title="Desativar" aria-label={inviteBusy === invite.id ? "Desativando convite" : "Desativar convite"} disabled={Boolean(inviteBusy) || !invite.active} onClick={() => disableInvite(invite.id)}>{inviteBusy === invite.id ? <span className="inline-spinner" aria-hidden="true" /> : <XCircle />}</button></td></tr>)}</AdminTable>
        </div>}

        {section === "documentos" && canMembers && <DocumentManager />}
        {section === "simulados" && canManageAssessments && <AssessmentAdmin />}
        {section === "logs" && canViewLogs && <LogsViewer />}
      </div>
    </section>
  );
}

function AdminNav({ icon, label, active, onClick, badge = 0, badgeLabel = "pendências" }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void; badge?: number; badgeLabel?: string }) {
  return <button type="button" className={active ? "active" : ""} aria-current={active ? "page" : undefined} onClick={onClick}>{icon}<span>{label}</span><CountBadge count={badge} label={badgeLabel} /></button>;
}

function Metric({ icon, label, value, onClick, highlight = false }: { icon: React.ReactNode; label: string; value: number; onClick: () => void; highlight?: boolean }) {
  return <button type="button" className={"metric-card" + (highlight && value > 0 ? " is-highlight" : "")} onClick={onClick}><span className="metric-icon" aria-hidden="true">{icon}</span><span className="metric-text"><strong>{value}</strong><span>{label}</span></span></button>;
}

function AdminTable({ headers, count, empty, children }: { headers: string[]; count: number; empty: string; children: React.ReactNode }) {
  return <div className="table-wrap">
    {count === 0
      ? <p className="table-empty">{empty}</p>
      : <table><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{children}</tbody></table>}
  </div>;
}
