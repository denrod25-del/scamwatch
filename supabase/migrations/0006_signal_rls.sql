-- 0006_signal_rls.sql
-- Public read access to the report→entity and report→threat join rows, but ONLY
-- when the underlying report is published. Without these, anon search reads no
-- community signal (the join tables had RLS enabled but no SELECT policy, so they
-- denied all). RLS thus gates signal visibility to published reports only.

create policy report_entities_read_published on public.report_entities
  for select using (
    exists (
      select 1 from public.reports r
      where r.id = report_entities.report_id
        and r.status = 'published'
        and r.deleted_at is null
    )
  );

create policy report_threats_read_published on public.report_threats
  for select using (
    exists (
      select 1 from public.reports r
      where r.id = report_threats.report_id
        and r.status = 'published'
        and r.deleted_at is null
    )
  );
