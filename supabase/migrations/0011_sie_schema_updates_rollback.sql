-- Rollback Migration: 0011_sie_schema_updates_rollback.sql
-- Safely drops tables, triggers, and RLS policies created in 0011_sie_schema_updates.sql

-- Drop triggers first
DROP TRIGGER IF EXISTS update_investigations_updated_at ON investigations;
DROP TRIGGER IF EXISTS update_investigation_notes_updated_at ON investigation_notes;
DROP TRIGGER IF EXISTS update_graph_snapshots_updated_at ON graph_snapshots;

-- Drop RLS policies (implicit when dropping tables, but explicitly cleaned here if needed)
-- Drop tables
DROP TABLE IF EXISTS graph_edges CASCADE;
DROP TABLE IF EXISTS graph_snapshots CASCADE;
DROP TABLE IF EXISTS evidence_nodes CASCADE;
DROP TABLE IF EXISTS reasoning_nodes CASCADE;
DROP TABLE IF EXISTS confidence_history CASCADE;
DROP TABLE IF EXISTS timeline_events CASCADE;
DROP TABLE IF EXISTS investigation_notes CASCADE;
DROP TABLE IF EXISTS investigation_entities CASCADE;
DROP TABLE IF EXISTS investigation_reports CASCADE;
DROP TABLE IF EXISTS investigations CASCADE;

-- Drop trigger function
DROP FUNCTION IF EXISTS update_updated_at_column();
