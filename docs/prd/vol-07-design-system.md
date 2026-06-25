# Volume 7 — Design System

> ScamWatch design system, implemented as design tokens consumed through TailwindCSS. This volume defines the visual and interaction language that makes the product feel **calm, trustworthy, and non-alarmist** — the direct UI expression of Product Principles 1 ("Explain before warning"), 2 ("Respect victims"), and 6 ("Never exaggerate"). It specifies semantic color tokens (light + dark) with measured WCAG 2.2 AA contrast and color-blind-safe choices, a readable typographic scale tuned for older and low-vision users, spacing/radius/elevation/motion scales, the icon system, and component specs (buttons, cards including `VerdictCard`, `ConfidenceMeter`, `ExplanationPanel`, form controls, badges/chips including `EntityChip`). It closes with an accessibility contract (focus, target size ≥24px per WCAG 2.2, contrast, hit areas), a Tailwind theme-extension example, and a CSS-variable token map. All requirements in this volume use the prefix **DS-7**.

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing Scale](#4-spacing-scale)
5. [Radius](#5-radius)
6. [Elevation & Shadow](#6-elevation--shadow)
7. [Motion & Animation Tokens](#7-motion--animation-tokens)
8. [Iconography](#8-iconography)
9. [Buttons](#9-buttons)
10. [Cards (incl. VerdictCard)](#10-cards)
11. [ConfidenceMeter](#11-confidencemeter)
12. [ExplanationPanel](#12-explanationpanel)
13. [Form Controls](#13-form-controls)
14. [Badges & Chips (incl. EntityChip)](#14-badges--chips)
15. [Dark Mode Strategy](#15-dark-mode-strategy)
16. [Accessibility Contract](#16-accessibility-contract)
17. [Tailwind Theme Extension & CSS Variable Map](#17-tailwind-theme-extension--css-variable-map)

---

## 1. Design Principles

### Purpose
Establish the non-negotiable visual/interaction stance so that every component decision can be measured against it, and so that "trust before growth" (shared Principle 8) is encoded in pixels, not just policy.

### Background
ScamWatch users frequently arrive in an anxious or post-victimization state. Conventional security UI leans on red, alarm icons, and urgency — exactly the emotional register scammers exploit. We deliberately invert that. The design language must lower arousal, present evidence calmly, and route the user toward verification rather than panic.

### Requirements
- **DS-7.1.1 (MUST)** The system MUST lead every threat surface with explanation/context before any warning color or alarm affordance is shown (UI expression of shared Principle 1).
- **DS-7.1.2 (MUST)** The system MUST NOT use full-saturation red as a primary surface or large fill. Danger is communicated through bordered, labeled, low-saturation treatments plus text — never color alone (see DS-7.2 and DS-7.14).
- **DS-7.1.3 (MUST)** Every status meaning MUST be conveyed by at least two of {text label, icon, color}, never by color alone (WCAG 1.4.1 Use of Color).
- **DS-7.1.4 (SHOULD)** Copy tokens (button labels, badge text) SHOULD use calibrated, non-accusatory language ("Likely a scam pattern", not "DANGER — SCAM"). Verbatim accusatory strings are prohibited in shared components.
- **DS-7.1.5 (SHOULD)** Default density SHOULD favor readability over information density: generous line-height, ≥16px body text, ≥44px primary touch targets.
- **DS-7.1.6 (MAY)** A higher-density "analyst" theme MAY be offered behind a role gate for `analyst`/`admin` (see Volume 12), but it MUST still satisfy the accessibility contract (DS-7.16).

### Acceptance Criteria
- **AC-DS-7.1.a** Given any page in the threat taxonomy, when it first paints, then an explanatory heading/summary is in the DOM and visually above the first warning-colored element.
- **AC-DS-7.1.b** Given automated linting of component source, when a developer uses `bg-danger-600` (or darker) as a `>30%` viewport fill, then a Stylelint/ESLint rule flags it.
- **AC-DS-7.1.c** Given any status indicator, when inspected, then it contains a visible or `aria`-exposed text label in addition to color.

### Edge Cases
- Extremely high-confidence, time-sensitive threats (active wire fraud) still must not switch to alarm-red flooding; instead they escalate via a persistent banner with a clear verification CTA.
- Right-to-left locales (future i18n, Volume 12): icon directionality and chip ordering must mirror.

### Security Considerations
Visual hierarchy must not be exploitable for clickjacking-style trust transfer — e.g., a user-submitted screenshot must never be styled to look like a ScamWatch verdict. User content renders inside a clearly demarcated, lower-elevation `evidence` container with a "user-submitted" label.

### Accessibility
The principles set the floor: WCAG 2.2 AA contrast, ≥24px targets (≥44px for primary), reduced-motion honored, no color-only meaning.

### Performance
Principles bias toward system fonts and CSS-variable theming (no runtime CSS-in-JS recompute) to keep the critical path light (see DS-7.3, DS-7.17).

### Future Expansion
High-contrast and "low-stimulation" user themes; per-user font-size preference persisted to profile.

---

## 2. Color System

### Purpose
Provide a semantic, theme-able color token set that informs without fear-mongering and is legible to color-blind users and at AA contrast in both light and dark mode.

### Background
We separate **palette** (raw hues) from **semantic tokens** (roles). Components only ever reference semantic tokens, so dark mode and future re-theming are a token remap, not a component rewrite. The "danger/warning" family is intentionally desaturated and always paired with text + icon.

### Color philosophy for risk
| Risk level | Token family | Treatment | Rationale |
|---|---|---|---|
| Informational / educational | `info` (cool teal-blue) | Default; calm, neutral | "Explain before warning" |
| Caution / unverified | `caution` (amber, desaturated) | Border + tinted bg + label | Signals "be careful," not "panic" |
| Likely scam pattern | `danger` (clay-red, desaturated) | Border + soft tint + label + icon; never large fill | Informs; avoids the scammer's urgency palette |
| Verified-safe / resolved | `safe` (green-teal, blue-shifted) | Border + tint + check | Distinguishable from `caution` for deuteranopia |

To stay color-blind-safe, `danger` and `safe` are **not** a pure red/green pair: `danger` is shifted toward clay/orange-red and `safe` toward teal/blue-green, maximizing hue distance for deuteranopes/protanopes. Risk is **always** reinforced by shape (icon) and text.

### Core palette (raw)
| Token | Hex | Note |
|---|---|---|
| `--swatch-ink-900` | `#0F172A` | near-black text |
| `--swatch-ink-700` | `#334155` | secondary text |
| `--swatch-slate-500` | `#64748B` | muted text |
| `--swatch-slate-300` | `#CBD5E1` | borders |
| `--swatch-slate-100` | `#F1F5F9` | subtle bg |
| `--swatch-white` | `#FFFFFF` | base surface |
| `--swatch-teal-600` | `#0E7490` | brand / info |
| `--swatch-teal-500` | `#0891B2` | brand hover |
| `--swatch-amber-600` | `#B45309` | caution text/border |
| `--swatch-amber-100` | `#FEF3C7` | caution tint |
| `--swatch-clay-700` | `#9A3412` | danger text/border |
| `--swatch-clay-600` | `#C2410C` | danger accent |
| `--swatch-clay-50` | `#FFF1EC` | danger tint (light) |
| `--swatch-green-700` | `#0F766E` | safe text/border |
| `--swatch-green-100` | `#CCFBF1` | safe tint |

### Semantic tokens — Light mode
Contrast ratios are foreground-vs-stated-background, measured per WCAG 2.2 (4.5:1 normal text, 3:1 large text / UI components).

| Semantic token | Value | Used on | Contrast | AA |
|---|---|---|---|---|
| `--color-bg` | `#FFFFFF` | page | — | — |
| `--color-surface` | `#FFFFFF` | cards | — | — |
| `--color-surface-muted` | `#F8FAFC` | subtle panels | — | — |
| `--color-border` | `#CBD5E1` | dividers/borders | 1.46:1 vs surface (non-text, decorative) | n/a |
| `--color-border-strong` | `#94A3B8` | input borders | 3.0:1 vs surface | ✅ UI |
| `--color-text` | `#0F172A` | body on bg | 16.9:1 | ✅ |
| `--color-text-muted` | `#475569` | secondary | 7.5:1 | ✅ |
| `--color-text-subtle` | `#64748B` | hints | 4.9:1 | ✅ |
| `--color-brand` | `#0E7490` | links/primary | 5.0:1 on white | ✅ |
| `--color-brand-contrast` | `#FFFFFF` | text on brand | 5.0:1 | ✅ |
| `--color-info-fg` | `#155E75` | info text | 6.9:1 | ✅ |
| `--color-info-bg` | `#ECFEFF` | info panel | — | — |
| `--color-caution-fg` | `#92400E` | caution text | 6.4:1 on caution-bg | ✅ |
| `--color-caution-bg` | `#FEF3C7` | caution panel | — | — |
| `--color-caution-border` | `#B45309` | caution border | 3.3:1 vs surface | ✅ UI |
| `--color-danger-fg` | `#9A3412` | danger text | 6.1:1 on danger-bg | ✅ |
| `--color-danger-bg` | `#FFF1EC` | danger panel | — | — |
| `--color-danger-border` | `#C2410C` | danger border | 3.6:1 vs surface | ✅ UI |
| `--color-safe-fg` | `#0F766E` | safe text | 4.7:1 on safe-bg | ✅ |
| `--color-safe-bg` | `#F0FDFA` | safe panel | — | — |
| `--color-safe-border` | `#0F766E` | safe border | 3.4:1 vs surface | ✅ UI |
| `--color-focus` | `#1D4ED8` | focus ring | 3.3:1 vs white | ✅ UI |

### Semantic tokens — Dark mode
| Semantic token | Value | Used on | Contrast | AA |
|---|---|---|---|---|
| `--color-bg` | `#0B1220` | page | — | — |
| `--color-surface` | `#111A2B` | cards | — | — |
| `--color-surface-muted` | `#0E1626` | subtle panels | — | — |
| `--color-border` | `#27364B` | dividers | non-text | n/a |
| `--color-border-strong` | `#475569` | input borders | 3.1:1 vs surface | ✅ UI |
| `--color-text` | `#E5EDF6` | body | 14.1:1 | ✅ |
| `--color-text-muted` | `#A6B6␣CB`→`#A6B6CB` | secondary | 8.0:1 | ✅ |
| `--color-text-subtle` | `#7E8FA6` | hints | 4.8:1 | ✅ |
| `--color-brand` | `#38BDF8` | links/primary | 7.6:1 on bg | ✅ |
| `--color-brand-contrast` | `#06283A` | text on brand | 8.4:1 | ✅ |
| `--color-info-fg` | `#A5F3FC` | info text | 11.2:1 on info-bg | ✅ |
| `--color-info-bg` | `#0C2A33` | info panel | — | — |
| `--color-caution-fg` | `#FCD34D` | caution text | 9.6:1 on caution-bg | ✅ |
| `--color-caution-bg` | `#3A2A06` | caution panel | — | — |
| `--color-caution-border` | `#D97706` | caution border | 3.5:1 vs surface | ✅ UI |
| `--color-danger-fg` | `#FCA5A5` | danger text | 7.1:1 on danger-bg | ✅ |
| `--color-danger-bg` | `#3A130C` | danger panel | — | — |
| `--color-danger-border` | `#F97316` | danger border | 4.2:1 vs surface | ✅ UI |
| `--color-safe-fg` | `#5EEAD4` | safe text | 9.3:1 on safe-bg | ✅ |
| `--color-safe-bg` | `#06231F` | safe panel | — | — |
| `--color-safe-border` | `#2DD4BF` | safe border | 4.6:1 vs surface | ✅ UI |
| `--color-focus` | `#60A5FA` | focus ring | 5.2:1 vs bg | ✅ UI |

> Note: the `--color-text-muted` dark value is `#A6B6CB` (the visible artifact above is escaped for clarity).

### Requirements
- **DS-7.2.1 (MUST)** Components MUST reference semantic tokens only; raw `--swatch-*` palette values MUST NOT appear in component code.
- **DS-7.2.2 (MUST)** All text/background pairings MUST meet WCAG 2.2 AA: ≥4.5:1 for body, ≥3:1 for large text (≥18.66px bold / ≥24px) and for UI component boundaries/focus.
- **DS-7.2.3 (MUST)** Risk state MUST NOT rely on hue alone (DS-7.1.3); `danger`/`caution`/`safe`/`info` each pair with a distinct icon and text label.
- **DS-7.2.4 (MUST)** The `danger` family MUST be the desaturated clay tint set, never full-saturation `#FF0000`-class red, and MUST NOT be used as a >30% viewport fill.
- **DS-7.2.5 (SHOULD)** `safe` and `danger` SHOULD remain distinguishable under deuteranopia/protanopia simulation (hue-distance check in CI via a color-blind contrast script).
- **DS-7.2.6 (MUST)** Dark mode MUST be a token remap (DS-7.15); no component may hardcode a light-only value.

### Acceptance Criteria
- **AC-DS-7.2.a** Given the token tables above, when run through a contrast checker, then every pairing marked ✅ computes ≥ its required ratio.
- **AC-DS-7.2.b** Given a deuteranopia simulation, when `safe` and `danger` chips are rendered side by side, then they are reported as distinguishable (ΔE and hue-angle thresholds met) by the CI check.
- **AC-DS-7.2.c** Given grep over `/components`, when searching for hardcoded hex, then zero matches outside the token definition file.

### Edge Cases
- Forced-colors / Windows High Contrast Mode: components must rely on `system-color` keywords via `forced-colors: active` media query and not lose meaning.
- User screenshots may themselves contain red alarm UI from scammers; ScamWatch chrome must remain visually distinct (different surface, label) so the user can tell ours from theirs.

### Security Considerations
Do not let attacker-controlled content (uploaded images, report text) inject inline styles; sanitize and render in a sandboxed `evidence` container (ties to Volume 12 upload UX and Volume 9 moderation).

### Accessibility
Covered above; forced-colors fallback required (DS-7.16).

### Performance
Tokens are CSS variables resolved at paint with no JS; theme switch toggles a single attribute (DS-7.15).

### Future Expansion
Additional themes (high-contrast, sepia/low-stimulation); per-threat-category accent tints that still inherit semantic contrast guarantees.

---

## 3. Typography

### Purpose
Define a readable type system tuned for a broad, often-older, sometimes low-vision audience.

### Background
Many scam targets are 55+. We default to a humanist system stack (fast, familiar, no FOUT), generous line-height, and a body size of 16px minimum.

### Families
| Role | Stack | Token |
|---|---|---|
| Sans (UI/body) | `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` | `--font-sans` |
| Serif (long-form education) | `ui-serif, Georgia, Cambria, "Times New Roman", serif` | `--font-serif` |
| Mono (entities: phone/URL/wallet) | `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace` | `--font-mono` |

Mono is used for entity values so look-alike characters (`0/O`, `1/l/I`) are distinguishable — important when displaying scam phone numbers/URLs (ties to `EntityChip`, DS-7.14).

### Scale (1.250 major-third, 16px base)
| Token | Size | Line-height | Weight | Use |
|---|---|---|---|---|
| `--text-xs` | 12px / 0.75rem | 1.5 | 500 | meta, captions (avoid for body) |
| `--text-sm` | 14px / 0.875rem | 1.55 | 400–500 | secondary text |
| `--text-base` | 16px / 1rem | 1.6 | 400 | **body default** |
| `--text-lg` | 18px / 1.125rem | 1.55 | 400 | comfortable body / lead |
| `--text-xl` | 20px / 1.25rem | 1.4 | 600 | card titles |
| `--text-2xl` | 25px / 1.5625rem | 1.3 | 600 | section headings |
| `--text-3xl` | 31px / 1.9375rem | 1.25 | 700 | page H1 |
| `--text-4xl` | 39px / 2.4375rem | 1.2 | 700 | hero |

### Weights
`400` regular, `500` medium (labels), `600` semibold (titles), `700` bold (headings). Avoid `<400` and avoid bold for long body runs.

### Requirements
- **DS-7.3.1 (MUST)** Body text MUST be ≥16px (`--text-base`); `--text-xs` MUST NOT be used for primary reading content.
- **DS-7.3.2 (MUST)** Body line-height MUST be ≥1.5; headings ≥1.2.
- **DS-7.3.3 (MUST)** Type MUST scale with user/browser zoom and rem-based units; no `px`-locked containers that clip text at 200% zoom (WCAG 1.4.4 / 1.4.10).
- **DS-7.3.4 (SHOULD)** Line length for long-form education SHOULD be capped at 60–75ch (`max-w-prose`).
- **DS-7.3.5 (SHOULD)** Entity values (phone/URL/wallet/email) SHOULD render in `--font-mono`.
- **DS-7.3.6 (MAY)** A user font-size preference (Comfortable/Large) MAY scale the base via a root CSS variable.

### Acceptance Criteria
- **AC-DS-7.3.a** Given 200% browser zoom, when any core page is viewed, then no content is clipped or requires 2-D scrolling for a single column (WCAG 1.4.10 Reflow at 320px CSS width).
- **AC-DS-7.3.b** Given text spacing overrides (WCAG 1.4.12), when applied, then no loss of content/function.

### Edge Cases
Very long unbroken entity strings (URLs, wallet addresses) must wrap/truncate with a copy affordance, not overflow.

### Security Considerations
Homoglyph awareness: when displaying a URL/domain entity, render in mono and optionally annotate punycode (`xn--`) so users can spot look-alike-domain scams; never silently render decoded Unicode that masks an IDN-homograph attack.

### Accessibility
rem units, ≥1.5 line-height, reflow at 320px, supports text-spacing overrides.

### Performance
System font stacks → zero web-font download on critical path; no FOIT/FOUT.

### Future Expansion
Optional dyslexia-friendly font toggle; user-set base size persisted (Volume 12 account).

---

## 4. Spacing Scale

### Purpose
A consistent 4px-based spacing rhythm for layout and component internals.

### Background
A single linear-then-modular scale keeps spacing predictable and touch targets generous.

| Token | px | rem | Typical use |
|---|---|---|---|
| `--space-0` | 0 | 0 | reset |
| `--space-1` | 4 | 0.25 | icon-to-label gap |
| `--space-2` | 8 | 0.5 | tight padding |
| `--space-3` | 12 | 0.75 | chip padding |
| `--space-4` | 16 | 1 | base padding / gap |
| `--space-5` | 20 | 1.25 | card padding (compact) |
| `--space-6` | 24 | 1.5 | card padding (default) |
| `--space-8` | 32 | 2 | section gap |
| `--space-10` | 40 | 2.5 | block gap |
| `--space-12` | 48 | 3 | major section |
| `--space-16` | 64 | 4 | page rhythm |

### Requirements
- **DS-7.4.1 (MUST)** All spacing MUST come from the scale; arbitrary one-off px values MUST NOT be introduced in components.
- **DS-7.4.2 (MUST)** Interactive controls MUST have padding sufficient to reach the minimum target size (DS-7.16).
- **DS-7.4.3 (SHOULD)** Default card padding SHOULD be `--space-6`.

### Acceptance Criteria
- **AC-DS-7.4.a** Given component source, when spacing utilities are audited, then all map to scale tokens.

### Edge Cases
Dense tables (moderation, analyst) may use `--space-2`/`--space-3` but must not reduce row target height below 32px.

### Security Considerations
n/a (not applicable — purely visual).

### Accessibility
Spacing underpins target size and reflow guarantees.

### Performance
n/a.

### Future Expansion
Density modes (comfortable/compact) keyed off a single multiplier variable.

---

## 5. Radius

### Purpose
Soft, approachable corners reinforce the calm/trustworthy tone.

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 6px | chips, inputs |
| `--radius-md` | 10px | buttons |
| `--radius-lg` | 14px | cards |
| `--radius-xl` | 20px | modals, hero |
| `--radius-full` | 9999px | pills, avatars |

### Requirements
- **DS-7.5.1 (MUST)** Radius MUST be drawn from tokens.
- **DS-7.5.2 (SHOULD)** Cards SHOULD use `--radius-lg`; pills/chips `--radius-full` or `--radius-sm`.

### Acceptance Criteria
- **AC-DS-7.5.a** Given component audit, when radii are checked, then all map to tokens.

### Edge Cases
Nested rounded containers: inner radius = outer − padding to avoid corner mismatch.

### Security Considerations
n/a.

### Accessibility
n/a (radius does not affect AA).

### Performance
n/a.

### Future Expansion
A "sharp" theme variant could remap radii to smaller values.

---

## 6. Elevation & Shadow

### Purpose
Convey layering calmly (no heavy drop shadows that read as "alert").

| Token | Light | Dark | Use |
|---|---|---|---|
| `--shadow-0` | none | none | flush content |
| `--shadow-1` | `0 1px 2px rgba(15,23,42,.06)` | `0 1px 2px rgba(0,0,0,.4)` | cards |
| `--shadow-2` | `0 4px 12px rgba(15,23,42,.08)` | `0 4px 12px rgba(0,0,0,.5)` | popovers |
| `--shadow-3` | `0 12px 32px rgba(15,23,42,.12)` | `0 12px 32px rgba(0,0,0,.6)` | modals |
| `--shadow-focus` | `0 0 0 3px var(--color-focus)` | same | focus ring composition |

### Requirements
- **DS-7.6.1 (MUST)** Elevation MUST come from tokens; shadows MUST remain subtle (no neon/glow alarm shadows).
- **DS-7.6.2 (MUST)** Focus visibility MUST NOT depend on shadow alone (also outline; DS-7.16).
- **DS-7.6.3 (SHOULD)** Dark mode SHOULD lean on surface lightness + border rather than heavy shadow.

### Acceptance Criteria
- **AC-DS-7.6.a** Given a modal, when focused elements appear, then a non-shadow focus indicator is also present.

### Edge Cases
User-submitted evidence container uses `--shadow-0` + border to read as "inset/quoted," distinct from ScamWatch verdict cards.

### Security Considerations
Elevation must not be used to make user content visually impersonate authoritative ScamWatch verdicts.

### Accessibility
Focus never shadow-only; respects forced-colors.

### Performance
Box-shadow only (no expensive filters).

### Future Expansion
Elevation-aware dark surface tinting.

---

## 7. Motion & Animation Tokens

### Purpose
Provide restrained, predictable motion that never simulates urgency, with a hard reduced-motion contract.

### Background
Motion should orient, not alarm. No flashing, no shaking, no pulsing red.

| Token | Value | Use |
|---|---|---|
| `--duration-instant` | 80ms | hover/active state |
| `--duration-fast` | 150ms | small transitions |
| `--duration-base` | 220ms | enter/exit |
| `--duration-slow` | 320ms | larger panels |
| `--ease-standard` | `cubic-bezier(.2,0,0,1)` | most |
| `--ease-emphasized` | `cubic-bezier(.2,0,0,1)` (decel-heavy) | entrances |
| `--ease-exit` | `cubic-bezier(.4,0,1,1)` | exits |

### Requirements
- **DS-7.7.1 (MUST)** All animation MUST respect `prefers-reduced-motion: reduce` — under reduce, non-essential motion is removed and replaced with an instant state change or a ≤0.001s crossfade.
- **DS-7.7.2 (MUST)** Nothing MUST flash more than 3×/second (WCAG 2.3.1).
- **DS-7.7.3 (MUST)** The `ConfidenceMeter` fill animation MUST be disabled (snap to value) under reduced motion (DS-7.11).
- **DS-7.7.4 (MUST NOT)** Motion MUST NOT loop indefinitely to draw attention to a threat (no pulsing alarm).
- **DS-7.7.5 (SHOULD)** Durations SHOULD come from tokens; ad-hoc timings are prohibited.

### Acceptance Criteria
- **AC-DS-7.7.a** Given `prefers-reduced-motion: reduce`, when any animated component mounts, then no transform/opacity animation exceeding 0.001s runs (verified via test that mocks the media query).
- **AC-DS-7.7.b** Given any component, when scanned, then no animation flashes >3Hz.

### Edge Cases
Loading skeletons: a subtle shimmer is allowed but disabled under reduced motion (becomes a static placeholder).

### Security Considerations
n/a.

### Accessibility
Core: reduced-motion honored globally via a single utility/mixin.

### Performance
Animate only `transform`/`opacity` (GPU-friendly); avoid layout-thrashing properties.

### Future Expansion
Per-user "reduce motion" override independent of OS setting (Volume 12 account).

---

## 8. Iconography

### Purpose
A consistent, legible icon set that always accompanies — never replaces — text for meaning.

### Background
Icon set: **Lucide** (MIT, tree-shakable, 24px grid, 2px stroke). Chosen for stroke clarity at small sizes and an open license.

| Semantic | Icon | Notes |
|---|---|---|
| info / explain | `info` | default leading icon |
| caution / unverified | `alert-triangle` | amber; paired with label |
| likely scam | `shield-alert` | clay; paired with label |
| safe / verified | `shield-check` | teal; paired with label |
| verify with official org | `external-link` / `landmark` | links to FTC/IC3/etc. |
| entity: phone | `phone` | |
| entity: url/domain | `link` | |
| entity: email | `mail` | |
| entity: wallet | `wallet` | |
| report | `flag` | |
| confidence | `gauge` | |

### Requirements
- **DS-7.8.1 (MUST)** Icons MUST NOT be the sole carrier of meaning; an accessible text label MUST accompany every meaningful icon (visible text, or `aria-label` for genuinely supplementary icons) (DS-7.1.3, WCAG 1.1.1).
- **DS-7.8.2 (MUST)** Purely decorative icons MUST have `aria-hidden="true"` and empty alt.
- **DS-7.8.3 (MUST)** Icon-only buttons MUST have an `aria-label` AND meet target size (DS-7.16).
- **DS-7.8.4 (SHOULD)** Icon stroke/size SHOULD scale with adjacent text size (1em or `--text-*` aligned).
- **DS-7.8.5 (SHOULD)** Risk icons SHOULD be shape-distinct (triangle vs shield) to aid color-blind recognition.

### Acceptance Criteria
- **AC-DS-7.8.a** Given any meaningful icon, when inspected by a screen reader, then either accompanying text or an `aria-label` conveys the meaning.
- **AC-DS-7.8.b** Given icon-only controls, when audited, then 100% have non-empty accessible names.

### Edge Cases
Brand-impersonation contexts: never render a third-party brand logo as if endorsing; use neutral entity icons + text.

### Security Considerations
Do not load remote/user-supplied SVG icons (XSS via SVG). Icons ship from the bundled Lucide set only.

### Accessibility
Never icon-only for meaning; decorative icons hidden; icon-buttons labeled.

### Performance
Tree-shaken per-icon imports; no full icon-font download.

### Future Expansion
Additional entity icons as taxonomy grows; per-locale icon mirroring for RTL.

---

## 9. Buttons

### Purpose
Define button variants/sizes/states with accessible targets and calm semantics.

### Variants
| Variant | Token mapping | Use |
|---|---|---|
| `primary` | bg `--color-brand`, text `--color-brand-contrast` | main CTA (e.g., "Verify with official source") |
| `secondary` | bg `--color-surface`, border `--color-border-strong`, text `--color-text` | secondary |
| `ghost` | transparent, text `--color-brand` | low-emphasis |
| `subtle` | bg `--color-surface-muted` | tertiary |
| `caution` | border `--color-caution-border`, text `--color-caution-fg`, bg `--color-caution-bg` | reversible careful actions |
| `danger` | border `--color-danger-border`, text `--color-danger-fg`, bg `--color-danger-bg` | destructive (outline/tint, never full red fill) |
| `link` | underline, `--color-brand` | inline |

> Even the `danger` button uses the tinted/outlined treatment (DS-7.2.4) — destructive actions read as serious without weaponizing alarm-red.

### Sizes
| Size | Height | Padding-x | Text | Min target |
|---|---|---|---|---|
| `sm` | 32px | `--space-3` | `--text-sm` | meets ≥24px (DS-7.16); pair with spacing |
| `md` | 40px | `--space-4` | `--text-base` | ✅ |
| `lg` | 48px | `--space-5` | `--text-lg` | ✅ (primary CTAs) |

### States
default · hover (`--color-teal-500` / lighten) · active (instant, `--duration-instant`) · focus-visible (outline + `--shadow-focus`) · disabled (`opacity .5`, `cursor not-allowed`, `aria-disabled`) · loading (spinner + `aria-busy`, label retained for SR).

### Requirements
- **DS-7.9.1 (MUST)** Every button MUST have a `:focus-visible` indicator meeting DS-7.16 (≥3:1, not removed).
- **DS-7.9.2 (MUST)** Disabled buttons MUST set `aria-disabled` (or `disabled`) and MUST NOT rely on color alone to signal disablement.
- **DS-7.9.3 (MUST)** Loading buttons MUST set `aria-busy="true"` and retain an accessible label.
- **DS-7.9.4 (MUST)** `sm` buttons MUST still satisfy the 24px target floor via padding/spacing (DS-7.16).
- **DS-7.9.5 (SHOULD)** Icon+label is preferred over icon-only; icon-only requires `aria-label` (DS-7.8.3).

### Acceptance Criteria
- **AC-DS-7.9.a** Given keyboard navigation, when a button receives focus, then a visible focus ring with ≥3:1 contrast appears.
- **AC-DS-7.9.b** Given a loading button, when a screen reader inspects it, then `aria-busy` and the label are announced.

### Example (TSX)
```tsx
// components/ui/Button.tsx
import { forwardRef } from "react";
import { cn } from "@/lib/cn"; // clsx + tailwind-merge

type Variant = "primary" | "secondary" | "ghost" | "subtle" | "caution" | "danger" | "link";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-brand-contrast hover:bg-brand/90",
  secondary: "bg-surface border border-border-strong text-text hover:bg-surface-muted",
  ghost: "bg-transparent text-brand hover:bg-surface-muted",
  subtle: "bg-surface-muted text-text hover:bg-border/40",
  caution: "bg-caution-bg text-caution-fg border border-caution-border hover:bg-caution-bg/80",
  danger: "bg-danger-bg text-danger-fg border border-danger-border hover:bg-danger-bg/80",
  link: "text-brand underline underline-offset-2 hover:no-underline",
};
const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-base",
  lg: "h-12 px-5 text-lg",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading = false, disabled, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-disabled={disabled || loading || undefined}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium",
        "transition-colors duration-fast ease-standard",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "motion-reduce:transition-none",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {loading && <Spinner className="size-4" aria-hidden="true" />}
      {children}
    </button>
  );
});
```

### Edge Cases
Buttons whose label changes on loading must keep an `aria-live`-safe pattern (avoid label flicker that confuses SR).

### Security Considerations
Action buttons that trigger destructive/moderation actions must be gated by role (Volume 12) and confirmed (modal) for irreversible operations.

### Accessibility
Focus-visible, target size, disabled/busy semantics, not color-only.

### Performance
Class-based variants (no runtime style objects); `tailwind-merge` keeps class strings small.

### Future Expansion
Split-button + menu for verification-source choice.

---

## 10. Cards

### Purpose
Container components, including the domain-specific **VerdictCard**, that present classified results calmly and transparently.

### Background
Cards use `--color-surface`, `--radius-lg`, `--shadow-1`, `--space-6` padding. The `VerdictCard` is the canonical surface that renders a Threat classification: it leads with the **Explanation** (Principle 1), shows the **ConfidenceMeter**, lists contributing **Entities** as chips, and ends with a **Verification** CTA to an official org.

### VerdictCard anatomy
```
┌─ VerdictCard ───────────────────────────────────────┐
│ [icon][Risk label: "Likely a scam pattern"]  (badge)│  ← status header (icon+text+color)
│ Plain-language summary (Explanation lead) ...        │  ← explain first
│ ConfidenceMeter  72% — "Fairly confident"            │  ← calibrated, labeled
│ Why we think this  ▸ (ExplanationPanel)              │  ← expandable reasoning + sources
│ Related entities: [EntityChip][EntityChip]...        │
│ ──────────────────────────────────────────────────  │
│ This is consumer protection, not legal advice.       │  ← guardrail (shared §legal)
│ [ Verify with FTC ↗ ]  [ Report this ]               │  ← official-org handoff
└──────────────────────────────────────────────────────┘
```

### Requirements
- **DS-7.10.1 (MUST)** `VerdictCard` MUST render the Explanation summary visually before any warning-colored element (DS-7.1.1).
- **DS-7.10.2 (MUST)** `VerdictCard` MUST display a `ConfidenceMeter` with both numeric and worded calibration whenever a Confidence value exists.
- **DS-7.10.3 (MUST)** `VerdictCard` MUST include the "not legal advice" guardrail and at least one official-org Verification CTA (shared legal guardrails).
- **DS-7.10.4 (MUST)** Risk status MUST be a header with icon + text + semantic color (never color-only).
- **DS-7.10.5 (MUST)** User-submitted evidence rendered inside a card MUST be in a labeled `evidence` sub-container distinct from ScamWatch's own verdict styling (anti-impersonation, DS-7.2/6).
- **DS-7.10.6 (SHOULD)** The card SHOULD be a single landmark/region with a programmatic heading for navigation.

### Acceptance Criteria
- **AC-DS-7.10.a** Given a classified Threat, when the `VerdictCard` renders, then DOM order is: explanation summary → confidence → reasoning → entities → guardrail → verification CTA.
- **AC-DS-7.10.b** Given a `VerdictCard`, when audited, then it contains exactly one role status header with icon+text+color and one verification CTA.

### Example (TSX, abbreviated)
```tsx
// components/verdict/VerdictCard.tsx
import { ShieldAlert, ShieldCheck, AlertTriangle, Info } from "lucide-react";
import { ConfidenceMeter } from "./ConfidenceMeter";
import { ExplanationPanel } from "./ExplanationPanel";
import { EntityChip } from "@/components/entity/EntityChip";
import { Button } from "@/components/ui/Button";

type Risk = "info" | "caution" | "danger" | "safe";
const meta: Record<Risk, { Icon: typeof Info; label: string; cls: string }> = {
  info:    { Icon: Info,          label: "Informational",          cls: "text-info-fg bg-info-bg border-info-fg/30" },
  caution: { Icon: AlertTriangle, label: "Be careful — unverified", cls: "text-caution-fg bg-caution-bg border-caution-border" },
  danger:  { Icon: ShieldAlert,   label: "Likely a scam pattern",   cls: "text-danger-fg bg-danger-bg border-danger-border" },
  safe:    { Icon: ShieldCheck,   label: "No scam signals found",   cls: "text-safe-fg bg-safe-bg border-safe-border" },
};

export function VerdictCard({ risk, summary, confidence, reasoning, sources, entities, verifyHref, verifyLabel }: {
  risk: Risk; summary: string; confidence: number;
  reasoning: string; sources: { label: string; href: string }[];
  entities: { type: string; value: string }[];
  verifyHref: string; verifyLabel: string;
}) {
  const { Icon, label, cls } = meta[risk];
  return (
    <section
      aria-labelledby="verdict-heading"
      className="rounded-lg bg-surface shadow-1 p-6 border border-border"
    >
      {/* explain first */}
      <p className="text-lg text-text mb-4">{summary}</p>

      <h2 id="verdict-heading" className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${cls}`}>
        <Icon className="size-4" aria-hidden="true" />
        {label}
      </h2>

      <div className="mt-4">
        <ConfidenceMeter value={confidence} />
      </div>

      <ExplanationPanel reasoning={reasoning} sources={sources} />

      {entities.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-text-muted mb-2">Related entities</h3>
          <ul className="flex flex-wrap gap-2">
            {entities.map((e) => (
              <li key={`${e.type}:${e.value}`}><EntityChip type={e.type} value={e.value} /></li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-6 text-sm text-text-subtle">
        This is consumer protection information, not legal advice. Always confirm with an official source.
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        <Button as-child variant="primary" size="lg">
          <a href={verifyHref} rel="noopener noreferrer">{verifyLabel} ↗</a>
        </Button>
        <Button variant="secondary">Report this</Button>
      </div>
    </section>
  );
}
```

### Edge Cases
Unknown/insufficient-evidence verdicts use `info` risk with explicit "We don't have enough information" copy — never default to `danger`.

### Security Considerations
Sanitize `summary`/`reasoning` (these may include extracted attacker text); render entity values as text (no auto-linking of scam URLs into clickable links by default — see Volume 12).

### Accessibility
Single region + heading; status not color-only; CTA focusable; meets contrast.

### Performance
Server-rendered (RSC, Volume 12); `ExplanationPanel` reasoning can stream.

### Future Expansion
Variant cards: `CampaignCard`, `EntityProfileCard` reusing the same shell.

---

## 11. ConfidenceMeter

### Purpose
Visualize a calibrated 0–1 `Confidence` with honest, worded interpretation — never implying false certainty (Principle 6).

### Background
A horizontal track with a fill and a worded band. Worded bands prevent users from over-reading a bare percentage.

| Range | Word band | Color token |
|---|---|---|
| 0.00–0.39 | "Low confidence" | `info` |
| 0.40–0.69 | "Moderate confidence" | `caution` |
| 0.70–0.89 | "Fairly confident" | `caution`→`danger` border accent |
| 0.90–1.00 | "High confidence" | `danger`/`safe` per verdict |

### Requirements
- **DS-7.11.1 (MUST)** It MUST present both the numeric value and a worded band (no bare percentage).
- **DS-7.11.2 (MUST)** It MUST expose value via ARIA: `role="meter"` (or `img` with label) with `aria-valuenow/min/max` and an accessible text equivalent.
- **DS-7.11.3 (MUST)** It MUST NOT use color alone; the worded band + numeric carry meaning (DS-7.1.3).
- **DS-7.11.4 (MUST)** Fill animation MUST snap (no animation) under `prefers-reduced-motion: reduce` (DS-7.7.3).
- **DS-7.11.5 (SHOULD)** It SHOULD avoid implying spurious precision (round to nearest whole percent; never show 2 decimals to users).

### Acceptance Criteria
- **AC-DS-7.11.a** Given value 0.72, when rendered, then "72%" and "Fairly confident" both appear and `aria-valuenow="72"`.
- **AC-DS-7.11.b** Given reduced motion, when value changes, then the fill updates with no transition.

### Example (TSX)
```tsx
// components/verdict/ConfidenceMeter.tsx
export function ConfidenceMeter({ value }: { value: number }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  const band =
    pct >= 90 ? "High confidence" :
    pct >= 70 ? "Fairly confident" :
    pct >= 40 ? "Moderate confidence" : "Low confidence";
  const tone =
    pct >= 70 ? "bg-danger-border" :
    pct >= 40 ? "bg-caution-border" : "bg-info-fg";
  return (
    <div
      role="meter"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Confidence: ${pct} percent, ${band}`}
      className="w-full"
    >
      <div className="flex items-center justify-between text-sm text-text-muted mb-1">
        <span>{band}</span>
        <span className="font-mono">{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-surface-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${tone} transition-[width] duration-base ease-standard motion-reduce:transition-none`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
```

### Edge Cases
Null/unknown confidence → render "Confidence not available" text, no fill, no implied 0% (which could read as "definitely safe").

### Security Considerations
Confidence is model output; copy must pair it with "verify with official sources" nearby (handled by `VerdictCard`).

### Accessibility
`role="meter"`, text equivalent, not color-only, reduced-motion snap.

### Performance
Animates `width` only; trivial.

### Future Expansion
Optional uncertainty interval rendering for analyst view.

---

## 12. ExplanationPanel

### Purpose
The visual language for the explainability layer — the calibrated "why we think this," with linked evidence/sources, presented before alarm.

### Background
A disclosure (expandable) region that contains plain-language reasoning, contributing signals, and links to **official-org Verification** plus the cited sources. Collapsed by default summary is always visible; details expand.

### Requirements
- **DS-7.12.1 (MUST)** It MUST present reasoning in plain, non-accusatory language and MUST attach source/Verification links (Principles 5, 7).
- **DS-7.12.2 (MUST)** The disclosure MUST be a proper `<button>`-controlled region with `aria-expanded` + `aria-controls`; keyboard operable.
- **DS-7.12.3 (MUST)** AI-derived statements MUST be framed as assessment, not fact ("signals consistent with…", not "this is a scammer named X") (shared legal guardrails, Principle 6).
- **DS-7.12.4 (SHOULD)** It SHOULD list contributing signals as discrete, scannable items.

### Acceptance Criteria
- **AC-DS-7.12.a** Given the panel, when toggled by keyboard, then `aria-expanded` flips and focus is managed correctly.
- **AC-DS-7.12.b** Given reasoning text, when scanned for banned accusatory templates, then none are present.

### Edge Cases
Very long reasoning streams (RSC streaming, Volume 12) → show skeleton/partial, never a misleading "no reason" empty state.

### Security Considerations
Reasoning may quote attacker content; render as quoted text in the evidence container, links non-clickable by default.

### Accessibility
Disclosure pattern, keyboard, focus management, plain language.

### Performance
Lazy-render details on expand; reasoning can stream.

### Future Expansion
Per-signal "learn more" deep links into the Academy (Volume 12 `/academy`).

---

## 13. Form Controls

### Purpose
Accessible inputs for search, the report wizard, account, and moderation.

### Background
Inputs use `--color-surface`, `--color-border-strong` border (≥3:1), `--radius-sm`, min height 44px. Errors are text + icon + color, with `aria-describedby` and `aria-invalid`.

### Requirements
- **DS-7.13.1 (MUST)** Every control MUST have a programmatically associated `<label>` (not placeholder-as-label).
- **DS-7.13.2 (MUST)** Errors MUST be conveyed by text (and icon), associated via `aria-describedby`, with `aria-invalid="true"`; not color-only.
- **DS-7.13.3 (MUST)** Inputs MUST meet the 44px target height and ≥3:1 border contrast.
- **DS-7.13.4 (MUST)** Required fields MUST be marked in text (not solely an asterisk color).
- **DS-7.13.5 (SHOULD)** Inputs SHOULD set appropriate `inputmode`/`autocomplete`/`type` (e.g., `tel`, `url`, `email`) to aid older users and reduce error.

### Acceptance Criteria
- **AC-DS-7.13.a** Given an invalid field, when submitted, then `aria-invalid`, a text error, and `aria-describedby` linkage exist.
- **AC-DS-7.13.b** Given any input, when inspected, then a real associated label exists.

### Edge Cases
Pasting a long scam URL into a search field must not break layout; field scrolls horizontally, value preserved.

### Security Considerations
Client validation is UX only; server re-validates (Volume 12). Never echo unsanitized input back into the DOM.

### Accessibility
Labels, error association, target size, `autocomplete`.

### Performance
Uncontrolled where possible; debounce search input.

### Future Expansion
Inline entity detection hints as the user types a report.

---

## 14. Badges & Chips

### Purpose
Compact status badges and the domain **EntityChip** for fraud-infrastructure atoms.

### Background
Badges convey status/risk (icon+text+color). `EntityChip` displays an Entity (phone/URL/email/wallet/etc.) in mono with a type icon and an optional confidence dot, linking to its entity profile (Volume 12 `/entity/[type]/[value]`).

### Requirements
- **DS-7.14.1 (MUST)** Badges/chips MUST pair text with color (and icon for risk) — never color-only (DS-7.1.3).
- **DS-7.14.2 (MUST)** `EntityChip` MUST render the entity value in `--font-mono` and MUST NOT auto-activate scam URLs (no live href to attacker domains by default) (security).
- **DS-7.14.3 (MUST)** Interactive chips MUST meet target size (DS-7.16) and have accessible names including entity type.
- **DS-7.14.4 (SHOULD)** `EntityChip` SHOULD show a small confidence indicator with a text/`aria` equivalent.
- **DS-7.14.5 (SHOULD)** URL/domain chips SHOULD surface punycode/`xn--` annotation for IDN-homograph awareness (DS-7.3 security).

### Acceptance Criteria
- **AC-DS-7.14.a** Given an `EntityChip` for a URL, when rendered, then the value is mono, not a live external link, and the accessible name includes "URL".
- **AC-DS-7.14.b** Given any risk badge, when audited, then text+icon+color all present.

### Example (TSX)
```tsx
// components/entity/EntityChip.tsx
import { Phone, Link as LinkIcon, Mail, Wallet } from "lucide-react";
import Link from "next/link";

const icons: Record<string, typeof Phone> = { phone: Phone, url: LinkIcon, email: Mail, wallet: Wallet };

export function EntityChip({ type, value, confidence }: { type: string; value: string; confidence?: number }) {
  const Icon = icons[type] ?? LinkIcon;
  const href = `/entity/${encodeURIComponent(type)}/${encodeURIComponent(value)}`;
  const pct = confidence != null ? Math.round(confidence * 100) : null;
  return (
    <Link
      href={href}
      className="inline-flex max-w-full items-center gap-2 rounded-full border border-border-strong bg-surface px-3 py-1.5 min-h-[32px]
                 text-sm hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      aria-label={`${type} entity ${value}${pct != null ? `, confidence ${pct} percent` : ""}`}
    >
      <Icon className="size-4 text-text-muted" aria-hidden="true" />
      <span className="font-mono truncate">{value}</span>
      {pct != null && (
        <span className="ml-1 text-xs text-text-subtle" aria-hidden="true">{pct}%</span>
      )}
    </Link>
  );
}
```

### Edge Cases
Very long wallet addresses/URLs truncate with `truncate` + full value in accessible name/title; tap reveals full on the entity page.

### Security Considerations
Entity values are attacker-influenced text → escape, mono-render, never auto-link; chips route to internal entity profile, not the external destination.

### Accessibility
Text+icon+color, accessible name includes type, target size, confidence has text equivalent.

### Performance
`next/link` prefetch; lightweight.

### Future Expansion
Hover card with mini entity stats; copy-to-clipboard affordance.

---

## 15. Dark Mode Strategy

### Purpose
Define how dark mode is implemented as a deterministic token remap.

### Background
We use the `class` strategy (`data-theme="dark"` on `<html>`), set before paint to avoid flash, defaulting to system preference with a user override persisted (Volume 12 account). Each semantic token has a light and dark value (DS-7.2); components reference tokens only.

### Requirements
- **DS-7.15.1 (MUST)** Theme MUST be applied via a single root attribute/class; components MUST NOT branch on theme in JS.
- **DS-7.15.2 (MUST)** Dark tokens MUST meet the same AA contrasts as light (DS-7.2.2).
- **DS-7.15.3 (MUST)** Initial theme MUST be resolved pre-hydration (inline script reading `localStorage`/`prefers-color-scheme`) to prevent flash-of-incorrect-theme.
- **DS-7.15.4 (SHOULD)** A user override SHOULD persist and sync to profile when logged in.

### Acceptance Criteria
- **AC-DS-7.15.a** Given system dark + no override, when first paint occurs, then dark tokens apply with no flash.
- **AC-DS-7.15.b** Given dark mode, when contrast is measured, then all ✅ pairings still pass.

### Edge Cases
`prefers-color-scheme` unsupported → default light. Forced-colors mode overrides both (DS-7.16).

### Security Considerations
Inline theme script must be a static, nonce-allowed inline (CSP) — no user input (Volume 12 CSP).

### Accessibility
Both themes AA; respects user/system preference; forced-colors honored.

### Performance
Token remap = no re-render; single attribute toggle.

### Future Expansion
High-contrast and low-stimulation themes as additional token sets.

---

## 16. Accessibility Contract

### Purpose
The binding, testable a11y floor for every component (WCAG 2.2 AA).

### Requirements
- **DS-7.16.1 (MUST)** **Focus visible (2.4.7/2.4.11):** every interactive element MUST have a `:focus-visible` indicator with ≥3:1 contrast against adjacent colors, ≥2px thick, not fully obscured by other content (WCAG 2.2 Focus Not Obscured 2.4.11). Never `outline: none` without replacement.
- **DS-7.16.2 (MUST)** **Target size (2.5.8):** interactive targets MUST be ≥24×24 CSS px, OR have ≥24px spacing to neighbors; primary touch CTAs SHOULD be ≥44×44.
- **DS-7.16.3 (MUST)** **Contrast (1.4.3/1.4.11):** text ≥4.5:1 (large ≥3:1); UI components & focus indicators ≥3:1.
- **DS-7.16.4 (MUST)** **Use of color (1.4.1):** meaning never by color alone (icon/text always).
- **DS-7.16.5 (MUST)** **Reflow & zoom (1.4.10/1.4.4):** usable single-column at 320px CSS width and 200% zoom with no loss.
- **DS-7.16.6 (MUST)** **Reduced motion (2.3.3):** non-essential motion removed under `prefers-reduced-motion`.
- **DS-7.16.7 (MUST)** **Forced colors:** components MUST remain meaningful under `forced-colors: active` (use system color keywords, keep borders).
- **DS-7.16.8 (MUST)** **Names/labels (4.1.2, 2.5.3):** all controls have accessible names; visible label text is contained in the accessible name.
- **DS-7.16.9 (MUST)** **Dragging (2.5.7):** any drag interaction MUST have a single-pointer alternative.
- **DS-7.16.10 (SHOULD)** Components SHOULD pass automated axe checks and be in the a11y test matrix (Volume 15).

### Acceptance Criteria
- **AC-DS-7.16.a** Given keyboard-only navigation, when traversing any page, then every interactive element is reachable, has a visible focus ring (≥3:1, not obscured), and is operable.
- **AC-DS-7.16.b** Given an axe-core scan of each component story, when run in CI, then zero serious/critical violations.
- **AC-DS-7.16.c** Given target-size audit, when measured, then every control is ≥24px or adequately spaced.

### Edge Cases
Sticky headers must not obscure the focused element (2.4.11) — add scroll-margin to focusable targets.

### Security Considerations
Accessible names must not leak sensitive data (e.g., full report PII) into the accessibility tree beyond what's visible.

### Accessibility
This section *is* the contract.

### Performance
axe runs in CI, not production; no runtime cost.

### Future Expansion
Add WCAG 2.2 AAA targets for the Academy long-form reading surfaces.

---

## 17. Tailwind Theme Extension & CSS Variable Map

### Purpose
Make the tokens directly buildable in Tailwind + CSS variables.

### CSS variable token map (`app/globals.css`)
```css
@layer base {
  :root {
    /* surfaces / text */
    --color-bg: #FFFFFF;
    --color-surface: #FFFFFF;
    --color-surface-muted: #F8FAFC;
    --color-border: #CBD5E1;
    --color-border-strong: #94A3B8;
    --color-text: #0F172A;
    --color-text-muted: #475569;
    --color-text-subtle: #64748B;
    /* brand / semantic */
    --color-brand: #0E7490;
    --color-brand-contrast: #FFFFFF;
    --color-info-fg: #155E75;   --color-info-bg: #ECFEFF;
    --color-caution-fg: #92400E; --color-caution-bg: #FEF3C7; --color-caution-border: #B45309;
    --color-danger-fg: #9A3412;  --color-danger-bg: #FFF1EC;  --color-danger-border: #C2410C;
    --color-safe-fg: #0F766E;    --color-safe-bg: #F0FDFA;    --color-safe-border: #0F766E;
    --color-focus: #1D4ED8;

    /* radius / motion */
    --radius-sm: 6px; --radius-md: 10px; --radius-lg: 14px; --radius-xl: 20px;
    --duration-instant: 80ms; --duration-fast: 150ms; --duration-base: 220ms; --duration-slow: 320ms;
    --ease-standard: cubic-bezier(.2,0,0,1);
  }

  [data-theme="dark"] {
    --color-bg: #0B1220;
    --color-surface: #111A2B;
    --color-surface-muted: #0E1626;
    --color-border: #27364B;
    --color-border-strong: #475569;
    --color-text: #E5EDF6;
    --color-text-muted: #A6B6CB;
    --color-text-subtle: #7E8FA6;
    --color-brand: #38BDF8;
    --color-brand-contrast: #06283A;
    --color-info-fg: #A5F3FC;   --color-info-bg: #0C2A33;
    --color-caution-fg: #FCD34D; --color-caution-bg: #3A2A06; --color-caution-border: #D97706;
    --color-danger-fg: #FCA5A5;  --color-danger-bg: #3A130C;  --color-danger-border: #F97316;
    --color-safe-fg: #5EEAD4;    --color-safe-bg: #06231F;    --color-safe-border: #2DD4BF;
    --color-focus: #60A5FA;
  }

  /* global reduced-motion floor (DS-7.7.1) */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: .001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: .001ms !important;
      scroll-behavior: auto !important;
    }
  }
}
```

### Tailwind config (`tailwind.config.ts`)
```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: { DEFAULT: "var(--color-surface)", muted: "var(--color-surface-muted)" },
        border: { DEFAULT: "var(--color-border)", strong: "var(--color-border-strong)" },
        text: { DEFAULT: "var(--color-text)", muted: "var(--color-text-muted)", subtle: "var(--color-text-subtle)" },
        brand: { DEFAULT: "var(--color-brand)", contrast: "var(--color-brand-contrast)" },
        info: { fg: "var(--color-info-fg)", bg: "var(--color-info-bg)" },
        caution: { fg: "var(--color-caution-fg)", bg: "var(--color-caution-bg)", border: "var(--color-caution-border)" },
        danger: { fg: "var(--color-danger-fg)", bg: "var(--color-danger-bg)", border: "var(--color-danger-border)" },
        safe: { fg: "var(--color-safe-fg)", bg: "var(--color-safe-bg)", border: "var(--color-safe-border)" },
        focus: "var(--color-focus)",
      },
      borderRadius: { sm: "var(--radius-sm)", md: "var(--radius-md)", lg: "var(--radius-lg)", xl: "var(--radius-xl)" },
      transitionDuration: { instant: "80ms", fast: "150ms", base: "220ms", slow: "320ms" },
      transitionTimingFunction: { standard: "cubic-bezier(.2,0,0,1)" },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["ui-serif", "Georgia", "Cambria", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.5" }],
        sm: ["0.875rem", { lineHeight: "1.55" }],
        base: ["1rem", { lineHeight: "1.6" }],
        lg: ["1.125rem", { lineHeight: "1.55" }],
        xl: ["1.25rem", { lineHeight: "1.4", fontWeight: "600" }],
        "2xl": ["1.5625rem", { lineHeight: "1.3", fontWeight: "600" }],
        "3xl": ["1.9375rem", { lineHeight: "1.25", fontWeight: "700" }],
        "4xl": ["2.4375rem", { lineHeight: "1.2", fontWeight: "700" }],
      },
      boxShadow: {
        1: "0 1px 2px rgba(15,23,42,.06)",
        2: "0 4px 12px rgba(15,23,42,.08)",
        3: "0 12px 32px rgba(15,23,42,.12)",
      },
    },
  },
  plugins: [],
};
export default config;
```

### Requirements
- **DS-7.17.1 (MUST)** Tailwind theme MUST map to CSS variables (not hardcoded hex) so dark mode/themes work by remap.
- **DS-7.17.2 (MUST)** The reduced-motion global floor MUST be present in base CSS.
- **DS-7.17.3 (SHOULD)** A CI token-lint SHOULD fail builds that introduce hardcoded color/spacing outside the token files.

### Acceptance Criteria
- **AC-DS-7.17.a** Given the config above, when a component uses `bg-danger-bg text-danger-fg`, then it renders correct values in both themes without code change.

### Edge Cases
Tailwind opacity modifiers on `var()` colors require the variables to be in a compatible color space — keep hex (sRGB) for broad support, or migrate to `oklch` channel triplets in a future pass.

### Security Considerations
Inline theme bootstrap script must be CSP-nonce'd (Volume 12).

### Accessibility
All mapped tokens satisfy DS-7.2 contrasts.

### Performance
Zero-JS theming; tree-shaken utilities; system fonts.

### Future Expansion
Migrate palette to `oklch` for perceptually uniform tinting and easier color-blind-safe generation; emit tokens from a single source (Style Dictionary) to Tailwind + native + Figma.

---

*End of Volume 7 — Design System.*
