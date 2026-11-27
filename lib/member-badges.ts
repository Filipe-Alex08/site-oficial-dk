import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getNotesSettings } from "@/lib/notes-settings";
import { getViewer } from "@/lib/viewer";

/**
 * Pendências do próprio membro (e, para quem administra, da fila de cadastros).
 * Calculado uma vez por requisição: o layout (barra de navegação) e a página
 * inicial usam o mesmo resultado. Só o que exige uma ação aparece aqui.
 */
export const getMemberBadges = cache(async () => {
  const { supabase, user, roles, canManageAssessments, canViewLogs } = await getViewer();
  const isAdmin = roles.length > 0 || canManageAssessments || canViewLogs;
  const empty = { isAdmin, activitiesToAnswer: 0, assessmentsToTake: 0, membersToReview: 0, notesUnread: 0, notesEnabled: true };
  if (!supabase || !user) return empty;

  // Nenhuma das consultas depende das outras: todas partem ao mesmo tempo.
  const nowIso = new Date().toISOString();
  const managesMembers = roles.includes("principal") || roles.includes("membros");
  const admin = createAdminClient();
  const [{ data: openActivities }, { data: myResponses }, assignmentsResult, { data: reviewRows }, unreadNotesResult, notesSettings] = await Promise.all([
    supabase.from("activities").select("id").gte("starts_at", nowIso).eq("attendance_open", true).neq("status", "cancelado"),
    supabase.from("activity_attendance").select("activity_id").eq("user_id", user.id),
    admin
      ? admin.from("assessment_assignments").select("id", { count: "exact", head: true }).eq("member_id", user.id).in("status", ["convidado", "em_andamento"]).or(`expires_at.is.null,expires_at.gt.${nowIso}`)
      : Promise.resolve({ count: 0 }),
    managesMembers
      ? supabase.from("profiles").select("id,status,access_request_id,graduation_review_needed").or("status.eq.pendente,access_request_id.not.is.null,graduation_review_needed.eq.true")
      : Promise.resolve({ data: [] as { id: string; status: string; access_request_id: string | null; graduation_review_needed: boolean | null }[] }),
    // Anotações recebidas e ainda não lidas (o RLS limita ao destinatário). Sem a migração 025, vem vazio.
    supabase.from("member_notes").select("id", { count: "exact", head: true }).eq("recipient_id", user.id).is("read_at", null),
    getNotesSettings(),
  ]);
  const answered = new Set((myResponses ?? []).map((row) => row.activity_id as string));
  // Mesma regra da aba Membros do painel administrativo.
  const isPrincipal = roles.includes("principal");
  return {
    isAdmin,
    activitiesToAnswer: (openActivities ?? []).filter((activity) => !answered.has(activity.id as string)).length,
    assessmentsToTake: assignmentsResult.count ?? 0,
    // Sistema desligado: sem item no menu e sem pendência.
    notesUnread: notesSettings.enabled ? (unreadNotesResult.count ?? 0) : 0,
    notesEnabled: notesSettings.enabled,
    membersToReview: (reviewRows ?? []).filter((row) =>
      row.status === "pendente" || (Boolean(row.access_request_id) && row.id !== user.id) || (Boolean(row.graduation_review_needed) && (isPrincipal || row.id !== user.id)),
    ).length,
  };
});
