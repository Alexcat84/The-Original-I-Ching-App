"use client";

import {
  getLanguageLabels,
  getMarketingUiMessages,
  SUPPORTED_LOCALES,
  type AppLocale,
} from "@iching-oracle/i18n";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AuthLocalePicker } from "@/components/AuthLocalePicker";
import { setAppLocale } from "@/lib/set-app-locale";
import { useAppLocale } from "@/lib/use-app-locale";

/** English first in the UI selector (default app language) — same as chat. */
const LOCALE_SELECT_ORDER: AppLocale[] = [
  "en",
  ...SUPPORTED_LOCALES.filter((code): code is AppLocale => code !== "en"),
];

type NavKey = "oracle" | "guide" | "library" | "sources" | "pricing" | "faqs";

/** Nav item: `anchor` links scroll within the home page; the rest are routes. */
type NavItem = { key: NavKey; label: string; anchor?: string; route?: string };

/** Home-section ids the scroll-spy watches, mapped to their nav item. */
const SPY_SECTIONS: Array<{ id: string; key: NavKey }> = [
  { id: "oraculo", key: "oracle" },
  { id: "biblioteca", key: "library" },
  { id: "precios", key: "pricing" },
];

const HEADER_OFFSET = 84;

/**
 * Marketing site sticky nav. On the home page the anchor items (Oráculo /
 * Biblioteca / Precios) smooth-scroll in place — using plain <a> + a scroll
 * handler instead of next/link avoids the App Router re-navigating "/" and
 * bouncing the page back to the top. A scroll-spy moves the underline to the
 * section actually in view. On doc pages the anchors become /#section links.
 */
export function MarketingNav({ active }: { active?: NavKey }) {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const locale = useAppLocale();
  const m = getMarketingUiMessages(locale);
  const [menuOpen, setMenuOpen] = useState(false);
  const [spyKey, setSpyKey] = useState<NavKey | null>(null);
  // While a click-driven scroll is in flight, the scroll-spy is paused so it
  // can't flicker the underline back to an intermediate/earlier section.
  const suppressSpyUntilRef = useRef(0);

  const onLocaleChange = (next: AppLocale) => {
    setAppLocale(next);
    // Server-rendered marketing sections read the locale cookie — refetch RSC
    // so the whole page follows the picker without a manual reload.
    router.refresh();
  };

  const items: NavItem[] = [
    { key: "oracle", label: m.nav.oracle, anchor: "oraculo" },
    { key: "guide", label: m.nav.guide, route: "/guia" },
    { key: "library", label: m.nav.library, anchor: "biblioteca" },
    { key: "sources", label: m.nav.sources, route: "/notes" },
    { key: "pricing", label: m.nav.pricing, anchor: "precios" },
    { key: "faqs", label: m.nav.faqs, route: "/faqs" },
  ];

  // Scroll-spy: underline follows the section in view (home only).
  useEffect(() => {
    if (!isHome) return;
    const els = SPY_SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (!els.length) return;

    const compute = () => {
      // Paused during a click-driven scroll — the optimistic underline wins.
      if (Date.now() < suppressSpyUntilRef.current) return;
      // Pick the last section whose top has passed the header line.
      let current: NavKey | null = null;
      for (const s of SPY_SECTIONS) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= HEADER_OFFSET + 40) current = s.key;
      }
      // Near the bottom, force the last anchor section (precios).
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80) {
        current = "pricing";
      }
      setSpyKey(current);
    };

    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, [isHome]);

  const targetY = useCallback((el: HTMLElement) => {
    return Math.max(0, el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET);
  }, []);

  const scrollToAnchor = useCallback(
    (anchor: string, key: NavKey) => {
      const el = document.getElementById(anchor);
      if (!el) return;
      // 1) Underline the clicked item immediately and freeze the scroll-spy so
      //    it can't drag the underline elsewhere while we animate. This makes
      //    the underline correct on the FIRST click regardless of how the
      //    browser handles the scroll (the reported bug was the underline
      //    landing on "Oráculo" until a second click).
      setSpyKey(key);
      suppressSpyUntilRef.current = Date.now() + 1000;
      // 2) Smooth-scroll to the section.
      window.scrollTo({ top: targetY(el), behavior: "smooth" });
      // 3) Fallback: some environments (heavy extensions, main-thread
      //    contention with the hero canvas) drop the smooth animation and the
      //    page never moves. If we haven't arrived shortly, jump instantly so
      //    the click always lands.
      window.setTimeout(() => {
        const want = targetY(el);
        if (Math.abs(window.scrollY - want) > 48) {
          window.scrollTo({ top: want, behavior: "auto" });
        }
      }, 700);
    },
    [targetY],
  );

  /** On home the active item is driven by the scroll-spy; elsewhere by `active`. */
  const activeKey: NavKey | null = isHome ? spyKey : (active ?? null);

  const renderItem = (item: NavItem, onNavigate?: () => void) => {
    const isActive = activeKey === item.key;
    const current = isActive ? "true" : undefined;
    if (item.anchor && isHome) {
      return (
        <a
          key={item.key}
          href={`#${item.anchor}`}
          aria-current={current}
          onClick={(e) => {
            e.preventDefault();
            scrollToAnchor(item.anchor!, item.key);
            history.replaceState(null, "", `#${item.anchor}`);
            onNavigate?.();
          }}
        >
          {item.label}
        </a>
      );
    }
    const href = item.anchor ? `/#${item.anchor}` : item.route!;
    return (
      <Link key={item.key} href={href} aria-current={current} onClick={onNavigate}>
        {item.label}
      </Link>
    );
  };

  return (
    <>
      <header className="mk-nav">
        <Link href="/" className="mk-nav-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/marketing/logo-v3.jpg" alt="The Original I Ching" />
          <span>THE ORIGINAL I CHING</span>
        </Link>
        <nav className="mk-nav-links">{items.map((it) => renderItem(it))}</nav>
        <div className="mk-nav-actions">
          <AuthLocalePicker
            locale={locale}
            onChange={onLocaleChange}
            order={LOCALE_SELECT_ORDER}
            labels={getLanguageLabels()}
            ariaLabel={m.nav.consult}
            variant="ink"
          />
          <Link href="/login" className="mk-nav-consult">
            {m.nav.consult}
          </Link>
          <button
            type="button"
            className="mk-nav-burger"
            aria-label={menuOpen ? m.nav.closeMenu : m.nav.openMenu}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </header>
      {menuOpen ? (
        <nav className="mk-nav-mobile">
          {items.map((it) => renderItem(it, () => setMenuOpen(false)))}
        </nav>
      ) : null}
    </>
  );
}
