"use client";

type Props = {
  patternId: number;
  className?: string;
};

/** Stylized crack motifs for oracle-bone readings (1–4 decisive; 5 = indeterminate/silent). */
export function CrackPatternGraphic({ patternId, className }: Props) {
  const pid = patternId >= 1 && patternId <= 5 ? patternId : 5;
  const stroke = "var(--crack-stroke, #2a1810)";
  const glow = "var(--crack-glow, rgba(196, 90, 40, 0.35))";

  return (
    <svg
      className={className}
      viewBox="0 0 200 240"
      width="200"
      height="240"
      aria-hidden
    >
      <defs>
        <linearGradient id="boneFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0e6d4" />
          <stop offset="100%" stopColor="#d8c8ae" />
        </linearGradient>
        <filter id="crack-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="200" height="240" rx="12" fill="url(#boneFill)" />
      <g filter="url(#crack-glow)" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round">
        {pid === 1 ? (
          <>
            <line x1="100" y1="40" x2="100" y2="200" />
            <line x1="100" y1="120" x2="150" y2="120" />
          </>
        ) : null}
        {pid === 2 ? <line x1="70" y1="50" x2="70" y2="200" /> : null}
        {pid === 3 ? (
          <>
            <line x1="60" y1="60" x2="140" y2="180" />
            <line x1="140" y1="60" x2="60" y2="180" />
          </>
        ) : null}
        {pid === 4 ? (
          <>
            <line x1="100" y1="40" x2="100" y2="120" />
            <line x1="100" y1="120" x2="60" y2="200" />
            <line x1="100" y1="120" x2="140" y2="200" />
          </>
        ) : null}
        {pid === 5 ? (
          <>
            <line x1="55" y1="80" x2="85" y2="140" />
            <line x1="120" y1="70" x2="145" y2="130" />
            <line x1="90" y1="170" x2="130" y2="190" />
            <line x1="70" y1="200" x2="150" y2="50" opacity="0.4" />
          </>
        ) : null}
      </g>
      <circle cx="100" cy="210" r="6" fill={glow} opacity="0.9" />
    </svg>
  );
}
