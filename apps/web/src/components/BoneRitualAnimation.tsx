"use client";

import type { OracleBonesVerdict } from "@iching-oracle/oracle-bones-engine";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export type BoneOracleResult = OracleBonesVerdict;

type BoneRitualAnimationProps = {
  isProcessing: boolean;
  oracleResult: BoneOracleResult | null;
  verdictText?: string | null;
};

type RitualStage = "fire" | "cracks" | "reveal";

const CRACK_FADE_IN_MS = 900;
const REVEAL_HOLD_MS = 700;
const FIRE_ONLY_DEBUG = false;
const FIRE_PARTICLE_VS = `
uniform float pointMultiplier;
attribute float size;
attribute float angle;
attribute vec4 aColor;

varying vec4 vColor;
varying vec2 vAngle;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = size * pointMultiplier / gl_Position.w;
  vAngle = vec2(cos(angle), sin(angle));
  vColor = aColor;
}
`;

const FIRE_PARTICLE_FS = `
uniform sampler2D diffuseTexture;

varying vec4 vColor;
varying vec2 vAngle;

void main() {
  vec2 coords = (gl_PointCoord - 0.5) * mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x) + 0.5;
  gl_FragColor = texture2D(diffuseTexture, coords) * vColor;
}
`;

function getLinearSpline<T>(lerp: (t: number, a: T, b: T) => T) {
  const points: Array<[number, T]> = [];

  const addPoint = (t: number, value: T) => {
    points.push([t, value]);
  };

  const getValueAt = (t: number) => {
    let p1 = 0;
    for (let i = 0; i < points.length; i += 1) {
      if (points[i] && points[i][0] >= t) break;
      p1 = i;
    }
    const p2 = Math.min(points.length - 1, p1 + 1);
    const a = points[p1];
    const b = points[p2];
    if (!a || !b) return points[0]?.[1] as T;
    if (p1 === p2) return a[1];
    const n = (t - a[0]) / (b[0] - a[0]);
    return lerp(n, a[1], b[1]);
  };

  return { addPoint, getValueAt };
}

function resultToViewportClass(result: BoneOracleResult | null): string {
  if (result === null) return "bone-ritual-viewport--pending";
  if (result === "auspicious_clear") return "bone-ritual-viewport--auspicious-clear";
  if (result === "auspicious_moderate") return "bone-ritual-viewport--auspicious-moderate";
  if (result === "inauspicious_moderate") return "bone-ritual-viewport--inauspicious-moderate";
  if (result === "inauspicious_clear") return "bone-ritual-viewport--inauspicious-clear";
  return "bone-ritual-viewport--silent";
}

function resultToFallbackClass(result: BoneOracleResult | null): string {
  if (result === "auspicious_clear") return "bone-ritual-fallback--auspicious-clear";
  if (result === "auspicious_moderate") return "bone-ritual-fallback--auspicious-moderate";
  if (result === "inauspicious_moderate") return "bone-ritual-fallback--inauspicious-moderate";
  if (result === "inauspicious_clear") return "bone-ritual-fallback--inauspicious-clear";
  if (result === "silent") return "bone-ritual-fallback--silent";
  return "bone-ritual-fallback--pending";
}

function verdictGlyph(result: BoneOracleResult | null): string {
  if (result === "auspicious_clear" || result === "auspicious_moderate") return "吉";
  if (result === "inauspicious_moderate" || result === "inauspicious_clear") return "凶";
  if (result === "silent") return "默";
  return "";
}

function verdictBadgeClass(result: BoneOracleResult | null): string {
  if (result === "auspicious_clear" || result === "auspicious_moderate") return "bone-ritual-verdict--auspicious";
  if (result === "inauspicious_moderate" || result === "inauspicious_clear") return "bone-ritual-verdict--inauspicious";
  if (result === "silent") return "bone-ritual-verdict--silent";
  return "bone-ritual-verdict--pending";
}

function useRitualStage(isProcessing: boolean, oracleResult: BoneOracleResult | null) {
  const [stage, setStage] = useState<RitualStage>("fire");
  const [crackProgress, setCrackProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    let start = 0;
    const loopCracks = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(1, elapsed / CRACK_FADE_IN_MS);
      setCrackProgress(progress);
      if (progress < 1) {
        raf = window.requestAnimationFrame(loopCracks);
      } else {
        setStage("reveal");
        window.setTimeout(() => setCrackProgress(1), REVEAL_HOLD_MS);
      }
    };

    if (isProcessing || oracleResult === null) {
      setStage("fire");
      setCrackProgress(0);
      return () => {
        if (raf) window.cancelAnimationFrame(raf);
      };
    }

    setStage("cracks");
    setCrackProgress(0);
    raf = window.requestAnimationFrame(loopCracks);
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [isProcessing, oracleResult]);

  return { stage, crackProgress };
}

