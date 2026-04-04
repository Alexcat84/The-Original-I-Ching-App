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

const PARTICLES_CONTAINER_ID = "ambient-particles-fullscreen";

function buildParticlesConfig(theme: ParticleTheme) {
  const isDark = theme === "dark";
  const particleColor = isDark ? "#b7dbf1" : "#175f8c";
  const lineColor = isDark ? "#8cb6d1" : "#2a6f9b";

  return {
    particles: {
      number: { value: 168, density: { enable: true, value_area: 900 } },
      color: { value: particleColor },
      shape: { type: "circle" },
      opacity: { value: isDark ? 0.62 : 0.62, random: true },
      size: { value: isDark ? 3.6 : 3.4, random: true },
      line_linked: {
        enable: true,
        distance: 160,
        color: lineColor,
        opacity: isDark ? 0.38 : 0.34,
        width: isDark ? 1.35 : 1.2,
      },
      move: {
        enable: true,
        speed: isDark ? 2.35 : 2.1,
        direction: "none",
        random: true,
        straight: false,
        out_mode: "out",
        bounce: false,
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: true, mode: "repulse" },
        onclick: { enable: false, mode: "push" },
        resize: true,
      },
      modes: {
        repulse: {
          distance: 90,
          duration: 0.42,
        },
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
  const domEntries = Array.isArray(w.pJSDom) ? w.pJSDom : [];
  for (let i = domEntries.length - 1; i >= 0; i -= 1) {
    const entry = domEntries[i];
    const host = entry?.pJS?.canvas?.el?.parentElement;
    if (host?.id === containerId) {
      domEntries.splice(i, 1);
    }
  }
  w.pJSDom = domEntries;
  (globalThis as { pJSDom?: ParticlesDomEntry[] }).pJSDom = domEntries;
  const host = document.getElementById(containerId);
  if (host) host.innerHTML = "";
}

function ensureParticlesGlobals(w: ParticlesWindow): void {
  if (!Array.isArray(w.pJSDom)) {
    w.pJSDom = [];
  }
  (globalThis as { pJSDom?: ParticlesDomEntry[] }).pJSDom = w.pJSDom;
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
      ensureParticlesGlobals(w);

      destroyParticlesByContainerId(PARTICLES_CONTAINER_ID);

      const host = document.getElementById(PARTICLES_CONTAINER_ID);
      if (!host) return;

      const configWithWindowDetection = {
        ...config,
        interactivity: {
          ...config.interactivity,
          detect_on: "window",
        },
      };

      w.particlesJS(PARTICLES_CONTAINER_ID, configWithWindowDetection);
    };
    void mount();
    return () => {
      cancelled = true;
      destroyParticlesByContainerId(PARTICLES_CONTAINER_ID);
    };
  }, [config]);

  return (
    <div className={`ambient-particles-layer ambient-particles-layer--${theme}`} aria-hidden="true">
      <div id={PARTICLES_CONTAINER_ID} className="ambient-particles-pane ambient-particles-pane--full" />
    </div>
  );
}
