# Importing the ScamWatch PRD into Notion

This bundle turns the Markdown PRD in `docs/prd/` into a structured Notion workspace. There are two complementary imports: the **volume pages** (Markdown) and the **index database** (CSV).

## A. Import the volume pages (Markdown)

1. In Notion, open the workspace/page that will hold the PRD.
2. `Settings & members` → `Import` → **Markdown & CSV** (or the `Import` button at the bottom of the sidebar).
3. Select the files in `docs/prd/` — `_shared-context.md`, `README.md`, and `vol-00…` through `vol-19…`. (Tip: zip the `docs/prd/` folder first and import the zip; Notion expands it.)
4. Notion creates one page per file. Headings (`#`, `##`, `###`) become Notion heading blocks, tables become Notion tables, and fenced code stays as code blocks.
5. Create a parent page named **ScamWatch PRD** (import `docs/notion/00-ScamWatch-PRD.md` for ready-made content) and drag the 20 volume pages under it, grouped per `STRUCTURE.md`.

> **Relative links flatten.** The volumes link to each other with relative paths like `vol-10-database.md`. Notion won't resolve those after import — keep the **volume map** on the `ScamWatch PRD` home page (it's already there) as the canonical navigation, and re-link a few high-traffic references by hand if you want in-page links.

## B. Import the index as a database (CSV)

1. `Import` → **Markdown & CSV** → choose `docs/notion/scamwatch-prd-index.csv`.
2. Notion creates a database with columns: **Name, Volume, Title, Discipline, Status, Requirement Prefix, Approx Words, Source File, Summary**.
3. Fix column types after import: set `Volume` and `Approx Words` to **Number**, `Discipline` and `Status` to **Select**, and leave the rest as **Text**.
4. Add views:
   - **Table — by Discipline** (Group by `Discipline`).
   - **Board — by Status** (Group by `Status`; everything starts at `Draft v1.0`).
   - **Gallery** for a visual index.
5. Turn `Source File` into working links, or add a **Relation** column pointing at the imported volume pages so the database and pages cross-link.
6. Pin this database (or the `ScamWatch PRD` page) as the workspace home.

## C. Optional — a Requirements database later

Every volume uses stable requirement IDs (`FR-5.1.3`, `SEC-14.8.2`, `DB-10.4.1`, …). When you're ready to track implementation, create a second Notion database **Requirements** with properties: `ID`, `Volume` (relation to the index DB), `Type` (MUST/SHOULD/MAY), `Status`, `Owner`, `PR/Issue`. You can seed it by extracting the bolded requirement lines from each volume. This gives you requirement-level traceability from spec → ticket → test.

## Files in this bundle

| File                      | Purpose                                                                            |
| ------------------------- | ---------------------------------------------------------------------------------- |
| `00-ScamWatch-PRD.md`     | Ready-made Notion **home page** (principles, stack, volume map, locked decisions). |
| `scamwatch-prd-index.csv` | The **index database** — one row per volume.                                       |
| `STRUCTURE.md`            | The intended Notion **page tree** and the rationale for the grouping.              |
| `README-notion-import.md` | This guide.                                                                        |

Titles, volume numbers, requirement prefixes, and word counts in the CSV and home page match `docs/prd/README.md` exactly.
