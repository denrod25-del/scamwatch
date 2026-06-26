const RING = 'rgba(140,150,170,0.32)';
const NEON = 'rgba(74,222,128,0.55)';

/** Decorative cyber "scanner" motif for the hero (aria-hidden). */
export default function ScannerVisual(): React.JSX.Element {
  const ticks = Array.from({ length: 36 }, (_, i) => {
    const a = (i * 10 * Math.PI) / 180;
    const outer = 150;
    const inner = i % 9 === 0 ? 134 : 142;
    return {
      key: i,
      x1: 160 + Math.cos(a) * outer,
      y1: 160 + Math.sin(a) * outer,
      x2: 160 + Math.cos(a) * inner,
      y2: 160 + Math.sin(a) * inner,
    };
  });

  return (
    <svg
      viewBox="0 0 320 320"
      className="mx-auto h-auto w-full max-w-sm"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="sw-glow" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="rgba(74,222,128,0.18)" />
          <stop offset="70%" stopColor="rgba(74,222,128,0)" />
        </radialGradient>
      </defs>
      <rect width="320" height="320" fill="url(#sw-glow)" />

      {[140, 108, 76, 46].map((r, i) => (
        <circle
          key={r}
          cx="160"
          cy="160"
          r={r}
          fill="none"
          stroke={RING}
          strokeWidth="1"
          strokeDasharray={i % 2 ? '2 7' : undefined}
        />
      ))}

      {ticks.map((t) => (
        <line key={t.key} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={RING} strokeWidth="1" />
      ))}

      {/* radar sweep wedge + active outer ring */}
      <path d="M160 160 L160 20 A140 140 0 0 1 283 92 Z" fill="rgba(74,222,128,0.07)" />
      <circle
        cx="160"
        cy="160"
        r="140"
        fill="none"
        stroke={NEON}
        strokeWidth="1.5"
        strokeDasharray="3 9"
      />

      {/* center shield-check */}
      <g
        transform="translate(160 160)"
        stroke="#4ade80"
        strokeWidth="3"
        fill="rgba(74,222,128,0.06)"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M0 -36 L28 -24 V6 c0 19 -13 30 -28 36 c-15 -6 -28 -17 -28 -36 V-24 Z" />
        <path d="M-12 0 l8 9 l17 -18" fill="none" />
      </g>
    </svg>
  );
}
