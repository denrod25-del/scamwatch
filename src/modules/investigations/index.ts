import { SupabaseClient } from '@supabase/supabase-js';

export interface NotePayload {
  id: string;
  investigationId: string;
  authorId?: string;
  content: string;
  createdAt: string;
}

export interface InvestigationDetails {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  reports: string[];
  entities: string[];
  notes: NotePayload[];
}

/**
 * Creates a new investigation case.
 */
export async function createInvestigation(
  sb: SupabaseClient,
  title: string,
  reportIds: string[] = [],
  entityIds: string[] = []
): Promise<string> {
  const { data: caseObj, error } = await sb
    .from('investigations')
    .insert({ title, status: 'active' })
    .select('id')
    .single();

  if (error || !caseObj) {
    throw new Error(`Failed to create investigation: ${error?.message || 'unknown error'}`);
  }

  const investigationId = caseObj.id;

  // Add reports links
  if (reportIds.length > 0) {
    const reportsPayload = reportIds.map((rid) => ({ investigation_id: investigationId, report_id: rid }));
    await sb.from('investigation_reports').insert(reportsPayload);
  }

  // Add entities links
  if (entityIds.length > 0) {
    const entitiesPayload = entityIds.map((eid) => ({ investigation_id: investigationId, entity_id: eid }));
    await sb.from('investigation_entities').insert(entitiesPayload);
  }

  // Log timeline event
  await sb.from('timeline_events').insert({
    subject_type: 'investigation',
    subject_id: investigationId,
    event_type: 'Report Submitted',
    description: `Investigation workspace "${title}" created`,
  });

  return investigationId;
}

/**
 * Adds an evidence node linked to an investigation.
 */
export async function addEvidenceToInvestigation(
  sb: SupabaseClient,
  investigationId: string,
  type: string,
  confidence: number,
  metadata: Record<string, any> = {}
): Promise<void> {
  // We insert a timeline event as investigation evidence for forensic tracking
  await sb.from('timeline_events').insert({
    subject_type: 'investigation',
    subject_id: investigationId,
    event_type: 'Evidence Added',
    description: `Added ${type} evidence to investigation`,
    metadata: { ...metadata, confidence },
  });
}

/**
 * Merges a source investigation case into a target case, archiving the source.
 */
export async function mergeInvestigation(
  sb: SupabaseClient,
  targetId: string,
  sourceId: string
): Promise<void> {
  // 1) Relink reports
  const { data: sourceReports } = await sb
    .from('investigation_reports')
    .select('report_id')
    .eq('investigation_id', sourceId);

  if (sourceReports && sourceReports.length > 0) {
    const reportPayloads = sourceReports.map((r) => ({
      investigation_id: targetId,
      report_id: r.report_id,
    }));
    await sb.from('investigation_reports').upsert(reportPayloads);
  }

  // 2) Relink entities
  const { data: sourceEntities } = await sb
    .from('investigation_entities')
    .select('entity_id')
    .eq('investigation_id', sourceId);

  if (sourceEntities && sourceEntities.length > 0) {
    const entityPayloads = sourceEntities.map((e) => ({
      investigation_id: targetId,
      entity_id: e.entity_id,
    }));
    await sb.from('investigation_entities').upsert(entityPayloads);
  }

  // 3) Relink notes
  await sb
    .from('investigation_notes')
    .update({ investigation_id: targetId })
    .eq('investigation_id', sourceId);

  // 4) Archive the source case
  await archiveInvestigation(sb, sourceId);

  // 5) Log timeline events
  await sb.from('timeline_events').insert({
    subject_type: 'investigation',
    subject_id: targetId,
    event_type: 'Campaign Linked',
    description: `Merged case ${sourceId} into this investigation`,
  });
}

/**
 * Archives an investigation case.
 */
export async function archiveInvestigation(sb: SupabaseClient, id: string): Promise<void> {
  await sb
    .from('investigations')
    .update({ status: 'archived' })
    .eq('id', id);

  await sb.from('timeline_events').insert({
    subject_type: 'investigation',
    subject_id: id,
    event_type: 'Archived',
    description: 'Investigation case archived',
  });
}
