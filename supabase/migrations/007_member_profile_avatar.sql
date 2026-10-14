alter table public.profiles add column if not exists avatar_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-avatars', 'profile-avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "membro envia a própria foto de perfil"
on storage.objects for insert to authenticated
with check (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = auth.uid()::text and public.is_approved_member());

create policy "membro atualiza a própria foto de perfil"
on storage.objects for update to authenticated
using (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = auth.uid()::text and public.is_approved_member())
with check (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = auth.uid()::text and public.is_approved_member());

create policy "membro remove a própria foto de perfil"
on storage.objects for delete to authenticated
using (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = auth.uid()::text and public.is_approved_member());

create or replace function public.update_own_member_avatar(requested_avatar_path text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_status public.member_status;
begin
  if auth.uid() is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  select status into current_status from public.profiles where id = auth.uid();
  if current_status is distinct from 'aprovado'::public.member_status then
    raise exception 'approved_member_required' using errcode = '42501';
  end if;

  if requested_avatar_path is not null and requested_avatar_path !~ (
    '^' || auth.uid()::text || '/[0-9a-f-]{36}\.(jpg|png|webp)$'
  ) then
    raise exception 'avatar_path_invalid' using errcode = '22023';
  end if;

  update public.profiles
  set avatar_path = requested_avatar_path
  where id = auth.uid();
end;
$$;

revoke all on function public.update_own_member_avatar(text) from public, anon;
grant execute on function public.update_own_member_avatar(text) to authenticated;
