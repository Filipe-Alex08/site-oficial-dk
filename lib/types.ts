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

export type DocumentAudience = "todos" | "oficiais" | "graduacao";

export type InternalDocument = {
  id: string;
  title: string;
  description?: string | null;
  file_name: string;
  file_path: string;
  audience: DocumentAudience;
  minimum_rank?: DkRank | null;
  minimum_graduation?: GraduationLevel | null;
  active: boolean;
  created_at: string;
};

export type MemberProfile = {
  id: string;
  email?: string;
  full_name: string;
  nickname: string;
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
