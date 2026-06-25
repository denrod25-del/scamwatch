# Volume 13 — Backend Architecture

> ScamWatch (Project Sentinel). Authored against `_shared-context.md`. This volume is Supabase-centric and references — rather than restates — Volume 8 (AI pipeline), Volume 10 — Database (table names are canonical there), and Volume 11 — API Specification (the wire contract).

This volume describes how the ScamWatch backend is assembled on Supabase + Vercel: the high-level topology, the responsibilities split across Supabase Postgres / Auth / Storage / Edge Functions, the async job/queue system (with retry, DLQ, idempotency) that runs OCR, entity extraction, threat classification, campaign detection and notifications, scheduled cron jobs, the notification/alerting subsystem, object-storage design for scam screenshots, the caching strategy, AI-pipeline orchestration (ties to Volume 8), secrets management, multi-environment topology, scalability & failure-isolation, and cost controls. Requirements are tagged `BE-13.<section>.<n>`.

## Table of Contents

1. High-Level Architecture
2. Supabase Component Responsibilities
3. Job / Queue System
4. Scheduled Cron Jobs
5. Notification / Alerting Subsystem
6. Object Storage (scam screenshots)
7. Caching Strategy
8. AI Pipeline Orchestration (ties to Volume 8)
9. Secrets Management
10. Multi-Environment Topology
11. Scalability & Failure Isolation
12. Cost Controls

---

## 1. High-Level Architecture

### Purpose
Give one canonical topology picture for the whole backend.

### Background
Stack is fixed by shared context: Next.js/Vercel frontend + serverless/edge, Supabase (Postgres, Auth, Storage, Edge Functions), OpenAI for AI, pgvector for vectors, a DB-backed queue (pgmq) + cron for async work. The API contract is Volume 11; the data model is Volume 10; the AI stages are Volume 8.

### Architecture (text diagram)

```
                    ┌─────────────────────────────────────────────┐
   Browser /        │  Vercel (Next.js App Router)                │
   Mobile  ───────► │   • Public pages (edge-cached reads)         │
                    │   • /v1 route handlers (Volume 11)           │
                    └───────────────┬─────────────────────────────┘
                                    │ JWT (Supabase Auth) / anon key
                    ┌───────────────▼─────────────────────────────┐
                    │  Supabase                                    │
                    │  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
                    │  │ Postgres │  │  Auth    │  │  Storage   │  │
                    │  │ + RLS    │  │ email/OTP│  │ report-    │  │
                    │  │ + pgvec  │  │ + OAuth  │  │ media bkt  │  │
                    │  │ + pgmq   │  └──────────┘  └────────────┘  │
                    │  └────┬─────┘                                │
                    │       │ enqueue jobs / read+write (svc role) │
                    │  ┌────▼───────────────────────────────────┐ │
                    │  │ Edge Functions (Deno)                   │ │
                    │  │  workers: ocr, extract, classify,       │ │
                    │  │  campaign-detect, notify, scan, purge   │ │
                    │  └────┬──────────────────────┬─────────────┘ │
                    └───────┼──────────────────────┼───────────────┘
                            │                      │
                   ┌────────▼─────┐        ┌───────▼────────┐
                   │ OpenAI APIs  │        │ Email/OTP/SMS  │
                   │ LLM + embed  │        │ provider(s)    │
                   │ (Volume 8)   │        │ (abstraction)  │
                   └──────────────┘        └────────────────┘
```

### Requirements
- `BE-13.1.1` The backend **MUST** be Supabase-centric: Postgres (incl. pgvector + pgmq), Auth, Storage, Edge Functions — no separate primary datastore at launch (Volume 10 §1).
- `BE-13.1.2` All client access **MUST** go through the Volume 11 `/v1` surface; Edge Functions and the service-role key **MUST** be server-side only.
- `BE-13.1.3` Synchronous request paths **MUST NOT** call OpenAI inline; AI work **MUST** be enqueued (BE-13.3, Volume 11 §8).
- `BE-13.1.4` Failure of any async/AI subsystem **MUST NOT** break core read/submit paths (failure isolation, §11).

### Acceptance Criteria
- AC: Given OpenAI is down, when a report is submitted, then `POST /reports` still returns `201` and jobs queue for later (Volume 11 AC).
- AC: Given a public read, when served, then no service-role secret is involved.

