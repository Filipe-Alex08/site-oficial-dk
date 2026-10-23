export type ActivityStatus = "confirmado" | "a_definir" | "adiado" | "cancelado" | "finalizado";

export type MemberKind = "membro" | "oficial";

export type GraduationLevel = "sem_graduacao" | "bronze" | "prata" | "ouro";

export type DkRank =
  | "recruta"
  | "soldado"
  | "cabo"
  | "terceiro_sargento"
  | "segundo_sargento"
  | "primeiro_sargento"
  | "subtenente"
  | "tenente"
  | "capitao"
  | "major"
  | "tenente_coronel"
  | "coronel"
  | "general_brigada"
  | "general_divisao"
  | "general_exercito";

export type Activity = {
  id: string;
  title: string;
  starts_at: string;
  ends_at?: string | null;
  updated_at?: string;
  location: string;
  type: string;
  status: ActivityStatus;
  description?: string | null;
  attendance_open?: boolean;
};

export type AttendanceResponse = "vai" | "nao_vai";

export type AttendanceEntry = {
  user_id: string;
  nickname: string;
  rank: DkRank;
  response: AttendanceResponse;
  guest_count: number;
  note?: string | null;
  updated_at: string;
};

export type RosterEntry = {
  user_id: string;
  nickname: string;
  rank: DkRank;
  member_kind: MemberKind;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  cover_url?: string | null;
  published: boolean;
  published_at: string;
  source?: string | null;
  source_url?: string | null;
  youtube_url?: string | null;
  tiktok_url?: string | null;
  media_items?: MediaItem[];
};

export type MediaItem = {
  id: string;
  post_id: string;
  type: "image" | "video";
  url: string;
  caption?: string | null;
  sort_order: number;
};

export type Game = {
  id: string;
  name: string;
  summary: string;
  objective: string;
  teamFormation: string;
  rules: string[];
  victory: string;
  equipment: string;
  safety: string;
};

export type AdminRole = "principal" | "midias" | "atividades" | "membros";

export type AssessmentQuestionType = "objetiva" | "aberta";
export type AssessmentScopeType = "patente" | "graduacao";
export type AssessmentTrack = "geral" | "cavalaria" | "arquearia";
export type AssessmentDifficulty = "basica" | "intermediaria" | "avancada";
export type AssessmentStatus = "rascunho" | "publicado" | "arquivado";
export type AssessmentAssignmentStatus =
  | "convidado"
  | "em_andamento"
  | "aguardando_correcao"
  | "corrigido"
  | "cancelado"
  | "expirado";

export type AssessmentQuestion = {
  id: string;
  prompt: string;
  question_type: AssessmentQuestionType;
  options: string[];
  correct_option?: number | null;
  expected_answer?: string | null;
  explanation?: string | null;
  manual_title: string;
  source_chapter?: string | null;
  source_page?: string | null;
  scope_type: AssessmentScopeType;
  rank_scopes: DkRank[];
  graduation_scopes: GraduationLevel[];
  track: AssessmentTrack;
  difficulty: AssessmentDifficulty;
  active: boolean;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
};

export type Assessment = {
  id: string;
  title: string;
  description?: string | null;
  target_type: AssessmentScopeType;
  target_rank?: DkRank | null;
  target_graduation?: GraduationLevel | null;
  content_type: AssessmentScopeType;
  content_rank_scopes: DkRank[];
  content_graduation_scopes: GraduationLevel[];
  track: AssessmentTrack;
  question_count: number;
  passing_score: number;
  duration_minutes?: number | null;
  status: AssessmentStatus;
  created_by?: string | null;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type AssessmentAssignment = {
  id: string;
  assessment_id: string;
  member_id: string;
  indication_number: number;
  access_token: string;
  status: AssessmentAssignmentStatus;
  assigned_by?: string | null;
  expires_at?: string | null;
  started_at?: string | null;
  submitted_at?: string | null;
  graded_at?: string | null;
  score_percent?: number | null;
  correct_count?: number | null;
  incorrect_count?: number | null;
  pending_open_count: number;
  passed?: boolean | null;
  created_at: string;
  updated_at: string;
};

export type AssessmentManagerPermission = {
  user_id: string;
  granted_by?: string | null;
  active: boolean;
  granted_at: string;
  revoked_at?: string | null;
};

export type DocumentAudience = "todos" | "oficiais" | "graduacao";
export type DocumentTrack = "cavalaria" | "arquearia";
export type DocumentAccessRule = ({ kind: "rank"; minimum_rank: DkRank } | { kind: "graduation"; track: DocumentTrack; minimum_graduation: GraduationLevel }) & { join?: "and" | "or" };

export type InternalDocument = {
  id: string;
  title: string;
  description?: string | null;
  file_name: string;
  file_path: string;
  audience: DocumentAudience;
  minimum_rank?: DkRank | null;
  minimum_graduation?: GraduationLevel | null;
  access_logic?: "and" | "or";
  access_rules?: DocumentAccessRule[];
  active: boolean;
  created_at: string;
};

export type MemberProfile = {
  id: string;
  email?: string;
  full_name: string;
  nickname: string;
  avatar_path?: string | null;
  member_kind: MemberKind;
  rank: DkRank;
  graduation_level: GraduationLevel;
  graduation_order?: string | null;
  house?: string | null;
  shirt_number?: number | null;
  primary_build?: string | null;
  secondary_build?: string | null;
  birth_date?: string | null;
  zodiac_sign?: string | null;
  status: "pendente" | "aprovado" | "recusado" | "suspenso" | "desativado";
};
