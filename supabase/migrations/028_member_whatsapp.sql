-- Celular do membro (opcional), guardado só em dígitos, com o código do país
-- (ex.: 5511999998888).
alter table public.profiles add column if not exists whatsapp text;

alter table public.profiles drop constraint if exists profiles_whatsapp_format;
alter table public.profiles add constraint profiles_whatsapp_format
  check (whatsapp ~ '^[1-9][0-9]{9,14}$');

-- O próprio membro grava o número; vazio apaga.
create or replace function public.set_own_whatsapp(requested_whatsapp text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_whatsapp text := nullif(regexp_replace(coalesce(requested_whatsapp, ''), '[^0-9]', '', 'g'), '');
begin
  if auth.uid() is null or not public.is_approved_member() then
    raise exception 'approved_member_required' using errcode = '42501';
  end if;
  if clean_whatsapp is not null and clean_whatsapp !~ '^[1-9][0-9]{9,14}$' then
    raise exception 'whatsapp_invalid' using errcode = '22023';
  end if;
  update public.profiles set whatsapp = clean_whatsapp where id = auth.uid();
end;
$$;

revoke all on function public.set_own_whatsapp(text) from public, anon;
grant execute on function public.set_own_whatsapp(text) to authenticated;
