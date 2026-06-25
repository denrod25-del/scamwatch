# Volume 11 — API Specification

> ScamWatch (Project Sentinel). Authored against `_shared-context.md`. Table/entity names are the canonical ones defined in Volume 10 — Database. Backend wiring is detailed in Volume 13 — Backend Architecture; the AI pipeline contract is Volume 8.

This volume specifies the ScamWatch REST API: a versioned, JSON-over-HTTPS interface implemented as Next.js App Router route handlers and Supabase Edge Functions in front of the Postgres data model (Volume 10). It defines conventions, authentication and the role/scope model, the full endpoint catalog grouped by resource, cursor pagination, filtering/sorting, per-tier rate limits, idempotent report submission, a consistent error model, webhooks/notifications, versioning/deprecation, and anti-scraping/abuse protections. Requirements are tagged `API-11.<section>.<n>`.

## Table of Contents

1. Conventions
2. Authentication, Roles & Scopes
3. Pagination, Filtering & Sorting
4. Rate Limiting & Quotas
5. Idempotency
6. Error Model & Codes
7. Resource: Search
8. Resource: Reports
9. Resource: Entities
10. Resource: Threats
11. Resource: Campaigns
12. Resource: Verifications
13. Resource: Explanations
14. Resource: Alerts (subscriptions & notifications)
15. Resource: Moderation
16. Resource: Account & Reputation
17. Resource: Transparency
18. Resource: Admin
19. Webhooks & Notifications
20. Versioning & Deprecation
21. Anti-Scraping & Abuse Protections

---

## 1. Conventions

### Purpose
Define the invariant shape of every request/response so clients and tests can rely on it.

### Background
The API fronts Supabase (Volume 13). Read-heavy public endpoints are served via Next.js route handlers with edge caching; write/privileged/async-triggering endpoints are Supabase Edge Functions. PostgREST is **not** exposed directly to the public internet (anti-scraping, §21); all access is through the documented `/v1` surface.

### Requirements
- `API-11.1.1` Base URL **MUST** be `https://api.scamwatch.org/v1`; all paths in this volume are relative to it.
- `API-11.1.2` Versioning **MUST** be in the path (`/v1`); breaking changes ship under a new path segment (§20).
- `API-11.1.3` Requests and responses **MUST** be `application/json; charset=utf-8` (except media upload, which is direct-to-Storage signed PUT).
- `API-11.1.4` Resource names **MUST** be plural, lower-kebab nouns matching Volume 10 vocabulary: `reports`, `entities`, `threats`, `campaigns`, `verifications`, `explanations`, `alerts`, `notifications`, `moderation`, `account`, `transparency`, `admin`, `search`.
- `API-11.1.5` Timestamps **MUST** be RFC 3339 UTC (`2026-06-24T18:00:00Z`); IDs **MUST** be UUIDs (matching Volume 10 PKs).
- `API-11.1.6` All mutating endpoints **MUST** require HTTPS and reject plaintext; HSTS is enforced.
- `API-11.1.7` Every response **MUST** include `X-Request-Id` (UUID) echoed into `audit_log.meta` for traceability.
- `API-11.1.8` Calibrated-language contract: any response field carrying a model classification **MUST** include a sibling `confidence` (0–1) and the response envelope **MUST** carry `disclaimer` routing to official verification (shared Principles 5/6/7).

### Standard envelopes

```jsonc
// Collection response
{
  "data": [ /* resource objects */ ],
  "page": { "next_cursor": "eyJpZCI6Ii4uLiJ9", "has_more": true, "limit": 25 },
  "disclaimer": "Calibrated assessment, not legal advice. Verify with official sources."
}

// Single resource response
{ "data": { /* resource object */ }, "disclaimer": "..." }
```

### Acceptance Criteria
- AC: Given any 2xx collection response, when inspected, then it contains `data[]`, `page`, and `disclaimer`.
- AC: Given any classification field, when present, then a sibling `confidence` is present.

### Edge Cases
- Empty collection returns `data: []`, `page.has_more=false` — never 404.
- A field with no confidence yet (pending async) returns `confidence: null` plus `status:"processing"`.

### Security Considerations
No PostgREST passthrough; the `/v1` surface is the only contract. `X-Request-Id` enables audit correlation without exposing internal IDs.

### Accessibility
Operational a11y: error and disclaimer copy must be plain-language and trauma-aware so client UIs (frontend volumes, WCAG 2.2 AA) can surface it directly. Otherwise N/A at the wire level.

### Performance
JSON only; gzip/br negotiated. Public reads are edge-cacheable (§4, Volume 13).

### Future Expansion
- Optional GraphQL gateway and a typed SDK generated from the OpenAPI spec.

---

## 2. Authentication, Roles & Scopes

### Purpose
Define how callers authenticate and how the six roles map to scopes.

