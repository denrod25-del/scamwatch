# Volume 3 — User Personas

> **Abstract.** This volume defines the human beings ScamWatch ("Project Sentinel") is built for. It specifies eleven well-developed personas spanning the real ScamWatch audience — from an at-risk Florida retiree to an institutional fraud analyst — and treats each as a design contract, not a marketing sketch. Every persona carries an explicit accessibility profile (vision, motor, cognitive, language), because WCAG 2.2 AA is a contractual baseline (see Volume 2 — Shared Context, and the Accessibility sub-headings throughout). Personas are written to be trauma-aware and victim-respecting: the recent-victim persona in particular drives non-negotiable "no blame, no shame" requirements that ripple into copy, flows, and data handling. The volume closes with a persona-to-feature matrix and a numbered requirement set (`PER-3.*`) so that downstream volumes — especially Volume 4 — User Journeys, Volume 5 — Information Architecture, and Volume 11 — Accessibility — can reference personas by stable ID rather than by prose.

---

## Table of Contents

1. Purpose
2. Background
3. How to Read a Persona
4. The Personas
   - 4.1 P1 — Margaret "Marg" Whitfield (At-Risk Older Adult / Florida Retiree)
   - 4.2 P2 — Daniel Okonkwo (Recent / Current Victim)
   - 4.3 P3 — Priya Nair (Caregiver / Adult Child)
   - 4.4 P4 — Marcus Bell (Skeptical Verifier — "Is this real?")
   - 4.5 P5 — Rosa Delgado (Small-Business Owner / BEC & Invoice Fraud Target)
   - 4.6 P6 — Tyler Hammond (Contributor / Reporter)
   - 4.7 P7 — Aisha Rahman (Volunteer Moderator)
   - 4.8 P8 — Karen Liu (Institutional / Analyst — AG Office / Bank Fraud Team)
   - 4.9 P9 — Hông Tran (Low-Digital-Literacy / ESL User)
   - 4.10 P10 — Sam Reyes (Journalist / Researcher)
   - 4.11 P11 — Eddie Foster (Caregiving-Distance Family + Power-of-Attorney Edge)
5. Persona-to-Feature Matrix
6. Requirements (`PER-3.*`)
7. Acceptance Criteria
8. Edge Cases
9. Security Considerations
10. Accessibility
11. Performance
12. Future Expansion

---

## 1. Purpose

This volume exists so that every other ScamWatch volume can design *for a named human with a named need* rather than for an abstract "user." It converts the Product Principles (Volume 2 — Shared Context) into concrete human constraints:

- **Explain before warning** → personas who panic (P2) or distrust machines (P4) define how explanations must be staged.
- **Respect victims** → P2 and parts of P1/P3 define the trauma-aware copy and data-handling contract.
- **Protect privacy** → anonymous-first personas (P4, P9) define how little we are allowed to require.
- **Keep core education free** → every persona's "what success looks like" must be reachable on the free tier.
- **Always encourage official verification** → every persona's journey terminates in a handoff to FTC, FBI IC3, state AG, CFPB, IRS, or SSA, never in a closed-loop ScamWatch verdict.

The personas are the acceptance surface for "did we build this for the people who actually need it." They are referenced by ID throughout Volume 4 — User Journeys.

## 2. Background

ScamWatch launches in Florida (Volume 2). Florida is over-indexed for the exact audiences below: a large retiree population (elder-targeted scams), a large immigrant/ESL population (multilingual exposure, remittance and notario fraud), and a dense small-business sector (BEC/invoice fraud). The personas are grounded in publicly documented fraud-victimization patterns (FTC Consumer Sentinel, FBI IC3 reporting, AARP fraud research) but are composites — no persona is a real individual, and no persona encodes a protected-class stereotype as a causal claim. Age, language, and disability appear as *context and access needs*, never as "why they got scammed."

Two framing rules govern this volume:

1. **Victimhood is a state, not an identity.** Any persona can move into the "current victim" state (P2) regardless of tech-literacy. The product must degrade gracefully into trauma-aware mode for *anyone*, not only for the persona we labeled "victim."
2. **Accessibility is a profile on every persona, not a separate "disabled persona."** Disability is distributed across the whole audience. We therefore attach a four-axis accessibility profile (vision / motor / cognitive / language) to all eleven personas.

## 3. How to Read a Persona

Each persona below uses this fixed structure so downstream volumes can parse them:

- **ID / Name / One-line.**
- **Demographic & context.**
- **Goals.**
- **Anxieties.**
- **Tech-literacy** (scored Low / Developing / Moderate / High / Expert).
- **Accessibility profile** — four axes, each with a concrete design implication:
  - *Vision* · *Motor* · *Cognitive* · *Language*.
- **Scam-exposure scenario** (mapped to the Volume 2 threat taxonomy).
- **What success looks like** for them.
- **Product surfaces touched** (links forward to features/volumes).
- **Trauma / sensitivity notes** where applicable.

> Accessibility axes describe *the persona's needs*, which become *AA-or-better requirements* on the product. A persona having "no acute vision need" never lowers the product's WCAG 2.2 AA floor — it only means this persona is not the primary stress-test for that axis.

---

## 4. The Personas

### 4.1 P1 — Margaret "Marg" Whitfield — At-Risk Older Adult / Florida Retiree

**One-line.** 73-year-old widow in Port St. Lucie, FL, financially independent, increasingly targeted, fiercely proud of her independence.

