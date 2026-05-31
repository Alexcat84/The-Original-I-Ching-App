"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type SelectOption<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  value: T | "";
  onChange: (next: T) => void;
  options: SelectOption<T>[];
  placeholder: string;
  ariaLabel: string;
  error?: boolean;
  id?: string;
};

export function CustomSelect<T extends string>({
  value,
  onChange,
  options,
  placeholder,
  ariaLabel,
  error = false,
  id,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const [menuRect, setMenuRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const selectedLabel = options.find((o) => o.value === value)?.label ?? null;

  useLayoutEffect(() => {
    if (!open) { setMenuRect(null); return; }
    const r = buttonRef.current?.getBoundingClientRect();
    if (r) setMenuRect({ top: r.bottom + 4, left: r.left, width: r.width });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const isInside = (node: Node | null) =>
      !!(rootRef.current?.contains(node) || menuRef.current?.contains(node));
    const onMouseDown = (e: MouseEvent) => { if (!isInside(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const onScroll = (e: Event) => {
      if (e.target instanceof Node && menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  const pick = useCallback((val: T) => { onChange(val); setOpen(false); }, [onChange]);

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
          width: menuRect.width,
          minWidth: menuRect.width,
          maxWidth: menuRect.width,
        }}
      >
        {options.map((opt) => (
          <li key={opt.value} role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={opt.value === value}
              className={`locale-picker-menu__row feedback-picker-menu__row${opt.value === value ? " is-active" : ""}`}
              onClick={() => pick(opt.value)}
            >
              {opt.label}
            </button>
          </li>
        ))}
      </ul>
    ) : null;

  return (
    <div className="feedback-custom-select" ref={rootRef}>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        className={[
          "feedback-picker-trigger",
          !value ? "feedback-picker-trigger--placeholder" : "",
          error ? "feedback-input--error" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="feedback-picker-trigger__label">
          {selectedLabel ?? placeholder}
        </span>
        <span className="feedback-picker-trigger__chevron" aria-hidden />
      </button>
      {typeof document !== "undefined" && menu
        ? createPortal(menu, document.body)
        : null}
    </div>
  );
}