### Background
Auth = Supabase Auth (email/OTP + OAuth), shared context. The bearer token is a Supabase JWT. Anonymous (no token) gets a read-only public tier. Roles (`anonymous`/`member`/`contributor`/`moderator`/`analyst`/`admin`) come from `user_roles` (Volume 10 §3) and are enforced both at the API (scope check) and the database (RLS).

### Auth model
- `Authorization: Bearer <supabase_jwt>` for authenticated calls.
- Anonymous calls carry the public anon key only; they receive the `anonymous` tier.
- Internal service-to-service calls (Edge Functions, webhooks) use the service-role key, never exposed to clients (Volume 13 secrets).

### Role → scope mapping

| Role | Scopes |
|---|---|
| anonymous | `search:read`, `threats:read`, `entities:read:public`, `reports:read:public`, `transparency:read`, `reports:create` (anon, throttled) |
| member | + `reports:read:own`, `reports:create`, `alerts:manage`, `account:manage`, `verifications:read` |
| contributor | + `entities:read`, `reports:read:extended`, `votes:create` |
| moderator | + `reports:moderate`, `entities:write`, `moderation:read`, `media:read:raw` |
| analyst | + `campaigns:write`, `threats:write`, `explanations:write`, `classifications:review` |
| admin | `*` (all scopes, including `admin:*`, `official_orgs:write`) |

### Requirements
- `API-11.2.1` Every endpoint **MUST** declare a required scope; missing/invalid token on a protected scope returns `401`; valid token without scope returns `403`.
- `API-11.2.2` The API **MUST** treat the JWT as the source of identity and **MUST** rely on Postgres RLS (Volume 10 §16) as the enforcement backstop — API scope checks are defense-in-depth, not the only gate.
- `API-11.2.3` Anonymous report creation **MUST** be allowed but heavily throttled and CAPTCHA-gated (§21); anonymous callers **MUST NOT** read non-public data.
- `API-11.2.4` Token refresh/rotation is delegated to Supabase Auth; the API **MUST NOT** issue its own long-lived tokens.
- `API-11.2.5` `is_sensitive` reports (Volume 10) **MUST NOT** be returned to any caller lacking `reports:moderate` or ownership.

### Acceptance Criteria
- AC: Given an anon caller hitting `GET /reports/{id}` for an unpublished report, then `404` (not `403`, to avoid existence disclosure).
- AC: Given a member calling `POST /moderation/...`, then `403` with code `scope_required`.

### Edge Cases
- Expired JWT → `401 token_expired`; client refreshes via Supabase Auth.
- Role revoked mid-session → next RLS check denies even if JWT still valid until expiry (short token TTL mitigates).

### Security Considerations
Existence-hiding (`404` over `403`) on non-public resources. Service-role key strictly server-side. Scope strings are stable and versioned with the API.

### Accessibility
Operational a11y: `401`/`403` bodies include plain-language `message`.

### Performance
JWT verification is local (JWKS cached); no per-request auth DB round-trip.

### Future Expansion
- Per-key API tokens for trusted partners/researchers with their own scopes + quotas.

---

## 3. Pagination, Filtering & Sorting

### Purpose
Define a single, cursor-based pagination scheme and the filter/sort grammar.

### Requirements
- `API-11.3.1` Collections **MUST** use opaque cursor pagination via `?cursor=<token>&limit=<n>`; offset pagination **MUST NOT** be offered (anti-scraping + stability).
- `API-11.3.2` `limit` **MUST** default to 25, max 100; values above max are clamped and signaled in `page.limit`.
- `API-11.3.3` The cursor **MUST** be an opaque base64url token encoding the sort key + tiebreak `id`; clients **MUST NOT** parse it.
- `API-11.3.4` Sorting **MUST** be via `?sort=<field>` / `?order=asc|desc` from a per-endpoint allow-list; unknown fields return `422 invalid_sort`.
- `API-11.3.5` Filtering **MUST** use explicit query params per endpoint (e.g. `?type=phone&region=US-FL&since=...`); arbitrary column filters **MUST NOT** be accepted (no PostgREST-style operators exposed).

### Acceptance Criteria
- AC: Given `limit=500`, then response `page.limit=100` and at most 100 items.
- AC: Given a `next_cursor`, when replayed, then results continue without duplicates or gaps even if rows were inserted between calls.

### Edge Cases / Security / A11y / Performance / Future
- Edge: a stale cursor pointing past purged rows still returns a valid (possibly empty) page. Security: opaque cursors prevent enumeration. A11y: N/A. Performance: keyset pagination is index-friendly (Volume 10 BRIN/B-tree). Future: server-driven `Link` headers (RFC 8288) in addition to body cursors.

---

## 4. Rate Limiting & Quotas

### Purpose
Protect the platform and signal limits clearly per tier.

### Limits (per identity; sliding window)

| Tier | Read req/min | Write req/min | Report creates/hour | Search/min |
|---|---|---|---|---|
| anonymous (per IP) | 60 | 5 | 3 | 20 |
| member | 300 | 60 | 20 | 120 |
| contributor | 600 | 120 | 60 | 240 |
| internal (service-role) | unbounded* | unbounded* | — | — |

