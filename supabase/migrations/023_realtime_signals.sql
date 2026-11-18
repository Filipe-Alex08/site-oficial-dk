-- Sinais de tempo real ("algo mudou na tabela X").
--
-- Cada comando que altera uma tabela observada publica, no topico publico
-- dk:changes do Supabase Realtime, apenas { table, op }. Nenhuma linha, nenhum
-- dado pessoal vai no sinal: o navegador, ao receber, busca os dados de novo
-- pelos caminhos de sempre, com a sessao do usuario e as regras de RLS.
-- Por isso as tabelas NAO entram na publicacao supabase_realtime e nenhum token
-- precisa chegar ao JavaScript.
--
-- Seguro de aplicar em qualquer banco:
--   * se o Realtime nao estiver instalado (realtime.send nao existe), nada e
--     criado e a migracao apenas avisa;
--   * a funcao engole qualquer erro do Realtime, entao uma falha nunca impede a
--     gravacao que disparou o gatilho.
-- Depois de ativar o Realtime no servidor, rode esta migracao de novo.

create or replace function public.dk_broadcast_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  begin
    perform realtime.send(
      jsonb_build_object('table', tg_table_name, 'op', tg_op),
      'change',
      'dk:changes',
      false
    );
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
  if to_regprocedure('realtime.send(jsonb,text,text,boolean)') is null then
    raise notice 'realtime.send nao encontrado: sinais de tempo real nao foram criados. Ative o Realtime e rode esta migracao de novo.';
    return;
  end if;

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
