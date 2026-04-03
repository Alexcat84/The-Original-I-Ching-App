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
const FIRE_PARTICLES = 180;
const EMBER_PARTICLES = 42;

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
  if (result === "auspicious_clear") return { base: 0xc0843a, glow: 0xffd177 };
  if (result === "auspicious_moderate") return { base: 0x9f6f39, glow: 0xeab067 };
  if (result === "inauspicious_moderate") return { base: 0x8d382f, glow: 0xdb6954 };
  if (result === "inauspicious_clear") return { base: 0x7a221f, glow: 0xff4432 };
  return { base: 0x6f6150, glow: 0xb8a18b };
}

function crackPatternSpec(result: BoneOracleResult) {
  switch (result) {
    case "auspicious_clear":
      return { count: 4, steps: 8, spread: 0.5, branchChance: 0.22, jagged: 0.2, driftBias: 0.08 };
    case "auspicious_moderate":
      return { count: 6, steps: 8, spread: 0.7, branchChance: 0.28, jagged: 0.3, driftBias: 0.04 };
    case "inauspicious_moderate":
      return { count: 7, steps: 9, spread: 0.82, branchChance: 0.38, jagged: 0.38, driftBias: -0.02 };
    case "inauspicious_clear":
      return { count: 10, steps: 10, spread: 1.0, branchChance: 0.5, jagged: 0.5, driftBias: -0.06 };
    case "silent":
      return { count: 3, steps: 6, spread: 0.45, branchChance: 0.08, jagged: 0.14, driftBias: 0 };
  }
}

