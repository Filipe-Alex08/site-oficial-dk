import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";
import Unavailable from "@/components/member/Unavailable";
import type { AdminRole } from "@/lib/types";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Administração" };

export default async function AdminPage() {
  // Mesma execução do layout (cache() por requisição): sem consultas repetidas.
  const { supabase, user, roles, canManageAssessments, canViewLogs } = await getViewer();
  if (!supabase) return <Unavailable />;

  // O layout também redireciona, mas ele e esta página renderizam em paralelo:
  // sem esta checagem, um acesso sem sessão estoura aqui antes do redirect.
  if (!user) redirect("/area-do-membro/login");

  return <Suspense fallback={null}><AdminDashboard roles={roles as AdminRole[]} canManageAssessments={canManageAssessments} canViewLogs={canViewLogs} currentUserId={user.id} /></Suspense>;
}
