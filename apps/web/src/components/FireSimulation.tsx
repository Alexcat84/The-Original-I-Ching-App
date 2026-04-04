"use client";

import { useEffect, useMemo, useRef } from "react";

type FireSimulationProps = {
  width: number;
  height: number;
  intensity: number;
  active: boolean;
  className?: string;
  smooth?: boolean;
};

const TICK_MS = 16;

function blendingFunc(t: number): number {
  if (t > 0.8) return t * 1.05;
  if (t < 0.2 && t > 0.1) return t * 0.98;
  return t;
}

function makeColor(n: number): [number, number, number, number] {
  return [255, Math.min(n * 1.2, 255), Math.min(255, Math.max(n - 175, 1) * 4), n];
}

function createGrid(width: number, height: number): number[][] {
  return Array.from({ length: height }, () => Array.from({ length: width }, () => 0));
}

export default function FireSimulation({
  width,
  height,
  intensity,
  active,
  className,
  smooth = true,
}: FireSimulationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const msRef = useRef(0);
  const gridRef = useRef<number[][]>(createGrid(width, height));
  const flipGridRef = useRef<number[][]>(createGrid(width, height));
  const previousTimeRef = useRef<number | null>(null);

  const palette = useMemo(() => Array.from({ length: 256 }, (_, i) => makeColor(i)), []);

  useEffect(() => {
    gridRef.current = createGrid(width, height);
    flipGridRef.current = createGrid(width, height);
    msRef.current = 0;
    previousTimeRef.current = null;
  }, [width, height]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let rafId = 0;
    let disposed = false;
    const simCanvas = document.createElement("canvas");
    simCanvas.width = width;
    simCanvas.height = height;
    const simCtx = simCanvas.getContext("2d", { alpha: true });
    if (!simCtx) return;
    let viewW = 0;
    let viewH = 0;

    const resize = () => {
      if (!canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      viewW = Math.max(1, Math.floor(rect.width));
      viewH = Math.max(1, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(viewW * dpr);
      canvas.height = Math.floor(viewH * dpr);
      canvas.style.width = `${viewW}px`;
      canvas.style.height = `${viewH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const processLine = (
      target: number[],
      lower: number[] | null,
      middle: number[],
      upper: number[] | null,
      options: {
        ascent: number;
        yvariation: number;
        xinfluence: number;
        xvariation: number;
        yinfluence: number;
        cellpersistency: number;
        normalizer: number;
      },
    ) => {
      const { ascent, yvariation, xinfluence, xvariation, yinfluence, cellpersistency, normalizer } = options;
      for (let x = 0; x < target.length; x += 1) {
        let sum = 0;
        const ybias = ascent + yvariation * (Math.random() - (1 - ascent));
        const topbias = ybias * yinfluence;
        const bottombias = (1 - topbias) * yinfluence;
        const middlebias = 0.5;
        const xbias = 0.5 + xvariation * (Math.random() - 0.5);
        const leftbias = xbias * xinfluence;
        const rightbias = (1 - xbias) * xinfluence;
        const centerbias = 0.5;

        if (lower) {
          sum +=
            (leftbias * (lower[x - 1] || 0) + (lower[x] || 0) * centerbias + rightbias * (lower[x + 1] || 0)) *
            topbias;
        }
        sum += (leftbias * (middle[x - 1] || 0) + rightbias * (middle[x + 1] || 0)) * middlebias;
        if (upper) {
          sum +=
            (leftbias * (upper[x + 1] || 0) + (upper[x] || 0) * centerbias + rightbias * (upper[x - 1] || 0)) *
            bottombias;
        }
        sum += middle[x] * cellpersistency;
        target[x] = blendingFunc((1 / 3) * normalizer * sum);
      }
    };

    const frame = (time: number) => {
      if (disposed) return;
      const prev = previousTimeRef.current ?? time;
      const diff = time - prev;
      previousTimeRef.current = time;

      const simulationIntensity = active ? Math.max(0, Math.min(1, intensity)) : 0;
      const xvariation = 0.47;
      const xinfluence = 0.51;
      const yvariation = 0.57;
      const yinfluence = 1.0;
      const cellpersistency = 0.82;
      const ascent = 0.94;
      const normalizer = 270 / 200;
      const minfuel = 0;
      const maxfuel = (238 / 100) * (0.15 + simulationIntensity * 0.95);

      const grid = gridRef.current;
      const flip = flipGridRef.current;
      msRef.current += diff;

      while (msRef.current > TICK_MS) {
        const length = grid[0].length;
        const margin = Math.round(length * 0.1);
        const fuel = maxfuel - minfuel;
        let newVal = 0;
        const newLine: number[] = [];
        for (let x = 0; x < length; x += 1) {
          if (Math.random() > 0.9 || x === 0) {
            newVal = minfuel + Math.random() * fuel;
          }
          newLine.push(x > margin && x < length - margin && newVal > 0.9 ? newVal : 0);
        }

        for (let y = 0; y < grid.length; y += 1) {
          processLine(flip[y], grid[y - 1] || newLine, grid[y], grid[y + 1] || null, {
            ascent,
            yvariation,
            xinfluence,
            xvariation,
            yinfluence,
            cellpersistency,
            normalizer,
          });
        }

        gridRef.current = flip;
        flipGridRef.current = grid;
        msRef.current -= TICK_MS;
      }

      const currentGrid = gridRef.current;
      const imageData = simCtx.createImageData(width, height);
      const data = imageData.data;

      for (let y = 0; y < currentGrid.length; y += 1) {
        const line = currentGrid[y];
        if (!line) continue;
        for (let x = 0; x < line.length; x += 1) {
          const raw = line[x];
          const safe = Number.isFinite(raw) ? Math.max(0, raw) : 0;
          const n = Math.max(0, Math.min(255, Math.round(safe * 175)));
          const color = palette[n] ?? palette[0];
          const idx = (height - y - 1) * width * 4 + x * 4;
          data[idx + 0] = color[0];
          data[idx + 1] = color[1];
          data[idx + 2] = color[2];
          data[idx + 3] = Math.round(color[3] * simulationIntensity);
        }
      }

      simCtx.putImageData(imageData, 0, 0);
      ctx.clearRect(0, 0, viewW, viewH);
      ctx.imageSmoothingEnabled = smooth;
      if (smooth) {
        ctx.imageSmoothingQuality = "high";
      }
      const targetW = Math.round(viewW * 0.82);
      const targetH = Math.round(viewH * 1.22);
      const targetX = Math.round((viewW - targetW) / 2);
      const targetY = Math.round(viewH - targetH * 1.16);
      ctx.drawImage(simCanvas, targetX, targetY, targetW, targetH);
      rafId = window.requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener("resize", resize);
    rafId = window.requestAnimationFrame(frame);

    return () => {
      disposed = true;
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [active, height, intensity, palette, smooth, width]);

  return <canvas ref={canvasRef} className={className} />;
}

