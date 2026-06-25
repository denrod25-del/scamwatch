-- 0007_rate_limit.sql
-- Postgres-backed rate limiting for the public write path (Vol 14 abuse prevention).
-- Chosen over in-memory (useless on serverless: per-instance, ephemeral) and over a
-- new external service (Redis/Upstash) — Postgres is already the shared store.

create table if not exists public.rate_limit_hits (
  id     bigint generated always as identity primary key,
  bucket text not null,
  hit_at timestamptz not null default now()
);
create index if not exists idx_rate_limit_hits_bucket
  on public.rate_limit_hits (bucket, hit_at);

-- RLS on with no policies: direct anon/authenticated access denied. Access is only
-- via the SECURITY DEFINER function below (and service_role, which bypasses RLS).
alter table public.rate_limit_hits enable row level security;

-- Sliding-window limiter. Returns TRUE if the call is allowed (and records a hit),
-- FALSE if the bucket is over `p_max` within the trailing `p_window_seconds`.
-- Slight over-admission under heavy concurrency is acceptable (mitigation, not a
-- hard security boundary).
create or replace function public.check_rate_limit(
  p_bucket text,
  p_max int,
  p_window_seconds int
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  cnt int;
begin
  -- Opportunistic cleanup so the table can't grow unbounded.
  delete from public.rate_limit_hits
    where hit_at < now() - make_interval(secs => greatest(p_window_seconds * 4, 3600));

  select count(*) into cnt
    from public.rate_limit_hits
    where bucket = p_bucket
      and hit_at > now() - make_interval(secs => p_window_seconds);

  if cnt >= p_max then
    return false;
  end if;

  insert into public.rate_limit_hits (bucket) values (p_bucket);
  return true;
end;
$$;

-- Callable only by trusted server code (service role). Not by anon/authenticated.
revoke all on function public.check_rate_limit(text, int, int) from public;
grant execute on function public.check_rate_limit(text, int, int) to service_role;
