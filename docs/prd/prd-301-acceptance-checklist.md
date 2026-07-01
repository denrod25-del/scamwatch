# PRD-301 AI Scam Analyzer Implementation Acceptance Checklist

This document establishes the acceptance checklist, verification metrics, manual QA test scripts, and launch boundaries for the **PRD-301 AI Scam Analyzer** implementation.

---

## 1. MVP Requirements Checklist

These core features represent the minimum viable product (MVP) required for public user-facing search and report intake:

- `[x]` **Core Ingestion (PRD-301.1)**:
  - Text input copy-paste support up to 50 KB.
  - Image screenshot upload written to private Supabase Storage buckets.
- `[x]` **Deterministic Entity Extraction (PRD-301.2)**:
  - Regex-based parsing for 6 base entity types (`phone`, `url`, `domain`, `email`, `wallet`, `handle`).
  - Canonicalization mappings (E.164 phone conversion, host name normalization).
- `[x]` **Basic Threat Classification (PRD-301.3)**:
  - Integration with OpenAI API client configuration.
  - Overall verdict mapping (`Likely Safe`, `No Signal`, `Use Caution`, `Likely Scam`).
  - Coarse presentation bands (Low, Moderate, High confidence).
- `[x]` **REST API Endpoints (PRD-301.9)**:
  - `GET /api/v1/search?q=...` to query query-string verdicts.
  - `POST /api/v1/search/check` to execute indicator evaluations.
- `[x]` **Basic Search UI Page**:
  - `VerdictCard` showing derived scam risk.
  - `SearchBar` carrying persistent values.
  - Graceful stubs for unconfigured API states (abstaining to `No Signal`).

---

## 2. Phase 2 Advanced Intelligence Checklist

These advanced pipelines implement the defense-in-depth, anti-evasion, and recovery tools specified across Project Sentinel:

- `[x]` **Unicode Ingestion Sanitization (PRD-301.1)**:
  - NFC Unicode Normalization Form parsing.
  - **Cyrillic Confusable Homoglyph Scan** (replacing Cyrillic lookalikes in Latin terms to block brand spoofing).
- `[x]` **OCR Column Layout Sorting (PRD-301.1)**:
  - Vertical overlap zoning (height overlap $\ge 50\%$) and left-to-right sorting of OCR text bounding boxes.
  - Legibility score flagging (`ocr_confidence` $< 0.55$ triggers `low_legibility`).
- `[x]` **Hybrid Extraction & Anti-Hallucination Guard (PRD-301.2)**:
  - Merge pipeline linking deterministic parser and LLM structured schemas.
  - **Verbatim Evidence Span Verification** (discards LLM entities if their evidence span does not exist in the source report).
  - Confidence multiplier calibration based on match sources (rules: `0.95`, LLM: `0.85`, both: `0.99`).
- `[x]` **RAG-augmented pgvector Classification (PRD-301.3)**:
  - Embeddings generation via `text-embedding-3-small` (1536-dim).
  - Cosine distance matching (`<=>`) RPC stored procedure `match_embeddings`.
  - Exemplar injection (injecting matched report categories as in-context prompts).
  - **Dampening Scaling**: Multiplying classifier confidence by `0.70` if no matching reports are found (similarity $< 0.30$).
  - **Abstention Gate**: Rejecting results and returning `No Signal` if final confidence falls below $\theta_{\text{abstain}} = 0.45$.
  - Multi-label threat categorization mapping (persisting matches in `report_threats`).
- `[x]` **Dynamic Campaign Detection Engine (PRD-301.6)**:
  - Composite correlation score ($S_{\text{link}}$) weighting shared entities (by type-based rarity weights), template embeddings, and time proximity.
  - Automated linking of reports to candidate clusters.
  - Candidate campaign promotion to `active` when link scores cross $\theta_{\text{promote}} \ge 0.85$.
- `[x]` **Knowledge Graph Noisy-OR Score Propagation (PRD-301.5)**:
  - Aggregating entity risk based on connected report scores:
    $$P(\text{Scam}) = 1 - \prod (1 - w_{\text{edge}} \cdot C(R_i) \cdot d_e(t_i))$$
  - Link weights ($0.90$ direct, $0.60$ indirect/campaigns).
  - Exponential decays (half-lives of 30 days for domains/URLs, 90 for phones/emails, 180 for wallets/brands).
