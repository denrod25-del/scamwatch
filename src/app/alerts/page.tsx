import type { Metadata } from 'next';

import AlertBanner from '@/components/ui/AlertBanner';

export const metadata: Metadata = {
  title: 'Local scam alerts',
  description: 'Trending scam campaigns in your area.',
};

export default function AlertsPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Local scam alerts</h1>
      <p className="mt-3 text-text-muted">
        Calibrated alerts about scam campaigns trending near you (Vol 5 FR-5.8). Subscribe to get
        notified — privacy-respecting and opt-in (Vol 14/18).
      </p>
      <div className="mt-6">
        <AlertBanner tone="caution" title="Example: toll-road text scam active in your area">
          Several reports describe texts claiming an unpaid toll with a link to “pay now.” Don’t tap
          the link — check directly with your toll authority.
        </AlertBanner>
      </div>
    </div>
  );
}
