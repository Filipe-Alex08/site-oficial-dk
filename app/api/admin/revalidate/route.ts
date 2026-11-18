import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { forbidden, isSameOriginRequest } from "@/lib/api-guard";

// Chamado pelo painel depois de criar, editar ou remover publicações e mídias:
// as páginas públicas /midias ficam em cache e precisam saber que mudaram.
export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return forbidden();

  const caller = await requireAdmin(["principal", "midias"]);
  if (!caller) return NextResponse.json({ error: "Acesso permitido ao ADM de Mídias." }, { status: 403 });

  revalidatePath("/midias");
  revalidatePath("/midias/[slug]", "page");
  revalidatePath("/sitemap.xml");
  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
