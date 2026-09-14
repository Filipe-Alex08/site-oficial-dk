"use client";

import { CalendarPlus, Edit3, ImagePlus, LayoutDashboard, ShieldCheck, TicketPlus, Trash2, UserCog, XCircle } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Activity, AdminRole, MemberProfile, Post } from "@/lib/types";
import MediaGalleryManager from "@/components/admin/MediaGalleryManager";

type Section = "resumo" | "midias" | "calendario" | "membros" | "convites";
type Invite = { id: string; code: string; expires_at: string; max_uses: number; current_uses: number; active: boolean };

const emptyPost = { title: "", slug: "", excerpt: "", content: "", category: "Treinos", cover_url: "", published: false };
const emptyActivity = { title: "", starts_at: "", location: "", type: "Treino", status: "confirmado", description: "" };

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function AdminDashboard({ roles }: { roles: AdminRole[] }) {
  const supabase = useMemo(() => createClient(), []);
  const principal = roles.includes("principal");
  const canMedia = principal || roles.includes("midias");
  const canCalendar = principal || roles.includes("atividades");
  const canMembers = principal || roles.includes("membros");
  const allowed: Section[] = ["resumo", ...(canMedia ? ["midias" as const] : []), ...(canCalendar ? ["calendario" as const] : []), ...(canMembers ? ["membros" as const, "convites" as const] : [])];

  const [section, setSection] = useState<Section>("resumo");
  const [posts, setPosts] = useState<Post[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [postForm, setPostForm] = useState(emptyPost);
  const [activityForm, setActivityForm] = useState(emptyActivity);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    if (!supabase) return;
    const jobs = [];
    if (canMedia) jobs.push(supabase.from("posts").select("*").order("created_at", { ascending: false }).then(({ data }) => setPosts((data || []) as Post[])));
    if (canCalendar) jobs.push(supabase.from("activities").select("*").order("starts_at").then(({ data }) => setActivities((data || []) as Activity[])));
    if (canMembers) {
      jobs.push(supabase.from("profiles").select("*").order("created_at", { ascending: false }).then(({ data }) => setMembers((data || []) as MemberProfile[])));
      jobs.push(supabase.from("invites").select("*").order("created_at", { ascending: false }).then(({ data }) => setInvites((data || []) as Invite[])));
    }
    await Promise.all(jobs);
  }, [supabase, canMedia, canCalendar, canMembers]);

  useEffect(() => { void load(); }, [load]);

  function show(text: string) { setNotice(text); window.setTimeout(() => setNotice(""), 3200); }

  async function savePost(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    const payload = {
      ...postForm,
      slug: postForm.slug || slugify(postForm.title),
      cover_url: postForm.cover_url || null,
      published_at: new Date().toISOString(),
    };
    const result = editingPost
      ? await supabase.from("posts").update(payload).eq("id", editingPost)
      : await supabase.from("posts").insert(payload);
    if (result.error) return show(result.error.message);
    setPostForm(emptyPost); setEditingPost(null); show("Publicação salva."); await load();
  }

  async function removePost(id: string) {
    if (!supabase || !window.confirm("Excluir esta publicação?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    show(error ? error.message : "Publicação excluída."); await load();
  }

  async function saveActivity(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    const payload = { ...activityForm, starts_at: new Date(activityForm.starts_at).toISOString() };
    const result = editingActivity
      ? await supabase.from("activities").update(payload).eq("id", editingActivity)
      : await supabase.from("activities").insert(payload);
    if (result.error) return show(result.error.message);
    setActivityForm(emptyActivity); setEditingActivity(null); show("Atividade salva."); await load();
  }

  async function removeActivity(id: string) {
    if (!supabase || !window.confirm("Excluir esta atividade?")) return;
    const { error } = await supabase.from("activities").delete().eq("id", id);
    show(error ? error.message : "Atividade excluída."); await load();
  }

  async function updateMember(id: string, status: string) {
    const response = await fetch("/api/admin/members/" + id, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    const result = await response.json(); show(response.ok ? "Cadastro atualizado." : result.error); await load();
  }

  async function deleteMember(id: string) {
    if (!window.confirm("Excluir permanentemente este membro e seu acesso?")) return;
    const response = await fetch("/api/admin/members/" + id, { method: "DELETE" });
    const result = await response.json(); show(response.ok ? "Membro excluído." : result.error); await load();
  }

  async function createInvite() {
    if (!supabase) return;
    const code = "DK-" + crypto.randomUUID().slice(0, 8).toUpperCase();
    const expires = new Date(); expires.setDate(expires.getDate() + 15);
    const { error } = await supabase.from("invites").insert({ code, expires_at: expires.toISOString(), max_uses: 1 });
    show(error ? error.message : "Convite criado."); await load();
  }

  async function disableInvite(id: string) {
    if (!supabase) return;
    const { error } = await supabase.from("invites").update({ active: false }).eq("id", id);
    show(error ? error.message : "Convite desativado."); await load();
  }

  return (
    <section className="admin-shell">
      <aside className="admin-sidebar">
        <div><p className="eyebrow">CMS do DK</p><h1>Administração</h1><p>{roles.map((r) => "ADM " + r).join(" • ")}</p></div>
        <nav>
          <AdminNav icon={<LayoutDashboard />} label="Resumo" active={section === "resumo"} onClick={() => setSection("resumo")} />
          {canMedia && <AdminNav icon={<ImagePlus />} label="Mídias" active={section === "midias"} onClick={() => setSection("midias")} />}
          {canCalendar && <AdminNav icon={<CalendarPlus />} label="Calendário" active={section === "calendario"} onClick={() => setSection("calendario")} />}
          {canMembers && <AdminNav icon={<UserCog />} label="Membros" active={section === "membros"} onClick={() => setSection("membros")} />}
          {canMembers && <AdminNav icon={<TicketPlus />} label="Convites" active={section === "convites"} onClick={() => setSection("convites")} />}
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
            {canMembers && <Metric label="Pendentes" value={members.filter((m) => m.status === "pendente").length} />}
          </div>
          <div className="permission-card"><ShieldCheck /><div><h3>Permissões ativas</h3><p>{allowed.filter((item) => item !== "resumo").join(", ") || "Consulta do painel"}</p></div></div>
        </div>}

        {section === "midias" && canMedia && <div>
          <AdminTitle title="Mídias" description="Crie, edite, publique ou remova postagens da linha do tempo." />
          <form className="admin-form" onSubmit={savePost}>
            <div className="form-grid">
              <div className="field"><label>Título</label><input value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value, slug: slugify(e.target.value) })} required /></div>
              <div className="field"><label>Slug</label><input value={postForm.slug} onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })} required /></div>
              <div className="field"><label>Categoria</label><select value={postForm.category} onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}><option>Treinos</option><option>Eventos</option><option>Encontros</option><option>Comunicados</option></select></div>
              <div className="field"><label>Imagem de capa (URL)</label><input type="url" value={postForm.cover_url} onChange={(e) => setPostForm({ ...postForm, cover_url: e.target.value })} /></div>
              <div className="field field-full"><label>Resumo</label><textarea value={postForm.excerpt} onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })} required /></div>
              <div className="field field-full"><label>Conteúdo</label><textarea value={postForm.content} onChange={(e) => setPostForm({ ...postForm, content: e.target.value })} required /></div>
              <label className="check-field"><input type="checkbox" checked={postForm.published} onChange={(e) => setPostForm({ ...postForm, published: e.target.checked })} /> Publicar agora</label>
            </div>
            <div className="form-actions"><button className="button button-primary" type="submit">{editingPost ? "Atualizar" : "Criar publicação"}</button>{editingPost && <button className="button button-ghost" type="button" onClick={() => { setEditingPost(null); setPostForm(emptyPost); }}>Cancelar</button>}</div>
          </form>
          <AdminTable headers={["Publicação", "Categoria", "Situação", "Ações"]}>{posts.map((post) => <tr key={post.id}><td><strong>{post.title}</strong><small>/{post.slug}</small></td><td>{post.category}</td><td><span className={"badge " + (post.published ? "aprovado" : "pendente")}>{post.published ? "Publicada" : "Rascunho"}</span></td><td className="row-actions"><button onClick={() => { setEditingPost(post.id); setPostForm({ title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content, category: post.category, cover_url: post.cover_url || "", published: post.published }); }}><Edit3 /></button><button onClick={() => removePost(post.id)}><Trash2 /></button></td></tr>)}</AdminTable>
          <MediaGalleryManager posts={posts} />
        </div>}

        {section === "calendario" && canCalendar && <div>
          <AdminTitle title="Calendário" description="Gerencie o cronograma exibido na Página Inicial." />
          <form className="admin-form" onSubmit={saveActivity}>
            <div className="form-grid">
              <div className="field"><label>Atividade</label><input value={activityForm.title} onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })} required /></div>
              <div className="field"><label>Data e horário</label><input type="datetime-local" value={activityForm.starts_at} onChange={(e) => setActivityForm({ ...activityForm, starts_at: e.target.value })} required /></div>
              <div className="field"><label>Local</label><input value={activityForm.location} onChange={(e) => setActivityForm({ ...activityForm, location: e.target.value })} required /></div>
              <div className="field"><label>Tipo</label><input value={activityForm.type} onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })} required /></div>
              <div className="field"><label>Situação</label><select value={activityForm.status} onChange={(e) => setActivityForm({ ...activityForm, status: e.target.value })}><option value="confirmado">Confirmado</option><option value="a_definir">A definir</option><option value="adiado">Adiado</option><option value="cancelado">Cancelado</option><option value="finalizado">Finalizado</option></select></div>
              <div className="field field-full"><label>Descrição</label><textarea value={activityForm.description} onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })} /></div>
            </div>
            <div className="form-actions"><button className="button button-primary" type="submit">{editingActivity ? "Atualizar" : "Adicionar ao calendário"}</button>{editingActivity && <button className="button button-ghost" type="button" onClick={() => { setEditingActivity(null); setActivityForm(emptyActivity); }}>Cancelar</button>}</div>
          </form>
          <AdminTable headers={["Atividade", "Data", "Situação", "Ações"]}>{activities.map((item) => <tr key={item.id}><td><strong>{item.title}</strong><small>{item.location}</small></td><td>{new Date(item.starts_at).toLocaleString("pt-BR")}</td><td><span className={"badge " + item.status}>{item.status.replace("_", " ")}</span></td><td className="row-actions"><button onClick={() => { setEditingActivity(item.id); setActivityForm({ title: item.title, starts_at: item.starts_at.slice(0,16), location: item.location, type: item.type, status: item.status, description: item.description || "" }); }}><Edit3 /></button><button onClick={() => removeActivity(item.id)}><Trash2 /></button></td></tr>)}</AdminTable>
        </div>}

        {section === "membros" && canMembers && <div>
          <AdminTitle title="Membros" description="Aprove cadastros e gerencie o acesso à área interna." />
          <AdminTable headers={["Membro", "Patente e ordem", "Builds", "Situação", "Ações"]}>{members.map((member) => <tr key={member.id}><td><strong>{member.full_name}</strong><small>{member.nickname} • {member.zodiac_sign || "Sem signo"}</small></td><td>{member.rank || "—"}<small>{member.graduation_order || "—"}</small></td><td>{member.primary_build || "—"}<small>{member.secondary_build || "—"}</small></td><td><span className={"badge " + member.status}>{member.status}</span></td><td className="row-actions">{member.status !== "aprovado" && <button title="Aprovar" onClick={() => updateMember(member.id, "aprovado")}><ShieldCheck /></button>}<button title="Suspender" onClick={() => updateMember(member.id, "suspenso")}><XCircle /></button><button title="Excluir" onClick={() => deleteMember(member.id)}><Trash2 /></button></td></tr>)}</AdminTable>
        </div>}

        {section === "convites" && canMembers && <div>
          <AdminTitle title="Convites" description="Gere links individuais para novos cadastros." action={<button className="button button-primary" onClick={createInvite}><TicketPlus size={18} /> Gerar convite</button>} />
          <AdminTable headers={["Código", "Validade", "Uso", "Situação", "Ações"]}>{invites.map((invite) => <tr key={invite.id}><td><strong>{invite.code}</strong><small>/area-do-membro/cadastro?convite={invite.code}</small></td><td>{new Date(invite.expires_at).toLocaleDateString("pt-BR")}</td><td>{invite.current_uses}/{invite.max_uses}</td><td><span className={"badge " + (invite.active ? "aprovado" : "suspenso")}>{invite.active ? "Ativo" : "Inativo"}</span></td><td className="row-actions"><button title="Desativar" onClick={() => disableInvite(invite.id)}><XCircle /></button></td></tr>)}</AdminTable>
        </div>}
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
  return <div className="table-wrap"><table><thead><tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}
