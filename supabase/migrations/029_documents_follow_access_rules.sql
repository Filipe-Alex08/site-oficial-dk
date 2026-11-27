-- O ADM de Membros deixa de ver documentos fora das proprias regras de acesso
-- (patente e graduacao). So o ADM Principal ve tudo.
--
-- As duas politicas precisam mudar: a de gerenciamento e "for all", o que inclui
-- SELECT, e politicas permissivas se somam. Envio, edicao e exclusao feitos pelo
-- ADM de Membros continuam passando pela API do site (chave de servico), que
-- confere antes se ele enxerga o documento.
--
-- has_admin_role('principal') so vale para quem tem o papel principal.

drop policy if exists "membro consulta documentos permitidos" on public.documents;
create policy "membro consulta documentos permitidos"
on public.documents for select to authenticated
using (
  public.has_admin_role('principal')
  or (active and public.can_access_document(access_logic, access_rules))
);

drop policy if exists "ADM autorizado gerencia documentos" on public.documents;
create policy "ADM autorizado gerencia documentos"
on public.documents for all to authenticated
using (public.has_admin_role('principal'))
with check (public.has_admin_role('principal'));
