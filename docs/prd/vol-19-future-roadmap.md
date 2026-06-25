# Volume 19 — Future Roadmap

> Part of the ScamWatch master PRD ("Project Sentinel"). Written against `_shared-context.md`. Do not contradict the shared context; this volume extends it.

This volume specifies the **post-launch capability roadmap**: a browser extension, mobile apps, enterprise/partner APIs, OCR enhancements, voice (vishing/robocall) analysis, deepfake detection, internationalization/localization, and an optional graph-database migration for the Knowledge Graph at scale. Each capability is documented to the Documentation Standard, with a phased plan, explicit dependencies on the launch architecture (the shared-context stack), and a **principle-compliance review gate** every capability must pass before it ships. Nothing here may contradict the nine Product Principles; the roadmap exists to extend protection, never to weaken it. Requirement IDs use the prefix `RM-19`.

## Table of Contents

1. [Roadmap Framing, Sequencing & Phase Gates](#1-roadmap-framing-sequencing--phase-gates)
2. [Browser Extension](#2-browser-extension)
3. [Mobile Apps (iOS/Android)](#3-mobile-apps-iosandroid)
4. [Enterprise / Partner APIs](#4-enterprise--partner-apis)
5. [OCR Enhancements](#5-ocr-enhancements)
6. [Voice Analysis (Vishing/Robocall)](#6-voice-analysis-vishingrobocall)
7. [Deepfake Detection](#7-deepfake-detection)
8. [Internationalization & Localization](#8-internationalization--localization)
9. [Graph-Database Migration (Knowledge Graph)](#9-graph-database-migration-knowledge-graph)
10. [Cross-Volume Dependencies](#10-cross-volume-dependencies)

---

## 1. Roadmap Framing, Sequencing & Phase Gates

**Purpose.** Provide a single ordering, gating model, and review bar for all future capabilities so they extend the launch architecture coherently and remain principle-compliant.

**Background.** Launch = Florida, web product on Next.js/Vercel + Supabase + OpenAI (shared context). Phase 2 = US, Phase 3 = global. Each capability below builds on launch primitives (Reports, Entities, Threats, Campaigns, Verification, Explanation, Confidence) and must not fork the data model.

**Principle-Compliance Review Gate (PCRG) — every capability MUST pass before GA:**

| # | Gate question (maps to Principles) |
|---|---|
| 1 | Does it *explain before warning* and present calibrated Confidence? (P1, P6) |
| 2 | Is it victim-respecting, no blame/shame? (P2) |
| 3 | Does it minimize data, avoid selling, default to de-identification? (P3) |
| 4 | Does the protective core stay free? (P4) |
| 5 | Is it transparent (sources, confidence, methodology)? (P5) |
| 6 | Does it route to official organizations for verification? (P7) |
| 7 | Does it build trust (no growth-over-trust shortcuts)? (P8) |
| 8 | Does it demonstrably help prevent real-world harm? (P9) |
| 9 | Defamation/privacy/accessibility (WCAG 2.2 AA) guardrails met? (shared context) |

**Indicative sequencing (dependency-ordered, not calendar-bound):**

```
Wave 1 (nearest, lowest new-infra): OCR Enhancements → Browser Extension
Wave 2: Mobile Apps → Enterprise/Partner APIs
Wave 3: Voice Analysis → Deepfake Detection
Cross-cutting (gated by market): Internationalization (Phase 2 US → Phase 3 global)
Scale option (triggered, not scheduled): Graph-DB migration
```

**Requirements.**

- `RM-19.1.1` Every capability **MUST** pass the PCRG before general availability; a failed gate blocks GA.
- `RM-19.1.2` Capabilities **MUST** reuse launch domain objects and the existing AI/Confidence/Explanation pipeline (Vol 12) rather than creating parallel models.
- `RM-19.1.3` Each capability **MUST** define phase gates (alpha→beta→GA) with measurable exit criteria tied to intelligence-quality + safety metrics (Vol 18).
- `RM-19.1.4` Any capability collecting new data types **MUST** extend the retention/consent/privacy schedule (Vol 10/14) before collection begins.

**Acceptance Criteria.** `AC-19.1.a` A capability cannot be marked GA without a recorded PCRG pass. `AC-19.1.b` Each capability's spec lists its launch-architecture dependencies explicitly.

**Edge Cases / Security / Accessibility / Performance / Future Expansion.** A capability that passes most gates but fails P3/P9 is held, not shipped "with caveats." All gates are auditable. WCAG 2.2 AA is a gate, not a follow-up. Sequencing may reorder on evidence, but gating never relaxes.

---

## 2. Browser Extension

**Purpose.** Real-time, in-context checking of pages and links as users browse — surfacing calibrated scam signals and verification routing at the moment of risk.

**Background.** Extends the web lookup experience to where users actually encounter links/pages. Builds on the launch classification + Entity + Explanation APIs.

**Requirements.**

- `RM-19.2.1` The extension **MUST** check the active URL/domain and on-page links against ScamWatch intelligence and return an Explanation with Confidence and official-org routing — *explain before warning* (P1).
- `RM-19.2.2` It **MUST** be privacy-preserving by default: send only minimized signals (e.g., hashed/normalized domain), **MUST NOT** transmit full browsing history or page content without explicit, scoped consent (P3).
- `RM-19.2.3` It **MUST** never auto-block or make accusations about named individuals; it informs and routes to verification (P2, P7, defamation guardrail).
- `RM-19.2.4` It **MUST** degrade gracefully offline/when the API is unavailable (no false "safe" claims).
- `RM-19.2.5` Core protective checks **MUST** remain free (P4).

**Acceptance Criteria.** `AC-19.2.a` On a known smishing domain, the extension shows a calibrated explanation + Confidence + IC3/FTC routing without sending page content. `AC-19.2.b` With enhanced checking off, only minimized domain signals leave the browser (verified in network capture). `AC-19.2.c` PCRG passed.

**Edge Cases.** False positive on a legitimate look-alike (calibrated language, easy feedback/appeal, ref Vol 16). Local/private pages, intranets (skip). Browser API differences (Chromium/Firefox/Safari MV3 variance).

**Security Considerations.** Minimal permissions (no broad `<all_urls>` data exfiltration); content-script isolation; signed/published via official stores; no third-party trackers (Vol 18). Anti-tampering on the verdict UI.

**Accessibility.** Extension UI WCAG 2.2 AA: keyboard operable, screen-reader labels, no color-only verdicts.

**Performance.** Checks async, cached, debounced; **MUST NOT** noticeably slow page interaction; respects rate limits.

**Future Expansion.** Inline form-fill warnings (e.g., entering card on flagged page), enterprise-managed deployment, per-market routing (i18n, §8).

**Dependencies.** Vol 12 (classification/Explanation/Confidence APIs), Vol 11 (abuse/rate-limiting), Vol 14 (privacy/consent), Vol 18 (privacy-first telemetry, feedback events).

---

## 3. Mobile Apps (iOS/Android)

**Purpose.** Native apps for lookups, reporting (camera capture of scam texts/screens), and — within OS limits — SMS/call screening assistance.

**Background.** Mobile is where smishing/vishing land. Native apps unlock camera/OCR capture and OS screening extensions, subject to strict platform constraints.

**Requirements.**

- `RM-19.3.1` Apps **MUST** provide lookup, report submission (incl. screenshot/photo capture feeding OCR §5), Explanations with Confidence, and official-org routing (P1, P7).
- `RM-19.3.2` **SMS/call screening MUST** operate strictly within OS capabilities: iOS uses approved extension points (e.g., Call Directory / unwanted-communication / Live Voicemail-adjacent, Messages filtering where permitted); Android uses permitted call-screening/SMS APIs. Apps **MUST NOT** request or rely on disallowed message/call access; behavior is assistive, not interceptive.
- `RM-19.3.3` On-device minimization: screening/matching **SHOULD** prefer on-device/hashed checks; message/call content **MUST NOT** be uploaded without explicit, scoped consent (P3).
- `RM-19.3.4` Apps **MUST NOT** auto-accuse or auto-block named individuals; they flag patterns/infrastructure and route to verification (P2, defamation guardrail).
- `RM-19.3.5` Protective core **MUST** stay free (P4); store listings **MUST** use calibrated, non-fearmongering language (P6).

**Acceptance Criteria.** `AC-19.3.a` A captured smishing screenshot is OCR'd and returns a calibrated explanation + routing, with the image handled per Storage/scanning rules (Vol 10/11). `AC-19.3.b` Screening uses only sanctioned OS APIs (store-review compliant). `AC-19.3.c` PCRG passed.

**Edge Cases.** OS API limits vary by version/region (feature-detect, degrade). Permission denial (app remains useful for manual lookups). Offline mode.

**Security Considerations.** Secure storage of any local data; signed app distribution; no service-role/AI keys in the client (Vol 17 §4); image uploads via signed URLs + server-side scanning (Vol 10/11).

**Accessibility.** Native a11y (VoiceOver/TalkBack), dynamic type, WCAG 2.2 AA-equivalent; trauma-aware copy.

**Performance.** Fast cold start; on-device caching; battery-conscious screening.

**Future Expansion.** Push alerts for active campaigns in the user's area (privacy-safe), wearable/quick-share, deeper OS integrations as platforms allow.

**Dependencies.** Vol 12 (AI/Explanation), §5 (OCR), Vol 10/11 (Storage/scanning), Vol 14 (privacy), Vol 18 (telemetry/consent), §8 (localized routing).

---

## 4. Enterprise / Partner APIs

**Purpose.** Share **anonymized threat intelligence** with vetted partners (banks, state AGs, telecoms) to amplify harm prevention — strictly never user data.

**Background.** Partners can act on aggregated infrastructure/campaign intelligence (e.g., block a domain, warn customers). This is an intelligence exchange, not a data sale.

**Requirements.**

- `RM-19.4.1` APIs **MUST** expose only **anonymized, aggregated** Threat/Entity/Campaign intelligence with Confidence and methodology; they **MUST NOT** expose individual users, reporters, victims, or raw report content (P3, defamation/privacy guardrails).
- `RM-19.4.2` Data **MUST NOT** be sold for advertising/data-broker use; partner agreements **MUST** bind use to consumer-protection purposes (P3).
- `RM-19.4.3` Outbound intelligence **MUST** carry calibrated Confidence and "verify/act per your own process" framing — ScamWatch states patterns, not verdicts on private individuals (P5, P6).
- `RM-19.4.4` Access **MUST** be authenticated, scoped, rate-limited, contractually governed, and fully audit-logged; revocable.
- `RM-19.4.5` Partner APIs **MAY** be a paid/enterprise tier **only** insofar as the consumer protective core stays free (P4).

**Acceptance Criteria.** `AC-19.4.a` An API response contains no PII, no reporter identity, no raw report content (schema-enforced + audited). `AC-19.4.b` Every partner call is authenticated, scoped, and logged. `AC-19.4.c` PCRG passed, with legal sign-off on agreements.

**Edge Cases.** Partner requests user-level data (refused by design). Re-identification risk from aggregates (k-anonymity/small-cell suppression, differential-privacy option). Conflicting partner (avoid enabling unfair targeting of individuals).

**Security Considerations.** Strong authn (OAuth client-credentials/mTLS), per-partner scopes, anomaly detection on usage, signed payloads; legal hold/audit (Vol 14).

**Accessibility.** Developer docs/portal WCAG 2.2 AA.

**Performance.** Versioned, paginated, cached; SLAs per tier; never impacts consumer serving path.

**Future Expansion.** Bi-directional intel (partners contribute anonymized signals), real-time campaign webhooks, regulator reporting formats, ISAC-style sharing.

**Dependencies.** Vol 10 (data model/anonymization), Vol 12 (intelligence/Confidence), Vol 14 (privacy/legal), Vol 16 (transparency reporting of partner program), Vol 17 (authn/observability).

---

## 5. OCR Enhancements

**Purpose.** Improve extraction of text/Entities from scam screenshots and photos (multi-language, low-quality, adversarial layouts) to raise report quality and detection.

**Background.** Launch OCR exists in the AI layer (shared context). Enhancements increase accuracy/coverage feeding Entity extraction and classification.

**Requirements.**

- `RM-19.5.1` OCR **MUST** extract text and feed Entity extraction (phones/URLs/emails/handles) with Confidence (Vol 12); failures degrade gracefully (manual entry).
- `RM-19.5.2` Enhancements **MUST** improve robustness to low quality, screenshots, multiple scripts/languages (ties to §8), and adversarial obfuscation.
- `RM-19.5.3` Uploaded images **MUST** be handled per Storage + server-side scanning + retention rules (Vol 10/11); PII in images **MUST** be redactable (Vol 16 redaction standard).
- `RM-19.5.4` Extracted content **MUST** keep calibrated Confidence; OCR output is not asserted as fact (P5/P6).

**Acceptance Criteria.** `AC-19.5.a` A low-quality smishing screenshot yields correct phone/URL Entities above a target accuracy with Confidence. `AC-19.5.b` Victim PII in an image can be redacted before any public surfacing. `AC-19.5.c` PCRG passed.

**Edge Cases.** Mixed-script images; emoji/obfuscation; misleading look-alike characters (homoglyphs) — normalize and flag. Non-text images (handle gracefully).

**Security Considerations.** Images scanned for malware before processing; no auto-fetch of embedded URLs (Vol 11); processing isolated.

**Accessibility.** Extracted text improves a11y (alt/text equivalents for image reports), WCAG 2.2 AA.

**Performance.** Async OCR via queue (`pgmq`)/edge functions; bounded latency; cost-monitored (Vol 18).

**Future Expansion.** On-device OCR (mobile §3), layout-aware extraction, homoglyph/obfuscation-resistant models.

**Dependencies.** Vol 10/11 (Storage/scanning), Vol 12 (Entity/classification), §3 (mobile), §8 (multilingual).

---

## 6. Voice Analysis (Vishing/Robocall)

**Purpose.** Detect and explain vishing/robocall scam patterns from audio (user-submitted recordings/voicemails), surfacing calibrated signals and verification routing.

**Background.** Voice is a major fraud vector (IRS/SSA impersonation, bank fraud). Analysis covers transcription + pattern/script detection, and optionally synthetic-voice indicators (ties to §7).

**Requirements.**

- `RM-19.6.1` Voice analysis **MUST** operate on **consented, user-submitted** audio; ScamWatch **MUST NOT** wiretap or intercept live calls (legal/privacy; two-party-consent jurisdictions respected — P3, Vol 14).
- `RM-19.6.2` It **MUST** transcribe and classify scam *patterns/scripts* with Confidence and Explanation, and route to official orgs (P1, P5, P7) — not accuse named individuals (P2, defamation guardrail).
- `RM-19.6.3` Audio **MUST** follow Storage/scanning/retention/minimization rules (Vol 10/11/14); voiceprints **MUST NOT** be created for identification of private individuals.
- `RM-19.6.4` Synthetic/AI-voice likelihood (if surfaced) **MUST** be calibrated and clearly probabilistic, never a definitive claim (P6).

**Acceptance Criteria.** `AC-19.6.a` A submitted IRS-impersonation voicemail is transcribed, classified with Confidence, and returns IRS/IC3 routing. `AC-19.6.b` No live-call interception path exists; only consented submissions. `AC-19.6.c` PCRG passed with legal sign-off on consent/recording law.

**Edge Cases.** Background noise/accents/multilingual (ties §8). Legitimate-but-aggressive callers (avoid over-flagging). Two-party-consent states (clear consent UX).

**Security Considerations.** Encrypted audio at rest, access-controlled, short retention; malware/format validation; no identification voiceprints.

**Accessibility.** Transcripts provide a11y for audio; WCAG 2.2 AA UI.

**Performance.** Async transcription pipeline; bounded latency; cost monitored.

**Future Expansion.** Robocall pattern campaigns (link to Campaign detection), carrier/partner reporting (§4), on-device pre-screening (§3, OS-limited).

**Dependencies.** Vol 12 (classification/Campaign), Vol 10/11 (Storage/scanning), Vol 14 (recording/consent law), §7 (synthetic-voice), §3/§4.

---

## 7. Deepfake Detection (Image / Video / Voice)

**Purpose.** Help users assess whether submitted media is likely AI-generated/manipulated, as part of scam evaluation — always probabilistically and humbly.

**Background.** Deepfakes power romance, investment, impersonation, and sextortion scams. Detection is inherently uncertain and adversarial; ScamWatch must avoid false certainty.

**Requirements.**

- `RM-19.7.1` Detection output **MUST** be calibrated likelihood with Confidence and clear limitations — never a definitive "real/fake" verdict (P5, P6); always paired with verification routing (P7).
- `RM-19.7.2` It **MUST NOT** be used to accuse or identify named private individuals; it assesses *media authenticity signals*, not identity (P2, defamation/privacy guardrails).
- `RM-19.7.3` Media **MUST** follow Storage/scanning/retention/minimization (Vol 10/11/14); sensitive media (e.g., sextortion) handled with extra restriction + crisis routing (Vol 16).
- `RM-19.7.4` Model limitations and known evasions **MUST** be documented and surfaced honestly (P5); results feed transparency metrics (Vol 18 §7).

**Acceptance Criteria.** `AC-19.7.a` A manipulated image returns a calibrated likelihood + limitations + routing, never an unqualified "fake." `AC-19.7.b` Sextortion-context media triggers victim-sensitive handling + crisis resources (Vol 16). `AC-19.7.c` PCRG passed.

**Edge Cases.** Adversarial media defeating detection (state uncertainty, don't over-claim). Legitimate edited media (false-positive care). Minors in media (escalate, strict handling).

**Security Considerations.** Strict access/retention for sensitive media; isolated processing; no public exposure of submitted media; abuse prevention (don't become a tool to validate harassment).

**Accessibility.** Result UI WCAG 2.2 AA with plain-language, calibrated framing.

**Performance.** Async, queued; bounded latency; cost-monitored; coverage/drift tracked (Vol 18).

**Future Expansion.** Provenance standards (C2PA/content credentials), cross-modal (voice §6 + face), partner intel (§4).

**Dependencies.** Vol 12 (AI pipeline/Confidence), Vol 10/11 (Storage/scanning), Vol 16 (sensitive handling/crisis), Vol 18 (quality metrics), §6.

---

## 8. Internationalization & Localization

**Purpose.** Extend ScamWatch beyond Florida → US → global with proper translation, RTL support, locale-aware scam intelligence, and locale-specific official-org routing.

**Background.** Market rollout is explicitly phased (shared context). Scams and the *official organizations to verify with* differ by jurisdiction; routing must localize or it breaks Principle 7.

**Requirements.**

- `RM-19.8.1` The product **MUST** support i18n infrastructure: externalized strings, locale negotiation, pluralization, date/number/locale formatting, and **RTL** layouts (e.g., Arabic/Hebrew).
- `RM-19.8.2` Translations **MUST** preserve calibrated, trauma-aware tone (P2/P6); translated copy **MUST** be reviewed, not raw machine output, for user-facing protective surfaces.
- `RM-19.8.3` **Official-organization routing MUST** be locale-specific (e.g., US: FTC/IC3/CFPB/IRS/SSA/state AG; other markets: their consumer-protection/fraud/CERT bodies) — a per-locale routing table maintained as config (P7).
- `RM-19.8.4` Threat taxonomy and Explanations **MUST** accommodate locale-specific scam variants and languages (incl. multilingual OCR §5 and voice §6).
- `RM-19.8.5` Localization **MUST** respect locale-specific privacy/consumer law (GDPR-ready, etc., Vol 14) and data-residency considerations (ties Vol 17 per-region).

**Acceptance Criteria.** `AC-19.8.a` Switching locale renders translated, tone-preserved copy and the correct local official-org routing. `AC-19.8.b` An RTL locale renders correctly (layout mirrored, WCAG 2.2 AA). `AC-19.8.c` PCRG passed per market.

**Edge Cases.** Missing translation (graceful fallback + flag, never blank). Mixed-language content. Regions with weak/no official fraud body (route to best available, state limitation honestly).

**Security Considerations.** Locale-specific legal/defamation norms reviewed; per-region data handling (Vol 14/17).

**Accessibility.** RTL + translation both bound by WCAG 2.2 AA; language attributes set for screen readers.

**Performance.** Locale bundles loaded efficiently (no CWV regression, Vol 18); routing table cached.

**Future Expansion.** Community translation (vetted, Vol 16), regional intelligence partnerships (§4), per-region calibration (Vol 18 §7).

**Dependencies.** Vol 12 (multilingual classification), Vol 14 (regional law), Vol 17 (per-region infra/residency), Vol 16 (localized support/hotlines, translation review), Vol 18 (per-market metrics), §5/§6.

---

## 9. Graph-Database Migration (Knowledge Graph)

**Purpose.** Offer a migration path from the launch PostgreSQL-modeled Knowledge Graph (nodes + edges tables) to a dedicated graph database **if and when** scale/query complexity warrants it.

**Background.** The shared context fixes the launch decision: the Knowledge Graph is modeled in PostgreSQL (nodes + edges), with a graph DB documented as a **future-expansion option** — this section is that documentation. Migration is *triggered by evidence*, not scheduled.

**Requirements.**

- `RM-19.9.1` Migration **MUST** be triggered only by documented thresholds (e.g., multi-hop campaign-correlation query latency, graph size, traversal complexity) exceeding what tuned Postgres (indexes, recursive CTEs, `pgvector`) can serve — not by novelty.
- `RM-19.9.2` Any graph DB **MUST** preserve the canonical domain model (Report/Entity/Threat/Campaign/Verification/Explanation/Confidence) and Confidence semantics; it is a *store/engine* change, not a model change.
- `RM-19.9.3` Migration **MUST** be incremental and reversible: dual-write/shadow-read, parity validation against Postgres, staged cutover, rollback path (ties Vol 17 expand/contract + release strategy).
- `RM-19.9.4` Privacy/retention/legal-hold and de-identification rules (Vol 10/14) **MUST** apply identically in the new store; no relaxation.
- `RM-19.9.5` A documented decision record **MUST** capture the trigger evidence, chosen engine, and rollback criteria before cutover.

**Acceptance Criteria.** `AC-19.9.a` A shadow-read phase shows graph-DB results match Postgres for correlation queries within tolerance before cutover. `AC-19.9.b` Rolling back to Postgres mid-migration loses no data and breaks no contract. `AC-19.9.c` Retention/legal-hold verified equivalent in the new store. `AC-19.9.d` PCRG passed.

**Edge Cases.** Partial migration (Postgres remains source of truth until parity proven). Vendor lock-in (favor portable/queryable engines; keep export). Cost/operational burden vs. benefit (decision record must justify).

**Security Considerations.** New store inherits RBAC/RLS-equivalent controls, encryption, audit logging (Vol 17); no widened access surface.

**Accessibility.** N/A (backend) — stated explicitly.

**Performance.** Justified by measured improvement in campaign-correlation/traversal latency at scale; must not regress the consumer serving path.

**Future Expansion.** Hybrid (Postgres OLTP + graph engine for analytics/correlation), graph-native campaign detection, GNN-based link prediction feeding Confidence (Vol 12) — all PCRG-gated.

**Dependencies.** Vol 10 (Knowledge Graph schema/retention), Vol 12 (Campaign correlation/Confidence consumers), Vol 17 (migration workflow, backups, release/rollback), Vol 18 (latency/quality metrics that trigger and validate migration).

---

## 10. Cross-Volume Dependencies

| Depends on / relates to | For |
|---|---|
| **Vol 10 — Database** | Domain model, Knowledge Graph schema, Storage, retention, anonymization |
| **Vol 11 — (Abuse/Security)** | Media scanning, rate-limiting, no-auto-fetch, Sybil resistance |
| **Vol 12 — (AI/Intelligence)** | Classification, Entity extraction, Campaign correlation, Confidence, Explanation |
| **Vol 14 — (Legal/Privacy)** | Consent, recording law, defamation guardrails, residency, legal hold |
| **Vol 16 — Operations** | Sensitive-media/crisis handling, translation review, transparency of partner program |
| **Vol 17 — Deployment** | Migration workflow, expand/contract, rollback, per-region infra, authn/observability |
| **Vol 18 — Analytics** | Intelligence-quality metrics that gate phase transitions; privacy-first telemetry; per-market metrics |

**Cross-volume assumptions made by this volume:** the launch architecture (Next.js/Vercel + Supabase + OpenAI + Postgres-modeled Knowledge Graph) is the fixed foundation every capability extends; the AI/Confidence/Explanation pipeline (Vol 12) is reused, never forked; privacy/legal rules (Vol 14) and retention (Vol 10) bind every new data type *before* collection; and the Principle-Compliance Review Gate (PCRG, §1) is a hard, auditable GA gate for all eight capabilities. Sequencing is dependency-ordered and may reorder on evidence, but no gate (especially P3 privacy, P4 free core, P7 verification routing, P9 harm-prevention, and WCAG 2.2 AA) is ever relaxed.
