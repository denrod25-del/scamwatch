# ScamWatch PRD — Shared Authoring Context

> **Authors:** Every volume is written against this shared context. Read it fully before writing.
> Do not contradict anything here. If a volume needs to extend a decision, extend it — never restate the whole thing.

---

## Product

- **Public product name:** ScamWatch
- **Internal program codename:** Project Sentinel
- **Tagline:** Know Before You Click™
- **One-line description:** A public-benefit consumer scam intelligence platform that helps people identify, understand, verify, and report scams before they become victims — using AI, community intelligence, transparent explanations, and official verification resources.

## Mission

Build the world's most trusted consumer scam intelligence platform. ScamWatch is not merely a scam database — it is a public-benefit intelligence platform.

## Vision (north stars / analogies)

- Consumer Reports for fraud
- VirusTotal for consumers
- Waze for scam intelligence
- An AI-powered consumer protection platform

## Market rollout

- **Launch market:** Florida
- **Phase 2:** United States
- **Phase 3:** Global

## Product Principles (non-negotiable; every feature is measured against these)

1. **Explain before warning.** Lead with understanding, not alarm.
2. **Respect victims.** No blame, no shame language. Trauma-aware.
3. **Protect privacy.** Minimize collection; never sell data; default to de-identification.
4. **Keep core education free.** The protective core is always free.
5. **Be transparent.** Show confidence, sources, and reasoning. Publish transparency reports.
6. **Never exaggerate.** Calibrated language; no fearmongering; no false certainty.
7. **Always encourage verification through official organizations** (FTC, FBI IC3, state AG, CFPB, IRS, SSA, etc.).
8. **Build trust before growth.** Trust is the moat.
9. **Every feature should help prevent real-world harm.**

## Engineering Stack (authoritative — do not substitute)

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), React, TypeScript, TailwindCSS |
| Backend | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| Hosting | Vercel (frontend + serverless/edge), Supabase cloud |
| AI | OpenAI APIs (LLM + embeddings), OCR, entity extraction, knowledge graph, threat classification, campaign detection, explainability |
| Version control | GitHub |
| Docs | Notion + Markdown |
| Project mgmt | GitHub Projects or Linear |

Notes for consistency:
- Auth = Supabase Auth (email/OTP + OAuth providers). Roles: `anonymous`, `member`, `contributor`, `moderator`, `analyst`, `admin`.
- Background work = Supabase Edge Functions + a queue (pgmq / database-backed job queue) + scheduled cron.
- Vector search = `pgvector` in Postgres.
- File/image uploads (scam screenshots) = Supabase Storage with signed URLs + server-side scanning.
- Knowledge graph is modeled in PostgreSQL (nodes + edges tables) — not a separate graph DB at launch (documented as a future-expansion option).

## Core domain objects (canonical vocabulary — use these names everywhere)

- **Report** — a user-submitted scam encounter (text, screenshot, URL, phone number, email, etc.).
- **Entity** — an extracted atom of fraud infrastructure: phone number, URL/domain, email address, crypto wallet, sender name, brand impersonated, payment handle, etc.
- **Threat** — a classified scam pattern/type (e.g. "Toll-road smishing", "Pig-butchering", "Grandparent scam").
- **Campaign** — a correlated cluster of Reports/Entities believed to share an actor or kit.
- **Verification** — a pointer/handoff to an official organization for the user to confirm or report.
- **Explanation** — the human-readable, calibrated "why we think this" output (the explainability layer).
- **Confidence** — a calibrated 0–1 score attached to classifications, entities, and campaign links.

## Threat taxonomy (top-level categories — expand within volumes as needed)

Phishing/Smishing/Vishing · Impersonation (gov't, bank, brand, family) · Investment/Crypto (incl. pig-butchering) · Romance · Tech-support · Employment/Job · Marketplace/Goods · Refund/Overpayment · Lottery/Prize · Charity/Disaster · Extortion/Sextortion · Identity-theft · Account-takeover · Fake invoices/BEC · Subscription/Free-trial traps.

## Documentation Standard (REQUIRED for every major section of every volume)

Every meaningful feature/component/system section MUST include these nine sub-headings (omit one only when genuinely not applicable, and say so):

1. **Purpose**
2. **Background**
3. **Requirements** (use `MUST` / `SHOULD` / `MAY` per RFC 2119; number them, e.g. `FR-5.3.1`)
4. **Acceptance Criteria** (testable, given/when/then where useful)
5. **Edge Cases**
6. **Security Considerations**
7. **Accessibility** (WCAG 2.2 AA baseline)
8. **Performance**
9. **Future Expansion**

## House style

- Audience: senior engineers, designers, AI/ML engineers, QA, DevOps, PM, security. Write so they can build directly from it.
- Precision over prose. No marketing language. No fluff. No hype.
- Use tables, numbered requirements, and code/SQL/TypeScript/JSON fences where they add precision.
- Use stable requirement IDs so other volumes and tests can reference them: `FR-<vol>.<section>.<n>`, `NFR-…`, `SEC-…`, `AC-…`.
- Cross-reference other volumes by number and title, e.g. "see Volume 10 — Database".
- Trauma-aware, victim-respecting tone in all user-facing copy examples.
- Calibrated AI language: never state model output as fact; always attach confidence + "verify with official sources."
- Each volume file starts with an H1 `# Volume N — <Title>`, a one-paragraph abstract, and a table of contents.
- Target depth: each volume should be a substantial, self-contained engineering document (multiple thousands of words where the scope warrants).

## Legal / compliance guardrails to weave in where relevant

- Defamation risk: ScamWatch makes calibrated, evidence-linked statements about *patterns* and *infrastructure*, not unproven accusations against named private individuals. Document the moderation + confidence + takedown/appeal flow.
- Privacy: CCPA/CPRA-aware, GDPR-ready architecture, Florida-specific consumer statutes acknowledged. Data minimization + retention schedules.
- Accessibility: WCAG 2.2 AA is the baseline contract.
- This is consumer protection, NOT legal advice — every relevant surface says so and routes to official orgs.

---

*End of shared context.*
