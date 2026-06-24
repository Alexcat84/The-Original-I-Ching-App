"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/** Content taller than this (px) gets a footer "−" to collapse without scrolling up. */
const FOOTER_SCROLL_THRESHOLD_PX = 280;

export interface CommentaryRibbonToggleProps {
  readonly panelId: string;
  readonly ariaLabel: string;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
  readonly icon: "+" | "−";
}

export function CommentaryRibbonToggle({
  panelId,
  ariaLabel,
  isOpen,
  onToggle,
  icon,
}: CommentaryRibbonToggleProps) {
  return (
    <button
      type="button"
      className="library-ribbon__toggle"
      aria-expanded={isOpen}
      aria-controls={panelId}
      aria-label={ariaLabel}
      onClick={onToggle}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}

export interface CommentaryRibbonProps {
  readonly panelId: string;
  readonly ariaLabel: string;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
  readonly children: ReactNode;
  /** Optional title shown in the top bar (hex-level blocks: About, Wen Yen, footnotes). */
  readonly heading?: string;
  /** When true, only the collapsible panel — toggle rendered elsewhere (lines table). */
  readonly panelOnly?: boolean;
}

interface CommentaryRibbonPanelProps {
  readonly panelId: string;
  readonly ariaLabel: string;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
  readonly children: ReactNode;
}

function CommentaryRibbonPanel({
  panelId,
  ariaLabel,
  isOpen,
  onToggle,
  children,
}: CommentaryRibbonPanelProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [showFooter, setShowFooter] = useState(false);

  useLayoutEffect(() => {
    if (!isOpen) {
      setShowFooter(false);
      return;
    }
    const el = contentRef.current;
    if (!el) return;

    const measure = () => {
      setShowFooter(el.scrollHeight > FOOTER_SCROLL_THRESHOLD_PX);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isOpen, children]);

  return (
    <div
      id={panelId}
      className={`library-ribbon__panel${isOpen ? " is-open" : ""}`}
      aria-hidden={!isOpen}
    >
      <div className="library-ribbon__panel-inner">
        <div ref={contentRef} className="library-ribbon__content">
          {children}
        </div>
        {isOpen && showFooter ? (
          <div className="library-ribbon__bar library-ribbon__bar--footer">
            <CommentaryRibbonToggle
              panelId={panelId}
              ariaLabel={ariaLabel}
              isOpen={isOpen}
              onToggle={onToggle}
              icon="−"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CommentaryRibbonBar({
  panelId,
  ariaLabel,
  isOpen,
  onToggle,
  heading,
}: {
  readonly panelId: string;
  readonly ariaLabel: string;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
  readonly heading?: string;
}) {
  return (
    <div className={`library-ribbon__bar${heading ? " library-ribbon__bar--labeled" : ""}`}>
      {heading ? <span className="library-ribbon__heading">{heading}</span> : null}
      <CommentaryRibbonToggle
        panelId={panelId}
        ariaLabel={ariaLabel}
        isOpen={isOpen}
        onToggle={onToggle}
        icon={isOpen ? "−" : "+"}
      />
    </div>
  );
}

/** Full-width per-point commentary accordion: oracle text stays above (caller
 * responsibility); toggle bar lives inside the same bordered zone as the oracle
 * row/card. State is controlled because table rows cannot wrap a single native
 * <details> across trigger and panel. */
export function CommentaryRibbon({
  panelId,
  ariaLabel,
  isOpen,
  onToggle,
  children,
  heading,
  panelOnly = false,
}: CommentaryRibbonProps) {
  if (panelOnly) {
    return (
      <div className="library-ribbon library-ribbon--panel-only">
        <CommentaryRibbonPanel
          panelId={panelId}
          ariaLabel={ariaLabel}
          isOpen={isOpen}
          onToggle={onToggle}
        >
          {children}
        </CommentaryRibbonPanel>
      </div>
    );
  }

  return (
    <div className="library-ribbon">
      <CommentaryRibbonBar
        panelId={panelId}
        ariaLabel={ariaLabel}
        isOpen={isOpen}
        onToggle={onToggle}
        heading={heading}
      />
      <CommentaryRibbonPanel
        panelId={panelId}
        ariaLabel={ariaLabel}
        isOpen={isOpen}
        onToggle={onToggle}
      >
        {children}
      </CommentaryRibbonPanel>
    </div>
  );
}
