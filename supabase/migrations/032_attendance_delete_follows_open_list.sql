-- O membro so apaga a propria resposta de presenca com a lista aberta.
--
-- A politica de 001 aceitava qualquer exclusao da propria linha: depois do
-- evento (ou com o cadastro suspenso) dava para apagar um "nao vou" e mudar o
-- historico de faltas. Agora valem as mesmas condicoes de responder. O ADM de
-- Atividades continua podendo corrigir a qualquer momento.

-- Remove pelo tipo, e nao pelo nome (o nome antigo tem acento).
do $$
declare
  target record;
begin
  for target in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'activity_attendance' and cmd = 'DELETE'
  loop
    execute format('drop policy %I on public.activity_attendance', target.policyname);
  end loop;
end;
$$;

create policy "membro remove a propria resposta com a lista aberta"
on public.activity_attendance for delete to authenticated
using (
  public.has_admin_role('atividades')
  or (
    user_id = auth.uid()
    and public.is_approved_member()
    and exists (
      select 1 from public.activities
      where activities.id = activity_attendance.activity_id
        and activities.attendance_open
        and activities.status not in ('cancelado', 'finalizado')
    )
  )
);
