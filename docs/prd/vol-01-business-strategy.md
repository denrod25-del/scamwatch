# Volume 1 — Business Strategy

> **Project Sentinel · ScamWatch master PRD**
> Tagline: *Know Before You Click™*

This volume defines how ScamWatch sustains itself as a public-benefit platform without compromising the charter established in **Volume 0 — Executive Vision** (§3). It covers the sustainability/monetization model and its guardrails, governance, the Florida go-to-market, partnership strategy, the trust-before-growth growth model, defensibility, organizational and volunteer structure, funding phases, business risks and mitigations, and the single north-star business metric. Every monetization or growth idea here is written to be **non-violating of charter clauses C1–C6** (Volume 0 §3.3); where a path would risk a clause, it is explicitly fenced.

Requirement ID prefix for this volume: `BR-1.<section>.<n>`. This volume references Volume 0 requirements (`FR-0.*`, `NFR-0.*`) and charter clauses (`C1`–`C6`) directly.

---

## Table of Contents

1. [Public-Benefit & Sustainability Model](#1-public-benefit--sustainability-model)
2. [Governance Model (Constitution / Charter)](#2-governance-model-constitution--charter)
3. [Go-To-Market — Florida Launch](#3-go-to-market--florida-launch)
4. [Partnership Strategy](#4-partnership-strategy)
5. [Trust-Before-Growth Growth Model](#5-trust-before-growth-growth-model)
6. [Defensibility / Moat](#6-defensibility--moat)
7. [Organizational & Volunteer Structure](#7-organizational--volunteer-structure)
8. [Funding Phases](#8-funding-phases)
9. [Key Business Risks & Mitigations](#9-key-business-risks--mitigations)
10. [North-Star Business Metric](#10-north-star-business-metric)

---

## 1. Public-Benefit & Sustainability Model

### 1.1 Purpose

Define how ScamWatch funds its operations and long-term survival (Volume 0 §4, 100-year vision) while guaranteeing the protective core stays free and user data is never sold.

### 1.2 Background

The model is **free protective core, funded from the edges.** The center — education + the decisive-moment check (Volume 0 IS-2/IS-3, charter C1) — is permanently free and never monetized. Sustainability comes from value created *around* the core that institutions and funders will pay for, none of which requires selling, re-identifying, or paywalling consumer data or the core check.

### 1.3 Revenue / sustainability paths

Each path is graded against the charter. "Allowed" means architecturally fenced so it cannot weaken C1/C2 for consumers (Volume 0 §3.6).

| ID | Path | Description | Charter status | Guardrail |
|---|---|---|---|---|
| MON-1 | **Grants & philanthropy** | Public-interest, consumer-protection, aging-services, and anti-fraud foundation grants; government/agency program grants. | Allowed (primary early) | No grant may attach strings that violate C1–C6 or compromise calibration/transparency. |
| MON-2 | **Anonymized threat intelligence for institutions** | De-identified, aggregate `Threat`/`Campaign`/`Entity`-pattern feeds for banks, telecoms, agencies (e.g., "this toll-smishing kit is active in these area codes"). | Allowed **only** if fully de-identified | Must contain no user PII and no reporter identity (Volume 0 `FR-0.6.3`, C2). Institutional, not consumer, data. Never reverse-engineerable to an individual. |
| MON-3 | **Enterprise verification API** | Paid API for institutions (banks, marketplaces, escrow) to check an `Entity` against ScamWatch intelligence in their own flows. | Allowed | Consumer core stays free (C1); API serves institutions, not by degrading consumer access; rate/abuse controls. |
| MON-4 | **Enterprise / white-label deployments** | Branded ScamWatch surfaces for credit unions, libraries, AARP-style orgs, employers. | Allowed | Must preserve free consumer core and not sell data. |
| MON-5 | **Donations / membership** | Individual recurring support; optional "supporter" tier with **no** gating of protective features. | Allowed | Supporter tier MAY add convenience/cosmetic value but MUST NOT gate any protective feature (C1). |
| MON-6 | **Training / certification** | Paid fraud-awareness training for institutions and professionals (built on the free education core). | Allowed | Free education core remains free; paid layer is depth/credentialing for orgs. |
| MON-X1 | **Selling user data / ad targeting** | — | **PROHIBITED** | Categorically banned by C2 / Volume 0 ISNT-3. |
| MON-X2 | **Paywalling the protective core** | — | **PROHIBITED** | Banned by C1. |
| MON-X3 | **Re-identifiable "leads" from victims** | — | **PROHIBITED** | Banned by C2/C3; predatory toward victims (P2). |

### 1.4 Requirements

| ID | Level | Requirement |
|---|---|---|
| BR-1.1.1 | MUST | The protective core MUST remain free and never gated by any monetization path (enforces C1 / `FR-0.6.4`). |
| BR-1.1.2 | MUST | Any institutional intelligence product (MON-2) MUST be fully de-identified and MUST NOT contain user PII or reporter identity (enforces C2 / `FR-0.6.3`). |
| BR-1.1.3 | MUST NOT | The organization MUST NOT sell user data or build ad-targeting/lead products from user data (MON-X1, MON-X3). |
| BR-1.1.4 | SHOULD | Early-stage funding SHOULD prioritize grants/philanthropy (MON-1) to avoid commercial pressure on the charter during the trust-building phase. |
| BR-1.1.5 | MUST | Each enterprise product (MON-3/MON-4) MUST be architected so its removal would not affect consumer core availability. |

### 1.5 Acceptance Criteria

- **AC-1.1.1** — A charter-gate test confirms no monetization toggle can disable or paywall the consumer core. (BR-1.1.1)
- **AC-1.1.2** — A data-export audit of any MON-2 feed shows zero user-identifiable fields. (BR-1.1.2)

### 1.6 Edge Cases

- A grantor requests exclusive or embargoed access to threat data that would undermine the free public good — declined or scoped to non-core institutional value only.
- An enterprise customer requests raw (non-aggregated) reporter data — refused under C2 regardless of price.

### 1.7 Security Considerations

MON-2 is the highest-risk path: aggregate feeds can leak identity through small-cohort inference. Apply k-anonymity / minimum-cohort thresholds and differential-privacy-style noise where cohorts are small (specified in the security/data volumes). The non-sale posture (C2) also minimizes breach value.

### 1.8 Accessibility

Donation/membership and any paid flows MUST meet WCAG 2.2 AA (Volume 0 §1.8) — paid does not mean exempt.

### 1.9 Performance

Enterprise API (MON-3) traffic MUST be isolated (rate limits, separate quotas) so institutional load cannot degrade the consumer core's tier-0 latency (Volume 0 §1.9).

### 1.10 Future Expansion

A formal public-benefit corporation or non-profit entity, an endowment to fund the 100-year horizon, and consortium-funded shared intelligence (opt-in, de-identified) across institutions.

---

## 2. Governance Model (Constitution / Charter)

### 2.1 Purpose

Summarize how ScamWatch is governed so that the charter survives leadership changes, funding pressure, and growth — i.e., make the principles institutionally durable, not personality-dependent.

### 2.2 Background

The constitution = the charter clauses C1–C6 (Volume 0 §3.3) + the nine product principles (Volume 0 §6). Governance exists to (a) enforce these as binding constraints, (b) adjudicate edge cases (e.g., defamation, principle conflicts), and (c) keep the organization accountable through transparency (P5).

### 2.3 Governance bodies (summary)

| Body | Role |
|---|---|
| **Charter/Ethics board** | Guards C1–C6 and the principles; reviews monetization and partnership decisions for charter compatibility; has veto over charter-violating changes. Independent voices included over time. |
| **Moderation/Trust function** | Operates the moderation + confidence + takedown/appeal flow (Volume 0 C3, RISK-0.2); staffed by `moderator`/`analyst` roles. |
| **Transparency function** | Produces periodic transparency reports (P5): calibration, moderation actions, takedown/appeal stats, data practices. |
| **Engineering/Product leadership** | Builds to the PRD; each feature carries a harm-prevention hypothesis (`FR-0.6.9`) and passes charter release gates (`NFR-0.3.1`). |

### 2.4 Requirements

| ID | Level | Requirement |
|---|---|---|
| BR-1.2.1 | MUST | Charter clauses C1–C6 MUST be encoded as automated release gates (restates `NFR-0.3.1`) and reviewed by the Charter/Ethics board for changes that gates can't catch. |
| BR-1.2.2 | MUST | A transparency report MUST be published on a defined recurring cadence covering calibration, moderation, and data practices (P5). |
| BR-1.2.3 | SHOULD | The Charter/Ethics board SHOULD include at least one independent (non-staff) member before US (Phase 2) expansion. |
| BR-1.2.4 | MUST | A documented appeal path MUST exist for any entity/individual affected by a published assessment (supports C3, RISK-0.2). |

### 2.5 Acceptance Criteria

- **AC-1.2.1** — A scheduled, published transparency report exists with calibration + moderation sections. (BR-1.2.2)
- **AC-1.2.4** — An appeal can be filed and tracked to resolution with SLA. (BR-1.2.4)

### 2.6 Edge Cases

- Founder/leadership pressure to relax the charter for a lucrative deal — the board's veto and the automated gates make this hard to do silently; any change is logged and reportable.

### 2.7 Security Considerations

Appeal and takedown flows are abuse vectors (attackers filing appeals to scrub their infrastructure). Require evidence, rate-limit, and log; balance against legitimate misidentification (Volume 0 §5.6).

### 2.8 Accessibility

Appeal and transparency surfaces MUST meet AA.

### 2.9 Performance

Governance processes are human-timescale; their tooling MUST NOT block runtime consumer paths.

### 2.10 Future Expansion

Conversion to a chartered public-benefit legal entity; third-party charter audits; an external advisory council of consumer-protection orgs.

---

## 3. Go-To-Market — Florida Launch

### 3.1 Purpose

Define the launch motion for the Florida market (Volume 0 / shared context: Florida → US → Global), chosen because Florida concentrates the highest-risk, highest-targeted populations and active state-level consumer-protection institutions.

### 3.2 Background

Florida is a deliberate beachhead: a very large retiree population (a primary scam-target demographic), high reported fraud exposure, an active state Attorney General consumer-protection apparatus, dense library and senior-services networks, and strong local-news ecosystems. The GTM is **institution-led and trust-first**, not paid-acquisition-led — consistent with P8 (build trust before growth).

> **Calibration note.** Market-sizing figures (retiree population, Florida fraud losses) are in **Volume 2 — Market Research** and labeled as estimates where public data is incomplete.

### 3.3 Launch motion

| Stage | Motion |
|---|---|
| **Pre-launch** | Stand up the free core + education for the top Florida-relevant `Threat` typologies (toll smishing, grandparent/impersonation, romance/pig-butchering, tech-support, refund/overpayment). Establish initial official-org `Verification` routing (FL AG, FTC, IC3, CFPB, SSA, IRS). |
| **Anchor partners** | Recruit a small number of trusted local anchors first: a public library system, a senior-services org / AARP chapter, and a local news outlet (see §4). Trust transfers from them to us. |
| **Community intake** | Encourage `Report` submission through anchor channels to seed `Entity`/`Campaign` signal in-state. |
| **Earned distribution** | Local news segments, library workshops, senior-center sessions — education-first, no fearmongering (P6). |
| **Measure trust** | Track calibration and trust-health (Volume 0 §7) before any broader push; do not scale ahead of trust (P8). |

### 3.4 Requirements

| ID | Level | Requirement |
|---|---|---|
| BR-1.3.1 | MUST | Launch MUST cover the Florida-priority `Threat` typologies with correct official-org `Verification` routing before public promotion. |
| BR-1.3.2 | SHOULD | GTM SHOULD be institution-led (libraries, senior services, local news, state AG) rather than paid-acquisition-led at launch. |
| BR-1.3.3 | MUST | All launch education materials MUST pass the victim-respect lint and the not-legal-advice disclosure (`FR-0.6.2`, `FR-0.3.3`). |
| BR-1.3.4 | SHOULD | Florida-specific consumer statutes and the FL AG reporting path SHOULD be reflected in the `Verification` routing. |

### 3.5 Acceptance Criteria

- **AC-1.3.1** — Each Florida-priority typology resolves to a correct, working official `Verification` link. (BR-1.3.1, BR-1.3.4)
- **AC-1.3.3** — All launch copy passes CI victim-respect + disclosure checks. (BR-1.3.3)

### 3.6 Edge Cases

- A scam typology spikes that wasn't in the launch set — the taxonomy is extensible (`NFR-0.4.1`); add it without a destructive migration.
- An anchor partner's audience skews to a channel (e.g., phone) the product handles less well — prioritize quality on that channel before promoting to that audience.

### 3.7 Security Considerations

A public launch invites adversarial `Report` flooding (RISK-0.4). Have moderation and abuse-detection live before promotion, not after.

### 3.8 Accessibility

Launch surfaces serve a high proportion of older adults and assistive-tech users; AA conformance and plain-language are launch-blocking (Volume 0 RISK-0.8).

### 3.9 Performance

Anticipate bursty traffic around news segments; the consumer core MUST hold tier-0 latency under launch-event spikes.

### 3.10 Future Expansion

Phase 2 (US): replicate the institution-led playbook state-by-state, leading with state AG + library + senior-services anchors. Phase 3 (Global): i18n + jurisdiction-specific `Verification` routing.

---

## 4. Partnership Strategy

### 4.1 Purpose

Define which institutions to partner with, in what order, and why each accelerates trust, distribution, and intelligence without compromising the charter.

### 4.2 Background

Partnerships do double duty: they **transfer trust** to a new platform and they **improve intelligence and verification** (official-org routing, threat signal). The public-benefit posture (Volume 0 §2.2 clause 4) is precisely what makes these partners willing to engage where they would refuse a data broker.

### 4.3 Partnership map

| Partner type | Examples | Value to ScamWatch | Value to partner |
|---|---|---|---|
| **State AG (consumer protection)** | Florida AG office | Authoritative `Verification` routing; credibility; in-state reach | Better-informed, less-victimized constituents; structured report funneling |
| **Federal agencies** | FTC (`reportfraud`), FBI IC3, CFPB, IRS, SSA, FCC | Canonical `Verification` targets; alignment with official reporting | Upstream consumer education; cleaner report intake |
| **Financial institutions** | Banks, credit unions | Enterprise verification API (MON-3); de-identified threat feed (MON-2) | Fewer authorized-push-payment losses; real-time `Entity` checks |
| **Senior-serving orgs** | AARP and chapters, Area Agencies on Aging | Access to highest-risk demographic; trusted messenger | Member protection; turnkey education |
| **Libraries** | Public library systems | Trusted, accessible, in-person distribution; digital-literacy programming | Patron protection; programming content |
| **Local news** | TV/print/digital outlets | Earned, education-first distribution | Public-service content; recurring "scam of the week" segments |
| **Telecoms / email providers** | Carriers, mailbox providers | Channel signal; potential inline warnings (future) | Reduced fraud on their networks |

### 4.4 Requirements

| ID | Level | Requirement |
|---|---|---|
| BR-1.4.1 | MUST | Official-org partnerships MUST be reflected as accurate `Verification` routing (`FR-0.6.7`), and routing MUST be kept current. |
| BR-1.4.2 | MUST | Any data shared with financial/telecom partners MUST be de-identified aggregate intelligence only (BR-1.1.2 / C2). |
| BR-1.4.3 | SHOULD | Partnership sequencing SHOULD lead with trusted-messenger partners (libraries, senior orgs, local news, state AG) before commercial ones. |
| BR-1.4.4 | MUST | No partnership MAY require weakening any charter clause or principle. |

### 4.5 Acceptance Criteria

- **AC-1.4.1** — `Verification` links for each official partner are validated on a recurring cadence. (BR-1.4.1)
- **AC-1.4.2** — Any partner data feed passes the de-identification audit. (BR-1.4.2)

### 4.6 Edge Cases

- An agency wants ScamWatch to host its branding in a way that implies official endorsement of specific verdicts — keep our calibrated/independent stance; partners are `Verification` authorities, not co-signers of our `Confidence` scores.

### 4.7 Security Considerations

Partner integrations expand the attack surface (API keys, data egress). Treat partner endpoints as untrusted; least-privilege; audit egress for PII (C2).

### 4.8 Accessibility

Co-branded surfaces inherit our AA contract.

### 4.9 Performance

Partner verification-API load is isolated from the consumer core (§1.9).

### 4.10 Future Expansion

Inline carrier/mailbox warnings; cross-institution consortium intelligence; international official-org routing for Phase 3.

---

## 5. Trust-Before-Growth Growth Model

### 5.1 Purpose

Operationalize Principle 8: growth is *gated on trust*, not pursued at its expense. Define how the organization grows without dark patterns or trust-eroding tactics.

### 5.2 Background

The growth loop is: **help one person well → they tell a trusted other / an institution amplifies → more `Report`s → better `Campaign`/`Threat` intelligence → better help.** This is a quality-compounding loop, not a paid-acquisition funnel. Trust-health metrics (Volume 0 §7.3) act as guardrails: if trust degrades, growth is throttled.

### 5.3 Growth mechanics (allowed) vs. anti-patterns (banned)

| Allowed | Banned (anti-pattern) |
|---|---|
| Word-of-mouth via genuinely useful checks | Fear-driven viral hooks / fearmongering (violates P6) |
| Institutional amplification (libraries, news, AARP) | Mandatory account creation to see a result (violates C1/P4) |
| Optional, non-gated sharing of an `Explanation` | Dark-pattern referral nags / guilt prompts |
| Shareable, de-identified education content | Selling/renting user contact lists (violates C2) |
| Opt-in `Report` contribution | Auto-enrolling users into data sharing |

### 5.4 Requirements

| ID | Level | Requirement |
|---|---|---|
| BR-1.5.1 | MUST | Growth/marketing features MUST declare trust-health guardrail metrics that halt the tactic if breached (restates `NFR-0.7.3`, `FR-0.6.8`). |
| BR-1.5.2 | MUST NOT | Growth features MUST NOT use fearmongering, mandatory accounts for the core, or dark-pattern referral mechanics. |
| BR-1.5.3 | SHOULD | Sharing features SHOULD share de-identified content only and SHOULD be opt-in. |

### 5.5 Acceptance Criteria

- **AC-1.5.1** — Each growth experiment specifies guardrail metrics and an auto-halt threshold. (BR-1.5.1)
- **AC-1.5.2** — Copy/flow review confirms no fearmongering or forced-account gating in growth surfaces. (BR-1.5.2)

### 5.6 Edge Cases

- A high-performing growth tactic also slightly raises complaint rate — guardrail breach halts it regardless of reach gains (trust wins, P8).

### 5.7 Security Considerations

Referral/sharing mechanics MUST NOT leak reporter or victim identity (C2/C3).

### 5.8 Accessibility

Share and onboarding flows meet AA; plain-language for high-risk demographics.

### 5.9 Performance

Sharing/virality features MUST NOT degrade the core check's latency.

### 5.10 Future Expansion

Institution-driven "protect your members" programs; opt-in alerting for `Campaign`s relevant to a user's area (privacy-preserving).

---

## 6. Defensibility / Moat

### 6.1 Purpose

State why ScamWatch is durable against competitors and copycats.

### 6.2 Background — the moat is trust, compounded by data and relationships

| Moat layer | Description | Why hard to copy |
|---|---|---|
| **Trust** (primary) | Calibrated, transparent, victim-respecting, non-commercial posture. | Trust is earned over years and destroyed in one visible mistake (RISK-0.9); a data-broker competitor structurally can't claim it. |
| **Aggregated intelligence** | The accumulating corpus of `Report`s → `Entity`s → `Campaign`s. | Network/data effects: more reports → better correlation → better help → more reports. |
| **Official-org relationships** | Verification routing + partnerships with AGs/agencies/institutions. | Relationship capital that a public-benefit posture (C1/C2) uniquely unlocks. |
| **Explainability quality** | Calibrated, plain-language `Explanation`s that teach. | Hard to match without the same principle discipline and calibration measurement. |
| **Public-benefit charter** | Categorical no-sale/free-core stance. | A for-profit data business cannot adopt it without breaking its own model. |

### 6.3 Requirements

| ID | Level | Requirement |
|---|---|---|
| BR-1.6.1 | MUST | Calibration and transparency (the trust moat) MUST be continuously measured and published (P5 / `NFR-0.7.1`). |
| BR-1.6.2 | SHOULD | The data-network effect SHOULD be reinforced by making opt-in `Report` contribution low-friction and respectful (P2). |

### 6.4 Acceptance Criteria

- **AC-1.6.1** — Published calibration metrics demonstrate the trust moat is real and improving. (BR-1.6.1)

### 6.5 Edge Cases

- A well-funded competitor copies the UI — they cannot copy the accumulated trust, data corpus, or official relationships quickly; defend by deepening all three, not by feature-racing.

### 6.6 Security Considerations

The data corpus is also a liability if breached; de-identification (P3) protects the moat from becoming a breach catastrophe.

### 6.7 Accessibility

Accessibility breadth is itself defensible: serving the highest-risk users well is something commercial suites under-invest in.

### 6.8 Performance

A fast, reliable core check reinforces trust; performance is a moat input, not just an SLO.

### 6.9 Future Expansion

Schema standardization (Volume 0 §4.9) could make ScamWatch the reference vocabulary others build on — a standards-level moat.

---

## 7. Organizational & Volunteer Structure

### 7.1 Purpose

Describe the human structure that operates ScamWatch, including the volunteer/community contributor model that scales intelligence and moderation cost-effectively while protecting quality.

### 7.2 Background

A public-benefit platform scales partly through community: contributors submit and enrich `Report`s; trained volunteers assist moderation; analysts curate `Threat`/`Campaign` quality. Roles map to the Supabase Auth roles in the shared context (`anonymous`, `member`, `contributor`, `moderator`, `analyst`, `admin`).

### 7.3 Role → function map

| Role | Function |
|---|---|
| `anonymous` | Uses the free core check; may submit a `Report` without an account. |
| `member` | Registered user; can track their own reports, save education. |
| `contributor` | Trusted community member who enriches/triages `Report`s; higher submission weight. |
| `moderator` | Reviews flagged content, runs takedown/appeal flow (C3, RISK-0.2). |
| `analyst` | Curates `Threat` taxonomy and `Campaign` correlation quality; calibration review. |
| `admin` | Platform/operations administration; charter-gate ownership. |

### 7.4 Requirements

| ID | Level | Requirement |
|---|---|---|
| BR-1.7.1 | MUST | Community contribution MUST be weightable so that trust level (`contributor` vs. `anonymous`) influences signal, mitigating poisoning (RISK-0.4). |
| BR-1.7.2 | MUST | Moderators/analysts MUST operate under documented guidelines consistent with the charter (victim-respect, defamation, calibration). |
| BR-1.7.3 | SHOULD | Volunteer onboarding SHOULD include trauma-aware and calibration training. |

### 7.5 Acceptance Criteria

- **AC-1.7.1** — Submission weighting reflects contributor trust level in correlation/scoring. (BR-1.7.1)
- **AC-1.7.2** — Moderation guideline documents exist and map to charter clauses. (BR-1.7.2)

### 7.6 Edge Cases

- A trusted `contributor` account is compromised and used to poison signal — role-level abuse detection and revocation; weighting alone is insufficient.

### 7.7 Security Considerations

Elevated roles (`moderator`/`analyst`/`admin`) are high-value targets; require strong auth (MFA), least privilege, and audit logging (security volume).

### 7.8 Accessibility

Contributor/moderator tooling MUST also meet AA — volunteers include people with disabilities.

### 7.9 Performance

Moderation queues and analyst tooling MUST not be on the consumer-core hot path.

### 7.10 Future Expansion

Regional volunteer chapters (mirroring the state-by-state Phase 2 rollout); contributor reputation systems; paid analyst staff as funding grows.

---

## 8. Funding Phases

### 8.1 Purpose

Sequence funding to match the trust-before-growth model: grant/philanthropy-first to protect the charter during the trust-building era, with commercial sustainability paths maturing only after trust is established.

### 8.2 Background

Funding sequencing is a charter-protection mechanism. Taking commercial money too early creates pressure toward MON-X paths. Grants/philanthropy (MON-1) carry fewer charter-eroding incentives and are prioritized early (BR-1.1.4).

### 8.3 Phase plan

| Phase | Market (Vol 0) | Primary funding | Notes |
|---|---|---|---|
| **Phase 0 — Seed/Build** | Pre-Florida | Founder/seed + early grants (MON-1) | Build free core; no commercial deals that pressure the charter. |
| **Phase 1 — Florida launch** | Florida | Grants/philanthropy (MON-1); donations (MON-5) | Prove calibration + trust at small scale; institution-led GTM. |
| **Phase 2 — US expansion** | United States | Grants + enterprise verification API (MON-3) + de-identified intel (MON-2) | Commercial paths mature *after* trust established; all fenced by C1/C2. |
| **Phase 3 — Global / durability** | Global | Diversified: grants, enterprise, training (MON-6), white-label (MON-4), endowment | Aim for funding diversity so no single source can capture the charter (Vol 0 §4). |

### 8.4 Requirements

| ID | Level | Requirement |
|---|---|---|
| BR-1.8.1 | MUST | Early phases (0–1) MUST prioritize non-commercial funding to protect the charter during trust-building (BR-1.1.4). |
| BR-1.8.2 | SHOULD | By Phase 3, funding SHOULD be diversified so no single source exceeds a governance-defined dependency threshold (durability, Vol 0 §4). |
| BR-1.8.3 | MUST | No funding agreement MAY include terms that violate any charter clause (BR-1.4.4 generalized). |

### 8.5 Acceptance Criteria

- **AC-1.8.3** — Funding agreements are reviewed by the Charter/Ethics board for charter compatibility before acceptance. (BR-1.8.3)

### 8.6 Edge Cases

- A large, charter-neutral grant arrives early and could accelerate Phase 2 — acceptable if it carries no charter-eroding strings and doesn't force growth ahead of trust (P8).

### 8.7 Security Considerations

Funding-source concentration is a continuity risk (a single funder withdrawing). Diversification (BR-1.8.2) is both a governance and a resilience control.

### 8.8 Accessibility

N/A (internal).

### 8.9 Performance

N/A (internal).

### 8.10 Future Expansion

Endowment model for 100-year durability; consortium funding from financial institutions for shared (de-identified) intelligence.

---

## 9. Key Business Risks & Mitigations

### 9.1 Purpose

Enumerate the business-level risks (complementing the product/architecture risks in Volume 0 §8) and their mitigations.

### 9.2 Business risk register

| ID | Risk | Impact | Mitigation |
|---|---|---|---|
| BRISK-1 | **Mission drift / charter erosion under funding pressure** | Severe | Grant-first sequencing (BR-1.8.1); charter gates (BR-1.2.1); board veto (§2.3). |
| BRISK-2 | **Trust collapse from a visible mistake** (false positive, misidentification) | Severe | Calibration + transparency (BR-1.6.1); fast appeal/correction (BR-1.2.4); conservative high-stakes verdicts (Vol 0 RISK-0.1/0.9). |
| BRISK-3 | **Funding shortfall / over-reliance on one source** | High | Diversified sustainability paths (§1.3); diversification target (BR-1.8.2). |
| BRISK-4 | **Legal exposure (defamation)** | Severe | Patterns-not-individuals (C3); moderation + appeal (BR-1.2.4); not-legal-advice posture (C5). |
| BRISK-5 | **Partner dependency / co-option** | Medium | No partnership weakens the charter (BR-1.4.4); independence of `Confidence` scoring (§4.6). |
| BRISK-6 | **Adversarial manipulation of community signal** | High | Contributor weighting (BR-1.7.1); moderation; abuse detection (Vol 0 RISK-0.4). |
| BRISK-7 | **Regulatory change** (privacy/consumer statutes) | Medium | GDPR-ready, CCPA/CPRA-aware architecture (shared context); FL statutes acknowledged (BR-1.3.4). |
| BRISK-8 | **Competitor with more capital** | Medium | Trust/data/relationship moat (§6); public-benefit charter is structurally non-copyable by data-broker competitors. |

### 9.3 Requirements

| ID | Level | Requirement |
|---|---|---|
| BR-1.9.1 | MUST | Each BRISK MUST have an owned mitigation traceable to a `BR-`/charter clause. |
| BR-1.9.2 | SHOULD | The business risk register SHOULD be reviewed by governance on a recurring cadence. |

### 9.4 Acceptance Criteria

- **AC-1.9.1** — Every BRISK row references a concrete mitigation. (BR-1.9.1)

### 9.5 Edge Cases

- A new regulatory regime bans even de-identified intelligence sharing — fall back to grant/donation funding (MON-1/MON-5); the free core is unaffected.

### 9.6 Security Considerations

BRISK-4 and BRISK-6 are the business-facing reflections of Volume 0 RISK-0.2 and RISK-0.4; keep mitigations consistent across volumes.

### 9.7 Accessibility

N/A (internal register), though BRISK-2 mitigations (appeals) are user-facing and AA-bound.

### 9.8 Performance

N/A.

### 9.9 Future Expansion

External, periodic risk review with consumer-protection partners.

---

## 10. North-Star Business Metric

### 10.1 Purpose

Define the single north-star business metric that, by construction, cannot be maximized by violating the charter — so that optimizing it pulls the organization toward its mission.

### 10.2 Background

A naive north star (users, revenue) would reward charter violations (sell data, paywall, fearmonger). ScamWatch's north star must reward *trusted harm prevention*.

> **North-star business metric:** **Trusted protective actions delivered** — the count of decisive-moment checks/education interactions that (a) delivered a calibrated, explained outcome with an official-verification handoff, **and** (b) occurred while trust-health guardrails (Volume 0 §7.3: calibration, complaint rate, victim-respect, appeal turnaround) were in-band.

This metric is deliberately **gated by trust-health**: protective actions delivered while trust-health is out of band do not count. Growth therefore cannot be bought by eroding trust — the denominator of quality is built into the numerator.

### 10.3 Requirements

| ID | Level | Requirement |
|---|---|---|
| BR-1.10.1 | MUST | The north-star metric MUST only count protective actions delivered while trust-health guardrails are in-band (`NFR-0.7.3`). |
| BR-1.10.2 | MUST | Each protective action counted MUST have included an `Explanation`, `Confidence`, and `Verification` (Vol 0 `FR-0.2.1`–`FR-0.2.3`). |
| BR-1.10.3 | SHOULD | The north-star metric SHOULD be reported alongside the harm-prevention proxy (`NFR-0.7.2`) and calibration (`NFR-0.7.1`) for honesty (P6). |

### 10.4 Acceptance Criteria

- **AC-1.10.1** — Protective actions occurring during a trust-health breach window are excluded from the north-star count. (BR-1.10.1)
- **AC-1.10.2** — Sampling confirms every counted action carried explanation + confidence + verification. (BR-1.10.2)

### 10.5 Edge Cases

- A spike in protective actions coincides with a calibration regression — the metric self-corrects by excluding the out-of-band period, signaling "fix trust, not chase volume."

### 10.6 Security Considerations

Counting MUST use de-identified/aggregate measurement (P3); the north star MUST NOT require per-user tracking that violates privacy.

### 10.7 Accessibility

N/A (metric definition).

### 10.8 Performance

Metric computation is offline/aggregate and MUST NOT affect the consumer core's latency.

### 10.9 Future Expansion

Independent validation of the harm-prevention component; per-typology and per-region breakdowns to guide Phase 2/3 prioritization.

---

> **For the coordinator:** This volume assumes (a) the charter clauses C1–C6 and principles P1–P9 are defined in Volume 0 §3/§6 and treated as binding; (b) trust-health metrics and the success frame are defined in Volume 0 §7; (c) a security/privacy volume specifies de-identification, k-anonymity, and retention; (d) a moderation/trust volume specifies the takedown/appeal flow referenced in §2 and §9. Monetization paths MON-2/MON-3 depend on the data/security volumes for de-identification guarantees.

*End of Volume 1 — Business Strategy.*
