"use client";

import {
  getLanguageLabels,
  getMarketingUiMessages,
  SUPPORTED_LOCALES,
  type AppLocale,
} from "@iching-oracle/i18n";
import Link from "next/link";
import { useState } from "react";
import { AuthLocalePicker } from "@/components/AuthLocalePicker";
import { setAppLocale } from "@/lib/set-app-locale";
import { useAppLocale } from "@/lib/use-app-locale";

/** English first in the UI selector (default app language) — same as chat. */
const LOCALE_SELECT_ORDER: AppLocale[] = [
  "en",
  ...SUPPORTED_LOCALES.filter((code): code is AppLocale => code !== "en"),
];

type NavKey = "oracle" | "guide" | "library" | "sources" | "pricing" | "faqs";

/**
 * Marketing site sticky nav. The "Consultar" CTA points to /login: guests get
 * the register/sign-in card there, and /login redirects authenticated users
 * straight to /chat — so this link works for both states without a session
 * check here.
 */
export function MarketingNav({ active }: { active?: NavKey }) {
  const locale = useAppLocale();
  const m = getMarketingUiMessages(locale);
  const [menuOpen, setMenuOpen] = useState(false);

  const links: Array<{ key: NavKey; href: string; label: string }> = [
    { key: "oracle", href: "/#oraculo", label: m.nav.oracle },
    { key: "guide", href: "/guia", label: m.nav.guide },
    { key: "library", href: "/#biblioteca", label: m.nav.library },
    { key: "sources", href: "/notes", label: m.nav.sources },
    { key: "pricing", href: "/#precios", label: m.nav.pricing },
    { key: "faqs", href: "/faqs", label: m.nav.faqs },
  ];

  return (
    <>
      <header className="mk-nav">
        <Link href="/" className="mk-nav-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/marketing/logo-v3.jpg" alt="The Original I Ching" />
          <span>THE ORIGINAL I CHING</span>
        </Link>
        <nav className="mk-nav-links">
          {links.map((l) => (
            <Link key={l.key} href={l.href} aria-current={active === l.key ? "true" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mk-nav-actions">
          <AuthLocalePicker
            locale={locale}
            onChange={setAppLocale}
            order={LOCALE_SELECT_ORDER}
            labels={getLanguageLabels()}
            ariaLabel={m.nav.consult}
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
          {links.map((l) => (
            <Link key={l.key} href={l.href} onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </>
  );
}
