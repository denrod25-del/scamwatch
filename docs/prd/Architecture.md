# Sentinel Intelligence Engine (SIE) Architecture

This document specifies the technical design, architectural patterns, and execution pipelines of the **Sentinel Intelligence Engine (SIE)** implemented during Sprint 1.

---

## 1. Pipeline Execution Flow

The SIE replaces the linear, string-bound analysis flow with a canonical, staged pipeline. Any unstructured input is wrapped into an `IntelligenceObject` and processed sequentially by registered stages managed by the `IntelligenceOrchestrator`.

```
Raw Input (SMS, Email, Phone, etc.)
  ↓
[Ingestion Stage]  ⟶ Normalize Unicode Form C, scan Cyrillic homoglyphs
  ↓
[Extraction Stage] ⟶ Extract entities, write DB records & evidence nodes
  ↓
[Classify Stage]   ⟶ Generate embedding, perform pgvector lookup, prompt few-shot classifier
  ↓
[Graph Stage]      ⟶ Run campaign detector, compute multi-dimensional confidence vectors
  ↓
[Evaluate Stage]   ⟶ Build reasoning tree, persist notes & log timeline history
```

---

## 2. Ingestion & Canonical Objects

Unstructured payloads are encapsulated into the `IntelligenceObject` wrapper to prevent business logic from binding directly to string types.
*   **Supported Input Types**: `SMS`, `Email`, `URL`, `Domain`, `Phone`, `Organization`, `FreeText`.
*   **Auto-Detection**: The static factory method `IntelligenceObject.create(value)` automatically runs regex character heuristics to resolve the object type.

---

## 3. Evidence & Reasoning Graphs

Rather than outputting raw LLM outputs, the SIE builds structured reasoning trees and evidence relation webs.
*   **Evidence Node (`evidence_nodes`)**: Persists deterministic matches or similarity vectors linked to specific report and entity IDs.
*   **Reasoning Node (`reasoning_nodes`)**: Represents nodes of a reasoning tree (types, weights, child list). User-facing explanations are compiled strictly from these nodes, ensuring no hidden internal prompt instructions are leaked.

---

## 4. Multi-Dimensional Confidence Scorer

The engine replaces the single confidence float with a multi-dimensional confidence vector:
*   **`evidence`**: Density score based on indicator volume.
*   **`model`**: Base probability returned by the threat classifier.
*   **`community`**: Density score based on historical reports volume.
*   **`historical`**: Default reputation score of the entity.
*   **`verification`**: Score indicating official validation status (1.0 or 0.0).
*   **`overall`**: Weighted aggregate formula:
    $$\text{Overall} = 0.30 \cdot \text{model} + 0.30 \cdot \text{evidence} + 0.20 \cdot \text{community} + 0.10 \cdot \text{historical} + 0.10 \cdot \text{verification}$$

Every execution logs a confidence vector in `confidence_history` to allow tracking and plotting of confidence drift over time.

---

## 5. Investigation Workspace & Timeline

*   **Timeline Events (`timeline_events`)**: Chronological event tracking table recording events like `Report Submitted`, `Classification Updated`, `Campaign Linked`, `Confidence Increased`, `Evidence Added`, and `Archived`.
*   **Investigation Cases (`investigations`)**:
    *   `createInvestigation()`: Spawns active cases linking report and entity IDs.
    *   `mergeInvestigation()`: Merges notes, entities, and report links from a source case into a target case, archiving the source.
    *   `archiveInvestigation()`: Marks a case status as archived.

---

## 6. API Catalog

The SIE exposes Next.js versioned API routes under `/api/v1/`:
1.  **`GET /api/v1/investigations`**: Returns active and archived investigations list.
2.  **`GET /api/v1/timeline?subject_type=...&subject_id=...`**: Queries chronological events.
3.  **`GET /api/v1/entities/:id`**: Returns entity canonical details, report links, linked campaigns, and timeline.
4.  **`GET /api/v1/graph`**: Returns JSON nodes, edges, and similarity weights for visual mapping.
5.  **`POST /api/v1/evidence`**: Ingests custom evidence nodes.

---

## 7. Database Updates

New tables added in `0011_sie_schema_updates.sql`:
*   `investigations`
*   `investigation_reports` (join table)
*   `investigation_entities` (join table)
*   `investigation_notes`
*   `timeline_events`
*   `confidence_history`
*   `evidence_nodes`
*   `reasoning_nodes`
*   `graph_edges`
*   `graph_snapshots`
