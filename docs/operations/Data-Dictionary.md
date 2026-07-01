# Data Dictionary — Supabase Database

This document catalogs every database table, column, RLS policy, and trigger in the Sentinel Intelligence Engine.

---

## Tables Dictionary

### 1. `reports`
*   **Purpose**: Stores raw scam reports submitted by users.
*   **Columns**:
    *   `id` (uuid, Primary Key)
    *   `content_raw` (text, not null)
    *   `content_deidentified` (text)
    *   `verdict` (text)
    *   `overall_confidence` (numeric)
    *   `created_at` (timestamp with time zone)
*   **Indexes**:
    *   `reports_id_idx` ON `id`
*   **RLS Policies**:
    *   `Enable insert for everyone`: Public anonymous users can insert reports.
    *   `Enable read for everyone`: Public users can view reports.

---

### 2. `entities`
*   **Purpose**: Stores unique extracted indicators (phone numbers, domains, emails, etc.).
*   **Columns**:
    *   `id` (uuid, Primary Key)
    *   `type` (text)
    *   `value_canonical` (text, unique)
    *   `risk_score` (numeric)
    *   `last_seen` (timestamp with time zone)
*   **Indexes**:
    *   `entities_value_canonical_idx` ON `value_canonical` (unique)
*   **RLS Policies**:
    *   `Enable read access for authenticated users`: Only signed-in staff can read entities.
    *   `Enable write access for staff only`: Write operations limited to `moderator`, `analyst`, and `admin` roles.

---

### 3. `evidence_nodes`
*   **Purpose**: Records individual evidence facts linked to reports and entities.
*   **Columns**:
    *   `id` (uuid, Primary Key)
    *   `report_id` (uuid, Foreign Key $\to$ `reports.id` ON DELETE CASCADE)
    *   `entity_id` (uuid, Foreign Key $\to$ `entities.id` ON DELETE CASCADE)
    *   `type` (text)
    *   `confidence` (numeric)
    *   `metadata` (jsonb)
    *   `created_at` (timestamp with time zone)
*   **RLS Policies**:
    *   `Enable read access for authenticated users`: Staff only.

---

### 4. `graph_edges`
*   **Purpose**: Maps relation weights between reports, entities, and campaigns.
*   **Columns**:
    *   `id` (uuid, Primary Key)
    *   `source_id` (uuid, not null)
    *   `source_type` (text, not null)
    *   `target_id` (uuid, not null)
    *   `target_type` (text, not null)
    *   `edge_type` (text, not null)
    *   `weight` (numeric)
*   **RLS Policies**:
    *   `Enable read access for authenticated users`: Staff only.

---

### 5. `confidence_history`
*   **Purpose**: Stores confidence vector snapshots to monitor calibration drift.
*   **Columns**:
    *   `id` (uuid, Primary Key)
    *   `subject_type` (text, e.g., 'report')
    *   `subject_id` (uuid, not null)
    *   `evidence_conf` (numeric)
    *   `model_conf` (numeric)
    *   `community_conf` (numeric)
    *   `historical_conf` (numeric)
    *   `verification_conf` (numeric)
    *   `overall_conf` (numeric)
    *   `reason` (text)
    *   `created_at` (timestamp with time zone)

---

### 6. `timeline_events`
*   **Purpose**: Immutable event log auditing lifecycle modifications.
*   **Columns**:
    *   `id` (uuid, Primary Key)
    *   `subject_type` (text, e.g., 'investigation')
    *   `subject_id` (uuid, not null)
    *   `event_type` (text, e.g., 'Evidence Added')
    *   `description` (text)
    *   `metadata` (jsonb)
    *   `created_at` (timestamp with time zone)
