# Volume 15 — Testing

> Part of the ScamWatch master PRD ("Project Sentinel"). Written against `_shared-context.md`. Cross-references other volumes by number and title.

This volume defines the complete test strategy for ScamWatch — what we test, how, to what bar, and how quality is enforced as a gate, not an afterthought. ScamWatch is consumer-protection software handling traumatic victim data and an adversarially-targeted intelligence corpus, so testing here carries two non-negotiable contracts beyond ordinary correctness: **accessibility (WCAG 2.2 AA is a contract, not a goal)** and **security/abuse resistance (the corpus and victim PII must survive adversaries)**. It also adds a discipline most apps lack: **AI/ML evaluation testing** — golden datasets, calibration, and regression on prompt/model changes — because ScamWatch's confidence scores must be calibrated (Principle 6) and its explanations trustworthy (Principle 5). Requirement IDs use the prefix `QA-15`. This volume ties to Volume 14 — Security (security test inputs), Volume 8 — AI/Intelligence (eval targets), Volume 4 — Core User Journeys (E2E scenarios), and Volume 17 — CI/CD & DevOps (quality gates).

## Table of Contents

1. Testing Philosophy, the Pyramid, Coverage Targets & Quality Gates
2. Unit Testing
3. Integration Testing (API + DB + RLS)
4. End-to-End Testing (Playwright)
5. Accessibility Testing (a contract)
6. Performance Testing
7. Security Testing
8. AI/ML Evaluation Testing
9. Regression Strategy & Flake Management
10. Test Data Management
11. Coverage Matrix (Test Type × Feature/Volume)

---

## 1. Testing Philosophy, the Pyramid, Coverage Targets & Quality Gates

### Purpose
Establish the overall testing strategy — the test pyramid shape, coverage targets, the Definition of Done, and the CI quality gates that block merges/deploys — so every contributor and every other volume shares one bar for "tested."

### Background
ScamWatch is built on Next.js/React/TS (frontend), Supabase Postgres + Edge Functions (backend), and OpenAI APIs (intelligence). The testing approach follows a classic pyramid (many fast unit tests, fewer integration tests, fewest but high-value E2E tests) augmented by **cross-cutting contract gates** (a11y, security, AI-eval) that are not "more tests at a layer" but mandatory checks any change must pass. Quality gates are enforced in CI (Volume 17) so they cannot be skipped under deadline pressure — a deliberate counter to the principle that trust is the moat (Principle 8).

```
              /\        E2E (Playwright) — critical journeys (Vol 4)
             /  \
            /----\      Integration — API + DB + RLS (Supabase harness)
           /      \
          /--------\    Unit — components, utils, edge functions (Vitest/RTL)
         /__________\
   Cross-cutting contract gates (run across layers):
   ▸ Accessibility (axe + manual)  ▸ Security (SAST/DAST/SCA, RLS, abuse, injection)
   ▸ AI/ML evaluation (golden datasets, calibration)  ▸ Performance budgets
```

### Requirements

- **QA-15.1.1 (MUST)** The suite MUST follow the pyramid: the majority of tests are fast unit tests; integration tests cover cross-component/data behavior; E2E is reserved for critical journeys (§4). Inverted "ice-cream-cone" distributions (mostly slow E2E) MUST be actively prevented.
- **QA-15.1.2 (MUST)** Coverage targets:
  - Overall line/branch coverage **MUST be ≥ 80%**.
  - **Security-, privacy-, scoring-, and money/loss-related modules** (redaction pass, RLS policies, confidence aggregation, auth, encryption helpers) **MUST be ≥ 95%** and MUST have explicit adversarial tests, not just happy-path.
  - Coverage is a floor and a signal, **never a substitute** for the cross-cutting contract gates.
- **QA-15.1.3 (MUST)** A shared **Definition of Done** applies to every feature: unit + integration tests written and passing; relevant E2E updated; a11y checks pass (§5); security checks pass (§7); for AI-touching changes, the eval suite passes without regression (§8); docs/requirement-IDs referenced.
- **QA-15.1.4 (MUST)** CI quality gates (enforced per Volume 17) MUST block merge/deploy on: failing tests, coverage below thresholds, a11y violations on changed surfaces, SAST/SCA findings above severity threshold, secret-scan hits, and AI-eval regressions beyond tolerance.
- **QA-15.1.5 (SHOULD)** Every requirement ID across volumes (`FR-*`, `SEC-*`, `QA-*`) SHOULD be traceable to at least one test; a traceability report SHOULD flag untested MUST-requirements.
- **QA-15.1.6 (MUST)** Tests MUST be deterministic and isolated (no shared mutable state, no real network to third parties by default); flaky tests are managed per §9, not ignored.

### Acceptance Criteria
- **AC-15.1.a** Given a PR, when CI runs, then all gates in `QA-15.1.4` execute and a failure in any blocks merge.
- **AC-15.1.b** Given the coverage report, when computed, then overall ≥ 80% and flagged-critical modules ≥ 95%, or the build fails (`QA-15.1.2`).
- **AC-15.1.c** Given a feature claimed "done", when reviewed against the DoD checklist, then every item is satisfied (`QA-15.1.3`).
- **AC-15.1.d** Given the traceability report, when generated, then every MUST-requirement maps to ≥ 1 test or is explicitly flagged (`QA-15.1.5`).

### Edge Cases
- A change is config/docs-only: gates still run but coverage delta is exempted with justification.
- A legitimate emergency hotfix: a documented break-glass path may defer non-security gates, but security and a11y gates on the changed surface MUST NOT be bypassed; the deferral is logged and remediated.
- Generated code (e.g., Supabase types) is excluded from coverage denominators.

### Security Considerations
Quality gates are themselves a security control (they enforce §7 security tests). Gate configuration MUST be protected (only `admin`/CI-owner can weaken thresholds), and weakening MUST be reviewed — otherwise an attacker/insider could disable security tests via a config PR.

