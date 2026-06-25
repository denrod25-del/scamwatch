# Volume 4 — User Journeys

> **Abstract.** This volume maps the end-to-end journeys through ScamWatch ("Project Sentinel") for the eight key flows that define the product: anonymous "Is this a scam?" lookup, scam-report submission with screenshot + OCR, a current victim seeking help, a caregiver acting on behalf of someone, a contributor building reputation, moderator triage, analyst campaign investigation, and a proactive local-campaign alert. Each journey is specified as **entry → preconditions → step-by-step (screen/system state) → emotional state → decision points → error/abandon paths → explainability & confidence moments → official verification handoff → exit/outcome**, with at least one happy path and one degraded/edge path. Journeys are tied to the personas in Volume 3 — User Personas by ID (P1–P11) and use the canonical domain vocabulary (Report, Entity, Threat, Campaign, Verification, Explanation, Confidence) from Volume 2 — Shared Context. The numbered requirement set (`UJ-4.*`) is the contract that flow/QA tests assert against. Tone is trauma-aware throughout: the victim journey (UJ-4.3) sets the copy and latency contract that constrains every other flow.

---

## Table of Contents

1. Purpose
2. Background
3. Conventions (states, emotional arc, handoff, explainability)
4. The Journeys
   - 4.1 UJ-4.1 — "Is this a scam?" Anonymous Lookup
   - 4.2 UJ-4.2 — Submitting a Scam Report (Screenshot + OCR)
   - 4.3 UJ-4.3 — Current Victim Seeking Help (Verification Handoff)
   - 4.4 UJ-4.4 — Caregiver Checking on Behalf of Someone
   - 4.5 UJ-4.5 — Contributor Building Reputation
   - 4.6 UJ-4.6 — Moderator Triage of a Queued Report
   - 4.7 UJ-4.7 — Analyst Investigating a Campaign
   - 4.8 UJ-4.8 — Receiving a Proactive Local-Campaign Alert
5. Cross-Journey Requirements (`UJ-4.0.*`)
6. Acceptance Criteria
7. Edge Cases
8. Security Considerations
9. Accessibility
10. Performance
11. Future Expansion

---

## 1. Purpose

This volume turns personas (Volume 3) and principles (Volume 2) into walkable paths. It is the bridge between *who* and *what* (personas, features) and *how the screens behave* (Volume 5 — IA, Volume 6 — Lookup, Volume 7 — Reporting, Volume 8 — Moderation, Volume 9 — Analyst, etc.). Engineers, designers, and QA should be able to build and test each flow directly from here, including the failure and abandon paths — which, for a consumer-protection product used by people in distress, are as load-bearing as the happy paths.

Every journey is measured against the Product Principles: **explain before warning**, **respect victims**, **protect privacy**, **keep core free**, **be transparent (confidence + sources)**, **never exaggerate**, **always route to official verification**, **build trust before growth**, **prevent real-world harm**.

## 2. Background

ScamWatch launches in Florida. The dominant inbound is a person holding a single artifact (a text, a call, a screenshot, a URL) asking one question: *"Is this real?"* That is UJ-4.1, the front door, and most other journeys branch from it. The second-most-critical inbound is the worst case: someone who already lost money (UJ-4.3). The remaining journeys serve the intelligence flywheel (report → moderate → correlate into campaigns → alert), which is what lets ScamWatch get *ahead* of harm rather than only explaining it after the fact.

Architecture context (Volume 2): Next.js App Router frontend on Vercel; Supabase (Postgres + Auth + Storage + Edge Functions); OpenAI for LLM/embeddings/OCR/entity-extraction/classification/explainability; `pgvector` for similarity; pgmq/cron for background work; signed URLs + server-side scanning for uploads. Roles: `anonymous`, `member`, `contributor`, `moderator`, `analyst`, `admin`.

## 3. Conventions

**State notation.** Each step lists the *user-visible screen state* and the *system/backend state*. "System" calls are illustrative, not binding API contracts (those live in Volume 12 — APIs).

**Emotional arc.** Each journey annotates the user's likely emotional state per step (drawn from Volume 3), because tone/pacing decisions depend on it. Victim and caregiver journeys weight this heaviest.

**Explainability & Confidence moments.** Marked **[X]**. Per Principle 5/6 and PER-3.4: any classification shown carries a calibrated **Confidence** and an **Explanation**, and AI output is never stated as fact.

