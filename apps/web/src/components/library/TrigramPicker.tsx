"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatTrigramLabel, type TrigramId, type TrigramMeta } from "@/lib/library/trigram-meta";

type FilterValue = "all" | TrigramId;

interface TrigramPickerProps {
  readonly value: FilterValue;
  readonly onChange: (next: FilterValue) => void;
  readonly trigrams: ReadonlyArray<TrigramMeta>;
  readonly allLabel: string;
  readonly ariaLabel: string;
}

/**
 * A custom dropdown component for trigram selection that matches the AuthLocalePicker style.
 * Uses a portal to ensure the menu is not clipped by parent containers.
 */
export function TrigramPicker({ value, onChange, trigrams, allLabel, ariaLabel }: TrigramPickerProps) {
  const [open, setOpen] = useState(false);
  const [menuRect, setMenuRect] = useState<{ top: number; left: number; minW: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  useLayoutEffect(() => {
    if (!open) {
      setMenuRect(null);
      return;
    }
    const r = buttonRef.current?.getBoundingClientRect();
    if (r) {
      setMenuRect({
        top: r.bottom + 5,
        left: r.left,
        minW: Math.max(r.width, 220),
      });
    }
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const isInsidePicker = (node: Node | null) => {
      if (!node) return false;
      return rootRef.current?.contains(node) || menuRef.current?.contains(node);
    };

    const onDismiss = (e: MouseEvent) => {
      if (!isInsidePicker(e.target as Node)) {
        setOpen(false);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    const onScroll = (e: Event) => {
      const t = e.target;
      if (t instanceof Node && menuRef.current?.contains(t)) return;
      setOpen(false);
    };

    document.addEventListener("mousedown", onDismiss);
    document.addEventListener("click", onDismiss, true);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    
    return () => {
      document.removeEventListener("mousedown", onDismiss);
      document.removeEventListener("click", onDismiss, true);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  const pick = useCallback(
    (id: FilterValue) => {
      onChange(id);
      setOpen(false);
    },
    [onChange]
  );

  const selectedLabel = value === "all" 
    ? allLabel 
    : formatTrigramLabel(trigrams.find((t) => t.id === value)!);

  const menu =
    open && menuRect ? (
      <ul
        ref={menuRef}
        id={listId}
        className="locale-picker-menu locale-picker-menu--portal trigram-picker-menu"
        role="listbox"
        aria-label={ariaLabel}
        style={{
          position: "fixed",
          top: menuRect.top,
          left: menuRect.left,
          minWidth: menuRect.minW,
        }}
      >
        <li role="presentation">
          <button
            type="button"
            role="option"
            aria-selected={value === "all"}
            className={`locale-picker-menu__row${value === "all" ? " is-active" : ""}`}
            onClick={() => pick("all")}
          >
            <span className="locale-picker-menu__name">{allLabel}</span>
            {value === "all" && <span className="trigram-picker-menu__check" aria-hidden="true">✓</span>}
          </button>
        </li>
        {trigrams.map((t) => {
          const active = t.id === value;
          const label = formatTrigramLabel(t);
          return (
            <li key={t.id} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={active}
                className={`locale-picker-menu__row${active ? " is-active" : ""}`}
                onClick={() => pick(t.id)}
              >
                <span className="locale-picker-menu__name" lang="zh-Hant">
                  {label}
                </span>
                {active && <span className="trigram-picker-menu__check" aria-hidden="true">✓</span>}
              </button>
            </li>
          );
        })}
      </ul>
    ) : null;

  return (
    <div className="trigram-picker" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="library-filter-trigger"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="library-filter-trigger__label">{selectedLabel}</span>
        <span className="library-filter-trigger__chevron" aria-hidden />
      </button>
      {typeof document !== "undefined" && menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
