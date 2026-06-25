# Volume 16 — Operations

> Part of the ScamWatch master PRD ("Project Sentinel"). Written against `_shared-context.md`. Do not contradict the shared context; this volume extends it.

This volume specifies the **human and process operations** that keep ScamWatch trustworthy, accurate, and victim-respecting at scale. Where Volumes 1–15 define *what the software does*, Volume 16 defines *how people run it*: content moderation operations and their SLAs, community operations and reputation, volunteer recruiting/vetting/training, victim-sensitive user support and crisis escalation, the cadence and methodology of transparency reports, and the overall Trust & Safety (T&S) operating model. Every process here operationalizes the nine Product Principles — especially *Respect victims*, *Be transparent*, *Always encourage verification through official organizations*, and *Build trust before growth*. Requirement IDs in this volume use the prefix `OPS-16`.

## Table of Contents

1. [Operating Model Overview](#1-operating-model-overview)
2. [Content Moderation Operations](#2-content-moderation-operations)
3. [Community Operations](#3-community-operations)
4. [Volunteer Workflows](#4-volunteer-workflows)
5. [User Support Operations](#5-user-support-operations)
6. [Transparency Reports](#6-transparency-reports)
7. [Quality / Trust-and-Safety Operating Model](#7-quality--trust-and-safety-operating-model)
8. [Cross-Volume Dependencies](#8-cross-volume-dependencies)

---

## 1. Operating Model Overview

ScamWatch operations run on the role model from the shared context (`anonymous`, `member`, `contributor`, `moderator`, `analyst`, `admin`) plus operational personas layered on top: **T&S Lead**, **Moderation Queue Owner (on shift)**, **Support Agent**, **Volunteer Coordinator**, **Transparency Editor**, and **Crisis Escalation Officer (CEO-on-call, rotates)**. A single staffer may hold several personas in early Florida launch; the model must scale to dedicated staff + vetted volunteers by Phase 2 (US).

Operational tiers:

| Tier | Who | Scope |
|---|---|---|
| **T0 — Automated** | System (AI classification, Vol 11 spam/abuse filters) | Auto-triage, auto-label, pre-fill confidence, route to queues |
| **T1 — Volunteer / Contributor** | Vetted volunteer moderators & analysts | First-pass moderation, duplicate merging, low-risk dispositions |
| **T2 — Staff Moderator** | Paid/core moderators | Sensitive content, defamation flags, appeals first review |
| **T3 — T&S Lead / Legal** | Lead + legal counsel (ref Vol 14) | Defamation adjudication, takedowns, law-enforcement requests |

Guiding rule: **no irreversible or named-individual-affecting action is ever taken by T0 or T1 alone.**

---

## 2. Content Moderation Operations

### 2.1 Moderation Queues, SLAs, and Triage

**Purpose.** Provide a defined, measurable workflow for reviewing user-submitted Reports, Entities, comments, and media before they influence public-facing Threat/Campaign intelligence, with SLAs calibrated to harm potential.

**Background.** Reports (per shared context) arrive as text, screenshots, URLs, phone numbers, emails. The AI layer (Vol 11/12) pre-classifies and attaches Confidence. Moderation exists to (a) prevent abuse/defamation/PII leakage, (b) correct or confirm AI output, and (c) protect victims. Moderation must never become a bottleneck that suppresses genuine warnings, nor a rubber stamp that publishes unverified accusations.

**Queues.** The system MUST maintain distinct queues so SLAs can differ by risk:

| Queue | Contents | Default SLA (first action) |
|---|---|---|
| `Q-NEW` | New public-facing reports | 24 h |
| `Q-MEDIA` | Reports containing screenshots/images | 24 h (PII scan first) |
| `Q-HIGHRISK` | Names a private individual; extortion/sextortion; minors implicated | **4 h** |
| `Q-APPEAL` | Takedown/appeal requests (ref Vol 14) | **3 business days** |
| `Q-DEFAME` | Defamation-risk flags | **2 business days** to T2/T3 |
| `Q-ABUSE` | Spam, brigading, malicious reports | 24 h |
| `Q-ESCALATE` | Crisis / self-harm / imminent-harm signals | **15 min** (paged) |

**Requirements.**

- `OPS-16.2.1` The system **MUST** auto-route every incoming Report to exactly one primary queue based on T0 signals (content type, named-individual detection, crisis keywords, PII detection), and **MAY** cross-list to secondary queues.
- `OPS-16.2.2` Each queue **MUST** display, per item: AI classification, Confidence, extracted Entities, PII-scan result, and a reviewer disposition control (`approve` / `approve-with-edits` / `hold` / `reject` / `escalate`).
- `OPS-16.2.3` SLA timers **MUST** start at submission time and pause only while an item is in a `needs-info` state awaiting the reporter.
- `OPS-16.2.4` The system **MUST** surface an at-risk-of-breach view (items within 20% of SLA) and **MUST** alert the Queue Owner on breach (ref Vol 17 alerting).
- `OPS-16.2.5` A Report **MUST NOT** become publicly attributable to a named private individual until it clears T2 review (`OPS-16` + Vol 14 defamation flow).
- `OPS-16.2.6` Reviewers **SHOULD** be able to bulk-merge duplicate Reports into an existing Campaign/Threat; merges **MUST** be reversible and audit-logged.
- `OPS-16.2.7` Every disposition **MUST** write an immutable audit record (actor, timestamp, action, reason code, before/after) retained per Vol 10 retention schedule.

**Acceptance Criteria.**

- `AC-16.2.a` Given a Report naming a private individual, when it is submitted, then it lands in `Q-HIGHRISK`, is NOT publicly visible, and a 4 h SLA timer starts.
- `AC-16.2.b` Given an item breaching SLA, when the timer expires, then an alert fires to the Queue Owner and the item is flagged `SLA-BREACHED` in the dashboard.
- `AC-16.2.c` Given a reviewer rejects a Report, when they submit, then a reason code is required and the reporter receives a trauma-aware notification (see 5.x).

**Edge Cases.** Mass-influx (coordinated brigading) → auto-throttle public visibility, batch into `Q-ABUSE`. Item matching multiple queues → highest-risk queue wins. Reviewer conflict-of-interest (report concerns the reviewer) → must recuse; system hides own-subject items.

**Security Considerations.** Reviewer actions are privileged; enforce RBAC (only `moderator`+). All media opened in a sandboxed viewer (no auto-fetch of remote resources, ref Vol 11). Audit log is append-only and tamper-evident.

**Accessibility.** Moderation console MUST meet WCAG 2.2 AA: keyboard-operable disposition controls, screen-reader labels on queue items, no color-only status (pair icon + text), captioned/described media where available.

**Performance.** Queue list MUST paginate and render < 1.5 s p95 for 10k-item backlogs. Disposition write MUST confirm < 500 ms p95.

**Future Expansion.** ML-assisted reviewer prioritization (surface highest-harm first); reviewer agreement scoring; multilingual queues (Phase 2/3).

### 2.2 Reviewer Guidelines

**Purpose.** A single canonical rulebook so dispositions are consistent, calibrated, and victim-respecting.

**Requirements.**

- `OPS-16.2.8` Reviewers **MUST** judge *patterns and infrastructure*, not unproven accusations about named private individuals (shared-context legal guardrail).
- `OPS-16.2.9` Reviewer copy and edits **MUST** use calibrated language — never assert AI output as fact; always keep "verify with official sources" routing intact (Principles 5–7).
- `OPS-16.2.10` Guidelines **MUST** include a redaction standard: strip victim PII, redact innocent third parties, preserve fraud-infrastructure Entities.
- `OPS-16.2.11` Guidelines **MUST** be versioned; every disposition records the guideline version in effect.

**Acceptance Criteria.** `AC-16.2.d` A spot-audit of 50 dispositions shows ≥ 95% cite a valid reason code and comply with the redaction standard.

**Edge Cases.** Business named as scammer vs. private individual (lower vs. higher bar). Public figure impersonation (the *impersonated* brand/figure is a victim, not the actor).

**Security / Accessibility / Performance / Future Expansion.** Guidelines stored as versioned Markdown in repo + Notion mirror; rendered accessibly in-console; inline contextual help loads < 300 ms; future: interactive decision-tree assistant.

### 2.3 Escalation & Defamation / Appeal Handling (ref Vol 14)

**Purpose.** Route legally and ethically sensitive items to the right authority quickly and reversibly.

**Requirements.**

- `OPS-16.2.12` Any item flagged defamation-risk **MUST** escalate `Q-DEFAME → T2 → (if unresolved) T3/legal`, never auto-published meanwhile.
- `OPS-16.2.13` Takedown/appeal requests **MUST** follow the Vol 14 appeal flow: acknowledge ≤ 24 h, decision ≤ 3 business days, written rationale, and a second-level appeal path.
- `OPS-16.2.14` Law-enforcement / legal-process requests **MUST** route only to T3 + legal; never handled by volunteers.
- `OPS-16.2.15` Reversal of any published item due to appeal **MUST** propagate to derived Threats/Campaigns and re-compute Confidence (ref Vol 12).

**Acceptance Criteria.** `AC-16.2.e` Given an appeal, when received, then an acknowledgment is sent ≤ 24 h and a tracked case is opened with SLA timers. `AC-16.2.f` Given a granted takedown, when executed, then the item and its public derivations are removed/redacted ≤ 1 h and audit-logged.

**Edge Cases.** Appeal from someone *named* vs. the *reporter*. Repeat/abusive appeals (rate-limited, still acknowledged). Counter-notice scenarios.

**Security Considerations.** Appellant identity verification proportionate to request; never expose reporter identity to appellant. Legal hold suspends deletion (ref Vol 10/14).

**Accessibility / Performance / Future Expansion.** Appeal intake form WCAG 2.2 AA; multi-channel (web + email). Case actions < 1 s. Future: structured takedown portal for verified orgs.

---

## 3. Community Operations

### 3.1 Contributor Onboarding

**Purpose.** Turn trustworthy members into productive `contributor`s without diluting data quality.

**Background.** Trust is the moat (Principle 8). Contributors add Reports, corroborate Entities, and annotate Threats; their influence must be earned and revocable.

**Requirements.**

- `OPS-16.3.1` Promotion `member → contributor` **MUST** require: verified email/OTP, completed onboarding module (principles, calibrated language, victim respect, PII handling), and acceptance of the Code of Conduct.
- `OPS-16.3.2` Contributors **MUST** start rate-limited and with submissions weighted lower until reputation accrues (3.2).
- `OPS-16.3.3` Onboarding **MUST** teach the no-blame/no-shame standard and the "this is not legal advice; verify with official orgs" framing.

**Acceptance Criteria.** `AC-16.3.a` A new contributor cannot exceed N submissions/day until reputation threshold R1 is reached. `AC-16.3.b` Onboarding completion is recorded with timestamp + module version.

**Edge Cases.** Re-onboarding after policy change; offboarding a demoted contributor (content retained, attribution adjusted).

**Security / Accessibility / Performance / Future Expansion.** Sybil resistance (ref Vol 11) at promotion; module fully keyboard/screen-reader accessible; module loads progressively; future: role-specific tracks (reporter vs. analyst).

### 3.2 Reputation System

**Purpose.** Quantify contributor reliability to weight intelligence and gate privileges.

**Requirements.**

- `OPS-16.3.4` The system **MUST** maintain a per-user reputation score derived from: corroboration rate of their Reports, moderator-confirmed accuracy, duplicate/false-positive rate, abuse flags.
- `OPS-16.3.5` Reputation **MUST** decay toward neutral on inactivity and **MUST** drop sharply on confirmed abuse.
- `OPS-16.3.6` Reputation **MUST** be a signal into Confidence (Vol 12), never the sole determinant.
- `OPS-16.3.7` Reputation internals **MUST NOT** be publicly exposed in a way that enables gaming; users **MAY** see a coarse tier (e.g., New / Trusted / Veteran).

**Acceptance Criteria.** `AC-16.3.c` Confirmed-false Report lowers the author's score and reduces their submissions' default Confidence weight. `AC-16.3.d` 90 days inactive moves a Veteran tier toward Trusted.

**Edge Cases.** Coordinated reputation farming; a high-rep user going rogue (auto-cap influence, T&S review). Reputation appeal path.

**Security / Accessibility / Performance / Future Expansion.** Score computation server-side only; tamper-resistant. Tier badges have text equivalents. Recompute is async/queued. Future: domain-specific reputation (e.g., crypto-scam expertise).

### 3.3 Codes of Conduct

**Purpose.** Set enforceable behavioral norms for all community surfaces.

**Requirements.**

- `OPS-16.3.8` A public Code of Conduct **MUST** prohibit harassment, doxxing, vigilantism, naming private individuals as scammers without evidence, and re-victimizing language.
- `OPS-16.3.9` Enforcement ladder **MUST** be defined: warn → temporary restriction → suspension → ban, each audit-logged and appealable.
- `OPS-16.3.10` The CoC **MUST** be versioned and acknowledged at onboarding and on material change.

**Acceptance Criteria.** `AC-16.3.e` A doxxing post is removed and the actor restricted per the ladder, with an appealable record.

**Edge Cases.** Borderline naming of a *business*; satire; whistleblowing. Escalation when an actor is also a victim.

**Security / Accessibility / Performance / Future Expansion.** Enforcement tools RBAC-gated; CoC page WCAG 2.2 AA; future: localized CoCs (Phase 3).

---

## 4. Volunteer Workflows

### 4.1 Recruiting, Vetting, Training, Permissions

**Purpose.** Safely extend moderation/analysis capacity with vetted volunteers without compromising privacy, safety, or quality.

**Background.** Volunteers fill T1 (volunteer moderators, volunteer analysts). They handle sensitive content, so vetting and least-privilege are mandatory.

**Requirements.**

- `OPS-16.4.1` Recruiting **MUST** publish role descriptions, time expectations, and the conduct/confidentiality bar; applications captured via an accessible form.
- `OPS-16.4.2` Vetting **MUST** include identity attestation, a signed confidentiality + data-handling agreement, and a probationary period with shadowed dispositions.
- `OPS-16.4.3` Training **MUST** cover: Product Principles, calibrated language, victim-respect/trauma-awareness, PII redaction, defamation bar, crisis escalation, and tool use; completion gated by a competency check.
- `OPS-16.4.4` Permissions **MUST** be least-privilege: volunteers get scoped roles (`moderator`/`analyst` with feature flags) that **MUST NOT** include defamation adjudication, takedown execution, PII export, or law-enforcement handling.
- `OPS-16.4.5` Volunteer access **MUST** be time-boxed and re-attested every 90 days; inactivity auto-suspends access.
- `OPS-16.4.6` Every volunteer action **MUST** be audit-logged and subject to T2 spot-audit.

**Acceptance Criteria.**

- `AC-16.4.a` A volunteer cannot execute a takedown or export PII (UI hidden + server-side 403).
- `AC-16.4.b` Probationary volunteers' dispositions are queued for T2 confirmation before taking public effect.
- `AC-16.4.c` 90-day non-re-attestation revokes access automatically.

**Edge Cases.** Volunteer encounters self-harm content (immediate escalate path + wellbeing support, 4.2). Volunteer burnout / sudden departure (access revoke + work reassignment). Conflict of interest (recuse).

**Security Considerations.** Least-privilege + JIT access; no bulk data export for volunteers; session limits; mandatory MFA; access reviews logged. Confidentiality breach → immediate revoke + incident (Vol 17).

**Accessibility.** Application, training, and console WCAG 2.2 AA; training materials offer captions/transcripts.

**Performance.** Permission checks server-enforced < 100 ms; training platform independent of prod load.

**Future Expansion.** Tiered volunteer ranks, regional volunteer pods (Phase 2/3), recognition program, paid-pathway from top volunteers.

### 4.2 Volunteer Wellbeing

**Purpose.** Protect volunteers exposed to distressing content.

**Requirements.** `OPS-16.4.7` Provide content-warning gating, exposure limits, opt-out from sensitive queues, and links to support resources. `OPS-16.4.8` Sensitive-content exposure **SHOULD** be capped per shift with mandatory breaks.

**Acceptance Criteria.** `AC-16.4.d` A volunteer can opt out of `Q-HIGHRISK`; the system honors it in routing.

**Edge Cases / Security / Accessibility / Performance / Future Expansion.** Vicarious-trauma resources surfaced contextually; private to the user; future: rotation scheduling and check-ins.

---

## 5. User Support Operations

### 5.1 Channels & Routing

**Purpose.** Give users (often distressed victims) a clear, kind path to help.

**Requirements.**

- `OPS-16.5.1` Support **MUST** offer at minimum: in-product help, an accessible contact form, and email; with documented hours and target response times.
- `OPS-16.5.2` Inbound **MUST** be triaged into: general help, report-status, data/privacy request (DSAR), abuse/safety, and **crisis** — each with its own SLA.
- `OPS-16.5.3` Crisis/abuse signals **MUST** bypass normal queues into `Q-ESCALATE` (15-min paged SLA).

**Acceptance Criteria.** `AC-16.5.a` A message containing imminent-harm language is auto-tagged crisis and paged within 15 min.

**Edge Cases.** Non-English contact (Phase 1 English-first; offer routing + machine translation note). Off-topic/legal-advice-seeking → standard "not legal advice; here are official orgs" response.

**Security Considerations.** Verify identity before disclosing report details or fulfilling DSARs; never reveal one user's data to another.

**Accessibility / Performance / Future Expansion.** All channels WCAG 2.2 AA; auto-ack < 1 min; future: localized support, live chat, callback.

### 5.2 Victim-Sensitive Support Playbooks

**Purpose.** Standardize trauma-aware responses so victims feel respected, not blamed (Principle 2).

**Requirements.**

- `OPS-16.5.4` Playbooks **MUST** use no-blame/no-shame language and validated, plain-language templates per scam category (taxonomy in shared context).
- `OPS-16.5.5` Every victim-facing response **MUST** route to relevant official organizations (FTC, FBI IC3, state AG, CFPB, IRS, SSA, etc.) and state that ScamWatch is not legal advice.
- `OPS-16.5.6` Financial-loss cases **MUST** include time-sensitive next steps (contact bank, freeze cards, report to IC3) presented calmly, not alarmingly.

**Acceptance Criteria.** `AC-16.5.b` A pig-butchering victim contact yields a response with no blame language, IC3 + bank steps, and official-org links. `AC-16.5.c` Linter/review confirms no fearmongering or false certainty in templates (Principles 6–7).

**Edge Cases.** Victim is a minor or vulnerable adult (escalate, additional resources). Victim is also reporting another person (separate the support need from the moderation need).

**Security / Accessibility / Performance / Future Expansion.** No collection of additional sensitive data beyond what's needed; templates reviewed by T&S + legal; reading-level checked; future: localized hotlines per region (ref Vol 19 i18n).

### 5.3 Crisis / Abuse Escalation & Routing to Official Orgs

**Purpose.** Get at-risk people to real help fast and responsibly.

**Requirements.**

- `OPS-16.5.7` A documented crisis runbook **MUST** define detection signals, the 15-min page, the on-call CEO role, what ScamWatch can/can't do, and approved external resources (e.g., 988 Suicide & Crisis Lifeline in the US, law enforcement, IC3, AG hotlines).
- `OPS-16.5.8` ScamWatch staff/volunteers **MUST NOT** act as crisis counselors; they direct to qualified services and stay supportive within scope.
- `OPS-16.5.9` Imminent-harm-to-others or active-fraud-in-progress signals **MUST** have a defined escalation to appropriate authorities, with privacy-minimizing data sharing.

**Acceptance Criteria.** `AC-16.5.d` Crisis runbook drill: a simulated self-harm message pages on-call ≤ 15 min and yields the approved resource response.

**Edge Cases.** Hoax/abuse of crisis channel (still respond, then de-prioritize). Jurisdictional differences in hotlines (Phase 2/3 routing table).

**Security Considerations.** Crisis content is highly sensitive: restricted access, minimal retention, redaction in any downstream analytics (Vol 18).

**Accessibility / Performance / Future Expansion.** Crisis resources presented accessibly and translatable; paging reliable (Vol 17 on-call); future: warm handoff integrations with partner orgs.

---

## 6. Transparency Reports

### 6.1 Cadence, Contents, Methodology

**Purpose.** Operationalize Principle 5 (*Be transparent*) by publishing regular, honest reports on what ScamWatch did, found, removed, and got wrong.

**Background.** Transparency is a trust mechanism and an accountability check. Reports must be accurate, calibrated, and privacy-preserving (no de-anonymization).

**Requirements.**

- `OPS-16.6.1` ScamWatch **MUST** publish a public transparency report on a fixed cadence (**quarterly** baseline; **annual** comprehensive edition).
- `OPS-16.6.2` Each report **MUST** include: volume of Reports received/published/rejected; takedowns and appeals (received, granted, denied, reversed); top Threat categories and notable Campaigns (aggregated); moderation SLA performance; AI intelligence-quality metrics (accuracy/calibration/coverage, ref Vol 18); data requests received (gov/legal) and how handled; and known errors/corrections issued.
- `OPS-16.6.3` All figures **MUST** be aggregated and de-identified; **MUST NOT** expose individuals, reporters, or exact infrastructure that aids evasion.
- `OPS-16.6.4` Methodology **MUST** be documented: definitions, counting rules, time windows, and limitations — so numbers are reproducible and not misleading (Principle 6).
- `OPS-16.6.5` Reports **MUST** be reviewed by T&S Lead + legal before publication and archived with version history.

**Acceptance Criteria.**

- `AC-16.6.a` The quarterly report publishes on schedule with all required sections and a methodology appendix.
- `AC-16.6.b` A privacy review confirms no row/cell enables re-identification (k-anonymity threshold met; small cells suppressed).
- `AC-16.6.c` Reported AI metrics reconcile with Vol 18 dashboards for the same window.

**Edge Cases.** A quarter with a sensitive ongoing investigation (delay/aggregate that item, note the omission and why). Correction to a prior report (issue erratum, keep history).

**Security Considerations.** Source data pulled via read-only, audited queries; small-cell suppression; no raw exports. Draft access restricted pre-publication.

**Accessibility.** Published as accessible HTML (WCAG 2.2 AA) + machine-readable data (CSV/JSON) + PDF; charts have text/table equivalents.

**Performance.** Report generation pipeline runs off-peak against analytics replica; does not impact prod.

**Future Expansion.** Real-time public stats dashboard; researcher data access program under strict privacy controls (Phase 2/3); localized reports per market.

---

## 7. Quality / Trust-and-Safety Operating Model

### 7.1 T&S Operating Model

**Purpose.** A standing function that owns the integrity, safety, and calibration of ScamWatch's intelligence and community.

**Requirements.**

- `OPS-16.7.1` A T&S function **MUST** own: policy (CoC, reviewer guidelines, defamation bar), queue SLA health, quality audits, crisis readiness, and the transparency report.
- `OPS-16.7.2` Quality assurance **MUST** include scheduled blind double-reviews and disposition audits, with a target inter-reviewer agreement threshold and corrective-training loop.
- `OPS-16.7.3` T&S **MUST** review AI calibration with the AI-quality owner (Vol 18) and trigger model/policy adjustments when calibration or coverage degrades.
- `OPS-16.7.4` T&S **MUST** run periodic tabletop drills (crisis, mass-influx, defamation, data-request) and record outcomes/improvements.
- `OPS-16.7.5` A weekly T&S operating review **MUST** track: SLA breaches, appeal outcomes, abuse trends, volunteer quality, and open incidents (ref Vol 17).

**Acceptance Criteria.** `AC-16.7.a` Monthly audit of ≥ N dispositions reports agreement ≥ threshold; below threshold triggers retraining. `AC-16.7.b` Each quarter at least one tabletop drill is completed with documented actions.

**Edge Cases.** Conflicting policy vs. legal guidance (legal prevails, policy updated). Reviewer systematically miscalibrated (retrain or revoke).

**Security Considerations.** T&S has elevated access; subject to access reviews and separation of duties (adjudicator ≠ executor where feasible).

**Accessibility.** Internal T&S tooling held to the same WCAG 2.2 AA bar.

**Performance.** Audit sampling automated; operating-review data assembled from Vol 18 with < 1 day lag.

**Future Expansion.** Dedicated regional T&S pods; external trust advisory board; published policy changelog.

---

## 8. Cross-Volume Dependencies

| Depends on | For |
|---|---|
| **Vol 10 — Database** | Audit log, retention schedules, legal hold |
| **Vol 11 — (Abuse/Spam/Sybil)** | T0 filtering, brigading detection, sandboxed media |
| **Vol 12 — (Confidence/Intelligence)** | Reputation→Confidence weighting, re-computation on reversal |
| **Vol 14 — (Legal/Defamation/Severity)** | Appeal flow, defamation adjudication, severity tiers |
| **Vol 15 — (Quality Gates)** | Standards reused by T&S QA |
| **Vol 17 — Deployment** | Alerting, on-call/incident response, paging reliability |
| **Vol 18 — Analytics** | Transparency metrics, AI-quality metrics, audit-of-dispositions data |
| **Vol 19 — Future Roadmap** | Localized support/hotlines, regional volunteer pods |

**Cross-volume assumptions made by this volume:** Vol 14 owns the canonical defamation/appeal/severity definitions (Vol 16 *invokes* them); Vol 17 owns alerting/on-call/incident tooling (Vol 16 *consumes* it); Vol 18 owns metric definitions used in transparency reports (Vol 16 *publishes* them). Where a number is referenced (SLA values, k-anonymity threshold, agreement threshold, rate limits) it is a configurable operational parameter, set in T&S policy config, not hard-coded.
