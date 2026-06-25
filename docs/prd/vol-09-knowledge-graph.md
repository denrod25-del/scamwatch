# Volume 9 — Knowledge Graph

> ScamWatch — *Know Before You Click™* · Project Sentinel
> This volume is written against `_shared-context.md`. Read that first.

This volume specifies the **ScamWatch Knowledge Graph (KG)**: the connective tissue that links **Reports**, **Entities**, **Threats**, **Campaigns**, **Verifications**, and **inferred Actors** into a queryable web of fraud intelligence. Per the shared-context engineering decision, the KG is **modeled in PostgreSQL as `nodes` and `edges` tables** inside Supabase — **not** a dedicated graph database at launch; a graph-DB migration is documented here as a future-expansion option. Every node and edge carries a **calibrated 0–1 confidence** that can **decay over time**, and label/confidence **propagation is damped** so the graph never manufactures runaway certainty — consistent with the principles "never exaggerate" and "be transparent." The KG is the system of record for campaign membership; the AI Intelligence Engine (Volume 8) **proposes**, the KG **records with provenance and confidence**, and humans confirm high-impact claims. Crucially, the KG never asserts that a **named private individual** is a scammer — `Actor` nodes are inferred and pseudonymous, and claims attach to *patterns and infrastructure* (defamation guardrail).

---

## Table of Contents

