import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  const caller = await requireAdmin(["principal", "midias"]);
  if (!caller) return NextResponse.json({ error: "Acesso não autorizado." }, { status: 403 });

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
    console.error("Falha ao consultar a Apify", error);
    return NextResponse.json({ error: "Falha ao consultar a Apify." }, { status: 502 });
  }
}