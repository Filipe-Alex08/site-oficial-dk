import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isGeneralAssessmentRank } from "@/lib/assessments";
import type { DkRank, MemberProfile } from "@/lib/types";

export type AssessmentActor = {
  user: User;
  profile: MemberProfile;
  admin: NonNullable<ReturnType<typeof createAdminClient>>;
  canManage: boolean;
  canDelegate: boolean;
};

export async function getApprovedAssessmentActor(): Promise<AssessmentActor | null> {
  const client = await createClient();
  const admin = createAdminClient();
  if (!client || !admin) return null;

  const { data: { user } } = await client.auth.getUser();
  if (!user) return null;

  const { data: profileData } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  const profile = profileData as MemberProfile | null;
  if (!profile || profile.status !== "aprovado") return null;

  const canDelegate = isGeneralAssessmentRank(profile.rank);
  let canManage = canDelegate;
  if (!canManage && ["major", "tenente_coronel", "coronel"].includes(profile.rank as DkRank)) {
    const { data: permission } = await admin
      .from("assessment_manager_permissions")
      .select("active")
      .eq("user_id", user.id)
      .eq("active", true)
      .maybeSingle();
    canManage = Boolean(permission);
  }

  return { user, profile, admin, canManage, canDelegate };
}

export async function requireAssessmentManager(): Promise<AssessmentActor | null> {
  const actor = await getApprovedAssessmentActor();
  return actor?.canManage ? actor : null;
}
