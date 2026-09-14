import type { Metadata } from "next";
import AdminDashboard from "@/components/admin/AdminDashboard";
import PageHero from "@/components/PageHero";
import type { AdminRole } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Administração" };

export default async function AdminPage() {
  const supabase = await createClient();
  if (!supabase) {
    return (
      <>
        <PageHero eyebrow="CMS" title="Painel administrativo" description="Configure o Supabase para ativar o gerenciamento do site." />
        <section className="section"><div className="container info-band"><strong>Banco ainda não conectado</strong><p>Siga o guia em docs/SETUP.md.</p></div></section>
      </>
    );
  }

  const { data: { user } } = await supabase.auth.getUser();
  const { data } = await supabase.from("user_admin_roles").select("role").eq("user_id", user!.id);
  const roles = (data?.map((item) => item.role) || []) as AdminRole[];

  return <AdminDashboard roles={roles} />;
}
