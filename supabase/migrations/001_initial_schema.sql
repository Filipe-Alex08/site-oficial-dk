create extension if not exists pgcrypto;

create type public.member_status as enum ('pendente', 'aprovado', 'recusado', 'suspenso', 'desativado');
create type public.member_kind as enum ('membro', 'oficial');
create type public.dk_rank as enum (
  'recruta',
  'soldado',
  'cabo',
  'terceiro_sargento',
  'segundo_sargento',
  'primeiro_sargento',
  'subtenente',
  'tenente',
  'capitao',
  'major',
  'tenente_coronel',
  'coronel',
  'general_brigada',
  'general_divisao',
  'general_exercito'
);
create type public.graduation_level as enum ('sem_graduacao', 'bronze', 'prata', 'ouro');
create type public.admin_role as enum ('principal', 'midias', 'atividades', 'membros');
create type public.activity_status as enum ('confirmado', 'a_definir', 'adiado', 'cancelado', 'finalizado');
create type public.attendance_response as enum ('vai', 'nao_vai');
create type public.media_type as enum ('image', 'video');
create type public.document_audience as enum ('todos', 'oficiais', 'graduacao');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  nickname text not null,
  member_kind public.member_kind not null default 'membro',
  rank public.dk_rank not null default 'recruta',
  graduation_level public.graduation_level not null default 'sem_graduacao',
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
  ends_at timestamptz,
  location text not null,
  type text not null default 'Treino',
  status public.activity_status not null default 'confirmado',
  description text,
  attendance_open boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint activity_end_after_start check (ends_at is null or ends_at > starts_at)
);

