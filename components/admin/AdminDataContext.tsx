"use client";

import { createContext, useContext, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { createClient } from "@/lib/supabase/client";
import type { Activity, AdminRole, MemberProfile, Post } from "@/lib/types";

export type AdminSection = "resumo" | "midias" | "calendario" | "torneio" | "presencas" | "membros" | "convites" | "documentos" | "simulados" | "logs" | "configuracoes";
export type Invite = { id: string; code: string; expires_at: string; max_uses: number; current_uses: number; active: boolean };
export type MemberTab = "pendentes" | "todos";
/** Uma seção do painel como aparece na barra lateral, na barra inferior e na paleta de comandos. */
export type AdminNavItem = { id: AdminSection; label: string; icon: ReactNode; group: string; badge?: number; badgeLabel?: string };

/** Dados e atalhos do painel compartilhados pelas seções (carregados uma vez, em AdminDashboard). */
export type AdminData = {
  supabase: ReturnType<typeof createClient>;
  currentUserId: string;
  /** Permissões do visualizador. */
  principal: boolean;
  canMedia: boolean;
  canCalendar: boolean;
  canMembers: boolean;
  canManageAssessments: boolean;
  canViewLogs: boolean;
  /** Dados do painel. */
  posts: Post[];
  activities: Activity[];
  members: MemberProfile[];
  memberRoles: Record<string, AdminRole[]>;
  invites: Invite[];
  setInvites: Dispatch<SetStateAction<Invite[]>>;
  /** A primeira carga ainda não terminou. */
  loading: boolean;
  refetch: () => Promise<unknown>;
  /** Pendências que aparecem nos selos e no resumo. */
  membersNeedingAction: number;
  pendingReviews: number;
  /** Navegação. */
  section: AdminSection;
  setSection: (next: AdminSection) => void;
  setMemberTab: (next: MemberTab) => void;
  goToQueue: () => void;
};

const AdminDataContext = createContext<AdminData | null>(null);

export const AdminDataProvider = AdminDataContext.Provider;

export function useAdminData(): AdminData {
  const data = useContext(AdminDataContext);
  if (!data) throw new Error("useAdminData precisa estar dentro de <AdminDataProvider>.");
  return data;
}
