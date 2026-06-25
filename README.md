<div align="center">

# ScamWatch

**Know Before You Click.™**

A public-benefit consumer scam intelligence platform — helping people **identify, understand, verify, and report** scams before they become victims.

[Documentation](docs/prd/README.md) · [Contributing](CONTRIBUTING.md) · [Security](SECURITY.md) · [Code of Conduct](CODE_OF_CONDUCT.md)

</div>

---

> **Status:** Pre-alpha. Live preview: **[scamwatch-seven.vercel.app](https://scamwatch-seven.vercel.app)** (deploys on every push). This repository contains the full Product Requirements Document (`docs/prd/`) and an application skeleton aligned to it. Search runs end-to-end but returns "No Signal" until Supabase + OpenAI environment variables are configured in Vercel.

## What this is

ScamWatch is **not merely a scam database** — it is a public-benefit intelligence platform built on four pillars: AI, community intelligence, transparent explanations, and official verification resources. Launch market: **Florida** → United States → Global.

It is governed by nine product principles that every feature is measured against:

1. Explain before warning · 2. Respect victims · 3. Protect privacy · 4. Keep core education free · 5. Be transparent · 6. Never exaggerate · 7. Always route to official verification · 8. Build trust before growth · 9. Every feature prevents real-world harm.

## Tech stack

| Layer    | Technology                                                                                   |
| -------- | -------------------------------------------------------------------------------------------- |
| Frontend | Next.js (App Router) · React · TypeScript · TailwindCSS                                      |
| Backend  | Supabase — PostgreSQL · Auth · Storage · Edge Functions                                      |
| AI       | OpenAI APIs · OCR · entity extraction · classification · campaign detection · explainability |
| Data     | PostgreSQL + `pgvector` (embeddings + knowledge graph)                                       |
| Hosting  | Vercel (web) · Supabase Cloud (data/auth/storage)                                            |
| CI/CD    | GitHub Actions → Vercel                                                                      |

## Repository layout

```
ScamWatch/
├── docs/
│   ├── prd/            # Master PRD — 20 volumes + shared context + index (START HERE)
│   └── notion/         # Notion-import bundle (index + database CSV + import guide)
├── src/
│   ├── app/            # Next.js App Router routes (Vol 12 route map)
│   ├── components/ui/  # Design-system components (Vol 6 / Vol 7)
│   ├── lib/            # Supabase + AI clients and helpers (Vol 8 / Vol 13)
│   ├── styles/         # globals.css — Vol 7 token map
│   └── types/          # Shared + generated DB types
├── supabase/
│   ├── migrations/     # SQL schema (Vol 10)
│   └── functions/      # Edge Functions: AI pipeline workers (Vol 8 / Vol 13)
├── tests/              # unit (Vitest) · integration · e2e (Playwright) (Vol 15)
└── .github/            # CI/CD, issue/PR templates, CODEOWNERS (Vol 17)
```

## Quick start

> Prerequisites: Node ≥ 22 (`.nvmrc` — required for native WebSocket used by the Supabase client), npm 10+, and the [Supabase CLI](https://supabase.com/docs/guides/cli).

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local      # then fill in Supabase + OpenAI keys

# 3. Start the local database (applies migrations + seed)
npm run db:start
npm run db:reset

# 4. Generate typed DB client
npm run db:types

# 5. Run the app
npm run dev                     # http://localhost:3000
```

## Common scripts

| Script                                         | Purpose                                 |
| ---------------------------------------------- | --------------------------------------- |
| `npm run dev`                                  | Start the dev server                    |
| `npm run build` / `start`                      | Production build / serve                |
| `npm run lint` / `typecheck`                   | ESLint / `tsc --noEmit`                 |
| `npm test` / `test:watch`                      | Unit + component tests (Vitest)         |
| `npm run test:e2e` / `test:a11y`               | Playwright E2E / accessibility journeys |
| `npm run format`                               | Prettier                                |
| `npm run db:reset` / `db:migrate` / `db:types` | Supabase schema lifecycle               |

## Documentation

The authoritative specification lives in [`docs/prd/`](docs/prd/README.md) — 20 volumes covering vision, strategy, personas, journeys, functional + UX requirements, design system, AI engine, knowledge graph, database, API, frontend/backend architecture, security, testing, operations, deployment, analytics, and the future roadmap. Start with the [PRD index](docs/prd/README.md).

## Contributing & safety

Read [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Found a vulnerability? Do **not** open a public issue — follow the [Security Policy](SECURITY.md).

This project is consumer protection, **not legal advice**. ScamWatch always encourages verification through official organizations (FTC, FBI IC3, CFPB, state Attorneys General).

## License

Licensed under **AGPL-3.0-or-later** — see [LICENSE](LICENSE). Chosen to keep this public-benefit platform and its derivatives open.
