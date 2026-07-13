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
import { NAV_HEADER_OFFSET, navLog, scrollToSection } from "@/lib/marketing/scroll-to-section";
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
  // After a nav click the underline locks to the clicked item and the
  // scroll-spy is paused, so the underline stays correct even if the scroll
  // itself is dropped by the browser (heavy extensions / main-thread
  // contention). The lock is released the moment the user scrolls by hand.
  const clickLockRef = useRef<NavKey | null>(null);

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
      // Locked to the clicked item until the user scrolls by hand — the
      // optimistic underline wins even if the click-scroll never happened.
      if (clickLockRef.current !== null) return;
      // Pick the last section whose top has passed the header line.
      let current: NavKey | null = null;
      for (const s of SPY_SECTIONS) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= NAV_HEADER_OFFSET + 40) current = s.key;
      }
      // Near the bottom, force the last anchor section (precios).
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80) {
        current = "pricing";
      }
      navLog("spy", { scrollY: Math.round(window.scrollY), current });
      setSpyKey(current);
    };

    // A hand-driven scroll releases the post-click lock so the spy resumes.
    // Programmatic scrolls fire "scroll" (not wheel/touch/key), so they don't
    // release it — the underline stays on the clicked item while it animates.
    const releaseLock = () => {
      if (clickLockRef.current !== null) {
        clickLockRef.current = null;
        compute();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Spacebar"].includes(e.key)) {
        releaseLock();
      }
    };

    compute();

    // Cross-page landing: arriving at /#section (e.g. clicking Biblioteca/Precios
    // from Guía) does a native hash jump that lands too high because the page
    // above hasn't settled — the reported "lands on Oráculo, second click works"
    // race. Lock the underline to the target and scroll to it with re-checks.
    try {
      const hash = decodeURIComponent((window.location.hash || "").replace("#", ""));
      const hashSection = SPY_SECTIONS.find((s) => s.id === hash);
      if (hashSection) {
        navLog("hash landing", hash, "->", hashSection.key);
        setSpyKey(hashSection.key);
        clickLockRef.current = hashSection.key;
        scrollToSection(hash);
      }
    } catch {
      /* ignore */
    }

    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    window.addEventListener("wheel", releaseLock, { passive: true });
    window.addEventListener("touchmove", releaseLock, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
      window.removeEventListener("wheel", releaseLock);
      window.removeEventListener("touchmove", releaseLock);
      window.removeEventListener("keydown", onKey);
    };
  }, [isHome]);

  const scrollToAnchor = useCallback((anchor: string, key: NavKey) => {
    if (!document.getElementById(anchor)) return;
    navLog("click", key, "->", anchor);
    // Underline the clicked item immediately and LOCK it there until the user
    // scrolls by hand — keeps the underline correct even if the scroll below is
    // dropped by the browser. scrollToSection re-measures/re-corrects at
    // escalating delays so it lands under the header even before layout settles.
    setSpyKey(key);
    clickLockRef.current = key;
    scrollToSection(anchor);
  }, []);

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