function crackColorForResult(result: BoneOracleResult | null) {
  if (result === "auspicious_clear") return { base: 0xe2a85a, glow: 0xffe0a0 };
  if (result === "auspicious_moderate") return { base: 0xc3894d, glow: 0xffc782 };
  if (result === "inauspicious_moderate") return { base: 0xbc5448, glow: 0xff8a74 };
  if (result === "inauspicious_clear") return { base: 0xb4332a, glow: 0xff5c45 };
  return { base: 0x97836a, glow: 0xd2bea5 };
}

type CrackBranchTemplate = {
  at: number;
  angleOffset: number;
  lengths: number[];
  turns: number[];
};

type CrackRootTemplate = {
  angle: number;
  startX: number;
  startY: number;
  lengths: number[];
  turns: number[];
  branches?: CrackBranchTemplate[];
};

type CrackTemplate = {
  opening: number;
  emberBoost: number;
  roots: CrackRootTemplate[];
};

function crackPatternTemplate(result: BoneOracleResult): CrackTemplate {
  switch (result) {
    case "auspicious_clear":
      return {
        opening: 1.22,
        emberBoost: 1.12,
        roots: [
          {
            angle: -0.74,
            startX: -0.27,
            startY: -0.02,
            lengths: [0.12, 0.12, 0.12, 0.11, 0.11],
            turns: [0.05, -0.07, 0.06, -0.06, 0.05],
            branches: [{ at: 2, angleOffset: 0.72, lengths: [0.09, 0.08], turns: [0.06, -0.05] }],
          },
          {
            angle: 0.08,
            startX: -0.14,
            startY: -0.08,
            lengths: [0.11, 0.11, 0.11, 0.11],
            turns: [0.05, -0.06, 0.06, -0.05],
            branches: [{ at: 1, angleOffset: 0.64, lengths: [0.08, 0.08], turns: [0.05, -0.05] }],
          },
          {
            angle: 0.94,
            startX: 0.02,
            startY: -0.03,
            lengths: [0.12, 0.12, 0.11, 0.11],
            turns: [-0.06, 0.07, -0.06, 0.05],
            branches: [{ at: 2, angleOffset: -0.66, lengths: [0.09, 0.08], turns: [-0.05, 0.05] }],
          },
          {
            angle: 0.02,
            startX: -0.31,
            startY: -0.01,
            lengths: [0.14, 0.13, 0.14, 0.13],
            turns: [0.02, -0.03, 0.03, -0.02],
            branches: [{ at: 2, angleOffset: 0.56, lengths: [0.08, 0.09], turns: [0.04, -0.04] }],
          },
          {
            angle: 1.57,
            startX: 0.0,
            startY: -0.16,
            lengths: [0.12, 0.12, 0.11, 0.11, 0.1],
            turns: [0.0, -0.01, 0.01, -0.01, 0.0],
            branches: [{ at: 1, angleOffset: -0.64, lengths: [0.08, 0.08], turns: [-0.04, 0.04] }],
          },
        ],
      };
    case "auspicious_moderate":
      return {
        opening: 1.18,
        emberBoost: 1.0,
        roots: [
          {
            angle: -0.52,
            startX: -0.28,
            startY: -0.02,
            lengths: [0.11, 0.12, 0.11, 0.11, 0.1],
            turns: [0.06, -0.08, 0.07, -0.07, 0.06],
            branches: [{ at: 2, angleOffset: 0.76, lengths: [0.09, 0.08], turns: [0.06, -0.05] }],
          },
          {
            angle: 1.34,
            startX: -0.01,
            startY: -0.1,
            lengths: [0.1, 0.11, 0.1, 0.11],
            turns: [0.02, -0.03, 0.03, -0.02],
            branches: [{ at: 1, angleOffset: 0.65, lengths: [0.08, 0.08], turns: [0.05, -0.04] }],
          },
          {
            angle: -1.12,
            startX: 0.2,
            startY: -0.04,
            lengths: [0.11, 0.11, 0.1, 0.1],
            turns: [0.03, -0.04, 0.04, -0.03],
            branches: [{ at: 2, angleOffset: -0.7, lengths: [0.09, 0.08], turns: [-0.05, 0.05] }],
          },
          {
            angle: 1.5,
            startX: -0.09,
            startY: -0.15,
            lengths: [0.11, 0.11, 0.1, 0.1],
            turns: [0.02, -0.03, 0.03, -0.02],
            branches: [{ at: 1, angleOffset: 0.62, lengths: [0.08, 0.08], turns: [0.04, -0.04] }],
          },
          {
            angle: 1.46,
            startX: -0.2,
            startY: -0.04,
            lengths: [0.1, 0.11, 0.1, 0.1],
            turns: [0.01, -0.02, 0.02, -0.01],
            branches: [{ at: 2, angleOffset: 0.58, lengths: [0.08, 0.08], turns: [0.03, -0.03] }],
          },
        ],
      };
    case "inauspicious_moderate":
      return {
        opening: 1.3,
        emberBoost: 1.26,
        roots: [
          {
            angle: -0.68,
            startX: -0.27,
            startY: -0.02,
            lengths: [0.11, 0.12, 0.11, 0.12, 0.11],
            turns: [0.09, -0.1, 0.09, -0.09, 0.08],
            branches: [{ at: 2, angleOffset: 0.84, lengths: [0.09, 0.09, 0.08], turns: [0.07, -0.07, 0.06] }],
          },
          {
            angle: 1.22,
            startX: -0.15,
            startY: -0.1,
            lengths: [0.1, 0.11, 0.1, 0.11],
            turns: [0.05, -0.06, 0.06, -0.05],
            branches: [{ at: 2, angleOffset: 0.78, lengths: [0.08, 0.09], turns: [0.06, -0.06] }],
          },
          {
            angle: -0.88,
            startX: 0.1,
            startY: -0.03,
            lengths: [0.12, 0.11, 0.12, 0.11],
            turns: [-0.08, 0.09, -0.08, 0.07],
            branches: [{ at: 1, angleOffset: -0.82, lengths: [0.09, 0.09], turns: [-0.06, 0.06] }],
          },
        ],
      };
    case "inauspicious_clear":
      return {
        opening: 1.34,
        emberBoost: 1.38,
        roots: [
          {
            angle: -0.64,
            startX: -0.27,
            startY: -0.02,
            lengths: [0.11, 0.12, 0.11, 0.12, 0.11],
            turns: [0.1, -0.11, 0.1, -0.1, 0.08],
            branches: [
              { at: 1, angleOffset: 0.9, lengths: [0.09, 0.09, 0.08], turns: [0.08, -0.08, 0.07] },
              { at: 3, angleOffset: -0.82, lengths: [0.08, 0.09], turns: [-0.07, 0.07] },
            ],
          },
          {
            angle: -0.24,
            startX: -0.16,
            startY: -0.1,
            lengths: [0.1, 0.11, 0.1, 0.11],
            turns: [0.07, -0.08, 0.08, -0.07],
            branches: [{ at: 2, angleOffset: 0.78, lengths: [0.08, 0.09], turns: [0.07, -0.06] }],
          },
          { angle: 0.12, startX: -0.05, startY: -0.03, lengths: [0.12, 0.11, 0.12, 0.11], turns: [-0.09, 0.1, -0.09, 0.08] },
          {
            angle: 0.46,
            startX: 0.07,
            startY: -0.01,
            lengths: [0.1, 0.12, 0.11, 0.1],
            turns: [0.09, -0.1, 0.08, -0.07],
            branches: [{ at: 1, angleOffset: -0.85, lengths: [0.1, 0.09], turns: [-0.07, 0.07] }],
          },
          { angle: 0.82, startX: 0.18, startY: -0.03, lengths: [0.1, 0.1, 0.11], turns: [0.08, -0.09, 0.08] },
          { angle: 1.18, startX: 0.26, startY: -0.05, lengths: [0.09, 0.1, 0.09], turns: [0.07, -0.08, 0.07] },
          { angle: -1.18, startX: 0.19, startY: -0.13, lengths: [0.1, 0.1, 0.09], turns: [0.06, -0.08, 0.07] },
        ],
      };
    case "silent":
      return {
        opening: 0.64,
        emberBoost: 0.52,
        roots: [
          { angle: -0.15, startX: -0.08, startY: -0.05, lengths: [0.1, 0.09, 0.08], turns: [0.03, -0.02, 0.02] },
          { angle: 0.26, startX: 0.02, startY: -0.04, lengths: [0.09, 0.08, 0.09], turns: [-0.02, 0.03, -0.02] },
          { angle: -0.62, startX: 0.09, startY: -0.09, lengths: [0.08, 0.08], turns: [0.02, -0.02] },
        ],
      };
  }
}

function createFlameTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const grad = ctx.createRadialGradient(size * 0.5, size * 0.78, size * 0.02, size * 0.5, size * 0.5, size * 0.5);
  grad.addColorStop(0, "rgba(255,255,245,1)");
  grad.addColorStop(0.2, "rgba(255,212,128,0.98)");
  grad.addColorStop(0.45, "rgba(255,144,44,0.88)");
  grad.addColorStop(0.72, "rgba(196,64,12,0.42)");
  grad.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function buildCrackLineVertices(result: BoneOracleResult): Float32Array {
  const template = crackPatternTemplate(result);
  const points: number[] = [];
  const rootLimitByResult: Record<BoneOracleResult, number> = {
    auspicious_clear: 5,
    auspicious_moderate: 5,
    inauspicious_moderate: 3,
    inauspicious_clear: 3,
    silent: 3,
  };
  const spanScaleByResult: Record<BoneOracleResult, number> = {
    auspicious_clear: 2.28,
    auspicious_moderate: 2.24,
    inauspicious_moderate: 2.26,
    inauspicious_clear: 2.28,
    silent: 2.0,
  };
  const yOffsetByResult: Record<BoneOracleResult, number> = {
    auspicious_clear: -0.03,
    auspicious_moderate: -0.03,
    inauspicious_moderate: -0.03,
    inauspicious_clear: -0.08,
    silent: -0.07,
  };
  const spanScale = spanScaleByResult[result];
  const appendPath = (root: CrackRootTemplate, baseAngle = 0) => {
    let x = root.startX * spanScale;
    let y = root.startY * spanScale;
    let angle = root.angle + baseAngle;
    let z = 1.33;
    for (let i = 0; i < root.lengths.length; i += 1) {
      const len = (root.lengths[i] ?? 0.1) * spanScale;
      const turn = root.turns[i] ?? 0;
      angle += turn;
      const nx = x + Math.cos(angle) * len;
      const ny = y + Math.sin(angle) * len * 0.64;
      const nz = z + ((i % 2 === 0 ? 1 : -1) * 0.003);
      points.push(x, y - 0.12, z, nx, ny - 0.12, nz);
      if (root.branches) {
        for (const br of root.branches) {
          if (br.at !== i) continue;
          let bx = nx;
          let by = ny;
          let bAngle = angle + br.angleOffset;
          for (let j = 0; j < br.lengths.length; j += 1) {
            const blen = (br.lengths[j] ?? 0.08) * spanScale;
            const bturn = br.turns[j] ?? 0;
            bAngle += bturn;
            const bnx = bx + Math.cos(bAngle) * blen;
            const bny = by + Math.sin(bAngle) * blen * 0.62;
            points.push(bx, by - 0.12, nz, bnx, bny - 0.12, nz);
            bx = bnx;
            by = bny;
          }
        }
      }
      x = nx;
      y = ny;
      z = nz;
    }
  };

  const limitedRoots = template.roots.slice(0, rootLimitByResult[result]);
  for (const root of limitedRoots) appendPath(root);

  const vertices = new Float32Array(points);
  if (vertices.length < 6) return vertices;

  // Normalize deterministic patterns so every verdict spans most of the bone surface.
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i] ?? 0;
    const y = vertices[i + 1] ?? 0;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  const srcW = Math.max(0.001, maxX - minX);
  const srcH = Math.max(0.001, maxY - minY);
  const targetW = 1.9;
  const targetH = 1.08;
  const scale = Math.min(targetW / srcW, targetH / srcH);
  const cx = (minX + maxX) * 0.5;
  const cy = (minY + maxY) * 0.5;

  for (let i = 0; i < vertices.length; i += 3) {
    vertices[i] = ((vertices[i] ?? 0) - cx) * scale;
    vertices[i + 1] = (((vertices[i + 1] ?? 0) - cy) * scale) + yOffsetByResult[result];
  }

  return vertices;
}

