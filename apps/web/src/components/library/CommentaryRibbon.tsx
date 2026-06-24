"use client";

import type { ReactNode } from "react";

export interface CommentaryRibbonProps {
  readonly panelId: string;
  readonly ariaLabel: string;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
  readonly children: ReactNode;
}

function RibbonToggle({
  panelId,
  ariaLabel,
  isOpen,
  onToggle,
  icon,
}: {
  readonly panelId: string;
  readonly ariaLabel: string;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
  readonly icon: "+" | "−";
}) {
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

/** Full-width per-point commentary accordion: oracle text stays above (caller
 * responsibility); this renders the toggle bar, collapsible panel, and footer
 * "−" for long commentary. State is controlled because table rows cannot wrap
 * a single native <details> across trigger and panel. */
export function CommentaryRibbon({
  panelId,
  ariaLabel,
  isOpen,
  onToggle,
  children,
}: CommentaryRibbonProps) {
  return (
    <div className="library-ribbon">
      <div className="library-ribbon__bar">
        <RibbonToggle
          panelId={panelId}
          ariaLabel={ariaLabel}
          isOpen={isOpen}
          onToggle={onToggle}
          icon={isOpen ? "−" : "+"}
        />
      </div>
      <div
        id={panelId}
        className={`library-ribbon__panel${isOpen ? " is-open" : ""}`}
        aria-hidden={!isOpen}
      >
        <div className="library-ribbon__panel-inner">
          <div className="library-ribbon__content">{children}</div>
          {isOpen ? (
            <div className="library-ribbon__bar library-ribbon__bar--footer">
              <RibbonToggle
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
    </div>
  );
}
