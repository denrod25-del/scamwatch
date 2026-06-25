-- 0000_extensions_and_enums.sql
-- Extensions + enum types for ScamWatch (PRD Vol 10).

create extension if not exists pgcrypto;     -- gen_random_uuid()
create extension if not exists pg_trgm;       -- fuzzy entity search
create extension if not exists vector;        -- pgvector embeddings (Vol 8/10)

-- Supabase Auth roles (shared context). Highest grant wins (resolved app-side / via has_role).
do $$ begin
  create type app_role as enum
    ('anonymous','member','contributor','moderator','analyst','admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type entity_type as enum
    ('phone','url','domain','email','wallet','handle','brand');
exception when duplicate_object then null; end $$;

-- Verdict vocabulary fixed by Vol 5/6.
do $$ begin
  create type verdict as enum
    ('likely_safe','no_signal','use_caution','likely_scam','confirmed_reported_scam');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_status as enum
    ('received','processing','published','rejected','withdrawn');
exception when duplicate_object then null; end $$;

do $$ begin
  create type campaign_status as enum
    ('candidate','active','dormant','archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type moderation_action_type as enum
    ('approve','reject','escalate','redact','takedown','restore','retract');
exception when duplicate_object then null; end $$;
