# ARB Registry — Architecture Review Board Logs

Every major platform architecture change must undergo ARB review before execution.

---

## 1. ARB Review Standards

*   **Review Scope**: Core entity models, API schemas, external vendor bindings (e.g. OpenAI), and security policies.
*   **Assessment Criteria**: Modularity, testability, security, API versioning, and cost overhead.
*   **Approval Gate**: Requires a minimum Architecture Score of **8.0 / 10** to release to staging.

---

## 2. ARB Review Logs

### ARB-001: Decoupled Modules Restructuring (Sprint 1)
*   **ARB ID**: `ARB-001`
*   **Scope**: Domain-Driven Design layout refactor (`src/lib/` $\to$ `src/modules/` and `src/shared/`).
*   **Reviewer**: ChatGPT (Chief Product Architect)
*   **Date**: 2026-06-27
*   **Findings**: High level of modularity achieved. Pre-existing routing boundaries are intact.
*   **Required Changes**: Rename `orchestrator.ts` to `IntelligenceEngine.ts` and capitalize core files to match typescript standards on Windows/Linux.
*   **Approval Status**: `Approved`
*   **Follow-up Sprint**: Sprint 1
*   **Architecture Score**: **9.2 / 10.0**

---

### ARB-002: Knowledge Graph & DB Schema (Sprint 2)
*   **ARB ID**: `ARB-002`
*   **Scope**: Database tables migration, pgvector similarity lookup triggers, and graph scoring.
*   **Reviewer**: ChatGPT (Chief Product Architect)
*   **Date**: 2026-06-27
*   **Findings**: The schema updates (`0011_sie_schema_updates.sql`) provide clean tables with proper foreign key constraints. RLS is enforced correctly.
*   **Required Changes**: Add automated rollback scripts (`0011_sie_schema_updates_rollback.sql`) to ensure deployment recovery capability.
*   **Approval Status**: `Approved`
*   **Follow-up Sprint**: Sprint 2
*   **Architecture Score**: **8.8 / 10.0**
