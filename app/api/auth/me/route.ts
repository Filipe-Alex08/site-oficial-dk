import { NextResponse } from "next/server";
import { forbidden, isSameOriginRequest } from "@/lib/api-guard";
import { createClient } from "@/lib/supabase/server";

// Quem está logado, para as telas que só precisam do id e do e-mail. O token
// continua no cookie HttpOnly: ele nunca aparece nesta resposta.
export async function GET(request: Request) {
  if (!isSameOriginRequest(request)) return forbidden();

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ user: null }, { headers: { "cache-control": "no-store" } });

  const { data: { user } } = await supabase.auth.getUser();

  return NextResponse.json(
    { user: user ? { id: user.id, email: user.email ?? "" } : null },
    { headers: { "cache-control": "no-store" } },
  );
}
