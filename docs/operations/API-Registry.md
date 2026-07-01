# API Registry — REST Endpoints

This document catalogs the REST API endpoints exposed by the Sentinel Intelligence Engine.

---

## 1. Gateway Security Requirements

*   **API Versioning**: Enforced via headers (`X-API-Version: v1`).
*   **Authentication**: Admin and moderator operations require a valid Supabase JWT Bearer token in the `Authorization` header. Public lookup operations are open but rate-limited.
*   **Rate Limiting**: Public lookups limited to **10 queries per minute** per IP address.

---

## 2. API Endpoint Dictionary

### A. POST /api/v1/search/check
*   **Method**: `POST`
*   **Route**: `/api/v1/search/check`
*   **Authentication**: None (Public rate-limited)
*   **Request Schema**:
    ```json
    {
      "text": "string (min 10, max 5000 characters)",
      "metadata": "object (optional)"
    }
    ```
*   **Response Schema (200 OK)**:
    ```json
    {
      "data": {
        "verdict": "Likely Safe | No Signal | Use Caution | Likely Scam",
        "confidence": {
          "evidence": 0.95,
          "model": 0.85,
          "community": 0.90,
          "historical": 0.50,
          "verification": 1.00,
          "overall": 0.88
        },
        "explanation": {
          "summary": "string",
          "reasons": ["string"]
        },
        "recommendations": {
          "understand": ["string"],
          "verify": [{ "org": "string", "action": "string", "url": "string" }],
          "protect": [{ "step": "string", "urgency": "low | medium | high" }]
        }
      }
    }
    ```
*   **Error Codes**:
    *   `422 validation_failed`: Input text is too short or is missing.
    *   `429 rate_limit_exceeded`: Rate limit threshold exceeded.
*   **Performance Target**: SLA latency < 600ms (p95).

---

### B. GET /api/v1/entities/:id/graph
*   **Method**: `GET`
*   **Route**: `/api/v1/entities/[id]/graph`
*   **Authentication**: Authenticated (Staff role required)
*   **Response Schema (200 OK)**:
    ```json
    {
      "data": {
        "nodes": [
          { "id": "string", "label": "string", "type": "string" }
        ],
        "edges": [
          { "source": "string", "target": "string", "type": "string", "weight": 0.85 }
        ]
      }
    }
    ```
*   **Error Codes**:
    *   `401 unauthorized`: Invalid token or role permissions.
    *   `422 validation_failed`: Missing or invalid Entity ID parameter.

---

### C. GET /api/v1/graph
*   **Method**: `GET`
*   **Route**: `/api/v1/graph`
*   **Authentication**: Authenticated (Staff role required)
*   **Response Schema (200 OK)**:
    ```json
    {
      "data": {
        "nodes": [
          { "id": "string", "label": "string", "type": "string" }
        ],
        "edges": [
          { "source": "string", "target": "string", "type": "string", "weight": 0.5 }
        ]
      }
    }
    ```
*   **Performance Target**: SLA latency < 350ms (p95).
