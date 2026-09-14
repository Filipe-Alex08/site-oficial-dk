import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  if (!supabase) return children;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/area-do-membro/login");

  const { data: profile } = await supabase.from("profiles").select("status").eq("id", user.id).single();
  if (profile?.status !== "aprovado") redirect("/area-do-membro/login");

  const { data: roles } = await supabase.from("user_admin_roles").select("role").eq("user_id", user.id);
  if (!roles?.length) redirect("/membro");

  return children;
}
