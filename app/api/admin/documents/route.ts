import { NextResponse } from "next/server";
import { documentAudienceOptions, graduationOptions, rankOptions } from "@/lib/member-access";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function authorizePrincipal() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("user_admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "principal")
    .maybeSingle();
  return data ? user : null;
}

export async function POST(request: Request) {
  const user = await authorizePrincipal();
  if (!user) return NextResponse.json({ error: "Acesso permitido somente ao ADM Principal." }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Servidor não configurado." }, { status: 503 });

  try {
    const form = await request.formData();
    const file = form.get("file");
    const title = String(form.get("title") || "").trim();
    const description = String(form.get("description") || "").trim() || null;
    const audience = String(form.get("audience") || "todos");
    const minimumRank = String(form.get("minimum_rank") || "") || null;
    const minimumGraduation = String(form.get("minimum_graduation") || "") || null;

    if (!title || !(file instanceof File)) {
      return NextResponse.json({ error: "Informe o título e selecione um PDF." }, { status: 400 });
    }
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "O PDF deve ter no máximo 20 MB." }, { status: 400 });
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Somente arquivos PDF são permitidos." }, { status: 400 });
    }
    if (!documentAudienceOptions.some((item) => item.value === audience)) {
      return NextResponse.json({ error: "Público do documento inválido." }, { status: 400 });
    }
    if (audience === "oficiais" && !rankOptions.some((item) => item.value === minimumRank)) {
      return NextResponse.json({ error: "Informe a patente mínima." }, { status: 400 });
    }
    if (audience === "graduacao" && !graduationOptions.some((item) => item.value === minimumGraduation && item.value !== "sem_graduacao")) {
      return NextResponse.json({ error: "Informe a graduação mínima." }, { status: 400 });
    }

    const filePath = `${crypto.randomUUID()}.pdf`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await admin.storage
      .from("dk-documents")
      .upload(filePath, fileBuffer, { contentType: "application/pdf", upsert: false });

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 400 });

    const { error: insertError } = await admin.from("documents").insert({
      title,
      description,
      file_name: file.name,
      file_path: filePath,
      audience,
      minimum_rank: audience === "oficiais" ? minimumRank : null,
      minimum_graduation: audience === "graduacao" ? minimumGraduation : null,
      created_by: user.id,
    });

    if (insertError) {
      await admin.storage.from("dk-documents").remove([filePath]);
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Não foi possível processar o documento." }, { status: 400 });
  }
}
