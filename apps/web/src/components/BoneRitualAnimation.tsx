"use client";

import { AdaptiveDpr } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import type { OracleBonesVerdict } from "@iching-oracle/oracle-bones-engine";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

export type BoneOracleResult = OracleBonesVerdict;

type BoneRitualAnimationProps = {
  isProcessing: boolean;
  oracleResult: BoneOracleResult | null;
  verdictText?: string | null;
};

type RitualStage = "fire" | "cracks" | "reveal";

const MAX_FIRE_PARTICLES = 180;
const CRACK_FADE_IN_MS = 900;

type CrackSeed = [number, number, number, number, number];
type CrackProfile = {
  seeds: CrackSeed[];
  steps: number;
  branchEvery: number;
  driftScale: number;
  jitter: number;
  branchScale: number;
};

function detectWebglSupport(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

function crackProfileForResult(result: BoneOracleResult): CrackProfile {
  switch (result) {
    case "auspicious_clear":
      return {
        seeds: [
          [0.0, 0.76, 0.0, 0.1, -0.03],
          [-0.06, 0.7, 0.05, 0.16, -0.04],
        ],
        steps: 11,
        branchEvery: 4,
        driftScale: 0.1,
        jitter: 0.012,
        branchScale: 0.05,
      };
    case "auspicious_moderate":
      return {
        seeds: [
          [0.0, 0.74, 0.0, 0.12, -0.08],
          [-0.08, 0.69, 0.04, 0.15, -0.07],
          [0.06, 0.67, -0.04, 0.08, -0.12],
        ],
        steps: 9,
        branchEvery: 3,
        driftScale: 0.11,
        jitter: 0.017,
        branchScale: 0.06,
      };
    case "inauspicious_moderate":
      return {
        seeds: [
          [0.02, 0.72, -0.02, -0.17, -0.12],
          [0.1, 0.68, 0.05, -0.15, -0.19],
          [-0.12, 0.66, 0.02, -0.08, -0.21],
        ],
        steps: 9,
        branchEvery: 3,
        driftScale: 0.12,
        jitter: 0.02,
        branchScale: 0.075,
      };
    case "inauspicious_clear":
      return {
        seeds: [
          [0.0, 0.74, 0.0, -0.22, -0.18],
          [0.12, 0.69, -0.01, -0.23, -0.2],
          [-0.13, 0.66, 0.03, -0.16, -0.24],
          [0.08, 0.64, 0.05, -0.25, -0.08],
        ],
        steps: 10,
        branchEvery: 2,
        driftScale: 0.13,
        jitter: 0.026,
        branchScale: 0.092,
      };
    case "silent":
      return {
        seeds: [
          [0.0, 0.67, 0.0, 0.03, -0.07],
          [-0.06, 0.64, 0.02, -0.04, -0.05],
        ],
        steps: 6,
        branchEvery: 5,
        driftScale: 0.07,
        jitter: 0.01,
        branchScale: 0.03,
      };
  }
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

function generateCrackSegments(result: BoneOracleResult): Array<[THREE.Vector3, THREE.Vector3]> {
  const profile = crackProfileForResult(result);
  const segments: Array<[THREE.Vector3, THREE.Vector3]> = [];
  for (const [sx, sy, sz, driftX, driftZ] of profile.seeds) {
    let x = Number(sx);
    let y = Number(sy);
    let z = Number(sz);
    for (let i = 0; i < profile.steps; i += 1) {
      const nx = x + driftX * profile.driftScale + Math.sin(i * 1.9 + sx * 11) * profile.jitter;
      const ny = y - 0.082 - i * 0.008;
      const nz = z + driftZ * profile.driftScale + Math.cos(i * 1.3 + sy * 5) * profile.jitter;
      segments.push([new THREE.Vector3(x, y, z), new THREE.Vector3(nx, ny, nz)]);

      if (i > 1 && i % profile.branchEvery === profile.branchEvery - 1) {
        const bx = nx + Math.sin(i * 2.1 + sz * 7) * profile.branchScale;
        const bz = nz + Math.cos(i * 1.6 + sx * 9) * profile.branchScale;
        segments.push([new THREE.Vector3(nx, ny, nz), new THREE.Vector3(bx, ny - 0.06, bz)]);
      }
      x = nx;
      y = ny;
      z = nz;
    }
  }
  return segments;
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

function BoneAndFire({
  stage,
  crackProgress,
  oracleResult,
}: {
  stage: RitualStage;
  crackProgress: number;
  oracleResult: BoneOracleResult | null;
}) {
  const boneRef = useRef<THREE.Mesh>(null);
  const fireRef = useRef<THREE.Points>(null);
  const fireLightRef = useRef<THREE.PointLight>(null);
  const cracksRef = useRef<THREE.LineSegments>(null);
  const crackGlowRef = useRef<THREE.LineSegments>(null);
  const burnRef = useRef<THREE.Mesh>(null);

  const fireStrengthTarget = stage === "fire" ? 1 : Math.max(0, 1 - crackProgress);
  const crackStrengthTarget = stage === "fire" ? 0 : crackProgress;

  const particleData = useMemo(() => {
    const positions = new Float32Array(MAX_FIRE_PARTICLES * 3);
    const velocities = new Float32Array(MAX_FIRE_PARTICLES);
    const angleDrift = new Float32Array(MAX_FIRE_PARTICLES);
    const radii = new Float32Array(MAX_FIRE_PARTICLES);
    for (let i = 0; i < MAX_FIRE_PARTICLES; i += 1) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.16 + Math.random() * 0.44;
      radii[i] = radius;
      positions[i3 + 0] = Math.cos(angle) * radius;
      positions[i3 + 1] = -0.38 + Math.random() * 0.5;
      positions[i3 + 2] = Math.sin(angle) * radius * 0.7;
      velocities[i] = 0.25 + Math.random() * 0.45;
      angleDrift[i] = (Math.random() - 0.5) * 1.1;
    }
    return { positions, velocities, angleDrift, radii };
  }, []);

  const fireGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(particleData.positions.slice(), 3));
    return geometry;
  }, [particleData.positions]);

  const boneGeometry = useMemo(() => {
    const geometry = new THREE.SphereGeometry(1, 34, 24);
    const attr = geometry.attributes.position as THREE.BufferAttribute;
    const temp = new THREE.Vector3();
    for (let i = 0; i < attr.count; i += 1) {
      temp.fromBufferAttribute(attr, i);
      temp.y *= 0.56;
      const bump = Math.sin(temp.x * 5.1) * Math.cos(temp.z * 4.4) * 0.04;
      temp.multiplyScalar(1 + bump);
      attr.setXYZ(i, temp.x, temp.y, temp.z);
    }
    attr.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  const crackSegments = useMemo(() => {
    const result = oracleResult ?? "silent";
    return generateCrackSegments(result);
  }, [oracleResult]);

  const crackGeometry = useMemo(() => {
    const vertices = crackSegments.flatMap(([a, b]) => [a.x, a.y, a.z, b.x, b.y, b.z]);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setDrawRange(0, 0);
    return geometry;
  }, [crackSegments]);

  const crackPalette = useMemo(() => {
    if (oracleResult === "auspicious_clear") {
      return { base: "#8f5a28", glow: "#e4b361" };
    }
    if (oracleResult === "auspicious_moderate") {
      return { base: "#7a4f2a", glow: "#c88f53" };
    }
    if (oracleResult === "inauspicious_moderate") {
      return { base: "#72302a", glow: "#bb5d4d" };
    }
    if (oracleResult === "inauspicious_clear") {
      return { base: "#66211d", glow: "#cf4939" };
    }
    return { base: "#5a5143", glow: "#96826a" };
  }, [oracleResult]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (boneRef.current) {
      boneRef.current.rotation.y = Math.sin(t * 0.45) * 0.08;
      boneRef.current.rotation.x = Math.sin(t * 0.33) * 0.035;
    }
    if (burnRef.current) {
      burnRef.current.rotation.y = t * 0.22;
    }
    if (fireLightRef.current) {
      fireLightRef.current.intensity = (1.2 + Math.sin(t * 3.2) * 0.35) * fireStrengthTarget;
      fireLightRef.current.color = new THREE.Color(1, 0.5 + Math.sin(t * 2.1) * 0.08, 0.18);
    }
    if (fireRef.current) {
      const pos = (fireRef.current.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
      for (let i = 0; i < MAX_FIRE_PARTICLES; i += 1) {
        const i3 = i * 3;
        const currentY = pos[i3 + 1] + particleData.velocities[i] * delta * 0.9;
        if (currentY > 0.72) {
          const angle = Math.random() * Math.PI * 2;
          pos[i3 + 0] = Math.cos(angle) * particleData.radii[i];
          pos[i3 + 1] = -0.4 + Math.random() * 0.45;
          pos[i3 + 2] = Math.sin(angle) * particleData.radii[i] * 0.7;
        } else {
          const swirl = Math.sin(t * 2.8 + i * 0.07) * 0.003 + particleData.angleDrift[i] * 0.0008;
          pos[i3 + 0] += swirl;
          pos[i3 + 1] = currentY;
          pos[i3 + 2] += Math.cos(t * 2.4 + i * 0.05) * 0.0025;
        }
      }
      fireRef.current.geometry.attributes.position.needsUpdate = true;
      const mat = fireRef.current.material as THREE.PointsMaterial;
      mat.opacity = 0.12 + fireStrengthTarget * 0.82;
    }
    if (cracksRef.current) {
      const visibleSegments = Math.max(0, Math.floor(crackSegments.length * crackStrengthTarget));
      cracksRef.current.geometry.setDrawRange(0, visibleSegments * 2);
      const material = cracksRef.current.material as THREE.LineBasicMaterial;
      const revealPulse = stage === "reveal" ? 0.5 + 0.5 * Math.sin(t * 3.4) : 0;
      material.opacity = Math.min(1, 0.22 + crackStrengthTarget * 0.62 + revealPulse * 0.16);
    }
    if (crackGlowRef.current) {
      const visibleSegments = Math.max(0, Math.floor(crackSegments.length * crackStrengthTarget));
      crackGlowRef.current.geometry.setDrawRange(0, visibleSegments * 2);
      const material = crackGlowRef.current.material as THREE.LineBasicMaterial;
      const revealPulse = stage === "reveal" ? 0.5 + 0.5 * Math.sin(t * 4.2) : 0;
      material.opacity = stage === "fire" ? 0 : Math.min(0.78, 0.1 + crackStrengthTarget * 0.2 + revealPulse * 0.48);
    }
  });

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[1.6, 2.2, 1.4]} intensity={0.55} color="#fff1d6" />
      <pointLight ref={fireLightRef} position={[0.0, -0.15, 0.2]} distance={5.2} intensity={1.1} color="#ff7a2a" />

      <mesh ref={boneRef} geometry={boneGeometry} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#e0d5c1"
          roughness={0.74}
          metalness={0.02}
          emissive="#2a170a"
          emissiveIntensity={0.12 + fireStrengthTarget * 0.18}
        />
      </mesh>

      <mesh ref={burnRef} rotation={[0.6, 0, 0]} position={[0, -0.06, 0]}>
        <ringGeometry args={[0.32, 0.54, 40]} />
        <meshBasicMaterial color="#ff812f" opacity={0.17 + fireStrengthTarget * 0.28} transparent side={THREE.DoubleSide} />
      </mesh>

      <points ref={fireRef} geometry={fireGeometry} position={[0, 0.04, 0.08]}>
        <pointsMaterial
          size={0.055}
          sizeAttenuation
          transparent
          opacity={0.95}
          depthWrite={false}
          color="#ff8d33"
        />
      </points>

      <lineSegments ref={cracksRef} geometry={crackGeometry}>
        <lineBasicMaterial color={crackPalette.base} transparent opacity={0} />
      </lineSegments>

      <lineSegments ref={crackGlowRef} geometry={crackGeometry}>
        <lineBasicMaterial color={crackPalette.glow} transparent opacity={0} blending={THREE.AdditiveBlending} />
      </lineSegments>
    </>
  );
}

