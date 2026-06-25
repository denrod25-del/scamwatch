# Volume 6 — UX Specification

> ScamWatch PRD · Project Sentinel · Public product name **ScamWatch** · Tagline *Know Before You Click™*
> Written against `_shared-context.md`. Do not contradict it. Cross-references Volume 5 — Functional Requirements (`FR-5.*`) and Volume 7 — Design System (tokens).

This volume specifies the user experience of ScamWatch end to end: information architecture and sitemap; the global layout (header/nav/search/footer); every page; every major reusable component; and key interactions and states, across **desktop / tablet / mobile** responsive breakpoints. It implements the functional contracts of Volume 5 and the product principles (explain before warning; respect victims; calibrated, trauma-aware copy). It does **not** redefine colors, type scale, spacing, or motion tokens — those live in **Volume 7 — Design System**; this volume references token names (e.g. `--verdict-caution`, `text-display`, `space-4`) and defers their values.

Requirement IDs in this volume are `UX-6.<section>.<n>`; acceptance criteria `AC-6.<section>.<n>`. The Documentation Standard (Purpose, Background, Requirements, Acceptance Criteria, Edge Cases, Security, Accessibility, Performance, Future Expansion) is applied per page and per reusable component.

---

## Table of Contents

1. [Information Architecture & Sitemap](#1-information-architecture--sitemap)
2. [Responsive Breakpoints & Conventions](#2-responsive-breakpoints--conventions)
3. [Global Layout (Header / Nav / Search / Footer)](#3-global-layout-header--nav--search--footer)
4. [Reusable Components](#4-reusable-components)
   - 4.1 SearchBar · 4.2 VerdictCard · 4.3 ConfidenceMeter · 4.4 ExplanationPanel · 4.5 EntityChip · 4.6 ReportWizardStep · 4.7 VerificationCallout · 4.8 AlertBanner · 4.9 ModerationActionBar
5. [Page Specs](#5-page-specs)
   - 5.1 Home · 5.2 Universal Search Results · 5.3 Threat Detail · 5.4 Entity Detail · 5.5 Campaign Detail · 5.6 Report Wizard · 5.7 Report Confirmation · 5.8 Account/Profile · 5.9 Reputation/Contributor · 5.10 Moderation Console · 5.11 Academy · 5.12 Transparency · 5.13 Alerts/Settings · 5.14 Auth Screens · 5.15 Error/Empty/Loading States
6. [Cross-Cutting Patterns](#6-cross-cutting-patterns-explainability-trauma-aware-copy-motion)
7. [Cross-Volume Assumptions](#7-cross-volume-assumptions)

---

## 1. Information Architecture & Sitemap

### Purpose
Define the navigable structure so users (especially distressed P1 and caregiver P3) reach the right surface in the fewest steps, and so crawlers/AI engines (P7) find stable, citable URLs.

### Background
ScamWatch is search-first (the search box is the front door) but also a deep reference site (Threat/Entity/Campaign pages) and an education site (Academy). The IA balances a shallow path to "is this safe?" with deep, linkable reference content.

### Sitemap

```
/                              Home (search-forward + local alerts + learn)
/lookup?q=…                    Universal Search results (FR-5.1)
/lookup/{type}/{value}         Canonical result/entity permalink (e.g. /lookup/phone/+18885551234)
/entity/{type}/{value}         Entity detail (FR-5.4)
/threats                       Threat index (by taxonomy category)
/threats/{slug}                Threat detail (FR-5.3)
/campaigns/{id}                Campaign detail (FR-5.5)  [index only if publishable]
/report                        Report wizard entry (FR-5.2)
/report/{step}                 Wizard steps
/report/confirmation/{id}      Report confirmation (FR-5.2.14)
/academy                       Academy home (FR-5.11)
/academy/{category}/{slug}     Lesson/guide
/transparency                  Transparency reports (FR-5.12)
/alerts                        Alerts & notification settings (FR-5.8) [auth or coarse-region]
/account                       Profile/settings (FR-5.9) [auth]
/account/reputation            Reputation/contributor (FR-5.9)
/account/reports               My reports + status
/moderation                    Moderation console (FR-5.10) [role ≥ moderator]
/auth/sign-in | /auth/verify   Auth (Supabase) (FR-5.9)
/about /privacy /terms /contact  Static/legal
404 / 500 / offline            Error states
```

### Requirements

| ID | Level | Requirement |
|---|---|---|
| UX-6.1.1 | MUST | Global search MUST be reachable from every page (header) and is the primary IA entry point. |
| UX-6.1.2 | MUST | Public reference pages (Threat/Entity/Campaign/Academy) MUST have stable, human-readable, canonical URLs (mirrors FR-5.13.7). |
| UX-6.1.3 | MUST | Primary nav exposes: Search (home), Threats, Academy, Report, and (contextually) Alerts; account/moderation are role-gated. |
| UX-6.1.4 | MUST | Max 2 clicks from Home to any core action (search, read a threat, start a report, learn). |
| UX-6.1.5 | SHOULD | Breadcrumbs on deep reference pages (Threats ▸ Category ▸ Threat). |
| UX-6.1.6 | MUST | Provisional/under-review Entity/Campaign pages are reachable by direct link but `noindex` (FR-5.10.2). |

### Acceptance Criteria
- **AC-6.1.1** From Home, a user reaches search results, a Threat page, the Report wizard, and Academy each in ≤ 2 interactions.
- **AC-6.1.2** Every public reference page exposes a canonical URL and breadcrumb (where applicable).

### Edge Cases
- Deep-linked provisional entity: render with provisional labeling + `noindex`, no broken nav.
- Role-gated URL accessed without permission: redirect to sign-in or a friendly 403, never a blank.

### Security Considerations
- Role-gated routes enforced server-side (RBAC/RLS), not just hidden in nav (mirrors FR-5.0.7).

### Accessibility
- A persistent **Skip to content** link; landmark regions (`header`/`nav`/`main`/`footer`); logical heading hierarchy site-wide.

### Performance
- Static/ISR for reference pages; client-side nav via Next.js App Router with prefetch on intent.

### Future Expansion
- Localized URL trees (Phase 2/3); per-region home; mobile-app deep links.

---

## 2. Responsive Breakpoints & Conventions

### Purpose
Establish the breakpoint contract every page/component spec references, so "desktop/tablet/mobile" behaviors are precise.

### Breakpoints (token names in Volume 7; representative widths)

| Name | Range | Layout intent |
|---|---|---|
| `mobile` | ≤ 639 px | Single column; bottom-anchored primary actions; sticky search affordance. |
| `tablet` | 640–1023 px | 1–2 columns; collapsible side rails; touch-first. |
| `desktop` | ≥ 1024 px | Multi-column; persistent rails; hover affordances; ≥1440 px wide-content cap. |

### Requirements

| ID | Level | Requirement |
|---|---|---|
| UX-6.2.1 | MUST | All pages MUST be fully usable and pass WCAG 2.2 AA at each breakpoint, including 200%/400% zoom and reflow (no horizontal scrolling at 320 px width). |
| UX-6.2.2 | MUST | Primary actions (search, report, verify) MUST be reachable without horizontal scroll on mobile and within thumb reach where bottom-anchored. |
| UX-6.2.3 | MUST | Touch targets ≥ 44×44 px (WCAG 2.2 Target Size AA: 24×24 minimum; we adopt 44 as standard). |
| UX-6.2.4 | MUST | Hover-only affordances MUST have non-hover (focus/tap) equivalents. |
| UX-6.2.5 | SHOULD | Respect `prefers-reduced-motion`, `prefers-color-scheme`, and `prefers-contrast`. |

### Acceptance Criteria
- **AC-6.2.1** At 320 px width and 400% zoom, content reflows to a single column with no loss of function and no horizontal scroll.
- **AC-6.2.2** Every interactive control meets the touch-target and focus-visible requirements at all breakpoints.

### Edge Cases / Security / Accessibility / Performance / Future Expansion
- *Edge:* very large text scaling — components wrap, never clip. *Security:* n/a. *Accessibility:* this section *is* the responsive accessibility contract. *Performance:* responsive images (`srcset`), no layout shift (CLS < 0.1). *Future:* container queries as support matures; foldable layouts.

---

## 3. Global Layout (Header / Nav / Search / Footer)

### Purpose
Provide a consistent, trustworthy frame that keeps search and verification one tap away and reinforces calm, transparent tone on every page.

### Background
The frame carries trust signals (calm brand, "free & non-profit-spirited," "not legal advice" footer disclosure) and the omnipresent search. It must be unobtrusive on deep reference pages and prominent on Home.

### Layout (wireframe-in-words)

- **Header (sticky):** Left: ScamWatch wordmark/logo (→ Home). Center (desktop) / below (mobile): compact **SearchBar** (collapses to a search icon that expands on mobile). Right: primary nav (Threats, Academy, Report), then Alerts bell, then account avatar / "Sign in." A subtle trust line ("Free consumer scam intelligence · Know Before You Click™").
- **Main:** page content within a max-width container; full-bleed allowed for hero/maps.
- **Footer:** columns — *Learn* (Academy, Threats), *Act* (Report, Verify with official orgs), *About* (Mission, Transparency, Privacy, Terms, Contact), *Trust* line: "ScamWatch provides consumer-protection information, not legal advice. Always verify with official organizations." Region selector (Florida default), language selector (future), and a "Report a problem / appeal a listing" link.

### Responsive behavior
- **Desktop:** full header with inline search and nav; persistent footer.
- **Tablet:** nav may collapse into a "More" menu; search stays inline or one tap.
- **Mobile:** wordmark + search-icon + hamburger; tapping search expands a full-width input with focus; primary CTAs (Report) reachable via bottom nav or in-menu; footer stacks.

### Components used
SearchBar (§4.1), AlertBanner (§4.8, page-contextual), VerificationCallout (§4.7, footer summary), account/avatar menu.

### States
- **Loading:** header renders immediately (shell); search ready instantly.
- **Auth states:** "Sign in" vs avatar menu (account, my reports, reputation, alerts, sign out; + Moderation if role ≥ moderator).
- **Alert state:** bell shows unobtrusive dot when a relevant local trend or report-follow-up exists.

### Interactions & micro-interactions
- Sticky header condenses on scroll; search remains accessible.
- Bell opens a small panel (recent local trends + report updates); calm, no red-badge alarm by default.
- Skip-to-content as first focusable element.

### Copy tone examples
- Trust line: "Free, independent scam intelligence. We explain before we warn."
- Footer disclosure: "This is consumer-protection information, not legal advice. When in doubt, verify with the official organization."

### Requirements

| ID | Level | Requirement |
|---|---|---|
| UX-6.3.1 | MUST | A SearchBar (or one-tap access to it) MUST be present in the header on every page (UX-6.1.1). |
| UX-6.3.2 | MUST | The footer MUST display the "not legal advice + verify with official orgs" disclosure on every page (FR-5.0.5). |
| UX-6.3.3 | MUST | Header MUST expose region selector (Florida default) influencing alerts/verification routing (FR-5.7.8/FR-5.8.3). |
| UX-6.3.4 | MUST | Account/Moderation entries appear only for authorized roles, enforced server-side. |
| UX-6.3.5 | MUST | The frame MUST avoid alarmist visual language by default (calibrated tone; Principle 6). |
| UX-6.3.6 | SHOULD | Persist a subtle "free / public-benefit" trust signal. |

### Acceptance Criteria
- **AC-6.3.1** Every page renders the header search affordance and the footer disclosure.
- **AC-6.3.2** Changing region updates verification routing and "trending near you" context.
- **AC-6.3.3** Moderation nav is invisible and unreachable for non-moderators (verified server-side).

### Edge Cases
- Extremely long region/locale names: truncate with accessible full label.
- JS disabled: header search degrades to a standard form `GET /lookup`.

### Security Considerations
- Nav gating is cosmetic; authorization is server-enforced. Region selector cannot be used to leak unpublished regional data.

### Accessibility
- Landmarks (`banner`, `navigation`, `contentinfo`); skip link; nav keyboard-operable with visible focus; bell panel is a focus-trapped, dismissible disclosure; disclosure text is real text, not an image.

### Performance
- Header is part of the static shell; no layout shift; search prefetches the results route on focus.

### Future Expansion
- Language switcher; command-palette search (`/`); install-PWA prompt; org/partner header variants.

---

## 4. Reusable Components

Each component below specifies **props**, **states**, and an **interaction contract**. Visual tokens are referenced by name; values live in Volume 7. All components MUST meet WCAG 2.2 AA and the touch-target/focus contract (§2).

### 4.1 SearchBar

- **Purpose:** Single input for Universal Search (FR-5.1); the product's front door.
- **Props:** `value`, `defaultType?` (`auto|phone|url|email|wallet|handle|sender|freetext`), `size` (`hero|compact`), `placeholder`, `onSubmit`, `suggestions?`, `loading`, `region`.
- **States:** idle, focused, typing, suggesting (typeahead), submitting (spinner), error (e.g. rate-limited), disabled.
- **Interaction contract:**
  - Submit on Enter or button; paste-friendly (accepts up to 4,000 chars; FR-5.1.1).
  - Auto-detects type; shows a small "looks like a phone number — search as phone?" override chip when ambiguous (FR-5.1.8).
  - Typeahead suggests only public threats/entities (FR-5.1.9); never leaks unpublished data.
  - On mobile, expands to full width on focus; supports image paste → routes to OCR search (FR-5.1.14, MAY).
  - `aria-live` announces result count after submit; rate-limit error shows calm retry copy (AC-5.1.4).
- **Copy:** placeholder "Paste a link, number, email, or message to check it." Error: "You're searching quickly — give it a few seconds and try again."
- **Edge:** empty submit → inline hint, no navigation; ambiguous short query → guided prompt (FR-5.1 edge).
- **Security:** no client-side fetch of submitted URLs; input length-capped; control chars rejected.
- **Accessibility:** labeled input, combobox pattern for suggestions (`role=combobox`, `aria-expanded`, `aria-activedescendant`), keyboard navigable list, visible focus.
- **Performance:** typeahead P95 ≤ 150 ms; debounced; cancels stale requests.
- **Future:** voice input; share-sheet target; saved searches.

### 4.2 VerdictCard

- **Purpose:** Display the calibrated verdict for a query/entity (FR-5.1.4) — the emotional and informational anchor.
- **Props:** `verdict` (`LikelySafe|NoSignal|UseCaution|LikelyScam|ConfirmedReportedScam`), `confidence` (0–1), `entity` (type+value), `summary`, `lastUpdated`, `reportCount?`, `region?`.
- **States:** loading (skeleton), resolved, no-signal, error.
- **Interaction contract:**
  - Verdict shown as **icon + label + short plain summary** (never color alone; FR-5.0.x / WCAG). Color token per verdict (`--verdict-safe/caution/scam/confirmed/neutral`) is *secondary* to icon+text.
  - Contains/links a ConfidenceMeter (§4.3) and an ExplanationPanel summary (§4.4) and a VerificationCallout (§4.7) — a verdict is never shown without confidence + explanation + verification (FR-5.0.1/5.0.2).
  - `NoSignal` uses neutral styling and calm "we have no reports on this yet" copy + Report CTA (FR-5.1.6) — never green/"safe."
- **Copy examples:** *Likely Scam:* "This looks like a scam. Here's why — and how to check safely." *No Signal:* "We don't have any reports on this yet. That doesn't mean it's safe — here's how to verify." *Likely Safe:* "We have no scam reports for this and it matches a known legitimate source. Still, verify anything that asks for money or codes."
- **Edge:** conflicting signals → `UseCaution` with honest framing (FR-5.6 edge); genuine-but-impersonated entity → safe verdict + "commonly impersonated" note (FR-5.1 edge).
- **Security:** renders only de-identified data; no raw artifact links.
- **Accessibility:** verdict announced via `aria-live=polite`; icon has text alternative; not color-dependent; meets contrast AA.
- **Performance:** server-rendered with the entity; skeleton avoids layout shift.
- **Future:** shareable verdict snippet/OG image; per-verdict next-step micro-flows.

### 4.3 ConfidenceMeter

- **Purpose:** Show calibrated Confidence (0–1) honestly (Principle 5/6).
- **Props:** `confidence` (0–1), `band` (`low|moderate|high`), `showNumeric?`, `origin?` (`community|ai|official|mixed`).
- **States:** low / moderate / high; unknown (no-signal → not shown or "insufficient data").
- **Interaction contract:** renders a labeled band ("Moderate confidence") plus optional numeric; tooltip/expand links to ExplanationPanel; never implies false precision (e.g. avoid "97.3%").
- **Copy:** "We're fairly confident" (high) / "We're somewhat confident" (moderate) / "We're not very confident yet" (low).
- **Edge:** very low confidence → emphasize uncertainty, steer to verification.
- **Security:** don't expose exploitable thresholds (FR-5.6 SEC).
- **Accessibility:** `role=meter` (or `progressbar`) with `aria-valuenow/min/max` and text label; band conveyed in text, not color-only.
- **Performance:** pure render. **Future:** calibration over time visualization.

### 4.4 ExplanationPanel

- **Purpose:** Surface the "why we think this" (FR-5.6) — the differentiator; explain before warning.
- **Props:** `explanation` (the FR-5.6.1 object: `summary`, `signals[]`, `confidence`, `sources[]`, `uncertainty`, `model`), `defaultExpanded?`, `showTechnical?`.
- **States:** collapsed (summary only), expanded (signals/sources/uncertainty), technical (on demand), feedback-submitted.
- **Interaction contract:**
  - One-line plain `summary` always visible without expansion (FR-5.6.2).
  - Expand reveals labeled `signals[]` with direction (scam/safe) + weight + origin badge (community/AI/official; FR-5.6.7), `sources[]`, and an `uncertainty` note ("what could change this").
  - "Was this helpful?" control feeds calibration (FR-5.6.9).
  - Always renders/links a VerificationCallout (FR-5.6.5).
- **Copy:** signals in plain language ("Uses a look-alike domain of a real bank," not jargon; FR-5.6.4).
- **Edge:** conflicting signals surfaced explicitly (FR-5.6 edge); no signals → "we don't have enough information yet."
- **Security:** abstracts internal features; no raw PII; technical view role/permission-aware.
- **Accessibility:** disclosure pattern (`button aria-expanded`), keyboard-operable; origin badges have text; weights textual.
- **Performance:** delivered with the verdict (no extra round-trip; FR-5.6 perf).
- **Future:** per-signal "learn more" → Academy; counterfactual explanations; multilingual.

### 4.5 EntityChip

- **Purpose:** Compact, linkable representation of an Entity (phone/url/email/wallet/handle/sender) across results, threat/campaign pages, and the wizard.
- **Props:** `type`, `value` (normalized, de-identified for display), `miniVerdict?`, `confidence?`, `impersonates?`, `href`.
- **States:** default, hover/focus, scam-flagged (subtle), genuine-but-impersonated, provisional/under-review.
- **Interaction contract:** click/tap → Entity detail (FR-5.4); shows type icon + truncated value (full value via title/`aria-label`); mini verdict dot is icon+text, not color-only; provisional chips labeled "under review."
- **Copy:** tooltip "Tap to see what we know about this number/link."
- **Edge:** very long URLs truncate middle with accessible full value; genuine entity chip never styled as scam.
- **Security:** display value is de-identified; no raw third-party PII.
- **Accessibility:** link with descriptive `aria-label` ("Phone +1 888 555 1234, likely scam, view details"); focus-visible; ≥44 px target.
- **Performance:** trivial. **Future:** inline expand preview; copy-to-clipboard.

### 4.6 ReportWizardStep

- **Purpose:** One step of the multi-step Report wizard (FR-5.2); reusable shell enforcing trauma-aware, optional-by-default intake.
- **Props:** `stepIndex`, `totalSteps`, `title`, `fields`, `optional` (default true for sensitive fields), `onNext`, `onBack`, `onSaveResume`, `validation`.
- **States:** active, completed, error, saving, uploading (for screenshot step), de-id-preview, dedupe-match.
- **Interaction contract:**
  - Progress indicator (step X of N); Back/Next; Save-and-resume (FR-5.2.12).
  - Sensitive fields (amount lost, personal detail) clearly optional with supportive helper text (FR-5.2.9).
  - Upload step shows OCR progress ("reading your screenshot…"), then **extracted entities for confirmation** (FR-5.2.4) and a **de-identification preview** the user can extend (FR-5.2.10).
  - On dedupe match, shows "this looks similar to a known scam" and links into the existing signal (FR-5.2.6) — framed as helpful, not dismissive.
- **Copy:** "Only share what you're comfortable with. Nothing here is required." / Upload: "We'll automatically hide your personal details before anything is saved."
- **Edge:** OCR failure → manual entry fallback (FR-5.2 edge); over/under-redaction → user can adjust in preview.
- **Security:** signed-URL upload, server-side scan, EXIF strip; de-identification before store-for-display (SEC-5.2.*).
- **Accessibility:** each step a labeled region; errors via `aria-describedby`; file upload via button+drag+paste; progress announced; no time pressure / no urgency dark patterns.
- **Performance:** upload+OCR+de-id perceived ≤ 6 s P95 with progressive UI; dedupe ≤ 800 ms (FR-5.2 perf).
- **Future:** in-app camera with on-device pre-redaction; forwarding intake.

### 4.7 VerificationCallout

- **Purpose:** Render the official-org handoff(s) (FR-5.7) — mandatory beside every verdict and on recovery/confirmation surfaces.
- **Props:** `orgs[]` (`{org, action, url, phone?, region}`), `context` (threat type/region), `variant` (`inline|checklist`), `victimMode?`.
- **States:** default (inline), checklist (victim "what to do now"), empty-fallback (FTC general).
- **Interaction contract:** lists real official links labeled "(opens official site)"; `victimMode` renders a prioritized action checklist (contact bank, freeze credit, report to IC3…; FR-5.7.5); chooses orgs by threat+region (FR-5.7.3); shows "not legal advice" adjacent (FR-5.7.9).
- **Copy:** "To confirm or report this, contact the FTC (opens official site)." Victim: "First, contact your bank. Then freeze your credit. Then report to the FBI's IC3."
- **Edge:** no clean org → FTC fallback; outside launch region → national orgs + honest gap note.
- **Security:** allowlisted official URLs only; `rel="noopener noreferrer"`; user content can't inject a "verification" link (SEC-5.7.1).
- **Accessibility:** descriptive link text, keyboard-reachable, screen-reader clear; checklist is an ordered list.
- **Performance:** registry cached; no added latency.
- **Future:** deep-link prefill into official forms; warm handoff to local nonprofits.

### 4.8 AlertBanner

- **Purpose:** Non-intrusive surface for local trending campaigns and report follow-ups (FR-5.8).
- **Props:** `severity` (`info|trend`), `title`, `body`, `region`, `href`, `dismissible`, `onDismiss`.
- **States:** visible, dismissed (persisted), reduced-motion variant.
- **Interaction contract:** calm, non-alarming; dismissible and remembered; links to the relevant Threat/Campaign page (never a raw scam URL; SEC-5.8.1); respects digest/rate limits (FR-5.8.7).
- **Copy:** "Reports of toll-road text scams are rising in your area this week. Here's how to spot them."
- **Edge:** sparse region → no banner (FR-5.8 edge); no region set → state/national, labeled.
- **Security:** coarse location only; links stay on-site.
- **Accessibility:** `role=status` (not `alert`, to avoid aggressive interruption); dismiss button labeled; not color-only; honors `prefers-reduced-motion`.
- **Performance:** served from cached trend aggregates.
- **Future:** personalized watchlist banners; partner broadcasts.

### 4.9 ModerationActionBar

- **Purpose:** The action surface for moderators on a queue item (FR-5.10) — safe, reversible, audited actions.
- **Props:** `item` (report/entity/campaign), `role`, `availableActions[]`, `requiresReason[]`, `onAction`.
- **States:** default, action-pending, requires-reason, confirm-destructive, success, error, disabled-by-role.
- **Interaction contract:** exposes only role-permitted actions (approve/hold/merge/split/de-identify-more/downrank/noindex/reject/escalate; FR-5.10.3); consequential actions require a reason and confirmation; "publish claim about a named individual" path forces human-review acknowledgment (FR-5.10.5); every action writes an audit entry (FR-5.10.6).
- **Copy:** confirm dialog "Reject this report? This will remove it from the queue. Add a reason for the audit log."
- **Edge:** conflicting concurrent moderation → last-action-wins + full history (FR-5.10 edge); destructive/legal actions `admin`-gated.
- **Security:** server-enforced RBAC; reason + actor + timestamp logged immutably; MFA-protected session (SEC-5.10.*).
- **Accessibility:** keyboard-operable, confirmations are focus-trapped dialogs, actions have clear labels and consequences.
- **Performance:** action P95 ≤ 500 ms; optimistic UI with rollback on failure.
- **Future:** bulk actions; AI-recommended action with confidence; SLA timers.

---

## 5. Page Specs

### 5.1 Home

- **Purpose:** Convert "I just got something suspicious" into a search in seconds; reassure; surface local alerts and the path to learn/report (P1, P3).
- **Background:** Search-forward, calm, trust-building. Not a marketing splash — a tool.
- **Layout (wireframe-in-words):** Hero with concise value line ("Check any link, number, email, or message — Know Before You Click™") and a large **SearchBar** (`size=hero`). Below: a contextual **AlertBanner** (local trends). Then three calm entry cards: *Check something* (search), *Report a scam* (wizard), *Learn to spot scams* (Academy). A "How it works: we explain before we warn" strip (transparency). Footer disclosure.
- **Responsive:** *Desktop* centered hero, inline search, 3-up cards. *Tablet* hero + search, 2-up cards. *Mobile* full-width search front-and-center, cards stack, Report reachable via bottom action.
- **Components:** SearchBar (4.1), AlertBanner (4.8), VerificationCallout (4.7, summarized in footer), entry cards.
- **States:** loading (instant shell + search), alert present/absent, region-set/unset.
- **Interactions:** focusing search expands on mobile; example chips ("Try: a toll-road text") prefill respectfully (non-alarming).
- **Copy tone:** "Got a suspicious text, call, or email? Paste it here and we'll help you understand it." (calm, non-blaming).
- **Explainability pattern:** Home teaches the model: a short "we show our reasoning and point you to official sources" trust line.
- **Requirements:** UX-6.5.1.1 MUST place a hero SearchBar above the fold at all breakpoints. UX-6.5.1.2 MUST show local AlertBanner when a corroborated trend exists. UX-6.5.1.3 MUST present Report and Academy as first-class entries. UX-6.5.1.4 MUST avoid alarmist hero imagery (Principle 6).
- **Acceptance:** AC-6.5.1.1 hero search is focusable and submits a query on every breakpoint; AC-6.5.1.2 a corroborated FL trend renders a calm banner.
- **Edge:** no alerts → omit banner gracefully; returning user → optional "your recent checks."
- **Security:** no auto-fetch of example URLs; example chips are inert strings.
- **Accessibility:** single H1; search is the first major focus stop after skip link; cards are links with descriptive labels.
- **Performance:** static/ISR; LCP < 2.5 s; search route prefetched on focus.
- **Future:** personalized home; PWA install nudge; localized hero.

### 5.2 Universal Search Results

- **Purpose:** Present the verdict + explanation + related entities/threats/campaigns + verification for a query (FR-5.1).
- **Background:** The payoff surface for the front door; must be instantly legible to distressed users.
- **Layout:** Top: query echo + detected type (with override chip if ambiguous). Primary: **VerdictCard** (4.2) with embedded **ConfidenceMeter** (4.3) and **ExplanationPanel** summary (4.4) and **VerificationCallout** (4.7). Secondary: related **EntityChips** (other extracted entities), linked **Threat** summary, and **Campaign** "trending near you" note if applicable. Persistent "Report this" CTA prefilling the wizard (FR-5.1.11).
- **Responsive:** *Desktop* two-column (verdict left, related right). *Tablet* stacked with verdict first. *Mobile* single column: VerdictCard → Explanation → Verification → related chips → Report CTA.
- **Components:** VerdictCard, ConfidenceMeter, ExplanationPanel, VerificationCallout, EntityChip, AlertBanner (if trending).
- **States:** loading (skeleton verdict), resolved, **no-signal** (calm, Report CTA), error (e.g. rate-limited → friendly retry), ambiguous-type (override UI).
- **Interactions:** type-override re-runs search; expanding ExplanationPanel reveals signals; tapping an EntityChip opens its detail; "Report this" deep-links to wizard with entity prefilled.
- **Copy tone:** see VerdictCard examples; no-signal: "We don't have reports on this yet — here's how to check it safely."
- **Explainability pattern:** verdict + confidence + one-line explanation visible immediately; full reasoning one tap away; verification always present.
- **Requirements:** UX-6.5.2.1 MUST render VerdictCard with confidence, explanation summary, and verification together (FR-5.0.1/2). UX-6.5.2.2 MUST render `NoSignal` neutrally with a Report CTA (FR-5.1.6). UX-6.5.2.3 MUST never auto-open/fetch the searched URL (FR-5.1.7). UX-6.5.2.4 MUST offer type override when ambiguous (FR-5.1.8).
- **Acceptance:** AC-6.5.2.1 a resolved result shows verdict+confidence+explanation+verification; AC-6.5.2.2 a no-signal result shows neutral styling + Report CTA, never "safe"; AC-6.5.2.3 rate-limited search shows a calm retry (AC-5.1.4).
- **Edge:** multi-entity query → primary verdict + secondary chips; genuine-impersonated entity → safe verdict + "commonly impersonated."
- **Security:** de-identified display; server-side URL handling only.
- **Accessibility:** result count + verdict announced via `aria-live`; verdict not color-only; keyboard path verdict→explanation→verification→chips.
- **Performance:** P95 ≤ 1,200 ms cached, ≤ 2,500 ms with AI for unknowns (FR-5.1 perf); skeleton prevents CLS.
- **Future:** compare multiple entities; saved/shared results; OG verdict cards.

### 5.3 Threat Detail

- **Purpose:** Canonical explainer for a scam pattern (FR-5.3); primary read + AI-citation surface.
- **Layout:** H1 threat name + taxonomy badge + last-updated + calibrated trend chip. Plain-language summary. Sections: *What it is*, *How it works* (numbered), *How to recognize* (red-flag list), *What to do* / *If it already happened* (non-blaming) with **VerificationCallout**. Sidebar/below: linked **EntityChips**, related **Campaigns**, Academy cross-links, "Report a sighting" CTA.
- **Responsive:** *Desktop* content + sticky sidebar (entities/verify). *Tablet* content then sidebar. *Mobile* single column; verification surfaced early after summary.
- **Components:** VerificationCallout, EntityChip, ConfidenceMeter (trend), AlertBanner (if locally trending), cross-link cards.
- **States:** rich (well-corroborated), sparse/emerging (honest low-data framing), stale ("last active" shown).
- **Interactions:** expand "how it works" steps; entity chips → detail; report-sighting → wizard prefilled with threat.
- **Copy tone:** "If this happened to you, you're not alone and it's not your fault. Here's what to do next."
- **Explainability pattern:** trend shown with Confidence; entities carry mini-verdicts; verification always present.
- **Requirements:** UX-6.5.3.1 MUST include what/how/recognize/do/verify sections (FR-5.3.2). UX-6.5.3.2 MUST show calibrated trend with confidence (FR-5.3.3). UX-6.5.3.3 MUST present non-blaming victim guidance + verification. UX-6.5.3.4 MUST emit discoverability metadata (FR-5.13).
- **Acceptance:** AC-6.5.3.1 all five sections render with ≥1 verification; AC-6.5.3.2 sparse threats show emerging framing, not false confidence.
- **Edge:** multi-category threat → primary badge + secondary tags; stale → honest "last active."
- **Security:** de-identified entities only; editorial gate (FR-5.3.10).
- **Accessibility:** semantic headings, ordered "how it works," skip-to-verify, non-color trend.
- **Performance:** static/ISR; LCP < 2.5 s; trend hydrates async.
- **Future:** multilingual; printable one-pager; embeddable widget.

### 5.4 Entity Detail

- **Purpose:** Evidence-and-explanation page for a specific fraud-infrastructure identifier (FR-5.4); target of search permalinks.
- **Layout:** Header: type icon + normalized (de-identified) value + **VerdictCard** (verdict/confidence/explanation summary). Body: **ExplanationPanel** (full), de-identified report count/recency, linked **Threats**/**Campaigns** (EntityChips/cards), "commonly impersonates / is impersonated by" relationships, status changes (taken down/sinkholed). Footer of card: **VerificationCallout** + "Report this entity" + **Appeal/correction link**.
- **Responsive:** *Desktop* verdict header + two-column body (explanation | relationships). *Tablet/Mobile* stacked: verdict → explanation → relationships → verify → appeal.
- **Components:** VerdictCard, ConfidenceMeter, ExplanationPanel, EntityChip, VerificationCallout.
- **States:** confirmed-reported, likely-scam, caution, genuine-but-impersonated, provisional/under-review (`noindex`), taken-down.
- **Interactions:** expand explanation; navigate to threats/campaigns; open appeal flow; report this entity.
- **Copy tone:** genuine-impersonated: "This is NOT the official IRS website. The real IRS is at irs.gov."
- **Explainability pattern:** full ExplanationPanel is central here; clear genuine-vs-fraud distinction.
- **Requirements:** UX-6.5.4.1 MUST distinguish genuine vs fraudulent entity clearly (FR-5.4.4). UX-6.5.4.2 MUST show a visible appeal/correction path (FR-5.4.6). UX-6.5.4.3 MUST `noindex` provisional/low-confidence entities (FR-5.4.9). UX-6.5.4.4 MUST never show raw third-party PII (FR-5.4.7).
- **Acceptance:** AC-6.5.4.1 a fraudulent look-alike shows verdict+explanation+clear "not the real X"+verification+appeal; AC-6.5.4.2 provisional entity is labeled and `noindex`.
- **Edge:** recycled number/shared infra → time-decayed confidence + scoped verdict; compromised legit domain → "compromised, not malicious" framing.
- **Security:** de-identification; appeal flow; bot-guard against graph scraping (SEC-5.4.*).
- **Accessibility:** verdict not color-only; appeal link keyboard-reachable; relationships are navigable lists.
- **Performance:** ISR-cached; relationships paginated/async; TTFB ≤ 300 ms cached.
- **Future:** WHOIS/passive-DNS enrichment; graph viz; takedown-API status.

### 5.5 Campaign Detail

- **Purpose:** Show a correlated cluster and *why it's grouped* with calibrated linkage (FR-5.5); intelligence surface (P6) feeding alerts.
- **Layout:** Header: campaign label + status (active/waning/dormant) + last-updated + linkage-confidence summary. Body: correlation rationale (**ExplanationPanel** variant), member **EntityChips** (each with per-link confidence), representative de-identified reports, geographic heatmap + timeline (with text/table equivalents), linked **Threats**, **VerificationCallout**, "trending near me" indicator. Analyst-only: merge/split controls (role-gated).
- **Responsive:** *Desktop* map/timeline + member list side-by-side. *Tablet* stacked. *Mobile* summary → rationale → members → map (with table fallback) → verify.
- **Components:** ExplanationPanel, EntityChip, VerificationCallout, ConfidenceMeter, map/timeline (accessible), ModerationActionBar (analyst merge/split).
- **States:** active, waning, dormant, provisional (`noindex`), single-entity "emerging cluster."
- **Interactions:** expand correlation rationale; member chips → entity detail; analysts merge/split (audited).
- **Copy tone:** "We've grouped these because they share the same fake-website kit and appeared in the same week. We're moderately confident they're related."
- **Explainability pattern:** correlation basis stated in plain language with confidence; per-link confidence on members.
- **Requirements:** UX-6.5.5.1 MUST state correlation basis with confidence (FR-5.5.3). UX-6.5.5.2 MUST show per-member linkage confidence (FR-5.5.2). UX-6.5.5.3 MUST provide text/table equivalents for map/timeline. UX-6.5.5.4 MUST `noindex` provisional campaigns (FR-5.5.9).
- **Acceptance:** AC-6.5.5.1 members list with per-link confidence + plain rationale; AC-6.5.5.2 an analyst split is audited (actor/time/reason).
- **Edge:** over/under-merge → split/merge tooling + honest low-confidence labels; single-entity → "emerging," not "campaign."
- **Security:** aggregation can't re-identify victims; partner export RBAC-gated/logged (SEC-5.5.*).
- **Accessibility:** map/timeline have accessible equivalents; status/confidence not color-only.
- **Performance:** materialized aggregates; map/timeline lazy-loaded; TTFB ≤ 400 ms cached.
- **Future:** actor-attribution (heavily caveated); real-time emergence; cross-region correlation.

### 5.6 Report Wizard (multi-step)

- **Purpose:** Frictionless, privacy-protective, trauma-aware scam reporting (FR-5.2).
- **Background:** Highest-stakes UX for victims (P2) and the platform's data engine. Sensitive by default → optional, supportive, transparent about de-identification.
- **Step model (each a ReportWizardStep §4.6):**
  1. **What happened?** — choose type (text/email/call/website/DM/marketplace/in-person) (FR-5.2.1).
  2. **Show us** — paste content and/or **upload screenshot**; OCR runs; extracted entities shown for confirmation (FR-5.2.4); **de-identification preview** (FR-5.2.10).
  3. **Optional context** — amount/date/region/channel, all optional, supportive copy (FR-5.2.8/9).
  4. **Review & submit** — final de-id preview, dedupe match note if any (FR-5.2.6/7), consent/disclosure, submit.
- **Layout:** Centered single-column card with progress (step X of N), Back/Next, Save-and-resume. Upload step has progress + entity-confirmation list + redaction preview.
- **Responsive:** *Desktop* centered 1-column (max ~640px). *Tablet/Mobile* full-width; sticky Next; large touch targets; upload supports camera capture on mobile (future on-device pre-redaction).
- **Components:** ReportWizardStep, EntityChip (extracted entities), de-identification preview, VerificationCallout (on confirmation), ConfidenceMeter (preliminary read).
- **States:** active, uploading, OCR-processing, de-id-preview, dedupe-match, validation-error, saving, submitting, submitted.
- **Interactions:** type selection branches fields; "reading your screenshot…" progress; confirm/correct extracted entities; extend redaction; preliminary "this resembles a known scam" read (labeled preliminary; FR-5.2.7).
- **Copy tone:** "Only share what you're comfortable with — nothing is required." / "We'll hide your personal details automatically before saving anything." / Victim: "Thank you for reporting. This helps protect others. It's not your fault."
- **Explainability pattern:** preliminary read carries confidence + "preliminary, verify" caveat; de-id preview shows exactly what's stored (transparency).
- **Requirements:** UX-6.5.6.1 MUST allow anonymous submission (FR-5.2.2). UX-6.5.6.2 MUST show a de-identification preview before storing-for-display (FR-5.2.10). UX-6.5.6.3 MUST make sensitive fields optional with trauma-aware copy (FR-5.2.9). UX-6.5.6.4 MUST show dedupe linkage as helpful, not dismissive (FR-5.2.6/7). UX-6.5.6.5 MUST queue for moderation, not auto-publish (FR-5.2.11).
- **Acceptance:** AC-6.5.6.1 an anonymous user completes a report and gets a receipt; AC-6.5.6.2 the user can extend redaction in preview and the change persists; AC-6.5.6.3 a duplicate links into existing signal with helpful framing.
- **Edge:** OCR fail → manual entry; over/under-redaction adjustable; partial save/resume; user pastes their own SSN by mistake → detect, refuse to store, warn (FR-5.1/5.2 edge).
- **Security:** signed-URL upload + scan + EXIF strip; mandatory pre-display de-identification; rate-limit/bot-check anonymous submits; SSRF-safe URL fields (SEC-5.2.*).
- **Accessibility:** labeled steps, `aria` progress, field errors via `aria-describedby`, accessible file upload (button+drag+paste), no urgency/pressure dark patterns, keyboard-complete.
- **Performance:** upload+OCR+de-id perceived ≤ 6 s P95 with progressive UI; dedupe ≤ 800 ms; heavy correlation async (FR-5.2 perf).
- **Future:** forwarding intake; in-app camera w/ on-device pre-redaction; save drafts to account.

### 5.7 Report Confirmation

- **Purpose:** Close the loop with reassurance, a receipt/permalink, and — critically for victims — the official-reporting handoff and "what to do now" checklist (FR-5.2.14, FR-5.7.5).
- **Layout:** Calm confirmation header ("Thanks — your report helps protect others"), receipt/permalink, preliminary read (if any, labeled), prominent **VerificationCallout** (`victimMode` checklist when money/engagement indicated), links to relevant Threat/Academy, optional "create an account to track this report."
- **Responsive:** single column all breakpoints; checklist scannable; CTAs thumb-reachable on mobile.
- **Components:** VerificationCallout (checklist variant), ConfidenceMeter (preliminary), Academy/Threat cross-links.
- **States:** standard, victim-mode (supportive, prioritized actions), anonymous (offer optional account), error (submission failed → retry without losing data).
- **Interactions:** copy/share receipt; open official links (labeled "opens official site"); optional account creation.
- **Copy tone:** "Thank you. Reporting this helps others avoid the same scam — and it's not your fault this happened." Victim checklist leads with bank/credit/IC3 steps.
- **Explainability pattern:** preliminary read clearly caveated; verification front-and-center.
- **Requirements:** UX-6.5.7.1 MUST present a receipt/permalink (FR-5.2.14). UX-6.5.7.2 MUST surface verification, with `victimMode` checklist when applicable (FR-5.7.5). UX-6.5.7.3 MUST use non-blaming copy (Principle 2).
- **Acceptance:** AC-6.5.7.1 confirmation shows a permalink + ≥1 official handoff; AC-6.5.7.2 victim-mode shows a prioritized action checklist with working links.
- **Edge:** submission failure → preserve entered data + retry; anonymous → no forced account.
- **Security:** receipt link unguessable; no third-party PII in confirmation; official links allowlisted.
- **Accessibility:** confirmation announced; checklist is an ordered list; links descriptive.
- **Performance:** instant render post-submit; async work continues in background.
- **Future:** status-tracking timeline; deep-link prefill into official forms; warm nonprofit handoff.

### 5.8 Account / Profile

- **Purpose:** Manage identity, watchlists, alert prefs, privacy/data controls (FR-5.9) — without gating the protective core.
- **Layout:** Tabs/sections: Profile (pseudonymous handle, no PII required), My Reports (status), Watchlist (entities/threats), Alert settings (→ §5.13), Privacy & Data (export, delete), Security (MFA for elevated roles).
- **Responsive:** *Desktop* left nav + content; *Tablet/Mobile* top tabs/accordion, single column.
- **Components:** report-status list, watchlist chips (EntityChip), data export/delete controls.
- **States:** signed-in, loading, empty (no reports/watchlist), deletion-pending.
- **Interactions:** edit handle; manage watchlist; export data (CCPA/GDPR); request deletion (de-attributes, retains de-identified signal per policy; FR-5.9.8).
- **Copy tone:** "Your account is optional. ScamWatch works without it — and we never sell your data."
- **Requirements:** UX-6.5.8.1 MUST offer data export + account deletion (FR-5.9.8). UX-6.5.8.2 MUST default to pseudonymity / minimal PII (FR-5.9.7). UX-6.5.8.3 MUST keep all core features usable without an account (FR-5.9.2).
- **Acceptance:** AC-6.5.8.1 a deletion request removes PII + de-attributes reports within SLA; AC-6.5.8.2 export produces the user's data in a portable format.
- **Edge:** deletion with outstanding moderation items → de-attribute but retain de-identified signal; handle collisions → suffix/disambiguate.
- **Security:** RBAC/RLS; MFA for moderation roles; export/delete identity-verified without excess PII (SEC-5.9.*).
- **Accessibility:** forms labeled; destructive actions confirmed; tab/accordion keyboard-operable.
- **Performance:** profile cached; report statuses paginated.
- **Future:** partner/org accounts; SSO; granular consent dashboard.

### 5.9 Reputation / Contributor

- **Purpose:** Transparently show contribution quality, level, criteria, and (bounded, safe) privileges (FR-5.9.3/4/6).
- **Layout:** Reputation summary (score + band), level + next-level criteria, contribution history (reports → corroborated/verified/declined with reasons), helpful-explanation feedback stats, privileges list (clearly bounded — no unilateral publish).
- **Responsive:** *Desktop* score panel + history table; *Tablet/Mobile* stacked, history as cards.
- **Components:** reputation meter, level/criteria card, contribution history list, EntityChip links to one's reports.
- **States:** new contributor (empty/encouraging), rising, penalized (explained), disputed.
- **Interactions:** view criteria; see why a report was corroborated/declined; contest a reputation decision (FR-5.9 edge).
- **Copy tone:** "Your reports have helped confirm 12 scams. Accurate reporting raises your standing — volume alone doesn't." Penalty: "A few reports couldn't be corroborated, which lowered your score. Here's why."
- **Requirements:** UX-6.5.9.1 MUST show transparent reputation breakdown (FR-5.9.6). UX-6.5.9.2 MUST state level criteria + bounded privileges (FR-5.9.4). UX-6.5.9.3 MUST explain penalties (FR-5.9.5).
- **Acceptance:** AC-6.5.9.1 the page shows score breakdown, level criteria, and report outcomes with reasons; AC-6.5.9.2 a penalty shows an explainable reason and a contest path.
- **Edge:** Sybil/gaming → privileges bounded, signal down-weighted (FR-5.9 edge); disputes visible/contestable.
- **Security:** reputation can't itself publish claims; least-privilege; pseudonymity preserved.
- **Accessibility:** meters have text labels; history navigable; criteria in plain language.
- **Performance:** reputation precomputed/cached (event-driven).
- **Future:** badges; contributor analytics; trusted-partner tiers.

### 5.10 Moderation Console

- **Purpose:** Trust-and-safety workspace to review and act on queue items safely with audit (FR-5.10); role ≥ moderator.
- **Layout:** Left: filterable/sortable queue (new reports, flagged entities, dedupe conflicts, appeals), AI-prioritized. Center: item detail (de-identified content, **ExplanationPanel**, dedupe candidates, history). Right/bottom: **ModerationActionBar** (§4.9) with role-permitted actions + reason capture. Persistent audit-trail view per item.
- **Responsive:** *Desktop* three-pane. *Tablet* two-pane (queue + detail; actions in a bar/drawer). *Mobile* supported but secondary: stacked queue → detail → actions (for triage on the go).
- **Components:** queue list (virtualized), ExplanationPanel, ModerationActionBar, EntityChip, audit-log view, appeal-resolution form.
- **States:** loading, empty queue, item-selected, action-pending, requires-reason, confirm-destructive, appeal-open, escalated, success/error.
- **Interactions:** triage (approve/hold/merge/split/de-id-more/downrank/noindex/reject/escalate); resolve appeals (correct/remove/retain-with-context) with outcome logged + communicated (FR-5.10.4); "publish claim re: named individual" forces human-review acknowledgment (FR-5.10.5); bulk triage for brigading.
- **Copy tone:** internal/operational but precise; confirmations spell out consequences and require a reason.
- **Explainability pattern:** AI provides per-item summary + recommended action *with confidence* — advisory only; humans decide consequential publishes.
- **Requirements:** UX-6.5.10.1 MUST gate actions by role server-side (FR-5.10.9). UX-6.5.10.2 MUST require reason + confirmation for consequential actions and log them immutably (FR-5.10.3/6). UX-6.5.10.3 MUST force human-review ack for named-individual claims (FR-5.10.5). UX-6.5.10.4 MUST surface the appeal workflow and record outcomes (FR-5.10.4).
- **Acceptance:** AC-6.5.10.1 a below-threshold report stays queued and unindexed until approved; AC-6.5.10.2 every action writes an audit entry (actor/time/reason); AC-6.5.10.3 an appeal can be resolved and the outcome is logged + communicated.
- **Edge:** concurrent moderation → last-action-wins + history; legal takedown → `admin`-gated escalation; mass false-flags → bulk tools + reputation weighting.
- **Security:** RBAC/RLS, MFA, tamper-evident audit log, role-gated access to raw pre-de-identified artifacts with its own logging (SEC-5.10.*).
- **Accessibility:** fully keyboard-operable, focus-trapped confirmations, clear action labels/consequences, queue navigable by keyboard.
- **Performance:** queue paginated/virtualized; AI summaries precomputed; action P95 ≤ 500 ms.
- **Future:** tiered auto-publish for very-high-confidence patterns; AI-assisted appeal triage; SLA timers; partner-org collaboration.

### 5.11 Academy

- **Purpose:** Free, evergreen scam-literacy library; always-free protective core (FR-5.11).
- **Layout:** Academy home: category grid (per threat taxonomy) + featured guides + "what to do if you've been scammed." Lesson page: H1, est. read time, plain-language body, red-flag checklists, optional interactive ("spot the red flags"), VerificationCallout, "last reviewed" provenance, cross-links to relevant Threats.
- **Responsive:** *Desktop* category grid + sidebar; *Tablet* 2-up; *Mobile* single column, scannable checklists.
- **Components:** lesson cards, checklists, accessible interactive quiz, VerificationCallout, cross-link chips.
- **States:** standard, interactive (with non-JS fallback), recovery-topic (gentle framing), stale (review flag).
- **Interactions:** take a quiz (accessible), expand checklists, jump to a Threat, share/print (community).
- **Copy tone:** supportive, plain-language; recovery content non-blaming with crisis/official resources.
- **Explainability pattern:** lessons reference how ScamWatch reasons and always route to official verification.
- **Requirements:** UX-6.5.11.1 MUST keep core Academy free to anonymous users (FR-5.11.3). UX-6.5.11.2 MUST cross-link Academy ↔ Threats (FR-5.11.2). UX-6.5.11.3 MUST provide accessible non-JS fallback for interactives (FR-5.11.4). UX-6.5.11.4 MUST emit discoverability metadata (FR-5.11.6/FR-5.13).
- **Acceptance:** AC-6.5.11.1 all core lessons readable without an account; AC-6.5.11.2 an interactive has a usable non-JS fallback.
- **Edge:** stale lesson → "last reviewed" + review flag; sensitive topics → gentle framing + resources.
- **Security:** editorial gate; comments (if any) moderated; no PII to read.
- **Accessibility:** full AA — semantic structure, captions/transcripts for media, accessible interactives, plain reading level.
- **Performance:** static/ISR; great CWV; media lazy-loaded.
- **Future:** multilingual courses; educator certificates; email mini-courses; embeddable widgets.

### 5.12 Transparency

- **Purpose:** Publish accountability data + methodology (FR-5.12); trust-building surface.
- **Layout:** Latest report summary (key figures with data-table equivalents for charts), methodology section (how verdicts/confidence are produced, data collected, retention, de-identification), data-practices ("we never sell your data"), downloadable machine-readable data, archive of past reports, "not legal advice" + privacy/terms links.
- **Responsive:** *Desktop* charts + narrative; *Tablet/Mobile* charts collapse to tables, single column.
- **Components:** accessible charts (with table fallback), methodology accordion, download links.
- **States:** current report, archived report, machine-readable download.
- **Interactions:** toggle chart/table; download JSON/CSV; expand methodology.
- **Copy tone:** candid, including weaknesses ("Here's where our model is still uncertain").
- **Requirements:** UX-6.5.12.1 MUST provide data-table equivalents for all charts (FR-5.12 a11y). UX-6.5.12.2 MUST document methodology + retention + de-identification (FR-5.12.2). UX-6.5.12.3 MUST offer machine-readable downloads (FR-5.12.4). UX-6.5.12.4 MUST disclose known weaknesses honestly (FR-5.12.6).
- **Acceptance:** AC-6.5.12.1 every chart has an accessible table; AC-6.5.12.2 a machine-readable dataset is downloadable.
- **Edge:** bad period → still published with context; sensitive blind spots → responsible disclosure (no exploit roadmap).
- **Security:** aggregation prevents re-identification (k-anonymity/thresholding); no evasion-enabling secrets.
- **Accessibility:** semantic HTML reports (not image-only); chart/table parity.
- **Performance:** precomputed/cached/static.
- **Future:** real-time dashboard; third-party audits; standardized schema; regional breakdowns.

### 5.13 Alerts / Settings

- **Purpose:** Configure opt-in alerts (local trends, report follow-ups, watched entities) and notification prefs (FR-5.8).
- **Layout:** Region selector (coarse — county/metro), channels (email/web push), alert types (local trends, my-report updates, watchlist), frequency (immediate/daily digest/weekly), quiet hours, category mutes, unsubscribe-all.
- **Responsive:** single column, grouped toggles; large touch targets on mobile.
- **Components:** region picker (coarse), channel toggles, frequency/quiet-hours controls, watchlist (EntityChips).
- **States:** anonymous (coarse-region banners only, no push without consent), signed-in (full prefs), push-permission states (default/granted/denied), saved.
- **Interactions:** set coarse region; grant push (explicit consent); choose digest; mute categories; unsubscribe.
- **Copy tone:** "We'll only alert you about trends we're confident about — and never more than you choose."
- **Requirements:** UX-6.5.13.1 MUST use coarse, user-chosen location only (FR-5.8.3). UX-6.5.13.2 MUST provide granular prefs + one-click unsubscribe (FR-5.8.6). UX-6.5.13.3 MUST require explicit consent for push. UX-6.5.13.4 MUST never include third-party PII in alerts (FR-5.8.8).
- **Acceptance:** AC-6.5.13.1 changing region updates trend context + verification routing; AC-6.5.13.2 every alert/email includes one-click unsubscribe.
- **Edge:** push denied → graceful email/on-site fallback; no region → state/national, labeled.
- **Security:** coarse geo only; secure push subscriptions; unguessable single-purpose unsubscribe tokens (SEC-5.8.*).
- **Accessibility:** toggles labeled, grouped with fieldset/legend; status announced on save.
- **Performance:** prefs cached; changes apply to next scheduled trend run.
- **Future:** SMS (carefully, to avoid mimicking smishing); watchlist intelligence; mobile push.

### 5.14 Auth Screens

- **Purpose:** Optional sign-in/up via Supabase Auth (email/OTP + OAuth) (FR-5.9.1), minimal-friction, privacy-first.
- **Layout:** Sign-in (email/OTP + OAuth buttons), OTP verify, optional handle setup (pseudonymous), MFA enrollment for elevated roles. Persistent reassurance: "Accounts are optional; the core is always free."
- **Responsive:** centered single-column card all breakpoints; OAuth buttons stack on mobile.
- **Components:** email/OTP form, OAuth buttons, MFA enrollment, handle setup.
- **States:** idle, sending OTP, OTP-sent, verifying, error (rate-limited/invalid), success, MFA-required.
- **Interactions:** request OTP; verify; OAuth redirect; set pseudonymous handle; enroll MFA (role-gated).
- **Copy tone:** "Sign in to track your reports and set alerts. ScamWatch works without an account, and we never sell your data."
- **Requirements:** UX-6.5.14.1 MUST support email/OTP + OAuth (FR-5.9.1). UX-6.5.14.2 MUST default to pseudonymity/minimal PII. UX-6.5.14.3 MUST require MFA for moderation roles (SEC-5.9.1). UX-6.5.14.4 MUST rate-limit OTP requests.
- **Acceptance:** AC-6.5.14.1 a user signs in via OTP and lands authenticated; AC-6.5.14.2 a moderation-role login requires MFA.
- **Edge:** OTP rate-limit → calm retry; OAuth failure → fallback to email; existing handle → disambiguation.
- **Security:** OTP/session hardening, MFA for elevated roles, anti-enumeration on email, RBAC post-auth.
- **Accessibility:** labeled fields, error messaging tied to fields, OTP input accessible, focus management on step change.
- **Performance:** fast OTP send; no blocking spinners beyond necessary.
- **Future:** passkeys/WebAuthn; SSO for partner orgs; progressive account creation from a report.

### 5.15 Error / Empty / Loading States

- **Purpose:** Standardize the non-happy-path UX so it stays calm, helpful, and never alarming (Principle 1/6) — critical because distressed users hit these often.
- **Background:** Empty/no-signal states are common (new entity, sparse region). They must reassure and guide, never imply false safety or scare.
- **Patterns:**
  - **Loading:** skeletons that match final layout (no CLS); progress copy for long ops ("reading your screenshot…"). Spinners only for short waits.
  - **Empty / No-Signal:** neutral illustration + calm copy + a constructive next step (search/report/learn). Search no-signal: "We don't have reports on this yet — here's how to verify safely." Never green/"safe."
  - **Error:** plain-language cause + recovery action; preserve user input (e.g. failed report submit retains data); rate-limit → friendly retry; 404 → search + popular threats; 500 → reassurance + status; offline (PWA) → cached content + "you're offline."
- **Responsive:** all states single-column-friendly; CTAs thumb-reachable on mobile.
- **Components:** skeletons, empty-state block, error block, retry control, AlertBanner (offline).
- **Requirements:** UX-6.5.15.1 MUST never present empty/no-signal as "safe" (FR-5.1.6). UX-6.5.15.2 MUST preserve user input across recoverable errors. UX-6.5.15.3 MUST use skeletons to avoid layout shift (CLS < 0.1). UX-6.5.15.4 MUST keep all state copy calm and non-blaming.
- **Acceptance:** AC-6.5.15.1 a failed report submit can be retried without re-entering data; AC-6.5.15.2 a no-signal search renders neutral, not "safe"; AC-6.5.15.3 loading uses layout-matching skeletons.
- **Edge:** repeated errors → escalate to status link; offline submit → queue + inform.
- **Security:** error messages don't leak internals/stack traces; generic server-error copy.
- **Accessibility:** errors announced via `role=alert`/`aria-live`; focus moved to error; retry keyboard-reachable; reduced-motion skeletons.
- **Performance:** skeletons render instantly from shell; offline served from cache (service worker).
- **Future:** smart recovery suggestions; offline-first report drafting; status-page integration.

---

## 6. Cross-Cutting Patterns (Explainability, Trauma-Aware Copy, Motion)

- **Explainability presentation pattern (applies to every verdict surface):** (1) verdict as **icon + label + one-line plain summary**; (2) **ConfidenceMeter** with a text band (never false precision); (3) **ExplanationPanel** — summary always visible, signals/sources/uncertainty one tap away, origin badges (community/AI/official); (4) **VerificationCallout** always present. No verdict ever appears without all four (enforces FR-5.0.1/2, FR-5.6).
- **Trauma-aware copy rules:** lead with understanding, not alarm; never blame/shame; sensitive fields optional; victim surfaces lead with support + official handoff; avoid urgency/countdown/dark patterns; calibrated hedging when uncertain.
- **Calibrated language rules:** verdict vocabulary is fixed; confidence shown as bands + optional non-spurious numeric; "not legal advice + verify with official org" present on every assertive surface.
- **Color is never the sole signal:** every verdict/confidence/status uses icon + text alongside color tokens (Volume 7).
- **Motion:** subtle, purposeful, `prefers-reduced-motion`-respecting; no alarming animation on scam verdicts.

---

## 7. Cross-Volume Assumptions

- **Design tokens** (colors incl. `--verdict-*`, type scale, spacing, radius, shadow, motion, breakpoint values) are owned by **Volume 7 — Design System**. This volume references token *names* only; if a name here lacks a value, Volume 7 defines it.
- **Functional contracts** for every behavior referenced (search, report intake, OCR/de-id, dedupe, verdicts, explanation, verification, alerts, reputation, moderation, transparency, discoverability) are in **Volume 5 — Functional Requirements**; `FR-5.*` IDs are cited inline and must stay in sync.
- **Verdict vocabulary & Confidence bands** are presented here (VerdictCard/ConfidenceMeter) but scored/calibrated in the **AI volume**; band→label/color mapping should be reconciled with Volume 7 tokens.
- **Auth/RBAC/RLS, MFA, audit-log durability** are detailed in the **Security volume**; this volume assumes server-side enforcement of all role gating shown in UI.
- **Privacy/retention/de-identification specifics** (what's stored, how long, deletion SLA) are owned by the **Privacy/Legal volume**; UX surfaces (de-id preview, export/delete, transparency) reflect those rules.
- **Content (Academy lessons, Threat copy, official-org registry entries)** are owned by content/editorial workstreams; this volume specifies their *containers and patterns*, not the prose.
- **Accessibility baseline** is WCAG 2.2 AA across all pages/components (per shared context); component specs above carry the page-specific obligations.

*End of Volume 6.*
