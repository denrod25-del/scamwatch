# ScamWatch PRD

**Know Before You Click.™** — the master product requirements document for ScamWatch, a public-benefit consumer scam intelligence platform that helps people identify, understand, verify, and report scams before they become victims.

> This page is the Notion home for the PRD. Import the 20 volume files as sub-pages and the index CSV as a linked database (see `README-notion-import.md`).

## Product principles

1. Explain before warning
2. Respect victims
3. Protect privacy
4. Keep core education free
5. Be transparent
6. Never exaggerate
7. Always route to official verification
8. Build trust before growth
9. Every feature prevents real-world harm

## Engineering stack

| Layer    | Technology                                                                                   |
| -------- | -------------------------------------------------------------------------------------------- |
| Frontend | Next.js · React · TypeScript · TailwindCSS                                                   |
| Backend  | Supabase — PostgreSQL · Auth · Storage · Edge Functions                                      |
| AI       | OpenAI APIs · OCR · entity extraction · classification · campaign detection · explainability |
| Data     | PostgreSQL + pgvector                                                                        |
| Hosting  | Vercel · Supabase Cloud                                                                      |

## Volume map

| Vol | Title                                                               | Owns                                     | Req Prefix   |
| --: | ------------------------------------------------------------------- | ---------------------------------------- | ------------ |
|   0 | [Executive Vision](../prd/vol-00-executive-vision.md)               | Problem, thesis, principles, glossary    | FR-0 / NFR-0 |
|   1 | [Business Strategy](../prd/vol-01-business-strategy.md)             | Public-benefit model, GTM, funding       | BR-1         |
|   2 | [Market Research](../prd/vol-02-market-research.md)                 | Sizing, competition, regulation          | MR-2         |
|   3 | [User Personas](../prd/vol-03-user-personas.md)                     | 11 personas + a11y profiles              | PER-3        |
|   4 | [User Journeys](../prd/vol-04-user-journeys.md)                     | 8 end-to-end journeys                    | UJ-4         |
|   5 | [Functional Requirements](../prd/vol-05-functional-requirements.md) | Exhaustive feature spec                  | FR-5         |
|   6 | [UX Specification](../prd/vol-06-ux-specification.md)               | Every page/component/interaction         | UX-6         |
|   7 | [Design System](../prd/vol-07-design-system.md)                     | Tokens, color, type, motion, a11y        | DS-7         |
|   8 | [AI Intelligence Engine](../prd/vol-08-ai-intelligence-engine.md)   | OCR→classify→campaigns→explain           | AI-8         |
|   9 | [Knowledge Graph](../prd/vol-09-knowledge-graph.md)                 | Nodes, edges, confidence, propagation    | KG-9         |
|  10 | [Database](../prd/vol-10-database.md)                               | ER, tables, indexes, RLS, retention      | DB-10        |
|  11 | [API Specification](../prd/vol-11-api-specification.md)             | REST /v1, auth, limits, errors           | API-11       |
|  12 | [Frontend Architecture](../prd/vol-12-frontend-architecture.md)     | Routes, RSC, state, perf budget          | FE-12        |
|  13 | [Backend Architecture](../prd/vol-13-backend-architecture.md)       | Queues, storage, notifications, caching  | BE-13        |
|  14 | [Security](../prd/vol-14-security.md)                               | Threat model, privacy, abuse, disclosure | SEC-14       |
|  15 | [Testing](../prd/vol-15-testing.md)                                 | Unit→E2E, a11y, perf, security, AI-eval  | QA-15        |
|  16 | [Operations](../prd/vol-16-operations.md)                           | Moderation, community, transparency      | OPS-16       |
|  17 | [Deployment](../prd/vol-17-deployment.md)                           | CI/CD, monitoring, backups, DR           | DEP-17       |
|  18 | [Analytics](../prd/vol-18-analytics.md)                             | North Star, KPIs, funnels, experiments   | AN-18        |
|  19 | [Future Roadmap](../prd/vol-19-future-roadmap.md)                   | Extension, mobile, voice, deepfake, i18n | RM-19        |

## Canonical decisions locked across volumes

- **Roles:** anonymous · member · contributor · moderator · analyst · admin (highest grant wins).
- **Domain objects:** Report · Entity · Threat · Campaign · Verification · Explanation · Confidence (DB tables map 1:1).
- **Verdict vocabulary:** Likely Safe · No Signal · Use Caution · Likely Scam · Confirmed Reported Scam.
- **North Star Metric:** Protective Actions Delivered (PAD), with a published "Estimated Harm Prevented" context model (never a hard optimization target).
- **Knowledge Graph:** Postgres `nodes`+`edges` at launch; graph-DB migration is a documented future option.
- **Confidence:** 0–1, calibrated, capped below 1.0 for automated aggregation; classification may abstain. No model output is presented as fact — every verdict carries confidence + "verify with official sources" + "not legal advice."
- **Accessibility:** WCAG 2.2 AA is a merge-blocking contract.

## How this workspace is organized

The 20 volumes are grouped into eight sections — Strategy (0–2), Users (3–4), Product & UX (5–6), Design & Frontend (7, 12), Intelligence (8–9), Data & Platform (10, 11, 13), Trust & Quality (14, 15), and Run (16–19). See `STRUCTURE.md` for the full page tree.