### Accessibility
The a11y gate (§5) is part of the DoD and CI gates here; this section makes WCAG 2.2 AA a *merge-blocking* contract, not advisory.

### Performance
The full suite MUST be fast enough to run on every PR (target: unit+integration under ~10 min); slow suites (full E2E matrix, load tests, full AI-eval) MAY run on a nightly/pre-deploy schedule with a smoke subset on PRs.

### Future Expansion
Mutation testing to validate test *quality* (not just coverage); risk-based test selection; automated requirement-to-test traceability dashboard.

---

## 2. Unit Testing

### Purpose
Verify the smallest units — React components, utility/pure functions, and individual Edge Function handlers — in isolation, fast, with high coverage of branches and edge conditions.

### Background
Tooling is standardized to keep the suite cohesive: **Vitest** (fast, Vite/Next-aligned) with **React Testing Library** for components; the same runner (or Jest where a workspace requires) for utilities and Edge Function logic. Tests assert behavior and accessibility-of-output (roles/labels), not implementation details. Network and provider calls (OpenAI, DB) are mocked at the unit layer.

### Requirements

- **QA-15.2.1 (MUST)** Frontend components MUST be tested with React Testing Library, asserting on accessible roles/labels/text (user-facing behavior), not internal state or DOM structure.
- **QA-15.2.2 (MUST)** Pure utilities (formatters, validators, the redaction/de-identification helpers, confidence math helpers, URL/SSRF-policy checkers) MUST have unit tests covering valid, invalid, boundary, and adversarial inputs.
- **QA-15.2.3 (MUST)** Edge Function business logic MUST be unit-tested with external dependencies (DB, OpenAI, Storage) mocked; the de-identification pass and output-validator (Volume 14 §3/§8) MUST have dedicated unit tests including malicious inputs.
- **QA-15.2.4 (MUST)** Tests MUST cover error/exception paths and "fail-safe" behavior (e.g., malformed model JSON → reject, not guess — Vol 14 SEC-14.8.4).
- **QA-15.2.5 (SHOULD)** Tests SHOULD avoid over-mocking; prefer testing real logic with thin mocks at true boundaries.
- **QA-15.2.6 (MUST)** Trauma-aware/calibrated user-facing copy components MUST have tests asserting required disclaimers are present (e.g., "verify with official sources", "not legal advice" — Principles 6/7, Vol 14 §5).

### Acceptance Criteria
- **AC-15.2.a** Given a component rendering an AI explanation, when tested, then it asserts the confidence indicator and "verify with official sources" copy render (`QA-15.2.6`).
- **AC-15.2.b** Given the redaction helper, when fed reporter PII + scammer entity, then unit tests assert PII removed, entity retained (`QA-15.2.3`, Vol 14 SEC-14.3.2).
- **AC-15.2.c** Given the SSRF policy checker, when fed `169.254.169.254` and private ranges, then unit tests assert block (`QA-15.2.2`, Vol 14 SEC-14.9.14).
- **AC-15.2.d** Given malformed model JSON, when the validator runs, then the unit test asserts a safe rejection (`QA-15.2.4`).

### Edge Cases
- Time/locale-dependent formatters: inject a fixed clock/locale to keep tests deterministic (§9).
- Components with async/streaming (assistant output): use RTL async utilities, no arbitrary sleeps.
- Internationalized copy: assert by accessible role/key, not brittle string matches where i18n applies.

### Security Considerations
The unit layer is where security-critical pure functions (redaction, SSRF checker, validators) get their adversarial coverage (the ≥95% modules of `QA-15.1.2`). These tests are part of the security suite (§7) too.

### Accessibility
RTL queries-by-role enforce accessible markup at the unit level: if a component can't be queried by role/label, that's an a11y smell caught early.

### Performance
Unit tests MUST be fast (whole unit suite target: a few minutes), parallelized, and run on every PR.

### Future Expansion
Component snapshot/visual testing for design-system primitives; property-based testing for the redaction and scoring helpers to explore input space beyond hand-written cases.

---

## 3. Integration Testing (API + DB + RLS)

### Purpose
Verify that components work together correctly across real API → database boundaries, with a special, explicit focus on **Row-Level Security policies as a security boundary** (Vol 14 §4) using a real Supabase test harness.

### Background
Many of ScamWatch's highest risks live at integration seams: an API route that's correct but an RLS policy that leaks; a job that writes the corpus but skips reputation weighting. Unit tests with mocked DBs can't catch these. Integration tests run against a **real Postgres/Supabase instance** (ephemeral, seeded with synthetic data — never real PII, §10), exercising actual RLS, triggers, and queue behavior.

### Requirements

- **QA-15.3.1 (MUST)** API endpoints MUST have integration tests against a real (ephemeral) Supabase/Postgres instance, asserting status, payload shape, authz outcome, and DB side effects.
- **QA-15.3.2 (MUST)** **RLS policies MUST be tested as a contract** via an explicit RLS test matrix: for each protected table × each role (`anonymous`, `member`, `contributor`, `moderator`, `analyst`, `admin`) × operation (select/insert/update/delete), assert allow/deny matches the intended policy (Vol 14 SEC-14.4.7). Cross-user access (member A reading member B) MUST be tested as denied.
- **QA-15.3.3 (MUST)** Tests MUST verify that the **service-role bypass** is used only where intended and that anon/authenticated clients cannot exceed their policy (Vol 14 SEC-14.4.8).
- **QA-15.3.4 (MUST)** Background pipeline integration (ingestion → redaction → AI mock → entity/threat write → confidence update → queue) MUST be tested end-of-pipeline for data integrity, including reputation-weighting effects (Vol 14 §6, Vol 8).
- **QA-15.3.5 (SHOULD)** Migrations SHOULD be tested (apply forward, and where relevant rollback) against the harness so schema changes can't silently break RLS or constraints.
- **QA-15.3.6 (MUST)** Audit-log writes MUST be integration-tested: privileged actions produce immutable, hash-chained entries (Vol 14 §7) and the chain verifies.

