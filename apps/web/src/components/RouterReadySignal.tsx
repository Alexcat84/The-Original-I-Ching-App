"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    __nextRouterReady?: boolean;
  }
}

/**
 * Signals the RN WebView bridge (`__rnNavigateTo` in apps/mobile/app/index.tsx) that the
 * App Router has finished hydrating. Native navigation dispatched via `window.next.router.push()`
 * before this flag is set throws "Router action dispatched before initialization" — the effect
 * only runs after hydration, so the flag is a reliable readiness signal.
 */
export default function RouterReadySignal() {
  useEffect(() => {
    window.__nextRouterReady = true;
  }, []);
  return null;
}
