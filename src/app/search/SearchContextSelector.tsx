'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function SearchContextSelector(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  const loseMoney = searchParams.get('lose_money') === 'true';
  const sharePii = searchParams.get('share_pii') === 'true';

  const updateParam = (key: string, val: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set(key, 'true');
    } else {
      params.delete(key);
    }
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
      <h3 className="text-sm font-semibold text-text">Are you affected by this message?</h3>
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-text cursor-pointer select-none">
          <input
            type="checkbox"
            checked={loseMoney}
            onChange={(e) => updateParam('lose_money', e.target.checked)}
            className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
          />
          I lost money to this scam
        </label>
        <label className="flex items-center gap-2 text-sm text-text cursor-pointer select-none">
          <input
            type="checkbox"
            checked={sharePii}
            onChange={(e) => updateParam('share_pii', e.target.checked)}
            className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
          />
          I shared my personal information
        </label>
      </div>
    </div>
  );
}
