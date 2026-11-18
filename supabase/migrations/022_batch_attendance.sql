-- Lista de presenca de varias atividades numa unica chamada.
-- A tela de atividades do membro chamava get_activity_attendance uma vez por
-- atividade (N chamadas, cada uma passando pelo proxy e pela verificacao de
-- sessao). Esta versao recebe todos os ids e devolve tudo junto, com a mesma
-- regra de acesso: so membros aprovados enxergam, e so respostas de aprovados.

create or replace function public.get_activities_attendance(requested_activity_ids uuid[])
returns table (
  activity_id uuid,
  user_id uuid,
  nickname text,
  rank public.dk_rank,
  graduation_cavalaria public.graduation_level,
  graduation_arquearia public.graduation_level,
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
    attendance.activity_id,
    attendance.user_id,
    profiles.nickname,
    profiles.rank,
    profiles.graduation_cavalaria,
    profiles.graduation_arquearia,
    attendance.response,
    attendance.guest_count,
    attendance.note,
    attendance.updated_at
  from public.activity_attendance as attendance
  join public.profiles on profiles.id = attendance.user_id
  where attendance.activity_id = any(requested_activity_ids)
    and cardinality(requested_activity_ids) <= 500
    and profiles.status = 'aprovado'
    and public.is_approved_member()
  order by attendance.updated_at;
$$;

revoke all on function public.get_activities_attendance(uuid[]) from public, anon;
grant execute on function public.get_activities_attendance(uuid[]) to authenticated;
