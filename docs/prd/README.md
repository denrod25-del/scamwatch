# ScamWatch — Master Product Requirements Document

**Public product:** ScamWatch · **Tagline:** Know Before You Click™ · **Program codename:** Project Sentinel
**Status:** Draft v1.0 (master engineering specification) · **Audience:** Engineering, Design, AI/ML, QA, DevOps, Product, Security

---

## What this is

This is the master engineering specification for ScamWatch — a public-benefit consumer scam intelligence platform that helps people **identify, understand, verify, and report** scams before they become victims. It is written so a senior cross-functional team can build directly from it. It is not a summary or a pitch.

Read [`_shared-context.md`](_shared-context.md) first — it is the canonical source for the product definition, principles, engineering stack, domain vocabulary, and the **Documentation Standard** every volume follows.

## Product principles (the bar every volume is held to)

1. Explain before warning · 2. Respect victims · 3. Protect privacy · 4. Keep core education free · 5. Be transparent · 6. Never exaggerate · 7. Always route to official verification · 8. Build trust before growth · 9. Every feature prevents real-world harm.

## Engineering stack

Next.js · React · TypeScript · TailwindCSS · Supabase (PostgreSQL · Auth · Storage · Edge Functions) · Vercel · OpenAI APIs (LLM, embeddings, OCR, extraction, classification, campaign detection, explainability) · GitHub · pgvector.

---

## Canonical volume map (AUTHORITATIVE)

This numbering is the single source of truth. Where an individual volume cross-references a sibling by a *different* number or an inferred title (volumes were authored in parallel), **this table wins** — resolve the reference to the row below.

| Vol | Title | Owns | Req ID prefix |
|----:|-------|------|---------------|
| [0](vol-00-executive-vision.md) | Executive Vision | Problem, thesis, principles operationalized, glossary | `FR-0` / `NFR-0` |
| [1](vol-01-business-strategy.md) | Business Strategy | Public-benefit model, GTM, partnerships, funding | `BR-1` |
| [2](vol-02-market-research.md) | Market Research | Sizing, competitive landscape, regulatory landscape | `MR-2` |
| [3](vol-03-user-personas.md) | User Personas | 11 personas + accessibility profiles + feature matrix | `PER-3` |
| [4](vol-04-user-journeys.md) | User Journeys | 8 end-to-end journeys, happy + degraded paths | `UJ-4` |
| [5](vol-05-functional-requirements.md) | Functional Requirements | Exhaustive feature spec, verdict vocabulary | `FR-5` |
| [6](vol-06-ux-specification.md) | UX Specification | Every page/component/interaction, responsive | `UX-6` |
| [7](vol-07-design-system.md) | Design System | Tokens, color, type, motion, dark mode, a11y contract | `DS-7` |
| [8](vol-08-ai-intelligence-engine.md) | AI Intelligence Engine | OCR, extraction, classification, campaigns, explainability, moderation | `AI-8` |
| [9](vol-09-knowledge-graph.md) | Knowledge Graph | Nodes, edges, confidence, propagation, campaign logic | `KG-9` |
| [10](vol-10-database.md) | Database | ER, tables, indexes, RLS, retention, migrations | `DB-10` |
| [11](vol-11-api-specification.md) | API Specification | REST `/v1`, auth, rate limits, errors, pagination | `API-11` |
| [12](vol-12-frontend-architecture.md) | Frontend Architecture | Next.js routes, RSC, state, performance budget | `FE-12` |
| [13](vol-13-backend-architecture.md) | Backend Architecture | Supabase, queues, storage, notifications, caching | `BE-13` |
| [14](vol-14-security.md) | Security | Threat model, encryption, privacy, abuse, disclosure | `SEC-14` |
| [15](vol-15-testing.md) | Testing | Unit→E2E, a11y, perf, security, AI-eval, regression | `QA-15` |
| [16](vol-16-operations.md) | Operations | Moderation, community, support, transparency, volunteers | `OPS-16` |
| [17](vol-17-deployment.md) | Deployment | CI/CD, monitoring, logging, backups, DR | `DEP-17` |
| [18](vol-18-analytics.md) | Analytics | North Star, KPIs, funnels, dashboards, experimentation | `AN-18` |
| [19](vol-19-future-roadmap.md) | Future Roadmap | Extension, mobile, enterprise API, OCR, voice, deepfake, i18n | `RM-19` |

Total: ~113,000 words across 20 volumes.

---

## Canonical decisions locked across volumes

These were established by individual volumes and are binding platform-wide:

- **Roles** (Supabase Auth): `anonymous` · `member` · `contributor` · `moderator` · `analyst` · `admin`. Highest grant wins.
- **Domain objects** (Vol 0 §9): Report · Entity · Threat · Campaign · Verification · Explanation · Confidence. Database tables (Vol 10) map 1:1.
- **Verdict vocabulary** (Vol 5/6): `Likely Safe` · `No Signal` · `Use Caution` · `Likely Scam` · `Confirmed Reported Scam`. Confidence is scored/calibrated by Vol 8, presented as bands (low/moderate/high) by Vol 6/7.
- **North Star Metric** (Vol 18): **Protective Actions Delivered (PAD)**, with a published "Estimated Harm Prevented" context model (never a hard optimization target). Consistent with the "trusted protective actions" framing in Vol 0 §7 / Vol 1 §10.
- **Knowledge Graph** is `nodes`+`edges` in PostgreSQL at launch; graph-DB migration is a documented Vol 19 future option.
- **Confidence** is 0–1, calibrated, with a global cap below 1.0 for automated aggregation; classification may **abstain**. No model output is ever presented as fact — every verdict carries confidence + "verify with official sources" + "not legal advice."
- **Idempotency** for report submission: `Idempotency-Key` header → `reports.idempotency_key` (Vol 10/11/13).
- **Embeddings**: `text-embedding-3-small` (1536-dim), HNSW index (ivfflat documented as fallback) — launch default (Vol 10/13).
- **Accessibility**: WCAG 2.2 AA is a merge-blocking contract (Vol 7/15), not an aspiration.

## Requirement ID scheme

Stable IDs let tickets, tests, and cross-references bind to specifics: `<PREFIX>-<vol>.<section>.<n>` (e.g. `FR-5.1.3`, `SEC-14.8.2`, `DB-10.4.1`). Acceptance criteria use `AC-…`. Requirements use RFC 2119 keywords (MUST/SHOULD/MAY).

## Reading order

- **New hires / overview:** `_shared-context.md` → Vol 0 → Vol 5 → Vol 6.
- **Frontend:** Vol 6 → Vol 7 → Vol 12 → Vol 11 → Vol 15.
- **Backend/data:** Vol 10 → Vol 13 → Vol 11 → Vol 8 → Vol 9.
- **AI/ML:** Vol 8 → Vol 9 → Vol 10 → Vol 15 (AI-eval) → Vol 18 (intelligence-quality metrics).
- **Security/Trust & Safety:** Vol 14 → Vol 16 → Vol 10 (RLS/retention) → Vol 15 (security tests).
- **Ops/launch:** Vol 1 → Vol 16 → Vol 17 → Vol 18.

## Known reconciliation items (for the next editorial pass)

Because volumes were drafted in parallel, a small number of in-text cross-references cite a sibling by a guessed number/title. None affect the content, only the pointer. When doing a consolidation pass, normalize all such references to the **Canonical volume map** above. Notably: AI is **Vol 8** (some refs say 12), Frontend is **Vol 12**, Performance lives in **Vol 12/15** (not a standalone volume), and Privacy/Legal is folded into **Vol 14** (+ retention in Vol 10).
