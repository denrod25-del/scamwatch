# Engineering Risk Register — Project Sentinel

This register tracks operational and technical risks, rating their severity, and documenting mitigations.

---

## 1. Risk Matrix

*   **Severity**: Computed as $\text{Severity} = \text{Probability} \times \text{Impact}$ (on a 1-5 scale).

| Risk ID | Description | Probability | Impact | Severity | Owner | Mitigation | Linked ADR | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **RSK-01** | **OpenAI API Outage** | 3 | 4 | **12 (High)** | Antigravity | Intercept via catch blocks; fallback to regex-based extraction. | [ADR-003](./ADR-Registry.md#adr-003-openai-for-llm-intelligence) | **Mitigated** |
| **RSK-02** | **Supabase DB Outage** | 2 | 5 | **10 (Medium)** | Antigravity | Edge pipeline runs in memory and queues write events. | [ADR-002](./ADR-Registry.md#adr-002-supabase-as-backend-service-provider) | **Mitigated** |
| **RSK-03** | **Prompt Injection** | 3 | 4 | **12 (High)** | Antigravity | Verbatim check verifies LLM outputs against raw source text. | [ADR-006](./ADR-Registry.md#adr-006-leaf-only-reasoning-trees) | **Mitigated** |
| **RSK-04** | **PII Leakage** | 2 | 5 | **10 (Medium)** | Antigravity | EXIF data is stripped from media; de-identification active. | [ADR-002](./ADR-Registry.md#adr-002-supabase-as-backend-service-provider) | **Mitigated** |
| **RSK-05** | **Graph Poisoning** | 2 | 4 | **8 (Medium)** | Antigravity | Gate write/edit accesses to staff roles (moderator, analyst). | [ADR-008](./ADR-Registry.md#adr-008-knowledge-graph) | **Mitigated** |
| **RSK-06** | **Model Drift** | 3 | 3 | **9 (Medium)** | Antigravity | Calibrated score history logged to `confidence_history`. | [ADR-007](./ADR-Registry.md#adr-007-multi-dimensional-confidence-calibration) | **Mitigated** |

---

## 2. Risk Mitigation Protocols

*   **Prompt Injection Safeguards**: The entity extraction pipeline performs a verbatim substring match. If the AI extracts a value (e.g. phone number) that does not exist in the source input text, the extracted value is flagged and discarded as a hallucination.
*   **Access Control**: Supabase RLS policies block anonymous insert/update calls on campaign, investigation, and notes structures. Only users authenticated with staff roles can modify these.