### Edge Cases / Security / Accessibility / Performance / Future
- Edge: Vercel/Supabase region mismatch adds latency — co-locate (US-East at launch). Security: service-role isolation. A11y: N/A (infra); user-facing a11y in frontend volumes. Performance: edge cache fronts reads (§7). Future: multi-region read replicas (Phase 2/3).

---

## 2. Supabase Component Responsibilities

### Purpose
Pin what each Supabase capability owns.

### Responsibilities

| Component | Owns | Notes |
|---|---|---|
| Postgres | All canonical data (Volume 10), RLS authorization, pgvector ANN, pgmq queue tables | single source of truth |
| Auth | Identity, email/OTP + OAuth, JWT issuance, `auth.users` | mirrored to `profiles` (Volume 10 §3) |
| Storage | `report-media` private bucket, signed URLs | bytes never in Postgres (§6) |
| Edge Functions | Async workers, webhook signing, scan triggers, notification dispatch, purge | run with service role |

### Requirements
- `BE-13.2.1` Postgres **MUST** be the single source of truth; caches/queues/indexes are derived and reconstructable.
- `BE-13.2.2` Authorization **MUST** be enforced by Postgres RLS (Volume 10 §16); Edge Functions using the service role **MUST** re-implement equivalent checks or operate only on trusted server-derived data.
- `BE-13.2.3` Auth **MUST** use Supabase email/OTP + OAuth; the backend **MUST NOT** mint its own long-lived tokens (Volume 11 §2).

### Acceptance / Edge / Security / A11y / Performance / Future
- AC: Disabling all Edge Functions still allows reads/writes (degraded: no async enrichment). Edge: Auth provider outage blocks new logins but not anon reads. Security: service-role confined to functions. A11y: N/A. Performance: each component scales independently. Future: pgbouncer/Supavisor tuning for connection scaling.

---

## 3. Job / Queue System

### Purpose
Run async work (OCR, entity extraction, threat classification, campaign detection, notifications, media scan, retraction propagation, purge) reliably with retry, DLQ, and idempotency.

### Background
Shared context mandates a DB-backed queue (pgmq) + Edge Function workers + cron. pgmq lives in Postgres, so enqueue is transactional with the originating write (e.g. report insert). Workers are invoked by a cron-driven dispatcher and/or Supabase queue triggers.

### Queue topology

| Queue | Producer | Worker | Downstream |
|---|---|---|---|
| `q_media_scan` | `POST /reports/{id}/media` finalize | scan worker | sets `report_media.scan_status` |
| `q_ocr` | scan worker (clean image) | OCR worker (Volume 8) | fills `report_media.ocr_text` |
| `q_extract` | report submit / OCR done | entity-extraction worker (Volume 8) | upserts `entities` + `report_entities` |
| `q_classify` | extract done | classification worker (Volume 8) | writes `report_threats` + `explanations` + `scores` |
| `q_campaign` | classify done | campaign-detect worker (Volume 8, pgvector) | writes `campaigns`/`campaign_*` |
| `q_notify` | campaign activate / status change | notify worker (§5) | `notifications` + provider send |
| `q_retract` | retraction (Volume 11 §8/§15) | propagation worker (Volume 10 §18) | recompute campaigns/explanations |
| `q_purge` | cron (§4) | purge worker | retention enforcement (Volume 10 §17) |
| `dlq_*` | failed jobs | manual/alert | dead-letter per source queue |

### Requirements
- `BE-13.3.1` Enqueue **MUST** be transactional with the originating DB write (pgmq in Postgres) so a committed report always has its jobs queued (no lost work).
- `BE-13.3.2` Every job **MUST** be idempotent and keyed by `(queue, subject_id, stage, content_hash)` so retries and at-least-once delivery do not double-write (aligns with Volume 10 dedupe: `entities` upsert, `embeddings` content_hash, notification `dedupe_key`).
- `BE-13.3.3` Jobs **MUST** use bounded exponential-backoff retries (e.g. max 5 attempts) with jitter; on exhaustion they **MUST** move to a per-source DLQ (`dlq_*`), never silently drop.
- `BE-13.3.4` Workers **MUST** record outcome to `audit_log` for privileged stages (purge, retraction, moderation-triggered) and emit metrics (depth, age, failure rate).
- `BE-13.3.5` A poisoned message in a DLQ **MUST** raise an operational alert and **MUST NOT** block the live queue.
- `BE-13.3.6` Long jobs **MUST** be chunked/visibility-timeout-managed so a worker crash re-delivers rather than losing progress.

