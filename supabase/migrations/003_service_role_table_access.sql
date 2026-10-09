-- The server-side secret key bypasses RLS but still needs SQL table grants.
-- Keep this key server-only; it provides elevated access to the application data.
grant all privileges on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

alter default privileges in schema public
  grant all privileges on tables to service_role;
alter default privileges in schema public
  grant usage, select on sequences to service_role;
