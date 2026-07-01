# PRD-301.9 — API Contract Specification

**Program Codename:** Project Sentinel · **Module:** API Specification (§11.1 - §11.6, §11.7, §11.8) · **Status:** Implementation-Ready Spec
**Discipline:** Backend Engineering, API Design, Security, QA · **Requirement ID Prefix:** `AP-301.9`

---

## Abstract
This document specifies the technical HTTP API contracts, payload schemas, error definitions, and rate-limiting boundaries for the two primary endpoints of the ScamWatch platform: **Search Check** (`POST /v1/search/check`) and **Report Ingestion** (`POST /v1/reports`). It details payload JSON schemas, required header structures (including bearer auth and idempotency keys), standard error codes, and sliding-window rate limit buckets.

---

## Table of Contents
1. [Purpose](#1-purpose)
2. [Background](#2-background)
3. [POST /v1/search/check (Real-Time Check)](#3-post-v1searchcheck-real-time-check)
4. [POST /v1/reports (Report Submission)](#4-post-v1reports-report-submission)
5. [Idempotency & Mutating Calls](#5-idempotency--mutating-calls)
6. [Rate Limiting & Quotas](#6-rate-limiting--quotas)
7. [Error Model & Codes](#7-error-model--codes)
8. [Requirements](#8-requirements)
9. [Acceptance Criteria](#9-acceptance-criteria)
10. [Edge Cases & Versioning](#10-edge-cases--versioning)
11. [Security Considerations](#11-security-considerations)
12. [Accessibility Contract](#12-accessibility-contract)
13. [Performance Budgets](#13-performance-budgets)
14. [Future Expansion](#13-future-expansion)

---

## 1. Purpose
This specification governs the communication boundaries between client frontends (Next.js web app, browser extensions) and the backend Edge Functions. A stable, versioned API contract ensures that changes to model pipelines or graph engines do not break consumer-facing applications.

---

## 2. Background
The ScamWatch API operates as a stateless JSON-over-HTTPS REST service (Volume 11). To protect user privacy and optimize server performance:
- Read-only real-time checks (`POST /v1/search/check`) do not write to the persistent report database and are edge-cached where possible.
- Ingestion mutating requests (`POST /v1/reports`) write directly to the database queues and require an idempotency key to prevent double-billing and duplicate reports.

---

## 3. POST /v1/search/check (Real-Time Check)

Executes a real-time scam analysis on text or metadata without creating a public report.

- **URL**: `/v1/search/check`
- **Method**: `POST`
- **Auth Scope**: `search:check` (Anonymous users allowed by default)
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <supabase_jwt>` (Optional)

### 3.1. Request Payload Schema
```json
{
  "type": "object",
  "properties": {
    "text": { "type": "string", "maxLength": 51200 },
    "type": { "type": "string", "enum": ["text", "email", "metadata"] },
    "submitter_context": {
      "type": "object",
      "properties": {
        "did_lose_money": { "type": "boolean" },
        "did_share_pii": { "type": "boolean" }
      },
      "required": ["did_lose_money", "did_share_pii"]
    }
  },
  "required": ["text", "type", "submitter_context"]
}
```

### 3.2. Response Payload (200 OK)
```json
{
  "data": {
    "verdict": "Likely Scam",
    "confidence_band": "High",
    "entities": [
      {
        "id": "f34e1b32-e29f-48c3-8684-9a9a7f22db0b",
        "type": "url",
        "canonical_value": "https://paypa1.com/login",
        "raw_value": "paypa1.com"
      }
    ],
    "explanation": {
      "text": "This message is classified as a Likely Scam (High Confidence). It contains a lookalike link (paypa1.com) impersonating PayPal.",
      "citations": [
        { "entity_id": "url_1", "raw_value": "paypa1.com", "resolved_label": "Lookalike Domain" }
      ]
    },
    "recommendations": {
      "understand": [
        { "threat_id": "phish_smish", "title": "SMS Phishing (Smishing)", "confidence": 0.91 }
      ],
      "verify": [
        { "org": "FTC", "action": "Report fraud to the FTC", "url": "https://reportfraud.ftc.gov" }
      ],
      "protect": [
        { "step": "Call the fraud department on the back of your card", "urgency": "high" }
      ]
    }
  }
}
```

---

## 4. POST /v1/reports (Report Submission)

Ingests a verified scam encounter into the persistent database and queues it for graph integration.

- **URL**: `/v1/reports`
- **Method**: `POST`
- **Auth Scope**: `reports:write` (Anonymous allowed)
- **Headers**:
  - `Content-Type: application/json`
  - `Idempotency-Key`: `<UUID>` (Required)

### 4.1. Request Payload Schema
```json
{
  "type": "object",
  "properties": {
    "text": { "type": "string", "maxLength": 51200 },
    "channel": { "type": "string", "enum": ["sms", "email", "web", "phone"] },
    "image_storage_path": { "type": "string" },
    "submitter_context": {
      "type": "object",
      "properties": {
        "did_lose_money": { "type": "boolean" },
        "did_share_pii": { "type": "boolean" }
      },
      "required": ["did_lose_money", "did_share_pii"]
    }
  },
  "required": ["channel", "submitter_context"]
}
```

### 4.2. Response Payload (211 Ingest Queued / 201 Created)
```json
{
  "data": {
    "report_id": "93c9f360-91e6-48ca-bda3-a836cde1e699",
    "status": "queued",
    "created_at": "2026-06-27T03:17:34Z"
  }
}
```

---

## 5. Idempotency & Mutating Calls
All mutating requests to `/v1/reports` MUST supply a standard UUID v4 `Idempotency-Key` header:
- **First Request**: The server processes the report, caches the response payload in Redis (or PostgreSQL metadata), and returns the `201 Created` status.
- **Subsequent Request (Same Key)**: The server skips pipeline execution and immediately returns the cached response, preventing duplicate records and redundant API costs. Cache lifetime for idempotency keys is `24 hours`.

---

## 6. Rate Limiting & Quotas
The API gateway enforces sliding-window limits (Volume 11 §4) tracked via Redis:

| Route | Anonymous Limit | Authenticated (Member) Limit | Keyed By |
| :--- | :--- | :--- | :--- |
| `POST /search/check` | 60 requests / minute | 120 requests / minute | Client IP + User ID |
| `POST /reports` | 5 submissions / day | 50 submissions / day | IP + Fingerprint + UID |

---

## 7. Error Model & Codes
All failure paths MUST return a standard JSON envelope with appropriate HTTP status codes:

```json
{
  "error": {
    "code": "rate_limited",
    "message": "Too many requests. Please slow down.",
    "details": {
      "retry_after_seconds": 42
    }
  }
}
```

- **Standard Code Catalog**:
  - `unauthenticated` (401): Missing or expired token.
  - `scope_required` (403): Token verified but lacks the required permission scope.
  - `validation_failed` (422): JSON schema check failed (e.g. text too long).
  - `idempotency_conflict` (409): The idempotency key is already in use with different payload parameters.
  - `rate_limited` (429): Request quota exceeded.

---

## 8. Requirements

### 8.1. Functional Requirements
- **AP-301.9.1 (MUST)**: All mutating endpoints (e.g., `/reports`) MUST enforce HTTPS and reject unencrypted HTTP calls.
- **AP-301.9.2 (MUST)**: The system MUST reject any `POST /v1/reports` submission missing a valid UUID `Idempotency-Key` header, returning a `400 Bad Request`.
- **AP-301.9.3 (MUST)**: If a check request payload violates the schema constraints (e.g. text payload $> 50$ KB), the server MUST return `422 Unprocessable Entity` without invoking the model pipeline.

### 8.2. Non-Functional Requirements
- **AP-301.9.4 (MUST)**: Error payloads MUST NOT expose internal stack traces, DB connection strings, or model parameters, protecting the system from security leaks.
- **AP-301.9.5 (MUST)**: The gateway rate-limit check MUST execute in under `15ms` p95.

---

## 9. Acceptance Criteria

- **AC-301.9.a**: Given a valid `POST /search/check` call, when executed anonymously, then the system MUST return `200 OK` with the complete structured explanation and recommendations within the latency budget.
- **AC-301.9.b**: Given two identical `POST /reports` calls with the same `Idempotency-Key` header, when executed in sequence, then the second call MUST return the cached `report_id` and skip pipeline re-execution.
- **AC-301.9.c**: Given an anonymous client exceeds 60 check calls within a minute, when the 61st call is made, then the gateway MUST return `429 Too Many Requests` with a `Retry-After` header.
- **AC-301.9.d**: Given a request with an expired JWT, when sent to a protected endpoint, then the server MUST return `401 Unauthorized` containing the `token_expired` error code.

---

## 10. Edge Cases & Versioning

### 10.1. API Versioning
All API changes MUST be version-prefixed (e.g., `/v1`). Additive fields (new keys in JSON responses) are permitted in a minor version update, but structural deletions (removing a field) require migrating endpoints to `/v2`.

### 10.2. Network Interruption During Ingestion
- **Edge Case**: A client sends a report, the server completes the write transaction, but the network drops before returning the response.
- **Handling**: When the client retries with the same `Idempotency-Key`, the server immediately returns the cached `report_id` instead of writing a new row.

---

## 11. Security Considerations
- **SEC-301.9.1**: JWT validation MUST be local (validating signatures against cached JWK keysets) to protect the API from latency exploitation during denial of service (DoS) attacks.
- **SEC-301.9.2**: Content-Type header checks are strict. Request payloads containing XML, form-multipart payloads (except on image upload handlers), or plain text MUST be blocked with `415 Unsupported Media Type`.

---

## 12. Accessibility Contract
- **A11Y-301.9.1**: API responses that drive visual feedback (e.g. validation error messages) MUST use plain English text, providing clear instructions that can be announced by screen readers.

---

## 13. Performance Budgets
- **Gateway Authentication Check**: `p50 < 3ms`, `p95 < 15ms`.
- **Idempotency Resolution (Redis lookup)**: `p50 < 5ms`, `p95 < 20ms`.
- **Search check response p95**: `< 3.0s` (limited by LLM processing).
- **Report queue response p95**: `< 150ms` (async queuing).

---

## 14. Future Expansion
1. **Bulk Partner API**: Future updates will introduce `/v1/reports/bulk` with specialized scopes, allowing law enforcement or financial institutions to ingest batches of scam indicators securely.
2. **GraphQL Endpoint**: Establish a GraphQL interface alongside REST to let frontend applications fetch specific nodes or edges without over-fetching nested JSON objects.