create table public.activity_attendance (
  activity_id uuid not null references public.activities(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  response public.attendance_response not null,
  guest_count integer not null default 0 check (guest_count between 0 and 30),
  note text check (note is null or char_length(note) <= 180),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (activity_id, user_id)
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  file_name text not null,
  file_path text not null unique,
  audience public.document_audience not null default 'todos',
  minimum_rank public.dk_rank,
  minimum_graduation public.graduation_level,
  active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint document_access_requirement check (
    (audience = 'todos' and minimum_rank is null and minimum_graduation is null)
    or (audience = 'oficiais' and minimum_rank is not null and minimum_graduation is null)
    or (audience = 'graduacao' and minimum_rank is null and minimum_graduation is not null)
  )
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

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('dk-documents', 'dk-documents', false, 20971520, array['application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

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
create trigger activity_attendance_updated_at before update on public.activity_attendance
for each row execute function public.set_updated_at();
create trigger documents_updated_at before update on public.documents
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

create or replace function public.is_approved_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'aprovado'
  );
$$;

create or replace function public.rank_weight(value public.dk_rank)
returns integer
language sql
immutable
as $$
  select case value
    when 'recruta' then 0
    when 'soldado' then 1
    when 'cabo' then 2
    when 'terceiro_sargento' then 3
    when 'segundo_sargento' then 4
    when 'primeiro_sargento' then 5
    when 'subtenente' then 6
    when 'tenente' then 7
    when 'capitao' then 8
    when 'major' then 9
    when 'tenente_coronel' then 10
    when 'coronel' then 11
    when 'general_brigada' then 12
    when 'general_divisao' then 13
    when 'general_exercito' then 14
  end;
$$;

create or replace function public.graduation_weight(value public.graduation_level)
returns integer
language sql
immutable
as $$
  select case value
    when 'sem_graduacao' then 0
    when 'bronze' then 1
    when 'prata' then 2
    when 'ouro' then 3
  end;
$$;

create or replace function public.can_access_document(
  required_audience public.document_audience,
  required_rank public.dk_rank,
  required_graduation public.graduation_level
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and status = 'aprovado'
      and case required_audience
        when 'todos' then true
        when 'oficiais' then
          member_kind = 'oficial'
          and public.rank_weight(rank) >= public.rank_weight(required_rank)
        when 'graduacao' then
          public.graduation_weight(graduation_level) >= public.graduation_weight(required_graduation)
      end
  );
$$;

create or replace function public.get_activity_attendance(requested_activity_id uuid)
returns table (
  user_id uuid,
  nickname text,
  rank public.dk_rank,
  response public.attendance_response,
  guest_count integer,
  note text,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    attendance.user_id,
    profiles.nickname,
    profiles.rank,
    attendance.response,
    attendance.guest_count,
    attendance.note,
    attendance.updated_at
  from public.activity_attendance as attendance
  join public.profiles on profiles.id = attendance.user_id
  where attendance.activity_id = requested_activity_id
    and profiles.status = 'aprovado'
    and public.is_approved_member()
  order by attendance.updated_at;
$$;

create or replace function public.get_member_roster()
returns table (
  user_id uuid,
  nickname text,
  rank public.dk_rank,
  member_kind public.member_kind
)
language sql
stable
security definer
set search_path = public
as $$
  select profiles.id, profiles.nickname, profiles.rank, profiles.member_kind
  from public.profiles
  where profiles.status = 'aprovado'
    and public.is_approved_member()
  order by public.rank_weight(profiles.rank) desc, profiles.nickname;
$$;

revoke all on function public.has_admin_role(public.admin_role) from public;
revoke all on function public.is_approved_member() from public;
revoke all on function public.can_access_document(public.document_audience, public.dk_rank, public.graduation_level) from public;
revoke all on function public.get_activity_attendance(uuid) from public;
revoke all on function public.get_member_roster() from public;
grant execute on function public.has_admin_role(public.admin_role) to anon, authenticated;
grant execute on function public.is_approved_member() to authenticated;
grant execute on function public.can_access_document(public.document_audience, public.dk_rank, public.graduation_level) to authenticated;
grant execute on function public.get_activity_attendance(uuid) to authenticated;
grant execute on function public.get_member_roster() to authenticated;

alter table public.profiles enable row level security;
alter table public.user_admin_roles enable row level security;
alter table public.invites enable row level security;
alter table public.posts enable row level security;
alter table public.media_items enable row level security;
alter table public.activities enable row level security;
alter table public.activity_attendance enable row level security;
alter table public.documents enable row level security;
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

create policy "membros aprovados consultam a presença"
on public.activity_attendance for select to authenticated
using (public.is_approved_member() or public.has_admin_role('atividades'));

create policy "membro confirma a própria presença"
on public.activity_attendance for insert to authenticated
with check (
  (
    user_id = auth.uid()
    and public.is_approved_member()
    and exists (
      select 1 from public.activities
      where activities.id = activity_id
        and activities.attendance_open
        and activities.status not in ('cancelado', 'finalizado')
    )
  )
  or public.has_admin_role('atividades')
);

create policy "membro altera a própria presença"
on public.activity_attendance for update to authenticated
using (user_id = auth.uid() or public.has_admin_role('atividades'))
with check (
  (
    user_id = auth.uid()
    and public.is_approved_member()
    and exists (
      select 1 from public.activities
      where activities.id = activity_id
        and activities.attendance_open
        and activities.status not in ('cancelado', 'finalizado')
    )
  )
  or public.has_admin_role('atividades')
);

create policy "membro remove a própria resposta"
on public.activity_attendance for delete to authenticated
using (user_id = auth.uid() or public.has_admin_role('atividades'));

create policy "membro consulta documentos permitidos"
on public.documents for select to authenticated
using (
  public.has_admin_role('principal')
  or (
    active
    and public.can_access_document(audience, minimum_rank, minimum_graduation)
  )
);

create policy "ADM principal cria documentos"
on public.documents for insert to authenticated
with check (public.has_admin_role('principal'));

create policy "ADM principal atualiza documentos"
on public.documents for update to authenticated
using (public.has_admin_role('principal'))
with check (public.has_admin_role('principal'));

create policy "ADM principal exclui documentos"
on public.documents for delete to authenticated
using (public.has_admin_role('principal'));

create policy "público consulta jogos ativos"
on public.games for select to anon, authenticated
using (active or public.has_admin_role('principal'));

create policy "ADM principal gerencia jogos"
on public.games for all to authenticated
using (public.has_admin_role('principal'))
with check (public.has_admin_role('principal'));

revoke all on all tables in schema public from anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on public.posts, public.media_items, public.activities, public.games to anon;
grant select on public.profiles, public.user_admin_roles, public.invites, public.posts, public.media_items, public.activities, public.activity_attendance, public.documents, public.games to authenticated;
grant update on public.profiles to authenticated;
grant insert, update, delete on public.user_admin_roles, public.invites, public.posts, public.media_items, public.activities, public.activity_attendance, public.documents, public.games to authenticated;

create index posts_published_at_idx on public.posts (published, published_at desc);
create index media_items_post_id_idx on public.media_items (post_id, sort_order);
create index activities_starts_at_idx on public.activities (starts_at);
create index activity_attendance_activity_idx on public.activity_attendance (activity_id, response);
create index documents_access_idx on public.documents (active, audience, minimum_rank, minimum_graduation);
create index profiles_status_idx on public.profiles (status);
create index profiles_access_idx on public.profiles (member_kind, rank, graduation_level);
create index invites_code_idx on public.invites (code) where active;
