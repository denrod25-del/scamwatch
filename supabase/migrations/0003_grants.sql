-- 0003_grants.sql
-- Table/sequence/function privileges for the Supabase API roles.
--
-- RLS (0002) governs ROW visibility for anon/authenticated. These GRANTs are the
-- separate, table-level privilege layer: without them even an RLS-permitted query
-- fails with "permission denied for table". service_role bypasses RLS and needs
-- full privileges for trusted server-side / background work (and integration tests).

grant usage on schema public to anon, authenticated, service_role;

-- service_role: full access (RLS is bypassed for this role).
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all functions in schema public to service_role;

-- anon / authenticated: table privileges; RLS still gates which rows are visible.
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant usage, select on all sequences in schema public to anon, authenticated;

-- Apply the same defaults to objects created by later migrations.
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant all on functions to service_role;
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant select on tables to anon;
alter default privileges in schema public grant usage, select on sequences to anon, authenticated;