### Acceptance Criteria
- AC: Given a report submit that commits, when inspected, then `q_ocr`/`q_extract` (as applicable) contain its job in the same transaction boundary.
- AC: Given a worker that fails 5×, then the message is in `dlq_*` and an alert fired; the source queue keeps draining.
- AC: Given the same extraction job delivered twice, then `entities`/`report_entities` are written once (upsert/dedupe).

### Edge Cases
- Out-of-order delivery (classify before extract finishes) → workers check preconditions and re-enqueue with delay if not ready.
- Media that fails scan never enters `q_ocr` (`scan_status` gate, Volume 10 §4).

### Security Considerations
Workers run with service role (RLS bypass) — they **MUST** operate only on server-validated subject IDs and **MUST NOT** accept arbitrary client-supplied SQL/filters. DLQ contents may contain PII (raw_text) and follow the same retention.

### Accessibility
N/A (backend). Operational: queue dashboards should be readable by on-call.

### Performance
Queue depth/age are primary SLOs; autoscale worker invocation by depth. Target: enrichment completes within minutes of submit (Volume 8 budgets).

### Future Expansion
- Priority lanes (e.g. high-velocity local campaigns) and a dedicated DLQ-replay tool.

---

## 4. Scheduled Cron Jobs

### Purpose
Run periodic maintenance and detection sweeps.

### Cron catalog

| Schedule | Job | Action |
|---|---|---|
| every 1 min | queue dispatcher | invoke workers per queue depth |
| every 5 min | campaign sweep | re-cluster recent reports (pgvector), update `campaigns` |
| hourly | local-alert builder | match active `campaigns` ↔ `alert_subscriptions` → `q_notify` |
| hourly | embedding backfill | embed any new report/entity missing `embeddings` |
| daily | retention purge | enqueue `q_purge` per Volume 10 §17 schedule |
| daily | official-org link check | verify `official_orgs.report_url` reachable (alert on break) |
| daily | metrics/transparency rollup | aggregate de-identified stats (Volume 11 §17) |
| weekly | DLQ review report | summarize dead-lettered jobs for ops |

### Requirements
- `BE-13.4.1` Cron jobs **MUST** be defined via Supabase scheduled functions / `pg_cron` and **MUST** be idempotent (safe to double-fire).
- `BE-13.4.2` The retention purge cron **MUST** enforce Volume 10 §17 exactly and **MUST** write `audit_log` per batch.
- `BE-13.4.3` Cron jobs **MUST** be observable (last-run, duration, success) and alert on missed/failed runs.
- `BE-13.4.4` The official-org link check **MUST** alert (not auto-edit) when a `report_url` breaks (Volume 10 §8 security).

### Acceptance / Edge / Security / A11y / Performance / Future
- AC: Daily purge runs and leaves an audit trail; a missed run alerts. Edge: overlapping runs guarded by advisory lock. Security: cron uses service role, audited. A11y: N/A. Performance: heavy sweeps batched/off-peak. Future: dynamic schedules by region/volume.

---

## 5. Notification / Alerting Subsystem

### Purpose
Deliver email/OTP and local-campaign alerts via a provider-abstracted dispatcher.

### Background
Auth OTP is delivered through Supabase Auth's provider; product notifications (local alerts, report-status, moderation) go through `q_notify` → a provider abstraction. Data model is `notifications` + `alert_subscriptions` (Volume 10 §11); API surface is Volume 11 §14.

### Provider abstraction
```
notify worker → ChannelDispatcher
                 ├─ EmailProvider   (e.g. transactional email vendor)
                 ├─ OTPProvider     (Supabase Auth)
                 └─ SMSProvider     (optional; abstract interface)
```

