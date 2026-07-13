"use client";

import { useEffect, useState } from "react";

/**
 * Marketing routes render a dark-only ink shell, but their app `data-theme`
 * stays "light" (the site never flips the app theme). The theme-based branch
 * below would therefore paint this navigation fallback celeste (#d4ebf5) between
 * marketing pages — the "blue flash" users saw on every page change. Hold the
 * marketing ink (--mk-bg) for those routes instead, so the transition stays a
 * seamless dark-on-dark hold. App surfaces (/chat, /login, /library…) keep the
 * theme-aware colour. Keep this list in sync with the marketing pages.
 */
const MARKETING_PATHS = new Set([
  "/",
  "/guia",
  "/faqs",
  "/notes",
  "/audits",
  "/about",
  "/pricing",
  "/privacy",
  "/terms",
  "/feedback",
  "/delete-account",
]);

export default function Loading() {
  const [bg, setBg] = useState("#0c0f14");
  useEffect(() => {
    if (MARKETING_PATHS.has(window.location.pathname)) {
      setBg("#0d0b0b");
      return;
    }
    const theme = document.documentElement.getAttribute("data-theme");
    if (theme === "light") setBg("#d4ebf5");
  }, []);
  return <div style={{ minHeight: "100dvh", background: bg }} />;
}