function buildCrackLineVertices(result: BoneOracleResult): Float32Array {
  const spec = crackPatternSpec(result);
  const points: number[] = [];
  for (let c = 0; c < spec.count; c += 1) {
    const angle = (c / spec.count) * Math.PI * 2 + (Math.random() - 0.5) * spec.spread;
    const len = 0.35 + Math.random() * 0.72;
    let x = (Math.random() - 0.5) * 0.22;
    let y = (Math.random() - 0.5) * 0.16;
    let z = 1.33;
    for (let s = 0; s < spec.steps; s += 1) {
      const nx =
        x + Math.cos(angle + (Math.random() - 0.5) * spec.jagged) * (len / spec.steps) + spec.driftBias * 0.01 * s;
      const ny = y + Math.sin(angle + (Math.random() - 0.5) * spec.jagged) * (len / spec.steps) * 0.56;
      const nz = z + (Math.random() - 0.5) * 0.01;
      points.push(x, y - 0.12, z, nx, ny - 0.12, nz);
      if (Math.random() < spec.branchChance && s > 1) {
        const bx = nx + (Math.random() - 0.5) * 0.12;
        const by = ny + (Math.random() - 0.5) * 0.08;
        points.push(nx, ny - 0.12, nz, bx, by - 0.12, nz);
      }
      x = nx;
      y = ny;
      z = nz;
    }
  }
  return new Float32Array(points);
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
    });
    const bone = new THREE.Mesh(boneGeo, boneMat);
    bone.position.y = -0.18;
    scene.add(bone);

    const baseGeo = new THREE.CylinderGeometry(2, 2.22, 0.3, 32);
    const base = new THREE.Mesh(baseGeo, new THREE.MeshStandardMaterial({ color: 0x140803, roughness: 1 }));
    base.position.y = -1.18;
    scene.add(base);

    const pPositions = new Float32Array(FIRE_PARTICLES * 3);
    const pData = Array.from({ length: FIRE_PARTICLES }, () => ({
      x: (Math.random() - 0.5) * 1.2,
      y: Math.random() * 3,
      vy: 0.015 + Math.random() * 0.025,
      vx: (Math.random() - 0.5) * 0.01,
      life: Math.random(),
      maxLife: 0.6 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
    }));
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xff8800,
      size: 0.22,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    const ePositions = new Float32Array(EMBER_PARTICLES * 3);
    const eData = Array.from({ length: EMBER_PARTICLES }, () => ({
      x: (Math.random() - 0.5) * 0.8,
      y: Math.random() * 2,
      vy: 0.02 + Math.random() * 0.03,
      vx: (Math.random() - 0.5) * 0.015,
      life: Math.random(),
      phase: Math.random() * Math.PI * 2,
    }));
    const eGeo = new THREE.BufferGeometry();
    eGeo.setAttribute("position", new THREE.BufferAttribute(ePositions, 3));
    const eMat = new THREE.PointsMaterial({
      color: 0xffdd44,
      size: 0.06,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const embers = new THREE.Points(eGeo, eMat);
    scene.add(embers);

    let crackLines: THREE.LineSegments | null = null;
    let crackGlowLines: THREE.LineSegments | null = null;
    let currentCrackResult: BoneOracleResult | null = null;

    const applyCracks = (result: BoneOracleResult) => {
      if (crackLines) {
        scene.remove(crackLines);
        crackLines.geometry.dispose();
        (crackLines.material as THREE.Material).dispose();
      }
      if (crackGlowLines) {
        scene.remove(crackGlowLines);
        crackGlowLines.geometry.dispose();
        (crackGlowLines.material as THREE.Material).dispose();
      }
      const verts = buildCrackLineVertices(result);
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute("position", new THREE.BufferAttribute(verts, 3));
      lineGeo.setDrawRange(0, 0);
      const colors = crackColorForResult(result);
      const lineMat = new THREE.LineBasicMaterial({ color: colors.base, transparent: true, opacity: 0 });
      const glowMat = new THREE.LineBasicMaterial({
        color: colors.glow,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      });
      crackLines = new THREE.LineSegments(lineGeo, lineMat);
      crackGlowLines = new THREE.LineSegments(lineGeo.clone(), glowMat);
      scene.add(crackLines);
      scene.add(crackGlowLines);
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
    };
    resize();
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(containerRef.current);

    setWebglActive(true);
    const clock = new THREE.Clock();

    const animate = () => {
      if (disposed) return;
      const t = clock.getElapsedTime();
      const activeStage = stageRef.current;
      const progress = progressRef.current;
      const activeResult = resultRef.current;

      if (activeResult && currentCrackResult !== activeResult) {
        applyCracks(activeResult);
      }

      const fireIntensity = activeStage === "fire" ? 1 : Math.max(0.08, 1 - progress * 0.72);
      fireLight.intensity = (2.5 + Math.sin(t * 7.3) * 0.8 + Math.sin(t * 13.7) * 0.4) * fireIntensity;
      fireLight.color.setHSL(0.06 + Math.sin(t * 5) * 0.02, 1, 0.5);
      fireLight.position.x = Math.sin(t * 3.1) * 0.3;
      boneMat.emissiveIntensity = (0.3 + Math.sin(t * 6.2) * 0.1) * fireIntensity;
      bone.rotation.y = Math.sin(t * 0.3) * 0.08;

      for (let i = 0; i < FIRE_PARTICLES; i += 1) {
        const p = pData[i];
        p.phase += 0.06;
        p.x += p.vx + Math.sin(p.phase) * 0.008;
        p.y += p.vy;
        p.life += 0.016;
        if (p.life > p.maxLife) {
          p.life = 0;
          p.x = (Math.random() - 0.5) * 1.0;
          p.y = -0.2;
          p.vy = 0.015 + Math.random() * 0.025;
          p.vx = (Math.random() - 0.5) * 0.01;
        }
        pPositions[i * 3] = p.x;
        pPositions[i * 3 + 1] = p.y;
        pPositions[i * 3 + 2] = 0;
      }
      pGeo.attributes.position.needsUpdate = true;
      pMat.opacity = Math.max(0.05, 0.9 * fireIntensity);
      pMat.color.setHSL(0.07 - Math.sin(t * 4) * 0.02, 1, 0.52);

      for (let i = 0; i < EMBER_PARTICLES; i += 1) {
        const e = eData[i];
        e.phase += 0.05;
        e.x += e.vx + Math.sin(e.phase) * 0.006;
        e.y += e.vy;
        e.life += 0.018;
        if (e.life > 1) {
          e.life = 0;
          e.x = (Math.random() - 0.5) * 0.8;
          e.y = -0.1;
          e.vy = 0.02 + Math.random() * 0.03;
          e.vx = (Math.random() - 0.5) * 0.015;
        }
        ePositions[i * 3] = e.x;
        ePositions[i * 3 + 1] = e.y;
        ePositions[i * 3 + 2] = 0.1;
      }
      eGeo.attributes.position.needsUpdate = true;
      eMat.opacity = Math.max(0.05, 0.94 * fireIntensity);

      if (crackLines && crackGlowLines) {
        const baseMat = crackLines.material as THREE.LineBasicMaterial;
        const glowMat = crackGlowLines.material as THREE.LineBasicMaterial;
        const totalSegments = (crackLines.geometry.attributes.position as THREE.BufferAttribute).count / 2;
        const drawSegments = Math.max(1, Math.floor(totalSegments * progress));
        crackLines.geometry.setDrawRange(0, drawSegments * 2);
        crackGlowLines.geometry.setDrawRange(0, drawSegments * 2);
        const pulse = activeStage === "reveal" ? 0.5 + 0.5 * Math.sin(t * 4.8) : 0;
        baseMat.opacity = Math.min(1, 0.15 + progress * 0.75 + pulse * 0.1);
        glowMat.opacity = Math.min(0.95, 0.08 + progress * 0.55 + pulse * 0.32);
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
      baseGeo.dispose();
      (base.material as THREE.Material).dispose();
      pGeo.dispose();
      pMat.dispose();
      eGeo.dispose();
      eMat.dispose();
      if (crackLines) {
        crackLines.geometry.dispose();
        (crackLines.material as THREE.Material).dispose();
      }
      if (crackGlowLines) {
        crackGlowLines.geometry.dispose();
        (crackGlowLines.material as THREE.Material).dispose();
      }
      scene.clear();
    };
  }, []);

  return (
    <div ref={containerRef} className={`bone-ritual-viewport ${viewportVariant}`} role="presentation" aria-hidden>
      <canvas ref={canvasRef} className="bone-ritual-canvas" />
      {!webglActive ? <BoneRitualFallback stage={stage} crackProgress={crackProgress} oracleResult={oracleResult} /> : null}
      {showVerdictBadge ? (
        <div className={`bone-ritual-verdict ${verdictBadgeClass(oracleResult)}`}>
          {glyph ? <span className="bone-ritual-verdict-glyph">{glyph}</span> : null}
          {verdictText ? <span className="bone-ritual-verdict-text">{verdictText}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

