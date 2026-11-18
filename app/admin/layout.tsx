import { privateRobots } from "@/lib/seo";
export const metadata = { robots: privateRobots };
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  if (!supabase) return <div className="app-area">{children}</div>;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/area-do-membro/login");

  const { data: profile } = await supabase.from("profiles").select("status").eq("id", user.id).single();
  if (profile?.status !== "aprovado") redirect("/area-do-membro/login");

  const [{ data: roles }, { data: canManageAssessments }, { data: canViewLogs }] = await Promise.all([
    supabase.from("user_admin_roles").select("role").eq("user_id", user.id),
    supabase.rpc("can_manage_assessments"),
    supabase.rpc("can_view_logs"),
  ]);
  if (!roles?.length && !canManageAssessments && !canViewLogs) redirect("/membro");

  return <div className="app-area">{children}</div>;
}