**Demographic & context.** Retired schoolteacher; lives alone; fixed income plus modest savings; iPad and an Android phone given by her daughter (P3, Priya — though P1/P3 are not modeled as literally related, this is the common pattern). Uses Facebook daily, checks email, does some banking online with anxiety. Receives 4–8 spam/scam calls and texts per day.

**Goals.**
- Decide quickly whether a specific text/call/email is safe — *before* clicking or calling back.
- Stay independent; not have to phone her daughter about every suspicious message.
- Avoid embarrassment.

**Anxieties.**
- Being scammed *and* being seen as "someone who gets scammed."
- Losing access to her accounts / "breaking something."
- That asking for help means losing autonomy.

**Tech-literacy.** Developing. Can follow a clear linear flow; struggles with multi-tab workflows, jargon, and anything that looks like a form.

**Accessibility profile.**
- *Vision:* Presbyopia + early cataract; needs large default text, high contrast, and pinch-zoom that does not break layout. Implication: 16px+ base, AA contrast, reflow at 200–400% (WCAG 2.2 1.4.10).
- *Motor:* Mild hand tremor; mis-taps small targets. Implication: 44×44px touch targets (2.5.8 Target Size), generous spacing, no time-limited taps.
- *Cognitive:* Anxiety under perceived urgency; working-memory load must stay low. Implication: one decision per screen, plain language, no countdown timers, no dark patterns.
- *Language:* Native English, but low tolerance for technical vocabulary. Implication: 6th–8th-grade reading level for core copy.

