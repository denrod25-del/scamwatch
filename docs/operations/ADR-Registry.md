# ADR Registry — Architectural Decision Records

This document tracks the foundational architectural decisions made for the Project Sentinel platform.

---

## Decisions Catalog

### ADR-001: Next.js Framework Selection
*   **Status**: `Accepted`
*   **Context**: We need a modern, high-performance web framework with support for server-side rendering (SSR), edge routing, and seamless deployment.
*   **Decision**: Adopt **Next.js (App Router)**.
*   **Consequences**: Unified codebase for client UI and serverless API handlers; optimized edge runtime performance.

---

### ADR-002: Supabase as Backend Service Provider
*   **Status**: `Accepted`
*   **Context**: Building a custom authentication and database hosting solution would slow down time-to-market.
*   **Decision**: Utilize **Supabase Cloud** (PostgreSQL, Auth, Storage, and Edge Functions).
*   **Consequences**: Integrated security with Row-Level Security (RLS); instant PostgREST API routes; private media storage buckets.

---

### ADR-003: OpenAI for LLM Intelligence
*   **Status**: `Accepted`
*   **Context**: Threat extraction and classification require cutting-edge NLP parsing capabilities.
*   **Decision**: Standardize on **OpenAI APIs** (`gpt-4o-mini` and `text-embedding-3-small`).
*   **Consequences**: Calibrated low-cost completions; fast vector calculations; need for robust outage fallbacks.

---

### ADR-004: pgvector for Embedding Storage
*   **Status**: `Accepted`
*   **Context**: RAG-based classification requires matching inbound texts against historical report embeddings.
*   **Decision**: Enable the **`pgvector`** PostgreSQL extension on Supabase.
*   **Consequences**: Embeddings reside alongside transactional data, avoiding external vector DB sync overhead; cosine distance queries run natively in SQL.

---

### ADR-005: Decoupled Evidence Engine
*   **Status**: `Accepted`
*   **Context**: Analysis requires a structured representation of facts extracted from raw inputs.
*   **Decision**: Implement a dedicated **Evidence Engine** using `EvidenceNode` and `EvidenceGraph` modules.
*   **Consequences**: Fully traceable relation links between entity nodes and source reports.

---

### ADR-006: Leaf-Only Reasoning Trees
*   **Status**: `Accepted`
*   **Context**: Generating LLM summaries of verdicts risks prompt leaks and system hallucinations.
*   **Decision**: Implement **Leaf-Only Reasoning Trees** using `ReasoningEngine.ts`.
*   **Consequences**: Explanations are compiled deterministically by formatting leaves of the reasoning tree, ensuring zero prompt leak risks.

---

### ADR-007: Multi-Dimensional Confidence Calibration
*   **Status**: `Accepted`
*   **Context**: Single-score confidence values are easily skewed by model bias or volume variations.
*   **Decision**: Calibrate confidence across 5 axes: model, evidence, community, verification, and reputation.
*   **Consequences**: Calm, non-alarmist overall score; historical drift logging inside `confidence_history`.

---

### ADR-008: Knowledge Graph Score Propagation
*   **Status**: `Accepted`
*   **Context**: Risk scores of linked entities (e.g. phone numbers associated with a scammer) should impact connected report verdicts.
*   **Decision**: Propagate scores using **Noisy-OR probabilistic updates** with exponential time decay.
*   **Consequences**: Automatic reputation adjustments when a linked node is updated.

---

### ADR-009: Stateless Event Bus Interface
*   **Status**: `Accepted`
*   **Context**: Domain modules must communicate events (e.g., `ReportSubmitted`) without circular code imports.
*   **Decision**: Implement a stateless event bus contract (`src/interfaces/events.ts`).
*   **Consequences**: Decoupled handlers; stubbed bindings that can easily switch to RabbitMQ/Redis in Phase 2.

---

### ADR-010: Database-Driven Worker Queue
*   **Status**: `Accepted`
*   **Context**: Asynchronous, long-running processes (e.g., deep graph traversal) should not block HTTP request threads.
*   **Decision**: Implement a database-driven worker queue using Supabase Edge Functions and cron triggers.
*   **Consequences**: Relieves API gateways from execution bottlenecks; retries and dead-letter logs run natively in SQL.
