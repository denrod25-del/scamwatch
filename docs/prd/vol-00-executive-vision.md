# Volume 0 — Executive Vision

> **Project Sentinel · ScamWatch master PRD**
> Tagline: *Know Before You Click™*

This volume is the document a new senior hire reads on day one. It establishes the problem, the thesis, the public-benefit charter, the 100-year framing, the boundaries of what the product is and is not, the nine product principles turned into concrete engineering implications, the definition of success, the primary risks and their architectural mitigations, and the canonical glossary of domain objects every other volume depends on. It contains no implementation detail of its own — those live in Volumes 1+ — but every downstream decision must trace back to a principle, requirement, or definition stated here.

Requirement ID prefixes for this volume: `FR-0.<section>.<n>` (functional/product), `NFR-0.<section>.<n>` (non-functional/strategic). Other volumes reference these IDs directly.

---

## Table of Contents

1. [The Problem](#1-the-problem)
2. [The ScamWatch Thesis](#2-the-scamwatch-thesis)
3. [Public-Benefit Mission & Charter Summary](#3-public-benefit-mission--charter-summary)
4. [The 100-Year Vision](#4-the-100-year-vision)
5. [What the Product IS and ISN'T](#5-what-the-product-is-and-isnt)
6. [Product Principles, Operationalized](#6-product-principles-operationalized)
7. [Definition of Success](#7-definition-of-success)
8. [Primary Risks & Architectural Mitigations](#8-primary-risks--architectural-mitigations)
9. [Glossary of Canonical Domain Objects](#9-glossary-of-canonical-domain-objects)
10. [Cross-Volume Map](#10-cross-volume-map)

---

## 1. The Problem

### 1.1 Purpose

Define the consumer-fraud problem ScamWatch exists to address, and explain why the existing tooling landscape leaves ordinary consumers — especially those at highest risk — under-protected at the decisive moment.

### 1.2 Background

Consumer fraud is large, growing, and structurally favorable to attackers. Three properties make it resistant to the tools that exist today:

1. **The decisive moment is private and time-boxed.** A scam succeeds or fails in the seconds between a person receiving a message and acting on it. Most protective tooling (annual reports, post-hoc complaint portals, news coverage) operates on a timescale of days to months — long after the money has moved.
2. **Attack infrastructure is cheap, disposable, and recombined.** Phone numbers, domains, lookalike brands, payment handles, and crypto wallets are spun up in bulk, used briefly, and discarded. A single reported number tells a consumer little; the *pattern* across thousands of reports is where the signal lives — and consumers have no access to that aggregate.
3. **The highest-risk populations are the least served.** Older adults, recent immigrants, the recently bereaved, and the financially stressed are disproportionately targeted, yet the existing tools assume technical literacy, English fluency, and the emotional bandwidth to parse a fraud-prevention article while under social-engineering pressure.

> **Calibration note.** Specific dollar figures for consumer fraud losses, Florida-specific exposure, and demographic targeting are sized in **Volume 2 — Market Research** and are explicitly labeled there as estimates or illustrative where the underlying public data is incomplete. This volume asserts the *shape* of the problem, not precise magnitudes.

### 1.3 Why existing tools fail consumers (summary; full landscape in Volume 2)

| Tool category | What it does well | Why it fails the consumer at the decisive moment |
|---|---|---|
| Government complaint portals (FTC `reportfraud`, FBI IC3) | Authoritative intake; feed enforcement | Designed for *reporting after the fact*, not *checking before acting*; no real-time consumer-facing lookup; slow feedback loop |
| Crowd scam trackers (BBB Scam Tracker, community forums) | Community signal, narrative reports | No calibrated confidence; uneven moderation; weak entity normalization; little explainability |
| Caller-ID / spam apps (Truecaller, Robokiller) | Block known-bad numbers | Channel-specific (phone only); opaque scoring; commercial data practices that conflict with privacy-first norms |
| Consumer protection suites (Aura and similar) | Bundled monitoring/identity | Paywalled; protective core not free; not a public-benefit charter |
| Infra/analyst tools (VirusTotal, urlscan.io) | Deep technical verdicts | Built for security professionals; not consumer-legible; no trauma-aware framing or victim support |

The gap ScamWatch fills: **a free, calibrated, explainable, multi-channel, consumer-legible check that runs at the decisive moment and always routes to official verification.**

### 1.4 Requirements

| ID | Level | Requirement |
|---|---|---|
| FR-0.1.1 | MUST | The product MUST support a consumer-initiated check at the decisive moment (before acting on a suspicious message), not only post-incident reporting. |
| FR-0.1.2 | MUST | The product MUST accept inputs across all primary scam channels: SMS/text, voice/phone number, email, URL/domain, social/marketplace message, and uploaded screenshot. |
| FR-0.1.3 | MUST | The product MUST operate without requiring account creation for the core protective check (see Principle 4; `FR-0.6.4`). |
| FR-0.1.4 | SHOULD | The product SHOULD be usable by a non-technical, stressed user with no security vocabulary, at a 6th–8th-grade reading level baseline. |
| FR-0.1.5 | SHOULD | The product SHOULD degrade gracefully for users with low connectivity, older devices, and assistive technology. |

### 1.5 Acceptance Criteria

- **AC-0.1.1** — Given a consumer with a suspicious SMS, when they paste or photograph it into ScamWatch without logging in, then they receive a calibrated assessment plus an official-verification handoff. (satisfies `FR-0.1.1`, `FR-0.1.3`)
- **AC-0.1.2** — Given any of the six primary channels, when a consumer submits input of that channel type, then the system extracts at least one `Entity` and returns an `Explanation`. (satisfies `FR-0.1.2`)

### 1.6 Edge Cases

- Input that is **not** a scam (legitimate message) — the product MUST be capable of returning low-confidence / "no strong scam signal" without manufacturing alarm (ties to Principle 6).
- Ambiguous input (e.g., a real debt collector vs. a debt-collection scam) — resolve toward official verification rather than a confident verdict.
- Mixed-language or non-English input at launch — see `FR-0.1.4`; full i18n is future expansion.

### 1.7 Security Considerations

Submitted content is hostile by assumption: it may contain live malicious URLs, malware-laden attachments, or PII of the victim and third parties. All intake surfaces are treated as untrusted (detailed in the Intake and Security volumes). No submitted link is ever auto-fetched in a context that could deanonymize or endanger the submitting user.

### 1.8 Accessibility

WCAG 2.2 AA is the baseline contract for every consumer surface that implements `FR-0.1.*`. The decisive-moment check, being the most safety-critical surface, MUST meet AA without exception.

### 1.9 Performance

The decisive-moment check is latency-sensitive by definition. Target budgets are set in the relevant feature volumes; this volume only asserts that **time-to-first-useful-signal is a tier-0 performance metric** and regressions to it are release-blocking.

### 1.10 Future Expansion

Multilingual intake, on-device pre-screening, carrier/email-provider partnerships for inline warnings, and an assisted "call me back" verification handoff are anticipated but out of scope for launch.

---

## 2. The ScamWatch Thesis

### 2.1 Purpose

State the central bet: what ScamWatch believes is true about the world that justifies building this and that competitors have not acted on.

### 2.2 Background

The thesis has four clauses:

1. **Aggregation creates protection that no individual can self-provision.** One person cannot know that the toll-road text they just received is part of a 40,000-report smishing `Campaign`. ScamWatch makes that aggregate legible at the moment of decision.
2. **Explanation beats blocking.** A block teaches nothing and erodes when the attacker rotates infrastructure. An `Explanation` ("this matches a toll-road impersonation pattern; real toll agencies do not collect payment by text; verify at the official site") transfers durable judgment to the user and survives infrastructure churn.
3. **Calibrated honesty is the moat, not a constraint.** A tool that says "we're 60% confident, here's why, and here's the official source to confirm" earns trust that a confident-but-sometimes-wrong tool cannot. Over years, trust compounds; hype decays.
4. **Public-benefit posture unlocks the highest-value data relationships.** State AGs, the FTC, banks, and senior-serving institutions will share and integrate with a transparent non-profit-aligned platform in ways they will not with a data broker.

### 2.3 Requirements

| ID | Level | Requirement |
|---|---|---|
| FR-0.2.1 | MUST | Every consumer-facing verdict MUST be accompanied by an `Explanation` and a `Confidence` (see glossary §9). |
| FR-0.2.2 | MUST | The platform MUST be able to associate a `Report`/`Entity` with a `Campaign` and surface that aggregate to the consumer in plain language. |
| FR-0.2.3 | MUST | Every verdict surface MUST include a `Verification` handoff to an official organization. |
| NFR-0.2.1 | MUST | Calibration of `Confidence` scores MUST be measured and published (see Principle 5; transparency reporting). |

### 2.4 Acceptance Criteria

- **AC-0.2.1** — No consumer verdict ships without a non-empty `Explanation`, a numeric `Confidence`, and at least one `Verification` link. (satisfies `FR-0.2.1`–`FR-0.2.3`)

### 2.5 Edge Cases

- A `Report` with no correlatable `Campaign` yet — surface the single-report assessment honestly ("we don't yet see a wider pattern") rather than implying aggregate strength that doesn't exist.

### 2.6 Security Considerations

Surfacing `Campaign` aggregates must not leak the identities or PII of the reporters who contributed to that aggregate (de-identification; see Principle 3, `FR-0.6.3`).

### 2.7 Accessibility

`Explanation` copy MUST be authored to AA-readable standards and screen-reader-first.

### 2.8 Performance

`Campaign` correlation may be asynchronous; the decisive-moment verdict MUST NOT block on full campaign computation — it returns the best current assessment and enriches if/when correlation completes.

### 2.9 Future Expansion

Cross-institution shared intelligence (opt-in, de-identified) is the long-horizon expression of clause 4 and is sized in **Volume 1 — Business Strategy**.

---

## 3. Public-Benefit Mission & Charter Summary

### 3.1 Purpose

Summarize the mission and the binding charter that constrains every business and product decision. The full constitution/charter and governance live in **Volume 1 — Business Strategy**; this section captures the non-negotiable spine.

### 3.2 Background — Mission

> Build the world's most trusted consumer scam intelligence platform. ScamWatch is a **public-benefit intelligence platform**, not merely a scam database.

North-star analogies (from shared context): *Consumer Reports for fraud · VirusTotal for consumers · Waze for scam intelligence · an AI-powered consumer-protection platform.*

### 3.3 Charter clauses (binding)

| Clause | Statement |
|---|---|
| C1 | The protective core (education + the decisive-moment check) is **always free**. |
| C2 | User data is **never sold**. Monetization paths that depend on selling or de-anonymizing user data are categorically prohibited. |
| C3 | The platform makes **calibrated, evidence-linked** statements about *patterns and infrastructure*, never unproven accusations against named private individuals. |
| C4 | The platform **always routes to official organizations** for authoritative verification and reporting. |
| C5 | ScamWatch provides **consumer protection information, not legal advice**, and says so on every relevant surface. |
| C6 | Trust is the primary asset; any growth tactic that trades trust for reach is **out of bounds**. |

### 3.4 Requirements

| ID | Level | Requirement |
|---|---|---|
| FR-0.3.1 | MUST | No feature MAY gate the protective core (per C1) behind payment, mandatory account creation, or data-sharing consent. |
| FR-0.3.2 | MUST | No data pipeline MAY expose a path to sell or re-identify user data (per C2). |
| FR-0.3.3 | MUST | Every surface stating a scam assessment MUST carry the "not legal advice — verify with official sources" disclosure (per C5). |
| NFR-0.3.1 | MUST | Charter clauses C1–C6 MUST be testable as release gates; a build violating any clause is not shippable. |

### 3.5 Acceptance Criteria

- **AC-0.3.1** — A release-gate check confirms the core check is reachable with no account, no payment, and no data-sharing consent. (satisfies `FR-0.3.1`)
- **AC-0.3.2** — Static and data-flow analysis confirms no egress of user-identifiable data to any commercial recipient. (satisfies `FR-0.3.2`)

### 3.6 Edge Cases

- A future enterprise feature (e.g., verification API for banks) MUST be architected so its existence cannot weaken C1/C2 for consumers (see Volume 1 monetization guardrails).

### 3.7 Security Considerations

Charter enforcement is itself a security property: the prohibition on data sale (C2) reduces the value of the dataset to attackers and the blast radius of any breach.

### 3.8 Accessibility

The not-legal-advice and free-core disclosures MUST be perceivable to assistive technology (not image-only, sufficient contrast).

### 3.9 Performance

N/A for the charter itself; enforcement checks run in CI and MUST NOT materially affect runtime performance.

### 3.10 Future Expansion

Formalization as a legal public-benefit entity, an independent ethics/transparency board, and third-party charter audits are tracked in Volume 1.

---

## 4. The 100-Year Vision

### 4.1 Purpose

Frame the multi-generational ambition so that near-term decisions are made with the long horizon in mind, and so that short-term pressures (growth, monetization) are evaluated against durability.

### 4.2 Background

ScamWatch is designed as **durable public infrastructure**, in the spirit of a library, a standards body, or a public-health surveillance network — institutions measured in decades, not quarters. The 100-year framing implies design constraints:

| Horizon | Framing |
|---|---|
| **Years 1–3** | Earn trust in one market (Florida → US). Prove calibration and victim-respect at small scale. Establish official-org relationships. |
| **Years 3–10** | Become the consumer-side reference layer for fraud intelligence in the US; standardize the vocabulary (the glossary in §9 becomes an interoperable schema others adopt). |
| **Decades** | Outlive any single funding source, leadership team, or threat era. Survive the transition from today's scam typologies (toll smishing, pig-butchering) to whatever replaces them, because the *method* — aggregate, explain, calibrate, verify — is typology-independent. |

### 4.3 Requirements

| ID | Level | Requirement |
|---|---|---|
| NFR-0.4.1 | MUST | The threat taxonomy and domain schema MUST be versioned and extensible without breaking historical `Report` data, so the platform survives the emergence of new scam typologies. |
| NFR-0.4.2 | SHOULD | Core data SHOULD be exportable in open, documented formats to enable institutional continuity and prevent lock-in to any single vendor in the stack. |
| NFR-0.4.3 | SHOULD | The platform SHOULD avoid architectural decisions that bind its survival to a single proprietary dependency where an open alternative is viable. |

### 4.4 Acceptance Criteria

- **AC-0.4.1** — Introducing a new `Threat` typology requires no destructive migration of historical `Report`/`Entity`/`Campaign` data. (satisfies `NFR-0.4.1`)

### 4.5 Edge Cases

- An AI model provider deprecates an API (the stack standardizes on OpenAI APIs per shared context). The explainability and classification interfaces MUST be abstracted enough that a provider change does not invalidate stored `Explanation`/`Confidence` history. (See `NFR-0.4.3`.)

### 4.6 Security Considerations

Long-lived datasets accumulate long-lived risk. Retention schedules and de-identification (Principle 3) are what make a 100-year dataset safe to keep.

### 4.7 Accessibility

Accessibility standards evolve; committing to "current WCAG AA baseline" (not a frozen version) keeps the contract durable.

### 4.8 Performance

No specific budget; durability favors maintainable, well-documented systems over micro-optimized but brittle ones.

### 4.9 Future Expansion

Standardization of the ScamWatch schema as a public interchange format (consumer-side analog to STIX/TAXII) is the decade-scale expansion.

---

## 5. What the Product IS and ISN'T

### 5.1 Purpose

Draw hard boundaries so scope creep, feature requests, and partnership opportunities can be evaluated against an explicit definition.

### 5.2 The product IS

| # | ScamWatch IS… |
|---|---|
| IS-1 | A **public-benefit consumer scam-intelligence platform**. |
| IS-2 | A **decisive-moment check** across SMS, voice, email, URL, social/marketplace, and screenshots. |
| IS-3 | An **explainability layer** that teaches users *why* something looks like a scam, in calibrated language. |
| IS-4 | A **community intelligence** system that aggregates `Report`s into `Entity`s, `Threat`s, and `Campaign`s. |
| IS-5 | A **router to official verification** (FTC, FBI IC3, state AG, CFPB, IRS, SSA, etc.). |
| IS-6 | A **trauma-aware, victim-respecting** consumer surface. |
| IS-7 | A **transparency-publishing** organization (confidence calibration, sources, reasoning, periodic reports). |

### 5.3 The product ISN'T

| # | ScamWatch IS NOT… | Why this boundary exists |
|---|---|---|
| ISNT-1 | A legal-advice service. | Charter C5; routes to official/legal channels instead. |
| ISNT-2 | A law-enforcement or accusation system that names private individuals as criminals. | Charter C3; defamation risk; statements are about patterns/infrastructure. |
| ISNT-3 | A data broker or ad-targeting business. | Charter C2; categorically prohibited. |
| ISNT-4 | A money-recovery / chargeback service. | Out of competency; routes to banks, card networks, and official complaint channels. |
| ISNT-5 | A vigilante / scam-baiting platform. | Conflicts with victim-respect and legal posture; we observe and explain, we do not retaliate. |
| ISNT-6 | A paywalled security suite. | Charter C1; protective core is free. |
| ISNT-7 | A guarantee of safety. | Principle 6 (never exaggerate); we reduce risk and improve judgment, we don't promise immunity. |

### 5.4 Requirements

| ID | Level | Requirement |
|---|---|---|
| FR-0.5.1 | MUST | The product MUST NOT present any feature as legal advice or money-recovery (per ISNT-1, ISNT-4). |
| FR-0.5.2 | MUST | The product MUST NOT publish unverified accusations naming private individuals (per ISNT-2; see moderation/defamation flow in security & moderation volumes). |
| FR-0.5.3 | MUST NOT | The product MUST NOT implement scam-baiting, retaliation, or attacker-engagement features (per ISNT-5). |

### 5.5 Acceptance Criteria

- **AC-0.5.1** — Content review confirms no surface offers legal advice, money recovery, or names private individuals as confirmed criminals. (satisfies `FR-0.5.1`, `FR-0.5.2`)

### 5.6 Edge Cases

- A reported scam names a real person (e.g., an impersonated public official, or an actor's alias). Naming an *impersonated* brand/official is permitted (they are the victim being mimicked); asserting a named private individual *is the scammer* is not, absent adjudicated evidence — escalate to moderation.

### 5.7 Security Considerations

The "ISN'T an accusation system" boundary directly limits legal and safety exposure (harassment of misidentified individuals).

### 5.8 Accessibility

Boundary disclosures (e.g., "this is not legal advice") follow the same AA perceivability rules as §3.8.

### 5.9 Performance

N/A.

### 5.10 Future Expansion

A supervised, evidence-graded "named-actor" capability could be revisited only with legal review and an adjudication process — explicitly deferred.

---

## 6. Product Principles, Operationalized

### 6.1 Purpose

Convert the nine non-negotiable principles from the shared context into concrete, testable product/engineering implications. Every downstream feature is measured against these.

### 6.2 Background

The principles are the constitution of the product. They are not aspirational copy; each maps to one or more `FR-0.6.*` requirements that other volumes implement and QA tests.

### 6.3 Operationalization table

| # | Principle | Concrete product implication | Requirement |
|---|---|---|---|
| P1 | **Explain before warning** | Verdict UI leads with the `Explanation` ("here's what this looks like and why") before any alarm color/severity. No naked red badge without reasoning. | FR-0.6.1 |
| P2 | **Respect victims** | All copy is trauma-aware: no "you fell for it", no blame, no shame. Past-tense victim flows offer support + next steps, not judgment. Copy passes a victim-respect lint. | FR-0.6.2 |
| P3 | **Protect privacy** | Data minimization by default; PII de-identified at rest; no sale; signed-URL, server-scanned uploads; retention schedules. Anonymous use is first-class. | FR-0.6.3 |
| P4 | **Keep core education free** | Core check + education reachable with role `anonymous`, no payment, no mandatory account. | FR-0.6.4 |
| P5 | **Be transparent** | Every verdict shows `Confidence`, sources, and reasoning; calibration is measured; periodic transparency reports published. | FR-0.6.5 |
| P6 | **Never exaggerate** | Calibrated language bands tied to `Confidence`; no fearmongering; "no strong signal" is a valid, non-alarming outcome; no false certainty. | FR-0.6.6 |
| P7 | **Encourage official verification** | Every verdict includes a `Verification` handoff to the correct official org for that `Threat` type. | FR-0.6.7 |
| P8 | **Build trust before growth** | Growth tactics are gated on trust metrics (calibration, complaint rate, victim-respect); no dark patterns, no growth hacks that erode trust. | FR-0.6.8 |
| P9 | **Every feature prevents real-world harm** | Each feature ships with a stated harm-prevention hypothesis and a metric; features that can't articulate one are rejected. | FR-0.6.9 |

### 6.4 Requirements

| ID | Level | Requirement |
|---|---|---|
| FR-0.6.1 | MUST | Verdict surfaces MUST render the `Explanation` before/above any severity indicator. |
| FR-0.6.2 | MUST | All user-facing copy MUST pass an automated victim-respect / blame-language lint before release. |
| FR-0.6.3 | MUST | User PII MUST be minimized at collection, de-identified at rest where feasible, never sold, and governed by a documented retention schedule. |
| FR-0.6.4 | MUST | The protective core MUST be operable by role `anonymous` with no payment and no mandatory account. |
| FR-0.6.5 | MUST | Each verdict MUST display `Confidence`, contributing sources, and human-readable reasoning. |
| FR-0.6.6 | MUST | Consumer-facing language MUST map to calibrated `Confidence` bands and MUST support a non-alarming "no strong signal" outcome. |
| FR-0.6.7 | MUST | Each verdict MUST include at least one official-org `Verification` handoff appropriate to the detected `Threat`. |
| FR-0.6.8 | SHOULD | Growth/marketing features SHOULD be gated behind trust-health metrics defined in Volume 1. |
| FR-0.6.9 | MUST | Each feature spec MUST state a harm-prevention hypothesis and an associated metric. |

### 6.5 Acceptance Criteria

- **AC-0.6.1** — Given any verdict, the DOM/render order places `Explanation` before the severity badge. (FR-0.6.1)
- **AC-0.6.2** — A copy submitted with the string "you fell for" or equivalent blame phrasing fails CI lint. (FR-0.6.2)
- **AC-0.6.4** — An automated, unauthenticated client completes a core check end-to-end. (FR-0.6.4)
- **AC-0.6.5** — Every verdict payload contains `confidence`, `sources[]`, and `explanation`. (FR-0.6.5)
- **AC-0.6.9** — Each merged feature spec contains a "Harm-prevention hypothesis" section. (FR-0.6.9)

### 6.6 Edge Cases

- Conflict between principles, e.g., P5 (transparency: show sources) vs. P3 (privacy: don't expose reporter identity). Resolution rule: **privacy of individuals wins; transparency is satisfied with de-identified aggregates.**
- P6 (never exaggerate) vs. a genuinely high-severity, high-confidence threat — calibrated *does not mean muted*; high confidence may warrant strong, still-non-shaming language.

### 6.7 Security Considerations

P3 is itself the central security principle; its requirements (`FR-0.6.3`) are elaborated in the privacy/security volumes. The victim-respect lint (`FR-0.6.2`) also reduces the chance of publishing content that re-traumatizes or that creates harassment vectors.

### 6.8 Accessibility

P1 ordering (explanation-first) and P6 calibrated language both improve cognitive accessibility. Severity MUST never be conveyed by color alone (AA: 1.4.1 Use of Color).

### 6.9 Performance

The victim-respect and not-legal-advice checks run at author/CI time, not request time, to avoid runtime cost.

### 6.10 Future Expansion

A published, machine-readable "principles compliance" report could accompany each release as part of transparency (P5) maturation.

---

## 7. Definition of Success

### 7.1 Purpose

State what success means in a way that is measurable and that prioritizes harm prevention and trust over vanity growth.

### 7.2 Background

Because trust is the moat (P8) and harm prevention is the point (P9), success metrics are weighted toward *trust and outcomes*, not reach. The single north-star **business** metric is owned by Volume 1; this section defines the **product** success frame that Volume 1's metric sits inside.

### 7.3 Success dimensions

| Dimension | Indicative measure (defined precisely in feature/business volumes) | Why it matters |
|---|---|---|
| **Harm prevented** | Estimated/attested instances where a check changed a user's action before loss (e.g., self-reported "this stopped me", or measurable abandon-before-payment). | Direct expression of P9. |
| **Calibration** | Reliability of `Confidence` (predicted vs. observed correctness). | Trust (P5/P6) is unprovable without it. |
| **Trust health** | Complaint rate, victim-respect lint pass rate, correction/appeal turnaround. | P2/P8. |
| **Reach (gated)** | Verified consumers helped, official-org integrations live. | Secondary to and gated by the above (P8). |
| **Coverage** | Channels and `Threat` typologies supported with quality. | Breadth of protection. |

### 7.4 Requirements

| ID | Level | Requirement |
|---|---|---|
| NFR-0.7.1 | MUST | Calibration of `Confidence` MUST be tracked over time and reported (per P5). |
| NFR-0.7.2 | SHOULD | The product SHOULD instrument a harm-prevention proxy metric for each major feature (per P9). |
| NFR-0.7.3 | MUST | Reach metrics MUST NOT be optimized at the expense of trust-health metrics (per P8); trust-health acts as a guardrail metric. |

### 7.5 Acceptance Criteria

- **AC-0.7.1** — A calibration dashboard exists and is refreshed on a defined cadence. (NFR-0.7.1)
- **AC-0.7.3** — Growth experiments declare trust-health guardrail metrics that, if breached, halt the experiment. (NFR-0.7.3)

### 7.6 Edge Cases

- Harm-prevention is hard to measure directly (the counterfactual is unobservable). Use multiple weak proxies; never overclaim a precise "scams prevented" number (P6).

### 7.7 Security Considerations

Measuring harm prevention MUST NOT require collecting more PII than the privacy principle permits (P3) — favor de-identified, aggregate, and opt-in attestations.

### 7.8 Accessibility

Success includes accessibility: AA conformance of the core check is a success criterion, not a side quest.

### 7.9 Performance

Time-to-first-useful-signal (see §1.9) is a tier-0 success metric.

### 7.10 Future Expansion

Independent academic evaluation of harm-prevention efficacy is a long-term credibility goal.

---

## 8. Primary Risks & Architectural Mitigations

### 8.1 Purpose

Enumerate the risks most likely to kill or corrupt the product, and show how the architecture and charter mitigate each. Business-specific risks are expanded in **Volume 1**.

### 8.2 Risk register (product/architecture level)

| ID | Risk | Impact | Architectural / charter mitigation |
|---|---|---|---|
| RISK-0.1 | **False positives** (labeling legitimate messages as scams) erode trust and harm legitimate senders. | High | Calibrated `Confidence` + "no strong signal" outcomes (P6/`FR-0.6.6`); explanation-first (P1); official verification as the authority, not us (P7). |
| RISK-0.2 | **Defamation** — naming a private individual as a scammer. | Severe (legal) | Charter C3 + `FR-0.5.2`: statements about *patterns/infrastructure* only; moderation + confidence + takedown/appeal flow (security/moderation volumes). |
| RISK-0.3 | **Privacy breach / re-identification** of reporters or victims. | Severe | P3/`FR-0.6.3`: minimization, de-identification at rest, no sale (C2), signed-URL + server-scanned uploads, retention schedules. |
| RISK-0.4 | **Hostile/poisoned input** — adversaries flood `Report`s to manipulate `Campaign`/`Threat` signals, or upload malware. | High | Untrusted-intake posture (§1.7); server-side scanning; moderation roles (`moderator`/`analyst`); confidence weighting and abuse detection. |
| RISK-0.5 | **AI overconfidence / hallucinated reasoning** presented as fact. | High | Calibrated language (P6); never state model output as fact (house style); confidence + verify-with-official on every verdict (`FR-0.2.1`–`FR-0.2.3`). |
| RISK-0.6 | **Mission drift via monetization** (pressure to sell data / paywall the core). | Severe | Charter C1/C2 as release gates (`NFR-0.3.1`); monetization guardrails in Volume 1. |
| RISK-0.7 | **Vendor/model lock-in** threatening 100-year durability. | Medium | `NFR-0.4.2`/`NFR-0.4.3`: open export formats, abstracted AI interfaces. |
| RISK-0.8 | **Accessibility failure** excludes highest-risk users. | High | WCAG 2.2 AA as a contract on the core check (§1.8, P1/P6 cognitive a11y). |
| RISK-0.9 | **Trust collapse from a single visible mistake.** | Severe | Transparency reporting (P5), fast correction/appeal (P2/P8), conservative calibration on high-stakes verdicts. |

### 8.3 Requirements

| ID | Level | Requirement |
|---|---|---|
| NFR-0.8.1 | MUST | Each risk in §8.2 MUST have at least one mitigation traceable to a requirement or charter clause. |
| NFR-0.8.2 | MUST | High/Severe risks MUST have a corresponding release-gate or monitored metric. |

### 8.4 Acceptance Criteria

- **AC-0.8.1** — Every RISK-0.x row links to a concrete `FR-`/`NFR-`/charter clause (verifiable by inspection of this table). (NFR-0.8.1)

### 8.5 Edge Cases

- A new risk emerges that no existing mitigation covers — the risk register is living; adding a risk requires adding a mitigation owner before the next release.

### 8.6 Security Considerations

This whole section is security-adjacent; the authoritative threat model lives in the security volume and MUST stay consistent with RISK-0.2/0.3/0.4.

### 8.7 Accessibility

RISK-0.8 makes accessibility a first-class, release-gating risk rather than a compliance afterthought.

### 8.8 Performance

RISK around latency (degrading the decisive-moment check) is tracked via the tier-0 performance metric (§1.9, §7.9).

### 8.9 Future Expansion

A formal, periodically-reviewed risk board with external input is part of governance maturation (Volume 1).

---

## 9. Glossary of Canonical Domain Objects

### 9.1 Purpose

Provide the single authoritative definition of each domain object. These names are used verbatim across all volumes, the database schema, the API, and the UI. Other volumes MUST NOT rename or redefine them.

### 9.2 Canonical objects

| Object | Definition | Notes / relationships |
|---|---|---|
| **Report** | A user-submitted scam encounter (text, screenshot, URL, phone number, email, etc.). | The primary intake unit. A `Report` yields one or more `Entity`s and may be linked to a `Campaign`. May be submitted by an `anonymous` user. |
| **Entity** | An extracted atom of fraud infrastructure: phone number, URL/domain, email address, crypto wallet, sender name, brand impersonated, payment handle, etc. | Normalized and deduplicated across `Report`s. Carries a `Confidence` on extraction and classification. |
| **Threat** | A classified scam pattern/type (e.g., "Toll-road smishing", "Pig-butchering", "Grandparent scam"). | Drawn from the versioned threat taxonomy (see shared context §taxonomy and `NFR-0.4.1`). Determines the correct `Verification` handoff. |
| **Campaign** | A correlated cluster of `Report`s/`Entity`s believed to share an actor or kit. | Computed (possibly asynchronously) from entity overlap and pattern similarity. Surfaced to consumers as aggregate context. Carries a `Confidence` on each link. |
| **Verification** | A pointer/handoff to an official organization for the user to confirm or report (FTC, FBI IC3, state AG, CFPB, IRS, SSA, etc.). | Required on every verdict (`FR-0.6.7`). The platform routes; the official org is the authority. |
| **Explanation** | The human-readable, calibrated "why we think this" output — the explainability layer. | Required on every verdict (`FR-0.2.1`). Trauma-aware, AA-readable, leads the verdict UI (P1). |
| **Confidence** | A calibrated 0–1 score attached to classifications, `Entity` extractions, and `Campaign` links. | Calibration is measured and published (P5/`NFR-0.7.1`). Maps to consumer-facing language bands (P6/`FR-0.6.6`). Never presented as certainty. |

### 9.3 Supporting vocabulary (non-domain, but canonical for consistency)

| Term | Meaning |
|---|---|
| **Decisive moment** | The seconds between a consumer receiving a suspicious message and acting on it — the primary use moment ScamWatch targets. |
| **Time-to-first-useful-signal** | The tier-0 latency metric: how fast a consumer gets an actionable, calibrated assessment. |
| **Trust-health metrics** | The guardrail metric family (calibration, complaint rate, victim-respect lint pass, correction/appeal turnaround) that gates growth (P8). |
| **Roles** | Supabase Auth roles: `anonymous`, `member`, `contributor`, `moderator`, `analyst`, `admin` (per shared context). |

### 9.4 Requirements

| ID | Level | Requirement |
|---|---|---|
| FR-0.9.1 | MUST | All volumes, schema, API, and UI MUST use the canonical object names in §9.2 without renaming. |
| FR-0.9.2 | MUST | Any new domain object MUST be added here first and assigned a definition before use elsewhere. |

### 9.5 Acceptance Criteria

- **AC-0.9.1** — Schema table names and API resource names map 1:1 to the canonical objects (verified in the database/API volumes). (FR-0.9.1)

### 9.6 Edge Cases

- A concept that is *almost* a `Campaign` but lacks correlation evidence stays a set of `Report`s/`Entity`s until correlation `Confidence` crosses the threshold defined in the campaign-detection volume. Don't overload the term.

### 9.7 Security Considerations

`Entity` and `Report` records contain the most sensitive data (PII, live malicious infra). Their handling is governed by P3 and the security volume.

### 9.8 Accessibility

Glossary terms surfaced to users (e.g., "Campaign") MUST be explained in plain language in-context, never assumed jargon.

### 9.9 Performance

N/A.

### 9.10 Future Expansion

Publishing the glossary as a versioned, machine-readable schema (per §4.9) is the interoperability endgame.

---

## 10. Cross-Volume Map

This volume is the root. The following volumes elaborate the requirements introduced here:

| Volume | Title | Depends on Vol 0 for |
|---|---|---|
| 1 | Business Strategy | Charter (§3), principles (§6), success frame (§7), risks (§8). |
| 2 | Market Research | Problem shape (§1), thesis (§2), boundaries (§5). |
| 10 (placeholder) | Database | Canonical objects (§9), durability requirements (§4). |
| (security volume) | Security & Privacy | RISK-0.2/0.3/0.4 (§8), P3 (§6), untrusted intake (§1.7). |
| (moderation volume) | Moderation & Trust | Defamation flow (C3/§5.6), trust-health metrics (§7). |

> **For the coordinator:** Volume 0 assumes the master PRD will include at least a Database volume, a Security/Privacy volume, and a Moderation/Trust volume. Their numbers are not yet fixed here; cross-references use titles where numbers are unknown.

*End of Volume 0 — Executive Vision.*