\*Internal calls are not user-rate-limited but are concurrency-bounded and queue-backed (Volume 13).

### Requirements
- `API-11.4.1` Every rate-limited response **MUST** include headers `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` (epoch seconds), and on rejection `Retry-After`.
- `API-11.4.2` Exceeding a limit **MUST** return `429` with error code `rate_limited`.
- `API-11.4.3` Anonymous limits **MUST** be keyed by client IP + coarse fingerprint; authenticated limits by `auth.uid()`.
- `API-11.4.4` Report-create quotas **MUST** be enforced independently of generic write limits (abuse-specific).

### Acceptance Criteria
- AC: Given 4 anonymous report creates within an hour, then the 4th returns `429` + `Retry-After`.
- AC: Every 2xx and 429 on a limited route carries `X-RateLimit-*` headers.

### Edge Cases / Security / A11y / Performance / Future
- Edge: NAT'd users share an IP bucket — authenticated tiers mitigate. Security: limits are a primary anti-scraping control (§21). A11y: N/A. Performance: counters in edge KV/Redis-equivalent (Volume 13 caching). Future: adaptive limits driven by abuse score.

---

## 5. Idempotency

### Purpose
Make report submission safe to retry (network flakiness, mobile).

### Requirements
- `API-11.5.1` `POST /reports` **MUST** accept an `Idempotency-Key` header (UUID); the server stores it in `reports.idempotency_key` (Volume 10 §4) scoped to the caller.
- `API-11.5.2` A retry with the same key + caller **MUST** return the original `201` resource (same `id`), not a duplicate, surfaced as `200` with `Idempotency-Replayed: true`.
- `API-11.5.3` For anonymous submissions (no `reporter_id`), idempotency **MUST** additionally fall back to a server-computed content hash (text+media sha256) to suppress duplicates within a short window (Volume 10 edge case).
- `API-11.5.4` Idempotency keys **MUST** be retained at least 24h.

### Acceptance Criteria
- AC: Given two `POST /reports` with the same `Idempotency-Key` and member, then exactly one report row exists and the second response carries `Idempotency-Replayed: true`.