function BoneRitualFallback({
  stage,
  crackProgress,
  oracleResult,
}: {
  stage: RitualStage;
  crackProgress: number;
  oracleResult: BoneOracleResult | null;
}) {
  const showCracks = stage !== "fire";
  const fallbackVariant = resultToFallbackClass(oracleResult);
  return (
    <div className={`bone-ritual-fallback ${fallbackVariant}`}>
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
  const [hasWebgl, setHasWebgl] = useState<boolean>(false);
  const { stage, crackProgress } = useRitualStage(isProcessing, oracleResult);
  const viewportVariant = resultToViewportClass(oracleResult);
  const glyph = verdictGlyph(oracleResult);
  const showVerdictBadge = oracleResult !== null && stage !== "fire" && (glyph.length > 0 || Boolean(verdictText));

  useEffect(() => {
    setHasWebgl(detectWebglSupport());
  }, []);

  return (
    <div className={`bone-ritual-viewport ${viewportVariant}`} role="presentation" aria-hidden>
      {hasWebgl ? (
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.5, 3.05], fov: 40 }}>
          <AdaptiveDpr pixelated />
          <BoneAndFire stage={stage} crackProgress={crackProgress} oracleResult={oracleResult} />
        </Canvas>
      ) : (
        <BoneRitualFallback stage={stage} crackProgress={crackProgress} oracleResult={oracleResult} />
      )}
      {showVerdictBadge ? (
        <div className={`bone-ritual-verdict ${verdictBadgeClass(oracleResult)}`}>
          {glyph ? <span className="bone-ritual-verdict-glyph">{glyph}</span> : null}
          {verdictText ? <span className="bone-ritual-verdict-text">{verdictText}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

