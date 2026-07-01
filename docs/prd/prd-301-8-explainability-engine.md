# PRD-301.8 — Explainability Engine Specification

**Program Codename:** Project Sentinel · **Module:** AI Intelligence Engine (§8.7) · **Status:** Implementation-Ready Spec
**Discipline:** AI/ML, Backend Engineering, UX Design, QA · **Requirement ID Prefix:** `XE-301.8`

---

## Abstract
This document specifies the technical design, citation schemas, generation rules, and localization contracts for the **Explainability Engine** of ScamWatch. The engine transforms raw model scores and extracted relationship edges into human-readable, trauma-aware explanations. It specifies evidence-grounding constraints, citation mappings, and fallbacks for degraded execution states (such as low-legibility OCR or rules-only fallbacks).

---

## Table of Contents
1. [Purpose](#1-purpose)
2. [Background](#2-background)
3. [Structured Explanation Pipeline](#3-structured-explanation-pipeline)
4. [Source Citation Mapping Schema](#4-source-citation-mapping-schema)
5. [Degraded & Abstention Explanations](#5-degraded--abstention-explanations)
6. [Copy Tone & Writing Guardrails](#6-copy-tone--writing-guardrails)
7. [Requirements](#7-requirements)
8. [Acceptance Criteria](#8-acceptance-criteria)
9. [Edge Cases & Alignment Rules](#9-edge-cases--alignment-rules)
10. [Security Considerations](#10-security-considerations)
11. [Accessibility Contract](#11-accessibility-contract)
12. [Performance & Latency Budgets](#12-performance--latency-budgets)
13. [Future Expansion](#13-future-expansion)

---

## 1. Purpose
The Explainability Engine demystifies the platform's warning verdicts. By providing clear, structured breakdowns of *why* a submission is flagged, the system builds trust, decreases user anxiety, and educates consumers on how to spot similar threat tactics.

---

## 2. Background
Scam warning apps often present users with a binary verdict (e.g. "Danger") without explaining why. This lack of transparency causes confusion, increases false-positive fatigue, and violates the core product principle: **"Explain before warning."** 

Conversely, generating free-text explanations using an unconstrained LLM can lead to hallucinations, where the model invents suspicious indicators that do not exist in the source report. This specification details a **hybrid explanation generator** that constructs explanations by binding structured database entities and classifications to pre-vetted copy templates.

---

## 3. Structured Explanation Pipeline

The engine generates explanations through a template-binding pipeline, bypassing free-form text generation to ensure complete grounding:

```
[Classification + Extracted Entities + Campaign Links]
                          │
                          ▼
             ┌─────────────────────────┐
             │  EXPLAINABILITY ENGINE  │
             ├─────────────────────────┤
             │ 1. Fetch Schema Facts   │
             │ 2. Match copy templates  │
             │ 3. Bind Entity Spans    │
             └────────────┬────────────┘
                          │
                          ▼
            [Source-Linked Explanation]
```

### Explanation Assembly Rules
1. **Fact Retrieval**: Gather the report's active threat labels, entity records, and campaign connections.
2. **Template Binding**: Select the copy template corresponding to the primary threat category.
3. **Evidence Interpolation**: Bind specific entity details (e.g. `raw_value`, `canonical_value`, `evidence_span`) directly into the template.
4. **Citation Insertion**: Append unique citation tags (e.g. `[Entity:url_1]`) so the UI can link claims directly to highlighted source text segments.

---

## 4. Source Citation Mapping Schema
Explanations MUST return a structured JSON response containing the formatted text and the citation references:

```json
{
  "$schema": "scamwatch/explanation.v1",
  "report_id": "93c9f360-91e6-48ca-bda3-a836cde1e699",
  "verdict_text": "This message is classified as a Likely Scam (High Confidence).",
  "explanation_blocks": [
    {
      "text": "The message contains a web link that impersonates the brand PayPal.",
      "citations": [
        {
          "type": "entity",
          "entity_id": "url_1",
          "raw_value": "paypa1.com",
          "evidence_span": "login at paypa1.com to verify",
          "resolved_label": "Lookalike Domain"
        }
      ]
    },
    {
      "text": "This specific link has been reported in 4 other cases in the last 7 days.",
      "citations": [
        {
          "type": "campaign",
          "campaign_id": "sentinel_98",
          "metric": "shared_infrastructure"
        }
      ]
    }
  ]
}
```

---

## 5. Degraded & Abstention Explanations

If the pipeline experiences processing degradation, the engine MUST output specific explanations:

### 5.1. Low-Legibility OCR Fallback
- **Trigger**: `ocr_confidence < 0.55`.
- **Template**: `"We analyzed the screenshot you uploaded, but some sections are blurry or hard to read (Low Legibility). We successfully detected [Entity:phone_1], but could not fully evaluate the text context. Please review the details carefully."`

### 5.2. Classification Abstention
- **Trigger**: `abstained = true` (maximum calibrated confidence $< 0.45$).
- **Template**: `"Our analysis did not find clear matches to known scam patterns (No Signal). However, this does not guarantee safety. We recommend verifying the sender independently using official contacts."`

---

## 6. Copy Tone & Writing Guardrails
- **Victim-Respecting Tone**: No blame-oriented phrasing (e.g., avoid "you should not have clicked"). Use neutral, objective, and supportive language (e.g., "If you entered details, here is how to protect your account").
- **Exaggeration Guard**: Never use alarmist words (e.g. "CRITICAL DANGER", "SCAM ALERT!!!"). Use calibrated warnings (e.g. "Likely Scam", "Use Caution").

---

## 7. Requirements

### 7.1. Functional Requirements
- **XE-301.8.1 (MUST)**: Every claim in an explanation block MUST be anchored to a verified entity, classification, or campaign node.
- **XE-301.8.2 (MUST)**: The engine MUST output a clear warning indicating that the explanation is based on automated analysis and does not constitute legal advice.
- **XE-301.8.3 (MUST)**: If the system ran in rules-only degraded mode due to an LLM outage, the explanation MUST display: `"Processing in degraded mode. Text-context analysis is currently limited."`
- **XE-301.8.4 (MUST NOT)**: The engine MUST NOT output explanations that reference named individuals or private citizens, mitigating defamation liabilities.

### 7.2. Non-Functional Requirements
- **XE-301.8.5 (MUST)**: Explanation rendering and JSON assembly MUST complete in under `300ms` p95.

---

## 8. Acceptance Criteria

- **AC-301.8.a**: Given a report containing a lookalike domain `paypa1.com`, when the explanation generates, then the output text MUST include a citation block explicitly linking to `paypa1.com` as the lookalike entity.
- **AC-301.8.b**: Given the LLM classifier is down and `degraded=true` is set, when the explanation generates, then the output MUST display the system degraded warning.
- **AC-301.8.c**: Given an intake with an unknown scam type, when processed, then the system MUST display the No Signal template without asserting a category.
- **AC-301.8.d**: Given a screen reader focuses on a citation, then it MUST read: `"Citation: Lookalike Domain paypa1.com"` to maintain accessibility constraints.

---

## 9. Edge Cases & Alignment Rules

### 9.1. Multiple Impersonated Brands
- **Edge Case**: A phishing page targets Chase Bank but is hosted on a compromised Microsoft SharePoint URL.
- **Handling**: The engine MUST generate two distinct explanation blocks: one explaining the impersonation target (Chase) and another explaining the hosting infrastructure (SharePoint), mapping each to its respective entity ID.

### 9.2. Submitter Confirms Legitimacy (False Positive Appeal)
- **Edge Case**: A business user appeals a warning on their legitimate site.
- **Handling**: Upon verification by a human analyst, the explanation block for that entity node MUST be updated to show: `"Vetted Domain: This link has been verified as legitimate by our analysts."`

---

## 10. Security Considerations
- **SEC-301.8.1**: All explanation texts parsed from templates MUST undergo HTML entity escaping before rendering in the React frontend, protecting users from Cross-Site Scripting (XSS) payloads embedded in the raw report text.
- **SEC-301.8.2**: Retracted reports MUST immediately revoke their associated explanation records from public caching layers, ensuring deleted data is unreachable.

---

## 11. Accessibility Contract
- **A11Y-301.8.1**: Explanation text blocks MUST use semantic HTML layout tags (`<p>`, `<ul>`, `<li>`) and ensure text runs have a contrast ratio of at least 4.5:1.
- **A11Y-301.8.2**: Warning icons alongside explanations MUST have `role="img"` and descriptive `alt` tags (e.g. `alt="Scam Indicator Warning Icon"`).

---

## 12. Performance & Latency Budgets
- **Template Resolution**: `p50 < 5ms`, `p95 < 25ms`.
- **JSON Citation Mapping**: `p50 < 10ms`, `p95 < 50ms`.
- **Total Pipeline Assembly**: `p50 < 30ms`, `p95 < 300ms`.

---

## 13. Future Expansion
1. **Interactive Highlight Mode**: Build a UI feature that lets users hover over any highlighted sentence in the raw message screenshot to see the specific explainability bubble anchored to that bounding box.
2. **Voice Explanations (Audio Readout)**: Implement text-to-speech synthesis (using a human-like, trauma-aware voice profile) to read explanations aloud for visually impaired users.