### Edge Cases / Security / A11y / Performance / Future
- Edge: same key, different body → `409 idempotency_conflict`. Security: keys are per-caller (cannot probe others'). A11y: N/A. Performance: enforced by the unique index `uq_reports_idem`. Future: idempotency for other unsafe POSTs (votes).

---

## 6. Error Model & Codes

### Purpose
One consistent error shape across the whole API.

### Error envelope

```jsonc
{
  "error": {
    "code": "rate_limited",
    "message": "Too many requests. Please retry shortly.",
    "details": [ { "field": "limit", "issue": "out_of_range" } ],
    "request_id": "0f8d...-uuid",
    "doc_url": "https://docs.scamwatch.org/errors/rate_limited"
  }
}
```

### Error code table

| HTTP | code | Meaning |
|---|---|---|
| 400 | `bad_request` | Malformed request |
| 401 | `unauthenticated` | Missing/invalid token |
| 401 | `token_expired` | JWT expired |
| 403 | `scope_required` | Authenticated but lacks scope |
| 403 | `suspended` | Account suspended |
| 404 | `not_found` | Resource missing or not visible to caller |
| 409 | `conflict` | Generic state conflict |
| 409 | `idempotency_conflict` | Same key, different body |
| 409 | `media_unscanned` | Media not yet `clean` (Volume 10 §4) |
| 422 | `validation_failed` | Schema/semantic validation error |
| 422 | `invalid_sort` | Unsupported sort field |
| 429 | `rate_limited` | Tier limit exceeded |
| 451 | `legal_hold` | Resource withheld for legal reasons |
| 500 | `internal_error` | Unexpected server error |
| 503 | `dependency_unavailable` | Upstream (DB/AI/Storage) down |

### Requirements
- `API-11.6.1` Every non-2xx response **MUST** use this envelope with a stable `code` from the table and a human-readable, trauma-aware `message`.
- `API-11.6.2` `message` **MUST NOT** leak internal details (stack traces, SQL); `request_id` correlates to server logs/audit.
- `API-11.6.3` Validation errors **MUST** populate `details[]` with `field` + `issue`.

### Acceptance / Edge / Security / A11y / Performance / Future
- AC: Every documented endpoint's failure path returns a code from the table. Edge: unknown route → `404 not_found`. Security: no detail leakage. A11y: plain-language messages. Performance: errors are cheap, never cached. Future: localized messages keyed by `Accept-Language`.

---

## 7. Resource: Search

### Purpose
Let anyone look up "is this a scam?" by phone/URL/email/text — the primary public action ("Know Before You Click").

### Endpoints

| Method | Path | Scope | Description |
|---|---|---|---|
| GET | `/search` | `search:read` | Keyword/entity search across published reports, entities, threats |
| POST | `/search/check` | `search:read` | Check a specific value (phone/url/email/text) → matched entities + threats + confidence |
| GET | `/search/semantic` | `search:read` | Vector similarity search (pgvector, Volume 10 §13) |

### `POST /search/check`

Request:
```jsonc
{ "type": "url", "value": "http://t0ll-pay.example/redeem", "context": "Got this by SMS" }
```
Response `200`:
```jsonc
{
  "data": {
    "query": { "type": "url", "value_norm": "http://t0ll-pay.example/redeem" },
    "entity": { "id": "uuid", "type": "url", "report_count": 42, "first_seen_at": "..." },
    "threats": [
      { "id": "uuid", "slug": "toll-road-smishing", "name": "Toll-road smishing",
        "confidence": 0.91 }
    ],
    "explanation": { "id": "uuid", "body": "This matches a known toll-payment text pattern...",
                     "confidence": 0.91, "signals": ["lookalike domain","urgent payment ask"] },
    "verifications": [ { "org_code": "ftc", "report_url": "https://reportfraud.ftc.gov" } ],
    "risk": 0.88
  },
  "disclaimer": "Calibrated assessment, not legal advice. Verify with official sources."
}
```

Status codes: `200`, `422 validation_failed`, `429`, `503`.

### Requirements
- `API-11.7.1` `/search/check` **MUST** normalize `value` (E.164/punycode/etc., Volume 10 §5) before lookup and return `value_norm`.
- `API-11.7.2` Results **MUST** include `confidence` per threat and an `explanation` + `verifications`; the envelope **MUST** carry the disclaimer.
- `API-11.7.3` Unknown values (no match) **MUST** return `200` with empty `threats[]` and an "insufficient signal — verify with official sources" explanation, never a false "safe" assertion (Principle 6).
- `API-11.7.4` Live malicious URLs in responses **MUST** be defanged (e.g. `hxxp://`, no auto-linkable form) (Volume 10 §5 security).

### Acceptance Criteria
- AC: Given a known scam phone in any format, when checked, then it normalizes to one E.164 entity and returns matched threats with confidence.
- AC: Given an unknown URL, then `threats: []` and a non-alarming explanation, never `risk: 0` framed as "safe".

### Edge Cases / Security / A11y / Performance / Future
- Edge: ambiguous input (type omitted) → server infers `type`, may return multiple candidate interpretations. Security: defanged output; input is not stored unless the user submits a report. A11y: explanation copy plain-language. Performance: hot path — cached + indexed (Volume 10 §15, Volume 13 caching). Future: image/screenshot search (hash + embedding).

---

## 8. Resource: Reports

### Purpose
Submit and read scam encounters (the **Report**).

### Endpoints

| Method | Path | Scope | Description |
|---|---|---|---|
| POST | `/reports` | `reports:create` | Submit a report (idempotent) |
| GET | `/reports` | `reports:read:public`/`own` | List reports visible to caller |
| GET | `/reports/{id}` | scope-dependent | Get one report |
| POST | `/reports/{id}/media` | `reports:create` (owner) | Get a signed upload URL for a screenshot |
| POST | `/reports/{id}/retract` | `reports:moderate` or owner | Retract (propagates, Volume 10 §18) |
| GET | `/reports/{id}/status` | owner/staff | Async processing status |

### `POST /reports`

Headers: `Idempotency-Key: <uuid>` (§5).
Request:
```jsonc
{
  "channel": "sms",
  "raw_text": "Your package is held, pay $1.99 at t0ll-pay.example...",
  "reported_region": "US-FL",
  "occurred_at": "2026-06-20T14:00:00Z",
  "loss_amount": 0,
  "currency": "USD",
  "is_sensitive": false,
  "media": [ { "sha256": "base64...", "kind": "image", "byte_size": 84211 } ]
}
```
Response `201`:
```jsonc
{
  "data": {
    "id": "uuid", "status": "submitted", "channel": "sms",
    "reported_region": "US-FL", "created_at": "...",
    "media_uploads": [
      { "media_id": "uuid", "upload_url": "https://...signed-put...", "expires_at": "..." }
    ]
  },
  "disclaimer": "Thank you. Your report helps protect others. This is not legal advice; to report officially, see the suggested organizations."
}
```

Status codes: `201`, `200`(replayed), `409 idempotency_conflict`, `422`, `429`.

### Requirements
- `API-11.8.1` `POST /reports` **MUST** be idempotent (§5) and **MUST** accept anonymous submissions (throttled + CAPTCHA, §21).
- `API-11.8.2` On submit, the API **MUST** persist the report `status='submitted'` and enqueue async OCR/extraction/classification/campaign-detection jobs (Volume 13); the response **MUST NOT** block on AI.
- `API-11.8.3` Media **MUST** be uploaded via a returned short-lived signed PUT URL directly to the `report-media` bucket; bytes **MUST NOT** transit the JSON API (Volume 10 §4, Volume 13 storage).
- `API-11.8.4` `GET /reports` for `anonymous` **MUST** return only published, non-sensitive, de-identified `narrative` (never `raw_text`); owners see their own (Volume 10 RLS §16).
- `API-11.8.5` Retraction **MUST** require owner or `reports:moderate` and **MUST** trigger propagation (Volume 10 §18).
- `API-11.8.6` Trauma-aware copy: success/disclaimer messages **MUST** be victim-respecting (no blame/shame; Principle 2).

### Acceptance Criteria
- AC: Given a submit, then `201` with `status:"submitted"` and the report is queued, not classified inline.
- AC: Given an anon `GET /reports/{id}` for an unpublished report, then `404`.
- AC: Given an owner retract, then the report becomes `retracted` and dependent campaign/explanation propagation is enqueued.

### Edge Cases
- Submit with media whose `sha256` already exists for that report → deduped (Volume 10 `uq_media_sha`).
- `is_sensitive=true` (sextortion) → response copy routes to crisis/official resources; visibility restricted.

### Security Considerations
Anonymous abuse mitigated by quota + CAPTCHA + content hash dedupe. Raw text never returned to non-owners. Signed upload URLs are single-use, short TTL, and the object is unreadable until scanned + EXIF-stripped (Volume 10 §4, Volume 13).

### Accessibility
Operational a11y: status and disclaimer copy are plain-language; the frontend (other volumes) must meet WCAG 2.2 AA.

### Performance
Submit is a fast write + enqueue (<200ms server budget); heavy work is async (Volume 13).

### Future Expansion
- Bulk/partner ingestion endpoint with its own scope + idempotency.

---

## 9. Resource: Entities

### Purpose
Read fraud-infrastructure atoms (the **Entity**) and (staff) curate them.

### Endpoints

| Method | Path | Scope | Description |
|---|---|---|---|
| GET | `/entities` | `entities:read[:public]` | List/search entities |
| GET | `/entities/{id}` | `entities:read[:public]` | Entity detail + linked threats/campaigns |
| PATCH | `/entities/{id}` | `entities:write` | Staff edit (notes, `is_official`) |
| GET | `/entities/{id}/reports` | `reports:read:extended` | Reports linking this entity |

### Requirements
- `API-11.9.1` Public/anonymous entity reads **MUST** be defanged and **MUST NOT** expose raw victim PII inside `value_raw` (Volume 10 §5/§19); only `value_norm` (defanged) + aggregate stats.
- `API-11.9.2` Setting `is_official=true` **MUST** require `entities:write` and **MUST** suppress threat surfacing for that entity (Volume 10 DB-10.5.4).
- `API-11.9.3` Entity search **MUST** use the trigram/normalized indexes (Volume 10 §15), not arbitrary SQL filters.

### Acceptance / Edge / Security / A11y / Performance / Future
- AC: Anonymous `GET /entities/{id}` returns defanged `value_norm` + `report_count`, no `raw_text`. Edge: punycode entity shows confusable warning. Security: staff-gated `value_raw`. A11y: defang aids screen readers. Performance: indexed search. Future: entity reputation feed import endpoint.

---

## 10. Resource: Threats

### Purpose
Browse the classified scam patterns (the **Threat** taxonomy).

### Endpoints

| Method | Path | Scope | Description |
|---|---|---|---|
| GET | `/threats` | `threats:read` | List threats (filter by `category`) |
| GET | `/threats/{slug}` | `threats:read` | Threat detail (summary, indicators, related verifications) |
| POST | `/threats` | `threats:write` | Analyst create |
| PATCH | `/threats/{slug}` | `threats:write` | Analyst edit / deprecate (`is_active`) |

### Requirements
- `API-11.10.1` `GET /threats` **MUST** be fully public (educational core is free, Principle 4) and cacheable.
- `API-11.10.2` Threat `summary` copy **MUST** be calibrated and victim-respecting; threat detail **MUST** include suggested `verifications` (Volume 10 §8).
- `API-11.10.3` Deletion is prohibited; deprecate via `is_active=false` (Volume 10 DB-10.6.3).

### Acceptance / Edge / Security / A11y / Performance / Future
- AC: `GET /threats?category=investment_crypto` returns active threats in that category. Edge: deprecated threats hidden from public list, visible to staff. Security: writes analyst+. A11y: educational copy plain-language. Performance: heavily edge-cached. Future: localized threat content.

---

## 11. Resource: Campaigns

### Purpose
Expose correlated clusters (the **Campaign**) — mostly staff/analyst, with public summaries for active campaigns.

### Endpoints

| Method | Path | Scope | Description |
|---|---|---|---|
| GET | `/campaigns` | `campaigns:read`/public | List (public sees `active`+published) |
| GET | `/campaigns/{id}` | scope-dependent | Campaign detail (members, confidence) |
| POST | `/campaigns/{id}/merge` | `campaigns:write` | Merge into survivor (Volume 10 §7) |
| PATCH | `/campaigns/{id}` | `campaigns:write` | Status/label/region edits |

### Requirements
- `API-11.11.1` Public campaign reads **MUST** be limited to `active`, non-deleted campaigns with published summaries; member-level detail **MUST NOT** expose other users' unpublished reports (Volume 10 RLS).
- `API-11.11.2` Campaign labels/summaries **MUST NOT** name unproven private individuals (shared legal guardrails); they describe patterns/infrastructure with confidence.
- `API-11.11.3` Merge **MUST** re-point membership and set `merged_into`/`status='merged'` (Volume 10 §7) and emit `audit_log`.

### Acceptance / Edge / Security / A11y / Performance / Future
- AC: Public `GET /campaigns` excludes `candidate`/`closed`. Edge: merge is idempotent. Security: defamation-safe labels; audited merges. A11y: plain-language summaries. Performance: 2-hop membership reads indexed. Future: public local-campaign map (region-scoped).

---

## 12. Resource: Verifications

### Purpose
Surface official-org handoffs (the **Verification**) for any subject — always encourage official verification (Principle 7).

### Endpoints

| Method | Path | Scope | Description |
|---|---|---|---|
| GET | `/verifications` | `verifications:read` | Suggested orgs for `?subject_type=&subject_id=` |
| GET | `/official-orgs` | public | Registry of official orgs (FTC, IC3, CFPB, IRS, SSA, FL AG…) |

### `GET /verifications?subject_type=threat&subject_id=uuid` → `200`
```jsonc
{ "data": [
  { "org_code": "ftc", "name": "FTC", "report_url": "https://reportfraud.ftc.gov",
    "jurisdiction": "US", "rationale": "Handles consumer fraud reports" },
  { "org_code": "fl_ag", "name": "Florida Attorney General", "report_url": "https://...",
    "jurisdiction": "US-FL", "rationale": "State-level consumer protection" }
],
  "disclaimer": "ScamWatch is consumer protection, not legal advice. Report and verify with these official organizations." }
```

### Requirements
- `API-11.12.1` Every classification-bearing response across the API (search, reports, threats, campaigns) **MUST** be able to surface `verifications` for its subject.
- `API-11.12.2` `report_url`/`verify_url` **MUST** come from the admin-maintained allow-list (`official_orgs`, Volume 10 §8); arbitrary URLs **MUST NOT** appear.
- `API-11.12.3` Florida-launch orgs **MUST** be prioritized for `US-FL` subjects; national orgs always included.

### Acceptance / Edge / Security / A11y / Performance / Future
- AC: A gov-impersonation threat returns IRS/SSA/FTC orgs. Edge: subject with no specific org → national defaults (FTC/IC3). Security: allow-listed URLs prevent phishing redirects. A11y: descriptive org labels. Performance: tiny, cacheable. Future: locale org sets (Phase 3).

---

## 13. Resource: Explanations

### Purpose
Serve the calibrated "why we think this" (the **Explanation**).

### Endpoints

| Method | Path | Scope | Description |
|---|---|---|---|
| GET | `/explanations` | scope-dependent | `?subject_type=&subject_id=` |
| GET | `/explanations/{id}` | scope-dependent | One explanation |
| POST | `/explanations` | `explanations:write` | Analyst author/override |

### Requirements
- `API-11.13.1` Explanations **MUST** return `body`, `signals[]`, and `confidence`; the API **MUST NOT** present them as fact and **MUST** attach the verify-with-official-sources disclaimer (Principles 5/6/7).
- `API-11.13.2` Only `is_published=true` explanations **MUST** be visible to public/members; staff see drafts.
- `API-11.13.3` Low-confidence explanations (`confidence < 0.4`) **MUST** be framed as "insufficient signal," not a warning (Volume 10 §9 edge).

### Acceptance / Edge / Security / A11y / Performance / Future
- AC: `GET /explanations?subject_type=report_threat&...` returns body+signals+confidence. Edge: unpublished hidden from public. Security: infrastructure/pattern claims only. A11y: structured `signals[]` for screen readers. Performance: per-subject indexed. Future: multilingual explanations.

---

## 14. Resource: Alerts (subscriptions & notifications)

### Purpose
Manage local-campaign alert subscriptions and read user notifications.

### Endpoints

| Method | Path | Scope | Description |
|---|---|---|---|
| GET | `/alerts/subscriptions` | `alerts:manage` | List own subscriptions |
| POST | `/alerts/subscriptions` | `alerts:manage` | Create (region + categories + channel) |
| PATCH | `/alerts/subscriptions/{id}` | `alerts:manage` | Update / deactivate |
| DELETE | `/alerts/subscriptions/{id}` | `alerts:manage` | Deactivate (soft, Volume 10 §11) |
| GET | `/notifications` | `account:manage` | List own notifications |
| POST | `/notifications/{id}/read` | `account:manage` | Mark read |

### Requirements
- `API-11.14.1` Subscriptions **MUST** be unique per `(user, region, channel)` (Volume 10 §11) and **MUST** be deactivatable, not destructively deleted where audit is needed.
- `API-11.14.2` Notifications **MUST** be readable only by their owner (RLS); marking read sets `read_at`.
- `API-11.14.3` Local-campaign alerts are produced by the backend (Volume 13); this resource **MUST NOT** allow clients to send notifications to others.

### Acceptance / Edge / Security / A11y / Performance / Future
- AC: Creating a duplicate subscription returns `409 conflict`. Edge: no `region_code` → no local alerts. Security: owner-only. A11y: notification payload copy plain-language. Performance: indexed by user+status. Future: web-push channel.

---

## 15. Resource: Moderation

### Purpose
Moderator/analyst review queue, takedowns, and appeals (supports the legal moderation+appeal flow).

### Endpoints

| Method | Path | Scope | Description |
|---|---|---|---|
| GET | `/moderation/queue` | `reports:moderate` | Pending reports/media |
| POST | `/moderation/{subject_type}/{id}/decision` | `reports:moderate` | approve/reject/redact/takedown |
| POST | `/moderation/{subject_type}/{id}/appeal` | member (owner) | Open an appeal |
| POST | `/moderation/appeals/{id}/resolve` | `reports:moderate` | Grant/deny appeal |

### `POST /moderation/report/{id}/decision`
```jsonc
{ "action": "redact", "reason": "Contains third-party PII", "redactions": ["phone"] }
```
Response `200`: updated subject + recorded `moderation_actions` (Volume 10 §10).

### Requirements
- `API-11.15.1` Every decision **MUST** require a non-empty `reason` and **MUST** write `moderation_actions` + `audit_log` (Volume 10 §10).
- `API-11.15.2` Takedown/retraction decisions **MUST** trigger retraction propagation (Volume 10 §18).
- `API-11.15.3` Appeals **MUST** be openable by the affected owner and resolvable only by `moderator`+; the full appeal trail **MUST** be auditable (defamation defense).
- `API-11.15.4` `451 legal_hold` **MUST** be returned for resources withheld under legal hold; they **MUST NOT** be silently 404'd to staff.

### Acceptance / Edge / Security / A11y / Performance / Future
- AC: A redact decision with empty reason → `422`. Edge: appealing an already-resolved decision → `409`. Security: all actions audited. A11y: queue/decision copy plain-language. Performance: queue uses partial indexes (Volume 10). Future: ML-assisted triage ranking.

---

## 16. Resource: Account & Reputation

### Purpose
Self-service account, data rights (DSAR/erasure), and reputation/contributions.

### Endpoints

| Method | Path | Scope | Description |
|---|---|---|---|
| GET | `/account` | `account:manage` | Own profile |
| PATCH | `/account` | `account:manage` | Update display_name/locale/region |
| POST | `/account/export` | `account:manage` | Request DSAR export (async) |
| POST | `/account/delete` | `account:manage` | Request erasure (Volume 10 §17) |
| GET | `/account/reputation` | `account:manage` | Own reputation + tier |
| GET | `/account/contributions` | `account:manage` | Own contribution history |

### Requirements
- `API-11.16.1` DSAR export **MUST** include every PII-tagged field for the user (Volume 10 §19) and be delivered via a short-lived signed download.
- `API-11.16.2` Erasure **MUST** initiate the 30-day purge + tombstone re-attribution (Volume 10 §17/§18) and confirm via notification.
- `API-11.16.3` Reputation/contributions **MUST** be readable only by their owner (or staff read).

### Acceptance / Edge / Security / A11y / Performance / Future
- AC: `POST /account/delete` returns `202` and schedules erasure. Edge: erasure with reports under legal hold → those rows exempted + user informed. Security: DSAR export signed + expiring. A11y: confirmations plain-language. Performance: async export job (Volume 13). Future: granular consent toggles.

---

## 17. Resource: Transparency

### Purpose
Publish transparency data (Principle 5/8) — public, no auth.

### Endpoints

| Method | Path | Scope | Description |
|---|---|---|---|
| GET | `/transparency/reports` | public | Periodic transparency report metadata |
| GET | `/transparency/stats` | public | Aggregate, de-identified platform stats |
| GET | `/transparency/methodology` | public | How confidence/classification works |

### Requirements
- `API-11.17.1` Transparency endpoints **MUST** expose only aggregate, de-identified data (no row-level PII).
- `API-11.17.2` Methodology **MUST** describe confidence calibration and the "verify with official sources" stance.

### Acceptance / Edge / Security / A11y / Performance / Future
- AC: `/transparency/stats` returns counts/rates with no PII. Edge: small cohorts suppressed (k-anonymity). Security: aggregation only. A11y: plain-language. Performance: cached. Future: downloadable transparency datasets.

---

## 18. Resource: Admin

### Purpose
Administrative configuration (roles, official orgs, lookups, feature flags).

### Endpoints

| Method | Path | Scope | Description |
|---|---|---|---|
| POST | `/admin/users/{id}/roles` | `admin:*` | Grant/revoke roles |
| POST | `/admin/users/{id}/suspend` | `admin:*` | Suspend/restore |
| POST/PATCH | `/admin/official-orgs` | `admin:*` | Manage org registry |
| PATCH | `/admin/lookups/{table}` | `admin:*` | Manage threat_categories/regions |
| GET | `/admin/audit` | `admin:*` (read) | Read audit_log (no mutation) |

### Requirements
- `API-11.18.1` All admin actions **MUST** be `admin`-scoped, **MUST** write `audit_log`, and **MUST NOT** allow mutation/deletion of `audit_log` (Volume 10 §10).
- `API-11.18.2` Role grants **MUST** record `granted_by` (Volume 10 §3).
- `API-11.18.3` Official-org URL changes **MUST** be validated as https + allow-list-safe (Volume 10 §8).

### Acceptance / Edge / Security / A11y / Performance / Future
- AC: Admin reading audit cannot delete it (`403`/revoked). Edge: self-demotion guard (last admin cannot remove own admin). Security: every action audited. A11y: N/A. Performance: low-volume. Future: scoped admin sub-roles.

---

## 19. Webhooks & Notifications

### Purpose
Deliver async events to subscribed internal/partner systems and tie into the notification subsystem (Volume 13).

### Requirements
- `API-11.19.1` Webhook deliveries **MUST** be signed (HMAC, `X-ScamWatch-Signature`) with a per-endpoint secret; receivers **MUST** verify before trust.
- `API-11.19.2` Webhooks **MUST** be at-least-once with idempotency via an `event_id`; receivers de-dupe.
- `API-11.19.3` Event types **MUST** include `report.published`, `campaign.activated`, `local_campaign.alert`, `moderation.decided`, `retention.purged`.
- `API-11.19.4` User-facing notifications (email/OTP/local alerts) are produced by the backend (Volume 13); the API surfaces them via §14, not raw webhook injection.

### Webhook payload
```jsonc
{ "event_id": "uuid", "type": "local_campaign.alert", "occurred_at": "...",
  "data": { "campaign_id": "uuid", "region_scope": "US-FL", "confidence": 0.82 } }
```

### Acceptance / Edge / Security / A11y / Performance / Future
- AC: An unsigned/invalid-signature webhook is rejected by spec guidance. Edge: retry with backoff + DLQ (Volume 13). Security: HMAC + replay window. A11y: N/A. Performance: async fan-out. Future: partner webhook self-registration UI.

---

## 20. Versioning & Deprecation

### Purpose
Evolve the API without breaking clients.

### Requirements
- `API-11.20.1` Breaking changes **MUST** ship under a new path version (`/v2`); `/v1` **MUST** remain until sunset.
- `API-11.20.2` Deprecations **MUST** be announced via `Deprecation` + `Sunset` headers (RFC 8594) and `Link: rel="deprecation"` to docs, at least 90 days before removal.
- `API-11.20.3` Additive changes (new fields/endpoints) **MUST** be backward-compatible within a version; clients **MUST** ignore unknown fields.
- `API-11.20.4` An OpenAPI 3.1 document **MUST** be published and **MUST** be the source of truth for the SDK and contract tests.

### Acceptance / Edge / Security / A11y / Performance / Future
- AC: A deprecated endpoint returns `Sunset` header. Edge: dual-running `/v1`+`/v2` during migration. Security: old versions still patched. A11y: N/A. Performance: N/A. Future: automated client codegen from OpenAPI.

---

## 21. Anti-Scraping & Abuse Protections

### Purpose
Protect the corpus and platform from scraping, enumeration, and submission abuse (trust is the moat, Principle 8).

### Requirements
- `API-11.21.1` PostgREST/direct DB access **MUST NOT** be publicly exposed; only the `/v1` surface (no arbitrary column filters/operators) is reachable (§1/§3).
- `API-11.21.2` Cursor-only pagination + per-tier rate limits (§3/§4) **MUST** be used to bound bulk extraction; offset enumeration is unavailable.
- `API-11.21.3` Anonymous writes (report create) **MUST** be CAPTCHA/PoW-gated and IP-throttled (§4).
- `API-11.21.4` Bot/abuse heuristics (velocity, fingerprint, ASN reputation) **SHOULD** raise an abuse score that tightens limits or requires challenge.
- `API-11.21.5` Raw PII (`raw_text`, raw media, `value_raw`) **MUST NOT** be reachable by non-owner/non-staff scopes (defense aligned with Volume 10 RLS §16).
- `API-11.21.6` Responses **MUST NOT** leak total counts that enable scraping completeness estimates beyond what transparency (§17) intentionally publishes.

### Acceptance / Edge / Security / A11y / Performance / Future
- AC: An anonymous client paging rapidly is rate-limited (`429`) and challenged. Edge: legitimate researchers use partner API keys (§2 Future). Security: this section is the anti-scraping contract. A11y: challenges must have accessible alternatives (audio CAPTCHA / WCAG 2.2). Performance: limits enforced at edge. Future: signed-attestation device integrity for high-trust write paths.

---

*End of Volume 11 — API Specification.*