- `[x]` **Dynamic Recovery UI Checklists (PRD-301.7 / PRD-301.8)**:
  - Submitter context selectors (`lose_money`, `share_pii`) updating query parameters.
  - Grounded `ExplanationPanel` displaying extracted indicator citations.
  - Regulatory verify routing (routing romance/phishing/identity theft to the FTC, and prioritizing the Florida Attorney General office for Florida users).
  - Urgency badges (high/medium/low priority) on checkable mitigation steps.

---

## 3. Pass / Fail Acceptance Criteria

| Criteria ID | Category | Metric / Behavior | Pass Threshold | Status |
| :--- | :--- | :--- | :--- | :--- |
| **AC-301.A** | System | Vitest Unit Test Run | 100% test completion | **PASS** (50/50) |
| **AC-301.B** | Sanitizer | Homoglyph Spoofing | `goоgle.com` (Cyrillic `о`) maps to Latin `google.com` | **PASS** |
| **AC-301.C** | Ingestion | OCR Layout Sort | Horizontally parallel conversation bubbles sort chronologically | **PASS** |
| **AC-301.D** | Extraction | Verbatim Span Guard | Discards LLM entities with missing/invented text spans | **PASS** |
| **AC-301.E** | Classifier | RAG Exemplar Match | Query returns top-5 similar reports with cosine distance | **PASS** |
| **AC-301.F** | Classifier | Calibration Gate | Confidence falls below 0.45 after dampening $\to$ Abstains | **PASS** |
| **AC-301.G** | Campaigns | Linking Score | Shared wallet link and identical template matches cross 0.85 | **PASS** |
| **AC-301.H** | graph | Score Propagation | Connected domain risk decays by 50% after 30 days | **PASS** |
| **AC-301.I** | UI Surface | Submitter Toggle | Toggling `lose_money` loads IC3/bank card checklist | **PASS** |

---

## 4. Manual QA Test Scripts

Manual testers can execute these test scripts to verify the analyzer logic in dev or staging environments:

### Script 1: Confusable Brand Evading Detection
1.  Navigate to the `/search` page.
2.  In the check search bar, type `paypa1.com` (using number `1` or a Cyrillic character like `а` U+0430: `paypаl.com`).
3.  Click "Check".
4.  **Verification**:
    *   The checked indicator under "Checked:" shows the clean canonical Latin equivalent: `paypa1.com` or `paypal.com`.
    *   The Explanation Panel citations list a `"Flagged infrastructure match: "paypa1.com" identified as a Lookalike Domain"`.

### Script 2: Submitter Financial Exposure Recovery Checklist
1.  Navigate to the `/search` page.
2.  Input a known phishing URL or smishing text (e.g. `http://t0ll-pay.com/redeem`).
3.  Observe the Verdict Card: it displays `Likely Scam` with a red border.
4.  Notice the "Verify & Official Reporting" section lists the default regulatory link: `Report fraud to the FTC`.
5.  In the card section "Are you affected by this message?", check the box **"I lost money to this scam"**.
6.  **Verification**:
    *   The page reloads and updates the URL to include `lose_money=true`.
    *   The "Immediate Mitigation Steps" section dynamically displays two high-priority recovery steps:
        1.  `Call the official fraud department number printed on the back of your bank card immediately. (high Priority)`
        2.  `File a formal cybercrime report with the FBI's Internet Crime Complaint Center (IC3). (high Priority)`

---

## 5. Launch Blockers

The following items are defined as critical launch blockers. If any of these are violated, the release MUST be held:

1.  **Unit/Integration Test Failures**: Any test suite in `npm run test` returning a non-zero exit code.
2.  **Unsanitized Data Leakage**: Sending raw report text containing un-scrubbed PII to OpenAI completions without passing the de-identification filter (Volume 14 privacy contract violation).
3.  **Active Link Resolution**: Resolving or loading HTML `src` links or remote tracking pixels during ingestion or parsing stages (blocks actor callbacks/SSRF).
4.  **Missing Row Level Security (RLS)**: Deploying the pgvector matching procedure `match_embeddings` or the `embeddings` table without active Supabase RLS restrictions (exposes internal records to anon users).
5.  **False Safety Claims**: Returning `risk: 0` or displaying a green "Safe" badge for unknown queries (must display `No Signal`, Low Confidence to avoid false guarantees).
