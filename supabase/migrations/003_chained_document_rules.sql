create or replace function public.can_access_document(required_logic text, required_rules jsonb)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  member_rank public.dk_rank;
  member_graduation public.graduation_level;
  member_graduation_order text;
  rule jsonb;
  rule_matches boolean;
  current_and_group boolean := false;
  completed_or_groups boolean := false;
  first_rule boolean := true;
  connector text;
begin
  select rank, graduation_level, graduation_order
    into member_rank, member_graduation, member_graduation_order
    from public.profiles
    where id = auth.uid() and status = 'aprovado';

  if not found then return false; end if;
  if jsonb_array_length(coalesce(required_rules, '[]'::jsonb)) = 0 then return true; end if;

  for rule in select value from jsonb_array_elements(required_rules)
  loop
    rule_matches := case rule->>'kind'
      when 'rank' then public.rank_weight(member_rank) >= public.rank_weight((rule->>'minimum_rank')::public.dk_rank)
      when 'graduation' then
        member_graduation_order ilike case when rule->>'track' = 'cavalaria' then '%cavaleir%' else '%arqueir%' end
        and public.graduation_weight(member_graduation) >= public.graduation_weight((rule->>'minimum_graduation')::public.graduation_level)
      else false
    end;

    if first_rule then
      current_and_group := rule_matches;
      first_rule := false;
    else
      connector := coalesce(rule->>'join', required_logic, 'or');
      if connector = 'and' then
        current_and_group := current_and_group and rule_matches;
      else
        completed_or_groups := completed_or_groups or current_and_group;
        current_and_group := rule_matches;
      end if;
    end if;
  end loop;

  return completed_or_groups or current_and_group;
end;
$$;

revoke all on function public.can_access_document(text, jsonb) from public;
grant execute on function public.can_access_document(text, jsonb) to authenticated;
