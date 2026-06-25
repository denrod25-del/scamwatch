# Volume 2 — Market Research

> **Project Sentinel · ScamWatch master PRD**
> Tagline: *Know Before You Click™*

This volume sizes the consumer-fraud problem, maps the competitive and adjacent landscape, characterizes the current threat-trend environment, surveys the regulatory landscape, identifies distribution channels, and articulates the unmet needs ScamWatch fills. It is deliberately **calibration-honest** (Principle 6): figures are labeled as *illustrative*, *estimate*, or *order-of-magnitude* wherever the underlying public data is incomplete, lagging, or methodologically inconsistent. This volume informs **Volume 1 — Business Strategy** (GTM, partnerships, monetization) and is informed by **Volume 0 — Executive Vision** (problem shape §1, boundaries §5).

Requirement ID prefix for this volume: `MR-2.<section>.<n>`. These are research/positioning requirements (e.g., "we MUST validate X before claiming Y"), not product-build requirements.

> **Global calibration disclaimer.** Public fraud statistics systematically *under*-count (most fraud goes unreported) and are reported with multi-month to multi-year lag and differing definitions across sources (FTC Sentinel, FBI IC3, BBB, AARP, FinCEN). This volume does not assert precise dollar totals as fact. Where a magnitude is needed, it is framed as a range or an order of magnitude and marked. Treat every number here as **directional**, to be re-validated against primary sources at build time (see `MR-2.1.4`).

---

## Table of Contents

