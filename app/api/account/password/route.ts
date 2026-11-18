import { NextResponse } from "next/server";
import { createClient as createStatelessClient } from "@supabase/supabase-js";
import { forbidden, isSameOriginRequest, notConfigured } from "@/lib/api-guard";
import { validatePasswordChange } from "@/lib/account-password";
import { createClient } from "@/lib/supabase/server";

const NO_STORE = { "cache-control": "no-store" };

// Troca de senha do próprio membro. Exige a senha atual: uma sessão roubada
// (computador emprestado, aba esquecida) não basta para tomar a conta.
export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return forbidden();

  const supabase = await createClient();
  if (!supabase) return notConfigured();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user?.email) return NextResponse.json({ error: "Faça login para continuar." }, { status: 401, headers: NO_STORE });

  let current: unknown;
  let next: unknown;
  try {
    const body = await request.json();
    current = body?.current_password;
    next = body?.new_password;
  } catch {
    // Corpo ausente ou inválido: cai na validação abaixo.
  }
  const invalid = validatePasswordChange(current, next);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400, headers: NO_STORE });

  // Confere a senha atual com um cliente sem sessão própria, para não mexer nos
  // cookies desta requisição; a sessão de teste é encerrada em seguida.
  const verifier = createStatelessClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: verifyError } = await verifier.auth.signInWithPassword({ email: user.email, password: current as string });
  if (verifyError) {
    if (verifyError.status === 429) {
      return NextResponse.json({ error: "Muitas tentativas. Aguarde alguns minutos e tente de novo." }, { status: 429, headers: NO_STORE });
    }
    return NextResponse.json({ error: "Senha atual incorreta." }, { status: 400, headers: NO_STORE });
  }
  // scope "local": o padrão do signOut é "global", que apagaria TODAS as sessões do
  // membro, inclusive a do cookie desta requisição, e o updateUser abaixo falharia.
  await verifier.auth.signOut({ scope: "local" }).catch(() => undefined);

  const { error: updateError } = await supabase.auth.updateUser({ password: next as string });
  if (updateError) {
    if (updateError.code === "same_password") {
      return NextResponse.json({ error: "A nova senha deve ser diferente da atual." }, { status: 400, headers: NO_STORE });
    }
    if (updateError.code === "weak_password") {
      return NextResponse.json({ error: "Essa senha é fraca demais. Use uma mais longa e menos previsível." }, { status: 400, headers: NO_STORE });
    }
    console.error("Falha ao trocar a senha", updateError);
    return NextResponse.json({ error: "Não foi possível trocar a senha agora. Tente novamente." }, { status: 500, headers: NO_STORE });
  }

  // Encerra as sessões dos OUTROS dispositivos; esta continua aberta.
  await supabase.auth.signOut({ scope: "others" }).catch((error) => console.error("Falha ao encerrar outras sessões", error));

  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
