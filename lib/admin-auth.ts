import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { AdminRole } from "@/lib/types";

export type AdminSession = { user: User; roles: AdminRole[]; isPrincipal: boolean };

/**
 * Single entry point for admin API authorization.
 *
 * A profile that is not `aprovado` loses every admin capability immediately,
 * even if a stale `user_admin_roles` row still exists (or the user still holds
 * a valid Supabase session). `principal` always passes, matching `has_admin_role`.
 */
export async function requireAdmin(required: AdminRole[]): Promise<AdminSession | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: roleRows }] = await Promise.all([
    supabase.from("profiles").select("status").eq("id", user.id).maybeSingle(),
    supabase.from("user_admin_roles").select("role").eq("user_id", user.id),
  ]);

  if (profile?.status !== "aprovado") return null;

  const roles = (roleRows ?? []).map((row) => row.role as AdminRole);
  const isPrincipal = roles.includes("principal");
  if (!isPrincipal && !roles.some((role) => required.includes(role))) return null;

  return { user, roles, isPrincipal };
}