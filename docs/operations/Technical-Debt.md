# Technical Debt Registry — Project Sentinel

Every engineering trade-off or temporary shortcut must be documented and tracked as a work item.

---

## 1. Technical Debt Log

| Debt ID | Area | Severity | Effort | Description | Owner | Sprint | Resolution Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **DEB-01** | Event Bus | Low | Medium | Stateless event bus uses in-memory callbacks instead of external message brokers. | Antigravity | Sprint 3 | Bind to a true redis pub/sub broker in Phase 2 scaling. |
| **DEB-02** | Worker Queue | Medium | High | Database polling via cron triggers is used rather than event-driven serverless executions. | Antigravity | Sprint 3 | Migrate to AWS SQS / Supabase edge-queue triggers in Phase 2. |
| **DEB-03** | RAG Search Cache | Low | Low | Report matching queries pgvector similarity directly without cache layers. | Antigravity | Sprint 3 | Add Redis/Memcached cache layer for repeated search checks. |
| **DEB-04** | Image OCR | Medium | Medium | Image uploads do not trigger automated OCR parsing (OCR triggers are stubbed). | Antigravity | Sprint 3 | Integrate Tesseract OCR edge functions in Sprint 4. |

---

## 2. Refactoring Policy

*   **Debt Allocation**: Every active sprint allocates up to **10% of velocity** to resolving technical debt.
*   **Approval**: Technical debt items rated "High Severity" must have an approved RFC before being resolved.
