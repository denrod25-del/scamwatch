import React from 'react';

export type DataMode = 'demo' | 'verified' | 'live';

interface DataModeBadgeProps {
  mode: DataMode;
  showDisclaimer?: boolean;
}

export default function DataModeBadge({ mode, showDisclaimer = false }: DataModeBadgeProps): React.JSX.Element {
  let label = 'Demo Data';
  let badgeStyle = 'bg-amber-500/10 text-amber-500 border-amber-500/20';

  if (mode === 'verified') {
    label = 'Verified Data';
    badgeStyle = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
  } else if (mode === 'live') {
    label = 'Live Data';
    badgeStyle = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  }

  return (
    <div className="inline-flex flex-col gap-2">
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${badgeStyle}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${mode === 'demo' ? 'bg-amber-500' : mode === 'verified' ? 'bg-emerald-500' : 'bg-blue-400'}`}></span>
        {label}
      </span>
      {showDisclaimer && mode === 'demo' && (
        <div className="panel p-3 border-l-4 border-l-amber-500 text-xs text-text-muted mt-2 leading-relaxed bg-amber-500/5">
          <strong>Demo Data:</strong> ScamWatch is currently showing seeded example campaigns for beta testing. Do not treat this as a complete live scam database.
        </div>
      )}
    </div>
  );
}
