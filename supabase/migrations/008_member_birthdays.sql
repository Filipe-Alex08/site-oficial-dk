-- Expose only the day and month; full birth dates remain private.
create or replace function public.get_member_birthdays()
returns table (user_id uuid, nickname text, month integer, day integer)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.nickname, extract(month from p.birth_date)::integer,
    extract(day from p.birth_date)::integer
  from public.profiles p
  where p.status = 'aprovado' and p.birth_date is not null
    and auth.uid() is not null and public.is_approved_member()
  order by extract(month from p.birth_date), extract(day from p.birth_date), p.nickname;
$$;

revoke all on function public.get_member_birthdays() from public, anon;
grant execute on function public.get_member_birthdays() to authenticated;
