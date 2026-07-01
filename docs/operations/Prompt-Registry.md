# Prompt Registry — Production Prompt Library

Every AI model prompt executed in production must be versioned, documented, and have fallback configurations.

---

## Prompts Directory

### 1. Entity Extraction System Prompt
*   **Prompt ID**: `PRM-EXT-001`
*   **Version**: `1.0.2`
*   **Purpose**: Extracts structured entities (phones, emails, domains, organizations, quantities) from raw inputs.
*   **Model**: `gpt-4o-mini`
*   **Variables**:
    *   `{{text}}`: Raw inbound scam report content.
*   **Expected Output Format**:
    ```json
    {
      "entities": [
        { "type": "phone | email | url | organization", "value": "string", "confidence": 0.95 }
      ]
    }
    ```
*   **Fallback Behavior**: Falls back immediately to deterministic regex patterns defined in `src/shared/entities/extractEntities.ts`.
*   **Related PRD**: [prd-301-2-entity-extraction.md](../prd/prd-301-2-entity-extraction.md)
*   **Owner**: Antigravity
*   **Approval Status**: `Approved`

---

### 2. RAG Threat Classification Prompt
*   **Prompt ID**: `PRM-CLS-001`
*   **Version**: `1.1.0`
*   **Purpose**: Classifies threats against product taxonomies using few-shot exemplar contexts.
*   **Model**: `gpt-4o-mini`
*   **Variables**:
    *   `{{text}}`: Inbound report content.
    *   `{{exemplars}}`: Embeddings matched top 5 historical reports.
*   **Expected Output Format**:
    ```json
    {
      "verdict": "Likely Safe | No Signal | Use Caution | Likely Scam",
      "threats": [
        { "category": "phishing", "confidence": 0.85 }
      ]
    }
    ```
*   **Fallback Behavior**: If the LLM call times out or returns malformed JSON, stubs verdict as `No Signal` and marks `abstained: true` to prevent false positives.
*   **Related PRD**: [prd-301-3-threat-classification.md](../prd/prd-301-3-threat-classification.md)
*   **Owner**: Antigravity
*   **Approval Status**: `Approved`
