"use client";

import { useId } from "react";

type Variant = "card" | "overlay";

type Props = {
  patternId: number;
  className?: string;
  /** `card`: bone tile with fill (ritual / share page). `overlay`: transparent, thicker strokes for photo compositing. */
  variant?: Variant;
};

/** Stylized Shang-style 兆 motifs: drill pits + branching cracks (1–4 decisive; 5 = indeterminate). */
export function CrackPatternGraphic({ patternId, className, variant = "card" }: Props) {
  const pid = patternId >= 1 && patternId <= 5 ? patternId : 5;
  const uid = useId().replace(/:/g, "");
  const gradId = `boneFill-${uid}`;
  const filterId = `crack-glow-${uid}`;
  const isOverlay = variant === "overlay";
  const m = isOverlay ? 2.05 : 1;

  const stroke = "var(--crack-stroke, #2a1810)";
  const groove = "var(--crack-groove, #4a3020)";
  const glow = "var(--crack-glow, rgba(196, 90, 40, 0.35))";
  const blur = isOverlay ? 2.4 : 1.8;

  return (
    <svg
      className={className}
      viewBox="0 0 200 240"
      width="200"
      height="240"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0e6d4" />
          <stop offset="55%" stopColor="#e4d8c4" />
          <stop offset="100%" stopColor="#d0c0a4" />
        </linearGradient>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={blur} result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {!isOverlay ? (
        <>
          <rect width="200" height="240" rx="28" fill={`url(#${gradId})`} />
          <g opacity="0.12" stroke={groove} strokeWidth="0.8" fill="none">
            <path d="M20 45 Q100 35 180 50" />
            <path d="M25 120 Q100 108 175 118" />
            <path d="M30 195 Q100 210 170 200" />
          </g>
        </>
      ) : null}
      <g
        filter={`url(#${filterId})`}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {pid === 1 ? <PatternOne stroke={stroke} groove={groove} m={m} /> : null}
        {pid === 2 ? <PatternTwo stroke={stroke} groove={groove} m={m} /> : null}
        {pid === 3 ? <PatternThree stroke={stroke} groove={groove} m={m} /> : null}
        {pid === 4 ? <PatternFour stroke={stroke} groove={groove} m={m} /> : null}
        {pid === 5 ? <PatternFive stroke={stroke} groove={groove} m={m} /> : null}
      </g>
      <circle cx="100" cy="214" r={5 * m} fill={glow} opacity={isOverlay ? 0.95 : 0.85} />
    </svg>
  );
}

function drill(cx: number, cy: number, r: number, m: number, overlay: boolean) {
  const fillOuter = overlay ? "rgba(201,184,154,0.78)" : "#c9b89a";
  const fillInner = overlay ? "rgba(139,115,85,0.55)" : "#8b7355";
  return (
    <g key={`d-${cx}-${cy}`}>
      <circle
        cx={cx}
        cy={cy}
        r={r + 1.5 * m}
        fill="none"
        stroke="var(--crack-glow, rgba(196,90,40,0.25))"
        strokeWidth={2 * m}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={fillOuter}
        stroke="#3d2818"
        strokeWidth={1.2 * m}
      />
      <circle cx={cx} cy={cy} r={r * 0.45} fill={fillInner} opacity={overlay ? 0.65 : 0.5} />
    </g>
  );
}

type Pat = { stroke: string; groove: string; m: number };

function PatternOne({ stroke, groove, m }: Pat) {
  const o = m > 1;
  return (
    <>
      {drill(100, 188, 7, m, o)}
      <path d="M100 181 L100 42" stroke={stroke} strokeWidth={3.2 * m} />
      <path d="M100 110 L148 110" stroke={stroke} strokeWidth={2.8 * m} />
      <path d="M100 72 L88 58 M100 72 L112 58" stroke={groove} strokeWidth={1.4 * m} opacity="0.85" />
    </>
  );
}

function PatternTwo({ stroke, groove, m }: Pat) {
  const o = m > 1;
  return (
    <>
      {drill(100, 192, 6, m, o)}
      <path d="M100 185 Q98 120 102 38" stroke={stroke} strokeWidth={3 * m} />
      <path d="M102 95 Q118 88 132 82" stroke={groove} strokeWidth={1.5 * m} opacity="0.8" />
    </>
  );
}

function PatternThree({ stroke, groove, m }: Pat) {
  const o = m > 1;
  return (
    <>
      {drill(72, 175, 5, m, o)}
      {drill(132, 168, 5, m, o)}
      <path d="M72 168 L132 72" stroke={stroke} strokeWidth={2.8 * m} />
      <path d="M132 161 L68 78" stroke={stroke} strokeWidth={2.8 * m} />
      <circle cx="100" cy="118" r={4 * (0.85 + 0.15 * m)} fill="none" stroke={groove} strokeWidth={1.2 * m} opacity="0.7" />
    </>
  );
}

function PatternFour({ stroke, groove, m }: Pat) {
  const o = m > 1;
  return (
    <>
      {drill(100, 188, 7, m, o)}
      <path d="M100 181 L100 52" stroke={stroke} strokeWidth={3 * m} />
      <path d="M100 118 L62 198" stroke={stroke} strokeWidth={2.6 * m} />
      <path d="M100 118 L142 192" stroke={stroke} strokeWidth={2.6 * m} />
      <path d="M100 78 L92 64 M100 78 L108 64" stroke={groove} strokeWidth={1.3 * m} />
    </>
  );
}

function PatternFive({ stroke, groove, m }: Pat) {
  const o = m > 1;
  return (
    <>
      {drill(58, 178, 4, m, o)}
      {drill(100, 190, 4, m, o)}
      {drill(142, 172, 4, m, o)}
      <path d="M58 171 Q65 130 78 95" stroke={stroke} strokeWidth={2 * m} opacity="0.9" />
      <path d="M100 183 L108 120 L95 70" stroke={stroke} strokeWidth={1.8 * m} opacity="0.85" />
      <path d="M142 165 Q130 130 118 88" stroke={stroke} strokeWidth={2 * m} opacity="0.88" />
      <path d="M75 200 Q100 175 128 205" stroke={groove} strokeWidth={1.4 * m} opacity="0.55" />
      <path d="M44 92 L156 58" stroke={groove} strokeWidth={1.2 * m} opacity="0.35" />
    </>
  );
}
