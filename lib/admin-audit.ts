import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Best-effort administrative audit trail. The audit table is service-role only.
 * A failed audit insert must never undo or block the administrative action.
 */
export async function logAdminAudit(
  actorId: string,
  targetTable: string,
  targetId: string,
  action: string,
  details: Record<string, unknown>,
) {
  const admin = createAdminClient();
  if (!admin) return;

  const { error } = await admin.from("admin_audit_log").insert({
    actor_id: actorId,
    action,
    target_table: targetTable,
    target_id: targetId,
    details,
  });

  if (error) console.error("Falha ao registrar auditoria administrativa", error);
}