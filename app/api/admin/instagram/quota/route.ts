import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  if (!user) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
  const { data: roles } = await supabase!.from("user_admin_roles").select("role").eq("user_id", user.id).in("role", ["principal", "midias"]);
  if (!roles?.length) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });
  const token = process.env.APIFY_TOKEN;
  if (!token) return NextResponse.json({ error: "Token Apify não configurado." }, { status: 503 });
  try {
    const response = await fetch("https://api.apify.com/v2/users/me/limits", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!response.ok) throw new Error(`Apify respondeu com status ${response.status}.`);
    const payload = await response.json();
    const data = payload.data ?? payload;
    const used = Number(data.current?.monthlyUsageUsd ?? 0);
    const limit = Number(data.limits?.maxMonthlyUsageUsd ?? 0);
    return NextResponse.json({ used, limit, start: data.monthlyUsageCycle?.startAt ?? data.usageCycle?.startAt ?? null, end: data.monthlyUsageCycle?.endAt ?? data.usageCycle?.endAt ?? null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Falha ao consultar a Apify." }, { status: 502 });
  }
}
