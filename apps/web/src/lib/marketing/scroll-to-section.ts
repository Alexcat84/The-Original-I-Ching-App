"use client";

/** Height of the sticky marketing header, subtracted so sections aren't hidden. */
export const NAV_HEADER_OFFSET = 88;

/** Debug logging toggled by ?navdebug=1 or localStorage mk_nav_debug=1. */
export function navDebugEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (new URLSearchParams(window.location.search).has("navdebug")) return true;
    return window.localStorage.getItem("mk_nav_debug") === "1";
  } catch {
    return false;
  }
}

export function navLog(...args: unknown[]): void {
  if (navDebugEnabled()) {
    // eslint-disable-next-line no-console
    console.log("%c[nav]", "color:#c53d2e;font-weight:600", ...args);
  }
}

function targetTop(id: string): number | null {
  const el = document.getElementById(id);
  if (!el) return null;
  return Math.max(0, el.getBoundingClientRect().top + window.scrollY - NAV_HEADER_OFFSET);
}

/**
 * Scroll to a section id and KEEP it correct as the page above settles.
 *
 * The reported bug is a race: on a cross-page hash landing (or a click before
 * fonts/canvas/late sections have their final height), the anchor's measured
 * position is too high, so the jump lands near the top (Oráculo). We re-measure
 * and re-correct at escalating delays — the first move is smooth, later
 * corrections snap only if the target actually moved — so the section ends up
 * under the header without a second click. Also waits on document.fonts.ready.
 */
export function scrollToSection(id: string): void {
  const first = targetTop(id);
  if (first === null) {
    navLog("scrollToSection: element not found", id);
    return;
  }
  navLog("scrollToSection", id, "targetY", first, "from scrollY", Math.round(window.scrollY));
  window.scrollTo({ top: first, behavior: "smooth" });

  const correct = (label: string, instant: boolean) => {
    const want = targetTop(id);
    if (want === null) return;
    const cur = Math.round(window.scrollY);
    if (Math.abs(cur - want) > 8) {
      navLog(label, id, "correct: want", want, "cur", cur, instant ? "(instant)" : "(smooth)");
      window.scrollTo({ top: want, behavior: instant ? "auto" : "smooth" });
    } else {
      navLog(label, id, "ok at", cur);
    }
  };

  // Escalating re-checks: layout typically settles within ~1s (fonts, canvas,
  // section mounts). Late ones are instant so they always land the section.
  [120, 300, 550, 850, 1200].forEach((d) => {
    window.setTimeout(() => correct(`retry@${d}ms`, d >= 550), d);
  });

  // Fonts finishing can reflow heights after our timers — re-check then too.
  try {
    document.fonts?.ready?.then(() => correct("fonts.ready", true));
  } catch {
    /* ignore */
  }
}
