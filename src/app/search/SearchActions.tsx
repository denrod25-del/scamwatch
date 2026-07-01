'use client';

import React from 'react';

export default function SearchActions(): React.JSX.Element {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      alert('Investigation report link copied to clipboard.');
    }
  };

  return (
    <div className="flex flex-wrap gap-3 pt-4 border-t border-border/40 print:hidden">
      <button
        onClick={handlePrint}
        className="px-4 py-2 rounded bg-brand text-brand-contrast text-xs font-bold hover:bg-brand/80 transition-colors"
      >
        Print Report / Save PDF
      </button>
      <button
        onClick={handleShare}
        className="px-4 py-2 rounded border border-border bg-surface hover:bg-hover text-xs font-semibold text-text transition-colors"
      >
        Share Investigation Link
      </button>
    </div>
  );
}
