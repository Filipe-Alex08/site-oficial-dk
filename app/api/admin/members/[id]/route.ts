import { NextResponse } from "next/server";
import { logAdminAudit } from "@/lib/admin-audit";
import { requireAdmin } from "@/lib/admin-auth";
import { graduationOptions, memberKindOptions, rankOptions } from "@/lib/member-access";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminRole } from "@/lib/types";

const ALLOWED_STATUSES = ["pendente", "aprovado", "recusado", "suspenso", "desativado"] as const;
type MemberStatus = (typeof ALLOWED_STATUSES)[number];

const GRADUATION_TRACK_FIELDS = ["graduation_cavalaria", "graduation_arquearia"] as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const caller = await requireAdmin(["principal", "membros"]);
  if (!caller) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Servidor não configurado." }, { status: 503 });

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("invalid_body");
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const [{ data: target }, { data: roleRows }] = await Promise.all([
    admin
      .from("profiles")
      .select("id, full_name, nickname, status, rank, graduation_cavalaria, graduation_arquearia, access_request_id, requested_rank, requested_graduation_cavalaria, requested_graduation_arquearia")
      .eq("id", id)
      .maybeSingle(),
    admin.from("user_admin_roles").select("role").eq("user_id", id),
  ]);

  if (!target) return NextResponse.json({ error: "Membro não encontrado." }, { status: 404 });

  const targetRoles = (roleRows ?? []).map((row) => row.role as AdminRole);
  const targetIsPrincipal = targetRoles.includes("principal");
  const targetIsAdmin = targetRoles.length > 0;
  const isSelf = id === caller.user.id;

  // A membros admin may manage regular members, but never another administrator.
  if (targetIsAdmin && !caller.isPrincipal) {
    return NextResponse.json({ error: "Somente o ADM Principal pode alterar outro administrador." }, { status: 403 });
  }
  // Non-principal admins cannot change their own access (self-escalation).
  if (isSelf && !caller.isPrincipal) {
    return NextResponse.json({ error: "Você não pode alterar os próprios acessos." }, { status: 403 });
  }

  const requestAction = body.access_request_action;
  if (requestAction !== undefined) {
    if (requestAction !== "approve" && requestAction !== "reject") {
      return NextResponse.json({ error: "Solicitação inválida." }, { status: 400 });
    }
    if (isSelf) {
      return NextResponse.json({ error: "Você não pode analisar a própria solicitação." }, { status: 403 });
    }
    const requestId = body.access_request_id;
    if (typeof requestId !== "string") {
      return NextResponse.json({ error: "Solicitação inválida." }, { status: 400 });
    }

    const changes = {
      ...(requestAction === "approve"
        ? {
            rank: target.requested_rank,
            // Trilha sem valor pedido continua como está.
            graduation_cavalaria: target.requested_graduation_cavalaria ?? target.graduation_cavalaria,
            graduation_arquearia: target.requested_graduation_arquearia ?? target.graduation_arquearia,
          }
        : {}),
      access_request_id: null,
      requested_rank: null,
      requested_graduation_cavalaria: null,
      requested_graduation_arquearia: null,
    };

    const { data, error } = await admin
      .from("profiles")
      .update(changes)
      .eq("id", id)
      .eq("access_request_id", requestId)
      .select("id");

    if (error) {
      console.error("Falha ao analisar solicitação de acesso", error);
      return NextResponse.json({ error: "Não foi possível analisar a solicitação." }, { status: 400 });
    }
    if (!data?.length) {
      return NextResponse.json({ error: "Solicitação alterada. Atualize a lista." }, { status: 409 });
    }

    await logAdminAudit(caller.user.id, "profiles", id, `access_request_${requestAction}`, {
      request_id: requestId,
    });
    return NextResponse.json({ success: true });
  }

  const update: Record<string, string> = {};

  const status = body.status;
  if (status !== undefined) {
    if (!ALLOWED_STATUSES.includes(status as MemberStatus)) {
      return NextResponse.json({ error: "Situação inválida." }, { status: 400 });
    }
    if (targetIsPrincipal) {
      return NextResponse.json({ error: "A situação do ADM Principal não pode ser alterada aqui." }, { status: 403 });
    }
    if (isSelf) {
      return NextResponse.json({ error: "Você não pode alterar a própria situação." }, { status: 403 });
    }
    update.status = status as string;
  }

  const memberKind = body.member_kind;
  if (memberKind !== undefined) {
    if (!memberKindOptions.some((item) => item.value === memberKind)) {
      return NextResponse.json({ error: "Tipo de membro inválido." }, { status: 400 });
    }
    update.member_kind = memberKind as string;
  }

  const rank = body.rank;
  if (rank !== undefined) {
    if (!caller.isPrincipal) {
      return NextResponse.json({ error: "Somente o ADM Principal altera patente e graduação." }, { status: 403 });
    }
    if (!rankOptions.some((item) => item.value === rank)) {
      return NextResponse.json({ error: "Patente inválida." }, { status: 400 });
    }
    update.rank = rank as string;
  }

  for (const field of GRADUATION_TRACK_FIELDS) {
    const level = body[field];
    if (level === undefined) continue;
    if (!caller.isPrincipal) {
      return NextResponse.json({ error: "Somente o ADM Principal altera patente e graduação." }, { status: 403 });
    }
    if (!graduationOptions.some((item) => item.value === level)) {
      return NextResponse.json({ error: "Graduação inválida." }, { status: 400 });
    }
    update[field] = level as string;
  }

  if (!Object.keys(update).length) {
    return NextResponse.json({ error: "Nenhuma alteração informada." }, { status: 400 });
  }

  const { error } = await admin.from("profiles").update(update).eq("id", id);
  if (error) {
    console.error("Falha ao atualizar membro", error);
    return NextResponse.json({ error: "Não foi possível atualizar o cadastro." }, { status: 400 });
  }

  await logAdminAudit(caller.user.id, "profiles", id, "update", { changes: update });
  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const caller = await requireAdmin(["principal", "membros"]);
  if (!caller) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Servidor não configurado." }, { status: 503 });

  const { id } = await params;
  const [{ data: target }, { data: roleRows }] = await Promise.all([
    admin.from("profiles").select("id, full_name, nickname, status").eq("id", id).maybeSingle(),
    admin.from("user_admin_roles").select("role").eq("user_id", id),
  ]);

  if (!target) return NextResponse.json({ error: "Membro não encontrado." }, { status: 404 });

  const targetRoles = (roleRows ?? []).map((row) => row.role as AdminRole);

  if (id === caller.user.id) {
    return NextResponse.json({ error: "Você não pode excluir a própria conta." }, { status: 403 });
  }
  if (targetRoles.includes("principal")) {
    return NextResponse.json({ error: "O ADM Principal não pode ser excluído; transfira o papel primeiro." }, { status: 403 });
  }
  if (targetRoles.length && !caller.isPrincipal) {
    return NextResponse.json({ error: "Somente o ADM Principal pode excluir outro administrador." }, { status: 403 });
  }

  await logAdminAudit(caller.user.id, "profiles", id, "delete", { profile: target });

  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) {
    console.error("Falha ao excluir membro", error);
    return NextResponse.json({ error: "Não foi possível excluir o membro." }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}