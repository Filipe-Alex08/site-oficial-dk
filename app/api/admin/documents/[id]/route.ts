import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function authorizePrincipal() {
  const supabase = await createClient();
  if (!supabase) return false;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("user_admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "principal")
    .maybeSingle();
  return Boolean(data);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await authorizePrincipal())) {
    return NextResponse.json({ error: "Acesso permitido somente ao ADM Principal." }, { status: 403 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Servidor não configurado." }, { status: 503 });

  const { id } = await params;
  const { data: document, error: readError } = await admin
    .from("documents")
    .select("file_path")
    .eq("id", id)
    .single();

  if (readError || !document) return NextResponse.json({ error: "Documento não encontrado." }, { status: 404 });

  const { error: deleteError } = await admin.from("documents").delete().eq("id", id);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 400 });

  await admin.storage.from("dk-documents").remove([document.file_path]);
  return NextResponse.json({ success: true });
}
