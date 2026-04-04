"use client";

import { useEffect, useMemo, useState } from "react";

type ParticleTheme = "light" | "dark";

type ParticlesDomEntry = {
  pJS?: {
    canvas?: { el?: HTMLCanvasElement | null };
    fn?: { vendors?: { destroypJS?: () => void } };
  };
};

type ParticlesWindow = Window & {
  particlesJS?: (tagId: string, config: unknown) => void;
  pJSDom?: ParticlesDomEntry[];
};

const LEFT_CONTAINER_ID = "ambient-particles-left";
const RIGHT_CONTAINER_ID = "ambient-particles-right";

function buildParticlesConfig(theme: ParticleTheme) {
  const isDark = theme === "dark";
  const particleColor = isDark ? "#8fb4ca" : "#2f6f90";
  const lineColor = isDark ? "#5f86a0" : "#4b88a8";

  return {
    particles: {
      number: { value: 68, density: { enable: true, value_area: 1200 } },
      color: { value: particleColor },
      shape: { type: "circle" },
      opacity: { value: isDark ? 0.42 : 0.28, random: false },
      size: { value: 2.2, random: true },
      line_linked: {
        enable: true,
        distance: 140,
        color: lineColor,
        opacity: isDark ? 0.26 : 0.19,
        width: 1,
      },
      move: {
        enable: true,
        speed: 1.2,
        direction: "none",
        random: false,
        straight: false,
        out_mode: "out",
        bounce: false,
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: false, mode: "grab" },
        onclick: { enable: false, mode: "push" },
        resize: true,
      },
      modes: {
        grab: { distance: 130, line_linked: { opacity: 0.35 } },
        push: { particles_nb: 3 },
      },
    },
    retina_detect: true,
  };
}

function destroyParticlesByContainerId(containerId: string): void {
  if (typeof window === "undefined") return;
  const w = window as ParticlesWindow;
  const domEntries = w.pJSDom ?? [];
  for (let i = domEntries.length - 1; i >= 0; i -= 1) {
    const entry = domEntries[i];
    const host = entry?.pJS?.canvas?.el?.parentElement;
    if (host?.id === containerId) {
      entry?.pJS?.fn?.vendors?.destroypJS?.();
      domEntries.splice(i, 1);
    }
  }
  const host = document.getElementById(containerId);
  if (host) host.innerHTML = "";
}

export function AmbientParticles() {
  const [theme, setTheme] = useState<ParticleTheme>("dark");
  const config = useMemo(() => buildParticlesConfig(theme), [theme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    const syncTheme = () => {
      const nextTheme = root.dataset.theme === "light" ? "light" : "dark";
      setTheme(nextTheme);
    };
    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const mount = async () => {
      await import("particles.js");
      if (cancelled) return;
      const w = window as ParticlesWindow;
      if (!w.particlesJS) return;

      destroyParticlesByContainerId(LEFT_CONTAINER_ID);
      destroyParticlesByContainerId(RIGHT_CONTAINER_ID);

      w.particlesJS(LEFT_CONTAINER_ID, config);
      w.particlesJS(RIGHT_CONTAINER_ID, config);
    };
    void mount();
    return () => {
      cancelled = true;
      destroyParticlesByContainerId(LEFT_CONTAINER_ID);
      destroyParticlesByContainerId(RIGHT_CONTAINER_ID);
    };
  }, [config]);

  return (
    <div className={`ambient-particles-layer ambient-particles-layer--${theme}`} aria-hidden="true">
      <div id={LEFT_CONTAINER_ID} className="ambient-particles-pane ambient-particles-pane--left" />
      <div id={RIGHT_CONTAINER_ID} className="ambient-particles-pane ambient-particles-pane--right" />
    </div>
  );
}
