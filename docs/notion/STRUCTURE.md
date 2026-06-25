# Notion page hierarchy

Intended structure once imported. Notion creates one page per Markdown file and one database from the CSV; nest the volume pages under the section toggles below.

```
ScamWatch PRD                         ← 00-ScamWatch-PRD.md (workspace home)
├── PRD Index (database)              ← scamwatch-prd-index.csv
│     views: Table by Discipline · Board by Status · Gallery
├── Shared Context                    ← ../prd/_shared-context.md
│
├── 1 · Strategy
│   ├── Vol 00 — Executive Vision
│   ├── Vol 01 — Business Strategy
│   └── Vol 02 — Market Research
├── 2 · Users
│   ├── Vol 03 — User Personas
│   └── Vol 04 — User Journeys
├── 3 · Product & UX
│   ├── Vol 05 — Functional Requirements
│   └── Vol 06 — UX Specification
├── 4 · Design & Frontend
│   ├── Vol 07 — Design System
│   └── Vol 12 — Frontend Architecture
├── 5 · Intelligence
│   ├── Vol 08 — AI Intelligence Engine
│   └── Vol 09 — Knowledge Graph
├── 6 · Data & Platform
│   ├── Vol 10 — Database
│   ├── Vol 11 — API Specification
│   └── Vol 13 — Backend Architecture
├── 7 · Trust & Quality
│   ├── Vol 14 — Security
│   └── Vol 15 — Testing
└── 8 · Run
    ├── Vol 16 — Operations
    ├── Vol 17 — Deployment
    ├── Vol 18 — Analytics
    └── Vol 19 — Future Roadmap
```

## Why this grouping

The sections follow the build sequence rather than strict volume order, so a reader moves from _why_ → _who_ → _what_ → _how it looks_ → _how it thinks_ → _how it persists_ → _how it stays safe_ → _how it runs_. Design (7) sits with Frontend (12) and Backend (13) sits with Data (10, 11) because those pairs are read and worked together. The PRD Index database stays at the top so any volume can also be reached by Discipline, Status, or Requirement Prefix without walking the tree.
