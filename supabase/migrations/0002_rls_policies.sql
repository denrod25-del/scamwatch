-- 0002_rls_policies.sql
-- Row-Level Security (PRD Vol 10 / Vol 14). RLS is a primary security control, not a convenience.
-- Anonymous = unauthenticated visitors get read-only access to PUBLISHED, non-deleted content.

-- Enable RLS -----------------------------------------------------------------
alter table public.profiles            enable row level security;
alter table public.user_roles          enable row level security;
alter table public.reports             enable row level security;
alter table public.report_media        enable row level security;
alter table public.entities            enable row level security;
alter table public.report_entities     enable row level security;
alter table public.threats             enable row level security;
alter table public.report_threats      enable row level security;
alter table public.campaigns           enable row level security;
alter table public.campaign_entities   enable row level security;
alter table public.campaign_reports    enable row level security;
alter table public.official_orgs       enable row level security;
alter table public.verifications       enable row level security;
alter table public.explanations        enable row level security;
alter table public.scores              enable row level security;
alter table public.moderation_actions  enable row level security;
alter table public.audit_log           enable row level security;
alter table public.alert_subscriptions enable row level security;
alter table public.notifications       enable row level security;
alter table public.contributions       enable row level security;
alter table public.reputation          enable row level security;
alter table public.embeddings          enable row level security;

-- Convenience: is the caller a staff role? (moderator/analyst/admin)
create or replace function public.is_staff(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(uid,'moderator')
      or public.has_role(uid,'analyst')
      or public.has_role(uid,'admin');
$$;

-- Public read of published, non-deleted intelligence -------------------------
-- DB-10: anonymous/any role may read published content.
create policy reports_read_published on public.reports
  for select using (status = 'published' and deleted_at is null);

create policy threats_read_all on public.threats
  for select using (true);

create policy entities_read_all on public.entities
  for select using (true);

create policy campaigns_read_active on public.campaigns
  for select using (status in ('active','dormant','archived'));

create policy official_orgs_read_all on public.official_orgs
  for select using (true);

create policy explanations_read_published on public.explanations
  for select using (
    exists (select 1 from public.reports r
            where r.id = explanations.report_id
              and r.status = 'published' and r.deleted_at is null)
  );

-- Members submit + see their own reports ------------------------------------
-- SEC-14: authenticated users may INSERT; reporter sees own (incl. unpublished).
create policy reports_insert_member on public.reports
  for insert to authenticated
  with check (reporter_id = auth.uid() or reporter_id is null);

create policy reports_read_own on public.reports
  for select to authenticated
  using (reporter_id = auth.uid());

create policy report_media_read_own on public.report_media
  for select to authenticated
  using (
    exists (select 1 from public.reports r
            where r.id = report_media.report_id and r.reporter_id = auth.uid())
  );

-- Staff: moderation visibility + queue --------------------------------------
create policy reports_read_staff on public.reports
  for select to authenticated using (public.is_staff(auth.uid()));

create policy moderation_actions_staff on public.moderation_actions
  for all to authenticated
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- Threats/campaigns are written only by elevated roles (or service role, which
-- bypasses RLS). No public write path.
create policy threats_write_staff on public.threats
  for all to authenticated
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- Per-user private data ------------------------------------------------------
create policy profiles_self on public.profiles
  for all to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy notifications_self on public.notifications
  for select to authenticated using (user_id = auth.uid());

create policy alert_subs_self on public.alert_subscriptions
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy reputation_read_self on public.reputation
  for select to authenticated using (user_id = auth.uid());

-- Audit log: append-only. No UPDATE/DELETE policy exists, so neither is permitted
-- under RLS (SEC-14). Reads restricted to admin.
create policy audit_log_read_admin on public.audit_log
  for select to authenticated using (public.has_role(auth.uid(),'admin'));
