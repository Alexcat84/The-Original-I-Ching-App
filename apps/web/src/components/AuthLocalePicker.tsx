"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { AppLocale } from "@iching-oracle/i18n";

export type AuthLocalePickerProps = {
  locale: AppLocale;
  onChange: (next: AppLocale) => void;
  order: AppLocale[];
  labels: Record<AppLocale, string>;
  ariaLabel: string;
};

function codeLabel(code: AppLocale): string {
  return code.toUpperCase();
}

type MenuRect = { top: number; left: number; minW: number };

/**
 * Custom locale menu (former native RN bar: list with code + language name).
 * Menu is portaled to `document.body` so it is not clipped by `.chat-surface { overflow: hidden }`.
 */
export function AuthLocalePicker({ locale, onChange, order, labels, ariaLabel }: AuthLocalePickerProps) {
  const [open, setOpen] = useState(false);
  const [menuRect, setMenuRect] = useState<MenuRect | null>(null);
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
        minW: Math.max(r.width, 184),
      });
    }
  }, [open, locale]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onScroll = () => setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close, { passive: true });
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("touchstart", close);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  const pick = useCallback(
    (code: AppLocale) => {
      onChange(code);
      setOpen(false);
    },
    [onChange]
  );

  const menu =
    open && menuRect ? (
      <ul
        ref={menuRef}
        id={listId}
        className="locale-picker-menu locale-picker-menu--portal"
        role="listbox"
        aria-label={ariaLabel}
        style={{
          position: "fixed",
          top: menuRect.top,
          left: menuRect.left,
          minWidth: menuRect.minW,
        }}
      >
        {order.map((code) => {
          const active = code === locale;
          return (
            <li key={code} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={active}
                className={`locale-picker-menu__row${active ? " is-active" : ""}`}
                onClick={() => pick(code)}
              >
                <span className="locale-picker-menu__code">{codeLabel(code)}</span>
                <span className="locale-picker-menu__name">{labels[code]}</span>
              </button>
            </li>
          );
        })}
      </ul>
    ) : null;

  return (
    <div className="locale-picker" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        id="ui-locale-select"
        className="locale-picker-trigger"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="locale-picker-trigger__code">{codeLabel(locale)}</span>
        <span className="locale-picker-trigger__chevron" aria-hidden />
      </button>
      {typeof document !== "undefined" && menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
