-- Regras configuraveis das anotacoes (painel > Configuracoes, so ADM Principal).
--
-- Chaves de site_settings (todas opcionais: sem valor valem os padroes abaixo,
-- que repetem o comportamento da migracao 025):
--   notes_enabled          true | false      sistema ligado (padrao: true)
--   notes_writers          "commanders" | "ranks" | "both"
--                                            quem escreve: so comandantes de trilha,
--                                            so quem tem a patente minima, ou os dois
--                                            (padrao: "both")
--   notes_commander_scope  "any" | "track" | "track_level"
--                                            para quem o COMANDANTE escreve: qualquer
--                                            membro, quem tem graduacao na trilha dele,
--                                            ou quem tem a mesma trilha E o mesmo nivel
--                                            (padrao: "any")
--   notes_min_rank         (ja existia na 025)
--
-- A restricao de destinatario vale para quem escreve SO por ser comandante. Quem
-- tambem tem a patente minima (e o modo permite patentes) escreve para qualquer
-- membro. O selo de comandante continua sendo decidido pelo gatilho da 025.
--
-- note_write_allowed() e a unica fonte da regra: as funcoes que o site chama e o
-- gatilho de insercao usam ela. O SQL fora de comentarios e ASCII puro.
--
-- Depende de: 025.

insert into public.site_settings (key, value) values
  ('notes_enabled', 'true'::jsonb),
  ('notes_writers', '"both"'::jsonb),
  ('notes_commander_scope', '"any"'::jsonb)
on conflict (key) do nothing;

-- Le uma configuracao de texto; valor ausente ou fora da lista volta ao padrao.
create or replace function public.notes_setting(setting_key text, fallback text, allowed text[])
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select s.value #>> '{}' from public.site_settings s where s.key = setting_key and (s.value #>> '{}') = any(allowed)),
    fallback
  );
$$;

revoke all on function public.notes_setting(text, text, text[]) from public, anon, authenticated;
grant execute on function public.notes_setting(text, text, text[]) to service_role;

create or replace function public.notes_enabled()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.notes_setting('notes_enabled', 'true', array['true', 'false']) = 'true';
$$;

create or replace function public.notes_writers()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select public.notes_setting('notes_writers', 'both', array['commanders', 'ranks', 'both']);
$$;

create or replace function public.notes_commander_scope()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select public.notes_setting('notes_commander_scope', 'any', array['any', 'track', 'track_level']);
$$;

revoke all on function public.notes_enabled() from public, anon;
revoke all on function public.notes_writers() from public, anon;
revoke all on function public.notes_commander_scope() from public, anon;
grant execute on function public.notes_enabled() to authenticated, service_role;
grant execute on function public.notes_writers() to authenticated, service_role;
grant execute on function public.notes_commander_scope() to authenticated, service_role;

-- A regra completa. recipient nulo pergunta so "esse membro pode escrever alguma anotacao?".
create or replace function public.note_write_allowed(author uuid, recipient uuid default null)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  a record;
  r record;
  writers text;
  scope text;
  by_rank boolean;
  cmd_cav boolean;
  cmd_arq boolean;
begin
  if author is null or not public.notes_enabled() then
    return false;
  end if;

  select status, rank, graduation_cavalaria, graduation_arquearia, commander_cavalaria, commander_arquearia
    into a from public.profiles where id = author;
  if not found or a.status <> 'aprovado' then
    return false;
  end if;

  writers := public.notes_writers();
  by_rank := writers <> 'commanders'
    and public.rank_weight(a.rank) >= public.rank_weight(public.notes_min_rank());
  cmd_cav := writers <> 'ranks' and a.commander_cavalaria and a.graduation_cavalaria <> 'sem_graduacao';
  cmd_arq := writers <> 'ranks' and a.commander_arquearia and a.graduation_arquearia <> 'sem_graduacao';

  if not (by_rank or cmd_cav or cmd_arq) then
    return false;
  end if;
  -- Patente minima escreve para qualquer membro; sem destinatario, basta poder escrever.
  if by_rank or recipient is null then
    return true;
  end if;

  scope := public.notes_commander_scope();
  if scope = 'any' then
    return true;
  end if;

  select graduation_cavalaria, graduation_arquearia into r from public.profiles where id = recipient;
  if not found then
    return false;
  end if;

  if scope = 'track' then
    return (cmd_cav and r.graduation_cavalaria <> 'sem_graduacao')
        or (cmd_arq and r.graduation_arquearia <> 'sem_graduacao');
  end if;
  -- track_level: mesma trilha e o mesmo nivel do comandante.
  return (cmd_cav and r.graduation_cavalaria = a.graduation_cavalaria)
      or (cmd_arq and r.graduation_arquearia = a.graduation_arquearia);
end;
$$;

revoke all on function public.note_write_allowed(uuid, uuid) from public, anon, authenticated;
grant execute on function public.note_write_allowed(uuid, uuid) to service_role;

-- O que o site chama com a sessao do membro (a identidade vem de auth.uid()).
create or replace function public.can_write_member_notes()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.note_write_allowed(auth.uid(), null);
$$;

create or replace function public.can_write_note_to(recipient uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.note_write_allowed(auth.uid(), recipient);
$$;

revoke all on function public.can_write_member_notes() from public, anon;
revoke all on function public.can_write_note_to(uuid) from public, anon;
grant execute on function public.can_write_member_notes() to authenticated, service_role;
grant execute on function public.can_write_note_to(uuid) to authenticated, service_role;

-- Mesmo gatilho da 025, agora tambem barrando a criacao fora das regras.
create or replace function public.member_notes_before_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  author record;
  recipient record;
begin
  if tg_op = 'UPDATE' then
    new.author_id := old.author_id;
    new.recipient_id := old.recipient_id;
    new.seal_cavalaria := old.seal_cavalaria;
    new.seal_arquearia := old.seal_arquearia;
    new.created_at := old.created_at;
    -- Marcar como lida nao conta como edicao.
    new.updated_at := case when new.body is distinct from old.body then now() else old.updated_at end;
    return new;
  end if;

  if not public.note_write_allowed(new.author_id, new.recipient_id) then
    raise exception 'note_not_allowed' using errcode = '42501';
  end if;

  select commander_cavalaria, commander_arquearia, graduation_cavalaria, graduation_arquearia
    into author from public.profiles where id = new.author_id;
  select graduation_cavalaria, graduation_arquearia
    into recipient from public.profiles where id = new.recipient_id;

  new.seal_cavalaria := case
    when author.commander_cavalaria
      and author.graduation_cavalaria <> 'sem_graduacao'
      and recipient.graduation_cavalaria <> 'sem_graduacao'
    then author.graduation_cavalaria else null end;
  new.seal_arquearia := case
    when author.commander_arquearia
      and author.graduation_arquearia <> 'sem_graduacao'
      and recipient.graduation_arquearia <> 'sem_graduacao'
    then author.graduation_arquearia else null end;

  new.created_at := now();
  new.updated_at := new.created_at;
  new.read_at := null;
  return new;
end;
$$;

revoke all on function public.member_notes_before_write() from public, anon, authenticated;
