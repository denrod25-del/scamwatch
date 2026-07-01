# Service Catalog — Backend Core Modules

This catalog documents the backend core domain services powering the Sentinel Intelligence Engine.

---

## 1. Core Services Catalog

### A. Evidence Engine
*   **Purpose**: Extracts and structures facts from inbound content.
*   **Inputs**: `reportId`, `entityId`, extracted values.
*   **Outputs**: `EvidenceNode` JSON.
*   **Dependencies**: Supabase Database.
*   **Interfaces**: [`IEvidenceEngine`](../src/interfaces/IEvidenceEngine.ts)
*   **Events**: Emits `EvidenceAdded`.
*   **Database Tables**: `evidence_nodes`.
*   **Failure Modes**: Supabase downtime; recovery fallback queues write events to memory.
*   **Owner**: Antigravity
*   **Related ADRs**: [ADR-005](./ADR-Registry.md#adr-005-evidence-engine)
*   **Related PRDs**: [prd-301-1-input-processing.md](../prd/prd-301-1-input-processing.md)

---

### B. Reasoning Engine
*   **Purpose**: Compiles a leaf-only reasoning tree to generate safe explanations.
*   **Inputs**: Verdict, overall confidence, evidence nodes array.
*   **Outputs**: `ReasoningNode` tree, `ExplanationPayload`.
*   **Dependencies**: None (pure functional mapping).
*   **Interfaces**: [`IReasoningEngine`](../src/interfaces/IReasoningEngine.ts)
*   **Events**: Emits `ReasoningTreeBuilt`.
*   **Database Tables**: `reasoning_nodes`.
*   **Failure Modes**: Parsing failure; falls back to default disclaimer explanations.
*   **Owner**: Antigravity
*   **Related ADRs**: [ADR-006](./ADR-Registry.md#adr-006-reasoning-engine)
*   **Related PRDs**: [prd-301-8-explainability-engine.md](../prd/prd-301-8-explainability-engine.md)

---

### C. Confidence Engine
*   **Purpose**: Calibrates overall confidence score based on multi-dimensional vectors.
*   **Inputs**: Model confidence, entity count, report count, verification status.
*   **Outputs**: `ConfidenceVector` (overall, model, evidence, community, verification, reputation).
*   **Dependencies**: Supabase Database.
*   **Interfaces**: [`IConfidenceEngine`](../src/interfaces/IConfidenceEngine.ts)
*   **Events**: Emits `ConfidenceRecalibrated`.
*   **Database Tables**: `confidence_history`.
*   **Failure Modes**: DB write failure; logging is skipped, returning calibrated vector to memory.
*   **Owner**: Antigravity
*   **Related ADRs**: [ADR-007](./ADR-Registry.md#adr-007-confidence-engine)
*   **Related PRDs**: [prd-301-4-confidence-scoring.md](../prd/prd-301-4-confidence-scoring.md)

---

### D. Campaign Engine
*   **Purpose**: Clusters reports and entities based on similarity to identify campaigns.
*   **Inputs**: `reportId`, entities array.
*   **Outputs**: Linked `campaignId` or `null`.
*   **Dependencies**: Supabase Database, pgvector similarity lookup.
*   **Interfaces**: [`ICampaignEngine`](../src/interfaces/ICampaignEngine.ts)
*   **Events**: Emits `CampaignLinked`.
*   **Database Tables**: `campaigns`, `campaign_entities`.
*   **Failure Modes**: Vector DB query timeout; falls back to exact text match on entities.
*   **Owner**: Antigravity
*   **Related ADRs**: [ADR-008](./ADR-Registry.md#adr-008-knowledge-graph)
*   **Related PRDs**: [prd-301-6-campaign-detection.md](../prd/prd-301-6-campaign-detection.md)

---

### E. Knowledge Graph Engine
*   **Purpose**: Computes entity reputations and propagates risk using Noisy-OR.
*   **Inputs**: Entity details, linked reports scores.
*   **Outputs**: Propagated risk score (0.0 to 1.0).
*   **Dependencies**: Supabase Database.
*   **Interfaces**: [`IKnowledgeGraph`](../src/interfaces/IKnowledgeGraph.ts)
*   **Events**: Emits `EntityRiskUpdated`.
*   **Database Tables**: `entities`, `graph_edges`.
*   **Failure Modes**: Cycle loops in graph; mitigated by bounding traversal depth to 3 levels.
*   **Owner**: Antigravity
*   **Related ADRs**: [ADR-008](./ADR-Registry.md#adr-008-knowledge-graph)
*   **Related PRDs**: [prd-301-5-knowledge-graph-integration.md](../prd/prd-301-5-knowledge-graph-integration.md)

---

### F. Investigation Engine
*   **Purpose**: Manages forensic workspaces, notes, and case links.
*   **Inputs**: Case identifiers, titles, notes content.
*   **Outputs**: Case status updates, timeline audit logs.
*   **Dependencies**: Supabase Database.
*   **Interfaces**: Custom methods in `src/modules/investigations/index.ts`.
*   **Events**: Emits `InvestigationCreated`, `InvestigationMerged`, `InvestigationArchived`.
*   **Database Tables**: `investigations`, `investigation_reports`, `investigation_entities`, `investigation_notes`.
*   **Failure Modes**: Access denied; RLS policies throw error responses.
*   **Owner**: Antigravity
*   **Related ADRs**: [ADR-002](./ADR-Registry.md#adr-002-supabase-as-backend-service-provider)
*   **Related PRDs**: [vol-10-database.md](../prd/vol-10-database.md)
