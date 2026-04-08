import { getSiteMetaUiMessages, htmlLangFromAppLocale } from "@iching-oracle/i18n";
import type { Metadata } from "next";
import Script from "next/script";
import CookieConsentGate from "@/components/CookieConsentGate";
import RevenueCatSupabaseSync from "@/components/RevenueCatSupabaseSync";
import { resolveDocLocale } from "@/lib/doc-locale";
import { ChatSessionProvider } from "@/providers/chat-session-provider";
import { rootFontClassName } from "@/lib/google-fonts-root";
import "@fontsource/noto-serif-sc/700.css";
import "@fontsource/noto-serif-tc/700.css";
import "./globals.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveDocLocale();
  const m = getSiteMetaUiMessages(locale);
  return {
    title: m.title,
    description: m.description,
  };
}

const themeInitScript = `(function(){try{var k="iching_theme",t=localStorage.getItem(k);if(t!=="light"&&t!=="dark")t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await resolveDocLocale();
  const htmlLang = htmlLangFromAppLocale(locale);

  return (
    <html
      lang={htmlLang}
      suppressHydrationWarning
      className={rootFontClassName}
    >
      <body>
        <Script
          id="iching-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        <RevenueCatSupabaseSync />
        <CookieConsentGate>
          <ChatSessionProvider>{children}</ChatSessionProvider>
        </CookieConsentGate>
      </body>
    </html>
  );
}
