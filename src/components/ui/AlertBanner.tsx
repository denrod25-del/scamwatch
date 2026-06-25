import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface AlertBannerProps {
  tone?: 'info' | 'caution' | 'danger';
  title: string;
  children?: ReactNode;
  dismissible?: boolean;
}

const TONE: Record<NonNullable<AlertBannerProps['tone']>, string> = {
  info: 'border-info-fg/30 bg-info-bg text-info-fg',
  caution: 'border-caution-border bg-caution-bg text-caution-fg',
  danger: 'border-danger-border bg-danger-bg text-danger-fg',
};

/**
 * Local scam alert / system notice. Danger uses the desaturated clay family, never
 * full-saturation red, and never simulates urgency (DS-7.2). Server-rendered, so
 * `dismissible` is presentational here; a client wrapper handles persistence.
 */
export default function AlertBanner({
  tone = 'info',
  title,
  children,
  dismissible = false,
}: AlertBannerProps): React.JSX.Element {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('rounded-lg border p-4', TONE[tone])}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{title}</p>
          {children ? <div className="mt-1 text-sm text-text">{children}</div> : null}
        </div>
        {dismissible ? (
          <button type="button" aria-label="Dismiss" className="text-text-subtle">
            ✕
          </button>
        ) : null}
      </div>
    </div>
  );
}