**Verification handoff.** Marked **[V]**. Per Principle 7: journeys terminate not in a closed ScamWatch verdict but in a route to an official organization (FTC ReportFraud, FBI IC3, state AG, CFPB, IRS, SSA, 988 where relevant, the user's own bank, APS for elder cases).

**Degraded path.** Each journey includes at least one non-happy path: error, low-confidence/unknown, abandonment, hostile input, or accessibility/edge condition.

---

## 4. The Journeys

### 4.1 UJ-4.1 — "Is this a scam?" Anonymous Lookup

**Primary personas:** P4 (Marcus, skeptic), P1 (Marg), P9 (Hông), P3 (Priya), P5 (Rosa). **Surface:** public lookup.

#### Purpose
Let anyone, with no account, paste/forward a suspicious artifact and get a calm, calibrated, sourced answer plus an official-verification route — the front door to the whole product.

#### Background
This is the highest-volume flow and the trust-defining moment for P4. It must be anonymous, fast, transparent, and humble about uncertainty.

#### Preconditions
- No authentication required (`anonymous`).
- User has an artifact: free text, URL, phone number, email address, or a pasted message; (screenshot path is UJ-4.2).
- Privacy/retention disclosure available on the surface (PER-3.3.2).

#### Happy Path (P4 — pastes a URL)

| Step | Screen state | System state | Emotion | Notes |
|---|---|---|---|---|
| 1 | Home: single prominent input "Paste a text, link, phone number, or email — we'll check it." Privacy line visible. | Idle. | Wary, task-focused. | One field, no signup wall. |
| 2 | User pastes `hxxp://flpay-toll.help/pay`. Input shows detected type chip: "Looks like a URL." | Client classifies artifact type. | Engaged. | Type detection sets pipeline. |
| 3 | User taps **Check**. Calm progress: "Checking known patterns and sources…" (skeleton, no spinner-of-doom). | Edge Function: normalize → entity-extract → `pgvector` similarity vs known Entities/Threats → classifier → Explanation gen. | Slight tension. | Progressive: structured result can render before prose Explanation finishes. |
| 4 | **Result**: Header "This looks like a likely scam." **Confidence: High (0.86)** shown as labeled bar + icon + text (not color-only). **[X]** | Classification + confidence persisted to ephemeral/anon scope per retention policy. | Relief + validation. | Calibrated wording: "looks like," not "is." |
| 5 | **Why we think so [X]:** matched a known *Toll-Road Smishing* Threat; domain registered 3 days ago; not an official toll authority; 412 similar Reports in 14 days. Sources + "last updated" shown. | Explanation assembled from matched Entities/Threat/Campaign with provenance. | Trust building. | P4's core need: defensible reasoning + sources. |
| 6 | **What to do:** Don't click. Don't pay. If you think you owe a toll, go to your state toll authority's official site directly. **[V]** Buttons: "FL SunPass (official)", "Report to FTC", "Report to FBI IC3". | Verification cards rendered from Threat→official-org mapping. | Empowered. | Ends in official handoff, not a dead-end verdict. |
| 7 | Secondary: "Help others — report this (optional)" → UJ-4.2. Privacy reminder: "We didn't save your personal info." | Optional bridge to reporting. | Willing. | Never gates help behind reporting. |

**Exit/outcome:** P4 leaves with a calibrated verdict, the reasoning and sources, and official next steps — anonymously. Trust earned (Principle 8).

#### Degraded / Edge Path A — Low confidence / Unknown (P4 or P1)
- Step 4′: Header "We're not sure about this one." **Confidence: Low (0.34)** **[X]**. Copy avoids false certainty (Principle 6): "We don't have enough to call this. Here's what we can see, and here's how to verify it yourself."
- Step 5′: Explanation lists *what was and wasn't* matched. Offers safe-default guidance ("When unsure, don't click and verify out-of-band").
- Step 6′: **[V]** Still routes to official verification and offers "report this so we can learn."
- **Requirement:** the product MUST degrade to *humble + safe-default + verify* rather than guessing.

#### Degraded / Edge Path B — Pipeline error / timeout
- AI/classifier or OCR service errors or exceeds budget → show a calm fallback: "We couldn't fully check this right now." Provide generic safety guidance + official-verification links + retry. MUST NOT show a raw error or a falsely-confident result on failure.

#### Degraded / Edge Path C — Hostile/abuse input (P4-adjacent or bot)
- Oversized input, injection attempts, or scraping patterns → rate-limit + sanitize; never echo unsanitized HTML; never log PII (SEC).

#### Requirements
- **UJ-4.1.1 — MUST.** Lookup MUST be fully usable anonymously, no account.
- **UJ-4.1.2 — MUST.** Every result MUST show calibrated Confidence + Explanation + official Verification handoff. **[X][V]**
- **UJ-4.1.3 — MUST.** On low confidence, copy MUST avoid false certainty and route to verification.
- **UJ-4.1.4 — MUST.** On error/timeout, the system MUST fail safe (no fabricated verdict) and still offer safety guidance + official links.
- **UJ-4.1.5 — SHOULD.** Structured result SHOULD render before the prose Explanation completes (progressive enhancement).
- **UJ-4.1.6 — MUST.** Confidence/safety signals MUST NOT be color-only (icon + text). (PER-3.5.3)

---

### 4.2 UJ-4.2 — Submitting a Scam Report (Screenshot + OCR)

**Primary personas:** P6 (Tyler), P5 (Rosa), P11 (Eddie), P1/P3 (assisted). **Surface:** report submission.

#### Purpose
Capture a high-quality **Report** (text/URL/phone/email/screenshot), extract **Entities** via OCR + entity-extraction, let the user confirm/redact, and feed the intelligence flywheel — with low friction and strong PII safety.

#### Background
Screenshots are the richest and riskiest input: they often contain the *reporter's own* PII and innocent third parties. OCR-then-confirm-then-redact is mandatory before anything publishes.

#### Preconditions
- Reporting is available anonymously *or* signed-in; contributor reputation (UJ-4.5) accrues only when signed-in (`member`/`contributor`).
- Storage uses signed URLs + server-side scanning (Volume 2).

#### Happy Path (P6 — screenshot of a smishing text)

| Step | Screen state | System state | Emotion | Notes |
|---|---|---|---|---|
| 1 | "Report a scam" — drag/drop or pick image, or paste text. Optional fields: where you saw it, ZIP (coarse). | Idle. | Motivated ("fight back"). | ZIP coarse for campaign geo, not precise tracking. |
| 2 | User uploads screenshot. Preview shows. "We'll read the text and pull out details for you." | Upload to Storage via signed URL → server-side malware/content scan → OCR job queued (pgmq). | Confident. | Scan before processing. |
| 3 | Progress: "Reading the image…". | OCR (OpenAI) → entity-extraction → candidate Entities: phone `+1…`, URL `flpay-toll.help`, sender, brand impersonated. | Patient. | Background job; user can wait or proceed. |
| 4 | **Confirm extracted details:** editable chips for each Entity, each toggle-able include/exclude. **PII flagged:** "We found what looks like *your* name/number — remove it?" with one-tap redact. | Entities staged; PII detector marks reporter-PII + third-party-PII. | Reassured. | Redaction UX is mandatory (SEC). |
| 5 | Optional **[X]** preview: "This matches a known *Toll-Road Smishing* pattern (Confidence Medium)." | Provisional classification (not authoritative until moderated). | Validated. | Clearly marked provisional. |
| 6 | **Submit.** Confirmation: "Thanks — this is queued for review." Status tracker shown. If signed-in: "We'll tell you if it links to a campaign." | Report created (status `queued`) → moderation queue (UJ-4.6). Contributor event recorded if authed. | Satisfaction. | Sets up UJ-4.5 feedback loop. |

**Exit/outcome:** A clean, entity-rich, PII-safe Report enters moderation; reporter gets status visibility and (if authed) future campaign-linkage feedback.

#### Degraded / Edge Path A — OCR fails / unreadable image
- OCR low-confidence or empty → "We couldn't read this clearly." Offer manual entry of key details + resubmit original image for human moderation. Never silently drop. **[X]** confidence of extraction shown.

#### Degraded / Edge Path B — Malware / disallowed content in upload
- Server-side scan flags malicious file or disallowed content (e.g., CSAM-adjacent in sextortion reports) → block, do not store in normal pipeline, route per safety/legal escalation policy (Volume 8/legal). User sees a calm, non-graphic message.

#### Degraded / Edge Path C — Anonymous abuse / spam flood
- Rate-limit anonymous submissions; reputation-weight (UJ-4.5); duplicates auto-clustered for moderator efficiency (UJ-4.6). Bot-detected floods quarantined.

#### Degraded / Edge Path D — Innocent third party / spoofed brand
- If extracted Entity is a real brand/individual being *impersonated*, the report MUST be framed as "impersonation of," never "guilt of" (defamation guardrail, PER-3.6.2).

#### Requirements
- **UJ-4.2.1 — MUST.** Uploads MUST be scanned server-side before OCR/processing; stored via signed URLs with restricted access.
- **UJ-4.2.2 — MUST.** Extracted Entities MUST be user-confirmable; reporter PII and detected third-party PII MUST be flagged with one-tap redaction *before* submission.
- **UJ-4.2.3 — MUST.** Any provisional classification shown pre-moderation MUST be labeled provisional with Confidence. **[X]**
- **UJ-4.2.4 — MUST.** No Report MUST publish publicly without passing moderation (UJ-4.6).
- **UJ-4.2.5 — SHOULD.** OCR/extraction SHOULD run as a background job with a visible status tracker.
- **UJ-4.2.6 — MUST.** Reporting MUST NOT be required to access help (cross-ref PER-3.2.2).

---

### 4.3 UJ-4.3 — Current Victim Seeking Help (Verification Handoff)

**Primary personas:** P2 (Daniel), P11 (Eddie, on behalf), P1/P9 (in distress). **Surface:** victim / emergency mode. **This journey sets the trauma-aware contract for the product.**

#### Purpose
Get a person who has just been (or is being) scammed to *immediate, ordered, harm-stopping action* and to the right official channels — with zero blame, zero gating, minimal cognitive load, fast.

#### Background
Arrives in acute distress, often at night, possibly on a borrowed device, with narrowed attention. Per Volume 3 P2, baseline tech-literacy is irrelevant — assume reduced capacity. Per PER-3.2, help is never gated, explanation is skippable, and tone is non-blaming.

#### Preconditions
- Reachable from anywhere: a persistent "I think I've been scammed" affordance, and auto-offered when distress/loss signals are detected in UJ-4.1.
- No account, payment, or data required (PER-3.2.2).

#### Happy Path (P2 — sent money to a fake bank-fraud line)

| Step | Screen state | System state | Emotion | Notes |
|---|---|---|---|---|
| 1 | Victim mode opens. Header: **"You're not alone, and this isn't your fault. Let's stop this first."** No forms. | Minimal, mostly static, fast-rendered shell (no blocking on AI). | Panic, shame. | Non-blaming reassurance first (PER-3.2.1). |
| 2 | One question, optional: "What happened?" with big tappable categories (Sent money · Gave a code/password · Clicked a link · Gave card/bank info · Not sure). **Skip** is prominent. | Branches action checklist; "Not sure"/Skip → general checklist. | Overwhelmed. | ≤1 interaction to reach actions (PER-3.2.3). |
| 3 | **Do this now** — ordered checklist, one action per row, plain language: 1) Call your bank's fraud line now → **[V]** "Find your bank" / known fraud numbers. 2) Don't send anything more. 3) Change passwords from a safe device. Each row check-offable. | Action list from scenario→playbook map. No upsell, no share. | Regaining control. | Skippable explanation lives *below*, not in the way. |
| 4 | **[V]** Official reporting, clearly ordered, one-tap: "Report to FTC (ReportFraud.ftc.gov)", "Report to FBI IC3", "File a local police report (for your records)", state AG. For elder/POA cases (P11): APS. | Verification cards (escalated victim variant). | Supported. | Routes to official orgs; ScamWatch is not the endpoint. |
| 5 | **Save a record:** "Keep proof of what happened" — one tap to assemble a timeline/export (optional). | Optional documentation bundle (local-first; no required upload). | Steadier. | Helps recovery + P11 coordination. |
| 6 | Quiet footer: "If you're feeling overwhelmed, you can talk to someone: 988." Optional "Understand how this scam works" (skippable **[X]**). | 988 surfaced, never forced (PER-3.2.5). Explanation deferred. | Calmer. | Crisis safety net + optional education. |