function BoneRitualFallback({
  stage,
  crackProgress,
  oracleResult,
  fireOnly = false,
}: {
  stage: RitualStage;
  crackProgress: number;
  oracleResult: BoneOracleResult | null;
  fireOnly?: boolean;
}) {
  const showCracks = stage !== "fire";
  const fallbackVariant = resultToFallbackClass(oracleResult);
  const fireCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!fireCanvasRef.current) return;
    const canvas = fireCanvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let rafId = 0;
    let disposed = false;
    const cols = 96;
    const rows = 140;
    let w = 0;
    let h = 0;
    let cellW = 0;
    let cellH = 0;
    const heat = new Float32Array(cols * rows);
    const next = new Float32Array(cols * rows);

    const resize = () => {
      if (!canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cellW = w / cols;
      cellH = h / rows;
    };

    const update = (time: number) => {
      if (disposed) return;
      const t = time * 0.001;
      const activeStage = stage;
      const fireStrength = activeStage === "fire" ? 1 : Math.max(0.05, 1 - crackProgress * 0.75);

      for (let x = 0; x < cols; x += 1) {
        const pulse = 0.6 + 0.4 * Math.sin(t * 9 + x * 0.45);
        heat[(rows - 1) * cols + x] = (0.65 + Math.random() * 0.35) * pulse * fireStrength;
      }

      for (let y = rows - 2; y >= 0; y -= 1) {
        for (let x = 0; x < cols; x += 1) {
          const idx = y * cols + x;
          const below = (y + 1) * cols + x;
          const left = (y + 1) * cols + ((x - 1 + cols) % cols);
          const right = (y + 1) * cols + ((x + 1) % cols);
          const vertical = heat[below] * (0.58 + Math.random() * 0.08);
          const lateral = (heat[left] + heat[right]) * (0.17 + Math.random() * 0.05);
          const persist = heat[idx] * 0.1;
          const cool = 0.035 + (1 - y / rows) * 0.06;
          next[idx] = Math.max(0, vertical + lateral + persist - cool);
        }
      }

      heat.set(next);
      ctx.clearRect(0, 0, w, h);

      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const v = heat[y * cols + x];
          if (v < 0.02) continue;
          const hue = 16 + Math.min(30, (1 - v) * 22);
          const sat = 86;
          const light = 20 + Math.min(60, v * 68);
          const alpha = Math.min(1, v * 1.08) * fireStrength;
          ctx.fillStyle = `hsla(${hue} ${sat}% ${light}% / ${alpha})`;
          ctx.fillRect(x * cellW, y * cellH, cellW + 0.6, cellH + 0.6);
        }
      }

      const emberCount = 28;
      for (let i = 0; i < emberCount; i += 1) {
        const ex = ((i * 37.8 + t * 65 + Math.sin(i * 0.7 + t * 4.2) * 18) % (w + 40)) - 20;
        const ey = h * (0.38 + ((i * 13.7 + t * 34) % 100) / 170);
        const er = 0.8 + ((i * 5.1 + t * 10.4) % 2.2);
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, ${160 + (i % 55)}, 80, ${0.16 * fireStrength})`;
        ctx.arc(ex, ey, er, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = window.requestAnimationFrame(update);
    };

    resize();
    window.addEventListener("resize", resize);
    rafId = window.requestAnimationFrame(update);

    return () => {
      disposed = true;
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [stage, crackProgress]);

  if (fireOnly) {
    return (
      <div className={`bone-ritual-fallback ${fallbackVariant}`}>
        <canvas ref={fireCanvasRef} className="bone-ritual-fallback-fire-canvas" />
      </div>
    );
  }

  return (
    <div className={`bone-ritual-fallback ${fallbackVariant}`}>
      <canvas ref={fireCanvasRef} className="bone-ritual-fallback-fire-canvas" />
      <div className="bone-ritual-fallback-core" />
      <div
        className="bone-ritual-fallback-flame"
        style={{ opacity: stage === "fire" ? 0.95 : Math.max(0, 1 - crackProgress) }}
      />
      {showCracks ? (
        <div className="bone-ritual-fallback-cracks" style={{ opacity: Math.min(1, 0.2 + crackProgress * 0.8) }}>
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      ) : null}
    </div>
  );
}

export default function BoneRitualAnimation({ isProcessing, oracleResult, verdictText = null }: BoneRitualAnimationProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { stage, crackProgress } = useRitualStage(isProcessing, oracleResult);
  const viewportVariant = resultToViewportClass(oracleResult);
  const glyph = verdictGlyph(oracleResult);
  const showVerdictBadge = oracleResult !== null && stage !== "fire" && (glyph.length > 0 || Boolean(verdictText));
  const [webglActive, setWebglActive] = useState(false);

  const stageRef = useRef<RitualStage>(stage);
  const progressRef = useRef(crackProgress);
  const resultRef = useRef<BoneOracleResult | null>(oracleResult);

  useEffect(() => {
    stageRef.current = stage;
    progressRef.current = crackProgress;
    resultRef.current = oracleResult;
  }, [stage, crackProgress, oracleResult]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    let rafId = 0;
    let disposed = false;
    let resizeObserver: ResizeObserver | null = null;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.16;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090402);
    scene.fog = new THREE.FogExp2(0x090402, 0.065);

    const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
    camera.position.set(0, 1.2, 5.4);
    camera.lookAt(0, 0, 0);

    const ambientLight = new THREE.AmbientLight(0x120706, 0.52);
    scene.add(ambientLight);

    const fireLight = new THREE.PointLight(0xff6a19, 2.9, 8);
    fireLight.position.set(0, 1.35, 0);
    scene.add(fireLight);

    const rimLight = new THREE.DirectionalLight(0x2a120a, 1);
    rimLight.position.set(-3, 2, -2);
    scene.add(rimLight);

    const boneGeo = new THREE.SphereGeometry(1.45, 34, 24);
    const arr = boneGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < arr.length; i += 3) {
      arr[i + 1] *= 0.53;
      arr[i] += (Math.random() - 0.5) * 0.05;
      arr[i + 2] += (Math.random() - 0.5) * 0.05;
    }
    boneGeo.computeVertexNormals();
    const boneMat = new THREE.MeshStandardMaterial({
      color: 0xd8bea0,
      roughness: 0.87,
      metalness: 0,
      emissive: 0x261007,
      emissiveIntensity: 0.3,
      transparent: true,
      alphaTest: 0.12,
    });
    const crackMaskCanvas = document.createElement("canvas");
    crackMaskCanvas.width = 1024;
    crackMaskCanvas.height = 1024;
    const crackMaskCtx = crackMaskCanvas.getContext("2d");
    if (crackMaskCtx) {
      crackMaskCtx.fillStyle = "#ffffff";
      crackMaskCtx.fillRect(0, 0, crackMaskCanvas.width, crackMaskCanvas.height);
    }
    const crackMaskTexture = new THREE.CanvasTexture(crackMaskCanvas);
    crackMaskTexture.needsUpdate = true;
    boneMat.alphaMap = crackMaskTexture;
    const bone = new THREE.Mesh(boneGeo, boneMat);
    bone.scale.setScalar(1.18);
    bone.position.y = -0.08;
    bone.visible = !FIRE_ONLY_DEBUG;
    scene.add(bone);

    const vesselProfile = [
      new THREE.Vector2(0.2, -0.1),
      new THREE.Vector2(0.94, 0),
      new THREE.Vector2(1.62, 0.28),
      new THREE.Vector2(1.9, 0.56),
      new THREE.Vector2(1.98, 0.82),
      new THREE.Vector2(1.82, 1.02),
      new THREE.Vector2(1.34, 1.16),
    ];
    const vesselGeo = new THREE.LatheGeometry(vesselProfile, 56);
    const vesselMat = new THREE.MeshStandardMaterial({
      color: 0x1a0c06,
      roughness: 0.92,
      metalness: 0.05,
      side: THREE.DoubleSide,
      emissive: 0x120804,
      emissiveIntensity: 0.12,
    });
    const vessel = new THREE.Mesh(vesselGeo, vesselMat);
    vessel.position.y = -1.96;
    vessel.visible = !FIRE_ONLY_DEBUG;
    scene.add(vessel);

    const vesselRimGeo = new THREE.TorusGeometry(1.9, 0.085, 14, 72);
    const vesselRimMat = new THREE.MeshStandardMaterial({
      color: 0x2a140c,
      roughness: 0.72,
      metalness: 0.12,
      emissive: 0x3a1708,
      emissiveIntensity: 0.18,
    });
    const vesselRim = new THREE.Mesh(vesselRimGeo, vesselRimMat);
    vesselRim.rotation.x = Math.PI / 2;
    vesselRim.position.y = -0.8;
    vesselRim.visible = !FIRE_ONLY_DEBUG;
    scene.add(vesselRim);

    const emberBedGeo = new THREE.CircleGeometry(1.56, 48);
    const emberBedMat = new THREE.MeshStandardMaterial({
      color: 0x2a0f08,
      roughness: 0.96,
      metalness: 0,
      emissive: 0xff6b1a,
      emissiveIntensity: 0.18,
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide,
    });
    const emberBed = new THREE.Mesh(emberBedGeo, emberBedMat);
    emberBed.rotation.x = -Math.PI / 2;
    emberBed.position.y = -0.84;
    emberBed.renderOrder = 6;
    emberBed.visible = !FIRE_ONLY_DEBUG;
    scene.add(emberBed);

    const flameTexture = createFlameTexture();
    const FLAME_PARTICLE_COUNT = 190;
    const flamePositions = new Float32Array(FLAME_PARTICLE_COUNT * 3);
    const flameSizes = new Float32Array(FLAME_PARTICLE_COUNT);
    const flameAngles = new Float32Array(FLAME_PARTICLE_COUNT);
    const flameColors = new Float32Array(FLAME_PARTICLE_COUNT * 4);
    const flameGeo = new THREE.BufferGeometry();
    flameGeo.setAttribute("position", new THREE.BufferAttribute(flamePositions, 3));
    flameGeo.setAttribute("size", new THREE.BufferAttribute(flameSizes, 1));
    flameGeo.setAttribute("angle", new THREE.BufferAttribute(flameAngles, 1));
    flameGeo.setAttribute("aColor", new THREE.BufferAttribute(flameColors, 4));
    const flameMat = new THREE.ShaderMaterial({
      uniforms: {
        diffuseTexture: { value: flameTexture },
        pointMultiplier: { value: 1 },
      },
      vertexShader: FIRE_PARTICLE_VS,
      fragmentShader: FIRE_PARTICLE_FS,
      transparent: true,
      depthTest: FIRE_ONLY_DEBUG ? false : true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const flamePoints = new THREE.Points(flameGeo, flameMat);
    flamePoints.renderOrder = 15;
    scene.add(flamePoints);

    const flameParticles: Array<{
      position: THREE.Vector3;
      velocity: THREE.Vector3;
      size: number;
      currentSize: number;
      alpha: number;
      color: THREE.Color;
      life: number;
      maxLife: number;
      rotation: number;
      rotationRate: number;
    }> = [];
    let spawnAccumulator = 0;
    let seededBurstDone = false;

    const alphaSpline = getLinearSpline<number>((t, a, b) => a + t * (b - a));
    alphaSpline.addPoint(0.0, 0.26);
    alphaSpline.addPoint(0.6, 1.0);
    alphaSpline.addPoint(1.0, 0.0);

    const sizeSpline = getLinearSpline<number>((t, a, b) => a + t * (b - a));
    sizeSpline.addPoint(0.0, 0.34);
    sizeSpline.addPoint(1.0, 1.0);

    const colorSpline = getLinearSpline<THREE.Color>((t, a, b) => a.clone().lerp(b, t));
    colorSpline.addPoint(0.0, new THREE.Color(0xffffff));
    colorSpline.addPoint(1.0, new THREE.Color(0xff8080));

    let crackCoreVerts: Float32Array | null = null;
    let crackEdgeNormals: Float32Array | null = null;
    let crackSegmentCount = 0;
    let crackOpeningFactor = 1;
    let currentCrackResult: BoneOracleResult | null = null;

    const applyCracks = (result: BoneOracleResult) => {
      const template = crackPatternTemplate(result);
      crackOpeningFactor = template.opening;
      const verts = buildCrackLineVertices(result);
      crackCoreVerts = verts;
      crackSegmentCount = Math.floor(verts.length / 6);
      crackEdgeNormals = new Float32Array(verts.length);
      for (let i = 0; i < verts.length; i += 6) {
        const ax = verts[i] ?? 0;
        const ay = verts[i + 1] ?? 0;
        const bx = verts[i + 3] ?? 0;
        const by = verts[i + 4] ?? 0;
        const dx = bx - ax;
        const dy = by - ay;
        const len = Math.max(0.0001, Math.hypot(dx, dy));
        const nx = -dy / len;
        const ny = dx / len;
        crackEdgeNormals[i] = nx;
        crackEdgeNormals[i + 1] = ny;
        crackEdgeNormals[i + 2] = 0;
        crackEdgeNormals[i + 3] = nx;
        crackEdgeNormals[i + 4] = ny;
        crackEdgeNormals[i + 5] = 0;
      }

      const colors = crackColorForResult(result);
      void colors;
      currentCrackResult = result;
    };

    const resize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      flameMat.uniforms.pointMultiplier.value = h / (2 * Math.tan((camera.fov * Math.PI) / 360));
    };
    resize();
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(containerRef.current);

    setWebglActive(true);
    const clock = new THREE.Timer();

    const animate = () => {
      if (disposed) return;
      const dt = Math.min(0.05, clock.getDelta());
      const t = clock.getElapsedTime();
      const activeStage = stageRef.current;
      const progress = progressRef.current;
      const activeResult = resultRef.current;

      if (!FIRE_ONLY_DEBUG && activeResult && currentCrackResult !== activeResult) {
        applyCracks(activeResult);
      }

      const fireIntensity = FIRE_ONLY_DEBUG ? 1 : activeStage === "fire" ? 1 : Math.max(0.08, 1 - progress * 0.72);
      fireLight.intensity = (2.5 + Math.sin(t * 7.3) * 0.8 + Math.sin(t * 13.7) * 0.4) * fireIntensity;
      fireLight.color.setHSL(0.06 + Math.sin(t * 5) * 0.02, 1, 0.5);
      fireLight.position.x = Math.sin(t * 3.1) * 0.3;
      boneMat.emissiveIntensity = (0.3 + Math.sin(t * 6.2) * 0.1) * fireIntensity;
      vesselMat.emissiveIntensity = 0.08 + 0.12 * fireIntensity;
      vesselRimMat.emissiveIntensity = 0.12 + 0.2 * fireIntensity;
      emberBedMat.emissiveIntensity = 0.06 + 0.45 * fireIntensity;
      bone.rotation.y = Math.sin(t * 0.3) * 0.08;

      flameMat.uniforms.pointMultiplier.value =
        renderer.domElement.height / (2 * Math.tan((camera.fov * Math.PI) / 360));

      const spawnRate = 62 + 58 * fireIntensity;
      spawnAccumulator += dt * spawnRate;
      const burst = seededBurstDone ? 0 : 120;
      const toSpawn = burst + Math.floor(spawnAccumulator);
      seededBurstDone = true;
      spawnAccumulator -= toSpawn;
      for (let i = 0; i < toSpawn && flameParticles.length < FLAME_PARTICLE_COUNT; i += 1) {
        const ringAngle = Math.random() * Math.PI * 2;
        const radius = 0.45 + Math.random() * 1.05;
        const x = Math.cos(ringAngle) * radius * 0.86;
        const z = Math.sin(ringAngle) * radius * 0.72;
        const radialBoostX = Math.cos(ringAngle) * (0.08 + Math.random() * 0.18);
        const radialBoostZ = Math.sin(ringAngle) * (0.06 + Math.random() * 0.14);
        const maxLife = (Math.random() * 0.75 + 0.25) * 1.5;
        const startingLife = maxLife * (0.32 + Math.random() * 0.55);
        flameParticles.push({
          position: new THREE.Vector3(x, -0.78 + Math.random() * 0.1, z),
          velocity: new THREE.Vector3(radialBoostX, 1.52 + Math.random() * 0.24, radialBoostZ),
          size: (Math.random() * 0.5 + 0.5) * 3.0,
          currentSize: 0,
          alpha: 0,
          color: new THREE.Color(0xffffff),
          life: startingLife,
          maxLife,
          rotation: Math.random() * Math.PI * 2,
          rotationRate: Math.random() * 1.2 - 0.6,
        });
      }

      for (const p of flameParticles) p.life -= dt;
      for (let i = flameParticles.length - 1; i >= 0; i -= 1) {
        if (flameParticles[i] && flameParticles[i].life <= 0) flameParticles.splice(i, 1);
      }

      for (const p of flameParticles) {
        const lifeT = 1 - p.life / p.maxLife;
        p.rotation += p.rotationRate * dt;
        p.alpha = Math.max(0.18, alphaSpline.getValueAt(lifeT)) * (0.26 + 0.74 * fireIntensity);
        p.currentSize = p.size * sizeSpline.getValueAt(lifeT);
        p.color.copy(colorSpline.getValueAt(lifeT));
        p.position.addScaledVector(p.velocity, dt);

        const drag = p.velocity.clone().multiplyScalar(dt * 0.1);
        drag.x = Math.sign(p.velocity.x) * Math.min(Math.abs(drag.x), Math.abs(p.velocity.x));
        drag.y = Math.sign(p.velocity.y) * Math.min(Math.abs(drag.y), Math.abs(p.velocity.y));
        drag.z = Math.sign(p.velocity.z) * Math.min(Math.abs(drag.z), Math.abs(p.velocity.z));
        p.velocity.sub(drag);
      }

      flameParticles.sort((a, b) => camera.position.distanceTo(b.position) - camera.position.distanceTo(a.position));

      for (let i = 0; i < FLAME_PARTICLE_COUNT; i += 1) {
        const p = flameParticles[i];
        if (!p) {
          flamePositions[i * 3] = 0;
          flamePositions[i * 3 + 1] = -10;
          flamePositions[i * 3 + 2] = 0;
          flameSizes[i] = 0;
          flameAngles[i] = 0;
          flameColors[i * 4] = 0;
          flameColors[i * 4 + 1] = 0;
          flameColors[i * 4 + 2] = 0;
          flameColors[i * 4 + 3] = 0;
          continue;
        }
        flamePositions[i * 3] = p.position.x;
        flamePositions[i * 3 + 1] = p.position.y;
        flamePositions[i * 3 + 2] = p.position.z;
        flameSizes[i] = p.currentSize * 1.2;
        flameAngles[i] = p.rotation;
        flameColors[i * 4] = p.color.r;
        flameColors[i * 4 + 1] = p.color.g;
        flameColors[i * 4 + 2] = p.color.b;
        flameColors[i * 4 + 3] = p.alpha;
      }
      (flameGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      (flameGeo.attributes.size as THREE.BufferAttribute).needsUpdate = true;
      (flameGeo.attributes.angle as THREE.BufferAttribute).needsUpdate = true;
      (flameGeo.attributes.aColor as THREE.BufferAttribute).needsUpdate = true;

      if (crackCoreVerts && crackEdgeNormals) {
        const drawSegments = Math.max(1, Math.floor(crackSegmentCount * progress));

        if (crackMaskCtx) {
          crackMaskCtx.fillStyle = "#ffffff";
          crackMaskCtx.fillRect(0, 0, crackMaskCanvas.width, crackMaskCanvas.height);
          crackMaskCtx.lineCap = "round";
          crackMaskCtx.lineJoin = "round";
            const maskWidth = (7 + progress * 17) * crackOpeningFactor;
          crackMaskCtx.strokeStyle = "#000000";
          crackMaskCtx.lineWidth = maskWidth;
          const maxCoord = Math.min(crackCoreVerts.length, drawSegments * 6);
          for (let i = 0; i < maxCoord; i += 6) {
            const ax = crackCoreVerts[i] ?? 0;
            const ay = crackCoreVerts[i + 1] ?? 0;
            const bx = crackCoreVerts[i + 3] ?? 0;
            const by = crackCoreVerts[i + 4] ?? 0;
              const u1 = Math.max(0, Math.min(1, 0.5 + ax / 2.0));
              const v1 = Math.max(0, Math.min(1, 0.5 - ay / 1.06));
              const u2 = Math.max(0, Math.min(1, 0.5 + bx / 2.0));
              const v2 = Math.max(0, Math.min(1, 0.5 - by / 1.06));
            crackMaskCtx.beginPath();
            crackMaskCtx.moveTo(u1 * crackMaskCanvas.width, v1 * crackMaskCanvas.height);
            crackMaskCtx.lineTo(u2 * crackMaskCanvas.width, v2 * crackMaskCanvas.height);
            crackMaskCtx.stroke();
          }
          crackMaskTexture.needsUpdate = true;
        }

        const pulse = activeStage === "reveal" ? 0.5 + 0.5 * Math.sin(t * 4.8) : 0;
        void pulse;
      }

      renderer.render(scene, camera);
      rafId = window.requestAnimationFrame(animate);
    };
    rafId = window.requestAnimationFrame(animate);

    return () => {
      disposed = true;
      if (rafId) window.cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      setWebglActive(false);
      renderer.dispose();
      boneGeo.dispose();
      boneMat.dispose();
      vesselGeo.dispose();
      vesselMat.dispose();
      vesselRimGeo.dispose();
      vesselRimMat.dispose();
      emberBedGeo.dispose();
      emberBedMat.dispose();
      flameGeo.dispose();
      flameMat.dispose();
      flameTexture?.dispose();
      crackMaskTexture.dispose();
      scene.clear();
    };
  }, []);

  return (
    <div ref={containerRef} className={`bone-ritual-viewport ${viewportVariant}`} role="presentation" aria-hidden>
      <canvas ref={canvasRef} className="bone-ritual-canvas" />
      {!webglActive ? (
        <BoneRitualFallback stage={stage} crackProgress={crackProgress} oracleResult={oracleResult} fireOnly={FIRE_ONLY_DEBUG} />
      ) : null}
      {showVerdictBadge && !FIRE_ONLY_DEBUG ? (
        <div className={`bone-ritual-verdict ${verdictBadgeClass(oracleResult)}`}>
          {glyph ? <span className="bone-ritual-verdict-glyph">{glyph}</span> : null}
          {verdictText ? <span className="bone-ritual-verdict-text">{verdictText}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