### Requirements
- `BE-13.5.1` The notification subsystem **MUST** sit behind a provider interface so vendors can be swapped without touching producers; provider keys live in secrets (§9).
- `BE-13.5.2` Sends **MUST** be idempotent via `notifications.dedupe_key` (Volume 10 §11) — a re-run of the hourly local-alert builder **MUST NOT** double-notify.
- `BE-13.5.3` Local-campaign alerts **MUST** match `campaigns.region_scope` + category against active `alert_subscriptions` and respect user channel choice; users with no `region_code` **MUST NOT** receive them.
- `BE-13.5.4` Notification copy **MUST** be calibrated and trauma-aware (Principles 2/6) and **MUST** route to official verification where relevant (Principle 7).
- `BE-13.5.5` Delivery failures **MUST** retry/back off and dead-letter (`status='failed'`, BE-13.3.3); bounces/unsubscribes **MUST** deactivate the channel.

### Acceptance Criteria
- AC: Given a newly activated FL campaign, when the hourly builder runs twice, then each matching subscriber receives exactly one notification (dedupe).
- AC: Given an email hard-bounce, then that channel is marked failed and not retried indefinitely.

### Edge Cases / Security / A11y / Performance / Future
- Edge: subscriber timezone batching for digest mode. Security: no PII in webhook payloads beyond IDs (Volume 11 §19). A11y: emails meet plain-language + WCAG email guidance (frontend/content volumes). Performance: fan-out batched. Future: web-push + in-app real-time channel.

---

## 6. Object Storage (scam screenshots)

### Purpose
Safely store and serve scam screenshots/media.

### Background
Bytes live in Supabase Storage (`report-media` bucket), metadata in `report_media` (Volume 10 §4). Uploads are direct signed PUT (Volume 11 §8); reads are short-lived signed GET, gated on scan + EXIF stripping.

### Bucket design

| Bucket | Visibility | Contents |
|---|---|---|
| `report-media` | private | original uploads (quarantined until clean) |
| `report-media-derived` | private | EXIF-stripped, resized display variants, OCR thumbnails |
| `transparency` | public-read | published transparency assets only |

### Requirements
- `BE-13.6.1` The `report-media` bucket **MUST** be private; all access **MUST** be via short-lived signed URLs minted server-side after authorization (Volume 11 §2).
- `BE-13.6.2` On upload finalize, the scan worker **MUST** run malware/abuse scanning; objects **MUST** remain unreadable (`scan_status != 'clean'`) until scanning passes (Volume 10 DB-10.4.4).
- `BE-13.6.3` EXIF/PII metadata **MUST** be stripped before any derived/display variant is produced; `exif_stripped=true` is required before serving (Volume 10 §4/§19).
- `BE-13.6.4` Original bytes **MUST** be purged per retention (365 days, Volume 10 §17) while de-identified `ocr_text`/`sha256` are retained.
- `BE-13.6.5` Signed URLs **MUST** be single-use-intent, short TTL (≤5 min), and never logged in full.

### Acceptance Criteria
- AC: Given an unscanned upload, when a signed GET is requested, then it is refused (Volume 11 `409 media_unscanned`).
- AC: Given a display variant, when produced, then EXIF GPS/PII is absent.

### Edge Cases / Security / A11y / Performance / Future
- Edge: huge upload rejected by size limit pre-signed-URL. Security: quarantine-until-clean; signed URL TTL; no public original bucket. A11y: `ocr_text` powers alt-text (positive a11y enabler). Performance: derived variants + CDN for display. Future: perceptual-hash dedupe + on-device pre-blur of victim PII.

---

## 7. Caching Strategy

### Purpose
Serve public reads fast and cheaply without leaking private data.

### Layers

| Layer | What | Invalidation |
|---|---|---|
| Vercel edge cache | public GETs (`/threats`, `/transparency`, popular `/search/check`) | TTL + tag purge on publish |
| Postgres materialized views | aggregate stats, threat lists, campaign summaries | refreshed by cron (§4) |
| Result cache (edge KV) | normalized `/search/check` answers, rate-limit counters | short TTL + entity-update purge |
| pgvector query cache | hot semantic-search results keyed by query embedding hash | TTL; bypass on new high-signal data |

### Requirements
- `BE-13.7.1` Only public, non-PII responses (Volume 11 public scopes) **MAY** be edge-cached; authenticated/PII responses **MUST** be `private, no-store`.
- `BE-13.7.2` Cache keys for `/search/check` **MUST** use `value_norm` (Volume 10/11) so format variants share a cache entry.
- `BE-13.7.3` Publishing/retracting a report or updating an entity/threat **MUST** purge dependent cache tags (correctness over staleness for risk data).
- `BE-13.7.4` Rate-limit counters (Volume 11 §4) **MUST** be backed by a fast shared store (edge KV/Redis-equivalent), not Postgres on the hot path.
- `BE-13.7.5` Stale-while-revalidate **MAY** be used for educational content (`/threats`) but **MUST NOT** serve stale "safe/risk" verdicts after a retraction.