**Scam-exposure scenario.** Toll-road smishing ("FastTrak: unpaid toll $6.99, pay now or face penalty"), Medicare/SSA impersonation vishing, grandparent scam ("Grandma, I'm in jail, don't tell Mom"), and tech-support pop-ups. (Taxonomy: Phishing/Smishing/Vishing; Impersonation gov't/family; Tech-support.)

**What success looks like.** She pastes/forwards a suspicious text, gets a calm, plain-language answer with a confidence level and a "here's why," and a clear "do this next: hang up / don't click / call the real number 1-800-MEDICARE." She did not have to create an account, did not feel stupid, and was pointed to an official source.

**Product surfaces touched.** Anonymous lookup/search (Vol 4 UJ-4.1), Explanation + Confidence display, Verification handoff cards, Proactive local-campaign alerts (opt-in), large-text/high-contrast theme.

---

### 4.2 P2 — Daniel Okonkwo — Recent / Current Victim (Trauma-Aware)

**One-line.** 41-year-old who has just realized he sent $9,400 to a fake "bank fraud department," now flooded with shame, fear, and urgency.

**Demographic & context.** Works full-time; moderately tech-comfortable; *was* targeted precisely because the lure was sophisticated (account-takeover + bank impersonation, spoofed caller ID). Arrives at ScamWatch in acute distress, often within minutes or hours of the loss, frequently at 2 a.m., possibly on a borrowed or unfamiliar device.

**Goals.**
- Stop further loss *right now* (freeze cards, change passwords, lock accounts).
- Find out if it is recoverable and what to do in the next hour.
- Reach the right official channels (bank fraud line, FTC ReportFraud, IC3, local police report for documentation).
- Not be judged.

**Anxieties.**
- Shame and self-blame ("How did I fall for this?").
- Fear it will happen again / that more money will vanish.
- Fear of telling family.
- Distrust of *another* website asking for information.

**Tech-literacy.** Moderate — but **functionally lowered by acute stress**. Trauma narrows attention and working memory; the product must assume reduced capacity regardless of baseline skill.

**Accessibility profile.**
- *Vision:* No baseline acute need, but stress + possible tears + nighttime → high-contrast, large tap targets still required.
- *Motor:* Stress tremor; same large-target requirement.
- *Cognitive:* **Acute trauma load.** Implication: shortest possible path to action; no walls of text; no scolding; checklists over essays; the ability to skip explanation and go straight to "what do I do now."
- *Language:* English here, but trauma-aware tone is mandatory and must survive translation (see P9).

**Scam-exposure scenario.** Bank/government impersonation → account-takeover → authorized push payment. May overlap with pig-butchering (romance + investment) for a slower-burn variant. (Taxonomy: Impersonation bank/gov't; Account-takeover; Investment/Crypto.)

**What success looks like.** Within 60 seconds he sees a calm header — *"You're not alone, and this isn't your fault. Let's stop the bleeding first."* — followed by an ordered, do-it-now action list with one-tap official links (his bank's verified fraud line, FTC, IC3) and a clear "save a record of this" affordance. No data is required to get help. He leaves having taken three protective actions and knowing exactly who to call.

**Product surfaces touched.** "I think I've been scammed" emergency/victim mode, Verification handoff (priority/escalated variant), Explanation (skippable), report submission (optional, never gated in front of help), resource directory. **This persona sets the trauma-aware copy contract for the entire product.**

**Trauma / sensitivity notes.** No blame language anywhere on the path. No "you should have." No fear amplification. No upsell. No required account. No social/share prompts in victim mode. Crisis-adjacent safety net: where loss intersects suicidal-ideation risk, surface 988 (Suicide & Crisis Lifeline) without forcing it.

---

### 4.3 P3 — Priya Nair — Caregiver / Adult Child

**One-line.** 38-year-old daughter, three states away, who manages and worries about her mother's (P1-type) safety online.

**Demographic & context.** Knowledge worker; high tech-literacy; time-poor; the de-facto "IT support and fraud shield" for a parent. Often acts *on behalf of* someone, sometimes *with* them on a shared call, sometimes after the fact ("Mom, what did you click?").

**Goals.**
- Quickly verify something her parent forwarded ("is this toll text real?").
- Set up lightweight, *consent-respecting* monitoring or alerts for her parent's region/threats.
- Get shareable, parent-friendly explanations she can forward without condescension.
- Know the right official steps if her parent *was* hit.

**Anxieties.**
- Missing the one scam that gets through.
- Overstepping her parent's autonomy / damaging trust.
- Doing the "monitoring" in a way that is creepy or legally murky.

**Tech-literacy.** High.

**Accessibility profile.**
- *Vision / Motor:* No acute need; often on mobile while multitasking → mobile-first, one-handed reachability.
- *Cognitive:* Time-pressured, context-switching → fast scannable results, copy-able plain-language summaries.
- *Language:* English; needs output that *her parent* (possibly ESL) can read → must support easy language switch / shareable simplified explanation.

**Scam-exposure scenario.** Acts as proxy across P1's whole exposure surface; additionally fields "is this gift-card request from 'my boss' real?" for herself (early BEC overlap with P5).

**What success looks like.** She verifies a forwarded scam in under a minute, forwards a clean, non-patronizing explanation to her mother, and optionally subscribes to alerts for her mother's ZIP/threat-types — all without violating her mother's consent or privacy. She knows ScamWatch will never ask her to log into her mother's accounts.

**Product surfaces touched.** Anonymous lookup, shareable Explanation export, opt-in proactive alerts (delegated/consented), Verification handoff, account (member) for saved/monitored items.

**Trauma / sensitivity notes.** Caregiver flows must encode *consent of the cared-for person*; "monitoring a parent" must be framed as consented collaboration, not surveillance (see PER-3 and Vol 4 UJ-4.4 / UJ-4.8).

---

### 4.4 P4 — Marcus Bell — Skeptical Verifier ("Is this real?")

**One-line.** 29-year-old, privacy-conscious, sharp, default-distrustful — of scams *and* of ScamWatch.

**Demographic & context.** Tech-comfortable urban professional; runs an ad-blocker; refuses to make an account "just to check a link." Arrives with a specific artifact — a URL, a phone number, a job offer, a crypto "opportunity" — and wants a *defensible* answer, not a vibe.

**Goals.**
- Get a calibrated, sourced verdict on a specific entity (URL/phone/email/wallet/job).
- See the *reasoning and the sources*, not just a score.
- Stay anonymous; share/collect nothing he didn't ask to.

**Anxieties.**
- Being manipulated by *the verifier itself* (is ScamWatch trustworthy? funded by whom? selling my lookups?).
- False confidence / black-box "AI says scam."
- His data being logged or sold.

**Tech-literacy.** High → Expert.

**Accessibility profile.**
- *Vision / Motor:* No acute need; expects keyboard-navigable, fast UI.
- *Cognitive:* Low tolerance for hand-waving; needs transparency affordances (confidence, sources, "why," "last updated").
- *Language:* English; expects precise, non-hyped wording.

**Scam-exposure scenario.** Marketplace/goods fraud, fake job/employment offers, crypto/investment "opportunities," phishing URLs. (Taxonomy: Marketplace; Employment; Investment/Crypto; Phishing.)

**What success looks like.** He pastes a URL, gets a calibrated confidence with an *explicit* "here's what we matched and why," the sources/dates behind it, an honest "we're not certain — verify here" when evidence is thin, and a visible privacy statement that his lookup wasn't retained or sold. He becomes a trust evangelist — exactly the "build trust before growth" moat.

**Product surfaces touched.** Anonymous lookup, Explanation (full/expanded), Confidence + sources panel, transparency report links, privacy disclosures.

---

### 4.5 P5 — Rosa Delgado — Small-Business Owner / BEC & Invoice-Fraud Target

**One-line.** 47-year-old owner of a 12-person HVAC company in Tampa; the person who actually approves payments.

**Demographic & context.** Wears every hat; approves invoices and wires; uses QuickBooks + email + a personal phone for everything. Targeted by business-email-compromise: spoofed "vendor" banking-change requests, fake invoices, "CEO/owner" gift-card requests aimed at her bookkeeper, and overpayment refund schemes.

**Goals.**
- Verify a *payment-relevant* request fast (is this vendor banking-change real? is this invoice legitimate?).
- Protect employees who might be socially engineered.
- Establish a simple internal "check before you pay" habit/policy.

**Anxieties.**
- One wrong wire = catastrophic, possibly business-ending, loss.
- Liability / looking incompetent to staff and bank.
- Not having time for "another tool."

**Tech-literacy.** Moderate (business-app fluent, security-naive).

**Accessibility profile.**
- *Vision:* Often on a phone in the field, bright sunlight → outdoor-readable contrast, large text.
- *Motor:* On the move; one-handed; sometimes gloves → large targets, minimal typing.
- *Cognitive:* Interrupt-driven; decisions made between jobs → fast, unambiguous "verify the bank change out-of-band" guidance.
- *Language:* Bilingual EN/ES; may prefer Spanish for nuance → multilingual parity (ties to P9).

**Scam-exposure scenario.** BEC / fake invoices, vendor banking-change fraud, refund/overpayment, brand impersonation. (Taxonomy: Fake invoices/BEC; Refund/Overpayment; Impersonation brand.)

**What success looks like.** She checks a "vendor changed our bank account" email, ScamWatch flags the pattern, explains the BEC playbook in business terms, and tells her to *call the vendor on a known-good number* before paying — plus where to report (FBI IC3, FTC). She adopts a 30-second "verify out-of-band" rule for her shop.

**Product surfaces touched.** Anonymous lookup, BEC-specific Explanation/playbook content, Verification handoff (IC3/FTC + bank), report submission, optional member account for a small-team shared watchlist (future).

---

### 4.6 P6 — Tyler Hammond — Contributor / Reporter

**One-line.** 34-year-old who got scammed once, got angry, and now actively submits the scams he encounters.

**Demographic & context.** Tech-savvy; checks his own spam folder for sport; wants to *fight back* by feeding the system. Submits text, screenshots, URLs, phone numbers regularly. Cares about his contributions mattering and being credited (lightly).

**Goals.**
- Submit high-quality reports fast (with screenshot + auto-extracted entities).
- See that his reports get used (counted, linked to campaigns, "this helped warn N people").
- Build a reputation / standing that earns him trust and maybe light privileges.

**Anxieties.**
- Wasting effort on reports that vanish into a void.
- Being penalized for an honest mistake / a false positive.
- Doxxing himself or the *innocent* (e.g., a real business spoofed by scammers).

**Tech-literacy.** High.

**Accessibility profile.**
- *Vision / Motor:* No acute need; power-user keyboard flows; bulk submission.
- *Cognitive:* Wants efficient, low-friction repeated submission, clear status feedback.
- *Language:* English; comfortable with detail.

**Scam-exposure scenario.** Encounters and reports across the full taxonomy; an "antibody," not a primary target.

**What success looks like.** He submits a screenshot, OCR pulls the phone number and URL, he confirms in two taps, and later sees "your report contributed to a flagged Toll-Road Smishing campaign in your area" plus a rising contributor standing. He feels his effort compounds.

**Product surfaces touched.** Report submission (+ screenshot upload + OCR + entity confirmation), contributor profile / reputation (Vol 4 UJ-4.5), campaign linkage views, member/contributor account.

**Trauma / sensitivity notes.** Reputation mechanics must not gamify in ways that incentivize false reporting or naming innocent parties (defamation guardrail, Volume 2; see SEC below).

---

### 4.7 P7 — Aisha Rahman — Volunteer Moderator

**One-line.** 45-year-old community-minded volunteer who triages queued reports for quality, safety, and accuracy.

**Demographic & context.** Trusted, trained community member with the `moderator` role. Spends limited but regular hours reviewing the queue: dedupe, validate, reclassify, redact PII, flag defamation risk, approve/merge into campaigns, or reject with a reason.

**Goals.**
- Move through the queue efficiently with strong context.
- Apply consistent, fair, documented decisions.
- Catch defamation/PII risks and trauma-sensitive content before publication.
- Not burn out / not be exposed to harmful content unnecessarily.

**Anxieties.**
- Making a wrong call that harms a real person or a real business.
- Inconsistency / lack of clear policy.
- Exposure to disturbing content (sextortion, graphic threats).
- Personal safety / retaliation.

**Tech-literacy.** High.

**Accessibility profile.**
- *Vision:* Long review sessions → eye-strain mitigation, dark mode, scalable text.
- *Motor:* Repetitive actions → keyboard shortcuts, low-RSI workflows.
- *Cognitive:* Decision fatigue, vicarious trauma → content warnings, blur-by-default for graphic media, batched pacing, clear policy references in-context.
- *Language:* English + ability to route non-English reports to the right reviewer.

**Scam-exposure scenario.** Reviews the full taxonomy, including the most distressing (Extortion/Sextortion). Not a target persona; a *steward* persona.

**What success looks like.** She clears a queue with confidence, every decision is logged with a reason, graphic content was blurred until she chose to view it, defamation/PII checks were surfaced automatically, and her workload was bounded to protect her wellbeing.

**Product surfaces touched.** Moderation queue/console (Vol 4 UJ-4.6), redaction tools, confidence/explanation review, campaign merge, audit log, content-warning/blur controls.

**Trauma / sensitivity notes.** Moderator wellbeing is a first-class requirement: graphic-content blurring, session limits, and the ability to defer/escalate the worst material.

---

### 4.8 P8 — Karen Liu — Institutional / Analyst (AG Office / Bank Fraud Team)

**One-line.** 39-year-old fraud analyst at a state AG consumer-protection unit (and the archetype for a partner bank's fraud team).

**Demographic & context.** Professional investigator with the `analyst` role. Works campaigns, not single reports: correlates entities, tracks actors/kits across reports, exports evidence, watches geographic and temporal trends, and coordinates with official action. Needs rigor, provenance, and exportability.

**Goals.**
- Investigate and characterize *campaigns* (clustered reports/entities sharing an actor/kit).
- Pull provenance-complete, court/defensibility-aware exports.
- Track trends by region/threat-type over time; prioritize by harm.
- Feed back confirmed intelligence to improve classification.

**Anxieties.**
- Acting on weak/uncalibrated signal; false attribution.
- Chain-of-custody / evidentiary integrity gaps.
- Privacy/legal compliance of the underlying data.
- Missing an emerging campaign until harm is large.

**Tech-literacy.** Expert.

**Accessibility profile.**
- *Vision:* Dense data work → scalable dense tables, AA contrast even in data-viz, colorblind-safe palettes (no color-only signal).
- *Motor:* Heavy keyboard/query use → full keyboard operability.
- *Cognitive:* High expertise but high stakes → transparency of confidence and method; reproducible queries.
- *Language:* English; works with multilingual source content (needs original + translation provenance).

**Scam-exposure scenario.** Cross-taxonomy campaign analysis, with emphasis on high-harm clusters (pig-butchering, BEC, mass smishing). A *consumer* of intelligence, not a target.

**What success looks like.** She opens a campaign, sees correlated entities with calibrated link-confidence and full provenance, filters by ZIP and date, exports a defensible evidence package, and pushes a "confirmed" signal back into the system — all within compliance and audit constraints.

**Product surfaces touched.** Analyst workbench / campaign investigation (Vol 4 UJ-4.7), entity graph views, confidence + provenance, export/evidence packaging, trend dashboards, audit logging, role-gated access.

---

### 4.9 P9 — Hông Tran — Low-Digital-Literacy / ESL User

**One-line.** 58-year-old Vietnamese-American small-restaurant worker in Orlando who reads English slowly and distrusts unfamiliar websites.

**Demographic & context.** Primary language Vietnamese; functional spoken English; limited written-English reading; smartphone-only (no laptop); learned the internet through Facebook, Messenger, and YouTube. Targeted via culturally-tailored scams (remittance fraud, "immigration/USCIS" impersonation, notario fraud, package-delivery smishing, in-language romance scams).

**Goals.**
- Understand, in her own language and in plain terms, whether something is a scam.
- Avoid losing money she sends to family.
- Not be tricked by something that *looks* official.

**Anxieties.**
- Language barrier → misreading warnings, or warnings she can't read at all.
- Distrust of government/official-looking sites (immigration fear chills reporting).
- Embarrassment about reading difficulty.

**Tech-literacy.** Low (mechanically capable on familiar apps; lost outside them).

**Accessibility profile.**
- *Vision:* Needs large text and high contrast; benefits from icons + images alongside words.
- *Motor:* Smartphone-only, one-handed; large targets.
- *Cognitive:* Low literacy load tolerance → minimal text, pictograms, short sentences, optional read-aloud (TTS).
- *Language:* **Primary need.** Implication: full UI + explanations + verification guidance in Vietnamese and Spanish at launch (and an extensible i18n architecture), with culturally-aware examples, plus **text-to-speech**; warnings must never be English-only. Right-to-translate must not silently downgrade the trauma-aware tone.

**Scam-exposure scenario.** Remittance/wire fraud, government/immigration impersonation, package smishing, in-language romance. (Taxonomy: Impersonation gov't; Phishing/Smishing; Romance; Refund/Overpayment.)

**What success looks like.** She pastes a Vietnamese-language "USCIS" text, gets a Vietnamese-language calm explanation she can also *listen to*, learns it's a known impersonation pattern, and is routed to a real, trustworthy resource — without being made to feel she "should have known," and without fear that using ScamWatch exposes her immigration status.

**Product surfaces touched.** Anonymous lookup (multilingual), translated Explanation + TTS, multilingual Verification handoff, image/icon-forward UI, privacy assurances (no status collection).

**Trauma / sensitivity notes.** ESL + immigration fear is a trust-chilling combination; copy must explicitly reassure that ScamWatch does not collect or report immigration status and is not a government enforcement tool.

---

### 4.10 P10 — Sam Reyes — Journalist / Researcher

**One-line.** 32-year-old consumer-affairs reporter (archetype also covers academic researchers) who uses ScamWatch as a sourcing and trends tool.

**Demographic & context.** Investigative journalist on a deadline; tech-comfortable; needs citable, attributable, time-stamped data on scam trends and campaigns to inform reporting that warns the public. Cares about methodology, transparency, and not amplifying scams.

**Goals.**
- Find and cite trends/campaigns ("toll smishing up 300% in FL this quarter").
- Understand methodology + confidence to report responsibly.
- Get aggregate, privacy-safe data and an authoritative contact/transparency report.

**Anxieties.**
- Overstating an unproven claim / being misled by weak data.
- Amplifying a scam or doxxing an innocent named party.
- Source/data credibility under editorial scrutiny.

**Tech-literacy.** High.

**Accessibility profile.**
- *Vision / Motor:* No acute need; expects accessible charts (not color-only).
- *Cognitive:* Needs explicit methodology + confidence to write accurately.
- *Language:* English; values precise, non-hyped language (aligns with Principle 6).

**Scam-exposure scenario.** Reports *about* the whole taxonomy; a public-interest amplifier of warnings.

**What success looks like.** Sam pulls a privacy-safe aggregate trend with documented methodology and confidence, cites the public transparency report, and publishes an accurate, non-fearmongering warning that drives real-world harm reduction — reinforcing ScamWatch's "Consumer Reports for fraud" positioning.

**Product surfaces touched.** Public trends/transparency pages, aggregate/anonymized data, methodology + confidence documentation, press/research contact, embeddable warnings.

---

### 4.11 P11 — Eddie Foster — Caregiving-at-a-Distance + Power-of-Attorney Edge

**One-line.** 52-year-old son who holds durable power of attorney for his father with mild cognitive decline, blurring the line between "verify for" and "act for."

**Demographic & context.** Distinct from P3 (Priya) in that Eddie has *legal authority* and his father has *reduced capacity* — surfacing the hardest consent/authority edge cases. Eddie may legitimately need to act on his father's behalf, including reporting and freezing, while still respecting dignity and avoiding overreach.

**Goals.**
- Act decisively to protect a vulnerable parent who can no longer self-verify.
- Document fraud for legal/financial recovery and APS (Adult Protective Services) coordination.
- Do so within a defensible consent/authority framework.

**Anxieties.**
- Acting too late (capacity already exploited) or in a way that's legally challengeable.
- Stripping his father's dignity/autonomy.
- Coordinating with banks/APS/law enforcement correctly.

**Tech-literacy.** High.

**Accessibility profile.**
- *Vision / Motor:* No acute personal need; his *father* has significant needs (proxy accessibility).
- *Cognitive:* High stress, high stakes → clear authority/consent affordances, documentation export.
- *Language:* English.

**Scam-exposure scenario.** Elder-targeted impersonation, romance/pig-butchering exploiting loneliness, account-takeover, repeated re-victimization. (Taxonomy: Impersonation; Romance; Account-takeover.)

**What success looks like.** Eddie can document and report fraud against his father, attach proof of authority where required, coordinate with official orgs (bank, APS, AG, IC3), and do so through flows that explicitly model *delegated authority with dignity* rather than silent account hijacking.

**Product surfaces touched.** Victim-mode + caregiver-proxy flows, Verification handoff (APS/AG/bank), report submission with authority attestation, documentation export.

**Trauma / sensitivity notes.** This persona drives the hardest consent/authority requirements (PER-3) and is the reason delegated action must be explicit, attested, logged, and dignity-preserving — never a backdoor to surveillance.

---

## 5. Persona-to-Feature Matrix

Legend: **P** = primary (feature must be designed around this persona) · **S** = secondary (must serve well) · **—** = not a primary user of this surface.

| Feature / Surface | P1 Marg | P2 Daniel | P3 Priya | P4 Marcus | P5 Rosa | P6 Tyler | P7 Aisha | P8 Karen | P9 Hông | P10 Sam | P11 Eddie |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Anonymous lookup / "Is this a scam?" (UJ-4.1) | P | S | P | P | P | S | — | — | P | S | S |
| Explanation + Confidence display | P | S | P | P | P | S | S | P | P | P | S |
| Verification handoff (official orgs) | P | P | P | P | P | S | — | P | P | S | P |
| Report submission + screenshot + OCR (UJ-4.2) | S | S | S | S | P | P | — | — | S | — | P |
| Victim / emergency mode (UJ-4.3) | S | **P** | S | — | S | — | — | — | S | — | P |
| Caregiver / proxy flow (UJ-4.4) | — | — | **P** | — | — | — | — | — | — | — | P |
| Proactive local-campaign alerts (UJ-4.8) | P | — | P | S | S | S | — | S | S | S | S |
| Contributor reputation (UJ-4.5) | — | — | — | — | — | **P** | S | — | — | — | — |
| Moderation queue / console (UJ-4.6) | — | — | — | — | — | — | **P** | S | — | — | — |
| Analyst workbench / campaign investigation (UJ-4.7) | — | — | — | — | — | — | S | **P** | — | S | — |
| Public trends / transparency reports | S | — | S | P | S | S | S | P | S | **P** | S |
| Multilingual UI + TTS | P | S | S | — | P | — | S | — | **P** | — | S |
| Member account (saved/watchlist) | S | — | P | — | S | P | S | S | — | — | S |
| Delegated-authority / consent framework | — | — | P | — | — | — | — | — | — | — | **P** |

---

## 6. Requirements (`PER-3.*`)

> RFC 2119 keywords. IDs are stable; downstream volumes and tests reference them.

### 6.1 Coverage & Traceability

- **PER-3.1.1 — MUST.** The product MUST serve all eleven personas P1–P11; no release may drop a feature on which a persona is marked **P** in §5 without an explicit, documented exception.
- **PER-3.1.2 — MUST.** Every user-facing journey in Volume 4 MUST cite at least one persona ID (P1–P11) it primarily serves.
- **PER-3.1.3 — SHOULD.** Each persona SHOULD have at least one end-to-end happy-path journey and one degraded/edge path in Volume 4.

### 6.2 Trauma-Aware & Victim-Respecting (driven by P2, P9, P11)

- **PER-3.2.1 — MUST.** No surface on any victim-reachable path MUST contain blame, shame, or "you should have" language. Copy MUST follow the trauma-aware tone contract set by P2.
- **PER-3.2.2 — MUST.** Getting help (victim mode) MUST NOT be gated behind account creation, payment, or data submission.
- **PER-3.2.3 — MUST.** Victim mode MUST allow the user to skip explanation and reach "what to do now" actions in ≤1 interaction.
- **PER-3.2.4 — SHOULD.** Victim-mode surfaces SHOULD suppress non-essential prompts (upsell, social share, surveys, gamification).
- **PER-3.2.5 — MUST.** Where loss may intersect acute distress, the product MUST make a crisis resource (e.g., 988) available without forcing it.

### 6.3 Anonymity & Privacy (driven by P4, P9, P1)

- **PER-3.3.1 — MUST.** Core lookup/education MUST be usable fully anonymously (role `anonymous`), with no account required.
- **PER-3.3.2 — MUST.** Anonymous lookups MUST NOT be sold, and the product MUST disclose retention behavior on the lookup surface (Principle 3 + 5).
- **PER-3.3.3 — MUST.** The product MUST NOT collect immigration status, and ESL/immigrant-facing copy (P9) MUST state this explicitly.

### 6.4 Transparency & Calibration (driven by P4, P8, P10)

- **PER-3.4.1 — MUST.** Every classification shown to a persona MUST display a calibrated Confidence and MUST be accompanied by an Explanation and a "verify with official sources" handoff.
- **PER-3.4.2 — MUST.** AI output MUST NOT be presented as fact; language MUST be calibrated (Principle 6).
- **PER-3.4.3 — SHOULD.** For verifier/analyst/journalist personas (P4/P8/P10), sources, dates, and method/provenance SHOULD be inspectable.

### 6.5 Accessibility per Persona (driven by all; WCAG 2.2 AA contract)

- **PER-3.5.1 — MUST.** Every persona's accessibility profile (vision/motor/cognitive/language) MUST be satisfied to at least WCAG 2.2 AA on all surfaces that persona is **P** or **S** for.
- **PER-3.5.2 — MUST.** Core education + warnings MUST be available in English, Spanish, and Vietnamese at Florida launch, with TTS for P1/P9-class needs.
- **PER-3.5.3 — MUST.** No safety-critical signal (e.g., scam/safe, confidence) MUST be conveyed by color alone (driven by P8 colorblind-safe; benefits all).
- **PER-3.5.4 — SHOULD.** Core copy SHOULD target a 6th–8th-grade reading level (P1, P9), excluding analyst/expert surfaces.

### 6.6 Contributor, Moderator & Defamation Safety (driven by P6, P7)

- **PER-3.6.1 — MUST.** Contributor reputation mechanics MUST NOT reward volume in a way that incentivizes false or innocent-naming reports.
- **PER-3.6.2 — MUST.** The product MUST NOT publish unproven accusations against named private individuals; it makes calibrated, evidence-linked statements about *patterns/infrastructure* (Volume 2 defamation guardrail).
- **PER-3.6.3 — MUST.** Moderator (P7) tooling MUST blur graphic content by default and MUST bound exposure to protect moderator wellbeing.

### 6.7 Delegated Authority & Consent (driven by P3, P11)

- **PER-3.7.1 — MUST.** Caregiver/proxy features MUST model consent of the cared-for person; monitoring MUST be framed and implemented as consented collaboration, not covert surveillance.
- **PER-3.7.2 — MUST.** Delegated *action* on another's behalf (P11) MUST require explicit attestation of authority, MUST be logged, and MUST preserve the dignity/autonomy of the represented person.
- **PER-3.7.3 — SHOULD.** Proxy flows SHOULD support documentation export for coordination with banks, APS, AG, FTC, and IC3.

## 7. Acceptance Criteria

> Given/When/Then; testable against the personas. (Detailed flow ACs live in Volume 4; these validate persona *fit*.)

- **AC-PER-3.1 (P2 trauma-aware).** *Given* a user enters victim mode, *when* the first screen renders, *then* it contains a non-blaming reassurance, an immediate action list reachable in ≤1 interaction, and at least one official verification link, and it requires no account or payment. (Satisfies PER-3.2.1–3.2.3.)
- **AC-PER-3.2 (P4 anonymity).** *Given* an anonymous user, *when* they perform a lookup, *then* no account is requested, a retention/privacy disclosure is visible, and a Confidence + Explanation + official-verification handoff are shown. (PER-3.3.1–3.3.2, 3.4.1.)
- **AC-PER-3.3 (P9 multilingual).** *Given* the UI language is Vietnamese or Spanish, *when* a scam result is shown, *then* the warning, explanation, and verification guidance render fully in that language with TTS available, and tone remains trauma-aware. (PER-3.5.2, 3.2.1.)
- **AC-PER-3.4 (P8 colorblind-safe).** *Given* any safety-critical signal, *when* rendered, *then* it is distinguishable without color (icon/text/pattern). (PER-3.5.3.)
- **AC-PER-3.5 (P6/P7 defamation).** *Given* a report naming a private individual, *when* it is processed, *then* it cannot be published as an accusation without moderation, and reputation gains are not granted for unverified naming. (PER-3.6.1–3.6.2.)
- **AC-PER-3.6 (P11 delegated authority).** *Given* a proxy attempts delegated action, *when* they proceed, *then* the system requires authority attestation, logs it, and never silently accesses the represented person's accounts. (PER-3.7.2.)
- **AC-PER-3.7 (coverage).** *Given* the persona-to-feature matrix (§5), *when* a release ships, *then* every **P** cell maps to an implemented, persona-validated surface or a documented exception. (PER-3.1.1.)

## 8. Edge Cases

- **State transition into victimhood.** Any persona (e.g., P1, P4, P5) can become P2 mid-session. The product MUST detect distress signals (explicit "I was scammed," money-loss keywords) and offer victim mode without forcing it. Persona labels are not mutually exclusive states.
- **Persona collision on one device.** A caregiver (P3/P11) and the cared-for person (P1) may share a device or a session; consent/identity must not be assumed from the device.
- **Multilingual + trauma + low literacy stacked.** P9 in victim mode (P2) stacks translation, TTS, low-literacy, *and* trauma-aware constraints simultaneously — the hardest combined surface; treat as a required test matrix cell, not an afterthought.
- **Skeptic refuses everything (P4).** User declines cookies, JS-limits, ad-block, no account: core lookup must still function and still disclose privacy posture.
- **Proxy without authority.** A would-be caregiver (P3) without legal authority must be guided to consented collaboration, *not* given account-takeover-like powers; only P11-style attested authority unlocks delegated action.
- **Moderator exposure (P7).** A queue containing sextortion imagery must arrive blurred; a moderator must be able to defer/escalate without viewing.
- **Analyst over-attribution (P8).** Thin-evidence campaigns must surface low confidence and block "confirmed" labeling until thresholds are met.
- **Innocent spoofed brand/individual.** A real business or person impersonated by scammers (relevant to P5/P6/P10) must not be defamed; reports about them must be framed as *impersonation of*, not *guilt of*.
- **Journalist amplification (P10).** Aggregate data must be privacy-safe and must not enable re-identification or scam amplification.

## 9. Security Considerations

- **Role mapping.** Personas map to Supabase Auth roles (Volume 2): P1/P4/P9 → `anonymous`/`member`; P3 → `member`; P6 → `contributor`; P7 → `moderator`; P8/P10 → `analyst` (P10 may be a scoped read-only/aggregate analyst tier); P11 → `member` with attested delegated-authority claims. Least privilege MUST be enforced per role.
- **Anonymity vs. abuse.** Anonymous lookup (P4) must resist scraping/abuse (rate limiting, bot defense) without logging PII or selling lookups (PER-3.3.2).
- **PII in reports & screenshots (P5/P6).** Uploaded screenshots may contain the *victim's own* PII and innocent third parties' PII. Server-side scanning, OCR-then-redaction, and moderation (P7) MUST precede any publication; signed URLs + storage isolation per Volume 2.
- **Defamation surface (P6/P7/P10).** Reputation, publishing, and trends must never let unverified accusations against named private individuals reach the public surface. Confidence + moderation + appeal/takedown flow is the control.
- **Delegated authority abuse (P3/P11).** Proxy/delegation is a high-value attack target (a fraudster posing as a caregiver). Attestation, logging, and "never access the represented person's accounts" (PER-3.7.2) are security controls, not just UX.
- **ESL/immigration trust (P9).** Collecting status would create both a privacy harm and a chilling effect; the architecture MUST NOT collect it (PER-3.3.3).
- **Analyst/journalist exports (P8/P10).** Exports carry provenance and potentially sensitive data; access is role-gated, audit-logged, and aggregated/de-identified for the journalist tier.

## 10. Accessibility (WCAG 2.2 AA baseline)

Accessibility is specified *per persona* in §4 and as requirements in §6.5; this section states the cross-cutting contract:

- **Perceivable:** AA contrast (1.4.3/1.4.11), reflow to 400% (1.4.10), text resize without loss (1.4.4), no color-only signaling (1.4.1) — stress-tested by P1, P8, P9.
- **Operable:** target size ≥24px CSS (2.5.8; project floor 44×44px for touch per P1/P5/P9), full keyboard operability (2.1.1) for P4/P8, no keyboard traps, no required timing on safety actions (P1/P2).
- **Understandable:** plain-language core copy at 6th–8th grade (P1/P9), consistent navigation, input help, error prevention on consequential actions (3.3.x) — critical in P2 victim mode and P5 payment-verification.
- **Robust:** semantic markup + ARIA for screen readers; TTS for P1/P9; multilingual parity EN/ES/VI at launch (PER-3.5.2). New WCAG 2.2 criteria explicitly in scope: 2.4.11 Focus Not Obscured, 2.5.7 Dragging Movements (provide non-drag alternatives), 3.3.7 Redundant Entry (don't re-ask victims for info), 3.3.8 Accessible Authentication (no cognitive-test logins for P1/P9).
- **Trauma-aware accessibility:** for P2, "accessible" includes *cognitive load under acute stress* — short paths, no timers, skippable explanation.

## 11. Performance

Persona context sets human-perceived performance budgets (engineering budgets live in Volume 13 — Performance & Reliability):

- **P2 victim mode** is latency-critical: first meaningful, actionable content MUST render fast on mid/low-end mobile over poor networks (target: actionable content < 2.5s on a 4G/throttled device); the "what to do now" list MUST NOT block on AI explanation generation (progressively enhance).
- **P1/P9 mobile-only** users are often on older devices/weaker networks → strict JS/payload budgets, server-rendered core, no layout shift on zoom (P1 vision).
- **P4 skeptic** expects sub-second perceived response on a lookup with progressive disclosure of the heavier explanation/provenance.
- **P8 analyst** dense data/exports tolerate higher latency but require responsive filtering/pagination on large campaign datasets.
- TTS (P1/P9) and translation MUST stream/progressively load so they never block the primary warning.

## 12. Future Expansion

- **Additional persona depth:** youth/teen-targeted scams (sextortion, gaming/marketplace) and a dedicated cognitive-decline progression model beyond P11.
- **More languages:** Haitian Creole and Portuguese are high-value for Florida specifically; the i18n architecture (PER-3.5.2) is built to extend.
- **Caregiver/delegation product:** a fuller consented "family protection" tier evolving P3/P11 (with strict consent + dignity controls).
- **Institutional tiers:** richer analyst/partner (bank, AG, AARP) workspaces evolving P8, and a formal researcher/journalist data-access program evolving P10 — both gated by the transparency-report and privacy commitments.
- **Persona analytics loop:** privacy-safe measurement of which personas the product actually reaches, to correct under-served segments (especially P9-class users, who are easiest to under-serve).

---

*Cross-volume note: persona IDs P1–P11 are stable and are the canonical reference for Volume 4 — User Journeys and all accessibility/QA volumes. Where a future persona is added, it takes the next free ID (P12+) and never renumbers existing personas.*
