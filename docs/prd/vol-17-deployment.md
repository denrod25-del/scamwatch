# Volume 17 — Deployment

> Part of the ScamWatch master PRD ("Project Sentinel"). Written against `_shared-context.md`. Do not contradict the shared context; this volume extends it.

This volume specifies how ScamWatch is **built, shipped, observed, and recovered**: the environment topology on Vercel + Supabase, the GitHub Actions CI/CD pipeline and quality gates, infrastructure-as-config, secrets/env management, observability (monitoring, metrics, tracing, uptime, RUM for Core Web Vitals), PII-safe structured logging and retention, alerting and on-call/incident response, backups (Postgres PITR, storage), disaster recovery with RPO/RTO targets and runbooks, and the release strategy (preview, canary/gradual, rollback, feature flags). It operationalizes Principles 3 (*Protect privacy*) and 5 (*Be transparent*) at the infrastructure layer. Requirement IDs use the prefix `DEP-17`.

## Table of Contents

1. [Environments](#1-environments)
2. [CI/CD Pipeline](#2-cicd-pipeline)
3. [Infrastructure-as-Config](#3-infrastructure-as-config)
4. [Secrets & Env Management](#4-secrets--env-management)
5. [Observability](#5-observability)
6. [Logging](#6-logging)
7. [Alerting & On-Call / Incident Response](#7-alerting--on-call--incident-response)
8. [Backups](#8-backups)
9. [Disaster Recovery](#9-disaster-recovery)
10. [Release Strategy](#10-release-strategy)
11. [Cross-Volume Dependencies](#11-cross-volume-dependencies)

---

## 1. Environments

**Purpose.** Provide isolated, reproducible dev / staging / prod environments with no data bleed and prod-like staging.

**Background.** Stack is fixed (shared context): Next.js on Vercel; Supabase (Postgres, Auth, Storage, Edge Functions). Three persistent environments plus ephemeral per-PR previews.

| Environment | Vercel | Supabase | Data |
|---|---|---|---|
| **dev** | Local + dev deploys | Dedicated dev project | Synthetic/seed only |
| **preview** (per PR) | Auto preview deploy | Points at staging (read-mostly) or branch DB | Synthetic; never prod PII |
| **staging** | `staging` project/branch | Dedicated staging project | De-identified, prod-shaped |
| **prod** | Production project | Production project | Live (Vol 10 governance) |

**Requirements.**

- `DEP-17.1.1` Each environment **MUST** be a separate Supabase project (separate DB, Auth, Storage, keys); no shared credentials across environments.
- `DEP-17.1.2` Prod PII **MUST NOT** be copied into non-prod; staging seeds **MUST** be synthetic or de-identified (ref Vol 10/14).
- `DEP-17.1.3` Staging **MUST** mirror prod's schema, extensions (`pgvector`, `pgmq`), edge functions, and config so releases are validated prod-like.
- `DEP-17.1.4` Environment selection **MUST** derive from typed config (4.x), never hard-coded URLs/keys.

**Acceptance Criteria.** `AC-17.1.a` A query proving any non-prod table holds prod PII fails CI/data audit. `AC-17.1.b` Schema diff staging↔prod is empty after a release.

**Edge Cases.** Migration applied to staging but not prod (gate blocks promote). Preview needing real-ish data (use seeded fixtures only).

**Security Considerations.** Network/key isolation per project; service-role keys server-only; row-level security (RLS) enforced identically across envs.

**Accessibility.** N/A (infrastructure) — stated explicitly.

**Performance.** Staging sized to approximate prod for meaningful load/perf tests.

**Future Expansion.** Per-region prod projects (Phase 2/3 data residency); ephemeral branch databases per PR (Supabase branching).

---

## 2. CI/CD Pipeline

**Purpose.** Every change passes automated quality gates before reaching users; promotion is controlled and auditable.

**Background.** GitHub + GitHub Actions (shared context). Quality gates defined in Vol 15 are enforced here.

**Pipeline stages (GitHub Actions):**

```
push / PR →
  1. install (cached)         2. lint (eslint)        3. typecheck (tsc --noEmit)
  4. unit/integration tests   5. build (next build)   6. db-migration check (dry-run)
  7. security scans (deps/secrets)                     8. preview deploy (Vercel)
  9. e2e + a11y on preview    10. quality gates (Vol 15)
→ merge to main → staging deploy → smoke tests → manual approval → prod promote (canary→full)
```

**Requirements.**

- `DEP-17.2.1` PRs **MUST** pass lint, typecheck, unit/integration tests, build, dependency + secret scans, and Vol 15 quality gates before merge; gates are **required** branch protections.
- `DEP-17.2.2` Each PR **MUST** produce a Vercel preview deploy; e2e + automated accessibility checks (WCAG 2.2 AA, ref Vol 15) **MUST** run against it.
- `DEP-17.2.3` Promotion to prod **MUST** require green staging smoke tests **and** explicit human approval (protected environment).
- `DEP-17.2.4` **DB migration workflow (Supabase):** migrations are versioned SQL in-repo, applied via Supabase CLI; CI **MUST** dry-run/validate migrations and verify they are **forward-only and backward-compatible** with the currently deployed app (expand-then-contract).
- `DEP-17.2.5` Migrations **MUST** be applied to staging and verified before prod; prod migration is a discrete, approved, audit-logged step.
- `DEP-17.2.6` The pipeline **MUST** be idempotent and re-runnable; every deploy records commit SHA, migration version, and actor.

**Acceptance Criteria.**

- `AC-17.2.a` A PR failing any gate cannot be merged (branch protection blocks).
- `AC-17.2.b` A destructive/non-backward-compatible migration is rejected by the migration check.
- `AC-17.2.c` Promote-to-prod is impossible without staging smoke pass + approval; both are recorded.

**Edge Cases.** Migration + code interdependency (enforce expand→deploy→contract across two releases). Flaky e2e (quarantine + retry policy, not blanket skips). Hotfix path (expedited but still gated).

**Security Considerations.** Secret-scanning + dependency audit block on high-severity; least-privilege CI tokens (OIDC to Vercel/Supabase, no long-lived secrets where possible); signed/pinned action versions.

**Accessibility.** a11y checks are a first-class, blocking gate — not optional.

**Performance.** Cache install/build; target PR pipeline < 10 min p95 to preserve velocity.

**Future Expansion.** Supabase branch DB per PR; mutation/contract testing; SBOM generation.

---

## 3. Infrastructure-as-Config

**Purpose.** Make infrastructure reproducible, reviewable, and versioned.

**Requirements.**

- `DEP-17.3.1` Vercel project config (`vercel.json`, env mappings, headers/CSP, redirects) **MUST** live in-repo and be code-reviewed.
- `DEP-17.3.2` Supabase config (`supabase/config.toml`, migrations, RLS policies, edge functions, scheduled cron, `pgmq` setup) **MUST** be in-repo and applied via CI, not hand-edited in dashboards.
- `DEP-17.3.3` Security headers (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) **MUST** be defined as config and verified in CI.
- `DEP-17.3.4` Any console-only change **MUST** be back-filled into config (drift is a defect).

**Acceptance Criteria.** `AC-17.3.a` Re-applying config to a clean project reproduces the environment. `AC-17.3.b` A drift check flags out-of-band dashboard changes.

**Edge Cases.** Emergency dashboard change during incident → tracked as drift, reconciled within SLA.

**Security Considerations.** Config PRs reviewed; CSP changes require security sign-off; no secrets in config files (4.x).

**Accessibility / Performance / Future Expansion.** N/A direct; headers tuned for performance/security; future: full IaC (Terraform) if multi-cloud/region.

---

## 4. Secrets & Env Management

**Purpose.** Keep credentials safe, environment-scoped, rotatable, and never client-exposed.

**Requirements.**

- `DEP-17.4.1` Secrets (Supabase service-role key, OpenAI key, signing secrets) **MUST** be stored in Vercel/Supabase/GitHub encrypted secret stores, scoped per environment; never committed.
- `DEP-17.4.2` Only `NEXT_PUBLIC_*` vars may reach the client; service-role and AI keys are **server/edge-only** and **MUST NOT** be exposed to the browser.
- `DEP-17.4.3` A typed env schema (e.g., zod) **MUST** validate presence/shape at build/boot; missing/invalid secrets fail fast.
- `DEP-17.4.4` Secrets **MUST** be rotatable without code change; a rotation runbook **MUST** exist; suspected exposure triggers immediate rotation + incident.
- `DEP-17.4.5` Access to prod secrets **MUST** be least-privilege and audit-logged.

**Acceptance Criteria.** `AC-17.4.a` A build with a missing required secret fails with a clear error. `AC-17.4.b` Grep/secret-scan proves no service-role/AI key is bundled client-side.

**Edge Cases.** Key rotation mid-deploy (support overlapping keys). Third-party key revocation (OpenAI) → graceful degradation + alert.

**Security Considerations.** Short-lived CI credentials via OIDC; quarterly rotation baseline; separation between who can read vs. set prod secrets.

**Accessibility / Performance / Future Expansion.** N/A; validation adds negligible startup cost; future: centralized secret manager / dynamic secrets.

---

## 5. Observability

**Purpose.** Know system health, performance, and real-user experience in real time.

**Requirements.**

- `DEP-17.5.1` **Monitoring/metrics MUST** cover: request rate/latency/error rate (RED) per route and edge function; DB health (connections, slow queries, replication lag); queue depth/age (`pgmq`); AI-call latency/error/cost (OpenAI); cron success.
- `DEP-17.5.2` **Tracing SHOULD** be distributed across Next.js → edge functions → Supabase → OpenAI with correlation IDs propagated end-to-end.
- `DEP-17.5.3` **Uptime** checks **MUST** monitor public site, auth, report-submission, and search from multiple regions; failures alert (7.x).
- `DEP-17.5.4` **RUM MUST** capture Core Web Vitals (LCP, INP, CLS) for real users, segmentable by route/device, with budgets and regression alerts.
- `DEP-17.5.5` A status/health endpoint **MUST** report dependency health for uptime checks and (optionally) a public status page (Principle 5).

**Acceptance Criteria.** `AC-17.5.a` A spike in 5xx on report-submission triggers an alert within the detection window. `AC-17.5.b` INP regressing past budget on a key route alerts the owning team. `AC-17.5.c` A trace ID ties a user error to its edge-function and DB spans.

**Edge Cases.** Vercel/Supabase platform outage (uptime distinguishes our fault vs. provider). OpenAI degradation (separate SLO + fallback signal). Metric cardinality blow-up (cap labels).

**Security Considerations.** Telemetry **MUST** be PII-safe (no report content, no raw identifiers); RUM consent-aware (ref Vol 18) and IP-truncated.

**Accessibility.** Any public status page meets WCAG 2.2 AA.

**Performance.** RUM/telemetry overhead minimal and async; sampling for high-volume traces.

**Future Expansion.** SLO/error-budget automation; anomaly detection; per-region observability (Phase 2/3).

---

## 6. Logging

**Purpose.** Structured, queryable, PII-safe logs with defined retention.

**Requirements.**

- `DEP-17.6.1` Logs **MUST** be structured JSON with: timestamp, severity, service, route/function, correlation/trace ID, and outcome.
- `DEP-17.6.2` Logs **MUST NOT** contain report content, screenshots, PII, secrets, or full tokens; sensitive fields **MUST** be redacted/hashed at the logging boundary.
- `DEP-17.6.3` **Security/audit logs** (auth events, moderation dispositions ref Vol 16, admin actions, secret access) **MUST** be separated, append-only, and retained per Vol 10 schedule.
- `DEP-17.6.4` Operational log retention **MUST** be defined and bounded; legal hold (Vol 14) overrides deletion.
- `DEP-17.6.5` Log access **MUST** be RBAC-gated and itself audited.

**Acceptance Criteria.** `AC-17.6.a` A log scan finds zero PII/secret leakage in a sample window. `AC-17.6.b` An auth-failure event appears in the audit log with correlation ID and is immutable.

**Edge Cases.** Error objects carrying request bodies (scrub before logging). High-volume error storms (rate-limit/sample logs, never drop audit logs).

**Security Considerations.** Redaction enforced centrally; tamper-evidence on audit logs; export restricted.

**Accessibility / Performance / Future Expansion.** N/A; async shipping to avoid request latency; future: log-based detections feeding T&S (Vol 16).

---

## 7. Alerting & On-Call / Incident Response

**Purpose.** Detect, route, and resolve incidents fast, with severity tiers aligned to Vol 14.

**Requirements.**

- `DEP-17.7.1` Alerts **MUST** map to **severity tiers (ref Vol 14)**; routing, page targets, and response targets differ per tier:

| Sev | Example | Ack target | Resolve target | Notify |
|---|---|---|---|---|
| **SEV1** | Site down; data exposure; auth broken | 15 min (paged 24/7) | ASAP | On-call + Lead + (security if data) |
| **SEV2** | Core flow degraded (submit/search) | 30 min | Same business day | On-call |
| **SEV3** | Partial/non-critical degradation | Next business day | Per backlog | Owning team |
| **SEV4** | Cosmetic/low | Backlog | Per backlog | Owning team |

- `DEP-17.7.2` An on-call rotation **MUST** exist with a primary + escalation path and a published schedule; paging **MUST** be reliable and tested.
- `DEP-17.7.3` Alerts **MUST** be actionable (linked runbook, owner, dashboards) and tuned to minimize noise/false pages.
- `DEP-17.7.4` Every SEV1/SEV2 **MUST** open an incident with timeline, comms, and a blameless post-incident review (PIR) with tracked action items.
- `DEP-17.7.5` **Data-exposure or crisis-safety incidents (ref Vol 16)** **MUST** trigger security/T&S + legal involvement and breach-notification assessment (CCPA/CPRA/GDPR-aware).

**Acceptance Criteria.** `AC-17.7.a` A simulated SEV1 pages on-call ≤ 15 min and opens an incident record. `AC-17.7.b` Every SEV1/2 has a PIR with action items within the defined window.

**Edge Cases.** Provider (Vercel/Supabase/OpenAI) outage → status comms + degrade gracefully. Alert storm → dedup/group. On-call unreachable → auto-escalate.

**Security Considerations.** Incident comms avoid leaking sensitive data; security incidents follow a separate, access-restricted track.

**Accessibility.** Status communications accessible; incident tooling WCAG 2.2 AA where staff-facing.

**Performance.** Alerting detection within defined windows; paging latency monitored.

**Future Expansion.** Error-budget-driven paging; auto-remediation runbooks; public incident history (Principle 5).

---

## 8. Backups

**Purpose.** Guarantee recoverable data with tested restores.

**Requirements.**

- `DEP-17.8.1` Postgres **MUST** have **Point-In-Time Recovery (PITR)** enabled in prod with a defined retention window.
- `DEP-17.8.2` Supabase **Storage** (scam screenshots/media) **MUST** be backed up/redundant per provider durability guarantees; deletion respects retention + legal hold.
- `DEP-17.8.3` Restores **MUST** be tested on a schedule (restore drill) and the result recorded; an untested backup is treated as no backup.
- `DEP-17.8.4` Backups **MUST** be encrypted at rest and access-controlled; restoring prod data into non-prod is prohibited unless de-identified.

**Acceptance Criteria.** `AC-17.8.a` A quarterly restore drill recovers DB to a target timestamp and validates integrity. `AC-17.8.b` PITR window meets the RPO in §9.

**Edge Cases.** Logical corruption replicated to backups (PITR to before-corruption point; keep older restore points). Right-to-erasure vs. backups (documented reconciliation, Vol 14).

**Security Considerations.** Backup credentials least-privilege; restore actions audited; no backup data in logs.

**Accessibility / Performance / Future Expansion.** N/A; restores sized to meet RTO; future: cross-region backup copies (Phase 2/3).

---

## 9. Disaster Recovery

**Purpose.** Defined targets and runbooks to recover from major failures.

**Requirements.**

- `DEP-17.9.1` Targets **MUST** be set and reviewed: baseline **RPO ≤ 5 min** (via PITR/replication) and **RTO ≤ 4 h** for full service; both are configurable program parameters.
- `DEP-17.9.2` Failure scenarios **MUST** have runbooks: DB loss/corruption, Storage loss, region/provider outage (Vercel/Supabase), bad migration, leaked-secret compromise, and OpenAI outage (feature degradation).
- `DEP-17.9.3` Each runbook **MUST** specify detection, decision authority, steps, comms, validation, and rollback.
- `DEP-17.9.4` DR **MUST** be exercised periodically (tabletop + at least one live restore drill/year).

**Acceptance Criteria.** `AC-17.9.a` A DR drill restores service within RTO and loses ≤ RPO of data. `AC-17.9.b` Each listed scenario has a current, owned runbook.

**Edge Cases.** Provider-wide outage with no failover region at launch (documented accepted risk + comms; Phase 2/3 multi-region). Partial data loss (targeted PITR restore).

**Security Considerations.** Compromise scenarios include rotation, revocation, and forensic preservation (legal hold).

**Accessibility / Performance / Future Expansion.** N/A; targets tightened as scale grows; future: active-active multi-region, automated failover.

---

## 10. Release Strategy

**Purpose.** Ship safely with fast rollback and risk-limited rollout.

**Requirements.**

- `DEP-17.10.1` Every PR **MUST** get a preview deploy (immutable URL) for review/QA (ties to 2.x).
- `DEP-17.10.2` Prod rollouts **SHOULD** be gradual (canary/percentage or staged) with health watched against budgets; auto/one-click **rollback MUST** be available (Vercel instant rollback to prior deployment).
- `DEP-17.10.3` **Feature flags MUST** gate risky/incomplete features so deploy ≠ release; flags default safe-off and are togglable without redeploy.
- `DEP-17.10.4` Flags affecting user protection (e.g., disabling a warning, classifier, or verification routing) **MUST** require elevated approval and be audit-logged — never silently weaken protection (Principles 7, 9).
- `DEP-17.10.5` DB changes follow **expand→migrate→contract** so rollback never strands the schema (ties to 2.4).
- `DEP-17.10.6` Releases **MUST** be traceable: changelog/release notes mapping commits→deploy→flags, supporting transparency (Principle 5).

**Acceptance Criteria.** `AC-17.10.a` A bad canary auto/one-click rolls back within minutes without data loss. `AC-17.10.b` A protection-affecting flag flip is blocked without elevated approval and is logged. `AC-17.10.c` Rolling back code never breaks against the live schema (expand/contract verified).

**Edge Cases.** Canary masks low-traffic-route regression (route-level monitoring). Flag + migration coupling (sequence carefully). Long-lived flags (debt — periodic cleanup).

**Security Considerations.** Flag changes are privileged + audited; preview deploys never carry prod PII/secrets.

**Accessibility.** a11y validated on preview before promote (blocking, ties to 2.2).

**Performance.** Canary watches Core Web Vitals + RED; promote only within budgets.

**Future Expansion.** Automated progressive delivery tied to error budgets; experiment flags integrated with Vol 18 (with the guardrail that experiments never reduce user protection).

---

## 11. Cross-Volume Dependencies

| Depends on / relates to | For |
|---|---|
| **Vol 10 — Database** | Retention schedules, audit log, RLS, legal-hold semantics |
| **Vol 11 — (Abuse/Security)** | Sandboxed media handling, security scanning context |
| **Vol 12 — (AI/Intelligence)** | AI-call observability, cost/latency SLOs |
| **Vol 14 — (Legal/Severity)** | Severity tiers for alerting; breach notification; legal hold |
| **Vol 15 — (Quality Gates)** | Required CI gates and a11y gate enforced in the pipeline |
| **Vol 16 — Operations** | On-call ↔ T&S crisis escalation; incident comms; transparency data |
| **Vol 18 — Analytics** | RUM/CWV, consent-aware telemetry, release/experiment flags |

**Cross-volume assumptions made by this volume:** Vol 14 owns canonical severity-tier definitions (Vol 17 maps alerts to them); Vol 15 owns the quality-gate definitions (Vol 17 enforces them in CI); Vol 10 owns retention/legal-hold rules (Vol 17 implements backups/logging within them). RPO/RTO (5 min / 4 h), pipeline-time budget (10 min), and rotation cadences are configurable program parameters stated here as launch defaults, not immutable constants.
