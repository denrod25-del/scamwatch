-- 0008_report_processing.sql
-- Support for the report-processing worker (Vol 8).
--
-- After the worker runs (OCR/extract/classify/strip), a report awaits moderation
-- in `pending_review` — it is NOT auto-published (publishing is a trust decision,
-- Vol 16). pending_review reports stay hidden from anon (reports_read_published in
-- 0002 only exposes `published`).

alter type report_status add value if not exists 'pending_review';

alter table public.reports
  add column if not exists processed_at timestamptz;
