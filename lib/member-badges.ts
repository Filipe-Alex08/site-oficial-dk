import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getViewer } from "@/lib/viewer";

/**
 * Pendências do próprio membro (e, para quem administra, da fila de cadastros).
 * Calculado uma vez por requisição: o layout (barra de navegação) e a página
 * inicial usam o mesmo resultado. Só o que exige uma ação aparece aqui.
 */
export const getMemberBadges = cache(async () => {
  const { supabase, user, roles, canManageAssessments, canViewLogs } = await getViewer();
  const isAdmin = roles.length > 0 || canManageAssessments || canViewLogs;
  const empty = { isAdmin, activitiesToAnswer: 0, assessmentsToTake: 0, membersToReview: 0 };
  if (!supabase || !user) return empty;

  // Nenhuma das consultas depende das outras: todas partem ao mesmo tempo.
  const nowIso = new Date().toISOString();
  const managesMembers = roles.includes("principal") || roles.includes("membros");
  const admin = createAdminClient();
  const [{ data: openActivities }, { data: myResponses }, assignmentsResult, { data: reviewRows }] = await Promise.all([
    supabase.from("activities").select("id").gte("starts_at", nowIso).eq("attendance_open", true).neq("status", "cancelado"),
    supabase.from("activity_attendance").select("activity_id").eq("user_id", user.id),
    admin
      ? admin.from("assessment_assignments").select("id", { count: "exact", head: true }).eq("member_id", user.id).in("status", ["convidado", "em_andamento"]).or(`expires_at.is.null,expires_at.gt.${nowIso}`)
      : Promise.resolve({ count: 0 }),
    managesMembers
      ? supabase.from("profiles").select("id,status,access_request_id,graduation_review_needed").or("status.eq.pendente,access_request_id.not.is.null,graduation_review_needed.eq.true")
      : Promise.resolve({ data: [] as { id: string; status: string; access_request_id: string | null; graduation_review_needed: boolean | null }[] }),
  ]);
  const answered = new Set((myResponses ?? []).map((row) => row.activity_id as string));
  // Mesma regra da aba Membros do painel administrativo.
  const isPrincipal = roles.includes("principal");
  return {
    isAdmin,
    activitiesToAnswer: (openActivities ?? []).filter((activity) => !answered.has(activity.id as string)).length,
    assessmentsToTake: assignmentsResult.count ?? 0,
    membersToReview: (reviewRows ?? []).filter((row) =>
      row.status === "pendente" || (Boolean(row.access_request_id) && row.id !== user.id) || (isPrincipal && Boolean(row.graduation_review_needed)),
    ).length,
  };
});
