-- Inclui a graduação de cada integrante na lista de presença das atividades.
-- O tipo de retorno da função muda, então ela precisa ser recriada.
-- O site continua funcionando se esta migração ainda não foi aplicada:
-- nesse caso a lista só não mostra o ícone de graduação.

drop function if exists public.get_activity_attendance(uuid);

create function public.get_activity_attendance(requested_activity_id uuid)
returns table (
  user_id uuid,
  nickname text,
  rank public.dk_rank,
  graduation_level public.graduation_level,
  graduation_order text,
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
    profiles.graduation_level,
    profiles.graduation_order,
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

revoke all on function public.get_activity_attendance(uuid) from public;
grant execute on function public.get_activity_attendance(uuid) to authenticated;