### Acceptance Criteria
- AC: Given two phone-format variants, when checked, then they hit the same `value_norm` cache entry.
- AC: Given a retraction, when it commits, then cached verdicts referencing it are purged before the next public read.

### Edge Cases / Security / A11y / Performance / Future
- Edge: cache stampede guarded by request coalescing. Security: never cache PII; per-user data `no-store`. A11y: N/A. Performance: this section is the read-latency contract. Future: regional cache partitioning (Phase 2/3).

---

## 8. AI Pipeline Orchestration (ties to Volume 8)

### Purpose
Orchestrate the AI stages without restating Volume 8's model/prompt details.

### Background
Volume 8 defines the OCR → entity-extraction → classification → campaign-detection → explanation stages and their models/prompts. This volume defines how they are *driven*: each stage is a queue worker (§3) that reads from and writes to Volume 10 tables and produces calibrated outputs surfaced via Volume 11.

### Orchestration contract

```
report submit ─► q_ocr ─► q_extract ─► q_classify ─► q_campaign
                  │          │             │              │
            ocr_text   entities/      report_threats   campaigns/
            (10§4)     report_entities explanations/    campaign_* (10§7)
                       (10§5)         scores (10§9)
                                          └─► embeddings (10§13) for semantic/campaign
```

### Requirements
- `BE-13.8.1` Each AI stage **MUST** be a discrete idempotent worker writing only the Volume 10 tables it owns (single-writer per table-stage) to avoid races.
- `BE-13.8.2` Every model output **MUST** persist `confidence` and `model_version` (Volume 10 §6/§9) so Volume 11 can render calibrated, non-factual language (Principles 5/6).
- `BE-13.8.3` Stage outputs **MUST** be reproducible/re-runnable: re-running a stage on unchanged input (content_hash) **MUST** be a no-op (Volume 10 embeddings/entities dedupe).
- `BE-13.8.4` AI provider failures **MUST** retry/DLQ (§3) and **MUST NOT** fail the user's submit; partial pipelines leave the report in a valid intermediate `status`.
- `BE-13.8.5` Cost/latency budgets per stage **MUST** be enforced (timeouts, token caps) and breaches alerted (§12).
- `BE-13.8.6` Entities flagged `is_official` (allow-list, Volume 10 §5) **MUST** short-circuit classification to avoid over-flagging legitimate infrastructure.

### Acceptance Criteria
- AC: Given a submit, when the pipeline completes, then `report_threats`, `explanations`, and (where applicable) `campaign_*` rows exist, each with confidence + model_version.
- AC: Given a re-run on identical content, then no duplicate embeddings/entities are written.

### Edge Cases / Security / A11y / Performance / Future
- Edge: OCR yields empty text → extraction works from raw_text only. Security: prompts/inputs may contain attacker payloads — treat as untrusted; never execute extracted URLs. A11y: explanations structured for screen readers (Volume 11 §13). Performance: per-stage budgets (§12). Future: human-in-the-loop review lane for low-confidence classifications (analyst).

---

## 9. Secrets Management

### Purpose
Manage all secrets (service-role key, OpenAI key, provider keys, webhook/HMAC secrets, Vault data keys).

### Requirements
- `BE-13.9.1` Secrets **MUST** be stored in Supabase Vault and/or Vercel encrypted env vars; they **MUST NOT** be committed to GitHub or shipped to clients.
- `BE-13.9.2` The Supabase service-role key **MUST** be used only inside Edge Functions/server runtime; the anon key is the only key ever sent to browsers (Volume 11 §2).
- `BE-13.9.3` Application-level encryption keys (Volume 10 §19) **MUST** live in Vault with documented rotation; rotation **MUST NOT** require data re-encryption downtime (envelope encryption).
- `BE-13.9.4` Webhook HMAC secrets (Volume 11 §19) **MUST** be per-endpoint and rotatable.
- `BE-13.9.5` Secret access **MUST** be least-privilege per environment (§10) and audited.

