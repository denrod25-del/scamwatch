-- 0011_sie_schema_updates.sql
-- Upgrades database schema to support Sentinel Intelligence Engine (SIE) structures.

-- Investigations -------------------------------------------------------------
create table if not exists public.investigations (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  status      text not null default 'active', -- 'active' | 'archived'
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_investigations_updated before update on public.investigations
  for each row execute function public.set_updated_at();

create table if not exists public.investigation_reports (
  investigation_id uuid not null references public.investigations(id) on delete cascade,
  report_id        uuid not null references public.reports(id) on delete cascade,
  primary key (investigation_id, report_id)
);

create table if not exists public.investigation_entities (
  investigation_id uuid not null references public.investigations(id) on delete cascade,
  entity_id        uuid not null references public.entities(id) on delete cascade,
  primary key (investigation_id, entity_id)
);

create table if not exists public.investigation_notes (
  id               uuid primary key default gen_random_uuid(),
  investigation_id uuid not null references public.investigations(id) on delete cascade,
  author_id        uuid references auth.users(id) on delete set null,
  content          text not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger trg_investigation_notes_updated before update on public.investigation_notes
  for each row execute function public.set_updated_at();

-- Timeline Events -------------------------------------------------------------
create table if not exists public.timeline_events (
  id           uuid primary key default gen_random_uuid(),
  subject_type text not null,        -- 'report' | 'campaign' | 'investigation'
  subject_id   uuid not null,
  event_type   text not null,        -- 'Report Submitted' | 'Campaign Linked' | 'Confidence Updated' | etc.
  description  text,
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists idx_timeline_events_subject on public.timeline_events(subject_type, subject_id);

-- Confidence History ----------------------------------------------------------
create table if not exists public.confidence_history (
  id                uuid primary key default gen_random_uuid(),
  subject_type      text not null,        -- 'report' | 'entity' | 'campaign'
  subject_id        uuid not null,
  evidence_conf     numeric(4,3) not null check (evidence_conf >= 0 and evidence_conf <= 1),
  model_conf        numeric(4,3) not null check (model_conf >= 0 and model_conf <= 1),
  community_conf    numeric(4,3) not null check (community_conf >= 0 and community_conf <= 1),
  historical_conf   numeric(4,3) not null check (historical_conf >= 0 and historical_conf <= 1),
  verification_conf numeric(4,3) not null check (verification_conf >= 0 and verification_conf <= 1),
  overall_conf      numeric(4,3) not null check (overall_conf >= 0 and overall_conf <= 1),
  reason            text,
  created_at        timestamptz not null default now()
);

create index if not exists idx_confidence_history_subject on public.confidence_history(subject_type, subject_id);

-- Evidence Nodes --------------------------------------------------------------
create table if not exists public.evidence_nodes (
  id         uuid primary key default gen_random_uuid(),
  report_id  uuid references public.reports(id) on delete cascade,
  entity_id  uuid references public.entities(id) on delete cascade,
  type       text not null,        -- 'regex' | 'llm' | 'email_header' | etc.
  confidence numeric(4,3) not null check (confidence >= 0 and confidence <= 1),
  metadata   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_evidence_nodes_report on public.evidence_nodes(report_id);
create index if not exists idx_evidence_nodes_entity on public.evidence_nodes(entity_id);

-- Reasoning Nodes -------------------------------------------------------------
create table if not exists public.reasoning_nodes (
  id           uuid primary key default gen_random_uuid(),
  subject_type text not null,        -- 'report' | 'entity' | 'campaign'
  subject_id   uuid not null,
  node_type    text not null,        -- 'verdict_rule' | 'rag_similarity' | etc.
  summary      text not null,
  weight       numeric(4,3) not null check (weight >= 0 and weight <= 1),
  confidence   numeric(4,3) not null check (confidence >= 0 and confidence <= 1),
  parent_id    uuid references public.reasoning_nodes(id) on delete cascade,
  created_at   timestamptz not null default now()
);

create index if not exists idx_reasoning_nodes_subject on public.reasoning_nodes(subject_type, subject_id);

-- Graph Edges -----------------------------------------------------------------
create table if not exists public.graph_edges (
  id          uuid primary key default gen_random_uuid(),
  source_type text not null,        -- 'entity' | 'report' | 'campaign'
  source_id   uuid not null,
  target_type text not null,        -- 'entity' | 'report' | 'campaign'
  target_id   uuid not null,
  edge_type   text not null,        -- 'extracted' | 'linked' | 'campaign_report'
  weight      numeric(4,3) not null check (weight >= 0 and weight <= 1),
  created_at  timestamptz not null default now()
);

create index if not exists idx_graph_edges_source on public.graph_edges(source_type, source_id);
create index if not exists idx_graph_edges_target on public.graph_edges(target_type, target_id);

-- Graph Snapshots -------------------------------------------------------------
create table if not exists public.graph_snapshots (
  id            uuid primary key default gen_random_uuid(),
  snapshot_data jsonb not null,
  created_at    timestamptz not null default now()
);

-- Enable RLS ------------------------------------------------------------------
alter table public.investigations       enable row level security;
alter table public.investigation_reports enable row level security;
alter table public.investigation_entities enable row level security;
alter table public.investigation_notes   enable row level security;
alter table public.timeline_events       enable row level security;
alter table public.confidence_history   enable row level security;
alter table public.evidence_nodes       enable row level security;
alter table public.reasoning_nodes       enable row level security;
alter table public.graph_edges           enable row level security;
alter table public.graph_snapshots       enable row level security;

-- Setup RLS Policies ----------------------------------------------------------
create policy investigations_staff on public.investigations
  for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create policy investigation_reports_staff on public.investigation_reports
  for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create policy investigation_entities_staff on public.investigation_entities
  for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create policy investigation_notes_staff on public.investigation_notes
  for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create policy timeline_events_read_all on public.timeline_events
  for select using (true);

create policy timeline_events_write_staff on public.timeline_events
  for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create policy confidence_history_read_all on public.confidence_history
  for select using (true);

create policy confidence_history_write_staff on public.confidence_history
  for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create policy evidence_nodes_read_all on public.evidence_nodes
  for select using (true);

create policy evidence_nodes_write_staff on public.evidence_nodes
  for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create policy reasoning_nodes_read_all on public.reasoning_nodes
  for select using (true);

create policy reasoning_nodes_write_staff on public.reasoning_nodes
  for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create policy graph_edges_read_all on public.graph_edges
  for select using (true);

create policy graph_edges_write_staff on public.graph_edges
  for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create policy graph_snapshots_staff on public.graph_snapshots
  for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
