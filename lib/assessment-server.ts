import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import type { MemberProfile } from "@/lib/types";
import { getViewer } from "@/lib/viewer";

export type AssessmentActor = {
  user: User;
  profile: MemberProfile;
  admin: NonNullable<ReturnType<typeof createAdminClient>>;
  canManage: boolean;
  canReset: boolean;
};

export async function getApprovedAssessmentActor(): Promise<AssessmentActor | null> {
  const { user, profile, roles, canManageAssessments } = await getViewer();
  const admin = createAdminClient();
  if (!user || profile?.status !== "aprovado" || !admin) return null;

  return { user, profile, admin, canManage: canManageAssessments, canReset: roles.includes("principal") };
}

export async function requireAssessmentManager(): Promise<AssessmentActor | null> {
  const actor = await getApprovedAssessmentActor();
  return actor?.canManage ? actor : null;
}
