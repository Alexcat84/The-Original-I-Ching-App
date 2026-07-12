"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Wraps a grid of cards and fades them up gently when scrolled into view
 * (staggered via CSS :nth-child on .mk-reveal > *). Respects reduced-motion.
 * Keeps the export's "alive" feel without the robotic snap of the old hovers.
 */
export function MarketingReveal({
  className,
  children,
  id,
}: {
  className?: string;
  children: React.ReactNode;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} id={id} className={`mk-reveal${shown ? " mk-in" : ""}${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}
