-- 019: corrige a contagem do limite de tentativas do cadastro (/api/register).
--
-- PROBLEMA: na primeira chamada de uma chave, a funcao inseria a linha com
-- attempt_count = 1 e, em seguida, caia no ultimo UPDATE, que somava mais 1. A
-- primeira tentativa contava duas vezes e o limite de 5 por janela permitia so 4.
--
-- CORRECAO: quando a linha acabou de ser criada, a tentativa ja esta contada e a
-- funcao responde true na hora. O resto da regra (janela de 900 s, bloqueio ao
-- atingir o maximo, reinicio quando a janela vence) continua igual a 017.
-- Mesma assinatura. Nao altera dados nem a tabela. Pode ser aplicada com o site no ar.
create or replace function public.check_registration_rate_limit(
  requested_key_hash text,
  max_attempts integer default 5,
  window_seconds integer default 900
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_row public.registration_rate_limits%rowtype;
  now_ts timestamptz := now();
  inserted_rows integer;
begin
  if requested_key_hash is null or length(requested_key_hash) <> 64 then
    return false;
  end if;

  -- The window is 15 minutes; one hour is already stale.
  delete from public.registration_rate_limits
  where window_started_at < now_ts - interval '1 hour';

  insert into public.registration_rate_limits (key_hash, window_started_at, attempt_count)
  values (requested_key_hash, now_ts, 1)
  on conflict (key_hash) do nothing;
  get diagnostics inserted_rows = row_count;

  select * into current_row
  from public.registration_rate_limits
  where key_hash = requested_key_hash
  for update;

  -- First attempt of this key: the insert above already counted it.
  if inserted_rows > 0 then
    return true;
  end if;

  if current_row.blocked_until is not null and current_row.blocked_until > now_ts then
    return false;
  end if;

  if current_row.window_started_at + make_interval(secs => window_seconds) <= now_ts then
    update public.registration_rate_limits
    set window_started_at = now_ts, attempt_count = 1, blocked_until = null
    where key_hash = requested_key_hash;
    return true;
  end if;

  if current_row.attempt_count >= max_attempts then
    update public.registration_rate_limits
    set blocked_until = now_ts + make_interval(secs => window_seconds)
    where key_hash = requested_key_hash;
    return false;
  end if;

  update public.registration_rate_limits
  set attempt_count = attempt_count + 1
  where key_hash = requested_key_hash;
  return true;
end;
$$;

revoke all on function public.check_registration_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_registration_rate_limit(text, integer, integer) to service_role;
