-- A edição de presenças passa para o ADM de Membros. A confirmação do
-- próprio membro continua condicionada à abertura da lista.
alter policy U&"membros aprovados consultam a presen\00e7a" on public.activity_attendance
using (public.is_approved_member());

alter policy U&"membro confirma a pr\00f3pria presen\00e7a" on public.activity_attendance
with check (
  public.has_admin_role('membros')
  or (
    user_id = auth.uid()
    and public.is_approved_member()
    and exists (
      select 1 from public.activities
      where id = activity_attendance.activity_id
        and attendance_open and status not in ('cancelado', 'finalizado')
    )
  )
);

alter policy U&"membro altera a pr\00f3pria presen\00e7a" on public.activity_attendance
using (
  public.has_admin_role('membros')
  or (
    user_id = auth.uid()
    and public.is_approved_member()
    and exists (
      select 1 from public.activities
      where id = activity_attendance.activity_id
        and attendance_open and status not in ('cancelado', 'finalizado')
    )
  )
)
with check (
  public.has_admin_role('membros')
  or (
    user_id = auth.uid()
    and public.is_approved_member()
    and exists (
      select 1 from public.activities
      where id = activity_attendance.activity_id
        and attendance_open and status not in ('cancelado', 'finalizado')
    )
  )
);

alter policy "membro remove a propria resposta com a lista aberta" on public.activity_attendance
using (
  public.has_admin_role('membros')
  or (
    user_id = auth.uid()
    and public.is_approved_member()
    and exists (
      select 1 from public.activities
      where id = activity_attendance.activity_id
        and attendance_open and status not in ('cancelado', 'finalizado')
    )
  )
);

-- As delegações antigas são preservadas para histórico. O acesso é
-- concedido pelo papel administrativo atribuído pelo ADM Principal.
create or replace function public.can_manage_assessments()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select public.has_admin_role('gestao');
$$;

create or replace function public.can_delegate_assessment_managers()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select public.has_admin_role('principal');
$$;

-- Documentos continuam com as regras de visibilidade da migração 029.
-- A API autoriza o ADM de Gestão antes de usar a chave de serviço.
