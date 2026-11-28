-- A nova opção do enum precisa ser confirmada antes de ser usada em funções.
alter type public.admin_role add value if not exists 'gestao';
