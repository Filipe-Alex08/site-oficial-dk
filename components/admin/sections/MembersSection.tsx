"use client";

import { Edit3, ShieldCheck, Trash2, UserX } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAdminData, type MemberTab } from "@/components/admin/AdminDataContext";
import AdminTitle from "@/components/admin/AdminTitle";
import { useConfirm } from "@/components/admin/ConfirmProvider";
import FormSectionHead from "@/components/admin/FormSectionHead";
import MemberFilters from "@/components/admin/MemberFilters";
import MemberQueue, { type RequestAdjustments } from "@/components/admin/MemberQueue";
import { useToast } from "@/components/admin/ToastProvider";
import Avatar from "@/components/admin/ui/Avatar";
import DataTable from "@/components/admin/ui/DataTable";
import Drawer from "@/components/admin/ui/Drawer";
import Panel from "@/components/admin/ui/Panel";
import { onTabListKeyDown } from "@/components/admin/ui/tabKeys";
import RowMenu from "@/components/admin/ui/RowMenu";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import BirthdayBadge from "@/components/member/BirthdayBadge";
import { GraduationInsignias, RankInsignia } from "@/components/member/Insignia";
import CountBadge from "@/components/ui/CountBadge";
import Select from "@/components/ui/Select";
import { adminRoleOptions, graduationLabels, graduationOptions, graduationTracks, highestGraduation, isCommander, memberKindLabels, memberKindOptions, rankGroups, rankLabels } from "@/lib/member-access";
import { friendlyError } from "@/lib/friendly-error";
import { matchesGraduation, matchesRank, matchesSearch, type GraduationFilter, type RankFilter, type TrackFilter } from "@/lib/member-filters";
import type { AdminRole, DkRank, GraduationLevel, MemberKind, MemberProfile } from "@/lib/types";

type MemberAccessForm = {
  id: string;
  full_name: string;
  nickname: string;
  member_kind: MemberKind;
  rank: DkRank;
  graduation_cavalaria: GraduationLevel;
  graduation_arquearia: GraduationLevel;
  commander_cavalaria: boolean;
  commander_arquearia: boolean;
};
type MemberStatusFilter = "todos" | MemberProfile["status"];

const statusFilters: Array<{ value: MemberStatusFilter; label: string }> = [
  { value: "todos", label: "Todos" },
  { value: "aprovado", label: "Aprovados" },
  { value: "pendente", label: "Pendentes" },
  { value: "suspenso", label: "Suspensos" },
  { value: "recusado", label: "Recusados" },
];

