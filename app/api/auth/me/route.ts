import { NextResponse } from "next/server";
import { forbidden, isSameOriginRequest } from "@/lib/api-guard";
import { MAX_SAVED_ACCOUNTS, withoutActive } from "@/lib/account-vault";
import { readVault, toClientAccounts, writeVault } from "@/lib/account-switch";
import { getViewer } from "@/lib/viewer";

const NO_STORE = { "cache-control": "no-store" };

// Tudo o que o cabeçalho precisa saber sobre quem está logado, numa só resposta:
// conta, perfil, papéis, permissões e contas salvas neste navegador. Antes eram
// seis chamadas em duas etapas a cada carregamento. O token continua no cookie
// HttpOnly: ele nunca aparece nesta resposta, e o perfil devolvido é o do próprio
// usuário (o mesmo que ele já lia pelo proxy do banco).
export async function GET(request: Request) {
  if (!isSameOriginRequest(request)) return forbidden();

  const { supabase, user, profile, roles, canManageAssessments, canViewLogs } = await getViewer();
  if (!supabase || !user) return NextResponse.json({ user: null }, { headers: NO_STORE });

  const avatarUrl = profile?.avatar_path
    ? supabase.storage.from("profile-avatars").getPublicUrl(profile.avatar_path).data.publicUrl
    : null;

  // A conta ativa não pode ficar no cofre (veja lib/account-vault.ts).
  const vault = await readVault();
  const saved = withoutActive(vault, user.id);
  if (saved.length !== vault.length) await writeVault(saved);

  return NextResponse.json(
    {
      user: { id: user.id, email: user.email ?? "" },
      profile,
      roles,
      canManageAssessments,
      canViewLogs,
      avatarUrl,
      accounts: toClientAccounts(saved),
      max: MAX_SAVED_ACCOUNTS,
    },
    { headers: NO_STORE },
  );
}
