# Incident Management — Engineering Operations

This document defines Project Sentinel severity levels, escalation protocols, and recovery runbooks.

---

## 1. Severity Levels & SLA Targets

| Severity | Definition | Target Resolution SLA | Escalation Protocol |
| :--- | :--- | :--- | :--- |
| **SEV-1 (Critical)** | Core API gateway outage; database connection failure; security breach. | < 2 Hours | Alert CTO immediately via PagerDuty. |
| **SEV-2 (Major)** | OpenAI API timeouts; vector similarity search degraded; 10%+ latency increase. | < 8 Hours | Alert engineering team during business hours. |
| **SEV-3 (Minor)** | Minor UI styling bugs; dashboard reporting drift; documentation typos. | < 5 Days | Add to standard backlog sprint planning. |

---

## 2. Runbook: OpenAI API Outage Recovery
*   **Incident Trigger**: Automated edge checkers detect OpenAI API completions latency > 5000ms or HTTP 5xx error responses.
*   **Recovery Actions**:
    1.  Confirm OpenAI status on `status.openai.com`.
    2.  Set `EDGE_API_FALLBACK_ACTIVE = true` in Vercel environment variables to bypass LLM calls.
    3.  Confirm that pipeline calculations fall back to local regex extraction and stubs.
    4.  Verify that API endpoints return `200 OK` with disclaimers and default verdicts.
    5.  Revert environment flag once OpenAI service uptime is restored.

---

## 3. Runbook: Supabase DB Network Disruption
*   **Incident Trigger**: Edge Functions fail to query connection pool.
*   **Recovery Actions**:
    1.  Set `DB_QUEUE_LOCAL_MODE = true` in environment variables.
    2.  This enables the edge router to execute pipelines in memory, return live results, and write payload logs to a local memory buffer.
    3.  Execute database restore from daily backup snapshot if DB corruption occurred.
    4.  Flush in-memory queues back to Supabase tables upon recovery.

---

## 4. Seeded Postmortem Case: INC-2026-001

*   **Incident ID**: `INC-2026-001`
*   **Severity**: `SEV-2 (Major)`
*   **Incident Owner**: Antigravity
*   **Date & Timeline**:
    *   *Detection (2026-06-27T14:10:00Z)*: Automated system status check fails. Latency on OpenAI `/chat/completions` API rises to 12,000ms.
    *   *Triage (2026-06-27T14:15:00Z)*: System logs confirm HTTP 503 Service Unavailable responses from OpenAI gateways.
    *   *Mitigation (2026-06-27T14:17:00Z)*: Fallback flag `EDGE_API_FALLBACK_ACTIVE` enabled in Vercel console. Decoupled engine redirects entity extraction requests to deterministic regex-based local logic.
    *   *Resolution (2026-06-27T15:05:00Z)*: OpenAI service restored. Fallback flag disabled and systems returned to baseline completions flow.
*   **Root Cause Analysis (RCA)**: The primary OpenAI US-East API endpoint suffered high traffic congestion leading to request queuing timeouts.
*   **Action Items**:
    *   `[x]` Implement automatic request timeout threshold inside `http_client` (Sprint 2 - Completed).
    *   `[ ]` Configure regional multi-endpoint load balancing between OpenAI US-East and EU-West endpoints (Sprint 4 planning).