### Acceptance / Edge / Security / A11y / Performance / Future
- AC: No secret appears in repo or client bundle (CI secret-scan gate). Edge: key rotation mid-flight handled by dual-key acceptance window. Security: this section is the secrets contract. A11y: N/A. Performance: N/A. Future: short-lived dynamic credentials.

---

## 10. Multi-Environment Topology

### Purpose
Define dev / staging / prod isolation.

### Topology

| Env | Supabase project | Vercel | Data |
|---|---|---|---|
| dev | isolated project (or Supabase branch) | preview deploys | synthetic/seed only |
| staging | isolated project | staging deploy | de-identified sample |
| prod | isolated project | production | real data, full retention |

### Requirements
- `BE-13.10.1` Each environment **MUST** be a fully isolated Supabase project (or Supabase branch DB) with its own keys; no shared prod credentials in lower envs.
- `BE-13.10.2` Migrations (Volume 10 §20) **MUST** flow dev → staging → prod via CI; prod migrations **MUST** be expand/backfill/contract safe.
- `BE-13.10.3` Lower environments **MUST NOT** contain real PII; staging uses de-identified samples.
- `BE-13.10.4` Edge Function deploys and cron schedules **MUST** be environment-scoped and promoted, not hand-edited in prod.

### Acceptance / Edge / Security / A11y / Performance / Future
- AC: A migration that passed staging applies cleanly to prod in CI. Edge: Supabase branch DBs for risky migrations. Security: prod isolation. A11y: N/A. Performance: N/A. Future: ephemeral per-PR preview databases.

---

## 11. Scalability & Failure Isolation

### Purpose
Keep the protective core available under load and partial failure.

### Requirements
- `BE-13.11.1` Read and submit paths **MUST** remain available if the AI/queue/notification subsystems are degraded (core-first; Principle 9 still served via cached/educational content).
- `BE-13.11.2` Database connections **MUST** be pooled (Supavisor/pgbouncer) so serverless concurrency does not exhaust Postgres connections.
- `BE-13.11.3` Each async subsystem **MUST** be independently scalable and circuit-broken: an OpenAI outage trips a breaker that pauses `q_classify`/`q_extract` without backpressuring submits.
- `BE-13.11.4` Public reads **MUST** be served largely from cache/CDN (§7) to absorb traffic spikes (e.g. a viral scam) without DB overload.
- `BE-13.11.5` Health checks + alerting **MUST** cover queue depth/age, DLQ size, DB connections, AI error rate, and notification failure rate.

### Acceptance / Edge / Security / A11y / Performance / Future
- AC: Under an OpenAI outage, submits/reads stay green; enrichment resumes when the breaker closes. Edge: traffic spike served from cache. Security: breaker prevents cascading failure. A11y: N/A. Performance: this section is the availability contract. Future: read replicas + multi-region (Phase 2/3).

---

## 12. Cost Controls

### Purpose
Keep the protective core free (Principle 4) and sustainable.

### Requirements
- `BE-13.12.1` AI spend **MUST** be bounded by per-stage token caps, model tiering (cheap model for extraction, stronger for classification per Volume 8), and embedding-dedupe (Volume 10 §13).
- `BE-13.12.2` Storage cost **MUST** be bounded by media retention purge (Volume 10 §17) + derived-variant compression (§6).
- `BE-13.12.3` Egress/DB cost **MUST** be bounded by aggressive public-read caching (§7) and cursor-only pagination (Volume 11 §3, anti-scraping).
- `BE-13.12.4` Cost **MUST** be observable per subsystem with budget alerts; sustained overage **MUST** alert before it degrades the free core.
- `BE-13.12.5` Abuse-driven cost (mass anonymous submits triggering AI) **MUST** be throttled at the edge (Volume 11 §4/§21) before reaching paid AI calls.

### Acceptance / Edge / Security / A11y / Performance / Future
- AC: A burst of anonymous submits is rate-limited before incurring OpenAI spend. Edge: AI budget breach pauses non-critical enrichment, not submits. Security: anti-scraping doubles as cost control. A11y: N/A. Performance: caching is both perf and cost lever. Future: tiered paid features fund the free core (per shared "free now / maybe-paid").

---

*End of Volume 13 — Backend Architecture.*
