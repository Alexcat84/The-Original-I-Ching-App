"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Progressive substring reveal for a typewriter-like effect on markdown source.
 * When `enabled` is false, returns `fullText` immediately.
 */
export function useProgressiveRevealSubstring(
  fullText: string,
  enabled: boolean,
  onComplete?: () => void,
): string {
  const [len, setLen] = useState(() => (!enabled || fullText.length === 0 ? fullText.length : 0));
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!enabled || fullText.length === 0) {
      setLen(fullText.length);
      return;
    }

    setLen(0);
    let raf = 0;
    const start = performance.now();
    const duration = Math.min(7500, Math.max(2200, fullText.length * 22));

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) * (1 - t);
      const next = Math.min(fullText.length, Math.floor(fullText.length * eased));
      setLen(next);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setLen(fullText.length);
        onCompleteRef.current?.();
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fullText, enabled]);

  return fullText.slice(0, len);
}
