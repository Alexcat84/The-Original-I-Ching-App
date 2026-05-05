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
 * Traditional cash-style disc: Han face 康熙通寶 (four glyphs around the hole);
 * Manchu reverse (two lines). Decorative only — parent button carries a11y name.
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
          <svg
            viewBox="0 0 200 200"
            className="iching-cash-coin__svg"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <circle cx="100" cy="100" r="90" fill="#e8b923" stroke="#b8892e" strokeWidth="2.5" />
            <rect x="74" y="74" width="52" height="52" rx="3" fill="#1a1a1a" />
            {/* Clockwise from top: 康熙通寶 */}
            <text
              x="100"
              y="44"
              className="iching-cash-coin__han"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="34"
              fontWeight={700}
            >
              康
            </text>
            <text
              x="156"
              y="104"
              className="iching-cash-coin__han"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="34"
              fontWeight={700}
            >
              熙
            </text>
            <text
              x="100"
              y="164"
              className="iching-cash-coin__han"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="34"
              fontWeight={700}
            >
              通
            </text>
            <text
              x="44"
              y="104"
              className="iching-cash-coin__han"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="34"
              fontWeight={700}
            >
              寶
            </text>
          </svg>
        </span>
        <span className="iching-cash-coin__face iching-cash-coin__face--back" aria-hidden>
          <svg
            viewBox="0 0 200 200"
            className="iching-cash-coin__svg"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <circle cx="100" cy="100" r="90" fill="#e8b923" stroke="#b8892e" strokeWidth="2.5" />
            <rect x="74" y="74" width="52" height="52" rx="3" fill="#1a1a1a" />
            <text
              x="100"
              y="52"
              className="iching-cash-coin__manchu"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="52"
              fontWeight={700}
            >
              ᠪᠣᠣ
            </text>
            <text
              x="100"
              y="150"
              className="iching-cash-coin__manchu"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="44"
              fontWeight={700}
            >
              ᠴᡳᠣᠸᠠᠨ
            </text>
          </svg>
        </span>
      </span>
    </span>
  );
}
