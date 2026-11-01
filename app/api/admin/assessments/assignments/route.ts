import { NextResponse } from "next/server";
import { randomInt } from "node:crypto";
import { requireAssessmentManager } from "@/lib/assessment-server";
import { uniqueStrings } from "@/lib/assessments";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function shuffled<T>(values: T[]) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index--) {
    const target = randomInt(index + 1);
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

export async function POST(request: Request) {
  const actor = await requireAssessmentManager();
  if (!actor) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || !uuid.test(String(body.assessment_id ?? ""))) return NextResponse.json({ error: "Avaliação inválida." }, { status: 400 });
  const memberIds = uniqueStrings(body.member_ids);
  if (!memberIds.length || memberIds.length > 50 || memberIds.some((id) => !uuid.test(id))) {
    return NextResponse.json({ error: "Selecione de 1 a 50 integrantes válidos." }, { status: 400 });
  }
  const expiresAt = body.expires_at ? new Date(String(body.expires_at)) : null;
  if (expiresAt && (!Number.isFinite(expiresAt.getTime()) || expiresAt <= new Date())) {
    return NextResponse.json({ error: "A data limite precisa estar no futuro." }, { status: 400 });
  }

  const assessmentId = String(body.assessment_id);
  const [{ data: assessment }, { data: members }, { data: itemPool, error: poolError }] = await Promise.all([
    actor.admin.from("assessments").select("id,status,title,question_count,selection_mode").eq("id", assessmentId).maybeSingle(),
    actor.admin.from("profiles").select("id,nickname,status").in("id", memberIds).eq("status", "aprovado"),
    actor.admin.from("assessment_items").select("id,sort_order").eq("assessment_id", assessmentId).order("sort_order"),
  ]);
  if (!assessment || assessment.status !== "publicado") return NextResponse.json({ error: "A avaliação precisa estar publicada." }, { status: 400 });
  if (!members || members.length !== memberIds.length) return NextResponse.json({ error: "Um dos integrantes não está aprovado." }, { status: 400 });
  if (poolError || !itemPool || itemPool.length < Number(assessment.question_count)) {
    return NextResponse.json({ error: "O banco congelado desta avaliação não possui questões suficientes." }, { status: 400 });
  }

  const rows = memberIds.map((memberId) => ({
    assessment_id: assessmentId,
    member_id: memberId,
    indication_number: 1,
    assigned_by: actor.user.id,
    expires_at: expiresAt?.toISOString() ?? null,
  }));
  const { data: assignments, error } = await actor.admin.from("assessment_assignments").insert(rows).select("*");
  if (error || !assignments) return NextResponse.json({ error: "Não foi possível criar as indicações." }, { status: 400 });

  const questionCount = Number(assessment.question_count);
  const assignmentItems = assignments.flatMap((assignment) => {
    const selectedItems = assessment.selection_mode === "sorteio_individual"
      ? shuffled(itemPool).slice(0, questionCount)
      : itemPool.slice(0, questionCount);
    return selectedItems.map((item, index) => ({
      assignment_id: assignment.id,
      item_id: item.id,
      sort_order: index + 1,
    }));
  });
  const { error: itemError } = await actor.admin.from("assessment_assignment_items").insert(assignmentItems);
  if (itemError) {
    await actor.admin.from("assessment_assignments").delete().in("id", assignments.map((assignment) => assignment.id));
    return NextResponse.json({ error: "Não foi possível sortear e vincular as questões às indicações." }, { status: 400 });
  }

  await actor.admin.from("assessment_audit_log").insert(assignments.map((assignment) => ({
    action: "indicacao_criada",
    actor_id: actor.user.id,
    subject_user_id: assignment.member_id,
    assessment_id: assessmentId,
    assignment_id: assignment.id,
    details: {
      indication_number: assignment.indication_number,
      question_count: questionCount,
      selection_mode: assessment.selection_mode,
    },
  })));

  return NextResponse.json({
    assignments: assignments.map((assignment) => ({ ...assignment, path: `/membro/simulados/${assignment.access_token}` })),
  }, { status: 201 });
}
