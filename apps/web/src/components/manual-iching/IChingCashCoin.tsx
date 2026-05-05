"use client";

import { useEffect, useState } from "react";

export type IChingCashCoinFace = "yang" | "yin";

type Props = {
  /** Yang (heads): Han inscription face; Yin (tails): Manchu reverse */
  face: IChingCashCoinFace;
  className?: string;
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/**
 * Traditional cash-style disc (康熙通寶 / Manchu reverse) for manual I Ching casting.
 * Decorative faces are aria-hidden; the parent control must expose the accessible name.
 */
export function IChingCashCoin({ face, className = "" }: Props) {
  const reduceMotion = usePrefersReducedMotion();
  const showYin = face === "yin";
  const durationMs = reduceMotion ? 0 : 520;

  return (
    <span className={`iching-cash-coin ${className}`.trim()}>
      <span
        className="iching-cash-coin__inner"
        data-face={face}
        style={{
          transform: showYin ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: durationMs ? `transform ${durationMs}ms cubic-bezier(0.25, 0.1, 0.25, 1)` : undefined,
        }}
      >
        <span className="iching-cash-coin__face iching-cash-coin__face--front" aria-hidden>
          <svg viewBox="0 0 240 240" className="iching-cash-coin__svg" xmlns="http://www.w3.org/2000/svg">
            <circle cx="120" cy="120" r="108" fill="#e8b923" stroke="#9b6f1f" strokeWidth="22" />
            <circle cx="120" cy="120" r="92" fill="none" stroke="#c18f2e" strokeWidth="10" />
            <rect x="88" y="88" width="64" height="64" rx="4" fill="#1c1c1c" />
            <text x="120" y="68" className="iching-cash-coin__han" textAnchor="middle" dominantBaseline="middle">
              康
            </text>
            <text x="120" y="95" className="iching-cash-coin__han" textAnchor="middle" dominantBaseline="middle">
              熙
            </text>
            <text x="120" y="145" className="iching-cash-coin__han" textAnchor="middle" dominantBaseline="middle">
              通
            </text>
            <text x="120" y="172" className="iching-cash-coin__han" textAnchor="middle" dominantBaseline="middle">
              寶
            </text>
          </svg>
        </span>
        <span className="iching-cash-coin__face iching-cash-coin__face--back" aria-hidden>
          <svg viewBox="0 0 240 240" className="iching-cash-coin__svg" xmlns="http://www.w3.org/2000/svg">
            <circle cx="120" cy="120" r="108" fill="#e8b923" stroke="#9b6f1f" strokeWidth="22" />
            <circle cx="120" cy="120" r="92" fill="none" stroke="#c18f2e" strokeWidth="10" />
            <rect x="88" y="88" width="64" height="64" rx="4" fill="#1c1c1c" />
            <text x="120" y="85" className="iching-cash-coin__manchu" textAnchor="middle" dominantBaseline="middle">
              ᠪᠣᠣ
            </text>
            <text x="120" y="125" className="iching-cash-coin__manchu" textAnchor="middle" dominantBaseline="middle">
              ᠴᡳᠣᠸᠠᠨ
            </text>
          </svg>
        </span>
      </span>
    </span>
  );
}