export default function MembersSection() {
  const { supabase, principal, members, memberRoles, currentUserId, loading, refetch, membersNeedingAction, setMemberTab } = useAdminData();
  const toast = useToast();
  const confirm = useConfirm();
  const searchParams = useSearchParams();
  const [memberForm, setMemberForm] = useState<MemberAccessForm | null>(null);
  const [busyMemberId, setBusyMemberId] = useState<string | null>(null);
  // A paleta de comandos leva a este filtro pela URL (?busca=): vale na abertura e a cada mudança.
  const urlSearch = searchParams.get("busca") ?? "";
  const [lastUrlSearch, setLastUrlSearch] = useState(urlSearch);
  const [memberSearch, setMemberSearch] = useState(urlSearch);
  if (urlSearch !== lastUrlSearch) {
    setLastUrlSearch(urlSearch);
    setMemberSearch(urlSearch);
  }
  const [memberStatus, setMemberStatus] = useState<MemberStatusFilter>("todos");
  const [rankFilter, setRankFilter] = useState<RankFilter>("todas");
  const [graduationFilter, setGraduationFilter] = useState<GraduationFilter>("todas");
  const [trackFilter, setTrackFilter] = useState<TrackFilter>("qualquer");
  const [commanderOnly, setCommanderOnly] = useState(false);
  const filtersActive = Boolean(memberSearch.trim()) || memberStatus !== "todos" || rankFilter !== "todas" || graduationFilter !== "todas" || commanderOnly;

  function clearFilters() {
    setMemberSearch("");
    setMemberStatus("todos");
    setRankFilter("todas");
    setGraduationFilter("todas");
    setTrackFilter("qualquer");
    setCommanderOnly(false);
  }

  // Inclui a própria solicitação do admin: aparece só como aviso e não entra no selo.
  const membersQueue = useMemo(() => members.filter((member) =>
    member.status === "pendente" || Boolean(member.access_request_id) || (principal && Boolean(member.graduation_review_needed)),
  ), [members, principal]);
  // Busca, patente e graduação valem para a lista e para os contadores da situação.
  const searched = useMemo(
    () => members.filter((member) => matchesSearch(member, memberSearch) && matchesRank(member, rankFilter) && matchesGraduation(member, graduationFilter, trackFilter, commanderOnly)),
    [members, memberSearch, rankFilter, graduationFilter, trackFilter, commanderOnly],
  );
  const filteredMembers = useMemo(() => searched.filter((member) => memberStatus === "todos" || member.status === memberStatus), [searched, memberStatus]);
  const statusOptions = statusFilters.map((option) => ({ ...option, count: option.value === "todos" ? searched.length : searched.filter((member) => member.status === option.value).length }));
  const requestedTab = searchParams.get("aba");
  const memberTab: MemberTab = requestedTab === "pendentes" || requestedTab === "todos"
    ? requestedTab
    : (loading || membersNeedingAction > 0 ? "pendentes" : "todos");
  const formMember = memberForm ? members.find((member) => member.id === memberForm.id) : undefined;

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
      if (response.ok) toast.success("Permissão de logs atualizada.");
      else toast.error(data.error || "Não foi possível salvar a permissão.");
    } catch {
      toast.error("Não foi possível salvar a permissão: sem conexão.");
    }
    await logViewersQuery.refetch();
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

  async function updateMemberStatus(id: string, status: string, success = "Cadastro atualizado.") {
    setBusyMemberId(id);
    try {
      const response = await fetch(`/api/admin/members/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const result = await response.json();
      if (response.ok) toast.success(success); else toast.error(friendlyError(result.error));
    } catch {
      toast.error("Não foi possível atualizar o cadastro: sem conexão.");
    } finally {
      setBusyMemberId(null);
    }
    await refetch();
  }

  async function decideRegistration(member: MemberProfile, status: "aprovado" | "recusado") {
    if (status === "recusado" && !(await confirm({ title: `Recusar o cadastro de ${member.nickname}?`, message: "A pessoa não terá acesso à área do membro.", confirmLabel: "Recusar cadastro", danger: true }))) return;
    await updateMemberStatus(member.id, status, status === "aprovado" ? `Cadastro de ${member.nickname} aprovado.` : `Cadastro de ${member.nickname} recusado.`);
  }

  async function suspendMember(member: MemberProfile) {
    if (!(await confirm({ title: `Suspender ${member.nickname}?`, message: "A pessoa perde o acesso à área do membro até ser aprovada de novo.", confirmLabel: "Suspender", danger: true }))) return;
    await updateMemberStatus(member.id, "suspenso", `${member.nickname} suspenso.`);
  }

  function editMember(member: MemberProfile) {
    if (!canEditAccess(member)) return toast.error("Esta conta só pode ser alterada por outro ADM Principal.");
    setMemberForm({
      id: member.id,
      full_name: member.full_name,
      nickname: member.nickname,
      member_kind: member.member_kind,
      rank: member.rank,
      graduation_cavalaria: member.graduation_cavalaria ?? "sem_graduacao",
      graduation_arquearia: member.graduation_arquearia ?? "sem_graduacao",
      commander_cavalaria: isCommander(member.graduation_cavalaria, member.commander_cavalaria),
      commander_arquearia: isCommander(member.graduation_arquearia, member.commander_arquearia),
    });
  }

  async function reviewAccessRequest(member: MemberProfile, action: "approve" | "reject", adjustments?: RequestAdjustments) {
    if (member.id === currentUserId) return toast.error("Sua própria solicitação precisa ser analisada por outro administrador.");
    if (action === "reject" && !(await confirm({ title: `Recusar a alteração de dados de ${member.nickname}?`, confirmLabel: "Recusar dados", danger: true }))) return;
    setBusyMemberId(member.id);
    try {
      const response = await fetch(`/api/admin/members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_request_action: action, access_request_id: member.access_request_id, ...(adjustments ? { adjustments } : {}) }),
      });
      const result = await response.json();
      const approved = adjustments ? "Dados aprovados com ajustes e acessos atualizados." : "Dados aprovados e acessos atualizados.";
      if (response.ok) toast.success(action === "approve" ? approved : "Solicitação recusada."); else toast.error(friendlyError(result.error));
    } catch {
      toast.error("Não foi possível analisar a solicitação: sem conexão.");
    } finally {
      setBusyMemberId(null);
    }
    await refetch();
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
        commander_cavalaria: memberForm.commander_cavalaria,
        commander_arquearia: memberForm.commander_arquearia,
      } : { member_kind: memberForm.member_kind }),
    });
    const result = await response.json();
    if (!response.ok) return toast.error(friendlyError(result.error));
    toast.success("Acessos internos atualizados.");
    setMemberForm(null);
    await refetch();
  }

  async function toggleAdminRole(userId: string, role: AdminRole, enabled: boolean) {
    if (!supabase || !principal) return;
    if (!enabled && userId === currentUserId && role === "principal") return toast.error("Você não pode remover o próprio acesso de ADM Principal.");
    const result = enabled
      ? await supabase.from("user_admin_roles").insert({ user_id: userId, role })
      : await supabase.from("user_admin_roles").delete().eq("user_id", userId).eq("role", role);
    if (result.error) toast.error(friendlyError(result.error)); else toast.success("Permissão administrativa atualizada.");
    await refetch();
  }

  async function deleteMember(member: MemberProfile) {
    if (!(await confirm({ title: `Excluir ${member.nickname}?`, message: "O membro e o acesso dele serão removidos permanentemente.", confirmLabel: "Excluir membro", danger: true }))) return;
    const response = await fetch(`/api/admin/members/${member.id}`, { method: "DELETE" });
    const result = await response.json();
    if (response.ok) toast.success("Membro excluído."); else toast.error(friendlyError(result.error));
    await refetch();
  }

  return <div>
    <AdminTitle eyebrow="Pessoas" title="Membros" description="Aprove cadastros e pedidos de alteração de dados, ou consulte e gerencie todos os membros." />
    <div className="admin-subtabs" role="tablist" aria-label="Seções de membros" onKeyDown={onTabListKeyDown}>
      <button type="button" role="tab" id="member-tab-pendentes" aria-controls="member-panel" tabIndex={memberTab === "pendentes" ? 0 : -1} aria-selected={memberTab === "pendentes"} className={memberTab === "pendentes" ? "active" : ""} onClick={() => setMemberTab("pendentes")}>Aguardando ação <CountBadge count={membersNeedingAction} label="membros aguardando ação" /></button>
      <button type="button" role="tab" id="member-tab-todos" aria-controls="member-panel" tabIndex={memberTab === "todos" ? 0 : -1} aria-selected={memberTab === "todos"} className={memberTab === "todos" ? "active" : ""} onClick={() => setMemberTab("todos")}>Todos os membros</button>
    </div>

    {memberTab === "pendentes" && <div role="tabpanel" id="member-panel" aria-labelledby="member-tab-pendentes">
      {loading && !members.length
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

    {memberTab === "todos" && <div role="tabpanel" id="member-panel" aria-labelledby="member-tab-todos">
      <MemberFilters
        search={memberSearch}
        onSearch={setMemberSearch}
        status={memberStatus}
        statusOptions={statusOptions}
        onStatus={setMemberStatus}
        statusAll="todos"
        rank={rankFilter}
        onRank={setRankFilter}
        graduation={graduationFilter}
        onGraduation={setGraduationFilter}
        track={trackFilter}
        onTrack={setTrackFilter}
        commanderOnly={commanderOnly}
        onCommanderOnly={setCommanderOnly}
        shown={filteredMembers.length}
        total={members.length}
        filtersActive={filtersActive}
        onClear={clearFilters}
      />
      <Panel flush>
        <DataTable
          rows={filteredMembers}
          rowKey={(member) => member.id}
          empty="Nenhum membro encontrado para esses filtros."
          caption="Todos os membros"
          columns={[
            {
              key: "member", header: "Membro", hideLabel: true, className: "is-lead",
              render: (member) => <div className="member-cell">
                <Avatar name={member.nickname} path={member.avatar_path} size={40} />
                <div><strong>{member.nickname}</strong><BirthdayBadge birthDate={member.birth_date} /><small>{member.full_name} • {member.email}</small></div>
              </div>,
            },
            {
              key: "access", header: "Acesso interno",
              render: (member) => <>
                <span className="badge graduation">{memberKindLabels[member.member_kind]}</span>
                {principal && <small>{(memberRoles[member.id] || []).map((role) => adminRoleOptions.find((option) => option.value === role)?.label ?? role).join(", ") || "Sem função de administrador"}</small>}
              </>,
            },
            {
              key: "rank", header: "Patente e graduação",
              render: (member) => <div className="member-rank-insignias">
                <RankInsignia rank={member.rank} />
                {highestGraduation(member) !== "sem_graduacao" ? <GraduationInsignias profile={member} /> : <small>Sem graduação</small>}
                {member.graduation_review_needed && <span className="badge pendente" title="Tinha graduação, mas a ordem não dizia a trilha. Defina o nível em cada trilha.">Graduação a revisar</span>}
              </div>,
            },
            { key: "status", header: "Situação", render: (member) => <StatusBadge status={member.status} /> },
            {
              key: "actions", header: "Ações", srOnlyHeader: true, className: "row-actions",
              render: (member) => {
                if (!canEditAccess(member) && !canManageMember(member)) return <small>{isSelfTarget(member) ? "Sua própria conta" : "Protegido: outro ADM Principal"}</small>;
                const manage = canManageMember(member);
                return <RowMenu label={`Ações de ${member.nickname}`} items={[
                  { label: "Editar acessos", icon: <Edit3 />, hidden: !canEditAccess(member), onSelect: () => editMember(member) },
                  { label: "Aprovar", icon: <ShieldCheck />, hidden: !manage || member.status === "aprovado", disabled: busyMemberId === member.id, onSelect: () => void updateMemberStatus(member.id, "aprovado", `${member.nickname} aprovado.`) },
                  { label: "Suspender", icon: <UserX />, danger: true, hidden: !manage || member.status === "suspenso", onSelect: () => void suspendMember(member) },
                  { label: "Excluir", icon: <Trash2 />, danger: true, hidden: !manage, onSelect: () => void deleteMember(member) },
                ]} />;
              },
            },
          ]}
        />
      </Panel>
    </div>}

    {memberForm && <Drawer
      title={`Acessos de ${memberForm.nickname}`}
      description={memberForm.full_name}
      onClose={() => setMemberForm(null)}
      onSubmit={saveMemberAccess}
      headerExtra={formMember && <div className="drawer-profile">
        <Avatar name={formMember.nickname} path={formMember.avatar_path} size={52} />
        <div>
          <StatusBadge status={formMember.status} />
          <div className="member-rank-insignias"><RankInsignia rank={formMember.rank} />{highestGraduation(formMember) !== "sem_graduacao" && <GraduationInsignias profile={formMember} />}</div>
        </div>
      </div>}
      footer={<><button className="button button-ghost" type="button" onClick={() => setMemberForm(null)}>Cancelar</button><button className="button button-primary" type="submit">Salvar acessos</button></>}
    >
      <div className="admin-form">
        <section className="form-section">
          <FormSectionHead title="Vínculo" />
          <div className="form-section-body">
            <div className="field"><label htmlFor="member-kind">Nível interno</label><Select id="member-kind" value={memberForm.member_kind} options={memberKindOptions} onChange={(value) => setMemberForm({ ...memberForm, member_kind: value as MemberKind })} /></div>
          </div>
        </section>
        <section className="form-section">
          <FormSectionHead title="Patente e graduação" hint={principal ? "Alterações valem na hora." : "Somente o ADM Principal altera estes dados."} />
          <div className="form-section-body">
            {principal ? <>
              <div className="field"><label htmlFor="member-rank">Patente</label><Select id="member-rank" value={memberForm.rank} options={rankGroups.flatMap((group) => group.ranks.map((rank) => ({ value: rank.value, label: rank.label, group: group.category })))} onChange={(value) => setMemberForm({ ...memberForm, rank: value as DkRank })} /></div>
              {graduationTracks.map((track) => {
                const hasLevel = memberForm[track.field] !== "sem_graduacao";
                return <div className="field" key={track.value}>
                  <label htmlFor={`member-${track.field}`}>Graduação em {track.label}</label>
                  <Select id={`member-${track.field}`} value={memberForm[track.field]} options={graduationOptions.map((item) => ({ value: item.value, label: item.label }))} onChange={(value) => setMemberForm({ ...memberForm, [track.field]: value as GraduationLevel, ...(value === "sem_graduacao" ? { [track.commanderField]: false } : {}) })} />
                  <label className="check-field" htmlFor={`member-${track.commanderField}`}><input id={`member-${track.commanderField}`} type="checkbox" disabled={!hasLevel} checked={hasLevel && memberForm[track.commanderField]} onChange={(event) => setMemberForm({ ...memberForm, [track.commanderField]: event.target.checked })} /> Comandante de {track.label}</label>
                </div>;
              })}
            </> : <dl className="readonly-list">
              <div><dt>Patente</dt><dd>{rankLabels[memberForm.rank]}</dd></div>
              {graduationTracks.map((track) => <div key={track.value}><dt>Graduação em {track.label}</dt><dd>{graduationLabels[memberForm[track.field]]}{memberForm[track.commanderField] ? " · Comandante" : ""}</dd></div>)}
            </dl>}
          </div>
        </section>
        {principal && <section className="form-section">
          <FormSectionHead title="Permissões administrativas" hint="O que esta pessoa pode gerenciar no painel." />
          <div className="form-section-body switch-list" role="group" aria-label="Permissões administrativas">
            {adminRoleOptions.map((item) => <label className="switch-field" key={item.value}><span><strong>{item.label}</strong></span><input type="checkbox" checked={(memberRoles[memberForm.id] || []).includes(item.value)} onChange={(event) => void toggleAdminRole(memberForm.id, item.value, event.target.checked)} /></label>)}
            <label className="switch-field"><span><strong>Ver logs</strong></span><input type="checkbox" disabled={!logViewersQuery.data} checked={logViewersQuery.data?.has(memberForm.id) ?? false} onChange={(event) => void toggleLogViewer(memberForm.id, event.target.checked)} /></label>
          </div>
        </section>}
      </div>
    </Drawer>}
  </div>;
}
