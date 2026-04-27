"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type SegmentsPlan = { segments: string[]; joiner: "\n\n" | "\n" };

/** Split on blank lines when possible; otherwise chunk by line length so we rarely cut mid-line. */
function segmentizeForReveal(fullText: string): SegmentsPlan {
  if (!fullText) return { segments: [], joiner: "\n\n" };
  const paras = fullText.split(/\n{2,}/);
  if (paras.length >= 2) {
    return { segments: paras, joiner: "\n\n" };
  }
  const single = paras[0] ?? fullText;
  if (single.length <= 1200) {
    return { segments: [single], joiner: "\n\n" };
  }
  return { segments: chunkLines(single, 480), joiner: "\n" };
}

function chunkLines(s: string, maxChars: number): string[] {
  const lines = s.split("\n");
  const out: string[] = [];
  let cur = "";
  for (const line of lines) {
    const candidate = cur ? `${cur}\n${line}` : line;
    if (candidate.length > maxChars && cur) {
      out.push(cur);
      cur = line;
    } else {
      cur = candidate;
    }
  }
  if (cur) out.push(cur);
  return out.length ? out : [s];
}

function joinSegments(segments: string[], joiner: "\n\n" | "\n", count: number): string {
  if (count <= 0 || segments.length === 0) return "";
  const n = Math.min(count, segments.length);
  return segments.slice(0, n).join(joiner);
}

/**
 * Progressive reveal for markdown: grows by paragraph / line-block boundaries so
 * react-markdown rarely sees broken emphasis, links, or lists mid-token.
 * When `enabled` is false, returns `fullText` immediately.
 */
export function useProgressiveRevealSubstring(
  fullText: string,
  enabled: boolean,
  onComplete?: () => void,
): string {
  const { segments, joiner } = useMemo(() => segmentizeForReveal(fullText), [fullText]);
  const total = segments.length;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [visibleCount, setVisibleCount] = useState(() =>
    !enabled || fullText.length === 0 || total === 0 ? total : Math.min(1, total),
  );

  useEffect(() => {
    if (!enabled || fullText.length === 0 || total === 0) {
      setVisibleCount(total);
      return;
    }

    setVisibleCount(Math.min(1, total));
    let raf = 0;
    const start = performance.now();
    const duration = Math.min(7500, Math.max(2200, fullText.length * 22));

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) * (1 - t);
      const next = Math.min(total, Math.max(1, Math.ceil(eased * total)));
      setVisibleCount(next);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setVisibleCount(total);
        onCompleteRef.current?.();
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fullText, enabled, total]);

  const revealed = useMemo(
    () => (!enabled || total === 0 ? fullText : joinSegments(segments, joiner, visibleCount)),
    [enabled, fullText, joiner, segments, total, visibleCount],
  );

  if (!enabled) return fullText;
  return revealed;
}
