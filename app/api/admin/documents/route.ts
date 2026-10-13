import { NextResponse } from "next/server";
import { graduationOptions, rankOptions } from "@/lib/member-access";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function authorizeDocumentAdmin() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("user_admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .in("role", ["principal", "membros"])
    .limit(1);
  return data?.length ? user : null;
}

export async function POST(request: Request) {
  const user = await authorizeDocumentAdmin();
  if (!user) return NextResponse.json({ error: "Acesso permitido ao ADM Principal ou ADM de Membros." }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Servidor não configurado." }, { status: 503 });

  try {
    const form = await request.formData();
    const file = form.get("file");
    const title = String(form.get("title") || "").trim();
    const description = String(form.get("description") || "").trim() || null;
    const accessLogic = String(form.get("access_logic") || "or");
    const rawRules = String(form.get("access_rules") || "[]");
    const rules: unknown = JSON.parse(rawRules);

    if (!title || !(file instanceof File)) {
      return NextResponse.json({ error: "Informe o título e selecione um PDF." }, { status: 400 });
    }
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "O PDF deve ter no máximo 20 MB." }, { status: 400 });
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Somente arquivos PDF são permitidos." }, { status: 400 });
    }
    if (!Array.isArray(rules) || !["and", "or"].includes(accessLogic) || rules.length > 20) {
      return NextResponse.json({ error: "Regras de acesso inválidas." }, { status: 400 });
    }
    for (const [index, rule] of (rules as Array<Record<string, unknown>>).entries()) {
      const validRank = rule.kind === "rank" && rankOptions.some((item) => item.value === rule.minimum_rank);
      const validGraduation = rule.kind === "graduation" && ["cavalaria", "arquearia"].includes(String(rule.track)) && graduationOptions.some((item) => item.value === rule.minimum_graduation && item.value !== "sem_graduacao");
      const validJoin = index === 0 || ["and", "or"].includes(String(rule.join));
      if ((!validRank && !validGraduation) || !validJoin) return NextResponse.json({ error: "Uma regra de acesso contém valores inválidos." }, { status: 400 });
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
      audience: "todos",
      minimum_rank: null,
      minimum_graduation: null,
      access_logic: accessLogic,
      access_rules: rules,
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