1. [9.0 Overview & design tenets](#90-overview--design-tenets)
2. [9.1 Node types](#91-node-types)
3. [9.2 Edge / relationship types](#92-edge--relationship-types)
4. [9.3 Confidence model (nodes & edges, decay)](#93-confidence-model-nodes--edges-decay)
5. [9.4 Propagation logic (damped)](#94-propagation-logic-damped)
6. [9.5 Campaign logic (cluster → Campaign, merge/split, lifecycle)](#95-campaign-logic)
7. [9.6 Query patterns the product needs](#96-query-patterns-the-product-needs)
8. [9.7 Data model SQL sketch](#97-data-model-sql-sketch)
9. [9.8 Integrity: dedup, conflict, retraction propagation](#98-integrity-dedup-conflict-retraction-propagation)
10. [9.9 Cross-volume contracts](#99-cross-volume-contracts)

Requirement IDs use the prefix **`KG-9`** (e.g. `KG-9.3.2`). Security IDs `SEC-9.x`, non-functional `NFR-9.x`, acceptance `AC-9.x`.

---

## 9.0 Overview & design tenets

### Purpose
Establish the KG's shape and invariants before defining nodes/edges.

### Background
Fraud intelligence is inherently relational: a wallet appears in many reports; a campaign impersonates a brand and shares infrastructure with another campaign; a verification confirms a threat. A property graph captures this naturally. We implement it relationally (two core tables + typed attributes) to stay within the authoritative Supabase/Postgres stack and to reuse `pgvector`, Row-Level Security, and transactional integrity.

```
        impersonates
 Campaign ───────────────► Brand(Entity)
    ▲  │ member_of_campaign        ▲
    │  │ (Report → Campaign)       │ extracted_from
    │  ▼                           │
 variant_of   Report ─reported_in─► (channel)        classified_as
    │            │ extracted_from          ┌───────────────► Threat
 Campaign        ▼                         │
    │          Entity ────────────────────┘
    │  shares_infrastructure_with (Entity ↔ Entity / Campaign ↔ Campaign)
    ▼
 (inferred) Actor ◄─ attributed (low-confidence, pseudonymous) ─ Campaign
                                       verified_by
                          Threat/Campaign ───────► Verification(official org)
```

### Requirements
- **KG-9.0.1 (MUST)** The KG MUST be implemented as `nodes` + `edges` tables in Postgres at launch; a separate graph DB MUST NOT be a launch dependency.
- **KG-9.0.2 (MUST)** Every node and edge MUST carry: stable `id`, `type`, `confidence ∈ [0,1]`, `created_at`, `updated_at`, `provenance`, and a soft-delete/`status` field (no hard deletes that lose audit trail, except for legally-mandated purges — see §9.8).
- **KG-9.0.3 (MUST)** All writes from Volume 8 MUST go through a KG service layer enforcing dedup, confidence rules, and provenance — no ad-hoc inserts.
- **KG-9.0.4 (MUST NOT)** The KG MUST NOT store or publicly expose an accusation that a **named private individual** is a perpetrator; `Actor` is inferred/pseudonymous (defamation guardrail, shared context).
- **KG-9.0.5 (MUST)** Confidence values MUST be **calibrated and damped**; no propagation rule may drive a value to 1.0 from aggregation alone (§9.4).

### Acceptance Criteria
- **AC-9.0.a** Given the launch schema, when inspected, then there is no external graph-DB dependency and the KG lives in Supabase Postgres.
- **AC-9.0.b** Given any node/edge, when read, then it exposes confidence, provenance, status, and timestamps.

### Edge Cases
- Cyclic relationships (campaign A variant_of B, B variant_of A) → handled by treating `variant_of` as a DAG with cycle detection at write (§9.5).

### Security Considerations
- **SEC-9.0.1** RLS MUST gate node/edge visibility by role; PII-bearing nodes (e.g. third-party personal data accidentally captured) are moderator/analyst-only.

### Accessibility
- Graph data surfaced to users (Volume 6) MUST always have a non-visual (text/table) representation; the KG layer provides query results, not only visualizations.

### Performance
- Indexing strategy in §9.7; the two-table model is index-tuned for the §9.6 query patterns.

### Future Expansion
- Migration path to a native graph DB (Neo4j/Apache AGE/`pgRouting`-style) if traversal depth/scale demands it; the node/edge abstraction is designed so the service layer can be re-pointed without changing callers.

---

## 9.1 Node types

### Purpose
Define the typed vertices of the graph and their attributes.

### Background
Nodes mirror the shared-context domain objects plus an inferred, pseudonymous `Actor`. Type-specific attributes live in a JSONB `attrs` column validated per type.

### Requirements
- **KG-9.1.1 (MUST)** The KG MUST support these node types with the attributes below; `attrs` MUST be schema-validated per type.

| Node type | Key attributes (`attrs`) | Notes |
|---|---|---|
| **Report** | `channels[]`, `language`, `submitter_role`, `submitted_at`, `raw_ref`, `status` | One per user submission (Vol 8 §8.1). PII-restricted fields are RLS-gated. |
| **Entity** | `entity_type ∈ {phone,url,domain,email,wallet,handle,payment_tag,brand,sender_name}`, `canonical_value`, `raw_aliases[]`, `validation`, `flags{lookalike_of,…}` | The dedup anchor of the graph (§9.8). `brand` entities represent the *impersonated* brand (a victim), not the scammer. |
| **Threat** | `taxonomy_category`, `title`, `description_ref`, `severity` | A classified scam pattern/type from the taxonomy. |
| **Campaign** | `lifecycle_state`, `signal_summary`, `first_seen`, `last_seen`, `report_count`, `region_summary` | Correlated cluster; system of record for membership. |
| **Verification** | `org` (FTC/IC3/state AG/CFPB/IRS/SSA/…), `scope`, `official_url`, `kind ∈ {handoff,confirmed,enforcement_cited}` | Pointer/handoff to an official org; `enforcement_cited` references a *public official* action with attribution. |
| **Actor** (inferred) | `pseudonym_id`, `inferred_from[]`, `confidence` | **Pseudonymous, inferred only.** Never a named private individual. Low default confidence. |

- **KG-9.1.2 (MUST)** `Entity.canonical_value` MUST follow Volume 8 §8.3 canonicalization (E.164 phones, registrable-domain URLs, EIP-55 wallets, etc.).
- **KG-9.1.3 (MUST)** `Brand` entities MUST be linked from a controlled brand vocabulary id where available; free-text brand names are lower confidence.
- **KG-9.1.4 (MUST NOT)** `Actor` nodes MUST NOT contain real names, addresses, or contact info of private individuals; only graph-derived pseudonymous identifiers and the evidence ids they were inferred from.
- **KG-9.1.5 (SHOULD)** `Verification` nodes SHOULD be reused across threats/campaigns (one canonical FTC handoff node referenced widely), not duplicated per report.

### Acceptance Criteria
- **AC-9.1.a** Given two reports of the same phone number, when ingested, then exactly **one** Entity node (canonical E.164) exists with both reports linked (dedup, §9.8).
- **AC-9.1.b** Given a created Actor node, when inspected, then it contains only a pseudonym + evidence ids, no real-world identity.
- **AC-9.1.c** Given an impersonated brand, when stored, then the brand Entity is marked as the impersonation *target*, not the scammer.

### Edge Cases
- An Entity that is *also* a legitimate asset (the real brand's real domain appearing in a lure) → stored once, with edges describing the *impersonation* relationship, never implying the legitimate domain is malicious.
- A Report that contains zero extractable entities → still a node; links via classification only.

### Security Considerations
- **SEC-9.1.1** Report nodes' PII-bearing attributes are RLS-restricted; public reads see a redacted projection.

### Accessibility
- Node type and entity type MUST be expressible as text labels for assistive tech (no type conveyed by color/shape alone in any UI).

### Performance
- `nodes(type)` and `nodes(type, attrs->>'canonical_value')` indexed for dedup/lookup (§9.7).

### Future Expansion
- Additional node types: `Kit` (phishing-kit fingerprint), `Infrastructure` (hosting/ASN), `Tactic` (TTP). Designed to slot in via the same `type`+`attrs` mechanism.

---

## 9.2 Edge / relationship types

### Purpose
Define typed, directed relationships and their attributes.

### Background
Edges encode how the domain objects relate. Direction matters for traversal and meaning; attributes carry confidence and provenance so every edge is explainable and retractable.

### Requirements
- **KG-9.2.1 (MUST)** The KG MUST support these directed edge types:

| Edge type | Direction (from → to) | Key attributes | Meaning |
|---|---|---|---|
| `reported_in` | Report → Channel/context | `channel`, `observed_at` | Where/how the report was encountered. |
| `extracted_from` | Entity → Report | `evidence_span`, `extractor_source ∈ {rule,llm,both}` | This entity was extracted from this report (Vol 8 §8.3). |
| `classified_as` | Report → Threat | `confidence`, `model_version`, `rationale_ids[]`, `abstained` | This report matches this threat type (Vol 8 §8.4). |
| `member_of_campaign` | Report → Campaign | `confidence`, `signals[]`, `confirmed_by` | This report belongs to this campaign (Vol 8 §8.5). |
| `impersonates` | Campaign/Report → Brand(Entity) | `confidence`, `evidence_ids[]` | The scam impersonates this brand (brand = victim). |
| `shares_infrastructure_with` | Entity↔Entity or Campaign↔Campaign | `confidence`, `shared_entity_ids[]`, `rarity_weight` | Shared fraud infrastructure (§8.5 rarity-aware). |
| `variant_of` | Campaign → Campaign | `confidence`, `similarity` | A template/kit variant lineage (DAG). |
| `verified_by` | Threat/Campaign → Verification | `kind`, `cited_source` | Routes to / is corroborated by an official org. |
| `attributed_to` | Campaign → Actor(inferred) | `confidence` (low default) | Pseudonymous, inferred actor linkage. |

- **KG-9.2.2 (MUST)** Every edge MUST carry `confidence`, `provenance` (who/what created it: model_version or analyst id), and `status`.
- **KG-9.2.3 (MUST)** `shares_infrastructure_with` and bidirectional-meaning edges MUST be stored canonically (single row with ordered endpoints) to avoid duplicate A→B / B→A rows.
- **KG-9.2.4 (MUST)** `variant_of` MUST remain acyclic; the write path MUST reject edges that would create a cycle.
- **KG-9.2.5 (MUST NOT)** No edge may publicly assert `attributed_to` a named private individual; `attributed_to` targets only pseudonymous Actor nodes and is, by default, not surfaced publicly without analyst confirmation.
- **KG-9.2.6 (MUST)** Edges created by the model MUST be distinguishable from edges confirmed by a human (`provenance.confirmed=true`), because human-confirmed edges gate public/high-impact surfaces.

### Acceptance Criteria
- **AC-9.2.a** Given an entity extracted from two reports, when stored, then two `extracted_from` edges exist, each with its own `evidence_span`.
- **AC-9.2.b** Given a proposed `variant_of` that would create a cycle, when written, then the write is rejected with a cycle error.
- **AC-9.2.c** Given a `shares_infrastructure_with` between Entity X and Entity Y, when queried both directions, then exactly one canonical edge backs both.
- **AC-9.2.d** Given a model-proposed vs analyst-confirmed `member_of_campaign`, when read, then `provenance.confirmed` distinguishes them.

### Edge Cases
- Edge between nodes of unexpected types (e.g. `classified_as` from an Entity) → rejected by edge-type/endpoint-type validation.
- Re-extraction of the same entity from the same report → upsert the existing `extracted_from` edge (idempotent, §8.0.2), not a duplicate.

### Security Considerations
- **SEC-9.2.1** `attributed_to` edges are the highest defamation-risk surface; default-private, analyst-gated, never auto-published.
- **SEC-9.2.2** Edge writes are authorized via the service layer + RLS; contributors cannot forge high-impact edges.

### Accessibility
- Relationship semantics MUST be expressible in plain language for explanations (e.g. "reported by 12 people," "shares a payment wallet with another campaign").

### Performance
- Composite indexes on `edges(type, from_id)` and `edges(type, to_id)` for forward/reverse traversal (§9.7).

### Future Expansion
- Temporal edges (validity intervals), weighted multi-edges with aggregation, `Kit`/`Infrastructure` edge types.

---

## 9.3 Confidence model (nodes & edges, decay)

### Purpose
Define how 0–1 confidence is assigned to every node and edge and how it **decays over time**.

### Background
Per shared context, `Confidence` is a first-class, calibrated 0–1 value. In the graph it expresses *how strongly we believe this node/edge represents reality*. Fraud signals age: a phone number active last week may be dead today; a campaign goes dormant. Decay encodes that, and prevents stale-but-once-strong evidence from dominating.

### Requirements
- **KG-9.3.1 (MUST)** Every node and edge MUST have `confidence ∈ [0,1]`, set at creation from the originating signal (Vol 8 calibrated outputs for model-derived; high fixed values for analyst-confirmed; deterministic-validator passes for rule-derived).
- **KG-9.3.2 (MUST)** Edge confidence MUST reflect its evidence: `extracted_from` from a validator-passed rule is high; an LLM-only entity is capped (Vol 8 §8.3.5); `member_of_campaign` confidence equals the §8.5 link score.
- **KG-9.3.3 (MUST)** Node confidence MUST be **aggregated from supporting edges with damping** (§9.4), never a naive sum that saturates to 1.
- **KG-9.3.4 (MUST)** Confidence MUST **decay over time** toward a floor unless refreshed by new corroborating evidence. A time-decay function MUST be applied at read time or via scheduled recompute:
  ```
  effective_confidence(t) = floor + (stored_confidence - floor) * exp(-λ * age_days)
  ```
  where `λ` (half-life) is per-type configuration (e.g. volatile entities like URLs/phones decay faster than a Threat *type*; an analyst-confirmed edge decays slowly or not at all).
- **KG-9.3.5 (MUST)** New corroborating evidence MUST **refresh** (raise/reset) confidence and `last_seen`, with damping so repeated identical reports give diminishing returns (anti-brigading).
- **KG-9.3.6 (MUST)** Human-confirmed nodes/edges MUST be exempt from (or strongly resistant to) decay and MUST dominate conflicting model-derived confidence.
- **KG-9.3.7 (MUST NOT)** No automated rule may set or propagate a confidence of exactly 1.0; certainty is reserved for human-verified or officially-cited facts, and even those are surfaced with "verify with official sources."
- **KG-9.3.8 (MUST)** Stored vs effective (decayed) confidence MUST both be retrievable for audit/transparency.

### Acceptance Criteria
- **AC-9.3.a** Given an entity confidence 0.8 with a 30-day half-life and floor 0.2, when read 30 days later with no new reports, then effective ≈ 0.5 (0.2 + 0.6·0.5).
- **AC-9.3.b** Given a new corroborating report, when applied, then confidence refreshes and `last_seen` updates, but the increment from the Nth duplicate is smaller than the 1st (damping).
- **AC-9.3.c** Given an analyst-confirmed edge, when aged a year, then its effective confidence stays high (decay-exempt).
- **AC-9.3.d** Given any automated aggregation, when computed, then no resulting confidence equals 1.0.

### Edge Cases
- A long-dormant campaign suddenly re-reported → decayed-then-refreshed; lifecycle may transition dormant→active (§9.5).
- Conflicting evidence raising and lowering confidence in the same window → handled by the conflict model (§9.8), not by averaging blindly.

### Security Considerations
- **SEC-9.3.1** Decay + damping are anti-poisoning controls: an attacker spamming duplicate reports cannot inflate confidence to certainty.

### Accessibility
- Confidence surfaced to users uses the Volume 8 §8.7 words+value mapping; never color alone.

### Performance
- **NFR-9.3.1** Read-time decay MUST be a cheap closed-form computation; for hot paths, a scheduled job MAY materialize `effective_confidence` periodically.

### Future Expansion
- Bayesian/evidential confidence (Dempster–Shafer) for principled fusion; per-source reliability priors; learned decay rates per entity type.

---

## 9.4 Propagation logic (damped)

### Purpose
Define how confidence and labels **propagate across edges** — with **damping** so the graph aggregates evidence without runaway certainty.

### Background
If a campaign is high-confidence and a report is a strong member, the report inherits *some* threat-label support; if many independent reports share a rare entity, that entity's "this is fraud infrastructure" confidence rises. But naive propagation creates feedback loops and false certainty. We use **bounded, damped, source-aware propagation**.

### Requirements
- **KG-9.4.1 (MUST)** Propagation MUST be **damped**: each hop multiplies by a damping factor `γ < 1` (default ~0.6) and each edge by its own confidence; contribution decays with path length and weak edges.
- **KG-9.4.2 (MUST)** Propagation MUST be **bounded**: aggregate confidence is combined via a saturating function (e.g. noisy-OR) so it asymptotically approaches but never reaches 1.0.
- **KG-9.4.3 (MUST)** Propagation MUST respect **independence**: multiple correlated reports from one source/burst count as *less* independent evidence than the same number of independent reports (anti-brigading; ties to §9.3 damping and §8.5 poisoning defenses).
- **KG-9.4.4 (MUST)** Label propagation (e.g. inheriting a Threat type via campaign membership) MUST be **suggestive, not authoritative**: a propagated label is marked `propagated=true`, weighted below a directly-classified label, and never alone drives a public verdict.
- **KG-9.4.5 (MUST)** Propagation MUST be **acyclic in effect**: cycle-safe (visited-set / fixed iteration cap) so loops cannot pump confidence.
- **KG-9.4.6 (MUST NOT)** Propagation MUST NOT override human-confirmed values or push any value to 1.0.

#### Example algorithm (noisy-OR, damped, bounded)
```
# Aggregate "fraud-infrastructure" confidence for an Entity E from N supporting edges:
support = []
for edge e in incoming_support_edges(E):           # e.g. extracted_from strong reports
    c = effective_confidence(e) * effective_confidence(source_node(e))
    c *= gamma ** hop_distance(e)                   # damping by distance
    c *= independence_weight(source(e))             # discount correlated sources
    support.append(min(c, C_MAX_PER_EDGE))          # cap any single edge's pull

# noisy-OR combination -> saturating, never 1.0
p = 1 - PRODUCT(1 - s for s in support)
effective = min(p, C_GLOBAL_CAP)                    # e.g. C_GLOBAL_CAP = 0.97
```
> The global cap (< 1.0) operationalizes "never exaggerate": automated aggregation cannot claim certainty.

### Acceptance Criteria
- **AC-9.4.a** Given 100 independent reports of one rare wallet, when propagated, then the wallet's fraud-infrastructure confidence is high but `< C_GLOBAL_CAP` (never 1.0).
- **AC-9.4.b** Given 100 reports from a single burst/source, when propagated, then independence weighting yields *materially lower* confidence than 100 independent reports.
- **AC-9.4.c** Given a label propagated via campaign membership, when read, then it is flagged `propagated=true` and ranked below directly-classified labels.
- **AC-9.4.d** Given a cyclic subgraph, when propagation runs, then it terminates and does not amplify confidence on each loop.

### Edge Cases
- Highly connected hub entities (a common URL shortener) → independence/rarity weighting (§8.5.2) prevents the hub from propagating strong confidence everywhere.
- A single strong human-confirmed edge vs many weak model edges → human edge dominates (§9.3.6).

### Security Considerations
- **SEC-9.4.1** Damping + independence weighting are the core defenses against graph poisoning / Sybil report floods.

### Accessibility
- Propagated vs direct distinction MUST be explainable in plain language ("inferred from a related campaign" vs "directly matched").

### Performance
- **NFR-9.4.1** Propagation MUST be bounded-depth (default ≤ 3 hops) and run incrementally on write plus periodic batch (cron); full-graph propagation MUST be resumable.

### Future Expansion
- Belief propagation / loopy-BP with formal convergence guarantees; learned damping; GNN-based node scoring as an *advisory* signal (still capped, still human-gated for public claims).

---

## 9.5 Campaign logic

### Purpose
Define how clusters of correlated Reports/Entities become **Campaigns**, the **merge/split** rules, and the campaign **lifecycle**.

### Background
Volume 8 §8.5 *proposes* links; the KG turns durable, sufficiently-corroborated clusters into Campaign nodes and maintains them over time as scams mutate, merge, and die out.

### Requirements
- **KG-9.5.1 (MUST)** A cluster MUST be promoted to a **Campaign** node when it meets promotion criteria: ≥ N corroborating reports (config), a combined link confidence ≥ `θ_campaign`, and (for public visibility) analyst confirmation for high-impact campaigns.
- **KG-9.5.2 (MUST)** Campaign **lifecycle states** MUST be: `candidate` → `active` → `dormant` → `archived`, with allowed transitions:
  - `candidate→active` on promotion criteria met (and confirmation where required),
  - `active→dormant` when no new members within a configurable window (decay-driven),
  - `dormant→active` on new corroborating reports,
  - `active|dormant→archived` on retraction/takedown or supersession (`variant_of` rollup).
- **KG-9.5.3 (MUST)** **Merge** rules: two Campaigns MUST be mergeable when they share dominant rare infrastructure or analyst judgment; merge MUST preserve both lineages (audit), re-point membership edges, and record a `merged_from[]` provenance.
- **KG-9.5.4 (MUST)** **Split** rules: a Campaign that clustering/analyst review determines is two distinct operations MUST be splittable, re-assigning member reports by best-fit and preserving history.
- **KG-9.5.5 (MUST)** Merge/split MUST be **reversible/auditable** (no destructive loss of which reports were where).
- **KG-9.5.6 (MUST)** High-impact campaign claims (public-facing "this is an active campaign impersonating X") MUST require human confirmation (cross-ref §8.5.4, §8.8) before surfacing publicly; model-only campaigns stay `candidate` and internal.
- **KG-9.5.7 (SHOULD)** Campaign `signal_summary` SHOULD record which signals (shared entity / template / temporal / geo) drove formation, for explainability (Vol 8 §8.7).

#### Lifecycle diagram
```
   promotion criteria
   (+confirm if public)        no new members (window)
 candidate ───────────► active ───────────────────────► dormant
     │                    ▲  │                              │
     │ insufficient       │  │ new corroborating reports    │ new reports
     ▼                    │  └──────────────────────────────┘
  (stays candidate)       │
                          └────── merge/split (audited, reversible)
        retraction / takedown / superseded
 any ──────────────────────────────────────────► archived
```

### Acceptance Criteria
- **AC-9.5.a** Given a cluster meeting promotion criteria, when promoted, then a Campaign node is created in `candidate` (or `active` if confirmed) with a `signal_summary`.
- **AC-9.5.b** Given two campaigns sharing a rare wallet, when merged, then membership edges re-point, `merged_from` records both lineages, and the action is reversible.
- **AC-9.5.c** Given an active campaign with no new members past the window, when the scheduled job runs, then it transitions to `dormant`.
- **AC-9.5.d** Given a model-only (unconfirmed) campaign, when the public surface queries, then it is not shown publicly.

### Edge Cases
- Rapidly mutating template (each batch slightly different) → `variant_of` chain + tolerant clustering; avoid fragmenting one operation into dozens of campaigns.
- Two genuinely independent scams that happen to share a cloud host → merge rules require *rare* shared infra; common infra does not justify merge (§8.5 edge cases).
- A campaign targeted by poisoning to force a wrongful merge → analyst gate + reversibility.

### Security Considerations
- **SEC-9.5.1** Public campaign promotion is a defamation/accuracy-sensitive action → human-gated, auditable, reversible.

### Accessibility
- Campaign state and "why grouped" MUST be available as text; any cluster visualization needs a table/list equivalent.

### Performance
- **NFR-9.5.1** Online membership assignment for a new report p95 < 5 s (async); batch re-clustering scheduled and resumable (mirrors §8.5.5/§8.5 NFRs).

### Future Expansion
- Campaign severity/impact scoring; cross-market campaign rollups (FL→US→global); automated `variant_of` lineage visualization.

---

## 9.6 Query patterns the product needs

### Purpose
Enumerate the concrete graph queries the product depends on, so the schema/indexes (§9.7) are designed to serve them efficiently.

### Background
The KG exists to answer user- and analyst-facing questions. These patterns drive indexing and the service-layer API.

### Requirements
- **KG-9.6.1 (MUST)** The KG MUST efficiently answer:
  1. **Entity → related Campaigns** ("this number/URL/wallet — what campaigns is it tied to?").
  2. **Campaign → all Entities/Reports** ("show me everything in this campaign").
  3. **"Who else reported this?"** — count + (privacy-respecting, aggregate) detail of reports sharing an Entity ("reported by 23 people in the last 7 days").
  4. **Entity → Threat types** it's been classified under, with confidence.
  5. **Brand → impersonation campaigns** targeting it.
  6. **Report → its full evidence subgraph** (entities, classifications, campaign, verifications) for the Explanation (Vol 8 §8.7).
  7. **Campaign → recommended Verifications** (official orgs) via threat mapping.
- **KG-9.6.2 (MUST)** Every query result MUST carry the effective (decayed) confidence and provenance so the UI can render calibrated language.
- **KG-9.6.3 (MUST)** "Who else reported this" MUST be **privacy-respecting**: aggregate counts and coarse region/time, never exposing other submitters' identities or precise data.
- **KG-9.6.4 (MUST)** Public queries MUST exclude `candidate`/internal nodes and unconfirmed high-impact edges (§9.5.6); analyst queries see the full graph.
- **KG-9.6.5 (SHOULD)** The service layer SHOULD expose these as named, parameterized queries (not arbitrary client-side graph traversal) for security and performance.

#### Representative query shapes (SQL-ish over §9.7 tables)
```sql
-- (1) Entity -> related Campaigns
SELECT c.* FROM nodes c
JOIN edges m ON m.to_id = c.id AND m.type = 'member_of_campaign'
JOIN edges ef ON ef.to_id = m.from_id AND ef.type = 'extracted_from'   -- report carrying the entity
WHERE ef.from_id = :entity_id AND c.type='campaign' AND c.status='active';

-- (3) Who else reported this entity (privacy-respecting aggregate)
SELECT count(DISTINCT r.id) AS report_count,
       date_trunc('day', (r.attrs->>'submitted_at')::timestamptz) AS day
FROM edges ef JOIN nodes r ON r.id = ef.from_id
WHERE ef.type='extracted_from' AND ef.to_id = :entity_id  -- note: extracted_from is Entity->Report
GROUP BY day ORDER BY day DESC;
```

### Acceptance Criteria
- **AC-9.6.a** Given an Entity id, when querying related campaigns, then only active/confirmed campaigns return, each with effective confidence.
- **AC-9.6.b** Given the "who else reported this" query, when run, then it returns aggregate counts by coarse time/region and **no** submitter identities.
- **AC-9.6.c** Given a public role, when querying, then candidate/internal nodes and unconfirmed `attributed_to` edges are excluded.

### Edge Cases
- Very high-degree entities (a number reported 10k times) → paginated/aggregated responses; no unbounded result sets.
- Orphan entities (extracted but never classified/clustered) → still queryable, return empty campaign sets gracefully.

### Security Considerations
- **SEC-9.6.1** RLS + named queries prevent traversal that would leak PII or internal/candidate intelligence.
- **SEC-9.6.2** Aggregation thresholds (k-anonymity-style minimum counts) MUST gate "who else reported" to avoid de-anonymizing small groups.

### Accessibility
- All query-backed views MUST render as accessible text/tables, confidence in words+value.

### Performance
- **NFR-9.6.1** Patterns (1)–(4) p95 < 200 ms with the §9.7 indexes; (6) full-subgraph p95 < 400 ms (bounded depth).

### Future Expansion
- Saved analyst graph queries; GraphQL-style typed query API; recursive CTE traversals or graph-DB offload if depth grows.

---

## 9.7 Data model SQL sketch

### Purpose
Provide the concrete table/index sketch for the KG, aligned with (and deferring DDL ownership to) **Volume 10 — Database**.

### Background
The launch KG is two core tables plus the embedding/audit tables owned by Volume 10. This is a *sketch for alignment*, not the authoritative DDL.

### Requirements
- **KG-9.7.1 (MUST)** The schema MUST use `nodes` and `edges` tables with typed `attrs` (JSONB), confidence, status, provenance, and timestamps.
- **KG-9.7.2 (MUST)** Indexes MUST support the §9.6 patterns: forward/reverse edge traversal by type, entity canonical-value dedup lookup, and node type filtering.
- **KG-9.7.3 (MUST)** Bidirectional edges (`shares_infrastructure_with`) MUST be stored canonically (ordered endpoints + a uniqueness constraint) per §9.2.3.
- **KG-9.7.4 (MUST)** RLS policies MUST gate visibility by role and status (public vs candidate/internal; PII-restricted projections).

```sql
-- Reference sketch — authoritative DDL lives in Volume 10.
CREATE TABLE nodes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type         text NOT NULL CHECK (type IN
                 ('report','entity','threat','campaign','verification','actor')),
  attrs        jsonb NOT NULL DEFAULT '{}',
  confidence   real  NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 1),
  status       text  NOT NULL DEFAULT 'active'
                 CHECK (status IN ('active','candidate','dormant','archived','redacted')),
  provenance   jsonb NOT NULL DEFAULT '{}',     -- {created_by, model_version, confirmed}
  last_seen    timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE edges (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type         text NOT NULL CHECK (type IN
                 ('reported_in','extracted_from','classified_as','member_of_campaign',
                  'impersonates','shares_infrastructure_with','variant_of',
                  'verified_by','attributed_to')),
  from_id      uuid NOT NULL REFERENCES nodes(id),
  to_id        uuid NOT NULL REFERENCES nodes(id),
  attrs        jsonb NOT NULL DEFAULT '{}',     -- {evidence_span, signals[], rarity_weight, ...}
  confidence   real  NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 1),
  status       text  NOT NULL DEFAULT 'active'
                 CHECK (status IN ('active','candidate','retracted')),
  provenance   jsonb NOT NULL DEFAULT '{}',     -- {created_by, model_version, confirmed}
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Traversal indexes (§9.6)
CREATE INDEX idx_edges_type_from ON edges(type, from_id) WHERE status='active';
CREATE INDEX idx_edges_type_to   ON edges(type, to_id)   WHERE status='active';
CREATE INDEX idx_nodes_type      ON nodes(type)          WHERE status<>'redacted';
-- Entity dedup lookup (§9.8)
CREATE UNIQUE INDEX uq_entity_canonical
  ON nodes ((attrs->>'entity_type'), (attrs->>'canonical_value'))
  WHERE type='entity' AND status<>'redacted';
-- Canonical bidirectional edge uniqueness (§9.2.3): enforce least(from,to)/greatest(from,to)
CREATE UNIQUE INDEX uq_shares_infra
  ON edges (LEAST(from_id,to_id), GREATEST(from_id,to_id))
  WHERE type='shares_infrastructure_with' AND status='active';
```

### Acceptance Criteria
- **AC-9.7.a** Given two inserts of the same canonical entity, when attempted, then the unique index forces a single node (upsert path, §9.8).
- **AC-9.7.b** Given the traversal indexes, when running §9.6 queries, then they use index scans (verified via `EXPLAIN`).
- **AC-9.7.c** Given a public role under RLS, when selecting, then candidate/internal nodes are not returned.

### Edge Cases
- JSONB attr drift across versions → `attrs` validated per type at the service layer; migrations versioned in Volume 10.
- Self-edges (from_id = to_id) → rejected by a CHECK / service validation except where meaningful (none at launch).

### Security Considerations
- **SEC-9.7.1** RLS is mandatory; service-layer is the only writer; least-privilege DB roles.
- **SEC-9.7.2** `redacted` status (not hard delete) preserves audit while hiding content; legally-mandated hard purges handled in §9.8.

### Accessibility
- N/A (schema layer).

### Performance
- **NFR-9.7.1** Partial indexes on `status='active'` keep hot indexes small; periodic archival of `archived` nodes.

### Future Expansion
- Apache AGE (Postgres graph extension) or external graph DB fed from these tables if recursive traversal becomes a bottleneck; partitioning by node type/time at scale.

---

## 9.8 Integrity: dedup, conflict, retraction propagation

### Purpose
Keep the graph correct and trustworthy: deduplicate/canonicalize, handle conflicting evidence, and propagate removals when a report is deleted or a takedown is honored.

### Background
Trust is the moat (principle 8). A graph full of duplicates, contradictions, or undeletable content destroys trust and creates legal risk. This section defines the integrity invariants.

### Requirements
**Dedup & canonicalization**
- **KG-9.8.1 (MUST)** Entities MUST be deduplicated on `(entity_type, canonical_value)` (Vol 8 §8.3 canonicalization); re-extraction upserts into the existing node and appends `raw_aliases`.
- **KG-9.8.2 (MUST)** Verification nodes and Threat nodes MUST be canonical/reused, not duplicated per report.
- **KG-9.8.3 (SHOULD)** Near-duplicate non-exact entities (e.g. same wallet different casing, equivalent URLs) SHOULD be unified by canonicalization before insert.

**Conflicting evidence**
- **KG-9.8.4 (MUST)** Conflicting signals (one report says legit, another says scam; classification disagrees with analyst) MUST be **retained, not overwritten**; the node/edge records competing evidence and the resolved effective confidence reflects the conflict (lower/abstaining), never a silent pick-the-latest.
- **KG-9.8.5 (MUST)** Human-confirmed evidence MUST outrank model evidence in conflict resolution (§9.3.6).
- **KG-9.8.6 (MUST)** Unresolved high-impact conflicts (e.g. defamation-adjacent) MUST route to analyst review and MUST NOT surface a confident public claim while unresolved.

**Removal / retraction propagation**
- **KG-9.8.7 (MUST)** When a Report is deleted (user request / privacy) or a **takedown/appeal is honored** (Vol 8 §8.8.5), the system MUST propagate the effect: mark the Report `redacted`, **recompute** confidences of entities/campaigns that depended on it (decrement support, possibly demote a campaign candidate→archived), and remove the report's contribution from propagation (§9.4).
- **KG-9.8.8 (MUST)** Retraction MUST cascade to **caches and embeddings** (Vol 8 §8.10 cache + pgvector exemplars) so deleted content does not linger in derived data.
- **KG-9.8.9 (MUST)** Legally-mandated **hard purge** MUST be supported (true deletion of raw PII), distinct from soft `redacted` status, while preserving a minimal non-PII audit stub (that *a* removal occurred, for transparency reporting) where lawful.
- **KG-9.8.10 (MUST)** Retraction MUST be **idempotent** and **auditable**: re-running it is safe; an audit record states what was removed, why (reason code), and when.
- **KG-9.8.11 (MUST NOT)** Removal of one report MUST NOT silently erase a still-corroborated campaign; only the removed report's *contribution* is withdrawn, and the campaign is re-evaluated against remaining evidence.

### Acceptance Criteria
- **AC-9.8.a** Given the same wallet reported twice with different casing, when stored, then one canonical Entity exists with both raw aliases.
- **AC-9.8.b** Given conflicting legit/scam reports on one entity, when resolved, then effective confidence drops toward abstain and both evidences remain on record.
- **AC-9.8.c** Given a user deletes their Report, when processed, then the Report is redacted, dependent confidences recompute, and caches/embeddings referencing it are purged within the retention SLA.
- **AC-9.8.d** Given a honored takedown of a campaign claim, when processed, then the campaign is archived/redacted, propagation contribution removed, and an audit stub records the action.
- **AC-9.8.e** Given retraction re-run, when executed twice, then the end state is identical (idempotent).

### Edge Cases
- Deleting a report that was the *sole* support for an entity → entity drops to floor confidence or is archived (no orphaned "fraud" claim).
- A campaign losing one of 500 members → negligible recompute; campaign persists (KG-9.8.11).
- Takedown of a *brand-impersonation* edge where the brand is a victim → handled as content correction, not removal of the legitimate brand node.
- Conflicting takedown vs. ongoing official enforcement citation → analyst/legal review; official-source citations (with attribution) are distinct from our own claims (§8.8 edge case).

### Security Considerations
- **SEC-9.8.1** Retraction is a privacy/legal control; it MUST be tamper-evident and access-controlled (moderator/admin), with audit logs.
- **SEC-9.8.2** Hard-purge must not be abusable to destroy evidence of an active fraud campaign without proper authorization/process; dual-control for hard purges of high-impact nodes.
- **SEC-9.8.3** Conflict retention must itself respect PII rules (competing evidence stored under the same RLS gates).

### Accessibility
- User-facing deletion/takedown status MUST be communicated clearly and non-stigmatizingly (WCAG 2.2 AA).

### Performance
- **NFR-9.8.1** Single-report retraction (recompute + cache/embedding purge) MUST complete within the deletion SLA (async acceptable, but bounded and monitored).
- **NFR-9.8.2** Dedup upsert MUST be O(1) via the unique canonical index (§9.7).

### Future Expansion
- Provenance/lineage graph for full "why does this node exist" audit; automated conflict-resolution policies with formal evidence fusion; GDPR/CCPA deletion receipts surfaced to users.

---

## 9.9 Cross-volume contracts

- **← Volume 8 — AI Intelligence Engine:** entities/classifications/campaign proposals/retraction triggers all originate in Volume 8 and are written through the KG service layer with calibrated confidence; the propagation cap (§9.4) and "no automated 1.0" rule jointly enforce "never exaggerate."
- **→ Volume 10 — Database:** Volume 10 owns the authoritative DDL, migrations, RLS policies, `pgvector` indexes, and the `model_run`/cache tables; §9.7 here is a sketch to align, not duplicate.
- **→ Volume 5/6 — Product/UX:** §9.6 query patterns + effective-confidence-with-provenance feed the user surfaces; the "who else reported this" k-anonymity rule and the exclusion of candidate/internal nodes from public views are binding UX constraints; confidence renders via the Vol 8 §8.7 words+value mapping.
- **→ Moderation/Legal (Vol 8 §8.8 + legal guardrails):** `Actor` pseudonymity, `attributed_to` analyst-gating, defamation-safe public claims, and takedown/appeal → retraction propagation are shared obligations.
- **Shared assumptions made here (flagged for other authors):** (1) a scheduled job runner (cron) + async queue exists for decay/propagation/re-clustering/retraction; (2) Supabase RLS + a single KG service-layer writer enforce authorization; (3) Volume 10 provides `gen_random_uuid()`/pgcrypto, JSONB, and partial-index support; (4) the brand vocabulary and official-org routing table referenced by `Brand`/`Verification` nodes are owned jointly with the content/taxonomy volume.

*End of Volume 9.*
