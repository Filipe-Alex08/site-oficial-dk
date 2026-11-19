-- Mantem profiles.email igual a auth.users.email.
--
-- O membro troca o e-mail pelo proprio Auth (updateUser com confirmacao por
-- e-mail): o e-mail do login so muda DEPOIS que ele abre o link recebido. A copia
-- em profiles.email (usada na lista de membros do painel e na busca) precisa
-- acompanhar essa mudanca, e o unico ponto que enxerga a confirmacao e o proprio
-- banco, entao a copia e feita por gatilho em vez de por codigo do site.
--
-- Ao executar, tambem corrige qualquer copia que ja esteja diferente.
-- O SQL fora de comentarios e ASCII puro.

create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
     set email = new.email
   where id = new.id
     and email is distinct from new.email;
  return new;
end;
$$;

revoke all on function public.sync_profile_email() from public, anon, authenticated;

drop trigger if exists sync_profile_email on auth.users;
create trigger sync_profile_email
  after update of email on auth.users
  for each row
  when (new.email is not null and old.email is distinct from new.email)
  execute function public.sync_profile_email();

update public.profiles p
   set email = u.email
  from auth.users u
 where u.id = p.id
   and u.email is not null
   and p.email is distinct from u.email;
