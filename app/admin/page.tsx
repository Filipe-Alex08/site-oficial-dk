import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";
import Unavailable from "@/components/member/Unavailable";
import type { AdminRole } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Administração" };

export default async function AdminPage() {
  const supabase = await createClient();
  if (!supabase) return <Unavailable />;

  const { data: { user } } = await supabase.auth.getUser();
  // O layout também redireciona, mas ele e esta página renderizam em paralelo:
  // sem esta checagem, um acesso sem sessão estoura aqui antes do redirect.
  if (!user) redirect("/area-do-membro/login");

  const [{ data }, { data: canManageAssessments }] = await Promise.all([
    supabase.from("user_admin_roles").select("role").eq("user_id", user.id),
    supabase.rpc("can_manage_assessments"),
  ]);
  const roles = (data?.map((item) => item.role) || []) as AdminRole[];

  return <Suspense fallback={null}><AdminDashboard roles={roles} canManageAssessments={Boolean(canManageAssessments)} currentUserId={user.id} /></Suspense>;
}