**Exit/outcome:** Within ~1 minute, Daniel has called his bank, stopped further loss, has official reporting links, and a record — without an account, without blame, without fearmongering.

#### Degraded / Edge Path A — User can't identify what happened / "Not sure"
- Provide the *general* protective checklist (freeze cards, change passwords, watch accounts, report) without requiring categorization. Never block on classification.

#### Degraded / Edge Path B — Active/ongoing scam (still on the phone with the scammer)
- Detect "they're on the phone now" → top action becomes "Hang up now — a real bank/agency won't keep you on the line or rush you," then proceed. Urgency is *de-escalated*, never amplified.

#### Degraded / Edge Path C — On a borrowed/compromised device, or low connectivity
- Core checklist + official numbers MUST render fast and work with minimal JS; no dependency on login or heavy assets (Performance). Documentation export must be possible without uploading anything.

#### Degraded / Edge Path D — Acute distress / crisis signals
- Surface 988 more prominently but never modally block the protective actions; never replace practical help with a redirect.

#### Requirements
- **UJ-4.3.1 — MUST.** Victim mode MUST open with non-blaming reassurance and MUST contain no blame/shame language anywhere on the path. (PER-3.2.1)
- **UJ-4.3.2 — MUST.** Help MUST NOT be gated behind account, payment, or data submission. (PER-3.2.2)
- **UJ-4.3.3 — MUST.** The user MUST reach actionable "what to do now" in ≤1 interaction; explanation MUST be skippable/deferred. (PER-3.2.3)
- **UJ-4.3.4 — MUST.** The action list MUST NOT block on AI Explanation generation. (Performance; PER-3.2.3)
- **UJ-4.3.5 — MUST.** Official Verification handoffs (bank, FTC, IC3, AG; APS for elder/POA) MUST be present and one-tap. **[V]**
- **UJ-4.3.6 — MUST.** A crisis resource (988) MUST be available without being forced. (PER-3.2.5)
- **UJ-4.3.7 — SHOULD.** Non-essential prompts (upsell, social share, surveys, gamification) SHOULD be suppressed in victim mode. (PER-3.2.4)

