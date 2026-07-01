import type { Metadata } from 'next';

import { requireStaff } from '@/shared/auth/session';
import { createAdminClient } from '@/infrastructure/supabase/admin';
import { getModerationQueue } from '@/shared/moderation/queue';
import EntityChip from '@/components/ui/EntityChip';
import type { EntityType } from '@/types';
import { signOutAction } from '@/shared/auth/actions';
import { approveAction, rejectAction } from './actions';

export const metadata: Metadata = { title: 'Moderation queue', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function ModerationPage(): Promise<React.JSX.Element> {
  await requireStaff();
  const queue = await getModerationQueue(createAdminClient());

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Moderation queue ({queue.length})</h1>
        <form action={signOutAction}>
          <button type="submit" className="text-sm text-text-muted underline">
            Sign out
          </button>
        </form>
      </div>
      <p className="mt-2 text-sm text-text-subtle">
        Approving publishes the report — its extracted entities become live search signal. Reject
        anything spammy, abusive, or that names a private individual without evidence (Vol 14/16).
      </p>

      {queue.length === 0 ? (
        <p className="mt-8 text-text-muted">Nothing awaiting review. 🎉</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {queue.map((item) => (
            <li key={item.id} className="rounded-lg border border-border bg-surface p-5">
              <div className="flex flex-wrap items-center gap-2 text-sm text-text-subtle">
                <span className="rounded-sm bg-surface-muted px-2 py-0.5">{item.channel}</span>
                {item.verdict ? <span>verdict: {item.verdict}</span> : null}
                {item.mediaCount > 0 ? <span>· {item.mediaCount} attachment(s)</span> : null}
              </div>

              <p className="mt-2 whitespace-pre-wrap text-text">{item.rawText ?? '(no text)'}</p>

              {item.entities.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.entities.map((e) => (
                    <EntityChip
                      key={`${e.type}:${e.value}`}
                      type={e.type as EntityType}
                      value={e.value}
                    />
                  ))}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <form action={approveAction}>
                  <input type="hidden" name="reportId" value={item.id} />
                  <button
                    type="submit"
                    className="rounded-md border border-safe-border bg-safe-bg px-3 py-1.5 text-sm text-safe-fg"
                  >
                    Approve &amp; publish
                  </button>
                </form>
                <form action={rejectAction} className="flex items-center gap-2">
                  <input type="hidden" name="reportId" value={item.id} />
                  <input
                    name="reason"
                    placeholder="reason (optional)"
                    className="rounded-md border border-border-strong bg-surface px-2 py-1 text-sm"
                  />
                  <button
                    type="submit"
                    className="rounded-md border border-danger-border bg-danger-bg px-3 py-1.5 text-sm text-danger-fg"
                  >
                    Reject
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
