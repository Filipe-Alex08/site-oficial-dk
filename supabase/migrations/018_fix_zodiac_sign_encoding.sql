-- 018: conserta os acentos dos signos (ex.: "CapricĆ³rnio" em vez de "Capricórnio").
--
-- PROBLEMA: a função de edição de perfil (migração 006) grava o signo com nomes
-- acentuados escritos direto no SQL. Em produção ela foi aplicada por um caminho
-- que leu o arquivo UTF-8 como Windows-1257, então os literais ficaram corrompidos
-- DENTRO da função e todo perfil salvo ganhou um signo com acento quebrado.
--
-- CORREÇÃO: o signo passa a ser sempre derivado da data de nascimento por uma função
-- nova, e um trigger o grava, sobrescrevendo o que qualquer outra função tenha
-- calculado. Os nomes usam escapes Unicode (U&'\00F3'), que não dependem da
-- codificação do cliente que aplicar este arquivo. Por fim, corrige o que já foi
-- gravado. Não altera nenhuma outra coluna e pode ser aplicada com o site no ar.
--
-- Os intervalos são os mesmos de lib/zodiac.ts e da migração 006.
create or replace function public.zodiac_sign_for(birth date)
returns text
language sql
immutable
set search_path = public
as $$
  select case
    when birth is null then null
    when (extract(month from birth) = 12 and extract(day from birth) >= 22)
      or (extract(month from birth) = 1 and extract(day from birth) <= 19) then U&'Capric\00F3rnio'
    when (extract(month from birth) = 1 and extract(day from birth) >= 20)
      or (extract(month from birth) = 2 and extract(day from birth) <= 18) then U&'Aqu\00E1rio'
    when (extract(month from birth) = 2 and extract(day from birth) >= 19)
      or (extract(month from birth) = 3 and extract(day from birth) <= 20) then 'Peixes'
    when (extract(month from birth) = 3 and extract(day from birth) >= 21)
      or (extract(month from birth) = 4 and extract(day from birth) <= 19) then U&'\00C1ries'
    when (extract(month from birth) = 4 and extract(day from birth) >= 20)
      or (extract(month from birth) = 5 and extract(day from birth) <= 20) then 'Touro'
    when (extract(month from birth) = 5 and extract(day from birth) >= 21)
      or (extract(month from birth) = 6 and extract(day from birth) <= 20) then U&'G\00EAmeos'
    when (extract(month from birth) = 6 and extract(day from birth) >= 21)
      or (extract(month from birth) = 7 and extract(day from birth) <= 22) then U&'C\00E2ncer'
    when (extract(month from birth) = 7 and extract(day from birth) >= 23)
      or (extract(month from birth) = 8 and extract(day from birth) <= 22) then U&'Le\00E3o'
    when (extract(month from birth) = 8 and extract(day from birth) >= 23)
      or (extract(month from birth) = 9 and extract(day from birth) <= 22) then 'Virgem'
    when (extract(month from birth) = 9 and extract(day from birth) >= 23)
      or (extract(month from birth) = 10 and extract(day from birth) <= 22) then 'Libra'
    when (extract(month from birth) = 10 and extract(day from birth) >= 23)
      or (extract(month from birth) = 11 and extract(day from birth) <= 21) then U&'Escorpi\00E3o'
    else U&'Sagit\00E1rio'
  end
$$;

create or replace function public.profiles_set_zodiac_sign()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.zodiac_sign := public.zodiac_sign_for(new.birth_date);
  return new;
end;
$$;

drop trigger if exists profiles_zodiac_sign on public.profiles;
create trigger profiles_zodiac_sign
before insert or update of birth_date, zodiac_sign on public.profiles
for each row execute function public.profiles_set_zodiac_sign();

-- Conserta o que já está gravado (só linhas cujo valor difere do correto).
update public.profiles
set zodiac_sign = public.zodiac_sign_for(birth_date)
where zodiac_sign is distinct from public.zodiac_sign_for(birth_date);
