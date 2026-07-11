"use client";

import { getMarketingUiMessages } from "@iching-oracle/i18n";
import Link from "next/link";
import { useAppLocale } from "@/lib/use-app-locale";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.theoriginaliching.app";

export function MarketingFooter() {
  const locale = useAppLocale();
  const m = getMarketingUiMessages(locale);

  return (
    <footer className="mk-footer">
      <div className="mk-footer-top">
        <div className="mk-footer-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/marketing/logo-v3.jpg" alt="" />
          <span>THE ORIGINAL I CHING</span>
        </div>
        <div className="mk-footer-cols">
          <div>
            <p>{m.footer.productHeading}</p>
            <Link href="/#oraculo">{m.footer.oracle}</Link>
            <br />
            <Link href="/guia">{m.footer.guide}</Link>
            <br />
            <Link href="/#precios">{m.footer.pricing}</Link>
            <br />
            <Link href="/feedback">{m.footer.feedback}</Link>
            <br />
            <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
              {m.footer.googlePlay}
            </a>
          </div>
          <div>
            <p>{m.footer.libraryHeading}</p>
            <Link href="/#biblioteca">{m.footer.hexagrams}</Link>
            <br />
            <Link href="/notes">{m.footer.sources}</Link>
            <br />
            <Link href="/audits">{m.footer.audits}</Link>
          </div>
          <div>
            <p>{m.footer.supportHeading}</p>
            <Link href="/faqs">{m.footer.faqs}</Link>
            <br />
            <Link href="/privacy">{m.footer.privacy}</Link>
            <br />
            <Link href="/terms">{m.footer.terms}</Link>
            <br />
            <Link href="/delete-account">{m.footer.deleteAccount}</Link>
          </div>
        </div>
      </div>
      <p className="mk-footer-copy">{m.footer.copyright}</p>
    </footer>
  );
}
