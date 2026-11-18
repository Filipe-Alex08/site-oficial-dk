-- Sinais de tempo real ("algo mudou na tabela X").
--
-- Cada comando que altera uma tabela observada emite um NOTIFY no canal
-- dk_changes com apenas { table, op }. Nenhuma linha, nenhum dado pessoal vai no
-- aviso: o servidor do site escuta o canal (LISTEN, lib/realtime-hub.ts), repassa
-- ao navegador por Server-Sent Events e o navegador busca os dados de novo pelos
-- caminhos de sempre, com a sessao do usuario e as regras de RLS.
--
-- Nao depende do servico Realtime do Supabase nem de chaves: e so Postgres.
-- pg_notify e transacional (o aviso sai no COMMIT; um ROLLBACK nao avisa ninguem)
-- e a funcao engole qualquer erro, entao uma falha aqui nunca impede a gravacao.

create or replace function public.dk_broadcast_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  begin
    perform pg_notify('dk_changes', jsonb_build_object('table', tg_table_name, 'op', tg_op)::text);
  exception when others then
    null;
  end;
  return null;
end;
$$;

revoke all on function public.dk_broadcast_change() from public, anon, authenticated;

do $$
declare
  watched text;
begin
  foreach watched in array array[
    'profiles',
    'user_admin_roles',
    'invites',
    'posts',
    'media_items',
    'activities',
    'activity_attendance',
    'assessment_assignments',
    'assessment_answers'
  ] loop
    if to_regclass(format('public.%I', watched)) is null then
      raise notice 'Tabela public.% nao existe: ignorada.', watched;
      continue;
    end if;

    execute format('drop trigger if exists dk_broadcast_change on public.%I', watched);
    execute format(
      'create trigger dk_broadcast_change after insert or update or delete on public.%I for each statement execute function public.dk_broadcast_change()',
      watched
    );
  end loop;
end;
$$;
