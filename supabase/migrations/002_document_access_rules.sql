alter table public.documents
  add column access_logic text not null default 'or' check (access_logic in ('and', 'or')),
  add column access_rules jsonb not null default '[]'::jsonb;

update public.documents
set access_rules = case
  when audience = 'oficiais' and minimum_rank is not null
    then jsonb_build_array(jsonb_build_object('kind', 'rank', 'minimum_rank', minimum_rank::text))
  when audience = 'graduacao' and minimum_graduation is not null
    then jsonb_build_array(jsonb_build_object('kind', 'graduation', 'track', 'cavalaria', 'minimum_graduation', minimum_graduation::text))
  else '[]'::jsonb
end;

create or replace function public.can_access_document(required_logic text, required_rules jsonb)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.status = 'aprovado'
      and (
        jsonb_array_length(coalesce(required_rules, '[]'::jsonb)) = 0
        or case when required_logic = 'and' then
          not exists (
            select 1 from jsonb_array_elements(required_rules) rule
            where not case rule->>'kind'
              when 'rank' then public.rank_weight(p.rank) >= public.rank_weight((rule->>'minimum_rank')::public.dk_rank)
              when 'graduation' then (p.graduation_order ilike case when rule->>'track' = 'cavalaria' then '%cavaleir%' else '%arqueir%' end)
                and public.graduation_weight(p.graduation_level) >= public.graduation_weight((rule->>'minimum_graduation')::public.graduation_level)
              else false
            end
          )
        else exists (
          select 1 from jsonb_array_elements(required_rules) rule
          where case rule->>'kind'
            when 'rank' then public.rank_weight(p.rank) >= public.rank_weight((rule->>'minimum_rank')::public.dk_rank)
            when 'graduation' then (p.graduation_order ilike case when rule->>'track' = 'cavalaria' then '%cavaleir%' else '%arqueir%' end)
              and public.graduation_weight(p.graduation_level) >= public.graduation_weight((rule->>'minimum_graduation')::public.graduation_level)
            else false
          end
        ) end
      )
  );
$$;

revoke all on function public.can_access_document(text, jsonb) from public;
grant execute on function public.can_access_document(text, jsonb) to authenticated;

drop policy if exists "membro consulta documentos permitidos" on public.documents;
create policy "membro consulta documentos permitidos"
on public.documents for select to authenticated
using (
  public.has_admin_role('principal') or public.has_admin_role('membros')
  or (active and public.can_access_document(access_logic, access_rules))
);

drop policy if exists "ADM principal cria documentos" on public.documents;
drop policy if exists "ADM principal atualiza documentos" on public.documents;
drop policy if exists "ADM principal exclui documentos" on public.documents;
create policy "ADM autorizado gerencia documentos" on public.documents for all to authenticated
using (public.has_admin_role('principal') or public.has_admin_role('membros'))
with check (public.has_admin_role('principal') or public.has_admin_role('membros'));
