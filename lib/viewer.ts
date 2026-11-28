import { cache } from "react";
import type { MemberProfile } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

// Quem está vendo a página, calculado uma única vez por requisição.
//
// Layout e página renderizam em paralelo e, antes, cada um repetia getUser e as
// consultas de perfil e papéis. Com cache() do React, todas as chamadas dentro
// da mesma renderização compartilham a mesma Promise.

// Um único cliente por requisição: duas instâncias lendo o mesmo cookie poderiam
// renovar o refresh token em paralelo e invalidar a sessão uma da outra.
export const getSupabase = cache(() => createClient());

// getUser é a ida mais cara (consulta o servidor de Auth): uma só por requisição.
export const getAuth = cache(async () => {
  const supabase = await getSupabase();
  if (!supabase) return { supabase: null, user: null };
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
});

// Usuário + perfil, para as páginas que só precisam saber se o membro é aprovado.
export const getMember = cache(async () => {
  const { supabase, user } = await getAuth();
  if (!supabase || !user) return { supabase, user, profile: null as MemberProfile | null };
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return { supabase, user, profile: (data ?? null) as MemberProfile | null };
});

// Usuário + perfil + papéis administrativos e permissões, tudo em paralelo.
export const getViewer = cache(async () => {
  const { supabase, user } = await getAuth();
  if (!supabase || !user) {
    return { supabase, user, profile: null as MemberProfile | null, roles: [] as string[], canManageAssessments: false, canViewLogs: false };
  }

  const [{ data: profileData }, { data: roleData }, { data: canViewLogs }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("user_admin_roles").select("role").eq("user_id", user.id),
    supabase.rpc("can_view_logs"),
  ]);

  const profile = (profileData ?? null) as MemberProfile | null;
  const roles = (roleData ?? []).map((item) => item.role as string);
  return {
    supabase,
    user,
    profile,
    roles,
    canManageAssessments: profile?.status === "aprovado" && (roles.includes("principal") || roles.includes("gestao")),
    canViewLogs: Boolean(canViewLogs),
  };
});
