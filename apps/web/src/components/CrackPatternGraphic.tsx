"use client";

type Props = {
  patternId: number;
  className?: string;
};

/** Stylized Shang-style 兆 motifs: drill pits + branching cracks (1–4 decisive; 5 = indeterminate). */
export function CrackPatternGraphic({ patternId, className }: Props) {
  const pid = patternId >= 1 && patternId <= 5 ? patternId : 5;
  const stroke = "var(--crack-stroke, #2a1810)";
  const groove = "var(--crack-groove, #4a3020)";
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
          <stop offset="55%" stopColor="#e4d8c4" />
          <stop offset="100%" stopColor="#d0c0a4" />
        </linearGradient>
        <filter id="crack-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.8" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="200" height="240" rx="28" fill="url(#boneFill)" />
      {/* Subtle scute / bone texture lines */}
      <g opacity="0.12" stroke={groove} strokeWidth="0.8" fill="none">
        <path d="M20 45 Q100 35 180 50" />
        <path d="M25 120 Q100 108 175 118" />
        <path d="M30 195 Q100 210 170 200" />
      </g>
      <g filter="url(#crack-glow)" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {pid === 1 ? <PatternOne stroke={stroke} groove={groove} /> : null}
        {pid === 2 ? <PatternTwo stroke={stroke} groove={groove} /> : null}
        {pid === 3 ? <PatternThree stroke={stroke} groove={groove} /> : null}
        {pid === 4 ? <PatternFour stroke={stroke} groove={groove} /> : null}
        {pid === 5 ? <PatternFive stroke={stroke} groove={groove} /> : null}
      </g>
      <circle cx="100" cy="214" r="5" fill={glow} opacity="0.85" />
    </svg>
  );
}

function drill(cx: number, cy: number, r: number) {
  return (
    <g key={`d-${cx}-${cy}`}>
      <circle cx={cx} cy={cy} r={r + 1.5} fill="none" stroke="var(--crack-glow, rgba(196,90,40,0.25))" strokeWidth="2" />
      <circle cx={cx} cy={cy} r={r} fill="#c9b89a" stroke="#3d2818" strokeWidth="1.2" />
      <circle cx={cx} cy={cy} r={r * 0.45} fill="#8b7355" opacity="0.5" />
    </g>
  );
}

function PatternOne({ stroke, groove }: { stroke: string; groove: string }) {
  return (
    <>
      {drill(100, 188, 7)}
      <path d="M100 181 L100 42" stroke={stroke} strokeWidth="3.2" />
      <path d="M100 110 L148 110" stroke={stroke} strokeWidth="2.8" />
      <path d="M100 72 L88 58 M100 72 L112 58" stroke={groove} strokeWidth="1.4" opacity="0.85" />
    </>
  );
}

function PatternTwo({ stroke, groove }: { stroke: string; groove: string }) {
  return (
    <>
      {drill(100, 192, 6)}
      <path d="M100 185 Q98 120 102 38" stroke={stroke} strokeWidth="3" />
      <path d="M102 95 Q118 88 132 82" stroke={groove} strokeWidth="1.5" opacity="0.8" />
    </>
  );
}

function PatternThree({ stroke, groove }: { stroke: string; groove: string }) {
  return (
    <>
      {drill(72, 175, 5)}
      {drill(132, 168, 5)}
      <path d="M72 168 L132 72" stroke={stroke} strokeWidth="2.8" />
      <path d="M132 161 L68 78" stroke={stroke} strokeWidth="2.8" />
      <circle cx="100" cy="118" r="4" fill="none" stroke={groove} strokeWidth="1.2" opacity="0.7" />
    </>
  );
}

function PatternFour({ stroke, groove }: { stroke: string; groove: string }) {
  return (
    <>
      {drill(100, 188, 7)}
      <path d="M100 181 L100 52" stroke={stroke} strokeWidth="3" />
      <path d="M100 118 L62 198" stroke={stroke} strokeWidth="2.6" />
      <path d="M100 118 L142 192" stroke={stroke} strokeWidth="2.6" />
      <path d="M100 78 L92 64 M100 78 L108 64" stroke={groove} strokeWidth="1.3" />
    </>
  );
}

function PatternFive({ stroke, groove }: { stroke: string; groove: string }) {
  return (
    <>
      {drill(58, 178, 4)}
      {drill(100, 190, 4)}
      {drill(142, 172, 4)}
      <path d="M58 171 Q65 130 78 95" stroke={stroke} strokeWidth="2" opacity="0.9" />
      <path d="M100 183 L108 120 L95 70" stroke={stroke} strokeWidth="1.8" opacity="0.85" />
      <path d="M142 165 Q130 130 118 88" stroke={stroke} strokeWidth="2" opacity="0.88" />
      <path d="M75 200 Q100 175 128 205" stroke={groove} strokeWidth="1.4" opacity="0.55" />
      <path d="M44 92 L156 58" stroke={groove} strokeWidth="1.2" opacity="0.35" />
    </>
  );
}
