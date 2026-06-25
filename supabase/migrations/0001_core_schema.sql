-- 0001_core_schema.sql
-- Core ScamWatch tables (PRD Vol 10). Postgres 15 + pgvector.
-- Domain objects: Report, Entity, Threat, Campaign, Verification, Explanation, Confidence.

-- updated_at trigger helper -------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- Identity ------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role    app_role not null,
  granted_at timestamptz not null default now(),
  primary key (user_id, role)
);

-- has_role helper used by RLS (0002).
create or replace function public.has_role(uid uuid, r app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = uid and role = r);
$$;

-- Reports -------------------------------------------------------------------
create table if not exists public.reports (
  id              uuid primary key default gen_random_uuid(),
  reporter_id     uuid references auth.users(id) on delete set null, -- null = anonymous
  channel         text not null,                  -- sms, email, web, phone, social…
  raw_text        text,
  status          report_status not null default 'received',
  idempotency_key text unique,                    -- Vol 11 idempotent submission
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz                      -- soft delete; purge per retention (Vol 10)
);
create trigger trg_reports_updated before update on public.reports
  for each row execute function public.set_updated_at();

create table if not exists public.report_media (
  id            uuid primary key default gen_random_uuid(),
  report_id     uuid not null references public.reports(id) on delete cascade,
  storage_path  text not null,                    -- private bucket; signed URLs only
  scanned       boolean not null default false,   -- server-side malware/content scan (Vol 13)
  exif_stripped boolean not null default false,   -- PII reduction before storage (Vol 8/14)
  created_at    timestamptz not null default now()
);

-- Entities ------------------------------------------------------------------
create table if not exists public.entities (
  id              uuid primary key default gen_random_uuid(),
  type            entity_type not null,
  value_canonical text not null,                  -- E.164 phone, normalized URL, etc.
  first_seen      timestamptz not null default now(),
  unique (type, value_canonical)
);

create table if not exists public.report_entities (
  report_id  uuid not null references public.reports(id) on delete cascade,
  entity_id  uuid not null references public.entities(id) on delete cascade,
  confidence numeric(4,3) not null default 0 check (confidence >= 0 and confidence <= 1),
  primary key (report_id, entity_id)
);

-- Threats -------------------------------------------------------------------
create table if not exists public.threats (
  id        uuid primary key default gen_random_uuid(),
  slug      text not null unique,
  category  text not null,
  title     text not null,
  summary   text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.report_threats (
  report_id  uuid not null references public.reports(id) on delete cascade,
  threat_id  uuid not null references public.threats(id) on delete cascade,
  confidence numeric(4,3) not null default 0 check (confidence >= 0 and confidence <= 1),
  abstained  boolean not null default false,      -- classifier may decline (Vol 8)
  primary key (report_id, threat_id)
);

-- Campaigns -----------------------------------------------------------------
create table if not exists public.campaigns (
  id         uuid primary key default gen_random_uuid(),
  status     campaign_status not null default 'candidate',
  title      text not null,
  confidence numeric(4,3) not null default 0 check (confidence >= 0 and confidence <= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_campaigns_updated before update on public.campaigns
  for each row execute function public.set_updated_at();

create table if not exists public.campaign_entities (
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  entity_id   uuid not null references public.entities(id) on delete cascade,
  primary key (campaign_id, entity_id)
);

create table if not exists public.campaign_reports (
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  report_id   uuid not null references public.reports(id) on delete cascade,
  primary key (campaign_id, report_id)
);

-- Official orgs + verification handoffs -------------------------------------
create table if not exists public.official_orgs (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  jurisdiction text,
  url          text not null,
  channels     text[]
);

create table if not exists public.verifications (
  id          uuid primary key default gen_random_uuid(),
  report_id   uuid references public.reports(id) on delete cascade,
  entity_id   uuid references public.entities(id) on delete set null,
  org_id      uuid not null references public.official_orgs(id),
  created_at  timestamptz not null default now()
);

-- Explanations + confidence scores ------------------------------------------
create table if not exists public.explanations (
  id            uuid primary key default gen_random_uuid(),
  report_id     uuid not null references public.reports(id) on delete cascade,
  summary       text not null,
  reasons       jsonb not null default '[]'::jsonb,
  model_version text,
  confidence    numeric(4,3) not null default 0 check (confidence >= 0 and confidence <= 1),
  created_at    timestamptz not null default now()
);

-- Polymorphic calibrated scores (per Vol 10; subject_type/subject_id pattern).
create table if not exists public.scores (
  id           uuid primary key default gen_random_uuid(),
  subject_type text not null,        -- 'report' | 'entity' | 'campaign' | 'report_threat'
  subject_id   uuid not null,
  verdict      verdict,
  confidence   numeric(4,3) not null default 0 check (confidence >= 0 and confidence <= 1),
  model_version text,
  created_at   timestamptz not null default now()
);
create index if not exists idx_scores_subject on public.scores (subject_type, subject_id);

-- Moderation + append-only audit log ----------------------------------------
create table if not exists public.moderation_actions (
  id         uuid primary key default gen_random_uuid(),
  actor_id   uuid references auth.users(id) on delete set null,
  action     moderation_action_type not null,
  target_type text not null,
  target_id  uuid not null,
  reason     text,
  created_at timestamptz not null default now()
);

-- Tamper-evident append-only log: hash chain over prev_hash (Vol 14).
create table if not exists public.audit_log (
  id          bigint generated always as identity primary key,
  actor_id    uuid,
  action      text not null,
  target_type text,
  target_id   uuid,
  payload     jsonb not null default '{}'::jsonb,
  prev_hash   text,
  row_hash    text not null,
  created_at  timestamptz not null default now()
);

-- Notifications + alerts ----------------------------------------------------
create table if not exists public.alert_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  geo         text,                  -- e.g. FL county / ZIP prefix
  category    text,                  -- threat category filter
  created_at  timestamptz not null default now()
);

create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null,
  body       text,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

-- Contributions + reputation ------------------------------------------------
create table if not exists public.contributions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  report_id  uuid references public.reports(id) on delete set null,
  kind       text not null,         -- report, confirm, correction…
  created_at timestamptz not null default now()
);

create table if not exists public.reputation (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  score      integer not null default 0,
  updated_at timestamptz not null default now()
);

-- Embeddings (pgvector) -----------------------------------------------------
create table if not exists public.embeddings (
  id         uuid primary key default gen_random_uuid(),
  owner_type text not null,          -- 'report' | 'threat' | 'entity'
  owner_id   uuid not null,
  embedding  vector(1536) not null,  -- text-embedding-3-small
  created_at timestamptz not null default now()
);

-- Indexes -------------------------------------------------------------------
create index if not exists idx_entities_value_trgm
  on public.entities using gin (value_canonical gin_trgm_ops);
create index if not exists idx_reports_status_live
  on public.reports (status) where deleted_at is null;
create index if not exists idx_report_entities_entity on public.report_entities (entity_id);
create index if not exists idx_campaign_entities_entity on public.campaign_entities (entity_id);
create index if not exists idx_embeddings_owner on public.embeddings (owner_type, owner_id);
create index if not exists idx_embeddings_hnsw
  on public.embeddings using hnsw (embedding vector_cosine_ops);
