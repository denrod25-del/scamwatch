# Volume 12 — Frontend Architecture

> The ScamWatch web client: a Next.js (App Router) + React + TypeScript + TailwindCSS application hosted on Vercel, talking to Supabase (Postgres/Auth/Storage/Edge Functions). This volume specifies the route map, the server-vs-client component strategy, data fetching with React Server Components + Supabase, caching/revalidation/streaming, state management, the component hierarchy and directory layout, design-token consumption from Volume 7, the report wizard and validation, file/image upload UX via Supabase Storage signed URLs, error/loading/suspense boundaries, i18n readiness, SEO + AI-answer discoverability (metadata + structured data; ties to Volume 19), the performance budget (Core Web Vitals + bundle budgets + image strategy), accessibility implementation patterns, and testing hooks (ties to Volume 15). It encodes the product principles — explain before warning, respect victims, transparency, official-source verification — into rendering and data decisions. All requirements use the prefix **FE-12**.

---

## Table of Contents

1. [App Directory & Route Map](#1-app-directory--route-map)
2. [Server vs Client Components Strategy](#2-server-vs-client-components-strategy)
3. [Data Fetching (RSC + Supabase)](#3-data-fetching-rsc--supabase)
4. [Caching, Revalidation & Streaming](#4-caching-revalidation--streaming)
5. [State Management](#5-state-management)
6. [Component Hierarchy & Directory Layout](#6-component-hierarchy--directory-layout)
7. [Design-Token Consumption (Volume 7)](#7-design-token-consumption-volume-7)
8. [Forms — Report Wizard & Validation](#8-forms--report-wizard--validation)
9. [File / Image Upload UX](#9-file--image-upload-ux)
10. [Error, Loading & Suspense Boundaries](#10-error-loading--suspense-boundaries)
11. [Internationalization Readiness](#11-internationalization-readiness)
12. [SEO & AI-Answer Discoverability](#12-seo--ai-answer-discoverability)
13. [Performance Budget](#13-performance-budget)
14. [Accessibility Implementation Patterns](#14-accessibility-implementation-patterns)
15. [Testing Hooks (Volume 15)](#15-testing-hooks-volume-15)

---

## 1. App Directory & Route Map

### Purpose
Define the canonical route tree so deep-linking, SEO (FE-12.12), and access control are consistent and predictable.

### Background
App Router enables RSC-by-default, nested layouts, streaming, and per-route caching. Public, education-first routes are statically optimized; authenticated routes (account, moderation) are dynamic.

### Route map
| Route | Purpose | Default rendering | Auth |
|---|---|---|---|
| `/` | Home: search-first, explain-before-warn hero | Static + RSC | anonymous |
| `/search` | Search reports/entities/threats | RSC, dynamic on `?q` | anonymous |
| `/threat/[slug]` | Threat type page (taxonomy) | SSG + ISR | anonymous |
| `/entity/[type]/[value]` | Entity profile (phone/url/email/wallet…) | RSC, dynamic | anonymous |
| `/campaign/[id]` | Correlated campaign view | RSC, dynamic | anonymous (sensitive fields gated) |
| `/report` | Report wizard (multi-step) | Client islands in RSC shell | anonymous (can submit), enhanced for member |
| `/account` | Profile, preferences, my reports | RSC, dynamic, protected | member+ |
| `/moderation` | Moderation queue & actions | RSC, dynamic, protected | moderator+ |
| `/academy` | Education hub (long-form) | SSG + ISR | anonymous |
| `/transparency` | Transparency reports & methodology | SSG + ISR | anonymous |
| `/alerts` | User alerts/subscriptions | RSC, dynamic, protected | member+ |
| `/auth/*` | `sign-in`, `callback`, `verify`, `sign-out` | mixed | anonymous |

### Example route tree
```
app/
├─ layout.tsx                 # root: <html> theme bootstrap, fonts, providers
├─ globals.css                # Volume 7 token map
├─ page.tsx                   # /  (home)
├─ search/
│  ├─ page.tsx                # /search?q=
│  └─ loading.tsx
├─ threat/[slug]/
│  ├─ page.tsx
│  └─ generateStaticParams.ts
├─ entity/[type]/[value]/
│  ├─ page.tsx
│  └─ loading.tsx
├─ campaign/[id]/page.tsx
├─ report/
│  ├─ layout.tsx              # wizard shell
│  ├─ page.tsx                # step router (client island)
│  └─ actions.ts              # 'use server' submit actions
├─ account/
│  ├─ layout.tsx              # requireRole('member')
│  └─ page.tsx
├─ moderation/
│  ├─ layout.tsx              # requireRole('moderator')
│  └─ page.tsx
├─ academy/[...slug]/page.tsx
├─ transparency/page.tsx
├─ alerts/page.tsx
├─ auth/
│  ├─ sign-in/page.tsx
│  ├─ callback/route.ts       # OAuth/OTP exchange (route handler)
│  └─ sign-out/route.ts
├─ error.tsx                  # global error boundary
├─ not-found.tsx
└─ robots.ts / sitemap.ts     # SEO (FE-12.12)
```

### Requirements
- **FE-12.1.1 (MUST)** The route map above MUST be the canonical structure; slugs/params MUST match domain vocabulary (Report, Entity, Threat, Campaign — shared context).
- **FE-12.1.2 (MUST)** Protected routes (`/account`, `/moderation`, `/alerts`) MUST enforce role at the layout/segment level via server-side session check (Supabase Auth), not client-only.
- **FE-12.1.3 (MUST)** `/entity/[type]/[value]` MUST URL-encode/decode values safely and MUST NOT render the value as a live external link by default (DS-7.14.2 anti-activation).
- **FE-12.1.4 (SHOULD)** Public taxonomy/education routes SHOULD be statically generated with ISR for SEO and speed.
- **FE-12.1.5 (SHOULD)** Sensitive campaign fields SHOULD be gated by role even on a public route.

### Acceptance Criteria
- **AC-FE-12.1.a** Given an unauthenticated user, when requesting `/moderation`, then the server redirects to `/auth/sign-in` (no client flash of protected content).
- **AC-FE-12.1.b** Given `/entity/url/http%3A%2F%2Fbad.example`, when rendered, then the value displays decoded but is not a clickable external anchor.

### Edge Cases
Unknown `[type]` in entity route → `notFound()`. Malformed encoded values → 400/notFound, never crash.

### Security Considerations
Param values are attacker-influenced; validate `type` against an allowlist, escape values, never `dangerouslySetInnerHTML` them. Auth gating server-side (FE-12.1.2).

### Accessibility
Each route has one `<h1>`, a landmark structure, and a skip-link (FE-12.14).

### Performance
Static/ISR for public content; dynamic only where needed (FE-12.13).

### Future Expansion
Locale-prefixed routes (`/[locale]/…`) when i18n ships (FE-12.11); `/api`-less architecture via server actions + route handlers.

---

## 2. Server vs Client Components Strategy

### Purpose
Default to RSC; isolate interactivity into small client islands to minimize JS shipped.

### Background
RSC keeps data fetching, secrets, and heavy rendering on the server. Client components are only for interactivity (forms, disclosures, theme toggle, search box).

### Decision table
| Concern | Component type |
|---|---|
| Page shells, data display (VerdictCard read), threat/entity pages | Server (RSC) |
| Report wizard steps, validation, upload widget | Client |
| `ExplanationPanel` disclosure toggle | Client (small) |
| Theme toggle, font-size pref | Client |
| Search input + URL sync | Client; results list = Server |
| Moderation actions (mutations) | Server Actions invoked from Client triggers |

### Requirements
- **FE-12.2.1 (MUST)** Components MUST be Server by default; `"use client"` MUST be added only when interactivity/browser APIs are required.
- **FE-12.2.2 (MUST)** Client components MUST NOT import server-only secrets (service-role keys, server env); use server actions/RSC for privileged data.
- **FE-12.2.3 (MUST)** Data-heavy verdict/entity rendering MUST happen in RSC (no client-side fetch waterfalls for primary content).
- **FE-12.2.4 (SHOULD)** Client islands SHOULD be leaf-level and small; avoid making a whole page a client component to enable one button.

### Acceptance Criteria
- **AC-FE-12.2.a** Given the bundle analyzer, when inspecting any public route, then no server-only module is in the client bundle and per-route JS is within budget (FE-12.13).
- **AC-FE-12.2.b** Given a verdict page, when JS is disabled, then primary content (explanation, confidence text, verification link) still renders (progressive enhancement).

### Example — Server component (entity page)
```tsx
// app/entity/[type]/[value]/page.tsx  (Server Component)
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { VerdictCard } from "@/components/verdict/VerdictCard";
import { EntityChip } from "@/components/entity/EntityChip";

const ALLOWED = new Set(["phone", "url", "email", "wallet", "sender", "brand", "handle"]);

export default async function EntityPage({
  params,
}: { params: Promise<{ type: string; value: string }> }) {
  const { type, value: raw } = await params;
  if (!ALLOWED.has(type)) notFound();
  const value = decodeURIComponent(raw);

  const supabase = createServerClient();
  const { data: entity, error } = await supabase
    .rpc("get_entity_profile", { p_type: type, p_value: value })
    .single();
  if (error || !entity) notFound();

  return (
    <main className="mx-auto max-w-prose px-4 py-8">
      <h1 className="text-3xl font-bold text-text">
        {type} <span className="font-mono">{value}</span>
      </h1>
      <p className="mt-2 text-text-muted">
        Seen in {entity.report_count} report(s). This is consumer-protection information, not legal advice.
      </p>
      <div className="mt-6">
        <VerdictCard
          risk={entity.risk}
          summary={entity.summary}
          confidence={entity.confidence}
          reasoning={entity.reasoning}
          sources={entity.sources}
          entities={entity.related}
          verifyHref={entity.verify_href}
          verifyLabel={entity.verify_label}
        />
      </div>
    </main>
  );
}
```

### Example — Client component (search box with URL state)
```tsx
// components/search/SearchBox.tsx
"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export function SearchBox() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams(params);
    q ? next.set("q", q) : next.delete("q");
    startTransition(() => router.push(`/search?${next.toString()}`));
  }

  return (
    <form role="search" onSubmit={submit} className="flex gap-2">
      <label htmlFor="q" className="sr-only">Search reports, numbers, links, or scam types</label>
      <input
        id="q" name="q" type="search" inputMode="search" autoComplete="off"
        value={q} onChange={(e) => setQ(e.target.value)}
        placeholder="Paste a number, link, or describe what happened"
        className="h-11 flex-1 rounded-sm border border-border-strong bg-surface px-4 text-base
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      />
      <button className="h-11 rounded-md bg-brand px-5 text-brand-contrast" aria-busy={isPending || undefined}>
        Check
      </button>
    </form>
  );
}
```

### Edge Cases
JS-disabled users still need search → form posts to `/search` (the GET form works without JS).

### Security Considerations
Service-role Supabase key only on server; client uses anon key + RLS (Volume 10/Backend). Never expose privileged RPCs to client.

### Accessibility
`role="search"`, labeled input, focus ring (Volume 7).

### Performance
Minimal client JS; RSC streams primary content (FE-12.4).

### Future Expansion
Partial Prerendering (PPR) once stable to combine static shell + dynamic islands.

---

## 3. Data Fetching (RSC + Supabase)

### Purpose
Fetch primarily in RSC using Supabase server client; mutations via Server Actions; keep secrets server-side and honor RLS.

### Background
Two Supabase clients: a **server** client (cookies-based session, runs in RSC/actions) and a **browser** client (anon key, RLS-bound, for realtime/interactive-only needs). Primary content is fetched in RSC.

### Requirements
- **FE-12.3.1 (MUST)** Primary page data MUST be fetched in RSC (or server actions), not via client `useEffect` fetch waterfalls.
- **FE-12.3.2 (MUST)** All data access MUST respect Supabase RLS; the service-role key MUST never reach the client.
- **FE-12.3.3 (MUST)** Mutations (submit report, moderation action, preferences) MUST go through Server Actions with server-side validation (FE-12.8) and re-auth/role checks.
- **FE-12.3.4 (MUST)** AI/model-derived fields (verdict, confidence, reasoning) MUST be rendered with calibrated framing + verification link (shared Principles 5–7); the client MUST NOT present them as fact.
- **FE-12.3.5 (SHOULD)** Expensive aggregates (campaign correlation) SHOULD be read from precomputed views/RPCs, not assembled client-side.

### Acceptance Criteria
- **AC-FE-12.3.a** Given a server action mutation, when invoked, then it re-checks session + role server-side before writing.
- **AC-FE-12.3.b** Given network inspection on a public page, when checking requests, then no Supabase service-role key or privileged endpoint is present.

### Example — Supabase server client + server action
```ts
// lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient as createSSR } from "@supabase/ssr";

export function createServerClient() {
  const store = cookies();
  return createSSR(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (c) => c.forEach(({ name, value, options }) => store.set(name, value, options)),
    },
  });
}
```
```ts
// app/report/actions.ts
"use server";
import { z } from "zod";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

const ReportSchema = z.object({
  channel: z.enum(["sms", "email", "call", "web", "marketplace", "other"]),
  description: z.string().min(10).max(5000),
  entities: z.array(z.object({ type: z.string(), value: z.string().max(512) })).max(50),
  evidencePaths: z.array(z.string()).max(10).optional(),
});

export async function submitReport(formData: FormData) {
  const parsed = ReportSchema.safeParse(JSON.parse(String(formData.get("payload"))));
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten() };

  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser(); // may be null (anonymous allowed)
  const { data, error } = await supabase.rpc("submit_report", {
    p_payload: parsed.data,
    p_user: user?.id ?? null,
  });
  if (error) return { ok: false, errors: { formErrors: ["Could not submit. Please try again."] } };
  redirect(`/report/thanks?id=${data.id}`);
}
```

### Edge Cases
Anonymous submission allowed (shared roles) but rate-limited (Backend); failures show calm retry copy, never blame the user.

### Security Considerations
Validate every mutation server-side (client validation is UX only). RLS is the source of truth. Sanitize stored/echoed text.

### Accessibility
Server-action results surface as accessible inline errors (FE-12.8/14).

### Performance
RSC fetch co-located with render; precomputed RPCs for aggregates.

### Future Expansion
Supabase Realtime subscriptions for live campaign/alert updates (client island).

---

## 4. Caching, Revalidation & Streaming

### Purpose
Define caching/revalidation per route and use streaming so explanation-first content paints fast.

### Strategy
| Content | Strategy |
|---|---|
| `/`, `/academy`, `/transparency`, `/threat/[slug]` | SSG + ISR (`revalidate` 1h–24h) + tag-based revalidation |
| `/entity`, `/campaign`, `/search` | Dynamic RSC; short `revalidate` or `no-store` for fresh signals |
| `/account`, `/moderation`, `/alerts` | `no-store`, per-request |
| Mutations | `revalidateTag()`/`revalidatePath()` after writes |

### Requirements
- **FE-12.4.1 (MUST)** Mutations affecting public data MUST call `revalidateTag`/`revalidatePath` so stale verdicts don't persist.
- **FE-12.4.2 (MUST)** Authenticated/personalized routes MUST NOT be statically cached or shared across users.
- **FE-12.4.3 (SHOULD)** Verdict/explanation content SHOULD stream via Suspense so the explanation lead paints before slower correlations (Principle 1, FE-12.10).
- **FE-12.4.4 (SHOULD)** Tagged caching SHOULD key on entity/threat/campaign IDs for surgical invalidation.

### Acceptance Criteria
- **AC-FE-12.4.a** Given a moderation action that updates an entity verdict, when it completes, then the public entity page reflects the change on next request (tag revalidated).
- **AC-FE-12.4.b** Given a slow campaign correlation, when the entity page loads, then the explanation summary streams in first with a skeleton for the slower section.

### Edge Cases
Revalidation race: show last-known verdict with a "updating" affordance rather than an empty state.

### Security Considerations
Never cache personalized/PII responses at the edge; set `Cache-Control: private`/`no-store` for authed routes.

### Accessibility
Streaming boundaries announce loading via accessible skeletons (FE-12.10/14).

### Performance
ISR + streaming optimizes TTFB/LCP (FE-12.13).

### Future Expansion
PPR; stale-while-revalidate tuning per signal freshness.

---

## 5. State Management

### Purpose
Minimize global state. Recommend a layered model: **URL state → React local/server state → server cache**, with no heavy global store.

### Recommendation & justification
- **URL is the primary shareable state** (search query, filters, wizard step) via `searchParams`/route segments — deep-linkable, SSR-friendly, SEO-friendly, back-button-correct.
- **Server cache (RSC + Next cache)** holds canonical data; we don't duplicate it into a client store.
- **Local React state** (`useState`/`useReducer`) for ephemeral UI (open disclosure, current wizard field).
- **A tiny client store (Zustand)** is permitted ONLY for genuinely cross-component client UI that can't be URL/local (e.g., upload progress shared across wizard steps). We deliberately avoid Redux and avoid a global client cache like React Query for primary data, because RSC already provides server-cached data — adding a parallel client cache would duplicate fetching, increase bundle size, and risk drift from RLS-enforced server truth.

### Requirements
- **FE-12.5.1 (MUST)** Shareable/navigational state (search, filters, wizard step) MUST live in the URL.
- **FE-12.5.2 (MUST)** Primary domain data MUST come from the server cache (RSC), not be mirrored into a client global store.
- **FE-12.5.3 (SHOULD)** Cross-step client UI state (upload progress, draft) SHOULD use a minimal scoped store (Zustand) or React context, not a global app store.
- **FE-12.5.4 (SHOULD NOT)** The app SHOULD NOT introduce Redux or a global client data-fetching cache for server-owned data.

### Acceptance Criteria
- **AC-FE-12.5.a** Given a search with filters, when the URL is copied to a new tab, then identical results render (state fully in URL).
- **AC-FE-12.5.b** Given the bundle, when audited, then no Redux/global-cache dependency is present for primary data.

### Edge Cases
Wizard draft persistence across reload → optionally persist a draft to `sessionStorage` (non-PII) and/or a server draft row; never lose a victim's report on accidental navigation.

### Security Considerations
Do not place PII (names, account numbers from a report) into URL query strings or `localStorage`; keep those in the server draft.

### Accessibility
URL-driven state keeps browser history/back working (predictable for AT users).

### Performance
No redundant client cache → smaller bundle, no double-fetch.

### Future Expansion
React `use()` + cache primitives as they stabilize.

---

## 6. Component Hierarchy & Directory Layout

### Purpose
A predictable directory layout separating UI primitives, domain components, and route code.

### Layout
```
app/                      # routes (see §1)
components/
├─ ui/                    # design-system primitives (Volume 7): Button, Input, Badge, Card, Spinner
├─ verdict/               # VerdictCard, ConfidenceMeter, ExplanationPanel
├─ entity/                # EntityChip, EntityProfile
├─ search/                # SearchBox, ResultList, Filters
├─ report/                # wizard steps, UploadField
├─ layout/                # Header, Footer, SkipLink, ThemeToggle, Nav
└─ academy/               # MDX renderers
lib/
├─ supabase/              # server.ts, browser.ts
├─ validation/            # zod schemas shared client+server
├─ seo/                   # metadata + JSON-LD builders (Volume 19)
├─ cn.ts                  # class merge
└─ i18n/                  # message loader (FE-12.11)
hooks/                    # useReducedMotion, useTheme, etc.
types/                    # shared TS types (mirror Volume 10 entities)
tests/                    # unit/integration (Volume 15)
```

### Requirements
- **FE-12.6.1 (MUST)** UI primitives MUST live in `components/ui` and consume only Volume 7 tokens (no hardcoded colors).
- **FE-12.6.2 (MUST)** Domain components (`verdict`, `entity`) MUST compose primitives, not re-implement styling.
- **FE-12.6.3 (MUST)** Validation schemas MUST be shared between client and server (`lib/validation`) to avoid drift.
- **FE-12.6.4 (SHOULD)** Types in `types/` SHOULD be generated from the Supabase schema (Volume 10) to stay in sync.

### Acceptance Criteria
- **AC-FE-12.6.a** Given an import-boundary lint, when a route imports raw color hex or bypasses `components/ui`, then the lint fails.

### Edge Cases
Shared schema must compile in both server and client contexts (no Node-only imports in shared validation).

### Security Considerations
Keep server-only utilities (`lib/supabase/server`) out of client bundles via `server-only` package guard.

### Accessibility
Primitives bake in a11y (Volume 7), so domain components inherit it.

### Performance
Clear boundaries enable tree-shaking and per-route code-splitting.

### Future Expansion
Optional Storybook for primitives (Volume 15 visual tests).

---

## 7. Design-Token Consumption (Volume 7)

### Purpose
Consume Volume 7 tokens exclusively; theme via the root `data-theme` attribute.

### Requirements
- **FE-12.7.1 (MUST)** Components MUST use Tailwind utilities mapped to Volume 7 CSS variables (e.g., `bg-surface`, `text-danger-fg`); raw hex MUST NOT appear in components (DS-7.2.1).
- **FE-12.7.2 (MUST)** The root layout MUST bootstrap the theme pre-hydration (inline, CSP-nonce'd script) to prevent flash (DS-7.15.3).
- **FE-12.7.3 (MUST)** Motion utilities MUST honor `prefers-reduced-motion` (DS-7.7 global floor present in `globals.css`).
- **FE-12.7.4 (SHOULD)** A theme/font-size preference SHOULD persist (cookie/profile) and sync for logged-in users.

### Acceptance Criteria
- **AC-FE-12.7.a** Given system dark mode, when the app first paints, then dark tokens apply with no flash (nonce'd bootstrap script ran).

### Example — root layout theme bootstrap
```tsx
// app/layout.tsx (Server Component)
import "./globals.css";
import { headers } from "next/headers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = headers().get("x-nonce") ?? undefined; // set in middleware CSP
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="bg-bg text-text font-sans antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:p-3 focus:bg-surface">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
```

### Edge Cases
No `localStorage`/`matchMedia` → default light; never throw.

### Security Considerations
Inline bootstrap must carry the CSP nonce; no user input concatenated into it.

### Accessibility
Skip-link present; tokens guarantee AA (Volume 7).

### Performance
Zero-JS theming after bootstrap.

### Future Expansion
High-contrast/low-stimulation themes via additional token sets.

---

## 8. Forms — Report Wizard & Validation

### Purpose
A trauma-aware, multi-step report wizard with shared client+server validation.

### Background
The wizard collects: channel → what happened (description) → detected entities (confirm/edit) → optional evidence upload → review/submit. Tone is non-blaming (Principle 2). Validation uses one Zod schema on both sides.

### Steps
1. **Channel** — how it reached you (sms/email/call/web/marketplace/other).
2. **What happened** — free text; supportive helper copy; optional.
3. **Entities** — auto-extracted candidates (phone/url/email/wallet) the user confirms/edits.
4. **Evidence** — optional screenshot upload (FE-12.9).
5. **Review & submit** — shows what will be stored, privacy note, "not legal advice," and verification handoff.

### Requirements
- **FE-12.8.1 (MUST)** Validation MUST run on the server (authoritative) via the shared Zod schema; client validation is UX-only (FE-12.3.3).
- **FE-12.8.2 (MUST)** Errors MUST be accessible: `aria-invalid`, text error linked by `aria-describedby`, focus moved to first error on submit (DS-7.13).
- **FE-12.8.3 (MUST)** Wizard MUST be keyboard-operable, each step a labeled `fieldset`/region with a clear step indicator (text, not color-only).
- **FE-12.8.4 (MUST)** Copy MUST be non-blaming/trauma-aware; the review step MUST show what's stored + privacy note + "not legal advice" + an official-org verification CTA.
- **FE-12.8.5 (SHOULD)** Drafts SHOULD persist (server draft / `sessionStorage`, non-PII) so a report isn't lost on reload (FE-12.5).
- **FE-12.8.6 (SHOULD)** Anonymous submission SHOULD be allowed; sign-in offered as optional (for follow-up alerts), never required to get help.

### Acceptance Criteria
- **AC-FE-12.8.a** Given an invalid submit, when the action returns errors, then focus moves to the first invalid field and its error is announced.
- **AC-FE-12.8.b** Given JS disabled, when submitting via server action fallback, then validation still runs server-side and a meaningful result renders.
- **AC-FE-12.8.c** Given the review step, when shown, then stored data, privacy note, "not legal advice," and a verification CTA are all present.

### Example — shared schema + error rendering
```ts
// lib/validation/report.ts  (shared client + server)
import { z } from "zod";
export const ReportSchema = z.object({
  channel: z.enum(["sms", "email", "call", "web", "marketplace", "other"]),
  description: z.string().trim().min(10, "Add a little detail so we can help (10+ characters).").max(5000),
  entities: z.array(z.object({ type: z.string(), value: z.string().max(512) })).max(50),
});
export type ReportInput = z.infer<typeof ReportSchema>;
```
```tsx
// components/report/DescriptionField.tsx (client)
"use client";
export function DescriptionField({ error }: { error?: string }) {
  return (
    <div>
      <label htmlFor="description" className="block text-base font-medium text-text">
        What happened? <span className="text-text-subtle">(optional, but helpful)</span>
      </label>
      <p id="desc-help" className="mt-1 text-sm text-text-muted">
        You're not in trouble. Tell us what you saw — we'll explain it and point you to official help.
      </p>
      <textarea
        id="description" name="description" rows={5}
        aria-describedby={error ? "desc-help desc-err" : "desc-help"}
        aria-invalid={error ? true : undefined}
        className="mt-2 w-full rounded-sm border border-border-strong bg-surface p-3 text-base
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      />
      {error && <p id="desc-err" className="mt-1 text-sm text-danger-fg">{error}</p>}
    </div>
  );
}
```

### Edge Cases
User pastes PII (SSN, card) into description → server redacts/flags before storage (Backend); UI warns calmly not to include sensitive numbers.

### Security Considerations
Server-authoritative validation, PII minimization (Principle 3), sanitize before store/echo, rate-limit anonymous submits.

### Accessibility
Labeled fields, error focus management, keyboard wizard, step indicator in text (DS-7.13/16).

### Performance
Wizard steps are small client islands; heavy logic server-side.

### Future Expansion
Inline live entity detection; guided "what to do next" branching per threat type.

---

## 9. File / Image Upload UX

### Purpose
Let users attach scam screenshots via Supabase Storage signed URLs, safely and accessibly.

### Background
Flow: client requests a **signed upload URL** from a server action (scoped, expiring) → uploads directly to Storage → server records the path on the report → server-side scanning (Backend) before the evidence is shown anywhere. Files are private by default; display uses signed **read** URLs.

### Requirements
- **FE-12.9.1 (MUST)** Uploads MUST use short-lived signed URLs issued server-side; the client MUST NOT hold storage write credentials.
- **FE-12.9.2 (MUST)** Client MUST validate type (image/png, image/jpeg, image/webp, application/pdf) and size (e.g., ≤10MB) before requesting a URL; server re-validates and scans (Backend).
- **FE-12.9.3 (MUST)** Uploaded evidence MUST render in the labeled, distinct `evidence` container (DS-7.10.5) — never styled as a ScamWatch verdict; bucket is private, shown via signed read URLs.
- **FE-12.9.4 (MUST)** The upload control MUST be keyboard-operable, labeled, expose progress with a text/`aria` equivalent, and provide a remove action.
- **FE-12.9.5 (SHOULD)** EXIF/location metadata SHOULD be stripped (privacy, Principle 3) server-side before retention.
- **FE-12.9.6 (SHOULD)** The UI SHOULD warn users to redact personal info visible in screenshots.

### Acceptance Criteria
- **AC-FE-12.9.a** Given a 12MB file, when selected, then the client rejects it with an accessible error before any network call.
- **AC-FE-12.9.b** Given a successful upload, when displayed, then it appears in the labeled evidence container via a signed (not public) URL.
- **AC-FE-12.9.c** Given upload in progress, when a screen reader is active, then progress is announced via an `aria-live`/`progressbar` equivalent.

### Example — signed upload
```ts
// app/report/actions.ts (server)
"use server";
import { createServerClient } from "@/lib/supabase/server";
export async function createSignedUpload(filename: string, contentType: string) {
  const allowed = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
  if (!allowed.includes(contentType)) return { ok: false as const, error: "Unsupported file type." };
  const supabase = createServerClient();
  const path = `reports/${crypto.randomUUID()}/${filename}`;
  const { data, error } = await supabase.storage.from("evidence").createSignedUploadUrl(path);
  if (error) return { ok: false as const, error: "Could not start upload." };
  return { ok: true as const, path, token: data.token, signedUrl: data.signedUrl };
}
```
```tsx
// components/report/UploadField.tsx (client, abbreviated)
"use client";
import { useState } from "react";
import { createSignedUpload } from "@/app/report/actions";
import { createBrowserClient } from "@/lib/supabase/browser";

const MAX = 10 * 1024 * 1024;
export function UploadField() {
  const [progress, setProgress] = useState<number | null>(null);
  const [err, setErr] = useState<string>();

  async function onFile(file: File) {
    setErr(undefined);
    if (file.size > MAX) return setErr("That file is over 10MB. Please choose a smaller image.");
    const res = await createSignedUpload(file.name, file.type);
    if (!res.ok) return setErr(res.error);
    setProgress(0);
    const supabase = createBrowserClient();
    const { error } = await supabase.storage.from("evidence")
      .uploadToSignedUrl(res.path, res.token, file);
    setProgress(error ? null : 100);
    if (error) setErr("Upload failed. Please try again.");
  }

  return (
    <div>
      <label htmlFor="evidence" className="block text-base font-medium text-text">
        Add a screenshot (optional)
      </label>
      <p className="mt-1 text-sm text-text-muted">Please blur or crop any of your personal details first.</p>
      <input
        id="evidence" type="file" accept="image/png,image/jpeg,image/webp,application/pdf"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        className="mt-2 block w-full text-sm"
      />
      {progress !== null && (
        <div role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}
             aria-label="Upload progress" className="mt-2 h-2 rounded-full bg-surface-muted">
          <div className="h-full rounded-full bg-brand" style={{ width: `${progress}%` }} />
        </div>
      )}
      {err && <p className="mt-1 text-sm text-danger-fg" role="alert">{err}</p>}
    </div>
  );
}
```

### Edge Cases
Network failure mid-upload → retain selection, allow retry, calm message. Duplicate uploads de-duped server-side by hash (Backend).

### Security Considerations
Private bucket + signed read URLs; server-side malware/content scanning before display; EXIF stripping; never render uploaded SVG (XSS); validate magic bytes server-side, not just declared MIME.

### Accessibility
Labeled input, `role="progressbar"`, `role="alert"` errors, remove action keyboard-reachable.

### Performance
Direct-to-Storage upload offloads the app server; thumbnails generated server-side.

### Future Expansion
Drag-and-drop (with keyboard/file-picker alternative per DS-7.16.9); client-side redaction tool.

---

## 10. Error, Loading & Suspense Boundaries

### Purpose
Calm, accessible error/loading states that never alarm or blame, with streaming.

### Requirements
- **FE-12.10.1 (MUST)** Each route segment MUST provide `loading.tsx` (skeleton) and an `error.tsx` boundary; a global `not-found.tsx` MUST exist.
- **FE-12.10.2 (MUST)** Error UIs MUST use calm, non-alarming copy and offer a recovery action (retry/back/search) plus a verification route where relevant.
- **FE-12.10.3 (MUST)** Loading skeletons MUST be announced accessibly (`aria-busy`/visually-hidden status) and MUST respect reduced motion (DS-7.7).
- **FE-12.10.4 (SHOULD)** Slow secondary data (campaign correlation) SHOULD be wrapped in `<Suspense>` so explanation-first content streams immediately (Principle 1, FE-12.4.3).

### Acceptance Criteria
- **AC-FE-12.10.a** Given a thrown error in a segment, when caught, then the boundary shows calm copy + recovery, and the rest of the app stays usable.
- **AC-FE-12.10.b** Given reduced motion, when a skeleton renders, then no shimmer animation runs.

### Example — streaming with Suspense
```tsx
// app/entity/[type]/[value]/page.tsx (excerpt)
import { Suspense } from "react";
export default async function Page(/* ... */) {
  return (
    <main id="main">
      {/* explanation-first, fast */}
      <EntitySummary /* ...rsc... */ />
      <Suspense fallback={<SkeletonBlock label="Loading related campaigns" />}>
        {/* slower correlation streams in */}
        <CampaignCorrelation /* ...rsc... */ />
      </Suspense>
    </main>
  );
}
```

### Edge Cases
Total data outage → show cached/last-known with an honest "we couldn't refresh" note, never a fake verdict.

### Security Considerations
Error UIs MUST NOT leak stack traces/internal IDs to users; log server-side only.

### Accessibility
`role="alert"` for errors, accessible skeletons, focus moved to error heading.

### Performance
Streaming improves LCP; skeletons reserve layout (no CLS, FE-12.13).

### Future Expansion
Standardized empty-state component library.

---

## 11. Internationalization Readiness

### Purpose
Be i18n-ready from day one (launch English/Florida) without a heavy runtime now.

### Requirements
- **FE-12.11.1 (MUST)** User-facing strings MUST NOT be hardcoded in components; they MUST come from a message catalog (`lib/i18n`), even if only `en` exists at launch.
- **FE-12.11.2 (MUST)** The architecture MUST support locale-prefixed routes (`/[locale]/…`) and `<html lang>` per locale without restructuring components.
- **FE-12.11.3 (SHOULD)** Dates/numbers/currency SHOULD use `Intl`; copy SHOULD avoid idioms that don't translate (also aids plain-language goals).
- **FE-12.11.4 (SHOULD)** Layout SHOULD be logical-property based (`ms-`/`me-`, `start`/`end`) to ease future RTL (Spanish first, then others).

### Acceptance Criteria
- **AC-FE-12.11.a** Given a grep for user-facing literals in components, when audited, then strings resolve via the catalog (no raw UI copy).
- **AC-FE-12.11.b** Given a second locale added later, when configured, then routes/lang switch without component rewrites.

### Edge Cases
Trauma-aware tone must survive translation — translator notes flag sensitive strings.

### Security Considerations
Don't interpolate untrusted data into translation templates (avoid format-string issues).

### Accessibility
Correct `lang` improves screen-reader pronunciation; RTL mirroring planned (DS-7).

### Performance
Catalogs loaded per-locale server-side; no full-dictionary client ship.

### Future Expansion
Spanish (high priority for Florida), then per Phase 2/3 rollout.

---

## 12. SEO & AI-Answer Discoverability

### Purpose
Make public ScamWatch pages discoverable by search engines and citable by AI answer engines, per Volume 19, without over-claiming.

### Background
Public taxonomy/entity/threat/academy pages should rank and be quotable. We provide metadata, Open Graph, canonical URLs, sitemaps, and JSON-LD structured data, with calibrated claims (no false certainty for AI to amplify).

### Requirements
- **FE-12.12.1 (MUST)** Public pages MUST export `generateMetadata` with title, description, canonical, and Open Graph/Twitter tags.
- **FE-12.12.2 (MUST)** Threat/entity/academy pages MUST emit JSON-LD structured data (e.g., `FAQPage`, `Article`, `Dataset`/`ClaimReview`-style as appropriate) via a typed builder (`lib/seo`), aligned with Volume 19.
- **FE-12.12.3 (MUST)** `robots.ts` and `sitemap.ts` MUST be present; protected/personalized routes MUST be `noindex`.
- **FE-12.12.4 (MUST)** Structured claims MUST carry calibrated framing/confidence and "verify with official source" (no absolute accusations for AI to quote) — shared Principles 5–7 + legal guardrails.
- **FE-12.12.5 (SHOULD)** Content SHOULD be answer-shaped (clear question headings, concise summaries) to improve AI citation while remaining accurate.

### Acceptance Criteria
- **AC-FE-12.12.a** Given a threat page, when crawled, then valid JSON-LD + canonical + OG tags are present and pass a structured-data validator.
- **AC-FE-12.12.b** Given `/account`/`/moderation`, when crawled, then they are `noindex`.

### Example — metadata + JSON-LD
```tsx
// app/threat/[slug]/page.tsx (excerpt)
import type { Metadata } from "next";
import { buildFaqJsonLd } from "@/lib/seo/jsonld";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = await getThreat(slug);
  return {
    title: `${t.name} — how it works and how to verify | ScamWatch`,
    description: t.summary,
    alternates: { canonical: `https://scamwatch.org/threat/${slug}` },
    openGraph: { title: t.name, description: t.summary, type: "article" },
    robots: { index: true, follow: true },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await getThreat(slug);
  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd(t.faqs)) }} />
      {/* ...page content (explain-first)... */}
    </>
  );
}
```

### Edge Cases
Entity pages for low-evidence entities should be `noindex` until enough corroboration exists (avoids defaming via search — legal guardrails).

### Security Considerations
JSON-LD is server-built from trusted fields only; never inject unsanitized user text into structured data.

### Accessibility
Semantic headings double as SEO structure and AT navigation.

### Performance
Metadata/JSON-LD are static/server; negligible cost.

### Future Expansion
Per Volume 19: feeds/APIs for vetted partners; `ClaimReview` where appropriate.

---

## 13. Performance Budget

### Purpose
Set enforceable Core Web Vitals and bundle budgets.

### Targets
| Metric | Target (p75, mobile) |
|---|---|
| LCP | ≤2.5s |
| INP | ≤200ms |
| CLS | ≤0.1 |
| TTFB | ≤0.8s |
| First-load JS per public route | ≤120KB gzip |
| Shared client JS | ≤90KB gzip |

### Requirements
- **FE-12.13.1 (MUST)** Public routes MUST meet the CWV targets at p75 mobile; CI MUST run Lighthouse/CWV checks and fail on regressions beyond threshold.
- **FE-12.13.2 (MUST)** First-load JS per public route MUST stay within budget; a bundle-size CI gate MUST enforce it.
- **FE-12.13.3 (MUST)** Images MUST use `next/image` (or signed-URL equivalent) with explicit dimensions to prevent CLS; evidence images lazy-loaded.
- **FE-12.13.4 (SHOULD)** Fonts SHOULD be system stacks (Volume 7) to avoid web-font cost; if any web font is added, it MUST be `font-display: swap` and subset.
- **FE-12.13.5 (SHOULD)** Heavy/interactive widgets SHOULD be dynamically imported (code-split) and below-the-fold deferred.

### Acceptance Criteria
- **AC-FE-12.13.a** Given a CI bundle report, when a PR pushes a route over budget, then the gate fails with the offending modules listed.
- **AC-FE-12.13.b** Given a Lighthouse CI run, when CWV regress past thresholds, then the build fails.

### Edge Cases
Large evidence images → server-generated responsive thumbnails; never ship full-res to the client list view.

### Security Considerations
Don't proxy arbitrary remote images (SSRF); only signed Storage URLs and an allowlist.

### Accessibility
Stable layout (low CLS) aids users with cognitive/motor needs; reduced-motion respected.

### Performance
This section is the budget.

### Future Expansion
PPR, RUM-based field monitoring feeding the transparency dashboard.

---

## 14. Accessibility Implementation Patterns

### Purpose
Operationalize Volume 7's accessibility contract (DS-7.16) in the app shell and patterns.

### Requirements
- **FE-12.14.1 (MUST)** Every page MUST have a skip-link, a single `<h1>`, landmark regions (`header`/`main#main`/`footer`), and logical heading order.
- **FE-12.14.2 (MUST)** Focus MUST be managed on route change and after async actions (move focus to new `<h1>`/first error); focus rings never removed (DS-7.16.1).
- **FE-12.14.3 (MUST)** Interactive targets MUST meet ≥24px (≥44px primary) and not rely on color alone (DS-7.16).
- **FE-12.14.4 (MUST)** Dynamic updates (results, errors, upload progress) MUST use appropriate `aria-live`/roles.
- **FE-12.14.5 (SHOULD)** Components SHOULD be axe-clean in CI (FE-12.15) and tested with keyboard-only flows.

### Acceptance Criteria
- **AC-FE-12.14.a** Given keyboard-only navigation across all routes, when traversed, then skip-link works, focus is visible and managed, and all controls are operable.
- **AC-FE-12.14.b** Given axe-core in CI, when each route/story runs, then zero serious/critical violations.

### Edge Cases
SPA route transitions can drop focus → explicit focus management on navigation.

### Security Considerations
Don't expose sensitive PII via `aria-label` beyond what's visible.

### Accessibility
This section is the implementation of the contract.

### Performance
axe runs in CI only.

### Future Expansion
Automated a11y snapshot diffs per PR.

---

## 15. Testing Hooks (Volume 15)

### Purpose
Provide stable, testable seams for the test strategy in Volume 15.

### Requirements
- **FE-12.15.1 (MUST)** Interactive elements MUST be queryable by role/name (RTL/Playwright) — accessible names are the primary test handle (avoid brittle `data-testid` where a role/name suffices).
- **FE-12.15.2 (MUST)** Validation schemas (`lib/validation`) MUST be unit-testable in isolation (shared client/server).
- **FE-12.15.3 (MUST)** Server actions MUST be testable with mocked Supabase clients; auth/role checks MUST have tests for unauthorized paths.
- **FE-12.15.4 (SHOULD)** Critical flows (search → verdict, report wizard submit, upload) SHOULD have Playwright E2E + axe a11y assertions.
- **FE-12.15.5 (SHOULD)** Reduced-motion and dark-mode SHOULD be covered by component tests (mock media query / set `data-theme`).

### Acceptance Criteria
- **AC-FE-12.15.a** Given the report wizard, when an E2E test runs, then it completes via keyboard, asserts accessible errors, and passes an axe scan.
- **AC-FE-12.15.b** Given a moderation server action, when an unauthorized user invokes it in test, then it rejects.

### Edge Cases
Streaming/Suspense tests must await hydration/stream completion deterministically.

### Security Considerations
Tests for authz (deny-by-default) and for "AI output framed as assessment, not fact" copy guards.

### Accessibility
a11y assertions are first-class in the test matrix (ties to Volume 15).

### Performance
CWV/bundle gates run in CI (FE-12.13).

### Future Expansion
Visual regression (Storybook + snapshot) for design-system primitives.

---

*End of Volume 12 — Frontend Architecture.*
