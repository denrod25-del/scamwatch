'use client';

export interface ModerationActionBarProps {
  reportId: string;
  onApprove?: () => void;
  onReject?: () => void;
  onEscalate?: () => void;
}

/**
 * Moderation queue actions (Vol 16 ops / Vol 14 trust & safety).
 * Role-gated: only `moderator` | `analyst` | `admin` may render/act on this.
 * Every action is written to the append-only audit_log (Vol 10).
 */
export default function ModerationActionBar({
  reportId,
  onApprove,
  onReject,
  onEscalate,
}: ModerationActionBarProps): React.JSX.Element {
  return (
    <div
      role="group"
      aria-label={`Moderation actions for report ${reportId}`}
      className="flex flex-wrap gap-2 rounded-lg border border-border bg-surface-muted p-3"
    >
      <button
        type="button"
        onClick={onApprove}
        className="rounded-md border border-safe-border bg-safe-bg px-3 py-1.5 text-sm text-safe-fg"
      >
        Approve & publish
      </button>
      <button
        type="button"
        onClick={onReject}
        className="rounded-md border border-danger-border bg-danger-bg px-3 py-1.5 text-sm text-danger-fg"
      >
        Reject
      </button>
      <button
        type="button"
        onClick={onEscalate}
        className="rounded-md border border-caution-border bg-caution-bg px-3 py-1.5 text-sm text-caution-fg"
      >
        Escalate
      </button>
    </div>
  );
}
