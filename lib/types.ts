export type ActivityStatus = "confirmado" | "a_definir" | "adiado" | "cancelado" | "finalizado";

export type Activity = {
  id: string;
  title: string;
  starts_at: string;
  location: string;
  type: string;
  status: ActivityStatus;
  description?: string | null;
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

export type MemberProfile = {
  id: string;
  full_name: string;
  nickname: string;
  rank?: string | null;
  graduation_order?: string | null;
  house?: string | null;
  shirt_number?: number | null;
  primary_build?: string | null;
  secondary_build?: string | null;
  birth_date?: string | null;
  zodiac_sign?: string | null;
  status: "pendente" | "aprovado" | "recusado" | "suspenso" | "desativado";
};
