"use client";

import { useEffect, useRef } from "react";
import type { AppLocale } from "@iching-oracle/i18n";
import { HEX_GLYPHS } from "@/lib/marketing/hexagram-glyphs";

type Particle = {
  sx: number;
  sy: number;
  fx: number;
  fy: number;
  tx: number;
  ty: number;
  d: number;
  d2: number;
  ph: number;
  r: number;
  col: string;
};

/**
 * Hero particle animation: ~2200 ink particles that morph through the 64
 * hexagram glyphs. Port of the design-export DCLogic canvas to React.
 *
 * Font note: next/font renames families to hashed names, so the calligraphic
 * family is resolved at runtime from the CSS variable (--font-oracle-cn); the
 * CJK fallback stays "Noto Serif SC" (loaded via @fontsource with its real
 * family name).
 */
export function HexaglifoCanvas({ locale }: { locale: AppLocale }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const localeRef = useRef(locale);
  localeRef.current = locale;

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stopped = false;
    let raf = 0;
    let off: HTMLCanvasElement | null = null;

    // Resolve the real (hashed) calligraphic family name from the CSS var.
    const cnFamilyRaw = getComputedStyle(document.documentElement)
      .getPropertyValue("--font-oracle-cn")
      .trim();
    const cnFamily = cnFamilyRaw ? cnFamilyRaw.split(",")[0].trim().replace(/^"|"$/g, "") : "";

    const hexs = HEX_GLYPHS;
    let w = 0;
    let h = 0;
    let gi = 0;
    let gap = 4;
    const cap = { x: 0, y: 0, size: 15 };
    // Fewer particles on small screens — the anchor is much smaller there.
    const N = window.innerWidth < 900 ? 1200 : 2200;
    const parts: Particle[] = [];
    const mouse = { x: -99999, y: -99999 };

    const fit = () => {
      const dpr = window.devicePixelRatio || 1;
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = Math.max(1, Math.round(w * dpr));
      cv.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const sample = (ch: string, g: number) => {
      if (!off) off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const o = off.getContext("2d", { willReadFrequently: true });
      if (!o) return [{ x: w / 2, y: h / 2 }];
      o.fillStyle = "#fff";
      o.textAlign = "center";
      o.textBaseline = "middle";
      const a = document.getElementById("hexaglifo-anchor");
      const cr = cv.getBoundingClientRect();
      let rx = w * 0.58;
      let ry = h * 0.12;
      let rw = w * 0.36;
      let rh = h * 0.72;
      if (a) {
        const ar = a.getBoundingClientRect();
        rx = ar.left - cr.left;
        ry = ar.top - cr.top;
        rw = ar.width;
        rh = ar.height;
      }
      cap.x = rx + rw / 2;
      // Sit the name just below the glyph (glyph bottom ≈ 0.85·rh), not at the
      // very bottom of the tall anchor, so it stays on screen. Scale the label
      // with the glyph so it reads at large sizes.
      cap.y = ry + rh * 0.92;
      cap.size = Math.max(15, Math.round(rh * 0.021));
      // Glyph fidelity: calligraphy only if it covers every char of the name;
      // otherwise Noto Serif SC (full CJK coverage) so the figure is always
      // the correct library glyph, never tofu.
      let fam = cnFamily ? `400 FSpx "${cnFamily}", serif` : `900 FSpx "Noto Serif SC", serif`;
      try {
        if (cnFamily) {
          for (const chr of ch) {
            if (!document.fonts.check(`400 100px "${cnFamily}"`, chr)) {
              fam = `900 FSpx "Noto Serif SC", serif`;
              break;
            }
          }
        }
      } catch {
        /* ignore */
      }
      let fs = Math.floor(rh * 0.8);
      o.font = fam.replace("FS", String(fs));
      const tw = o.measureText(ch).width;
      if (tw > rw * 0.96) {
        fs = Math.floor((fs * rw * 0.96) / tw);
        o.font = fam.replace("FS", String(fs));
      }
      o.fillText(ch, rx + rw / 2, ry + rh * 0.45);
      const d = o.getImageData(0, 0, w, h).data;
      const out: Array<{ x: number; y: number }> = [];
      for (let y = 0; y < h; y += g) {
        for (let x = 0; x < w; x += g) {
          if (d[(y * w + x) * 4 + 3] > 128) out.push({ x, y });
        }
      }
      return out.length ? out : [{ x: w / 2, y: h / 2 }];
    };

    const assign = (target: Array<{ x: number; y: number }>) => {
      for (const p of parts) {
        const tp = target[(Math.random() * target.length) | 0];
        p.tx = tp.x + (Math.random() - 0.5) * 2;
        p.ty = tp.y + (Math.random() - 0.5) * 2;
      }
    };

    const build = () => {
      fit();
      if (!w || !h) return;
      gap = 4;
      let target = sample(hexs[gi].ch, gap);
      while (target.length > 2400 && gap < 14) {
        gap += 1;
        target = sample(hexs[gi].ch, gap);
      }
      if (!parts.length) {
        for (let i = 0; i < N; i++) {
          const r0 = Math.random();
          parts.push({
            sx: Math.random() * w,
            sy: Math.random() * h,
            fx: 0,
            fy: 0,
            tx: 0,
            ty: 0,
            d: Math.random() * 1.3,
            d2: 0,
            ph: Math.random() * 6.283,
            r: Math.random() < 0.07 ? 1.9 + Math.random() * 1.3 : 1.0 + Math.random() * 1.1,
            col:
              r0 < 0.62
                ? "rgba(245,239,227,"
                : r0 < 0.82
                  ? "rgba(214,202,182,"
                  : r0 < 0.94
                    ? "rgba(201,162,75,"
                    : "rgba(197,61,46,",
          });
        }
      } else {
        for (const p of parts) {
          p.sx = Math.random() * w;
          p.sy = Math.random() * h;
        }
      }
      assign(target);
    };

    const onResize = () => build();
    const onMove = (e: MouseEvent) => {
      const r = cv.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };

    // Re-sample the anchor (position only, no re-scatter, no canvas resize) so
    // particles retarget to the new spot. Used when the layout shifts sides
    // without a resize event (e.g. an LTR/RTL flip).
    const reposition = () => {
      if (!w || !h) return;
      assign(sample(hexs[gi].ch, gap || 5));
    };

    // A language switch (e.g. ↔ Arabic) flips the page LTR/RTL and moves the
    // hexagram anchor to the opposite side. The canvas gets no resize event, so
    // without this the glyph lingers at its old position and collides with the
    // copy until the next morph. Re-sample across a few frames while the RTL
    // flip + RSC refresh settle.
    const onLocaleChange = () => {
      let tries = 0;
      const redo = () => {
        if (stopped) return;
        reposition();
        if (++tries < 6) window.setTimeout(redo, 90);
      };
      requestAnimationFrame(redo);
    };

    const easeOut = (k: number) => 1 - Math.pow(1 - k, 3);
    let t = 0;
    let pt = 0;
    let phase: "in" | "out" = "in";
    const IN_T = 7.6;
    const OUT_T = 3.2;

    const tick = () => {
      if (stopped) return;
      t += 0.0166;
      pt += 0.0166;
      if (phase === "in" && pt > IN_T) {
        phase = "out";
        pt = 0;
        for (const p of parts) {
          p.d2 = Math.random() * 0.7;
          p.fx = Math.random() * w;
          p.fy = Math.random() * h;
        }
      } else if (phase === "out" && pt > OUT_T) {
        gi = (gi + 1) % hexs.length;
        const target = sample(hexs[gi].ch, gap || 5);
        for (const p of parts) {
          p.sx = p.fx;
          p.sy = p.fy;
          p.d = Math.random() * 1.2;
        }
        assign(target);
        phase = "in";
        pt = 0;
      }
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        let e: number;
        if (phase === "in") {
          e = easeOut(Math.max(0, Math.min(1, (pt - p.d) / 2.0)));
        } else {
          e = 1 - easeOut(Math.max(0, Math.min(1, (pt - p.d2) / 1.7)));
        }
        const bx = phase === "in" ? p.sx : p.fx;
        const by = phase === "in" ? p.sy : p.fy;
        let hx = 0;
        let hy = 0;
        const dxm = p.tx - mouse.x;
        const dym = p.ty - mouse.y;
        const dm2 = dxm * dxm + dym * dym;
        if (dm2 < 4900) {
          const dm = Math.sqrt(dm2) || 1;
          const f = (1 - dm / 70) * 13;
          hx = (dxm / dm) * f;
          hy = (dym / dm) * f;
        }
        const wob = e * 1.5 + (1 - e) * 7;
        const x = bx + (p.tx - bx) * e + Math.sin(t * 1.3 + p.ph) * wob + hx;
        const y = by + (p.ty - by) * e + Math.cos(t * 1.1 + p.ph) * wob + hy;
        const al = (0.3 + 0.5 * (0.5 + 0.5 * Math.sin(t * 2.1 + p.ph))) * (0.42 + 0.58 * e);
        ctx.fillStyle = p.col + al + ")";
        ctx.beginPath();
        ctx.arc(x, y, p.r * (0.8 + 0.5 * e), 0, 6.283);
        ctx.fill();
      }
      const g = hexs[gi];
      let capA: number;
      if (phase === "in") capA = Math.max(0, Math.min(1, (pt - 2.1) / 0.8));
      else capA = Math.max(0, 1 - pt / 0.5);
      if (capA > 0) {
        const name = localeRef.current === "es" ? g.es : g.en;
        ctx.fillStyle = `rgba(180,168,148,${capA * 0.95})`;
        ctx.font = `${cap.size}px system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(`${g.n} · ${g.ch} ${g.pin} · ${name}`, cap.x, cap.y);
      }
      raf = requestAnimationFrame(tick);
    };

    const start = async () => {
      try {
        const allText = hexs.map((x) => x.ch).join("");
        const loads = [document.fonts.load('900 300px "Noto Serif SC"', allText)];
        if (cnFamily) loads.push(document.fonts.load(`400 300px "${cnFamily}"`, allText));
        await Promise.all(loads);
      } catch {
        /* ignore */
      }
      if (stopped) return;
      build();
      let guard = 0;
      while ((!w || !h) && !stopped && guard < 120) {
        await new Promise((res) => requestAnimationFrame(res));
        build();
        guard++;
      }
      if (stopped) return;
      if (reduceMotion) {
        // Static single frame: draw the current glyph's particles at rest.
        ctx.clearRect(0, 0, w, h);
        for (const p of parts) {
          ctx.fillStyle = p.col + "0.8)";
          ctx.beginPath();
          ctx.arc(p.tx, p.ty, p.r, 0, 6.283);
          ctx.fill();
        }
        return;
      }
      window.addEventListener("resize", onResize);
      window.addEventListener("mousemove", onMove);
      window.addEventListener("iching:locale-changed", onLocaleChange);
      raf = requestAnimationFrame(tick);
    };

    void start();

    return () => {
      stopped = true;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("iching:locale-changed", onLocaleChange);
    };
  }, []);

  return <canvas ref={canvasRef} className="mk-hero-canvas" aria-hidden="true" />;
}