1. [Market Sizing Framing](#1-market-sizing-framing)
2. [Competitive & Adjacent Landscape](#2-competitive--adjacent-landscape)
3. [Threat-Trend Landscape](#3-threat-trend-landscape)
4. [Regulatory Landscape](#4-regulatory-landscape)
5. [Distribution Channels](#5-distribution-channels)
6. [Unmet Needs ScamWatch Fills](#6-unmet-needs-scamwatch-fills)

---

## 1. Market Sizing Framing

### 1.1 Purpose

Frame the size and shape of the consumer-fraud problem — nationally and for the Florida launch market — in a way that is honest about data limitations and useful for prioritization, without asserting false precision.

### 1.2 Background

"Market size" for a public-benefit consumer-protection platform is not a TAM/SAM/SOM revenue funnel in the usual sense; the protective core is free (charter C1). The relevant sizing is **the magnitude of harm to be prevented** and **the population to be served**, which then informs the (separate) institutional/sustainability sizing in Volume 1.

Three sizing lenses:

| Lens | What it measures | Honest caveat |
|---|---|---|
| **Harm magnitude** | Reported consumer-fraud losses (national + Florida). | Reported losses are a *floor*; true losses are higher because most fraud is unreported. |
| **Population at risk** | Adults exposed to scam contact (effectively all phone/email/internet users); high-risk sub-populations (older adults, recent immigrants, bereaved, financially stressed). | "At risk" is near-universal; the actionable framing is *highest-risk* cohorts. |
| **Institutional demand** | Banks, telecoms, agencies needing de-identified threat intelligence / verification (sized in Volume 1). | Out of scope for the harm-prevention core; relevant to sustainability. |

### 1.3 National framing (directional)

- Reported consumer-fraud losses in the US are at the scale of **multiple billions of dollars per year** (order-of-magnitude; per FTC Sentinel-style aggregate reporting). *Illustrative; re-validate against the latest FTC Sentinel Data Book and FBI IC3 annual report at build time.*
- The number of fraud reports filed annually is at the scale of **millions** (FTC Sentinel intake; IC3 complaints). *Directional.*
- **Under-reporting is the dominant uncertainty:** widely cited research suggests only a small fraction of fraud is ever reported to authorities, so reported totals materially understate true harm. *Stated as a qualitative fact, not a precise multiplier.*

> **Do not, in any consumer-facing surface, cite a specific national loss figure as settled fact (Principle 6).** Use ranges and link to the primary source (Principle 7).

### 1.4 Florida framing (directional)

Florida is the launch market (Volume 0 / shared context) for structural reasons, not because of a single headline number:

| Factor | Why it matters for ScamWatch | Calibration |
|---|---|---|
| **Large older-adult population** | Older adults are disproportionately targeted by — and suffer larger per-incident losses from — impersonation, romance/pig-butchering, grandparent, and tech-support scams. Florida has one of the largest and highest-share retiree populations of any US state. | The *direction* (very high retiree exposure) is well-established; exact rankings/percentages should be pulled from current Census/ACS data at build time. |
| **High absolute fraud-report volume** | Large, populous, high-retiree states tend to rank near the top in absolute fraud reports and losses in FTC/IC3 state breakdowns. | Florida is *typically* among the top states by report volume; cite the current FTC state report rather than a fixed rank. |
| **Active state consumer-protection apparatus** | The Florida Attorney General's office runs consumer-protection/anti-fraud programs that serve as `Verification` routing and partnership anchors (Volume 1 §3–4). | Qualitative, stable. |
| **Seasonal/transient population & disaster exposure** | Snowbirds, tourism, and hurricane-season disaster/charity scams create recurring, region-specific `Threat` spikes. | Qualitative, stable. |

### 1.5 Requirements

| ID | Level | Requirement |
|---|---|---|
| MR-2.1.1 | MUST | Any externally published market/harm figure MUST be sourced to a named primary source and dated. |
| MR-2.1.2 | MUST NOT | The product/marketing MUST NOT present an estimated loss figure as exact or settled (Principle 6). |
| MR-2.1.3 | SHOULD | Florida launch prioritization SHOULD be justified by structural factors (retiree share, AG apparatus, report volume), not a single statistic. |
| MR-2.1.4 | MUST | All directional figures in this volume MUST be re-validated against current primary sources (FTC Sentinel Data Book, FBI IC3 report, US Census/ACS, AARP, FinCEN) before any external use. |

### 1.6 Acceptance Criteria

- **AC-2.1.1** — Every published figure links to a dated primary source. (MR-2.1.1)
- **AC-2.1.4** — A pre-publication checklist confirms re-validation of figures against current primary sources. (MR-2.1.4)

### 1.7 Edge Cases

- Sources disagree (FTC vs. IC3 vs. AARP define and scope fraud differently) — present the range and note the definitional difference rather than picking the largest number.
- A figure is stale by the time of publication (annual reports lag) — label the reporting year explicitly.

### 1.8 Security Considerations

N/A (research artifact). Any datasets ingested for sizing MUST themselves be from trustworthy primary sources to avoid poisoned inputs.

### 1.9 Accessibility

Any sizing visuals shown to users MUST meet AA (contrast, non-color-only encoding) and include text alternatives.

### 1.10 Future Expansion

Internal, de-identified ScamWatch telemetry could, over time, produce a *better* under-reporting-corrected estimate of true harm — a public good and a credibility asset (Principle 5).

---

## 2. Competitive & Adjacent Landscape

### 2.1 Purpose

Map the tools consumers and institutions use today, classify them, and pinpoint exactly where ScamWatch is differentiated — so positioning is grounded in real gaps, not strawmen.

### 2.2 Background

There is no direct, like-for-like competitor that is simultaneously (a) free at the protective core, (b) calibrated + explainable, (c) multi-channel, (d) public-benefit / no-data-sale, and (e) consumer-legible with official-verification routing. Existing players each occupy a slice. The honest framing: ScamWatch competes less with any single product than with the **fragmented status quo** of "Google it, ask a relative, or find out after the money's gone."

### 2.3 Comparison table

Legend: ✓ = strong, ◐ = partial, ✗ = absent/not the design goal. Assessments are based on each tool's publicly understood positioning and are **directional**, to be re-checked at build time.

| Tool | Category | Free core | Calibrated + explainable | Multi-channel | No data-sale / public-benefit | Official-verification routing | Consumer-legible |
|---|---|---|---|---|---|---|---|
| **FTC reportfraud.ftc.gov** | Gov't complaint intake | ✓ | ✗ (intake, not assessment) | ◐ | ✓ | n/a (it *is* official) | ◐ |
| **FBI IC3** | Gov't complaint intake | ✓ | ✗ | ◐ | ✓ | n/a (official) | ◐ |
| **BBB Scam Tracker** | Crowd scam reports | ✓ | ✗ (narrative, uncalibrated) | ◐ | ◐ | ◐ | ◐ |
| **Truecaller** | Caller-ID / spam | ◐ (freemium) | ✗ (opaque score) | ✗ (phone-centric) | ✗ (commercial data practices) | ✗ | ◐ |
| **Robokiller** | Call/SMS blocking | ✗ (paid) | ✗ | ◐ (call+SMS) | ✗ | ✗ | ◐ |
| **Aura** | Consumer protection suite | ✗ (paid) | ◐ | ◐ | ✗ | ◐ | ✓ |
| **Scam-baiting communities** | Volunteer/vigilante | ✓ | ✗ | ◐ | ◐ | ✗ | ✗ |
| **VirusTotal** | Infra reputation (analyst) | ◐ | ◐ (verdicts, not consumer-framed) | ✗ (URL/file) | ◐ | ✗ | ✗ |
| **urlscan.io** | URL analysis (analyst) | ◐ | ◐ | ✗ (URL) | ◐ | ✗ | ✗ |
| **ScamWatch** | Public-benefit consumer scam intelligence | **✓** | **✓** | **✓** | **✓** | **✓** | **✓** |

### 2.4 Differentiation summary

| Adjacent player | What ScamWatch borrows (analog) | Where ScamWatch differs |
|---|---|---|
| VirusTotal / urlscan | The "submit-an-artifact, get-a-verdict, aggregate-many-engines" *model* | ScamWatch is consumer-legible, trauma-aware, multi-channel, and routes to official verification — not an analyst tool. |
| FTC / IC3 | Authoritative `Verification` targets (we route *to* them) | We add the *pre-incident, decisive-moment* check they don't provide; we are complementary, not competitive. |
| BBB Scam Tracker | Crowd `Report` intake | We add calibrated `Confidence`, normalized `Entity`s, `Campaign` correlation, and explainability. |
| Truecaller / Robokiller | Channel signal | We are multi-channel, free at the core, and do not adopt their commercial data practices (charter C2). |
| Aura | Consumer-legible UX | We keep the protective core free and public-benefit (C1), and we explain rather than just monitor/block. |

### 2.5 Requirements

| ID | Level | Requirement |
|---|---|---|
| MR-2.2.1 | MUST | Positioning MUST be framed as complementary to official channels (FTC/IC3), never as a replacement for them (Principle 7, charter C4/C5). |
| MR-2.2.2 | SHOULD | Competitive claims SHOULD be re-validated against each tool's *current* offering before external use (offerings change). |
| MR-2.2.3 | MUST NOT | Marketing MUST NOT disparage official agencies or imply ScamWatch is itself an enforcement/official body. |

### 2.6 Acceptance Criteria

- **AC-2.2.1** — Positioning copy references official channels as the verification authority, with ScamWatch as the pre-incident check. (MR-2.2.1)
- **AC-2.2.2** — A dated competitive-refresh note accompanies any externally published comparison. (MR-2.2.2)

### 2.7 Edge Cases

- A competitor adds a free, calibrated consumer check — re-assess differentiation; lean on the trust/data/relationship moat (Volume 1 §6) and the public-benefit charter, which a commercial player can't fully copy.

### 2.8 Security Considerations

The VirusTotal/urlscan analogy implies submitting potentially-malicious artifacts; ScamWatch inherits the untrusted-intake posture (Volume 0 §1.7) — links/files are never auto-fetched in a user-endangering context.

### 2.9 Accessibility

Comparison content shown to users MUST be AA-conformant and plain-language.

### 2.10 Future Expansion

Track the emergence of AI-assistant-native scam checks (e.g., scam detection embedded in mailbox/OS assistants) as both a distribution opportunity (partnership) and a competitive vector.

---

## 3. Threat-Trend Landscape

### 3.1 Purpose

Characterize the current scam typologies and explain *why they are accelerating*, so product prioritization (which `Threat`s to cover first) is grounded in the live threat environment.

### 3.2 Background

The top-level threat taxonomy is fixed in the shared context (Phishing/Smishing/Vishing · Impersonation · Investment/Crypto incl. pig-butchering · Romance · Tech-support · Employment/Job · Marketplace/Goods · Refund/Overpayment · Lottery/Prize · Charity/Disaster · Extortion/Sextortion · Identity-theft · Account-takeover · Fake invoices/BEC · Subscription/Free-trial traps). This section describes which are most active and the structural drivers behind their growth.

### 3.3 Active typologies and accelerants (directional)

| Typology | Current activity (directional) | Why accelerating |
|---|---|---|
| **Smishing (e.g., toll-road, delivery, bank)** | Very high volume; toll-road smishing has been a notable recent wave | Cheap bulk SMS; trivially rotated sender infrastructure; high tap-through on plausible everyday pretexts |
| **Pig-butchering / investment-crypto** | High and rising losses per victim | Long-con social engineering + crypto irreversibility; industrialized scam compounds; AI-assisted persona maintenance |
| **Impersonation (gov't / bank / brand / family)** | Persistent, high-loss | Brand trust exploited; caller-ID spoofing; now voice-cloning of family members (grandparent scam 2.0) |
| **Tech-support** | Persistent; older-adult-skewed | Plausible "your computer is infected" pretext; remote-access tooling abuse |
| **Romance** | Persistent, high emotional + financial harm | Dating-app scale; AI-generated personas/photos lower the cost of believable deception |
| **Employment / task scams** | Rising | "Easy remote work / task" lures; advance-fee and money-mule recruitment |
| **Refund / overpayment, marketplace, subscription traps** | High volume, lower per-incident | Everyday e-commerce surface; dark-pattern adjacency |
| **Charity / disaster** | Spiky (event-driven) | Hurricane-season and disaster cycles (Florida-relevant) drive bursts |
| **Sextortion / extortion** | Rising, includes minors | Social-media reach + AI-generated/altered imagery |

### 3.4 Cross-cutting accelerants

| Accelerant | Effect |
|---|---|
| **Generative AI** | Cheaper, fluent, personalized lures at scale; voice/image cloning; multilingual reach; persona maintenance — lowers attacker cost and raises believability across *every* typology. |
| **Irreversible payment rails** | Crypto, gift cards, instant P2P transfers make recovery hard, raising the value of *prevention* (ScamWatch's core). |
| **Infrastructure commoditization** | Bulk numbers/domains/kits ("fraud-as-a-service") make `Entity` churn rapid — strengthening the case for `Campaign`-level aggregation over single-`Entity` blocking. |
| **Data-breach fuel** | Leaked PII enables convincing, targeted impersonation. |

### 3.5 Requirements

| ID | Level | Requirement |
|---|---|---|
| MR-2.3.1 | MUST | Launch `Threat` coverage MUST prioritize the typologies most active in the Florida market (smishing, impersonation/grandparent, pig-butchering, tech-support, refund/overpayment, charity/disaster) — see Volume 1 §3. |
| MR-2.3.2 | MUST | The threat taxonomy MUST be treated as living and extensible (Volume 0 `NFR-0.4.1`) to track AI-driven evolution. |
| MR-2.3.3 | SHOULD | Threat-trend claims SHOULD be re-validated against current FTC/IC3/AARP/industry reporting before external use (Principle 6). |

### 3.6 Acceptance Criteria

- **AC-2.3.1** — Launch covers the Florida-priority typologies with correct `Verification` routing (cross-ref Volume 1 AC-1.3.1). (MR-2.3.1)
- **AC-2.3.2** — Adding a new AI-driven typology requires no destructive data migration. (MR-2.3.2)

### 3.7 Edge Cases

- A novel typology emerges that doesn't fit an existing top-level category — extend the taxonomy (versioned) rather than mislabeling.
- Voice-cloning blurs "impersonation" and "vishing" — model as overlapping tags, not mutually exclusive buckets.

### 3.8 Security Considerations

Documenting attacker techniques risks providing a playbook; threat content is framed for *defense and recognition*, not replication (consistent with not being a scam-baiting/attacker-engagement platform, Volume 0 ISNT-5).

### 3.9 Accessibility

Threat-education content MUST be plain-language and AA-conformant; it serves the highest-risk, often older or less-technical, users.

### 3.10 Future Expansion

A live, de-identified `Threat`/`Campaign` trend dashboard (public good) once data volume supports calibrated trend reporting (Principle 5).

---

## 4. Regulatory Landscape

### 4.1 Purpose

Survey the regulatory environment ScamWatch operates within, so the product's verification routing, data practices, and legal posture are aligned with the relevant authorities and statutes.

### 4.2 Background

ScamWatch is both *regulated* (privacy/consumer-data statutes) and *aligned-with-regulators* (it routes users to official complaint/verification channels). It is **not** an enforcement body and provides **consumer protection information, not legal advice** (charter C5).

### 4.3 Regulatory map

| Authority / regime | Relevance to ScamWatch |
|---|---|
| **FTC** (Federal Trade Commission) | Primary federal consumer-fraud authority; `reportfraud.ftc.gov` is a canonical `Verification` target; FTC Sentinel data informs sizing/trends. |
| **FBI IC3** | Internet crime complaint center; canonical `Verification` target for online fraud. |
| **CFPB** (Consumer Financial Protection Bureau) | Financial-product fraud and complaints; `Verification` routing for bank/payment-related scams. |
| **State Attorneys General** (esp. Florida AG) | State consumer-protection enforcement; key partner + `Verification` route (Volume 1 §4). |
| **FCC** | Robocall/spoofing rules (e.g., STIR/SHAKEN), telecom-channel context; relevant to vishing/smishing landscape. |
| **IRS / SSA** | Targets of impersonation scams; their official reporting channels are `Verification` routes for tax/benefits impersonation. |
| **FinCEN** | Financial-crime/SAR ecosystem; informs institutional intelligence framing (Volume 1 MON-2), not consumer flows. |
| **CCPA / CPRA (California)** | Consumer-privacy obligations ScamWatch architects toward even pre-expansion (shared context guardrails). |
| **GDPR (EU)** | Phase 3 (Global) readiness; architecture is "GDPR-ready" per shared context. |
| **Florida consumer-data / privacy statutes** | State-specific obligations acknowledged for the launch market (e.g., FL Digital Bill of Rights-style provisions); re-validate current scope at build time. |

### 4.4 Requirements

| ID | Level | Requirement |
|---|---|---|
| MR-2.4.1 | MUST | `Verification` routing MUST map each `Threat` type to the correct authority (FTC/IC3/CFPB/IRS/SSA/state AG) and be kept current (Volume 0 `FR-0.6.7`, Volume 1 BR-1.4.1). |
| MR-2.4.2 | MUST | Data practices MUST be CCPA/CPRA-aware and GDPR-ready, with Florida statutes acknowledged for launch (shared-context guardrails). |
| MR-2.4.3 | MUST | Every assessment surface MUST carry the "consumer protection information, not legal advice" disclosure (charter C5 / Volume 0 `FR-0.3.3`). |
| MR-2.4.4 | SHOULD | Regulatory mappings SHOULD be reviewed on a recurring cadence as statutes and official reporting channels change. |

### 4.5 Acceptance Criteria

- **AC-2.4.1** — Each supported `Threat` resolves to a current, correct official `Verification` route. (MR-2.4.1)
- **AC-2.4.3** — The not-legal-advice disclosure is present on all assessment surfaces. (MR-2.4.3)

### 4.6 Edge Cases

- An official reporting URL/process changes (agencies reorganize) — routing is data-driven and updatable without code change; stale routes are caught by the recurring validation (MR-2.4.4).
- A scam spans multiple jurisdictions — route to federal (FTC/IC3) plus the relevant state AG.

### 4.7 Security Considerations

Compliance with privacy regimes (CCPA/CPRA/GDPR) is operationalized in the security/privacy volume (data minimization, retention, de-identification — Volume 0 P3). This section sets the *requirement*; that volume sets the *mechanism*.

### 4.8 Accessibility

Regulatory disclosures and `Verification` handoffs MUST be perceivable to assistive technology (Volume 0 §3.8).

### 4.9 Performance

`Verification` routing is a fast, data-driven lookup and MUST NOT add meaningful latency to the verdict.

### 4.10 Future Expansion

Jurisdiction-specific routing for Phase 2 (all US states) and Phase 3 (international authorities — e.g., Action Fraud-style bodies); formal MOUs with agencies (Volume 1 §4).

---

## 5. Distribution Channels

### 5.1 Purpose

Identify how ScamWatch reaches its users — especially the highest-risk, least-digitally-native cohorts — consistent with the institution-led, trust-first GTM (Volume 1 §3, Principle 8).

### 5.2 Background

The hardest-to-reach users (older adults, recent immigrants, the bereaved) are reached through *trusted intermediaries*, not performance marketing. Distribution strategy is therefore channel-diverse and intermediary-heavy.

### 5.3 Channel map

| Channel | Reach profile | Notes |
|---|---|---|
| **Libraries** | Older adults, lower-income, less-digital | In-person workshops + trusted referral; AA + plain-language critical |
| **Senior-serving orgs (AARP, Area Agencies on Aging)** | Primary high-risk demographic | Trusted-messenger amplification (Volume 1 §4) |
| **Local news (TV/print/digital)** | Broad regional, older-skewing | Earned, education-first segments; no fearmongering (Principle 6) |
| **State AG / agency channels** | Civic-engaged consumers | Authoritative referral; co-distribution of education |
| **Financial institutions** | Account holders at point of risk | In-flow checks (enterprise API, future); fraud-prevention messaging |
| **Web / search / AI-answer surfaces** | Self-directed searchers ("is this text a scam?") | Direct, decisive-moment intent; SEO + AI-answer presence |
| **Faith & community organizations** | Tight-trust local networks | High-trust referral, esp. for immigrant/older cohorts |
| **Word-of-mouth (family caregivers)** | Adult children protecting parents | A key vector: caregivers adopt and install for relatives |

### 5.4 Requirements

| ID | Level | Requirement |
|---|---|---|
| MR-2.5.1 | SHOULD | Distribution SHOULD prioritize trusted-intermediary channels (libraries, senior orgs, local news, AG) to reach high-risk cohorts (Principle 8, Volume 1 BR-1.3.2). |
| MR-2.5.2 | MUST | Self-directed web/search surfaces MUST satisfy decisive-moment intent ("is this a scam?") with a fast, free, no-account check (Volume 0 `FR-0.1.1`/`FR-0.6.4`). |
| MR-2.5.3 | MUST NOT | Distribution MUST NOT rely on fearmongering or dark patterns (Principle 6/8, Volume 1 BR-1.5.2). |

### 5.5 Acceptance Criteria

- **AC-2.5.2** — A search-intent visitor completes a core check with no account and no payment. (MR-2.5.2)

### 5.6 Edge Cases

- A high-risk user has no smartphone/internet — the intermediary (library/senior center) becomes the access point; design for assisted/kiosk use.
- A caregiver sets up ScamWatch on a relative's behalf — flows must support proxy/assisted setup without violating the relative's privacy.

### 5.7 Security Considerations

Assisted/kiosk and caregiver flows must not persist one user's data on a shared device; favor stateless, no-account core use (Volume 0 P3/P4).

### 5.8 Accessibility

Every distribution channel terminates in an AA-conformant, plain-language surface — non-negotiable for these cohorts (Volume 0 RISK-0.8).

### 5.9 Performance

Search/AI-answer entry points lead to the latency-sensitive core check; tier-0 latency applies (Volume 0 §1.9).

### 5.10 Future Expansion

Presence in AI-assistant answers and OS/mailbox-level scam checks (partnership-driven); SMS/short-code-based check for the phone-only cohort.

---

## 6. Unmet Needs ScamWatch Fills

### 6.1 Purpose

State, explicitly and defensibly, the needs no current tool meets — the negative space that justifies building ScamWatch.

### 6.2 Background

Each unmet need maps to a Volume 0 capability and a charter principle, so the market gap and the product design are traceably linked.

### 6.3 Unmet-needs table

| ID | Unmet need | Why unmet today | ScamWatch capability (Vol 0) |
|---|---|---|---|
| UN-1 | A **free, pre-incident check at the decisive moment** | Official tools are post-incident intake; commercial tools are paid/channel-specific | Free core decisive-moment check (`FR-0.1.1`, `FR-0.6.4`) |
| UN-2 | **Calibrated, explained** verdicts (not opaque scores or naked blocks) | Caller-ID/blockers give opaque scores; crowd trackers give uncalibrated narratives | `Explanation` + `Confidence` on every verdict (`FR-0.2.1`, P5/P6) |
| UN-3 | **Multi-channel** coverage in one place | Tools are siloed by channel (phone vs. URL vs. email) | All six channels (`FR-0.1.2`) |
| UN-4 | **Aggregate `Campaign` context** a consumer can't self-provision | No consumer-facing access to cross-report correlation | `Report`→`Entity`→`Campaign` correlation surfaced in plain language (`FR-0.2.2`) |
| UN-5 | **Trauma-aware, no-blame** treatment of victims | Most tools ignore the emotional reality; some imply user fault | Victim-respect copy + support routing (P2, `FR-0.6.2`) |
| UN-6 | **Routing to the *right* official channel** | Users don't know whether to call FTC, IC3, IRS, SSA, or the AG | `Verification` routing per `Threat` (`FR-0.6.7`, MR-2.4.1) |
| UN-7 | A **public-benefit, no-data-sale** option | Commercial tools monetize data/attention | Charter C1/C2; free core, no sale |
| UN-8 | **Accessible, plain-language** protection for high-risk cohorts | Tools assume tech-literacy/English fluency | AA baseline + plain language (Vol 0 §1.8, RISK-0.8) |

### 6.4 Requirements

| ID | Level | Requirement |
|---|---|---|
| MR-2.6.1 | MUST | Each unmet need UN-1…UN-8 MUST trace to a delivered Volume 0 capability before ScamWatch claims to fill it (no aspirational claims; Principle 6). |
| MR-2.6.2 | SHOULD | Positioning SHOULD lead with the unmet needs (gaps), not competitor disparagement (MR-2.2.3). |

### 6.5 Acceptance Criteria

- **AC-2.6.1** — Each UN-x is linked to an implemented, testable Volume 0 requirement before being used in external positioning. (MR-2.6.1)

### 6.6 Edge Cases

- A competitor closes one gap (e.g., adds a free check) — ScamWatch's differentiation rests on the *combination* (UN-1…UN-8 together) plus the trust/data/relationship moat (Volume 1 §6), not any single feature.

### 6.7 Security Considerations

UN-4 (surfacing `Campaign` context) MUST be delivered without leaking reporter/victim identity (Volume 0 P3, RISK-0.3).

### 6.8 Accessibility

UN-8 *is* an accessibility commitment; it is release-gating, not optional (Volume 0 RISK-0.8).

### 6.9 Performance

UN-1/UN-2 are delivered at the decisive moment; tier-0 latency applies.

### 6.10 Future Expansion

As ScamWatch matures, UN-4's aggregate intelligence becomes a public good (de-identified trend reporting) and an institutional product (Volume 1 MON-2) — the unmet consumer need and the sustainability path converge.

---

> **For the coordinator:** This volume keeps all figures explicitly directional/illustrative and gates external use behind re-validation (`MR-2.1.4`). It assumes: (a) Volume 0 fixes the problem shape, capabilities, and charter; (b) Volume 1 owns GTM, partnerships, and monetization (this volume informs them but does not duplicate dollar-level institutional sizing); (c) a security/privacy volume operationalizes the CCPA/CPRA/GDPR requirements named in §4. No hard numbers from this volume should be promoted to "fact" without the §1.5 sourcing checklist.

*End of Volume 2 — Market Research.*
