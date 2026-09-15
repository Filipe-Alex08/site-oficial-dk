import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Banco não configurado." }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/area-do-membro/login", request.url));

  const { id } = await params;
  const { data: document } = await supabase
    .from("documents")
    .select("file_path")
    .eq("id", id)
    .eq("active", true)
    .maybeSingle();

  if (!document) return NextResponse.json({ error: "Documento não encontrado ou sem permissão de acesso." }, { status: 404 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Servidor não configurado." }, { status: 503 });

  const { data, error } = await admin.storage.from("dk-documents").createSignedUrl(document.file_path, 60);
  if (error || !data?.signedUrl) return NextResponse.json({ error: "Não foi possível abrir o documento." }, { status: 400 });

  return NextResponse.redirect(data.signedUrl);
}
