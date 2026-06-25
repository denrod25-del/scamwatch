# Volume 5 — Functional Requirements

> ScamWatch PRD · Project Sentinel · Public product name **ScamWatch** · Tagline *Know Before You Click™*
> This volume is written against `_shared-context.md`. Do not contradict it.

This volume is the exhaustive functional specification for ScamWatch. It enumerates *what the system must do*, organized by feature area, with stable requirement IDs (`FR-5.<section>.<n>`) that downstream volumes, test suites, and tickets reference. Every feature area is a full Documentation-Standard section (Purpose, Background, Requirements, Acceptance Criteria, Edge Cases, Security Considerations, Accessibility, Performance, Future Expansion). UX presentation lives in Volume 6 — UX Specification; data shapes live in Volume 10 — Database; AI/ML behavior detail lives in the AI volume. This volume defines behavior contracts, not pixels and not schemas (except illustrative JSON for state clarity).

Calibration note (binding on every requirement below): ScamWatch never states a model output as fact. Every verdict, entity classification, and campaign link carries a **Confidence** (0–1, calibrated), a human-readable **Explanation**, and a **Verification** handoff to an official organization. Language is trauma-aware and non-blaming. This is consumer protection, **not legal advice**.

---

## Table of Contents

1. [Conventions & Requirement Traceability](#1-conventions--requirement-traceability)
2. [FR-5.1 — Universal Search / Lookup](#fr-51--universal-search--lookup)
3. [FR-5.2 — Report Submission & Intake](#fr-52--report-submission--intake)
4. [FR-5.3 — Threat Detail Pages](#fr-53--threat-detail-pages)
5. [FR-5.4 — Entity Detail Pages](#fr-54--entity-detail-pages)
6. [FR-5.5 — Campaign Pages](#fr-55--campaign-pages)
7. [FR-5.6 — Explanation / Explainability Surfacing](#fr-56--explanation--explainability-surfacing)
8. [FR-5.7 — Verification & Official-Org Handoff](#fr-57--verification--official-org-handoff)
9. [FR-5.8 — Alerts & Notifications (Local Trending Campaigns)](#fr-58--alerts--notifications-local-trending-campaigns)
10. [FR-5.9 — Accounts & Reputation (Contributor Leveling)](#fr-59--accounts--reputation-contributor-leveling)
11. [FR-5.10 — Moderation Queue & Actions](#fr-510--moderation-queue--actions)
12. [FR-5.11 — Education / Academy Content](#fr-511--education--academy-content)
13. [FR-5.12 — Transparency Reports Surface](#fr-512--transparency-reports-surface)
14. [FR-5.13 — Search-Engine / AI-Answer Discoverability](#fr-513--searchengine--ai-answer-discoverability)
15. [Cross-Volume Assumptions](#cross-volume-assumptions)

---

## 1. Conventions & Requirement Traceability

**Requirement keywords** follow RFC 2119 (`MUST`, `SHOULD`, `MAY`). IDs are stable: `FR-5.<section>.<n>`. Acceptance criteria use `AC-5.<section>.<n>`. Security items use `SEC-5.<section>.<n>`.

**Personas & journeys** (defined in Volume 2 — Personas & Volume 3 — Journeys; summarized here so requirements can be traced):

| Code | Persona | Primary need |
|---|---|---|
| P1 | **Worried Recipient** — just got a suspicious text/call/email | Fast, calm verdict; "is this safe?" |
| P2 | **Recent Victim** — already engaged/paid | Non-blaming guidance + official reporting handoff |
| P3 | **Caregiver/Family** — protecting an older or vulnerable relative | Shareable explanations; local trends |
| P4 | **Contributor** — reports scams regularly | Frictionless reporting; reputation |
| P5 | **Moderator/Analyst** — staff/trusted volunteer | Queue throughput; safe actions; audit |
| P6 | **Researcher/Press/Partner Org** | Transparency data; campaign intelligence |
| P7 | **Crawler/AI Answer Engine** | Structured, citable, calibrated answers |

Each feature section ends with a **Traceability** line mapping `FR` ranges to persona codes and to the canonical journeys (`J-lookup`, `J-report`, `J-recover`, `J-protect`, `J-contribute`, `J-moderate`, `J-learn`).

**Global functional invariants** (apply to every feature; not re-stated per section):

- **FR-5.0.1** The system MUST attach a calibrated **Confidence** and a plain-language **Explanation** to every verdict, classification, or correlation it shows to a user.
- **FR-5.0.2** Every surface that renders a verdict MUST also render at least one **Verification** handoff to a relevant official organization (FTC, FBI IC3, state AG, CFPB, IRS, SSA, etc.).
- **FR-5.0.3** The system MUST NOT use blaming, shaming, or fear-amplifying language in any user-facing copy (Principle 2 & 6).
- **FR-5.0.4** The system MUST treat all user-submitted content as untrusted and apply de-identification before any public display (Principle 3).
- **FR-5.0.5** Every page that asserts a scam pattern MUST display a "This is consumer-protection information, not legal advice" disclosure and route to official orgs.
- **FR-5.0.6** Core protective features (search, read threat/entity/campaign pages, education) MUST remain free and usable by `anonymous` users (Principle 4).
- **FR-5.0.7** Roles are `anonymous`, `member`, `contributor`, `moderator`, `analyst`, `admin` (per shared context). Authorization MUST be enforced server-side, never client-only.

---

## FR-5.1 — Universal Search / Lookup

### Purpose
The single most-used surface. A user pastes *anything* they encountered — a phone number, URL/domain, email address, crypto wallet, sender name, or free-text snippet of a message — and receives a calibrated **verdict** with an **Explanation**, a **Confidence**, related **Entities/Threats/Campaigns**, and a **Verification** handoff. This is the "is this safe?" front door (P1, P3).

### Background
Universal Search is the consumer analog of VirusTotal's lookup. It must work for *non-technical, possibly distressed* users with zero account. Input is heterogeneous and dirty (smart quotes, shortened links, OCR'd text, copy-paste artifacts). The system normalizes the input, classifies its **type**, resolves it to known **Entities**, computes/looks-up a verdict, and explains it calibratedly.

### Requirements

| ID | Level | Requirement |
|---|---|---|
| FR-5.1.1 | MUST | Accept a single free-text query of up to 4,000 characters and auto-detect its dominant input type: `phone`, `url`, `email`, `crypto_wallet`, `payment_handle`, `sender_name`, or `freetext`. |
| FR-5.1.2 | MUST | Normalize input before matching: trim, collapse whitespace, strip tracking params, unwrap known URL shorteners (where safe, without issuing outbound requests that leak the user), E.164-normalize phone numbers, lowercase email domains, decode obfuscations (`g­mail` zero-width, `hxxp`, `[.]`). |
| FR-5.1.3 | MUST | Resolve the normalized query to zero or more known **Entities** and return the best-matching Entity plus its associated **Threats** and **Campaigns**. |
| FR-5.1.4 | MUST | Return a top-level **verdict** from a fixed, calibrated vocabulary: `Likely Safe`, `No Signal`, `Use Caution`, `Likely Scam`, `Confirmed Reported Scam`. Verdict MUST be derived from Confidence bands defined in Volume 6 §VerdictCard and the AI volume — not free-chosen by the model. |
| FR-5.1.5 | MUST | Attach a calibrated `confidence` (0–1) and an `explanation` object (see FR-5.6) to the verdict. |
| FR-5.1.6 | MUST | For `No Signal` (nothing known), present a non-alarming "we have no reports on this yet" state plus general safety guidance and a prompt to report — never imply absence of reports means "safe." |
| FR-5.1.7 | MUST | Never auto-navigate to, fetch, or render the user-submitted URL in a way that could execute it or leak the user's IP to the scammer. Link previews MUST be server-side, sandboxed, and rate-limited. |
| FR-5.1.8 | SHOULD | Offer query-type override controls when auto-detection is ambiguous (e.g. a numeric string that could be a phone or an order number). |
| FR-5.1.9 | SHOULD | Provide typeahead/suggestions sourced from popular, *already-public* threats and entities — never leak unpublished/unmoderated reports. |
| FR-5.1.10 | MUST | Provide a permalink/result URL per query result that is shareable (P3 caregivers) and crawlable (see FR-5.13), e.g. `/lookup/phone/+18885551234`. |
| FR-5.1.11 | MUST | Offer a one-tap "Report this" handoff that pre-fills the Report wizard (FR-5.2) with the searched entity. |
| FR-5.1.12 | MUST | Rate-limit anonymous search to deter scraping/enumeration of the entity graph (see SEC-5.1.x), without blocking legitimate human use. |
| FR-5.1.13 | SHOULD | Support locale/region context (default Florida at launch) so "trending near you" and official-org routing are regionally correct. |
| FR-5.1.14 | MAY | Support image-paste search (a screenshot) by routing into the OCR pipeline (FR-5.2) and searching extracted entities. |
| FR-5.1.15 | MUST | Log queries in **de-identified, aggregate** form for trend detection only; raw query strings containing PII MUST be redacted/retained per the retention schedule (Volume on Privacy). |

### Acceptance Criteria

- **AC-5.1.1** *Given* a user pastes `hxxps://irs-refund[.]help/login`, *when* they search, *then* the system normalizes it to `https://irs-refund.help/login`, detects type `url`, and returns a verdict with Confidence and Explanation — without making any client-side request to that host.
- **AC-5.1.2** *Given* a phone number `(888) 555-1234`, *when* searched, *then* it normalizes to `+18885551234`, and if matched returns the linked Threat ("Toll-road smishing") and Campaign with a verdict and at least one Verification handoff.
- **AC-5.1.3** *Given* an entity with no records, *when* searched, *then* the verdict is `No Signal` with calm copy and a "Report this" CTA — never `Likely Safe`.
- **AC-5.1.4** *Given* 200 rapid queries from one anonymous client in 60s, *when* the threshold is crossed, *then* the client is throttled with a 429 and a human-friendly retry message, and the event is logged for abuse review.
- **AC-5.1.5** *Given* any returned verdict, *then* a Confidence value and an Explanation panel are present in the response payload (non-empty).

### Edge Cases
- Mixed input (a paragraph containing a URL, a phone, and an email): system MUST extract all entities, pick a primary, and offer the others as secondary chips.
- Homoglyph/IDN domains (`раypal.com` Cyrillic): MUST punycode-normalize and flag homoglyph risk in the Explanation.
- Legitimate entity that is frequently *impersonated* (e.g. the real `irs.gov`): MUST return `Likely Safe` for the genuine entity while surfacing "commonly impersonated" context, not a scam verdict.
- Extremely short/ambiguous queries (`hi`, `$50`): return a guided empty-ish state asking for more context rather than a confident verdict.
- Query is itself sensitive PII of the *victim* (their own SSN pasted by mistake): detect, refuse to store, and warn the user.

### Security Considerations
- **SEC-5.1.1** All URL unwrapping/preview MUST run server-side in an isolated, egress-filtered worker (Supabase Edge Function / sandboxed fetcher), never from the client.
- **SEC-5.1.2** Enumeration defense: rate-limit + bot detection on anonymous search; do not expose internal IDs or unpublished entities via typeahead.
- **SEC-5.1.3** Treat the query as untrusted: parameterized queries, no SQL/`pgvector` injection, strict input length caps, reject control characters.
- **SEC-5.1.4** Redact PII from logs/analytics at ingestion; never persist a raw query containing a detected SSN/card number.

### Accessibility (WCAG 2.2 AA)
- Search input MUST have a programmatic label, be keyboard-operable, and announce result counts and verdict via `aria-live`. Verdict color is never the sole signal (icon + text). See Volume 6 §SearchBar/§VerdictCard.

### Performance
- **NFR target:** P50 end-to-end lookup ≤ 400 ms, P95 ≤ 1,200 ms for cached/known entities; ≤ 2,500 ms P95 when AI classification is invoked for an unknown entity. Typeahead P95 ≤ 150 ms. Vector + keyword resolution runs in Postgres (`pgvector` + trigram).

### Future Expansion
- Browser extension / mobile share-sheet "search this" target; voice query for vishing; bulk/CSV lookup for partner orgs; image-first search as default on mobile.

**Traceability:** FR-5.1.* → P1, P3, P7; J-lookup (primary), J-report (handoff), J-protect.

---

## FR-5.2 — Report Submission & Intake

### Purpose
Let anyone submit a scam encounter quickly and safely, across multiple input types, with screenshot upload + OCR, automatic de-identification, and duplicate detection that *merges into existing signal* rather than creating noise. Serves contributors (P4), recent victims (P2, who report as part of recovery), and caregivers (P3).

### Background
Reports are the raw fuel of the entire platform (Principle 9). The intake must be (a) low-friction for distressed users, (b) privacy-protective by default, and (c) high-signal — duplicates correlate into Campaigns instead of polluting the graph. Screenshots are the richest source but the most PII-laden, so the OCR + de-identification pipeline is central.

### Requirements

| ID | Level | Requirement |
|---|---|---|
| FR-5.2.1 | MUST | Support multi-type intake in one wizard: `sms/text`, `email`, `phone_call`, `website/url`, `social_dm`, `marketplace`, `in_person/mail`, with type-specific fields. |
| FR-5.2.2 | MUST | Allow submission by `anonymous` users (no account) while offering optional sign-in to attribute the report for reputation (FR-5.9). |
| FR-5.2.3 | MUST | Accept screenshot/image upload (PNG/JPG/HEIC/PDF, configurable max size) to Supabase Storage via signed URLs, with server-side malware/type scanning before processing. |
| FR-5.2.4 | MUST | Run an **OCR pipeline** (handoff to AI volume) on uploaded images to extract text and candidate **Entities**; present extracted entities to the reporter for confirmation/correction before submit. |
| FR-5.2.5 | MUST | **De-identify** before any storage-for-display and before public surfacing: detect and redact the *reporter's* PII and uninvolved third-party PII (victim name, account numbers, faces, addresses, the reporter's own phone) while **preserving fraud-infrastructure entities** (scammer phone/URL/wallet/handle). |
| FR-5.2.6 | MUST | Run **duplicate/near-duplicate detection** at submit time (entity exact-match + text embedding similarity) and, when a match is found, link the new report to the existing Entity/Campaign and increment its signal rather than creating an isolated record. |
| FR-5.2.7 | MUST | Show the reporter a calibrated, *immediate* preliminary read after submit ("This looks similar to a known toll-road smishing campaign — here's how to verify"), clearly labeled as preliminary and not a guarantee. |
| FR-5.2.8 | MUST | Capture optional structured context: amount lost (if any), channel, date encountered, region — all optional, none required to submit. |
| FR-5.2.9 | MUST | Never require the victim to re-enter traumatic detail to proceed; all sensitive fields are optional and framed with trauma-aware copy (Principle 2). |
| FR-5.2.10 | MUST | Provide a **de-identification preview** so the user sees exactly what will be stored/shown, with the ability to redact more before confirming. |
| FR-5.2.11 | MUST | Place every newly submitted report into the **moderation pipeline** (FR-5.10); reports are not auto-published as public claims until they meet the publish policy (confidence + corroboration + moderation). |
| FR-5.2.12 | SHOULD | Support save-and-resume / partial submissions for long reports. |
| FR-5.2.13 | SHOULD | Detect and prevent obvious spam/coordinated false reporting at intake (velocity, templated content, reputation weighting). |
| FR-5.2.14 | MUST | Issue a report receipt/permalink and, for P2, surface the Verification handoff (how/where to officially report: IC3, FTC, etc.) on the confirmation screen. |
| FR-5.2.15 | MAY | Allow forwarding-based intake (forward a scam email/SMS to a ScamWatch address/number) as a future channel, routed through the same pipeline. |
| FR-5.2.16 | MUST | Record provenance (input type, OCR vs typed, dedupe match, confidence) for every extracted entity to feed Explanation (FR-5.6) and audit. |

### Acceptance Criteria

- **AC-5.2.1** *Given* a screenshot of a smishing text, *when* uploaded, *then* OCR extracts the URL and sender, the de-identifier redacts the recipient's name/number, and the user confirms entities before submit.
- **AC-5.2.2** *Given* a report whose primary entity already exists, *when* submitted, *then* it links to that Entity and its Campaign and increments report count — no duplicate Entity is created.
- **AC-5.2.3** *Given* an anonymous reporter, *when* they submit, *then* the report is accepted, queued for moderation, and a receipt permalink is returned — without forcing account creation.
- **AC-5.2.4** *Given* a de-identification preview, *when* the user redacts an additional region, *then* the redaction is applied to the stored artifact, verifiable via the stored copy.
- **AC-5.2.5** *Given* a victim report indicating money lost, *then* the confirmation screen leads with supportive, non-blaming copy and an official-reporting Verification handoff.

### Edge Cases
- OCR fails or returns garbage (low-quality photo of a screen): fall back to manual entity entry; never block submission.
- De-identifier under-redacts (misses a name in an image region): user can manually redact in preview; flagged for moderator review; conservative default blurs faces/long digit runs.
- De-identifier *over*-redacts the scammer's URL: preserve-list logic must protect fraud-infrastructure entities; user can un-redact an entity they confirm is the scammer's.
- Coordinated brigading (many fake reports against a legitimate business): velocity + reputation + moderation gate prevents publication; see FR-5.10.
- Duplicate that is actually a *new variant* (same brand, new domain): dedupe links it to the **Campaign** but keeps the new Entity distinct.

### Security Considerations
- **SEC-5.2.1** Uploads via signed URLs only; server-side content-type + malware scan; strip EXIF/geolocation from images; store originals encrypted with restricted access; public surfaces only ever see the de-identified derivative.
- **SEC-5.2.2** PII handling: de-identification is mandatory pre-display; raw originals are access-controlled to `moderator`/`analyst` with audit logging; retention schedule enforced (auto-purge originals per policy).
- **SEC-5.2.3** Anti-abuse: rate-limit submissions, captcha/bot-check on anonymous high-velocity submit, reputation-weighted trust.
- **SEC-5.2.4** Prevent SSRF via any URL fields/preview (same isolation as FR-5.1.7/SEC-5.1.1).
- **SEC-5.2.5** Defamation guardrail: reports are *unverified claims* until moderated; public display speaks to patterns/infrastructure, not named-individual accusations (shared context legal guardrail).

### Accessibility
- Multi-step wizard MUST be fully keyboard navigable, with step state announced, file-upload accessible (drag-drop + button + paste), and error messaging tied to fields via `aria-describedby`. Trauma-aware copy avoids urgency/pressure patterns. See Volume 6 §ReportWizardStep.

### Performance
- Image upload + OCR + de-id pipeline target: user-perceived ≤ 6 s P95 for a single screenshot (with progressive UI: "reading your screenshot…"); dedupe check ≤ 800 ms P95. Heavy work runs async via Edge Functions + queue; the wizard never blocks on full campaign correlation.

### Future Expansion
- Email/SMS forwarding intake; partner/API bulk ingest (banks, telecoms); auto-classification confidence improvements; in-app camera capture with on-device pre-redaction.

**Traceability:** FR-5.2.* → P2, P3, P4; J-report (primary), J-recover, J-contribute.

---

## FR-5.3 — Threat Detail Pages

### Purpose
A canonical, citable page per **Threat** (scam pattern/type, e.g. "Toll-road smishing") explaining what it is, how it works, how to recognize it, how to verify, and what to do — calibrated and trauma-aware. Primary read surface for P1/P3 and the most crawlable/AI-citable artifact (P7).

### Background
Threats are the human-comprehensible layer above raw Entities. A Threat page is part encyclopedia entry, part safety briefing. It aggregates linked Entities and Campaigns, shows prevalence/trend, and always routes to official verification.

### Requirements

| ID | Level | Requirement |
|---|---|---|
| FR-5.3.1 | MUST | Render a stable, human-readable URL per Threat (e.g. `/threats/toll-road-smishing`) with a canonical title, summary, and last-updated timestamp. |
| FR-5.3.2 | MUST | Present: what it is, how it works (steps), red flags / how to recognize, what to do if targeted, what to do if already victimized (non-blaming), and how to verify with official orgs. |
| FR-5.3.3 | MUST | Show calibrated prevalence/trend (e.g. "reports rising in Florida this week") with Confidence — never invented precision. |
| FR-5.3.4 | MUST | List linked **Entities** (de-identified) and **Campaigns**, each with its own verdict/Confidence, and link out to their detail pages. |
| FR-5.3.5 | MUST | Map to the canonical **threat taxonomy** category from shared context and display the category. |
| FR-5.3.6 | MUST | Carry the "not legal advice" disclosure and at least one Verification handoff appropriate to the threat (e.g. IRS impersonation → IRS + FTC). |
| FR-5.3.7 | MUST | Provide structured metadata for discoverability (schema.org, FAQ/HowTo where appropriate) per FR-5.13. |
| FR-5.3.8 | SHOULD | Offer a "report a sighting of this" CTA pre-filling the Report wizard with the Threat. |
| FR-5.3.9 | SHOULD | Provide an Education/Academy cross-link (FR-5.11) for deeper learning. |
| FR-5.3.10 | MUST | Reflect moderation/review state: only publish/verify content that meets the content-quality and editorial review bar; show "reviewed by" provenance where applicable. |
| FR-5.3.11 | SHOULD | Localize examples and official-org routing to the user's region (Florida default). |

### Acceptance Criteria
- **AC-5.3.1** *Given* the `toll-road-smishing` Threat page, *then* it shows what/how/recognize/do/verify sections, linked entities (de-identified), a calibrated trend, and an official-org handoff.
- **AC-5.3.2** *Given* a user who was victimized, *when* they read the "if already victimized" section, *then* copy is supportive and non-blaming and links to official reporting.
- **AC-5.3.3** *Given* a crawler, *when* it fetches the page, *then* valid schema.org structured data and a meaningful meta description are present (FR-5.13).

### Edge Cases
- Sparse Threat (few reports): show honest "emerging / limited data" framing with lower Confidence; avoid overstating.
- Threat that overlaps categories (sextortion + crypto): allow multiple taxonomy tags; pick a primary for URL/canonical.
- Stale page (no recent reports): show "last active" honestly rather than implying it's current.

### Security Considerations
- **SEC-5.3.1** Only de-identified entity data is shown; raw artifacts never reachable from a public Threat page.
- **SEC-5.3.2** Editorial/moderation gate prevents unverified or defamatory specifics about named individuals (guardrail).

### Accessibility
- Semantic headings, logical reading order, skip links, non-color-dependent verdict/trend indicators; readable plain-language summary at top. See Volume 6 §ThreatDetail.

### Performance
- Mostly static/ISR-cacheable (Next.js) → P95 TTFB ≤ 300 ms cached; trend widgets hydrate async. Core Web Vitals "good" thresholds are a contract (LCP < 2.5 s, INP < 200 ms, CLS < 0.1).

### Future Expansion
- Multilingual Threat pages; printable/shareable one-pagers for community orgs; embeddable widgets for partner sites.

**Traceability:** FR-5.3.* → P1, P3, P6, P7; J-lookup, J-protect, J-learn.

---

## FR-5.4 — Entity Detail Pages

### Purpose
A page per fraud-infrastructure **Entity** (phone, domain/URL, email, crypto wallet, payment handle, sender/brand) showing its calibrated verdict, the reports/threats/campaigns it's linked to, its Explanation, and verification routing. Powers shareable lookups (FR-5.1 permalinks).

### Background
Entities are the atoms. An Entity page is the evidence-and-explanation surface for a specific identifier the user encountered. It must be precise about *infrastructure* and *patterns* while avoiding unproven accusations about *people* (legal guardrail).

### Requirements

| ID | Level | Requirement |
|---|---|---|
| FR-5.4.1 | MUST | Render a stable URL per Entity keyed by normalized value + type (e.g. `/entity/url/irs-refund.help`, `/entity/phone/+18885551234`). |
| FR-5.4.2 | MUST | Show the entity type, normalized value, calibrated verdict + Confidence, and an Explanation (FR-5.6) of why. |
| FR-5.4.3 | MUST | Show de-identified report count/recency, linked **Threats** and **Campaigns**, and "commonly impersonates" relationships where relevant. |
| FR-5.4.4 | MUST | Distinguish *the genuine impersonated brand/entity* from *the fraudulent entity* clearly (e.g. real `irs.gov` vs `irs-refund.help`). |
| FR-5.4.5 | MUST | Provide Verification handoff and "report this entity" CTA. |
| FR-5.4.6 | MUST | Provide a takedown/appeal/correction pathway and link to it (a person/business claiming wrongful inclusion can dispute) — see FR-5.10 appeals. |
| FR-5.4.7 | MUST | Never display raw third-party PII; show only fraud-infrastructure identifiers and de-identified context. |
| FR-5.4.8 | SHOULD | Show calibrated first-seen/last-seen and geographic/temporal spread where data supports it. |
| FR-5.4.9 | MUST | Emit structured metadata for discoverability (FR-5.13) while respecting `noindex` for low-confidence/under-review entities. |
| FR-5.4.10 | SHOULD | Indicate when an entity's status changed (e.g. domain now taken down / sinkholed) with timestamp and Confidence. |

### Acceptance Criteria
- **AC-5.4.1** *Given* `/entity/url/irs-refund.help`, *then* the page shows a verdict, Confidence, Explanation, linked Threat/Campaign, and a clear "this is NOT the real IRS" distinction plus IRS/FTC verification.
- **AC-5.4.2** *Given* a business that believes it's wrongly listed, *when* they open the page, *then* a visible appeal/correction link is present (FR-5.10).
- **AC-5.4.3** *Given* a low-confidence/under-review entity, *then* the page is `noindex` and labels its provisional status honestly.

### Edge Cases
- Shared infrastructure (a legitimate CDN/IP also used by a scam): scope the verdict to the specific identifier; avoid tainting broad infrastructure.
- Recycled phone numbers (a flagged number reassigned to an innocent person): time-decay Confidence; honor appeals; show "previously associated with" framing.
- Entity that is both victim and vector (a hijacked legit domain): label compromise vs. malice distinctly.

### Security Considerations
- **SEC-5.4.1** Strong de-identification; appeals workflow to mitigate defamation/privacy risk; audit who published/verified.
- **SEC-5.4.2** Rate-limit and bot-guard to prevent scraping the full entity graph.

### Accessibility
- Verdict conveyed by icon+label+text; relationships presented as navigable lists; appeal link reachable by keyboard and screen reader. See Volume 6 §EntityDetail / §EntityChip.

### Performance
- ISR-cached with async-hydrated relationships; P95 TTFB ≤ 300 ms cached. Relationship queries paginated.

### Future Expansion
- WHOIS/passive-DNS enrichment; cross-entity graph visualization; partner takedown-API integration; reputation feeds.

**Traceability:** FR-5.4.* → P1, P3, P6, P7; J-lookup, J-protect.

---

## FR-5.5 — Campaign Pages

### Purpose
A page per **Campaign** — a correlated cluster of Reports/Entities believed to share an actor or kit — showing the pattern, member entities, geography/timeline, calibrated linkage Confidence, and the Explanation of *why these are grouped*. Serves researchers/press/partners (P6) and informs alerts (FR-5.8).

### Background
Campaigns are ScamWatch's "Waze-for-scams" intelligence layer: the value is correlation. Linkage is probabilistic and must be presented with calibrated Confidence and an auditable rationale, never as fact.

### Requirements

| ID | Level | Requirement |
|---|---|---|
| FR-5.5.1 | MUST | Render a stable Campaign URL with a generated name/label, summary, status (`active`/`waning`/`dormant`), and last-updated timestamp. |
| FR-5.5.2 | MUST | List member **Entities** and representative (de-identified) **Reports**, each with linkage Confidence to the Campaign. |
| FR-5.5.3 | MUST | Explain the correlation basis (shared kit, template, infrastructure, timing, brand) in plain language with Confidence (FR-5.6). |
| FR-5.5.4 | MUST | Show geographic + temporal spread (e.g. Florida heatmap/timeline) with calibrated counts. |
| FR-5.5.5 | MUST | Link to the associated **Threat**(s) and provide Verification handoffs relevant to the campaign. |
| FR-5.5.6 | SHOULD | Provide a "is this campaign trending near me?" indicator feeding alerts (FR-5.8). |
| FR-5.5.7 | MUST | Allow analysts to merge/split campaigns and record provenance of correlation decisions (feeds Explanation + audit; see FR-5.10). |
| FR-5.5.8 | SHOULD | Offer export of de-identified campaign intelligence to vetted partners/researchers under terms (P6) — gated, logged. |
| FR-5.5.9 | MUST | Respect `noindex` for low-confidence/provisional campaigns; index only well-corroborated ones (FR-5.13). |

### Acceptance Criteria
- **AC-5.5.1** *Given* a Campaign page, *then* it lists member entities with per-link Confidence and a plain-language correlation rationale.
- **AC-5.5.2** *Given* an analyst splits a campaign, *then* the change is recorded with actor, timestamp, and reason, and member entities re-associate correctly.
- **AC-5.5.3** *Given* a partner export request, *then* only de-identified data is exportable and the export is access-logged.

### Edge Cases
- Over-merge (two distinct actors using the same kit): support split; show "low-confidence link" honestly.
- Under-merge (one actor, two clusters): support merge; reconcile timelines.
- Single-entity "campaign" (insufficient correlation): present as emerging cluster, not a confident campaign.

### Security Considerations
- **SEC-5.5.1** Correlation must not re-identify victims; de-identification preserved through aggregation.
- **SEC-5.5.2** Partner export is RBAC-gated (`analyst`/`admin`), logged, and rate-limited.

### Accessibility
- Map/timeline visualizations have text/table equivalents; Confidence and status not color-only. See Volume 6 §CampaignDetail.

### Performance
- Aggregations precomputed/materialized; map/timeline lazy-loaded; P95 TTFB ≤ 400 ms cached.

### Future Expansion
- Actor-attribution layer (very high bar, heavily caveated); real-time campaign emergence detection; cross-region (Phase 2/3) correlation.

**Traceability:** FR-5.5.* → P5, P6; J-moderate, J-protect; feeds J-lookup & alerts.

---

## FR-5.6 — Explanation / Explainability Surfacing

### Purpose
The explainability layer that turns model output into a calibrated, human-readable **"why we think this."** Mandated on every verdict, entity classification, and campaign link (Principle 5). This is *the* differentiator — explain before warning (Principle 1).

### Background
Trust is the moat (Principle 8). Users — especially distressed ones — accept guidance they understand. Every Explanation must show the *signals*, the *confidence*, the *sources*, and *what's uncertain*, in plain language, without fabricating precision.

### Requirements

| ID | Level | Requirement |
|---|---|---|
| FR-5.6.1 | MUST | For every verdict/classification/link, produce an `Explanation` object containing: `summary` (plain language), `signals[]` (the evidence, each with a human label and a weight/direction), `confidence` (0–1 calibrated), `sources[]` (report counts, official references, detection rules), and `uncertainty` (what could change the verdict). |
| FR-5.6.2 | MUST | Present a layered UI: a one-line plain summary always visible; expandable detail with signals/sources; never require expansion to grasp the gist. |
| FR-5.6.3 | MUST | Use calibrated language tied to Confidence bands; never assert certainty the score doesn't support (Principle 6). |
| FR-5.6.4 | MUST | Cite *why* in terms a non-expert understands ("This link uses a look-alike domain of a real bank" not "TLD entropy 0.82"). Technical detail MAY be available on demand. |
| FR-5.6.5 | MUST | Always pair the Explanation with a Verification handoff (FR-5.7) — explanation is a starting point, not the final word. |
| FR-5.6.6 | MUST | Be machine-readable (structured) so it can power discoverability/AI-answer citation (FR-5.13) and tests. |
| FR-5.6.7 | SHOULD | Distinguish *report-derived* signals (community) from *AI-derived* signals (model) from *official* signals, and label each. |
| FR-5.6.8 | MUST | Avoid blame/fear; frame even strong scam verdicts supportively ("Here's what to do next"). |
| FR-5.6.9 | SHOULD | Offer a "was this explanation helpful?" feedback control feeding calibration and content improvement. |
| FR-5.6.10 | MUST | Record the model/version/ruleset that produced the explanation for auditability and reproducibility. |

### Acceptance Criteria
- **AC-5.6.1** *Given* a `Likely Scam` verdict, *then* the Explanation shows a plain summary, ≥1 labeled signal, a Confidence, ≥1 source, and an uncertainty note, plus a Verification handoff.
- **AC-5.6.2** *Given* the Explanation payload, *then* it is structured JSON consumable by the discoverability layer and by automated tests.
- **AC-5.6.3** *Given* a low-confidence result, *then* the language is hedged ("we don't have enough signal to be sure") rather than asserting safety or danger.

### Example payload
```json
{
  "verdict": "Likely Scam",
  "confidence": 0.86,
  "summary": "This link uses a look-alike domain that imitates a real bank and matches a pattern many people have reported this week.",
  "signals": [
    { "label": "Look-alike domain of a known bank", "direction": "scam", "weight": "high", "origin": "ai" },
    { "label": "37 similar reports in Florida (last 7 days)", "direction": "scam", "weight": "high", "origin": "community" },
    { "label": "Domain registered 4 days ago", "direction": "scam", "weight": "medium", "origin": "ai" }
  ],
  "sources": [
    { "type": "report_cluster", "count": 37, "region": "FL", "window_days": 7 },
    { "type": "official_reference", "org": "FTC", "topic": "bank impersonation" }
  ],
  "uncertainty": "If this is your bank's new official domain, it could be legitimate — confirm by calling the number on your card.",
  "verification": [{ "org": "FTC", "action": "report", "url": "https://reportfraud.ftc.gov" }],
  "model": { "classifier_version": "tc-2026.04", "ruleset": "rs-118" },
  "not_legal_advice": true
}
```

### Edge Cases
- Conflicting signals (some safe, some scam): Explanation MUST surface the conflict and lower Confidence rather than hide it.
- No signals at all → maps to `No Signal` verdict with honest "we don't know yet" copy.
- Model uncertainty high but community signal strong (or vice versa): weighting/labeling must make the basis transparent.

### Security Considerations
- **SEC-5.6.1** Don't leak internal feature internals, raw PII, or exploitable detection thresholds in the public explanation; keep deep technical detail role-gated/abstracted.

### Accessibility
- Expand/collapse keyboard-operable, `aria-expanded`; summary readable without expansion; weights conveyed textually not color-only. See Volume 6 §ExplanationPanel / §ConfidenceMeter.

### Performance
- Explanation is produced alongside the verdict (same response); cached with the entity verdict; no extra round-trip to view the summary.

### Future Expansion
- Per-signal "learn more" deep-links to Academy; user-tunable explanation depth; multilingual explanations; counterfactual ("what would make this safe").

**Traceability:** FR-5.6.* → P1, P2, P3, P6, P7; underpins every journey.

---

## FR-5.7 — Verification & Official-Org Handoff

### Purpose
Operationalize Principle 7: always route users to official organizations to confirm and/or report. A structured, maintained registry of official orgs mapped to threat types, regions, and actions, surfaced contextually everywhere.

### Background
ScamWatch is consumer protection, not legal advice and not law enforcement. The most responsible action is to hand the user to the authoritative source (FTC, FBI IC3, state AG, CFPB, IRS, SSA, etc.) with the right link and the right framing.

### Requirements

| ID | Level | Requirement |
|---|---|---|
| FR-5.7.1 | MUST | Maintain a structured **Verification registry**: org, jurisdiction/region, threat categories served, action types (`verify`, `report`, `freeze_credit`, `block_number`, etc.), official URL/phone, and copy guidance. |
| FR-5.7.2 | MUST | Surface ≥1 contextually-correct Verification handoff on every verdict, Threat, Entity, Campaign, and the Report confirmation screen. |
| FR-5.7.3 | MUST | Choose handoffs by threat type + region (IRS impersonation → IRS + FTC; investment/crypto → CFTC/SEC/FBI IC3; elder → state AG/Adult Protective Services). |
| FR-5.7.4 | MUST | Use calibrated, non-alarming copy and clearly mark links as leaving ScamWatch to an official site. |
| FR-5.7.5 | MUST | For victims (P2), present a prioritized "what to do now" checklist (e.g. contact bank, freeze credit, report to IC3) with official links. |
| FR-5.7.6 | SHOULD | Track (aggregate, de-identified) handoff click-throughs to measure the prevent-real-harm outcome (Principle 9) without tracking individuals. |
| FR-5.7.7 | MUST | Keep the registry current; flag stale entries; never present a dead/wrong official link. |
| FR-5.7.8 | MUST | Localize to launch market (Florida) at GA and expand for Phase 2/3 (US, global) without code changes (data-driven registry). |
| FR-5.7.9 | MUST | Display the "not legal advice" disclosure adjacent to handoffs. |

### Acceptance Criteria
- **AC-5.7.1** *Given* an IRS-impersonation verdict in Florida, *then* the handoff includes IRS + FTC (and FL AG where relevant) with official URLs and clear "leaving ScamWatch" labeling.
- **AC-5.7.2** *Given* a victim confirmation screen, *then* a prioritized official-action checklist is shown with working links.
- **AC-5.7.3** *Given* a registry entry marked stale, *then* it is not surfaced until updated.

### Edge Cases
- No official org cleanly maps (novel scam): fall back to FTC general reporting + calm guidance.
- User outside the launch region pre-Phase-2: show federal/national orgs and label regional gaps honestly.
- Official site down: still show the canonical reference and phone alternative.

### Security Considerations
- **SEC-5.7.1** Outbound links MUST be `rel="noopener noreferrer"`, verified-official allowlist only; never let user content inject a "verification" link (anti-phishing-via-ScamWatch).

### Accessibility
- Handoffs are real links with descriptive text ("Report to the FTC (opens official site)"), keyboard-reachable, screen-reader clear. See Volume 6 §VerificationCallout.

### Performance
- Registry cached in-app; handoff rendering adds no measurable latency.

### Future Expansion
- Deep-link prefill into official reporting forms (where APIs/partnerships allow); warm handoff to local victim-support nonprofits; multilingual official-org routing.

**Traceability:** FR-5.7.* → P1, P2, P3; J-recover (primary), J-lookup, J-protect.

---

## FR-5.8 — Alerts & Notifications (Local Trending Campaigns)

### Purpose
Proactively warn users about scams trending in their area (Waze-for-scams), via opt-in alerts and on-site banners, calibrated and privacy-preserving. Helps caregivers (P3) and the general public stay ahead.

### Background
Timely local warnings prevent harm (Principle 9). Alerts must be opt-in, low-noise, calibrated (only well-corroborated trends), and never creepy about location.

### Requirements

| ID | Level | Requirement |
|---|---|---|
| FR-5.8.1 | MUST | Support opt-in alerts (email and/or web push) for: local trending campaigns, follow-up on a user's report, and watched entities/threats. |
| FR-5.8.2 | MUST | Compute "trending near you" from de-identified, aggregated report velocity by region with a Confidence threshold; do not alert on noise. |
| FR-5.8.3 | MUST | Derive region from coarse, user-chosen location (e.g. county/metro) or self-set region — never silently precise-geolocate. |
| FR-5.8.4 | MUST | Render non-intrusive on-site **AlertBanner**s for current local trends to anonymous users (no account needed). |
| FR-5.8.5 | MUST | Make alerts calibrated and non-alarming ("Reports of toll-road texts are rising in your area this week — here's how to spot them"). |
| FR-5.8.6 | MUST | Provide granular notification preferences + one-click unsubscribe in every message (CAN-SPAM/CASL-aware). |
| FR-5.8.7 | SHOULD | Rate-limit/digest alerts to prevent fatigue (e.g. max 1 trend alert/day, weekly digest option). |
| FR-5.8.8 | MUST | Never include third-party PII or un-de-identified content in any alert. |
| FR-5.8.9 | SHOULD | Let users mute specific threat categories or set quiet hours. |

### Acceptance Criteria
- **AC-5.8.1** *Given* a corroborated spike of a campaign in a user's county, *when* the threshold is crossed, *then* opted-in users receive one calibrated alert with verification guidance.
- **AC-5.8.2** *Given* an anonymous visitor in Florida, *then* a non-intrusive AlertBanner reflects current local trends.
- **AC-5.8.3** *Given* any alert, *then* it contains a working one-click unsubscribe and no third-party PII.

### Edge Cases
- Sparse region (not enough reports for a stat-sound trend): suppress alert; do not fabricate a trend.
- Coordinated fake spike: trend calc uses reputation-weighted, moderation-passed signal to resist manipulation.
- User set no region: fall back to state/national trends, labeled as such.

### Security Considerations
- **SEC-5.8.1** Coarse location only; no precise geo storage; push subscriptions stored securely; alert links go to ScamWatch pages, never raw scam URLs.
- **SEC-5.8.2** Unsubscribe tokens are unguessable and single-purpose.

### Accessibility
- AlertBanner dismissible, keyboard-focusable, not color-only, respects `prefers-reduced-motion`; emails are accessible HTML with text alternative. See Volume 6 §AlertBanner.

### Performance
- Trend computation runs on schedule (cron/Edge Functions) over materialized aggregates; banner served from cache; push/email fan-out via queue.

### Future Expansion
- SMS alerts (carefully, to avoid mimicking smishing); partner/community-org broadcast; predictive "emerging" alerts; mobile-app push.

**Traceability:** FR-5.8.* → P1, P3; J-protect (primary), J-report follow-up.

---

## FR-5.9 — Accounts & Reputation (Contributor Leveling)

### Purpose
Optional accounts that enable attribution, reputation, and contributor leveling — increasing high-quality reporting (P4) while keeping the core free and usable without an account (Principle 4).

### Background
Community intelligence quality depends on trusted contributors. A transparent reputation system rewards accurate, helpful reporting and gates elevated trust (e.g. faster auto-publish thresholds), while resisting gaming.

### Requirements

| ID | Level | Requirement |
|---|---|---|
| FR-5.9.1 | MUST | Support Supabase Auth (email/OTP + OAuth) with roles `anonymous`→`member`→`contributor`→`moderator`→`analyst`→`admin`. |
| FR-5.9.2 | MUST | Keep all core features usable by `anonymous`; accounts add attribution, reputation, watchlists, alert prefs, and contributor tooling — never gate the protective core. |
| FR-5.9.3 | MUST | Compute a transparent **reputation score** from contribution quality signals: reports that corroborate/were verified, helpful-explanation feedback, accuracy over time — not raw volume. |
| FR-5.9.4 | MUST | Define contributor **levels** with explicit criteria and (limited, safe) privileges (e.g. higher trust weight in dedupe/trend, access to report-status detail). Privileges MUST NOT include unilateral public-claim power without moderation. |
| FR-5.9.5 | MUST | Penalize/decay reputation for false/spam/brigading reports; make penalties explainable to the user. |
| FR-5.9.6 | MUST | Show users their own contribution history, status of their reports, and reputation breakdown (transparency, Principle 5). |
| FR-5.9.7 | SHOULD | Offer privacy-preserving public profiles (pseudonymous handle, no PII) that contributors can opt into. |
| FR-5.9.8 | MUST | Allow account deletion + data export (CCPA/CPRA/GDPR-ready); deletion de-attributes but may retain de-identified report signal per policy. |
| FR-5.9.9 | MUST | Enforce least-privilege RBAC server-side for all elevated roles. |

### Acceptance Criteria
- **AC-5.9.1** *Given* an anonymous user, *then* they can search, read all detail pages, and submit a report without an account.
- **AC-5.9.2** *Given* a contributor whose reports are repeatedly corroborated, *then* reputation rises and level criteria/privileges are clearly shown.
- **AC-5.9.3** *Given* a user requests deletion, *then* their account/PII is removed and reports are de-attributed within the SLA, retaining only de-identified signal per policy.
- **AC-5.9.4** *Given* a brigading attempt, *then* offending accounts lose reputation with an explainable reason and their signal is down-weighted.

### Edge Cases
- Sybil/multi-account gaming: device/velocity/behavioral signals + corroboration-weighting resist inflation.
- A high-rep contributor goes rogue: privileges are bounded; moderation still gates publication; rapid de-trust path exists.
- Reputation disputes: user can see and contest the breakdown.

### Security Considerations
- **SEC-5.9.1** Auth best practices (OTP rate-limit, session security, MFA for `moderator`+); RBAC enforced in RLS/policies, not UI.
- **SEC-5.9.2** Reputation cannot, by itself, publish defamatory claims; human/mod gate remains for public assertions.
- **SEC-5.9.3** PII minimization in profiles; pseudonymity by default.

### Accessibility
- Account/reputation UI fully keyboard/screen-reader accessible; level criteria in plain language. See Volume 6 §Account/§Reputation.

### Performance
- Reputation recomputed incrementally (event-driven/queued), not on every page load; cached on profile.

### Future Expansion
- Trusted-partner org accounts (banks/telecoms) with vetted elevated trust; badges; gamified-but-not-manipulative streaks; contributor analytics.

**Traceability:** FR-5.9.* → P4, P5; J-contribute (primary), J-report.

---

## FR-5.10 — Moderation Queue & Actions

### Purpose
The trust-and-safety control center: review reports/entities/campaigns before they become public claims, take safe actions, handle appeals/takedowns, and maintain an audit trail. This is where the defamation/privacy guardrails are operationalized.

### Background
Public-benefit + legal-risk management require a human-in-the-loop. AI triages and prioritizes; humans approve consequential public assertions, especially anything touching named individuals/businesses.

### Requirements

| ID | Level | Requirement |
|---|---|---|
| FR-5.10.1 | MUST | Provide a moderation queue for `moderator`/`analyst`/`admin` with AI-prioritized items (new reports, flagged entities, dedupe conflicts, appeals), filterable and sortable. |
| FR-5.10.2 | MUST | Support a defined **publish policy**: an entity/threat/campaign becomes a *public claim* only when it meets confidence + corroboration + (where required) human review thresholds. Below threshold = not publicly indexed. |
| FR-5.10.3 | MUST | Provide safe, reversible moderation **actions**: approve, hold, merge, split, de-identify-more, downrank, `noindex`, reject, escalate — each logged with actor, timestamp, reason. |
| FR-5.10.4 | MUST | Implement an **appeal/takedown/correction** workflow: an individual/business can dispute inclusion; the item is reviewable; outcomes (correct, remove, retain-with-context) are recorded and communicated. |
| FR-5.10.5 | MUST | Require human review before publishing any specific claim implicating a *named private individual* (defamation guardrail). |
| FR-5.10.6 | MUST | Maintain an immutable **audit log** of all moderation actions (who, what, when, why) for accountability and transparency reporting (FR-5.12). |
| FR-5.10.7 | SHOULD | Provide AI-assisted summaries/recommendations per queue item (with Confidence) to speed review — advisory, not auto-acting on consequential claims. |
| FR-5.10.8 | MUST | Detect and route coordinated abuse/brigading for special handling. |
| FR-5.10.9 | MUST | Enforce least-privilege: which roles can take which actions is server-enforced; `admin`-only for policy/threshold changes. |
| FR-5.10.10 | SHOULD | Track SLAs (e.g. appeal response within N business days) and surface overdue items. |

### Acceptance Criteria
- **AC-5.10.1** *Given* a new report below publish thresholds, *then* it is queued and *not* publicly indexed until approved/corroborated.
- **AC-5.10.2** *Given* a takedown appeal, *then* it enters the queue, a moderator can resolve it, and the outcome + reason are logged and communicated to the appellant.
- **AC-5.10.3** *Given* any moderation action, *then* an immutable audit entry (actor/time/reason) exists.
- **AC-5.10.4** *Given* a claim about a named individual, *then* it cannot be published without recorded human review.

### Edge Cases
- Conflicting moderator decisions: last-action-wins with full history; escalation path to `analyst`/`admin`.
- Legal takedown/subpoena: special escalation flow, `admin`-gated, logged.
- Mass false-flag campaign: rate-limit + reputation-weighting + bulk triage tools.

### Security Considerations
- **SEC-5.10.1** Strong RBAC + RLS; audit log tamper-evident; access to raw (pre-de-identified) artifacts is role-gated and logged.
- **SEC-5.10.2** MFA required for moderation roles; session hardening.
- **SEC-5.10.3** Appeal flow must verify the appellant's relationship without collecting excess PII.

### Accessibility
- Console fully keyboard-operable, bulk actions accessible, action confirmations clear; see Volume 6 §ModerationConsole / §ModerationActionBar.

### Performance
- Queue paginated + virtualized; AI summaries precomputed; action latency P95 ≤ 500 ms; audit writes are durable and async-safe.

### Future Expansion
- Tiered auto-publish for very-high-confidence + high-corroboration patterns; partner-org moderation collaboration; ML-assisted appeal triage; transparency-report auto-feed.

**Traceability:** FR-5.10.* → P5; J-moderate (primary); protects all public-facing journeys.

---

## FR-5.11 — Education / Academy Content

### Purpose
A free, evergreen education library ("Academy") teaching people to recognize, avoid, verify, and recover from scams — the always-free protective core (Principle 4) and the prevent-harm engine (Principle 9).

### Background
Education before warning (Principle 1). The Academy converts threat intelligence into durable literacy: lessons, checklists, "spot the scam" interactives, and recovery guides, trauma-aware throughout.

### Requirements

| ID | Level | Requirement |
|---|---|---|
| FR-5.11.1 | MUST | Provide free, structured educational content: per-threat-category guides, "how to verify," "what to do if you've been scammed" (non-blaming), and general digital-safety basics. |
| FR-5.11.2 | MUST | Cross-link Academy ↔ Threat/Entity/Campaign pages bidirectionally (learn from a verdict; act from a lesson). |
| FR-5.11.3 | MUST | Keep all core Academy content free and accessible to `anonymous` users. |
| FR-5.11.4 | SHOULD | Offer interactive learning (quizzes, "spot the red flags" exercises) with accessible implementations. |
| FR-5.11.5 | MUST | Use calibrated, trauma-aware copy; recovery content leads with support and routes to official orgs (FR-5.7). |
| FR-5.11.6 | MUST | Emit discoverability metadata (FR-5.13) — Academy is a primary AI-citation surface. |
| FR-5.11.7 | SHOULD | Support content versioning, editorial review, and "last reviewed" provenance. |
| FR-5.11.8 | MAY | Offer shareable/printable materials for community orgs, libraries, senior centers (P3 amplification). |
| FR-5.11.9 | SHOULD | Localize examples + official-org references to region (Florida default). |

### Acceptance Criteria
- **AC-5.11.1** *Given* an anonymous user, *then* all core Academy content is readable for free.
- **AC-5.11.2** *Given* a Threat page, *then* it links to relevant Academy lessons and vice versa.
- **AC-5.11.3** *Given* recovery content, *then* copy is non-blaming and links to official reporting.

### Edge Cases
- Outdated lesson vs. evolving scam: "last reviewed" + review workflow flags staleness.
- Interactive content with JS disabled: provide accessible non-JS fallback.
- Sensitive recovery topics: gentle framing, crisis-resource links where appropriate.

### Security Considerations
- **SEC-5.11.1** Editorial/review gate prevents misinformation; user-generated comments (if any) are moderated; no PII collection to read.

### Accessibility
- Full WCAG 2.2 AA: semantic structure, captions/transcripts for any media, accessible interactives, plain-language reading level. See Volume 6 §Academy.

### Performance
- Static/ISR; excellent Core Web Vitals; media lazy-loaded.

### Future Expansion
- Multilingual courses; certificates for community educators; email mini-courses; embeddable widgets; partner co-branded curricula.

**Traceability:** FR-5.11.* → P1, P2, P3, P7; J-learn (primary), J-recover, J-protect.

---

## FR-5.12 — Transparency Reports Surface

### Purpose
A public surface publishing ScamWatch's own accountability data — methodology, calibration, moderation stats, takedown/appeal outcomes, data practices — operationalizing "Be transparent" (Principle 5) and "Build trust before growth" (Principle 8).

### Background
Trust is the moat. Publishing how the system works, how accurate it is, and how moderation/appeals resolve is itself a feature. Mirrors security/T&S industry transparency reporting.

### Requirements

| ID | Level | Requirement |
|---|---|---|
| FR-5.12.1 | MUST | Publish periodic transparency reports: report volumes, threat-category breakdowns, moderation action counts, appeal/takedown outcomes, calibration/accuracy metrics — all aggregate, de-identified. |
| FR-5.12.2 | MUST | Document methodology: how verdicts/Confidence are produced, what data is collected, retention schedules, de-identification approach. |
| FR-5.12.3 | MUST | Publish data-practice disclosures aligned with CCPA/CPRA + GDPR-ready architecture + Florida statutes; "we never sell your data" stated and honored. |
| FR-5.12.4 | SHOULD | Offer machine-readable transparency data (JSON/CSV) for researchers/press (P6). |
| FR-5.12.5 | MUST | Source figures from the audit log/aggregates (FR-5.10.6) — no hand-curated, unverifiable numbers. |
| FR-5.12.6 | SHOULD | Show calibration honestly, including where the model is weak/uncertain (Principle 6). |
| FR-5.12.7 | MUST | Carry "not legal advice" + link to full privacy policy/terms. |

### Acceptance Criteria
- **AC-5.12.1** *Given* a published report, *then* its figures are traceable to audited aggregates, with methodology and de-identification documented.
- **AC-5.12.2** *Given* a researcher, *then* machine-readable transparency data is downloadable.
- **AC-5.12.3** *Given* calibration data, *then* known weaknesses are disclosed, not hidden.

### Edge Cases
- A bad period (low accuracy / high appeals): still published honestly with context.
- Figures that could aid scammers (e.g. exact detection blind spots): disclose responsibly without an exploit roadmap.

### Security Considerations
- **SEC-5.12.1** Aggregation must prevent re-identification (k-anonymity/thresholding on small cells); no operational secrets that enable evasion are exposed.

### Accessibility
- Charts have data-table equivalents; reports readable as semantic HTML, not image-only PDFs. See Volume 6 §Transparency.

### Performance
- Precomputed/cached; static where possible.

### Future Expansion
- Real-time public dashboard; third-party audits; standardized transparency schema; regional breakdowns for Phase 2/3.

**Traceability:** FR-5.12.* → P5, P6, P7; supports trust across all journeys.

---

## FR-5.13 — Search-Engine / AI-Answer Discoverability

### Purpose
Ensure ScamWatch content is found and *correctly cited* by search engines and AI answer engines (P7) — because being the source AI assistants quote when someone asks "is +1-888-… a scam?" prevents harm at internet scale (Principle 9).

### Background
Much scam-checking now happens inside Google's AI Overviews, ChatGPT, Perplexity, Claude, etc. ScamWatch must be technically discoverable, structurally citable, and calibrated so AI engines surface its verdicts *with* Confidence and verification — not stripped of nuance.

### Requirements

| ID | Level | Requirement |
|---|---|---|
| FR-5.13.1 | MUST | Emit valid structured data (schema.org) on public pages: e.g. `FAQPage`/`HowTo`/`Article` for Threat/Academy, and a custom/extended type carrying verdict + Confidence + verification for Entity/Threat. |
| FR-5.13.2 | MUST | Provide clean, semantic, server-rendered HTML (Next.js SSR/ISR) with meaningful titles, meta descriptions, canonical URLs, and accessible headings — crawlable without JS. |
| FR-5.13.3 | MUST | Maintain sitemaps + `robots.txt`; index only *publishable* (corroborated, moderated) entities/campaigns; `noindex` provisional/low-confidence pages (ties to FR-5.4.9/FR-5.5.9/FR-5.10.2). |
| FR-5.13.4 | MUST | Present verdicts in machine- and human-citable form so an AI engine quoting the page necessarily carries the Confidence and the "verify with official org" caveat (anti-decontextualization). |
| FR-5.13.5 | SHOULD | Provide an AI-answer-friendly summary block (concise, calibrated, source-attributed) near the top of citable pages. |
| FR-5.13.6 | SHOULD | Expose a stable, documented public read API / structured feed for vetted AI/search partners (rate-limited, calibrated payloads). |
| FR-5.13.7 | MUST | Keep canonical URLs stable (entity/threat/campaign permalinks) so citations don't rot. |
| FR-5.13.8 | MUST | Never let discoverability optimization introduce uncalibrated/overstated claims (Principle 6) — SEO copy obeys the same calibration rules. |
| FR-5.13.9 | SHOULD | Support Open Graph/Twitter cards for shareable, accurate previews (P3 sharing). |

### Acceptance Criteria
- **AC-5.13.1** *Given* a crawler fetches a Threat/Entity page, *then* valid schema.org structured data including the calibrated verdict + verification is present and the page renders meaningfully without JS.
- **AC-5.13.2** *Given* a provisional/low-confidence entity, *then* the page is `noindex` and excluded from the sitemap.
- **AC-5.13.3** *Given* an AI engine summarizes a page, *then* the structured content makes the Confidence and "verify with official org" caveat available to carry into the answer.

### Edge Cases
- AI engine strips nuance anyway: minimize damage by making the calibrated caveat structurally inseparable from the verdict in the primary content.
- Scammers SEO-attack their own entity page (fake "safe" signals): content is system-generated from moderated data, not user-editable meta.
- Duplicate/near-duplicate pages: canonical tags prevent dilution.

### Security Considerations
- **SEC-5.13.1** Don't expose unpublished/under-review data via sitemaps, feeds, or structured data; partner API is authenticated, rate-limited, and serves only publishable, de-identified, calibrated data.

### Accessibility
- Discoverability and accessibility share the same semantic-HTML foundation; structured data complements, never replaces, accessible content. See Volume 6 IA & global layout.

### Performance
- SSR/ISR + edge caching for fast crawl + good Core Web Vitals (a ranking and UX contract: LCP < 2.5 s, INP < 200 ms, CLS < 0.1).

### Future Expansion
- Dedicated AI-citation partner program; `llms.txt`-style guidance; real-time verdict feed; structured "scam check" answer API for assistants/browsers/telecoms.

**Traceability:** FR-5.13.* → P7, P1, P3, P6; amplifies J-lookup, J-protect, J-learn at internet scale.

---

## Cross-Volume Assumptions

- **Verdict vocabulary & Confidence bands** (`Likely Safe`/`No Signal`/`Use Caution`/`Likely Scam`/`Confirmed Reported Scam`) are defined functionally here and presented in **Volume 6 — UX Specification §VerdictCard/§ConfidenceMeter**; the underlying scoring/calibration is owned by the **AI volume**.
- **Data shapes** (Report, Entity, Threat, Campaign, Verification, Explanation, Confidence, reputation, audit log) are specified in **Volume 10 — Database**; this volume references them by canonical name only.
- **OCR, de-identification, entity extraction, classification, campaign correlation, embeddings** behavior is owned by the **AI volume**; this volume defines the *functional contract* (inputs, outputs, calibration/disclosure obligations) the AI volume must satisfy.
- **Auth/RBAC/RLS** specifics live in the **Security volume**; roles used here (`anonymous`…`admin`) match the shared context.
- **Privacy, retention schedules, CCPA/CPRA/GDPR/Florida compliance** detail lives in the **Privacy/Legal volume**; FR-5 references obligations (de-identification, retention, deletion, "never sell data").
- **Design tokens, components, breakpoints** are owned by **Volume 7 — Design System** and detailed in **Volume 6 — UX Specification**; FR-5 names components (SearchBar, VerdictCard, etc.) but does not style them.
- **Non-functional targets** (latency/Core Web Vitals figures cited per section) are restated/owned in the **Non-Functional Requirements volume**; figures here are the functional intent and should be reconciled there.

*End of Volume 5.*