### Acceptance Criteria
- **AC-15.3.a** Given the RLS matrix, when run, then every table×role×op cell matches the expected allow/deny and cross-user reads are denied (`QA-15.3.2`).
- **AC-15.3.b** Given a member's API call for another member's report, when executed against real RLS, then it returns no data / 403 (`QA-15.3.1/2`).
- **AC-15.3.c** Given a full ingestion run with synthetic data, when completed, then the resulting entities are de-identified and confidence reflects reputation weighting (`QA-15.3.4`).
- **AC-15.3.d** Given a moderation action in integration test, then a verifiable audit-chain entry exists (`QA-15.3.6`).

### Edge Cases
- Policy that's correct for `select` but wrong for `update` — the matrix's per-operation granularity catches asymmetric policies.
- Null/anonymous-author reports and their reduced-trust path (Vol 14 SEC-14.6.5) must be represented.
- Concurrent writes to the same entity's confidence (race) — test for consistent aggregation.

### Security Considerations
This is the layer that *proves* RLS-as-control (Vol 14's core structural mitigation for T4/T13). The RLS matrix is a launch-blocking artifact: missing cells = untested security boundary. The harness MUST use synthetic data only (§10) so a test-env breach never exposes victims.

### Accessibility
N/A at the data layer (no UI). API error contracts SHOULD be consistent so the accessible frontend can present them well.

### Performance
Integration tests are slower than unit; run the full set on PRs if feasible (target under ~10 min combined with unit) or a representative subset on PR + full set pre-merge/nightly. Use transactional rollback or per-test schemas for isolation and speed.

### Future Expansion
Contract testing between frontend and API (e.g., schema/OpenAPI-driven) to catch breaking changes; automated RLS-matrix generation from policy definitions so new tables can't ship without coverage.

---

## 4. End-to-End Testing (Playwright)

### Purpose
Validate complete, real user journeys through the actual stack (browser → Next.js → Supabase) for the highest-value flows, catching breakage that unit/integration layers miss.

### Background
E2E uses **Playwright** (cross-browser, reliable auto-waiting, strong a11y and tracing support). E2E is deliberately scarce (pyramid top) and reserved for the **critical user journeys defined in Volume 4 — Core User Journeys**. Each journey below is an E2E scenario; AI provider calls are stubbed deterministically (real provider non-determinism belongs in §8 eval, not E2E).

### Requirements

- **QA-15.4.1 (MUST)** The following critical journeys (from Vol 4) MUST have E2E coverage:
  1. **Anonymous lookup** — a worried user pastes a suspicious phone/URL/text, gets a calibrated result with confidence + sources + "verify with official org", without creating an account.
  2. **Submit a scam report (authenticated)** — member submits text + screenshot upload, receives "received" acknowledgement, report enters pipeline.
  3. **Submit anonymously** — victim reports without an account (reduced-trust path) and still gets education + verification handoff.
  4. **View an entity/threat page** — user sees calibrated claim, confidence, report count, related campaign, official-verification links, "not legal advice".
  5. **Screenshot upload + OCR result** — upload flows through validation/re-encode, OCR-derived text appears redacted in the result.
  6. **Verification handoff** — user is routed to the correct official organization (FTC/IC3/state AG/CFPB/IRS/SSA) for their scam type.
  7. **Account + auth journey** — sign-up/sign-in via Supabase Auth (email/OTP), MFA for privileged role, session expiry/logout.
  8. **Moderation flow (moderator)** — a named-individual report is gated, a moderator reviews and applies a calibrated decision; action is audited.
  9. **Takedown/dispute + appeal** — a subject submits a takedown; visibility reduces within flow; reporter can appeal (Vol 14 §5).
  10. **DSAR** — a user requests data export/deletion; identity is verified; request is recorded (Vol 14 §3).
- **QA-15.4.2 (MUST)** E2E MUST run on at least Chromium + WebKit (+ Firefox where feasible) and at mobile + desktop viewports.
- **QA-15.4.3 (MUST)** E2E MUST assert trauma-aware/calibrated copy and required disclaimers appear on result/entity surfaces (Principles 6/7).
- **QA-15.4.4 (SHOULD)** Each E2E SHOULD capture a Playwright trace on failure for fast triage and SHOULD include an accessibility scan (axe) of the rendered page (ties to §5).
- **QA-15.4.5 (MUST)** E2E MUST use seeded synthetic data and stubbed AI responses for determinism (§9/§10); no real PII, no live provider calls.

### Acceptance Criteria
- **AC-15.4.a** Given the anonymous-lookup journey, when run, then a calibrated result with confidence + official-source link + no-account-required is asserted (`QA-15.4.1.1`).
- **AC-15.4.b** Given a screenshot-upload journey, when OCR text is shown, then reporter PII in it is redacted on screen (`QA-15.4.1.5`, Vol 14 SEC-14.3.5).
- **AC-15.4.c** Given the moderation journey, when a named-individual report is submitted, then it is gated (not auto-published) and the moderator action is audited (`QA-15.4.1.8`, Vol 14 §5/§7).
- **AC-15.4.d** Given any E2E page render, when axe runs, then no serious/critical a11y violations (`QA-15.4.4`, §5).

### Edge Cases
- Upload failures / oversized image / rejected SVG — assert graceful, accessible error, not a crash.
- Network slowness / pipeline still processing — assert "still working" state, no false "safe" verdict.
- A journey that crosses roles (reporter → moderator → subject) requires multi-context Playwright sessions.

### Security Considerations
The moderation, takedown/appeal, and DSAR journeys are also security/legal-control tests (Vol 14 §5/§3). E2E must run against an isolated test environment with synthetic data so the suite itself can't leak real victim data.

### Accessibility
Every E2E page SHOULD include an automated axe pass (`QA-15.4.4`); the manual screen-reader/keyboard journeys in §5 complement these on the same flows.

### Performance
E2E is the slowest layer: keep the set small (the 10 journeys), run a smoke subset on PRs and the full matrix pre-deploy/nightly. Use Playwright parallelism and tracing-on-failure to keep cost manageable.

### Future Expansion
Visual-regression snapshots on key surfaces; synthetic-monitoring (run a subset against production continuously); expand journeys as Phase 2/3 features land.

---

## 5. Accessibility Testing (a contract)

### Purpose
Guarantee WCAG 2.2 AA conformance as a **merge-blocking contract** (shared context: "WCAG 2.2 AA is the baseline contract"), combining automated checks, manual screen-reader testing, and keyboard-only verification.

### Background
ScamWatch serves people in distress, including older adults and assistive-technology users who are disproportionately targeted by scams. Accessibility is therefore a core protective function, not a nicety. Automated tools (axe) catch ~30–50% of issues; the rest require manual screen-reader and keyboard testing. This section makes all three mandatory.

### Requirements

- **QA-15.5.1 (MUST)** Automated accessibility scanning (**axe-core**, via Playwright/RTL integration) MUST run on all key pages/components in CI; serious/critical violations MUST block merge (`QA-15.1.4`).
- **QA-15.5.2 (MUST)** **Keyboard-only operability** MUST be verified for every interactive flow: all functionality reachable and operable without a mouse, visible focus, logical order, no keyboard traps (WCAG 2.1.1/2.1.2/2.4.7).
- **QA-15.5.3 (MUST)** **Manual screen-reader testing** (at least one of NVDA/JAWS/VoiceOver) MUST be performed on the critical journeys (§4) before release, asserting meaningful names/roles/states and that calibrated/disclaimer copy is announced.
- **QA-15.5.4 (MUST)** Color/contrast MUST meet AA (4.5:1 text, 3:1 large/UI); status/severity MUST NOT be conveyed by color alone (pair with text/icon) — directly relevant to confidence/risk indicators.
- **QA-15.5.5 (MUST)** WCAG 2.2-specific success criteria MUST be checked: target size (minimum), focus not obscured, dragging alternatives, accessible authentication (no cognitive-function test without alternative — relevant to OTP/MFA), consistent help.
- **QA-15.5.6 (MUST)** Forms (report submission, DSAR, takedown, auth) MUST have programmatic labels, error identification, and accessible error suggestion; no time limits without an accessible extend/disable option.
- **QA-15.5.7 (SHOULD)** Accessibility regressions SHOULD be tracked over time; a per-release a11y report SHOULD be produced.

### Acceptance Criteria
- **AC-15.5.a** Given any key page in CI, when axe runs, then zero serious/critical violations or the build fails (`QA-15.5.1`).
- **AC-15.5.b** Given each critical journey, when navigated by keyboard only, then it completes with visible focus and no trap (`QA-15.5.2`).
- **AC-15.5.c** Given a confidence/risk indicator, when inspected, then meaning is conveyed by text/icon, not color alone, and contrast passes AA (`QA-15.5.4`).
- **AC-15.5.d** Given the OTP/MFA flow, when assessed against WCAG 2.2 Accessible Authentication, then it does not require a cognitive-function test without an alternative (`QA-15.5.5`).
- **AC-15.5.e** Given a screen-reader pass on the entity page, then confidence, source links, and "not legal advice" are announced meaningfully (`QA-15.5.3`).

### Edge Cases
- Dynamic/streaming assistant output: must use ARIA live regions so screen readers announce updates without spamming.
- Image-only scam screenshots: must have appropriate alt/description strategy; OCR text provides an accessible equivalent.
- Long content / data tables (campaign views): proper headers, captions, and navigation.

### Security Considerations
Accessible authentication (`QA-15.5.5`) intersects with Vol 14 §4 — MFA/OTP must be both secure and accessible; neither overrides the other. CAPTCHA/abuse challenges (Vol 14 §6) MUST have accessible alternatives.

### Accessibility
This entire section is the accessibility contract; it is referenced by §1's DoD and CI gates.

### Performance
axe runs add modest time to E2E/CI and are acceptable. Performance budgets (§6) also serve a11y users on low-end devices, so the two contracts reinforce each other.

### Future Expansion
Broaden manual testing across more AT/browser combos; user testing with people with disabilities and with scam-survivor groups; track toward selective WCAG AAA criteria where high-value.

---

## 6. Performance Testing

### Purpose
Ensure ScamWatch stays fast and available under real conditions — front-end responsiveness (Core Web Vitals budgets) and back-end resilience of the search and AI pipelines under load and stress.

### Background
Performance is a trust and accessibility issue: a worried user checking a suspicious link needs an answer quickly, and many users are on modest devices/connections. Frontend performance is governed by Core Web Vitals budgets; backend by load/stress tests (k6-style) on the two hot paths — **search/lookup** and the **AI ingestion/classification pipeline** — which also has a cost dimension (Vol 14 §6 cost circuit-breakers).

### Requirements

- **QA-15.6.1 (MUST)** Core Web Vitals budgets MUST be enforced in CI on key pages: **LCP < 2.5s**, **INP < 200ms**, **CLS < 0.1** (lab via Lighthouse-CI, validated against field data where available). Regressions beyond budget MUST fail the gate.
- **QA-15.6.2 (MUST)** A JavaScript/asset **bundle-size budget** MUST be enforced on key routes to protect low-end devices and a11y users.
- **QA-15.6.3 (MUST)** **Load tests (k6-style)** MUST exercise the search/lookup endpoint and the report-ingestion/AI pipeline at expected and peak (e.g., a viral-scam surge) volumes, asserting latency SLOs and correct behavior (no dropped reports, Vol 14 SEC-14.6.3).
- **QA-15.6.4 (MUST)** **Stress/soak tests** MUST find the breaking point and verify graceful degradation (backpressure/queue prioritization, cost circuit-breakers trip — Vol 14 SEC-14.6.2) rather than collapse or fail-open.
- **QA-15.6.5 (SHOULD)** Database/query performance SHOULD be tested with realistic corpus sizes (incl. `pgvector` search and RLS-predicated queries) so RLS and growth don't silently degrade latency.
- **QA-15.6.6 (SHOULD)** Performance results SHOULD trend over time; significant regressions SHOULD alert.

### Acceptance Criteria
- **AC-15.6.a** Given a key page in CI, when Lighthouse-CI runs, then LCP/INP/CLS are within budget or the gate fails (`QA-15.6.1`).
- **AC-15.6.b** Given a load test at peak on search, then p95 latency meets the SLO and error rate stays within target (`QA-15.6.3`).
- **AC-15.6.c** Given a stress test forcing many AI calls, then cost circuit-breakers trip and the system degrades gracefully without dropping trusted reports (`QA-15.6.4`, Vol 14 SEC-14.6.2/3).
- **AC-15.6.d** Given a large synthetic corpus, when pgvector + RLS search runs, then latency stays within SLO (`QA-15.6.5`).

### Edge Cases
- Viral-scam surge (legitimate spike) must be distinguishable in load tests from an attack flood — both stress the system; degradation must protect availability either way (Vol 14 §6).
- Cold-start latency on serverless/edge functions — measure and budget.
- Slow third-party (OpenAI) responses — test timeout/fallback behavior so the UI never hangs or shows a false verdict.

### Security Considerations
Performance/stress testing overlaps with abuse testing (§7): cost-exhaustion (T10) and flooding (T11) are both performance and security concerns; tests here validate the Vol 14 §6 mitigations under realistic load.

### Accessibility
Performance budgets directly benefit a11y users (low-end devices, screen readers depend on responsive, stable DOM). CLS budget specifically prevents layout shifts that disorient AT users.

### Performance
This section *is* the performance contract; budgets run in CI (lab) with field-data validation (RUM) feeding longer-term trends.

### Future Expansion
Continuous Real-User-Monitoring with alerting; performance budgets per route auto-tuned from field data; chaos/resilience testing of the queue and edge functions.

---

## 7. Security Testing

### Purpose
Continuously verify the Volume 14 — Security controls through automated scanning (SAST/DAST/SCA), the RLS test matrix, abuse/rate-limit tests, and a dedicated prompt-injection test suite for the AI engine.

### Background
Security controls that aren't tested are assumptions. This section turns Vol 14's requirements into executable, gating tests. It pairs conventional AppSec scanning with ScamWatch-specific suites: the **RLS matrix** (the structural authz boundary), **abuse/poisoning/Sybil simulations** (corpus integrity), and a **prompt-injection suite** (the adversarial-text threat unique to scam data).

### Requirements

- **QA-15.7.1 (MUST)** **SAST** (static analysis) MUST run in CI on every PR; findings above the agreed severity MUST block (Vol 14 SEC-14.9.3, A03).
- **QA-15.7.2 (MUST)** **SCA / dependency scanning** MUST run in CI; vulnerable/known-bad dependencies above threshold MUST block (Vol 14 SEC-14.9.6, A06). **Secret scanning** MUST run and block on any detected secret (Vol 14 SEC-14.9.19).
- **QA-15.7.3 (SHOULD)** **DAST** (dynamic scanning, e.g., OWASP ZAP) SHOULD run against a deployed test environment on a schedule, covering the OWASP baseline incl. headers/CSP (Vol 14 SEC-14.9.20).
- **QA-15.7.4 (MUST)** The **RLS test matrix** (§3) MUST be part of the security suite and gate releases (Vol 14 SEC-14.4.7).
- **QA-15.7.5 (MUST)** **Abuse/rate-limit tests** MUST verify: per-actor and global rate limits, AI cost circuit-breakers, reputation-weighted aggregation resisting Sybil floods, and coordination-detection quarantine (Vol 14 §6, threats T2/T3/T10/T11). A **Sybil-simulation** test MUST assert that N cheap accounts cannot materially move confidence without corroboration.
- **QA-15.7.6 (MUST)** A **prompt-injection test suite** MUST run against the AI pipeline with a maintained corpus of adversarial payloads (e.g., "ignore previous instructions", instruction-laden scam text, OCR-embedded injection), asserting no unintended action and no instruction execution (Vol 14 §8, T12). This suite MUST gate AI-touching changes.
- **QA-15.7.7 (MUST)** **File-upload and SSRF tests** MUST verify re-encode/metadata-strip, SVG/polyglot rejection, and post-DNS-resolution blocking of private/metadata ranges incl. via redirects (Vol 14 SEC-14.9.11–16, T5/T15).
- **QA-15.7.8 (SHOULD)** Periodic **manual penetration testing** (internal or third-party) SHOULD be conducted before major launches (Florida, then US, then Global) and results tracked to closure.
- **QA-15.7.9 (MUST)** Tests MUST confirm **no PII reaches the AI provider** (redaction-before-call) and **no PII in logs** (Vol 14 SEC-14.8.7/14.3.2/14.7.2).

### Acceptance Criteria
- **AC-15.7.a** Given a PR introducing a vulnerable dependency or a secret, then SCA/secret-scan blocks merge (`QA-15.7.2`).
- **AC-15.7.b** Given the prompt-injection suite, when run, then every known payload fails to alter confidence, publish content, or fetch arbitrary URLs (`QA-15.7.6`, Vol 14 SEC-14.8.2).
- **AC-15.7.c** Given a Sybil-simulation of N fresh accounts, when aggregated, then confidence does not materially shift absent corroboration (`QA-15.7.5`, Vol 14 SEC-14.6.4).
- **AC-15.7.d** Given an SSRF test to `169.254.169.254` directly and via redirect, then both are blocked (`QA-15.7.7`, Vol 14 SEC-14.9.14/15).
- **AC-15.7.e** Given a pipeline run with PII-laden input, when intercepting the provider call and logs, then no PII is present (`QA-15.7.9`).

### Edge Cases
- New injection techniques emerge: the payload corpus is living and updated when new vectors are found (§9 mirrors this for AI-eval).
- DAST false positives must be triaged, not blanket-suppressed; suppressions are reviewed.
- A "scam URL" that's actually a legitimate site (false positive) — SSRF/fetch tests must not break legitimate analysis while blocking internal targets.

### Security Considerations
This section is the verification arm of Volume 14; its gates are themselves protected (§1 SEC of "gate config protected"). Security test environments use synthetic data only (§10). The prompt-injection and Sybil suites are launch-blocking for their respective threat classes (Vol 14 SEC-14.1.3).

### Accessibility
N/A to the tests themselves; any security UI under test (CAPTCHA alternatives, MFA) is covered by §5.

### Performance
Fast SAST/SCA/secret-scan + RLS + injection suites run on PRs; heavier DAST and full abuse/load-simulation run scheduled/pre-deploy to keep PR latency low.

### Future Expansion
Continuous fuzzing of the redaction/validator/SSRF code; automated red-teaming of the assistant; shared adversarial-payload feeds; integration of findings with the Vol 14 §10 incident/severity process.

---

## 8. AI/ML Evaluation Testing

### Purpose
Treat the AI/intelligence layer (Volume 8) as a testable system: measure classification accuracy and **confidence calibration**, prevent regressions on prompt/model changes, and verify explanation quality — because ScamWatch's calibrated language (Principle 6) and transparency (Principle 5) are product promises.

### Background
LLM/ML behavior is non-deterministic and drifts with model/prompt changes, so it can't be covered by example-based unit tests alone. ScamWatch needs **golden datasets** (curated, labeled, synthetic scam corpora) and metric-based gates: accuracy/precision/recall on threat classification, **calibration** (does a stated 0.8 confidence mean ~80% correct?), explanation quality, and regression detection when prompts or models change. This is the most ScamWatch-specific testing discipline and directly serves the corpus's trustworthiness.

### Requirements

- **QA-15.8.1 (MUST)** A versioned **golden dataset** of labeled, synthetic scam examples (spanning the Vol shared-context taxonomy: phishing/smishing, impersonation, investment/pig-butchering, romance, tech-support, etc.) MUST exist, with held-out test splits; it MUST contain **only synthetic/sanitized data, never real victim PII** (§10).
- **QA-15.8.2 (MUST)** **Classification metrics** (accuracy, precision, recall, F1, per-category and macro) MUST be computed against the golden set; thresholds MUST be defined per category and a regression below threshold MUST block AI-affecting releases.
- **QA-15.8.3 (MUST)** **Calibration MUST be measured** (e.g., reliability diagram / Expected Calibration Error / Brier score): stated `Confidence` must track observed correctness within tolerance. Miscalibration beyond tolerance is a release-blocking regression — calibrated confidence is a Principle-6 contract.
- **QA-15.8.4 (MUST)** **Regression testing on model/prompt changes** MUST run the full eval suite on any change to model version, prompt, retrieval, or scoring; results MUST be compared to the prior baseline and material regressions block (ties to §1 gates).
- **QA-15.8.5 (MUST)** **Explainability quality** MUST be evaluated: explanations must be faithful (reflect the actual signals), calibrated (no overstated certainty), include "verify with official sources", and **never assert guilt of a named individual** (Vol 14 §5). This MAY use rubric-based scoring (human and/or LLM-as-judge with bias controls).
- **QA-15.8.6 (MUST)** **Safety/abuse evals** MUST verify the assistant refuses misuse (writing scams/phishing, producing defamatory named accusations) and resists jailbreaks (overlaps §7 prompt-injection; Vol 14 SEC-14.8.9).
- **QA-15.8.7 (SHOULD)** Bias/fairness checks SHOULD ensure classification doesn't systematically misfire on particular languages, demographics-correlated content, or regions (important for Phase 2/3 and for not over-flagging marginalized communities).
- **QA-15.8.8 (SHOULD)** Eval runs SHOULD be tracked over time (a model/prompt changelog with metric deltas) so drift is visible and auditable (transparency, Principle 5).

### Acceptance Criteria
- **AC-15.8.a** Given a prompt/model change, when the eval suite runs, then per-category accuracy and calibration are compared to baseline and a material regression blocks release (`QA-15.8.2/3/4`).
- **AC-15.8.b** Given the calibration check, when computed on held-out data, then ECE/Brier is within tolerance (`QA-15.8.3`).
- **AC-15.8.c** Given explanation outputs, when scored against the rubric, then they are calibrated, include verify-with-official-source, and contain no named-individual guilt assertions (`QA-15.8.5`, Vol 14 §5).
- **AC-15.8.d** Given misuse prompts, when run, then the assistant refuses (`QA-15.8.6`).
- **AC-15.8.e** Given the golden dataset, when audited, then it contains no real victim PII (`QA-15.8.1`, §10).

### Edge Cases
- Novel scam types not in the golden set: track an "unknown/low-confidence" pathway and add new examples as the threat taxonomy evolves (living dataset, §9).
- Provider model deprecation/upgrade forces a re-baseline; the changelog (`QA-15.8.8`) records the transition.
- LLM-as-judge for explanation scoring can be biased/inconsistent — apply bias controls and human spot-checks (don't trust a single judge blindly).

### Security Considerations
The golden dataset and eval harness are synthetic-only (§10); leaking them is low-risk but the harness MUST still not call providers with real PII. The safety evals (`QA-15.8.6`) are part of the security posture (Vol 14 §8) and gate alongside §7.

### Accessibility
N/A to the eval harness; the explanations it validates must themselves be accessible and are tested in §5/§2.

### Performance
Full eval runs are costly (many provider calls); run a smaller smoke eval on PRs touching AI and the full suite pre-deploy/nightly. Cache/batch where deterministic to control cost (also a Vol 14 §6 concern).

### Future Expansion
Automated drift detection on live (de-identified) traffic vs. golden baseline; richer fairness audits; counterfactual/robustness testing (does paraphrasing a scam flip the verdict?); published model-eval summaries in transparency reports.

---

## 9. Regression Strategy & Flake Management

### Purpose
Keep the suite trustworthy over time: prevent regressions via stable baselines, and aggressively manage flaky tests so the team never learns to ignore red builds.

### Background
A test suite is only as valuable as it is trusted. Flaky (non-deterministic) tests erode trust, lead to "just re-run it" culture, and can mask real failures — unacceptable when the masked failure could be a security or a11y regression. This section defines regression coverage (every fixed bug gets a test) and a strict flake policy.

### Requirements

- **QA-15.9.1 (MUST)** Every fixed bug MUST get a regression test reproducing it (red-before-green), so it cannot silently return.
- **QA-15.9.2 (MUST)** Tests MUST be deterministic: control time/randomness/locale; stub external services; avoid arbitrary sleeps (use explicit waits, esp. Playwright auto-wait) — flakiness is treated as a defect, not noise.
- **QA-15.9.3 (MUST)** Flaky tests MUST be detected (e.g., CI flake-tracking/retry-with-flag) and **quarantined with a tracked ticket and owner**, not deleted or permanently retried-into-green. Quarantine is time-boxed.
- **QA-15.9.4 (MUST)** Security, a11y, and AI-eval tests MUST NOT be auto-retried-to-green or silently disabled; a flaky test in these areas is high-priority because it may hide a contract violation.
- **QA-15.9.5 (SHOULD)** A regression/smoke subset SHOULD run on every PR; the full matrix (E2E, load, full AI-eval, DAST) runs pre-deploy/nightly.
- **QA-15.9.6 (SHOULD)** Flake rate SHOULD be a tracked metric with a target ceiling; a rising flake rate triggers cleanup work before it normalizes "ignore red".
- **QA-15.9.7 (MUST)** The golden dataset (§8) and security payload corpus (§7) MUST be versioned and grow as new scams/attacks appear, with changes reviewed — these are living regression assets.

### Acceptance Criteria
- **AC-15.9.a** Given a fixed bug, when the PR merges, then a test exists that fails on the old code and passes on the new (`QA-15.9.1`).
- **AC-15.9.b** Given a flaky test, when detected, then it is quarantined with an owner and ticket within policy, not silently retried forever (`QA-15.9.3`).
- **AC-15.9.c** Given a flaky security/a11y/AI-eval test, then it is escalated, not auto-retried-green (`QA-15.9.4`).
- **AC-15.9.d** Given the flake metric, when it rises above ceiling, then cleanup is triggered (`QA-15.9.6`).

### Edge Cases
- Inherently timing-sensitive AI/streaming tests: design for determinism (stubbed providers in functional tests; real providers only in §8 eval with metric tolerances, not exact-match).
- Third-party outage causing failures: distinguish infra flake from code flake; tests should fail closed but be diagnosable.
- A quarantined test that stays quarantined too long: policy escalates to fix-or-delete-with-justification.

### Security Considerations
`QA-15.9.4` exists because a silently-disabled security/a11y test is a hidden removal of a control. Test-suite integrity is a security property: changes that weaken security/a11y/AI-eval tests require review (ties to §1 gate-protection).

### Accessibility
A11y regressions are caught by §5 in CI; this section ensures those tests stay enabled and trusted (no auto-retry-green).

### Performance
Smoke-on-PR + full-nightly (`QA-15.9.5`) balances fast feedback against thorough coverage; flake reduction keeps CI fast and trustworthy.

### Future Expansion
Mutation testing to catch weak regression tests; automatic flaky-test detection/quarantine bots; test-impact analysis to run only affected tests on a PR.

---

## 10. Test Data Management

### Purpose
Provide realistic test data — especially **synthetic scam corpora** — while guaranteeing that **no real victim PII ever enters test/CI/eval environments** (a privacy and trauma-aware contract, Principle 3, Vol 14 §3).

### Background
ScamWatch's tests need lifelike scam content (to exercise classification, redaction, search, moderation) but its production data is exactly the kind of sensitive PII that must never be copied into lower environments. The solution is **synthetic generation and rigorous sanitization**, with production-data use in tests categorically prohibited.

### Requirements

- **QA-15.10.1 (MUST)** Test, CI, staging, and AI-eval environments **MUST use synthetic or fully de-identified data only**. Copying real production reports/PII into any non-production environment is **PROHIBITED**.
- **QA-15.10.2 (MUST)** A maintained **synthetic scam corpus** MUST exist, spanning the shared-context taxonomy and including the tricky cases tests need: reporter-PII mixed with scammer entities (for redaction tests), named-individual mentions (for moderation/defamation tests), multilingual content, OCR-from-screenshot text, and adversarial/injection payloads (shared with §7/§8).
- **QA-15.10.3 (MUST)** Synthetic PII MUST be **clearly fake** (reserved/test ranges, fictional names) so it can never be mistaken for or matched against real people, and so synthetic "named individuals" can't accidentally defame a real person.
- **QA-15.10.4 (MUST)** Test fixtures/seeds MUST be reproducible and version-controlled (deterministic seeding for unit/integration/E2E, §9).
- **QA-15.10.5 (SHOULD)** If realistic distributions are needed, data SHOULD be generated to mimic production *statistics* without copying production *records* (synthetic, not sampled-real).
- **QA-15.10.6 (MUST)** Test data and ephemeral test databases MUST be cleaned up/torn down after runs; no lingering test stores that could be confused with production or scraped.
- **QA-15.10.7 (MUST)** Any tooling that could touch production data for debugging MUST go through the de-identification pass (Vol 14 §3) before that data enters a test context; raw production PII is never the source.

### Acceptance Criteria
- **AC-15.10.a** Given any test/CI/eval environment, when audited, then it contains only synthetic/de-identified data (`QA-15.10.1`).
- **AC-15.10.b** Given the synthetic corpus, when inspected, then PII is clearly fake and named individuals are fictional (`QA-15.10.3`).
- **AC-15.10.c** Given a test run, when finished, then ephemeral data/databases are torn down (`QA-15.10.6`).
- **AC-15.10.d** Given the corpus, when used for redaction/moderation/injection tests, then it covers the required tricky cases (`QA-15.10.2`).

### Edge Cases
- A bug only reproducible with production-shaped data: reproduce via synthetic data engineered to the same shape, or via de-identified extract through the Vol 14 §3 pass — never raw PII.
- Synthetic "scammer" phone/URL/wallet values must be non-routable/reserved so tests can't accidentally contact real infrastructure or implicate a real entity.
- Growing the corpus must avoid leaking real examples observed in production into the shared corpus.

### Security Considerations
This section is a privacy control as much as a testing one: it operationalizes "no real victim PII in test envs" and supports Vol 14 §3 (data minimization) and §7 (PII-free logs). It removes a major breach surface (lower-environment data theft) entirely.

### Accessibility
Synthetic content used in a11y testing MUST include realistic structures (long text, tables, image-with-OCR) so a11y tests reflect real usage.

### Performance
Synthetic-data generation is cheap and reproducible; deterministic seeds keep performance/load tests (§6) comparable across runs.

### Future Expansion
A self-service synthetic-data generator parameterized by taxonomy/locale; differential-privacy-derived synthetic data that statistically mirrors production with provable non-identifiability; shared sanitized corpora with partner anti-fraud orgs.

---

## 11. Coverage Matrix (Test Type × Feature/Volume)

> Legend: ● primary coverage · ○ secondary/supporting coverage · — not applicable.
> Volume numbers reference the intended master-PRD layout; where a final number differs, the reference is by title.

| Feature / Volume area | Unit (§2) | Integration/RLS (§3) | E2E (§4) | A11y (§5) | Perf (§6) | Security (§7) | AI-Eval (§8) |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| Report submission (Vol 4/6) | ● | ● | ● | ● | ○ | ● | ○ |
| Anonymous lookup / search (Vol 4/7) | ● | ● | ● | ● | ● | ● | ○ |
| Screenshot upload + OCR (Vol 6/9) | ● | ● | ● | ● | ○ | ● (upload/SSRF) | ○ |
| Entity / Threat / Campaign pages (Vol 5/8) | ● | ● | ● | ● | ○ | ○ | ● |
| AI classification + Confidence (Vol 8) | ● | ● | ○ | — | ○ | ● (injection) | ● |
| Explanation / explainability (Vol 8) | ● | ○ | ● | ● | — | ○ | ● |
| De-identification / redaction (Vol 14 §3) | ● | ● | ● | — | — | ● | ● |
| Verification handoff to official orgs (Vol 4) | ● | ○ | ● | ● | — | — | — |
| AuthN/AuthZ + sessions (Vol 14 §4) | ● | ● | ● | ● (accessible auth) | ○ | ● | — |
| RLS policies (Vol 10/14 §4) | ○ | ● (matrix) | ○ | — | ○ | ● | — |
| Moderation / defamation control (Vol 14 §5) | ● | ● | ● | ● | — | ● | ● (named-individual eval) |
| Takedown / appeal / retraction (Vol 14 §5) | ● | ● | ● | ● | — | ○ | — |
| Abuse / Sybil / poisoning (Vol 14 §6) | ● | ● | ○ | ○ (challenge alt) | ● (flood) | ● | ○ |
| Rate limits / cost breakers (Vol 14 §6) | ● | ● | — | — | ● | ● | — |
| Audit logging (Vol 14 §7) | ● | ● | ○ | ● (staff tooling) | ○ | ● | — |
| Encryption / key mgmt (Vol 14 §2) | ● | ● | — | — | ○ | ● | — |
| DSAR / privacy rights (Vol 14 §3) | ● | ● | ● | ● | — | ● (identity verify) | — |
| App security / OWASP / CSP (Vol 14 §9) | ● | ● | ○ | — | — | ● (SAST/DAST) | — |
| Frontend pages / Core Web Vitals (Vol 5/16) | ● | — | ● | ● | ● | ○ | — |

### Notes on the matrix
- **Every row has a security column entry** because, in ScamWatch, almost every feature touches victim PII or corpus integrity.
- **Three rows are launch-blocking-tested** per Vol 14 SEC-14.1.3: RLS matrix (corpus/PII access), abuse/Sybil (poisoning), and moderation/defamation — each must have *tested* controls before launch.
- **AI-Eval (§8) coverage concentrates** on classification, explanation, redaction, and moderation rows — the surfaces where calibrated confidence and defamation-safe output are product contracts.
- **A11y (§5) spans every user-facing row** as a merge-blocking contract; it appears as ○ on staff-tooling rows (still required, lower traffic).

*End of Volume 15 — Testing.*
