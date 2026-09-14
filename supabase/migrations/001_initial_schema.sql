create extension if not exists pgcrypto;

create type public.member_status as enum ('pendente', 'aprovado', 'recusado', 'suspenso', 'desativado');
create type public.admin_role as enum ('principal', 'midias', 'atividades', 'membros');
create type public.activity_status as enum ('confirmado', 'a_definir', 'adiado', 'cancelado', 'finalizado');
create type public.media_type as enum ('image', 'video');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  nickname text not null,
  rank text,
  graduation_order text,
  house text,
  shirt_number integer check (shirt_number is null or shirt_number >= 0),
  primary_build text,
  secondary_build text,
  birth_date date,
  zodiac_sign text,
  status public.member_status not null default 'pendente',
  invited_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_admin_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.admin_role not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table public.invites (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  expires_at timestamptz not null,
  max_uses integer not null default 1 check (max_uses > 0),
  current_uses integer not null default 0 check (current_uses >= 0),
  active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  used_by uuid references public.profiles(id) on delete set null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content text not null,
  category text not null default 'Treinos',
  cover_url text,
  published boolean not null default false,
  published_at timestamptz not null default now(),
  author_id uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.media_items (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  type public.media_type not null,
  url text not null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  starts_at timestamptz not null,
  location text not null,
  type text not null default 'Treino',
  status public.activity_status not null default 'confirmado',
  description text,
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.games (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  summary text not null,
  objective text not null,
  team_formation text not null,
  rules jsonb not null default '[]'::jsonb,
  victory text not null,
  equipment text not null,
  safety text not null,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger posts_updated_at before update on public.posts
for each row execute function public.set_updated_at();
create trigger activities_updated_at before update on public.activities
for each row execute function public.set_updated_at();
create trigger games_updated_at before update on public.games
for each row execute function public.set_updated_at();

create or replace function public.has_admin_role(required_role public.admin_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_admin_roles
    where user_id = auth.uid()
      and (role = required_role or role = 'principal')
  );
$$;

revoke all on function public.has_admin_role(public.admin_role) from public;
grant execute on function public.has_admin_role(public.admin_role) to authenticated;

alter table public.profiles enable row level security;
alter table public.user_admin_roles enable row level security;
alter table public.invites enable row level security;
alter table public.posts enable row level security;
alter table public.media_items enable row level security;
alter table public.activities enable row level security;
alter table public.games enable row level security;

create policy "perfil próprio ou ADM de membros pode consultar"
on public.profiles for select to authenticated
using (id = auth.uid() or public.has_admin_role('membros'));

create policy "ADM de membros pode atualizar perfis"
on public.profiles for update to authenticated
using (public.has_admin_role('membros'))
with check (public.has_admin_role('membros'));

create policy "usuário consulta os próprios papéis"
on public.user_admin_roles for select to authenticated
using (user_id = auth.uid() or public.has_admin_role('principal'));

create policy "ADM principal gerencia papéis"
on public.user_admin_roles for all to authenticated
using (public.has_admin_role('principal'))
with check (public.has_admin_role('principal'));

create policy "ADM de membros consulta convites"
on public.invites for select to authenticated
using (public.has_admin_role('membros'));

create policy "ADM de membros cria convites"
on public.invites for insert to authenticated
with check (public.has_admin_role('membros'));

create policy "ADM de membros atualiza convites"
on public.invites for update to authenticated
using (public.has_admin_role('membros'))
with check (public.has_admin_role('membros'));

create policy "ADM de membros exclui convites"
on public.invites for delete to authenticated
using (public.has_admin_role('membros'));

create policy "público consulta publicações publicadas"
on public.posts for select to anon, authenticated
using (published or public.has_admin_role('midias'));

create policy "ADM de mídias cria publicações"
on public.posts for insert to authenticated
with check (public.has_admin_role('midias'));

create policy "ADM de mídias atualiza publicações"
on public.posts for update to authenticated
using (public.has_admin_role('midias'))
with check (public.has_admin_role('midias'));

create policy "ADM de mídias exclui publicações"
on public.posts for delete to authenticated
using (public.has_admin_role('midias'));

create policy "público consulta mídias publicadas"
on public.media_items for select to anon, authenticated
using (
  exists (select 1 from public.posts where posts.id = media_items.post_id and posts.published)
  or public.has_admin_role('midias')
);

create policy "ADM de mídias cria arquivos"
on public.media_items for insert to authenticated
with check (public.has_admin_role('midias'));

create policy "ADM de mídias atualiza arquivos"
on public.media_items for update to authenticated
using (public.has_admin_role('midias'))
with check (public.has_admin_role('midias'));

create policy "ADM de mídias exclui arquivos"
on public.media_items for delete to authenticated
using (public.has_admin_role('midias'));

create policy "público consulta calendário"
on public.activities for select to anon, authenticated
using (true);

create policy "ADM de atividades cria eventos"
on public.activities for insert to authenticated
with check (public.has_admin_role('atividades'));

create policy "ADM de atividades atualiza eventos"
on public.activities for update to authenticated
using (public.has_admin_role('atividades'))
with check (public.has_admin_role('atividades'));

create policy "ADM de atividades exclui eventos"
on public.activities for delete to authenticated
using (public.has_admin_role('atividades'));

create policy "público consulta jogos ativos"
on public.games for select to anon, authenticated
using (active or public.has_admin_role('principal'));

create policy "ADM principal gerencia jogos"
on public.games for all to authenticated
using (public.has_admin_role('principal'))
with check (public.has_admin_role('principal'));

grant usage on schema public to anon, authenticated;
grant select on public.posts, public.media_items, public.activities, public.games to anon;
grant select on all tables in schema public to authenticated;
grant insert, update, delete on public.posts, public.media_items, public.activities, public.games, public.profiles, public.user_admin_roles, public.invites to authenticated;

create index posts_published_at_idx on public.posts (published, published_at desc);
create index media_items_post_id_idx on public.media_items (post_id, sort_order);
create index activities_starts_at_idx on public.activities (starts_at);
create index profiles_status_idx on public.profiles (status);
create index invites_code_idx on public.invites (code) where active;
