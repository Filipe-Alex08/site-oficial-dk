-- Ninguem logado atualiza public.profiles direto.
--
-- A politica de 001 liberava, para o ADM de Membros, qualquer coluna de qualquer
-- perfil: dava para suspender o ADM Principal (que perde o acesso, porque o
-- papel so vale com cadastro aprovado), mudar a situacao de outros ADMs ou dar
-- patente, por fora das travas da API e sem auditoria.
--
-- O site nao usa esse caminho: o painel grava pela API (chave de servico) e o
-- proprio membro grava por funcoes SECURITY DEFINER. Nenhum dos dois depende
-- desta permissao.
--
-- O gatilho da 030 continua como segunda barreira.

revoke update on public.profiles from anon, authenticated;

-- Remove pelo tipo, e nao pelo nome: se o nome tiver sido gravado diferente no
-- banco, a politica nao pode sobrar.
do $$
declare
  target record;
begin
  for target in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and cmd in ('UPDATE', 'ALL')
  loop
    execute format('drop policy %I on public.profiles', target.policyname);
  end loop;
end;
$$;
