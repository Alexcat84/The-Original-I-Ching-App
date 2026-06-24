"use client";

import type { ReactNode } from "react";

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
  /** When true, only the collapsible panel (+ footer −) — toggle rendered elsewhere. */
  readonly panelOnly?: boolean;
}

function CommentaryRibbonPanel({
  panelId,
  ariaLabel,
  isOpen,
  onToggle,
  children,
}: Omit<CommentaryRibbonProps, "panelOnly">) {
  return (
    <div
      id={panelId}
      className={`library-ribbon__panel${isOpen ? " is-open" : ""}`}
      aria-hidden={!isOpen}
    >
      <div className="library-ribbon__panel-inner">
        <div className="library-ribbon__content">{children}</div>
        {isOpen ? (
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
      <div className="library-ribbon__bar">
        <CommentaryRibbonToggle
          panelId={panelId}
          ariaLabel={ariaLabel}
          isOpen={isOpen}
          onToggle={onToggle}
          icon={isOpen ? "−" : "+"}
        />
      </div>
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