---

### 4.4 UJ-4.4 — Caregiver Checking on Behalf of Someone

**Primary personas:** P3 (Priya, consented), P11 (Eddie, delegated authority). **Surface:** caregiver/proxy flow.

#### Purpose
Let a caregiver verify something for another person and — only with the proper consent/authority basis — set up consented monitoring/alerts or take delegated protective action, without becoming covert surveillance or account hijacking.

#### Background
Two distinct sub-modes: (a) **consented collaboration** (P3) — verify, explain kindly, optionally alert with the cared-for person's consent; (b) **delegated authority** (P11) — attested legal authority (e.g., POA) to act/report for someone with reduced capacity, with dignity preserved.

#### Preconditions
- Verification on behalf of someone needs no special authority (it's just a lookup).
- *Monitoring/alerts for another person* requires that person's consent (PER-3.7.1).
- *Delegated action* (reporting/documentation as the person) requires authority attestation + logging (PER-3.7.2).

#### Happy Path A — Consented verify + share (P3)

| Step | Screen state | System state | Emotion | Notes |
|---|---|---|---|---|
| 1 | Priya pastes a toll text her mother forwarded into lookup (UJ-4.1). | Standard lookup pipeline. | Concerned, time-pressed. | Reuses UJ-4.1. |
| 2 | Result: likely scam, **Confidence High [X]**, why + sources, official handoff **[V]**. | — | Relief. | — |
| 3 | **"Share a simple version with someone"** → generates a non-patronizing, plain-language explanation (P1/P9-readable, translatable). | Shareable Explanation export. | Helpful. | No condescension (Volume 3 P3). |
| 4 | Optional: "Watch for scams in your mom's area — *with her okay*." Consent flow names the cared-for person and records their consent. | Consented monitoring subscription (delegated alerts → UJ-4.8). | Protective, ethical. | Consent-first (PER-3.7.1). |

#### Happy Path B — Delegated authority report (P11)
- Eddie enters proxy mode, **attests authority** (e.g., POA) via an explicit attestation step (not a silent toggle); the system records the attestation and timestamps it.
- He documents fraud against his father and files reports (FTC/IC3/AG/**APS**) **[V]**, with documentation export for bank/legal coordination.
- ScamWatch never asks for or accesses the father's account credentials; dignity-preserving copy throughout.

#### Degraded / Edge Path A — Monitoring without consent
- If the caregiver cannot/won't establish the cared-for person's consent, the system MUST refuse to set up covert monitoring and MUST redirect to consented-collaboration patterns or self-protection guidance.

#### Degraded / Edge Path B — Proxy without authority (P3 trying to act *as* the parent)
- Without attested authority, delegated *action* is blocked; only verification + consented collaboration are offered. No account-takeover-like powers (PER-3.7.2, Volume 3 edge case).

#### Degraded / Edge Path C — Authority disputed / fraudulent caregiver
- Attestation is logged and challengeable; a fraudster posing as a caregiver is a modeled threat (SEC). High-impact delegated actions route to additional verification.

#### Requirements
- **UJ-4.4.1 — MUST.** Verifying on behalf of someone MUST require no special authority (it's a lookup).
- **UJ-4.4.2 — MUST.** Monitoring/alerts for another person MUST be consented and framed as collaboration, not surveillance. (PER-3.7.1)
- **UJ-4.4.3 — MUST.** Delegated action MUST require explicit authority attestation, MUST be logged, and MUST preserve the represented person's dignity/autonomy. (PER-3.7.2)
- **UJ-4.4.4 — MUST.** ScamWatch MUST NOT request or access the represented person's account credentials.
- **UJ-4.4.5 — SHOULD.** Proxy flows SHOULD offer documentation export for bank/APS/AG/FTC/IC3 coordination. (PER-3.7.3)

---

### 4.5 UJ-4.5 — Contributor Building Reputation

**Primary personas:** P6 (Tyler). **Surface:** contributor profile / reputation.

#### Purpose
Reward sustained, *accurate* contribution with standing and lightweight privileges — without incentivizing volume-for-volume's-sake or innocent-naming (defamation guardrail).

#### Background
P6 is an "antibody" who needs to feel his effort compounds. Reputation must track *quality and outcome* (reports that survive moderation, link to campaigns, warn people), not raw count.

#### Preconditions
- Signed-in `member` → earns `contributor` standing over time.
- Reputation derived from moderated outcomes, not self-asserted.

#### Happy Path (P6)

| Step | Screen state | System state | Emotion | Notes |
|---|---|---|---|---|
| 1 | Contributor profile: standing/level, "reports that helped," campaigns contributed to, accuracy indicator. | Reputation computed from moderation outcomes + campaign linkage. | Pride, purpose. | Outcome-based, not volume-based. |
| 2 | Submits a report (UJ-4.2). | Queued → moderated (UJ-4.6). | Engaged. | — |
| 3 | Notification: "Your report was confirmed and linked to a flagged *Toll-Road Smishing* campaign in your area — it helped warn others." **[X]** confidence of linkage shown. | Report confirmed → linked to Campaign → contributor event. | Validated, motivated. | The compounding feeling. |
| 4 | Standing increases; at thresholds, light privileges unlock (e.g., higher rate limits, trusted-fast-track review — never auto-publish). | Reputation tier updated; privileges gated, reversible. | Recognized. | Privileges never bypass moderation. |

#### Degraded / Edge Path A — False / low-quality report
- Rejected-with-reason; reputation impact is *gentle and corrective*, not punitive for honest error (Volume 3 P6 anxiety). Pattern of bad-faith reports → reputation/standing penalties + possible rate-limit.

#### Degraded / Edge Path B — Gaming attempt (volume farming, innocent-naming for points)
- Reputation MUST NOT reward volume or naming private individuals; anti-gaming controls + moderation catch this (PER-3.6.1).

#### Requirements
- **UJ-4.5.1 — MUST.** Reputation MUST derive from moderated outcomes/quality, not raw submission count. (PER-3.6.1)
- **UJ-4.5.2 — MUST.** Earned privileges MUST NOT allow bypassing moderation/auto-publishing accusations.
- **UJ-4.5.3 — SHOULD.** Honest false positives SHOULD be handled correctively, not punitively; bad-faith patterns penalized.
- **UJ-4.5.4 — SHOULD.** Contributors SHOULD receive outcome feedback (confirmed / campaign-linked) with Confidence. **[X]**

---

### 4.6 UJ-4.6 — Moderator Triage of a Queued Report

**Primary personas:** P7 (Aisha). **Surface:** moderation console.

#### Purpose
Let a trained moderator efficiently validate, dedupe, reclassify, redact, assess defamation/PII risk, and approve/merge/reject queued Reports — with consistency, an audit trail, and wellbeing protections.

#### Background
P7 stewards quality and safety and is exposed to distressing content. Graphic media blurs by default; exposure is bounded; every decision is logged with a reason.

#### Preconditions
- `moderator` role; trained; policy references available in-context.
- Queue fed by UJ-4.2; duplicates pre-clustered.

#### Happy Path (P7)

| Step | Screen state | System state | Emotion | Notes |
|---|---|---|---|---|
| 1 | Queue: prioritized list (harm/recency/volume), dupes grouped. Graphic media **blurred by default** with content warnings. | Queue query; clustering; PII/defamation pre-flags surfaced. | Focused. | Wellbeing-first (PER-3.6.3). |
| 2 | Opens a Report: extracted Entities, provisional classification + **Confidence [X]**, similar Reports/Campaign suggestions, auto PII/defamation flags. | Context assembled (entities, similarity, prior decisions). | Analytical. | Strong context = fast, fair decisions. |
| 3 | Actions: confirm classification / reclassify Threat / **redact** remaining PII / merge into Campaign / reject-with-reason / escalate. Keyboard shortcuts. | Each action writes to audit log with reason + moderator id + timestamp. | Decisive. | Auditability (SEC). |
| 4 | Confirms + merges into existing *Toll-Road Smishing* Campaign; report becomes publishable (de-identified). | Report `published`; Campaign updated; contributor + alert pipelines notified (UJ-4.5, UJ-4.8). | Accomplished. | Flywheel turns. |
| 5 | Session pacing: after a bounded batch / on graphic-heavy content, prompts a break; can defer worst items. | Exposure budget tracked. | Sustained, not burnt out. | Bounded exposure (PER-3.6.3). |

#### Degraded / Edge Path A — Defamation risk (named private individual)
- Auto-flag → report cannot be published as accusation; reframe to "impersonation of" or hold pending evidence/appeal flow; never publish unproven accusation (PER-3.6.2).

#### Degraded / Edge Path B — Graphic/illegal content (sextortion imagery, CSAM-adjacent)
- Blurred by default; moderator may defer/escalate **without viewing**; illegal content routes to mandated safety/legal escalation, out of normal pipeline (Volume 8/legal).

#### Degraded / Edge Path C — Ambiguous / low-confidence
- Moderator may mark "needs more evidence," request reporter follow-up, or leave unpublished. No forced verdict.

#### Requirements
- **UJ-4.6.1 — MUST.** Graphic media MUST blur by default; moderators MUST be able to defer/escalate without viewing. (PER-3.6.3)
- **UJ-4.6.2 — MUST.** Every moderation decision MUST be logged with actor, reason, and timestamp (audit trail).
- **UJ-4.6.3 — MUST.** Reports naming private individuals MUST NOT publish as accusations without passing the defamation/confidence/appeal controls. (PER-3.6.2)
- **UJ-4.6.4 — MUST.** Moderator exposure MUST be bounded (session/pacing controls). (PER-3.6.3)
- **UJ-4.6.5 — SHOULD.** The console SHOULD surface dedupe, similarity, Confidence, and policy references in-context to support consistent decisions. **[X]**

---

### 4.7 UJ-4.7 — Analyst Investigating a Campaign

**Primary personas:** P8 (Karen, AG/bank fraud). **Surface:** analyst workbench.

#### Purpose
Let a professional analyst investigate **Campaigns** — correlate Entities/Reports sharing an actor/kit, assess link-Confidence with provenance, track trends by geo/time, export defensible evidence, and feed confirmed intelligence back.

#### Background
P8 works clusters, not single reports, under evidentiary and compliance constraints; needs calibrated link-confidence, provenance, reproducible queries, and audit-logged exports.

#### Preconditions
- `analyst` role; role-gated, audit-logged access.
- Campaigns formed by correlation (shared Entities, similarity, temporal/geo clustering).

#### Happy Path (P8)

| Step | Screen state | System state | Emotion | Notes |
|---|---|---|---|---|
| 1 | Campaign list/dashboard: trends by Threat type, ZIP, time; harm-prioritized. Colorblind-safe, non-color-only signals. | Aggregations over Reports/Entities/Campaigns. | Investigative. | Accessibility for data (PER-3.5.3). |
| 2 | Opens a Campaign: entity graph (phones, domains, wallets, senders), member Reports, **link-Confidence per edge [X]** with provenance ("why linked"). | Graph from nodes/edges tables; confidence per correlation. | Rigorous. | Provenance-complete (Principle 5). |
| 3 | Filters by ZIP + date range; inspects growth ("412 reports in 14 days, +300% WoW"). | Parameterized, reproducible queries. | Insightful. | Reproducibility for defensibility. |
| 4 | **Export evidence package**: provenance-complete, timestamped, with methodology + confidence; export is audit-logged. | Export job; access + export logged. | Confident. | Chain-of-custody awareness (SEC). |
| 5 | Marks intelligence "confirmed" (only above evidence threshold) → feeds classifier/campaign model. **[V]** coordinates official action where appropriate. | Confirmed signal recorded; feedback to models; official-org coordination. | Effective. | Closes the intelligence loop. |

#### Degraded / Edge Path A — Thin-evidence cluster / over-attribution risk
- Low aggregate confidence surfaces prominently; "confirmed" labeling is *blocked* below threshold (Volume 3 P8 edge). Prevents false attribution.

#### Degraded / Edge Path B — Privacy/compliance boundary
- Source data with PII is access-controlled; exports respect de-identification + retention rules (Volume 2). Out-of-policy export attempts are blocked + logged.

#### Degraded / Edge Path C — Cross-jurisdiction / partner data
- Bank vs AG vs federal scopes differ; access is least-privilege per partner; provenance retained for the journalist/transparency boundary (UJ-4.8/P10 separation).

#### Requirements
- **UJ-4.7.1 — MUST.** Campaign links MUST carry calibrated Confidence + provenance ("why linked"). **[X]**
- **UJ-4.7.2 — MUST.** "Confirmed"/high-attribution labeling MUST be blocked below defined evidence thresholds.
- **UJ-4.7.3 — MUST.** Analyst access and exports MUST be role-gated and audit-logged; exports MUST respect de-identification/retention. (SEC)
- **UJ-4.7.4 — SHOULD.** Queries SHOULD be reproducible/parameterized to support defensibility.
- **UJ-4.7.5 — SHOULD.** Confirmed intelligence SHOULD feed back into classification/campaign detection.

---

### 4.8 UJ-4.8 — Receiving a Proactive Local-Campaign Alert

**Primary personas:** P1 (Marg), P3 (Priya, delegated), P5 (Rosa), P9 (Hông). **Surface:** alerts (push/email/in-app).

#### Purpose
Proactively warn opted-in users about a trending scam Campaign in their area/threat-interest *before* they're hit — calm, calibrated, actionable, and consent-respecting — turning ScamWatch into "Waze for scam intelligence."

#### Background
Built on moderated Campaigns (UJ-4.6) and analyst-confirmed trends (UJ-4.7). Alerts must be opt-in, geo-coarse, low-noise, non-fearmongering, and trauma-aware; delegated alerts (P3 for P1) must be consented (PER-3.7.1).

#### Preconditions
- User opted in (self or consented delegate) to alerts for a coarse area (ZIP/region) and/or threat types.
- Alert triggered by a moderated, threshold-crossing Campaign trend.

#### Happy Path (P1, via consented setup by P3)

| Step | Screen state | System state | Emotion | Notes |
|---|---|---|---|---|
| 1 | Push/email: "Heads up: a fake-toll text scam is spreading in your area this week." Calm, no alarm bells. | Trigger: Campaign trend crosses threshold for subscribed region; rate-limited per user. | Mild alertness, not fear. | Never exaggerate (Principle 6). |
| 2 | Taps → in-app alert detail: what it looks like (sample, de-identified), **Confidence [X]**, how many reports, "this is a pattern, here's how to recognize it." | Alert detail from Campaign + Explanation. | Informed, prepared. | Explain before warning (Principle 1). |
| 3 | **What to do:** don't click toll texts; verify via official toll site; report if you got one **[V]**. Large text/TTS available (P1/P9). | Verification handoff + report bridge. | Empowered. | Accessibility baked in. |
| 4 | "Manage alerts" — easy to adjust frequency, area, or unsubscribe; for delegated alerts, consent + relationship shown. | Subscription preferences; consent record visible. | In control. | Consent transparency (PER-3.7.1). |

#### Degraded / Edge Path A — Alert fatigue / over-alerting
- Frequency caps + de-duplication + severity thresholds prevent noise; repeated low-severity triggers are batched. Easy one-tap snooze/unsubscribe. Over-alerting is a measured anti-goal.

#### Degraded / Edge Path B — False or premature alert (unconfirmed trend)
- Alerts fire only on moderated, threshold-crossing Campaigns; premature/thin trends do not alert (ties to UJ-4.7.2). If an alert is later invalidated, a calm correction is issued (transparency).

#### Degraded / Edge Path C — Delegated alert without consent
- Delegate-configured alerts require the recipient's consent record; absent it, setup is blocked (PER-3.7.1).

#### Degraded / Edge Path D — Localization / accessibility
- Alerts respect the recipient's language (EN/ES/VI) and accessibility prefs (TTS, large text); a scam alert MUST NOT arrive in a language the recipient can't read (P9; PER-3.5.2).

#### Requirements
- **UJ-4.8.1 — MUST.** Alerts MUST be opt-in (self or consented delegate) and easy to adjust/unsubscribe. (PER-3.7.1)
- **UJ-4.8.2 — MUST.** Alerts MUST fire only on moderated, threshold-crossing Campaigns; copy MUST be calibrated and non-fearmongering with Confidence. **[X]** (Principle 6)
- **UJ-4.8.3 — MUST.** Alerts MUST include actionable guidance + official Verification handoff. **[V]**
- **UJ-4.8.4 — MUST.** Alerts MUST respect recipient language + accessibility prefs. (PER-3.5.2)
- **UJ-4.8.5 — SHOULD.** Frequency caps, de-duplication, and severity thresholds SHOULD prevent alert fatigue; invalidated alerts SHOULD be corrected.

---

## 5. Cross-Journey Requirements (`UJ-4.0.*`)

- **UJ-4.0.1 — MUST.** Every journey that shows a classification MUST present calibrated Confidence + Explanation + official Verification handoff. **[X][V]** (Principles 5–7; PER-3.4.1)
- **UJ-4.0.2 — MUST.** No journey MUST use blame/shame language on any victim-reachable path. (PER-3.2.1)
- **UJ-4.0.3 — MUST.** Core protective journeys (UJ-4.1, UJ-4.3) MUST be usable anonymously and free. (Principle 4; PER-3.3.1)
- **UJ-4.0.4 — MUST.** No journey MUST present AI output as fact; degraded/low-confidence paths MUST exist and fail safe. (Principle 6; UJ-4.1.4)
- **UJ-4.0.5 — MUST.** Each journey MUST cite at least one primary persona (done per-journey above). (PER-3.1.2)
- **UJ-4.0.6 — MUST.** Every journey MUST surface a "this is consumer protection, not legal advice" notice where it gives guidance, routing to official orgs. (Volume 2 legal guardrail)
- **UJ-4.0.7 — SHOULD.** Each journey SHOULD have at least one happy path and one degraded/edge path documented (done above). (PER-3.1.3)

## 6. Acceptance Criteria

- **AC-UJ-4.1 (anonymous lookup).** *Given* an anonymous user with a URL, *when* they Check, *then* a calibrated Confidence, an Explanation with sources, and ≥1 official Verification link render, with no account requested; *and* on a low-confidence artifact the copy avoids certainty and still routes to verification. (UJ-4.1.1–4.1.3)
- **AC-UJ-4.2 (report + OCR + PII).** *Given* a screenshot upload, *when* OCR runs, *then* extracted Entities are user-confirmable and any detected reporter/third-party PII is flagged with one-tap redaction before submit; *and* nothing publishes without moderation. (UJ-4.2.1–4.2.4)
- **AC-UJ-4.3 (victim mode).** *Given* victim mode, *when* it opens, *then* it shows non-blaming reassurance, reaches actionable steps in ≤1 interaction without an account, includes one-tap bank/FTC/IC3 links, makes 988 available un-forced, and the action list renders without waiting on AI. (UJ-4.3.1–4.3.6)
- **AC-UJ-4.4 (caregiver/consent).** *Given* a caregiver setting up monitoring, *when* no consent of the cared-for person exists, *then* covert monitoring is refused; *and given* delegated action, *when* attempted, *then* authority attestation is required and logged and no account credentials are requested. (UJ-4.4.2–4.4.4)
- **AC-UJ-4.5 (reputation integrity).** *Given* contributions, *when* reputation is computed, *then* it reflects moderated outcomes (not raw count) and grants no moderation-bypass; *and* innocent-naming/volume-farming earns no standing. (UJ-4.5.1–4.5.2)
- **AC-UJ-4.6 (moderation safety).** *Given* a queued report with graphic media, *when* opened, *then* media is blurred by default and can be deferred without viewing; *and* every decision is audit-logged with a reason; *and* named-individual accusations cannot publish without defamation controls. (UJ-4.6.1–4.6.3)
- **AC-UJ-4.7 (analyst rigor).** *Given* a campaign, *when* viewed, *then* each link shows calibrated Confidence + provenance; *and* "confirmed" is blocked below threshold; *and* exports are role-gated, de-identified per policy, and audit-logged. (UJ-4.7.1–4.7.3)
- **AC-UJ-4.8 (proactive alert).** *Given* an opted-in user, *when* a moderated campaign crosses threshold, *then* a calibrated, non-fearmongering alert with Confidence, actionable guidance, and official handoff is sent in the recipient's language/accessibility prefs, with easy unsubscribe; *and* delegated alerts require a consent record. (UJ-4.8.1–4.8.4)

## 7. Edge Cases (cross-journey)

- **Journey hop into victimhood.** From UJ-4.1 ("this looks like a scam") the user reveals they already paid → seamlessly offer UJ-4.3 victim mode without losing context, without blame.
- **Mixed-artifact input.** A single screenshot contains a URL *and* a phone *and* the reporter's name → UJ-4.2 must extract all, separate reporter-PII, and let the user pick what to submit.
- **Anonymous-to-authed transition.** A user starts anonymous (UJ-4.1/4.2) then signs in (UJ-4.5) → in-progress work should carry over without forcing re-entry (WCAG 3.3.7 Redundant Entry).
- **Shared device / persona collision.** Caregiver (P3/P11) and cared-for (P1) on one device → consent/identity must not be inferred from the device (UJ-4.4).
- **Spoofed-innocent across journeys.** A real brand/person impersonated must remain "impersonation of" from report (UJ-4.2) through moderation (UJ-4.6) to campaign (UJ-4.7) and any alert (UJ-4.8).
- **Low-confidence everywhere.** Lookup, provisional report classification, campaign links, and alerts must all degrade to humble + verify, never to false certainty.
- **Offline / poor network in victim mode.** Core checklist + official numbers must work with minimal JS and no login dependency.
- **Language mismatch.** A scam result/alert MUST never be delivered in a language the recipient can't read (P9).

## 8. Security Considerations (cross-journey)

- **Anonymity vs. abuse (UJ-4.1/4.2).** Rate-limiting, bot defense, and input sanitization protect the anonymous surfaces without logging PII or selling lookups (PER-3.3.2). Never echo unsanitized user input (XSS).
- **Upload pipeline (UJ-4.2).** Signed URLs + server-side malware/content scanning *before* OCR; storage isolation; OCR-then-redact before any publication; illegal content escalation out of the normal pipeline.
- **PII minimization & redaction (UJ-4.2/4.6).** Reporter PII and third-party PII detected and removable pre-publish; de-identification by default; retention schedules enforced (Volume 2).
- **Defamation controls (UJ-4.2/4.6/4.7/4.8).** Calibrated, evidence-linked statements about patterns/infrastructure only; no unproven accusations against named private individuals; moderation + confidence + appeal/takedown flow.
- **Delegated-authority abuse (UJ-4.4).** A fraudster posing as a caregiver is a modeled threat: attestation, logging, no credential access, additional verification for high-impact delegated actions.
- **Role-gated analyst access & exports (UJ-4.7).** Least privilege per partner (bank/AG/federal); audit logs; de-identified/retention-compliant exports; chain-of-custody awareness.
- **Alert trust (UJ-4.8).** Only moderated, threshold-crossing campaigns trigger alerts; corrections issued for invalidated alerts; delegated alerts require consent records (anti-stalkerware control).
- **Crisis-data sensitivity (UJ-4.3).** Victim-mode documentation is local-first/optional; do not require uploading sensitive loss details to get help.

## 9. Accessibility (WCAG 2.2 AA baseline)

- **Perceivable:** AA contrast; no color-only signals for scam/safe/Confidence (UJ-4.1.6, UJ-4.7); reflow to 400% (P1); captions/alt where media is shown; TTS for explanations/alerts (P1/P9).
- **Operable:** full keyboard operability on analyst/moderator consoles (P8/P7); 44×44px touch targets on consumer flows (P1/P5/P9); no time-limited safety actions in victim mode (UJ-4.3); non-drag alternatives (2.5.7) anywhere drag is offered.
- **Understandable:** 6th–8th-grade core copy (P1/P9) on consumer journeys; consistent navigation; error prevention on consequential actions (report submit, delegated action — 3.3.x); skippable explanation under acute load (UJ-4.3).
- **Robust:** semantic markup + ARIA; multilingual parity EN/ES/VI at launch (UJ-4.8.4; PER-3.5.2); WCAG 2.2 specifics — 2.4.11 Focus Not Obscured, 3.3.7 Redundant Entry (don't re-ask victims/users on anon→authed transition), 3.3.8 Accessible Authentication (no cognitive puzzles for P1/P9 sign-in).
- **Trauma-aware accessibility (UJ-4.3):** "accessible" includes cognitive load under acute stress — short paths, no timers, no forced reading.

## 10. Performance

- **UJ-4.3 victim mode is latency-critical:** actionable "what to do now" content MUST render fast on mid/low-end mobile over poor networks (target < 2.5s actionable content on throttled 4G) and MUST NOT block on AI Explanation generation (progressive enhancement).
- **UJ-4.1 lookup:** sub-second perceived response; structured result before prose Explanation (UJ-4.1.5); AI/OCR calls have budgets with safe fallbacks on timeout (UJ-4.1.4).
- **UJ-4.2 OCR/extraction:** background jobs (pgmq) with visible status; never block the UI thread on OCR; large-image handling with size/type limits.
- **UJ-4.6 moderation / UJ-4.7 analyst:** responsive filtering/pagination over large Report/Campaign datasets (`pgvector` similarity + indexed queries); exports run async.
- **UJ-4.8 alerts:** trigger evaluation runs on schedule/queue; per-user rate caps; alert delivery decoupled from request path.
- **P1/P9 mobile-only:** strict JS/payload budgets; server-rendered core; no layout shift on zoom; TTS/translation stream so they never block the primary warning.

## 11. Future Expansion

- **Conversational lookup:** a guided, multi-turn "is this a scam?" assistant for P1/P9 (still calibrated, still routing to official orgs).
- **Browser/email/SMS integrations:** in-context "check this" at the point of exposure (extension, RCS/SMS reporting shortcode, email forwarding address) feeding UJ-4.1/4.2.
- **Recovery companion (post-UJ-4.3):** an optional, consented follow-up checklist for recovery steps over days/weeks, coordinating with banks/credit bureaus.
- **Richer caregiver/family tier:** evolving UJ-4.4 into a consented family-protection product with dignity + consent controls.
- **Partner/analyst workspaces:** deeper UJ-4.7 collaboration for AG offices and bank fraud teams; formal researcher/journalist aggregate-data program (P10) separated from operational analyst data.
- **Real-time campaign alerting:** moving UJ-4.8 toward near-real-time, geofenced, threshold-tuned alerts as report volume grows (Florida → US → Global), always opt-in and non-fearmongering.

---

*Cross-volume note: journey IDs UJ-4.* and persona IDs P1–P11 (Volume 3) are stable references for QA, IA (Volume 5), and the feature volumes. Explainability **[X]** and Verification-handoff **[V]** markers indicate the mandatory calibrated-AI and official-org-routing moments required by Volume 2 Principles 5–7.*
