import { privateRobots } from "@/lib/seo";
export const metadata = { robots: privateRobots };
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import AdminProviders from "@/components/admin/AdminProviders";
import { getViewer } from "@/lib/viewer";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { supabase, user, profile, roles, canManageAssessments, canViewLogs } = await getViewer();
  if (!supabase) return <div className="app-area">{children}</div>;

  if (!user) redirect("/area-do-membro/login");
  if (profile?.status !== "aprovado") redirect("/area-do-membro/login");
  if (!roles.length && !canManageAssessments && !canViewLogs) redirect("/membro");

  return <div className="app-area"><AdminProviders>{children}</AdminProviders></div>;
}
