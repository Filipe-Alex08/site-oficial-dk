-- Ninguem, fora o ADM Principal, altera a propria patente, graduacao ou comando.
--
-- A politica "ADM de membros pode atualizar perfis" libera qualquer coluna de
-- qualquer perfil, inclusive o proprio. A API do site ja recusa a mudanca
-- propria, mas quem chamasse o Supabase direto contornava. A propria mudanca
-- continua entrando como pedido (colunas requested_*), que outro administrador
-- aprova.
--
-- Nao afeta a chave de servico (auth.uid() nulo), usada pela API, nem a edicao
-- de outras pessoas.
--
-- O nome do gatilho vem depois dos demais na ordem alfabetica, para comparar os
-- valores ja convertidos por profiles_sync_graduations.

create or replace function public.guard_own_access_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.id = auth.uid()
    and not public.has_admin_role('principal')
    and (new.rank, new.graduation_cavalaria, new.graduation_arquearia,
         new.graduation_level, new.graduation_order,
         new.commander_cavalaria, new.commander_arquearia)
      is distinct from
        (old.rank, old.graduation_cavalaria, old.graduation_arquearia,
         old.graduation_level, old.graduation_order,
         old.commander_cavalaria, old.commander_arquearia) then
    raise exception 'own_access_change_requires_approval' using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke all on function public.guard_own_access_change() from public;

drop trigger if exists profiles_zz_guard_own_access on public.profiles;
create trigger profiles_zz_guard_own_access
before update on public.profiles
for each row execute function public.guard_own_access_change();
