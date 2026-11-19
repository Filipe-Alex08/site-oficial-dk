import { NextResponse } from "next/server";
import { forbidden, isSameOriginRequest, notConfigured } from "@/lib/api-guard";
import { logEvent } from "@/lib/app-log";
import { SECURITY_PHRASE_KEY, validateSecurityPhrase } from "@/lib/security-phrase";
import { createClient } from "@/lib/supabase/server";

const NO_STORE = { "cache-control": "no-store" };

// Grava (ou apaga, com texto vazio) a frase de segurança do próprio membro. Ela vai
// para user_metadata, de onde os modelos de e-mail do Auth a leem (lib/security-phrase.ts).
export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return forbidden();

  const supabase = await createClient();
  if (!supabase) return notConfigured();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Faça login para continuar." }, { status: 401, headers: NO_STORE });

  let raw: unknown;
  try {
    raw = (await request.json())?.phrase;
  } catch {
    return NextResponse.json({ error: "Frase inválida." }, { status: 400, headers: NO_STORE });
  }
  const result = validateSecurityPhrase(raw);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400, headers: NO_STORE });

  // null apaga a chave: o GoTrue mescla user_metadata e remove campos nulos.
  const { error } = await supabase.auth.updateUser({ data: { [SECURITY_PHRASE_KEY]: result.phrase } });
  if (error) {
    console.error("Falha ao gravar a frase de segurança", error);
    return NextResponse.json({ error: "Não foi possível salvar a frase agora. Tente novamente." }, { status: 500, headers: NO_STORE });
  }

  logEvent({
    category: "conta",
    action: result.phrase ? "frase_seguranca_definida" : "frase_seguranca_removida",
    message: result.phrase ? "Frase de segurança definida" : "Frase de segurança removida",
    actorId: user.id,
    request,
  });
  return NextResponse.json({ ok: true, phrase: result.phrase ?? "" }, { headers: NO_STORE });
}
