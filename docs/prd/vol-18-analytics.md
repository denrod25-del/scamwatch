# Volume 18 — Analytics

> Part of the ScamWatch master PRD ("Project Sentinel"). Written against `_shared-context.md`. Do not contradict the shared context; this volume extends it.

This volume defines how ScamWatch **measures itself**: the North Star Metric (tied to real-world harm prevented) and its supporting metric tree, the KPI catalog across acquisition/activation/engagement/trust/safety/intelligence-quality, the core conversion funnels, the dashboards each audience needs, a privacy-respecting and consent-aware event taxonomy & tracking plan, an experimentation/AB-testing framework with hard ethical guardrails, and the intelligence-quality metrics (classification accuracy, calibration, time-to-detect-campaign, coverage). Analytics here is bound by Principle 3 (*Protect privacy* — never sell data, default to de-identification) and Principle 9 (*Every feature should help prevent real-world harm*). Requirement IDs use the prefix `AN-18`.

## Table of Contents

1. [North Star Metric & Metric Tree](#1-north-star-metric--metric-tree)
2. [KPI Catalog](#2-kpi-catalog)
3. [Conversion Funnels](#3-conversion-funnels)
4. [Dashboards](#4-dashboards)
5. [Event Taxonomy & Tracking Plan](#5-event-taxonomy--tracking-plan)
6. [Experimentation / AB-Testing Framework](#6-experimentation--ab-testing-framework)
7. [Intelligence-Quality Metrics](#7-intelligence-quality-metrics)
8. [Cross-Volume Dependencies](#8-cross-volume-dependencies)

---

## 1. North Star Metric & Metric Tree

**Purpose.** Anchor the whole organization on a single metric that proxies the mission — *harm prevented* — not vanity growth.

**Background.** Vanity metrics (pageviews, signups) can rise while the mission fails. The North Star must approximate real-world protective value and resist gaming.

**Proposed North Star Metric (NSM):**

> **Protective Actions Delivered (PAD)** — the weekly count of distinct user sessions in which a user *received and engaged with a calibrated, verifiable protective outcome*: i.e., looked up a scam signal (number/URL/email/pattern) and was shown an Explanation **with** official-organization verification routing, **or** completed a Report that contributes to community intelligence.

**Justification.** PAD is downstream of every principle: it requires an Explanation (Principle 1), calibrated language + sources (Principles 5–6), official-org routing (Principle 7), and it counts *protective engagement*, not mere traffic. It credits both the consumer-protection path (look-up→understand→verify) and the contribution path (report→intelligence). It is harm-prevention-shaped because each PAD is a moment where a user was equipped to avoid or report fraud. It is hard to game without delivering the protective experience.

**Supporting "true-north" proxy (directional, not a target to optimize blindly):** **Estimated Harm Prevented** — a transparent, methodology-published model combining PAD volume, scam-category severity, and conservative prevented-loss assumptions; reported in transparency reports (Vol 16) with explicit uncertainty. It is a *narrative/context* metric, never an OKR to maximize (avoids perverse incentives).

**Metric tree (NSM decomposition):**

```
PAD (weekly protective actions)
├── Reach: protected-eligible sessions (visitors who hit a protective surface)
│     └── Acquisition × Activation (§2)
├── Conversion: % of those sessions reaching a protective outcome
│     └── search→understand→verify funnel (§3)
├── Contribution: reports submitted & accepted → community intelligence (§3)
└── Quality multiplier: intelligence accuracy/calibration/coverage (§7)
      (low quality discounts the *value* of each PAD)
```

**Requirements.**

- `AN-18.1.1` PAD **MUST** be defined from privacy-respecting events (consent-aware, no PII) and computable per ISO week.
- `AN-18.1.2` The metric tree **MUST** trace every input KPI to PAD so teams know how their work moves the NSM.
- `AN-18.1.3` Estimated Harm Prevented **MUST** publish its methodology and uncertainty (Principles 5–6) and **MUST NOT** be a hard optimization target.

**Acceptance Criteria.** `AC-18.1.a` PAD reconciles bottom-up (event counts) and is reproducible week-over-week. `AC-18.1.b` Removing official-org routing from a surface measurably reduces PAD on that surface (validates definition integrity).

**Edge Cases.** Bot/automated traffic inflating PAD (exclude via abuse signals, Vol 11). Repeat power users (count distinct protective sessions, cap per-user inflation). A surface that "warns" without explanation/verification does NOT count.

**Security Considerations.** NSM computation runs on de-identified, aggregated events only.

**Accessibility / Performance / Future Expansion.** N/A; computed in analytics store off prod; future: per-market PAD (Phase 2/3), validated harm-prevented model via partner data (Vol 19, anonymized).

---

## 2. KPI Catalog

**Purpose.** A governed catalog of metrics grouped by lifecycle and mission dimension, each tied to the metric tree.

| Group | KPI | Definition (privacy-safe) |
|---|---|---|
| **Acquisition** | New visitors; source mix | Distinct consented sessions by channel |
| | Organic/search landings | Sessions to protective surfaces from search |
| **Activation** | First protective action | % new users reaching first PAD-qualifying outcome |
| | First report completed | % who finish a Report |
| **Engagement** | Return protective rate | % users with PAD in ≥2 weeks |
| | Lookups per active user | Distinct signal lookups / active user |
| **Trust** | Verification routing follow-through | % protective outcomes where user opens official-org link |
| | Explanation usefulness | % "this helped" / explanation surveys (consented) |
| | Correction/appeal rate | Appeals per published item (with Vol 16) |
| **Safety** | Crisis routing rate | Crisis escalations routed to resources (Vol 16) |
| | Abuse/false-report rate | Confirmed-abusive submissions / total (Vol 11/16) |
| **Intelligence-quality** | Accuracy, calibration, TTD-campaign, coverage | See §7 |
| **Reliability (xref Vol 17)** | Uptime, Core Web Vitals | From RUM/uptime |

**Requirements.**

- `AN-18.2.1` Every KPI **MUST** have an owner, a precise definition, a source event/query, and a target or guardrail.
- `AN-18.2.2` Trust & Safety KPIs **MUST** be first-class and reviewed alongside growth KPIs (Principle 8: trust before growth).
- `AN-18.2.3` No KPI **MAY** be defined in a way that rewards fearmongering, suppressing verification, or vanity over protection.

**Acceptance Criteria.** `AC-18.2.a` Each catalog entry resolves to a reproducible query on the event store. `AC-18.2.b` A growth KPI that would degrade a trust/safety guardrail is flagged in review.

**Edge Cases.** Sparse early-launch data (report ranges/CIs, avoid over-reading). Metric redefinition (version + annotate dashboards).

**Security Considerations.** All KPIs computed from de-identified events; small cells suppressed.

**Accessibility / Performance / Future Expansion.** Catalog published accessibly; queries materialized for performance; future: cohort/retention depth, per-market splits.

---

## 3. Conversion Funnels

**Purpose.** Find drop-off in the two journeys that create protective value.

**Funnel A — Protective (search → understand → verify → report):**

```
1. Search / lookup a signal (number, URL, email, pattern)
2. Understand: viewed Explanation (calibrated, with Confidence)
3. Verify: opened official-org routing (FTC/IC3/AG/CFPB/IRS/SSA…)
4. (optional) Report: submitted their own encounter
```

**Funnel B — Contribution (visitor → contributor):**

```
1. Visitor → 2. Member (sign-up/OTP) → 3. First report → 4. Contributor (onboarded, ref Vol 16)
```

**Requirements.**

- `AN-18.3.1` Each funnel step **MUST** map to a tracked, consent-aware event (§5) so step-conversion is measurable.
- `AN-18.3.2` The protective funnel **MUST** treat *reaching Explanation + verification routing* as the success state (steps 2–3), not raw traffic.
- `AN-18.3.3` Funnels **MUST** be segmentable by scam category, device, channel, and new vs. returning — without exposing individuals.

**Acceptance Criteria.** `AC-18.3.a` Step-to-step conversion is computable and reconciles to KPI definitions. `AC-18.3.b` A drop between "understand" and "verify" is detectable and attributable to a surface.

**Edge Cases.** Users who verify off-platform (we can only measure click-out, document the limitation). Multi-session journeys (stitch via consented anonymous ID, respecting opt-out).

**Security Considerations.** No funnel step logs report content/PII; click-out tracks destination *category*, not user identity.

**Accessibility / Performance / Future Expansion.** Funnel surfaces themselves WCAG 2.2 AA (other volumes); funnel queries materialized; future: assisted-path optimization (never by weakening verification).

---

## 4. Dashboards

**Purpose.** Give each audience exactly the view they need, no more (data minimization extends to internal access).

| Audience | Dashboard focus |
|---|---|
| **Exec** | NSM (PAD) trend, Estimated Harm Prevented (context), trust index, top risks, reliability headline |
| **Product** | Funnels A/B, activation/engagement, feature adoption, CWV by route |
| **Trust & Safety (Vol 16)** | Queue SLAs, appeal/correction rates, abuse trends, crisis routing, reputation health |
| **AI-quality (Vol 12)** | Accuracy, calibration curves, TTD-campaign, coverage, drift (§7) |

**Requirements.**

- `AN-18.4.1` Dashboards **MUST** be role-scoped; sensitive T&S/AI views **MUST** be RBAC-gated and access-audited.
- `AN-18.4.2` Every chart **MUST** state its definition, time window, and data freshness; no undefined "magic" numbers.
- `AN-18.4.3` Dashboards feeding transparency reports (Vol 16) **MUST** reconcile with published figures for the same window.

**Acceptance Criteria.** `AC-18.4.a` A T&S-only metric is not visible to a non-T&S role. `AC-18.4.b` Exec NSM equals the sum of its tree inputs for the period.

**Edge Cases.** Conflicting numbers across dashboards (single source of truth: the governed metric layer). Stale data (freshness banner + alert).

**Security Considerations.** Internal dashboards use de-identified/aggregated data; small-cell suppression applies internally too.

**Accessibility.** Dashboards WCAG 2.2 AA: chart data available as tables, no color-only encodings, keyboard navigable.

**Performance.** Pre-aggregated/materialized; dashboard p95 load < 3 s.

**Future Expansion.** Self-serve metric explorer (governed); per-market dashboards (Phase 2/3); public stats dashboard (Principle 5).

---

## 5. Event Taxonomy & Tracking Plan

**Purpose.** A privacy-first, consent-aware, governed event model — the substrate for all metrics — that never sells or over-collects data.

**Background.** Principle 3 forbids selling data and mandates minimization/de-identification. Vol 14 governs privacy/consent. ScamWatch users are often anxious victims; tracking must be respectful and minimal.

**Recommended approach.** A **privacy-first, first-party analytics** model: server-side and/or cookieless first-party event capture (e.g., a self-hosted/privacy-respecting analytics layer), **no third-party ad/marketing trackers**, **no data sale or sharing for advertising**, consent-gated for anything beyond strictly-necessary measurement, IP truncated/not stored, and aggregate-by-design. Prefer aggregated counts over per-user event streams wherever a metric allows.

**Event model (illustrative):**

```jsonc
{
  "event": "explanation_viewed",          // controlled vocabulary
  "ts": "2026-06-24T00:00:00Z",
  "anon_id": "<rotating, consent-scoped, non-PII>",
  "surface": "lookup_result",
  "props": {
    "signal_type": "url|phone|email|pattern",
    "threat_category": "smishing",        // taxonomy, not raw content
    "confidence_bucket": "0.7-0.8",        // bucketed, never raw user data
    "had_verification_routing": true
  }
}
```

**Requirements.**

- `AN-18.5.1` A controlled event vocabulary and property schema **MUST** be maintained (versioned tracking plan); ad-hoc events are rejected in review.
- `AN-18.5.2` Events **MUST NOT** contain report content, screenshots, PII, raw signal values, or anything that identifies a victim; only typed/bucketed metadata.
- `AN-18.5.3` Tracking beyond strictly-necessary measurement **MUST** be consent-gated; users **MUST** be able to opt out, and opt-out **MUST** be honored end-to-end (no shadow tracking).
- `AN-18.5.4` Data **MUST NOT** be sold or shared with advertisers/data brokers; no third-party advertising trackers are permitted (Principle 3).
- `AN-18.5.5` Analytics data **MUST** have a retention schedule (ref Vol 10) and default to de-identification; raw event retention minimized, aggregates kept.
- `AN-18.5.6` IP addresses **MUST** be truncated/not persisted; identifiers used for stitching **MUST** be rotating and consent-scoped.

**Acceptance Criteria.** `AC-18.5.a` A new event PR is rejected unless it's in the tracking plan with privacy review. `AC-18.5.b` With analytics consent off, no analytics events are emitted (verified in network capture). `AC-18.5.c` An event payload audit finds zero PII/raw-content fields.

**Edge Cases.** Do-Not-Track / global privacy control (respect as opt-out). Children's data (extra caution; minimize). Region with stricter law (apply strictest, GDPR-ready).

**Security Considerations.** Event ingestion authenticated/rate-limited; pipeline access RBAC + audited; de-identification at the boundary.

**Accessibility.** Consent UI WCAG 2.2 AA, plain-language, no dark patterns (genuine choice).

**Performance.** Client emission async/batched; negligible impact on Core Web Vitals.

**Future Expansion.** Differential-privacy aggregates; on-device/edge aggregation; per-market consent regimes (Phase 2/3).

---

## 6. Experimentation / AB-Testing Framework

**Purpose.** Improve the product with evidence — under hard ethical limits so experiments never reduce user protection.

**Background.** A/B testing can optimize conversion or comprehension. Here it must operate within consumer-protection ethics: protection is not a variable to trade away for engagement.

**Requirements.**

- `AN-18.6.1` **Hard guardrail (non-negotiable):** No experiment **MAY** reduce user protection — e.g., never A/B-test removing/weakening warnings, Explanations, Confidence display, or official-org verification routing; never test fearmongering or false-certainty copy (Principles 5–7, 9).
- `AN-18.6.2` Every experiment **MUST** declare hypothesis, primary metric, **protective guardrail metrics** (verification follow-through, comprehension, abuse rate) that auto-stop the test if harmed, sample size, and duration.
- `AN-18.6.3` Experiments **MUST** be consent-aware and use the privacy-first event model (§5); no PII; assignment is de-identified.
- `AN-18.6.4` Experiments touching safety-critical surfaces **MUST** get T&S + ethics review before launch (ref Vol 16).
- `AN-18.6.5` Results **MUST** be analyzed with pre-registered metrics (no p-hacking) and decisions logged; significant protective regressions **MUST** roll the variant back (ties to feature flags, Vol 17).

**Acceptance Criteria.** `AC-18.6.a` An experiment proposing to remove verification routing is rejected at design review. `AC-18.6.b` A live test breaching a protective guardrail auto-stops and rolls back. `AC-18.6.c` Every shipped experiment has a logged decision with pre-registered analysis.

**Edge Cases.** Comprehension test where one variant *increases* alarm (rejected — Principle 6). Underpowered tests (don't ship on noise). Interaction between concurrent experiments (mutual exclusion where needed).

**Security Considerations.** Assignment service de-identified; experiment configs audited; flags privileged (Vol 17).

**Accessibility.** All variants must independently meet WCAG 2.2 AA; never A/B-test below the accessibility baseline.

**Performance.** Assignment adds negligible latency; no CWV regression from experimentation infra.

**Future Expansion.** Holdout groups for long-term protective impact; multi-armed bandits *only* for non-safety surfaces; per-market experimentation (Phase 2/3).

---

## 7. Intelligence-Quality Metrics

**Purpose.** Measure whether the AI/intelligence layer is actually *good* — accurate, calibrated, fast to detect campaigns, and broadly covering the threat landscape — because PAD's value depends on it.

**Background.** The AI layer (Vol 12) classifies Threats, extracts Entities, links Campaigns, and attaches Confidence. Calibrated Confidence is a stated principle; this section makes it measurable.

| Metric | Definition |
|---|---|
| **Classification accuracy** | Precision/recall/F1 per Threat category vs. moderator-confirmed ground truth |
| **Calibration** | Reliability curve / ECE: does Confidence 0.8 mean ~80% correct? |
| **Time-to-detect campaign (TTD)** | Time from first related Report to Campaign correlation |
| **Coverage** | % of taxonomy categories + emerging variants represented; geographic coverage |
| **Entity-extraction quality** | Precision/recall of extracted Entities |
| **Drift** | Change in accuracy/calibration over time / on new data |

**Requirements.**

- `AN-18.7.1` Ground truth **MUST** come from moderator-confirmed labels (Vol 16) on a sampled, audited basis; metrics computed per category.
- `AN-18.7.2` **Calibration MUST** be measured (e.g., reliability diagram + Expected Calibration Error); systematic over/under-confidence triggers recalibration (Principle 5/6) and T&S/AI review.
- `AN-18.7.3` **TTD-campaign MUST** be tracked; regressions flag the campaign-detection pipeline (Vol 12).
- `AN-18.7.4` **Coverage MUST** be tracked against the threat taxonomy (shared context) and surfaced gaps prioritized.
- `AN-18.7.5` Drift **MUST** be monitored; significant degradation alerts (Vol 17) and may gate model promotion.
- `AN-18.7.6` These metrics **MUST** feed transparency reports (Vol 16) honestly, including known weaknesses (Principle 5).

**Acceptance Criteria.** `AC-18.7.a` A reliability diagram is produced per period; ECE beyond threshold triggers a recalibration ticket. `AC-18.7.b` Accuracy/coverage are reportable per Threat category and reconcile with the transparency report. `AC-18.7.c` A simulated mislabel batch lowers measured accuracy and shows up in drift monitoring.

**Edge Cases.** Sparse categories (report CIs, avoid over-claiming). Ground-truth label noise (inter-annotator checks, Vol 16). Adversarial evasion shifting distribution (drift catches it; coverage gap opened).

**Security Considerations.** Ground-truth datasets are sensitive (may include scam content); access-controlled, PII-redacted, retention-bounded (Vol 10).

**Accessibility.** Calibration/coverage visualizations have table equivalents (WCAG 2.2 AA).

**Performance.** Metric jobs run on the analytics/replica store, off the serving path.

**Future Expansion.** Per-market calibration (Phase 2/3); automated recalibration loops; external red-team coverage scoring; counterfactual harm-prevention estimation with partner data (Vol 19, anonymized only).

---

## 8. Cross-Volume Dependencies

| Depends on / relates to | For |
|---|---|
| **Vol 10 — Database** | Analytics retention/de-identification, materialized aggregates |
| **Vol 11 — (Abuse)** | Bot/abuse exclusion from metrics; abuse-rate KPI |
| **Vol 12 — (AI/Intelligence)** | Source of classifications/Confidence; intelligence-quality pipeline |
| **Vol 14 — (Legal/Privacy)** | Consent regime, privacy guardrails, retention/legal hold |
| **Vol 16 — Operations** | Moderator ground truth; T&S/abuse/appeal KPIs; transparency-report figures |
| **Vol 17 — Deployment** | RUM/CWV/uptime metrics; feature flags for experiments; drift alerting |

**Cross-volume assumptions made by this volume:** Vol 14 owns the canonical consent/privacy rules (Vol 18 implements analytics within them); Vol 16 supplies moderator-confirmed ground truth and publishes the metrics defined here in transparency reports; Vol 12 owns the AI pipeline whose quality §7 measures; Vol 17 supplies RUM/CWV and the feature-flag mechanism experiments ride on. The NSM ("Protective Actions Delivered") is proposed here and assumed adopted program-wide; targets/thresholds (ECE limit, sample sizes, retention windows) are configurable parameters, not constants.
