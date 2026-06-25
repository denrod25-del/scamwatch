-- 0004_storage.sql
-- Private evidence bucket for scam-report screenshots (Vol 13).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'report-media',
  'report-media',
  false,                                   -- private; never publicly listable
  10485760,                                -- 10 MiB
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf']
)
on conflict (id) do nothing;

-- No storage RLS policies are defined: storage.objects has RLS enabled, so with no
-- permissive policy anon/authenticated are denied. Evidence is therefore reachable
-- only via the service_role (which bypasses RLS) — i.e. trusted server code that
-- uploads and issues short-lived signed URLs (Vol 14). Do NOT add a public policy.
