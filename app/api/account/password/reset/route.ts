import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { forbidden, isSameOriginRequest, notConfigured } from "@/lib/api-guard";
import { logEvent } from "@/lib/app-log";
import { validateNewPassword } from "@/lib/account-password";
import { RECOVERY_COOKIE, hasFreshRecovery, hasRecoveryCookie } from "@/lib/password-recovery";
import { createClient } from "@/lib/supabase/server";

const NO_STORE = { "cache-control": "no-store" };

// Define a senha nova SEM pedir a atual, mas só para uma sessão aberta há pouco
// pelo link de "esqueci minha senha" (veja lib/password-recovery.ts). Uma sessão
// comum, mesmo válida, não passa: ela troca a senha em /api/account/password.
export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return forbidden();

  const supabase = await createClient();
  if (!supabase) return notConfigured();

  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  if (!claims?.sub) return NextResponse.json({ error: "Faça login para continuar." }, { status: 401, headers: NO_STORE });
  if (!hasRecoveryCookie(request.headers.get("cookie")) || !hasFreshRecovery(claims.amr)) {
    return NextResponse.json({ error: "Este link de redefinição venceu. Peça um novo." }, { status: 403, headers: NO_STORE });
  }

  let next: unknown;
  try {
    next = (await request.json())?.new_password;
  } catch {
    // Corpo ausente ou inválido: cai na validação abaixo.
  }
  const invalid = validateNewPassword(next);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400, headers: NO_STORE });

  const { error } = await supabase.auth.updateUser({ password: next as string });
  if (error) {
    if (error.code === "same_password") {
      return NextResponse.json({ error: "A nova senha deve ser diferente da atual." }, { status: 400, headers: NO_STORE });
    }
    if (error.code === "weak_password") {
      return NextResponse.json({ error: "Essa senha é fraca demais. Use uma mais longa e menos previsível." }, { status: 400, headers: NO_STORE });
    }
    console.error("Falha ao redefinir a senha", error);
    return NextResponse.json({ error: "Não foi possível redefinir a senha agora. Tente novamente." }, { status: 500, headers: NO_STORE });
  }

  // Quem pediu a redefinição pode ter perdido o controle da senha antiga: as
  // sessões dos outros dispositivos caem; esta continua aberta.
  await supabase.auth.signOut({ scope: "others" }).catch((signOutError) => console.error("Falha ao encerrar outras sessões", signOutError));

  // A marca vale uma vez só.
  try {
    (await cookies()).delete(RECOVERY_COOKIE);
  } catch (cookieError) {
    console.error("Falha ao limpar a marca de recuperação", cookieError);
  }

  logEvent({ category: "conta", action: "senha_redefinida", message: "Senha redefinida pelo link de e-mail", actorId: claims.sub, request });
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
