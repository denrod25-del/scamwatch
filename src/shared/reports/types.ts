/** Report-submission types (Vol 5 FR-5.2). Kept dependency-free so both server
 *  code and client components can import them without pulling server-only modules. */

export type ReportChannel = 'sms' | 'email' | 'phone' | 'web' | 'social' | 'mail' | 'other';

export interface ReportInput {
  channel: string;
  /** Free-text narrative. De-identified before storage. */
  narrative: string;
  /** Raw scam indicators the reporter flags (phone/url/email/…). */
  indicators?: string[];
  /** null = anonymous report. */
  reporterId?: string | null;
  /** Storage paths of already-uploaded evidence. */
  mediaPaths?: string[];
  /** Idempotency key (Vol 11) — repeat submissions return the same report. */
  idempotencyKey?: string;
}

export interface SubmittedReport {
  id: string;
  status: string;
  /** Count of PII spans removed from the narrative. */
  redactions: number;
  entityCount: number;
}

/** useActionState shape for the report form. */
export interface SubmitState {
  ok: boolean;
  reportId?: string;
  error?: string;
}
