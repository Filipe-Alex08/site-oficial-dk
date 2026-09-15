"use client";

import { CalendarPlus, Edit3, FileText, ImagePlus, LayoutDashboard, ShieldCheck, TicketPlus, Trash2, UserCog, XCircle } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import DocumentManager from "@/components/admin/DocumentManager";
import MediaGalleryManager from "@/components/admin/MediaGalleryManager";
import { adminRoleOptions, graduationLabels, graduationOptions, memberKindLabels, memberKindOptions, rankGroups, rankLabels } from "@/lib/member-access";
import { createClient } from "@/lib/supabase/client";
import type { Activity, ActivityStatus, AdminRole, DkRank, GraduationLevel, MemberKind, MemberProfile, Post } from "@/lib/types";

type Section = "resumo" | "midias" | "calendario" | "membros" | "convites" | "documentos";
type Invite = { id: string; code: string; expires_at: string; max_uses: number; current_uses: number; active: boolean };
type MemberAccessForm = {
  id: string;
  full_name: string;
  member_kind: MemberKind;
  rank: DkRank;
  graduation_level: GraduationLevel;
  graduation_order: string;
};

const emptyPost = { title: "", slug: "", excerpt: "", content: "", category: "Treinos", cover_url: "", published: false };
const emptyActivity = { title: "", starts_at: "", ends_at: "", location: "", type: "Treino", status: "confirmado" as ActivityStatus, description: "", attendance_open: true };

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function toDateTimeInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export default function AdminDashboard({ roles }: { roles: AdminRole[] }) {
  const supabase = useMemo(() => createClient(), []);
  const principal = roles.includes("principal");
  const canMedia = principal || roles.includes("midias");
  const canCalendar = principal || roles.includes("atividades");
  const canMembers = principal || roles.includes("membros");
  const allowed: Section[] = [
    "resumo",
    ...(canMedia ? ["midias" as const] : []),
    ...(canCalendar ? ["calendario" as const] : []),
    ...(canMembers ? ["membros" as const, "convites" as const] : []),
    ...(principal ? ["documentos" as const] : []),
  ];

  const [section, setSection] = useState<Section>("resumo");
  const [posts, setPosts] = useState<Post[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [memberRoles, setMemberRoles] = useState<Record<string, AdminRole[]>>({});
  const [currentUserId, setCurrentUserId] = useState("");
  const [invites, setInvites] = useState<Invite[]>([]);
  const [postForm, setPostForm] = useState(emptyPost);
  const [activityForm, setActivityForm] = useState(emptyActivity);
  const [memberForm, setMemberForm] = useState<MemberAccessForm | null>(null);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

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
      jobs.push(supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id || "")));
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

  useEffect(() => { void load(); }, [load]);

  function show(text: string) {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 3500);
  }

  async function savePost(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    const payload = { ...postForm, slug: postForm.slug || slugify(postForm.title), cover_url: postForm.cover_url || null, published_at: new Date().toISOString() };
    const result = editingPost ? await supabase.from("posts").update(payload).eq("id", editingPost) : await supabase.from("posts").insert(payload);
    if (result.error) return show(result.error.message);
    setPostForm(emptyPost);
    setEditingPost(null);
    show("Publicação salva.");
    await load();
  }

  async function removePost(id: string) {
    if (!supabase || !window.confirm("Excluir esta publicação?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    show(error ? error.message : "Publicação excluída.");
    await load();
  }

  async function saveActivity(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    const payload = {
      ...activityForm,
      starts_at: new Date(activityForm.starts_at).toISOString(),
      ends_at: activityForm.ends_at ? new Date(activityForm.ends_at).toISOString() : null,
    };
    const result = editingActivity ? await supabase.from("activities").update(payload).eq("id", editingActivity) : await supabase.from("activities").insert(payload);
    if (result.error) return show(result.error.message);
    setActivityForm(emptyActivity);
    setEditingActivity(null);
    show("Atividade salva.");
    await load();
  }

  async function removeActivity(id: string) {
    if (!supabase || !window.confirm("Excluir esta atividade e sua lista de presença?")) return;
    const { error } = await supabase.from("activities").delete().eq("id", id);
    show(error ? error.message : "Atividade excluída.");
    await load();
  }

  async function updateMemberStatus(id: string, status: string) {
    const response = await fetch(`/api/admin/members/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    const result = await response.json();
    show(response.ok ? "Cadastro atualizado." : result.error);
    await load();
  }

  function editMember(member: MemberProfile) {
    setMemberForm({
      id: member.id,
      full_name: member.full_name,
      member_kind: member.member_kind,
      rank: member.rank,
      graduation_level: member.graduation_level,
      graduation_order: member.graduation_order || "",
    });
  }

  async function saveMemberAccess(event: FormEvent) {
    event.preventDefault();
    if (!memberForm) return;
    const response = await fetch(`/api/admin/members/${memberForm.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        member_kind: memberForm.member_kind,
        rank: memberForm.rank,
        graduation_level: memberForm.graduation_level,
        graduation_order: memberForm.graduation_order,
      }),
    });
    const result = await response.json();
    if (!response.ok) return show(result.error);
    show("Acessos internos atualizados.");
    setMemberForm(null);
    await load();
  }

  async function toggleAdminRole(userId: string, role: AdminRole, enabled: boolean) {
    if (!supabase || !principal) return;
    if (!enabled && userId === currentUserId && role === "principal") return show("Você não pode remover o próprio acesso de ADM Principal.");
    const result = enabled
      ? await supabase.from("user_admin_roles").insert({ user_id: userId, role })
      : await supabase.from("user_admin_roles").delete().eq("user_id", userId).eq("role", role);
    show(result.error ? result.error.message : "Permissão administrativa atualizada.");
    await load();
  }

  async function deleteMember(id: string) {
    if (!window.confirm("Excluir permanentemente este membro e seu acesso?")) return;
    const response = await fetch(`/api/admin/members/${id}`, { method: "DELETE" });
    const result = await response.json();
    show(response.ok ? "Membro excluído." : result.error);
    await load();
  }

  async function createInvite() {
    if (!supabase) return;
    const code = `DK-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const expires = new Date();
    expires.setDate(expires.getDate() + 15);
    const { error } = await supabase.from("invites").insert({ code, expires_at: expires.toISOString(), max_uses: 1 });
    show(error ? error.message : "Convite criado.");
    await load();
  }

  async function disableInvite(id: string) {
    if (!supabase) return;
    const { error } = await supabase.from("invites").update({ active: false }).eq("id", id);
    show(error ? error.message : "Convite desativado.");
    await load();
  }

  return (
    <section className="admin-shell">
      <aside className="admin-sidebar">
        <div><p className="eyebrow">CMS do DK</p><h1>Administração</h1><p>{roles.map((role) => `ADM ${role}`).join(" • ")}</p></div>
        <nav>
          <AdminNav icon={<LayoutDashboard />} label="Resumo" active={section === "resumo"} onClick={() => setSection("resumo")} />
          {canMedia && <AdminNav icon={<ImagePlus />} label="Mídias" active={section === "midias"} onClick={() => setSection("midias")} />}
          {canCalendar && <AdminNav icon={<CalendarPlus />} label="Calendário" active={section === "calendario"} onClick={() => setSection("calendario")} />}
          {canMembers && <AdminNav icon={<UserCog />} label="Membros" active={section === "membros"} onClick={() => setSection("membros")} />}
          {canMembers && <AdminNav icon={<TicketPlus />} label="Convites" active={section === "convites"} onClick={() => setSection("convites")} />}
          {principal && <AdminNav icon={<FileText />} label="Documentos" active={section === "documentos"} onClick={() => setSection("documentos")} />}
        </nav>
      </aside>

      <div className="admin-content">
        {notice && <div className="admin-notice">{notice}</div>}
        {section === "resumo" && <div>
          <AdminTitle title="Visão geral" description="Acesse somente as áreas permitidas para o seu perfil administrativo." />
          <div className="metric-grid">
            {canMedia && <Metric label="Publicações" value={posts.length} />}
            {canCalendar && <Metric label="Atividades" value={activities.length} />}
            {canMembers && <Metric label="Membros" value={members.length} />}
            {canMembers && <Metric label="Pendentes" value={members.filter((member) => member.status === "pendente").length} />}
          </div>
          <div className="permission-card"><ShieldCheck /><div><h3>Permissões ativas</h3><p>{allowed.filter((item) => item !== "resumo").join(", ") || "Consulta do painel"}</p></div></div>
        </div>}

        {section === "midias" && canMedia && <div>
          <AdminTitle title="Mídias" description="Crie, edite, publique ou remova postagens da linha do tempo." />
          <form className="admin-form" onSubmit={savePost}>
            <div className="form-grid">
              <div className="field"><label>Título</label><input value={postForm.title} onChange={(event) => setPostForm({ ...postForm, title: event.target.value, slug: slugify(event.target.value) })} required /></div>
              <div className="field"><label>Slug</label><input value={postForm.slug} onChange={(event) => setPostForm({ ...postForm, slug: event.target.value })} required /></div>
              <div className="field"><label>Categoria</label><select value={postForm.category} onChange={(event) => setPostForm({ ...postForm, category: event.target.value })}><option>Treinos</option><option>Eventos</option><option>Encontros</option><option>Comunicados</option></select></div>
              <div className="field"><label>Imagem de capa (URL)</label><input type="url" value={postForm.cover_url} onChange={(event) => setPostForm({ ...postForm, cover_url: event.target.value })} /></div>
              <div className="field field-full"><label>Resumo</label><textarea value={postForm.excerpt} onChange={(event) => setPostForm({ ...postForm, excerpt: event.target.value })} required /></div>
              <div className="field field-full"><label>Conteúdo</label><textarea value={postForm.content} onChange={(event) => setPostForm({ ...postForm, content: event.target.value })} required /></div>
              <label className="check-field"><input type="checkbox" checked={postForm.published} onChange={(event) => setPostForm({ ...postForm, published: event.target.checked })} /> Publicar agora</label>
            </div>
            <div className="form-actions"><button className="button button-primary" type="submit">{editingPost ? "Atualizar" : "Criar publicação"}</button>{editingPost && <button className="button button-ghost" type="button" onClick={() => { setEditingPost(null); setPostForm(emptyPost); }}>Cancelar</button>}</div>
          </form>
          <AdminTable headers={["Publicação", "Categoria", "Situação", "Ações"]}>{posts.map((post) => <tr key={post.id}><td><strong>{post.title}</strong><small>/{post.slug}</small></td><td>{post.category}</td><td><span className={`badge ${post.published ? "aprovado" : "pendente"}`}>{post.published ? "Publicada" : "Rascunho"}</span></td><td className="row-actions"><button title="Editar" onClick={() => { setEditingPost(post.id); setPostForm({ title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content, category: post.category, cover_url: post.cover_url || "", published: post.published }); }}><Edit3 /></button><button title="Excluir" onClick={() => removePost(post.id)}><Trash2 /></button></td></tr>)}</AdminTable>
          <MediaGalleryManager posts={posts} />
        </div>}

        {section === "calendario" && canCalendar && <div>
          <AdminTitle title="Calendário" description="Gerencie atividades e abra a confirmação de presença." />
          <form className="admin-form" onSubmit={saveActivity}>
            <div className="form-grid">
              <div className="field"><label>Atividade</label><input value={activityForm.title} onChange={(event) => setActivityForm({ ...activityForm, title: event.target.value })} required /></div>
              <div className="field"><label>Início</label><input type="datetime-local" value={activityForm.starts_at} onChange={(event) => setActivityForm({ ...activityForm, starts_at: event.target.value })} required /></div>
              <div className="field"><label>Término</label><input type="datetime-local" value={activityForm.ends_at} onChange={(event) => setActivityForm({ ...activityForm, ends_at: event.target.value })} /></div>
              <div className="field"><label>Local</label><input value={activityForm.location} onChange={(event) => setActivityForm({ ...activityForm, location: event.target.value })} required /></div>
              <div className="field"><label>Tipo</label><input value={activityForm.type} onChange={(event) => setActivityForm({ ...activityForm, type: event.target.value })} required /></div>
              <div className="field"><label>Situação</label><select value={activityForm.status} onChange={(event) => setActivityForm({ ...activityForm, status: event.target.value as ActivityStatus })}><option value="confirmado">Confirmado</option><option value="a_definir">A definir</option><option value="adiado">Adiado</option><option value="cancelado">Cancelado</option><option value="finalizado">Finalizado</option></select></div>
              <div className="field field-full"><label>Descrição</label><textarea value={activityForm.description} onChange={(event) => setActivityForm({ ...activityForm, description: event.target.value })} /></div>
              <label className="check-field"><input type="checkbox" checked={activityForm.attendance_open} onChange={(event) => setActivityForm({ ...activityForm, attendance_open: event.target.checked })} /> Permitir confirmação de presença</label>
            </div>
            <div className="form-actions"><button className="button button-primary" type="submit">{editingActivity ? "Atualizar" : "Adicionar ao calendário"}</button>{editingActivity && <button className="button button-ghost" type="button" onClick={() => { setEditingActivity(null); setActivityForm(emptyActivity); }}>Cancelar</button>}</div>
          </form>
          <AdminTable headers={["Atividade", "Data", "Lista", "Situação", "Ações"]}>{activities.map((item) => <tr key={item.id}><td><strong>{item.title}</strong><small>{item.location}</small></td><td>{new Date(item.starts_at).toLocaleString("pt-BR")}</td><td>{item.attendance_open ? "Aberta" : "Fechada"}</td><td><span className={`badge ${item.status}`}>{item.status.replace("_", " ")}</span></td><td className="row-actions"><button title="Editar" onClick={() => { setEditingActivity(item.id); setActivityForm({ title: item.title, starts_at: toDateTimeInput(item.starts_at), ends_at: toDateTimeInput(item.ends_at), location: item.location, type: item.type, status: item.status, description: item.description || "", attendance_open: item.attendance_open ?? true }); }}><Edit3 /></button><button title="Excluir" onClick={() => removeActivity(item.id)}><Trash2 /></button></td></tr>)}</AdminTable>
        </div>}

        {section === "membros" && canMembers && <div>
          <AdminTitle title="Membros" description="Confirme patente, graduação, nível interno e permissões administrativas." />
          {memberForm && <form className="admin-form access-form" onSubmit={saveMemberAccess}>
            <h3>Acessos de {memberForm.full_name}</h3>
            <div className="form-grid">
              <div className="field"><label>Nível interno</label><select value={memberForm.member_kind} onChange={(event) => setMemberForm({ ...memberForm, member_kind: event.target.value as MemberKind })}>{memberKindOptions.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></div>
              <div className="field"><label>Patente</label><select value={memberForm.rank} onChange={(event) => setMemberForm({ ...memberForm, rank: event.target.value as DkRank })}>{rankGroups.map((group) => <optgroup label={group.category} key={group.category}>{group.ranks.map((rank) => <option value={rank.value} key={rank.value}>{rank.label}</option>)}</optgroup>)}</select></div>
              <div className="field"><label>Graduação</label><select value={memberForm.graduation_level} onChange={(event) => setMemberForm({ ...memberForm, graduation_level: event.target.value as GraduationLevel })}>{graduationOptions.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></div>
              <div className="field"><label>Ordem de graduação</label><input value={memberForm.graduation_order} onChange={(event) => setMemberForm({ ...memberForm, graduation_order: event.target.value })} /></div>
            </div>
            {principal && <fieldset className="role-fieldset"><legend>Permissões administrativas</legend>{adminRoleOptions.map((item) => <label className="check-field" key={item.value}><input type="checkbox" checked={(memberRoles[memberForm.id] || []).includes(item.value)} onChange={(event) => toggleAdminRole(memberForm.id, item.value, event.target.checked)} /> {item.label}</label>)}</fieldset>}
            <div className="form-actions"><button className="button button-primary" type="submit">Salvar acessos</button><button className="button button-ghost" type="button" onClick={() => setMemberForm(null)}>Cancelar</button></div>
          </form>}
          <AdminTable headers={["Membro", "Acesso interno", "Patente e graduação", "Situação", "Ações"]}>{members.map((member) => <tr key={member.id}><td><strong>{member.full_name}</strong><small>{member.nickname} • {member.email}</small></td><td><span className="badge graduation">{memberKindLabels[member.member_kind]}</span><small>{principal ? ((memberRoles[member.id] || []).map((role) => `ADM ${role}`).join(", ") || "Sem permissão de ADM") : "ADMs gerenciados pelo Principal"}</small></td><td>{rankLabels[member.rank]}<small>{graduationLabels[member.graduation_level]}{member.graduation_order ? ` • ${member.graduation_order}` : ""}</small></td><td><span className={`badge ${member.status}`}>{member.status}</span></td><td className="row-actions"><button title="Editar acessos" onClick={() => editMember(member)}><Edit3 /></button>{member.status !== "aprovado" && <button title="Aprovar" onClick={() => updateMemberStatus(member.id, "aprovado")}><ShieldCheck /></button>}<button title="Suspender" onClick={() => updateMemberStatus(member.id, "suspenso")}><XCircle /></button><button title="Excluir" onClick={() => deleteMember(member.id)}><Trash2 /></button></td></tr>)}</AdminTable>
        </div>}

        {section === "convites" && canMembers && <div>
          <AdminTitle title="Convites" description="Gere links individuais para novos cadastros." action={<button className="button button-primary" onClick={createInvite}><TicketPlus size={18} /> Gerar convite</button>} />
          <AdminTable headers={["Código", "Validade", "Uso", "Situação", "Ações"]}>{invites.map((invite) => <tr key={invite.id}><td><strong>{invite.code}</strong><small>/area-do-membro/cadastro?convite={invite.code}</small></td><td>{new Date(invite.expires_at).toLocaleDateString("pt-BR")}</td><td>{invite.current_uses}/{invite.max_uses}</td><td><span className={`badge ${invite.active ? "aprovado" : "suspenso"}`}>{invite.active ? "Ativo" : "Inativo"}</span></td><td className="row-actions"><button title="Desativar" onClick={() => disableInvite(invite.id)}><XCircle /></button></td></tr>)}</AdminTable>
        </div>}

        {section === "documentos" && principal && <DocumentManager />}
      </div>
    </section>
  );
}

function AdminNav({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return <button className={active ? "active" : ""} onClick={onClick}>{icon}<span>{label}</span></button>;
}

function AdminTitle({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <div className="admin-title"><div><h2>{title}</h2><p>{description}</p></div>{action}</div>;
}

function Metric({ label, value }: { label: string; value: number }) {
  return <article className="metric-card"><strong>{value}</strong><span>{label}</span></article>;
}

function AdminTable({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return <div className="table-wrap"><table><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}
