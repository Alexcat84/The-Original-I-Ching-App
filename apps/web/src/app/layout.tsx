import { getSiteMetaUiMessages, htmlLangFromAppLocale } from "@iching-oracle/i18n";
import type { Metadata } from "next";
import { headers } from "next/headers";
import CookieConsentGate from "@/components/CookieConsentGate";
import RevenueCatSupabaseSync from "@/components/RevenueCatSupabaseSync";
import RouterReadySignal from "@/components/RouterReadySignal";
import { resolveDocLocale } from "@/lib/doc-locale";
import { ChatSessionProvider } from "@/providers/chat-session-provider";
import { rootFontClassName } from "@/lib/google-fonts-root";
import { buildCanonicalMetadata } from "@/lib/seo-canonical";
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
    keywords: ["I Ching", "I Ching AI", "Book of Changes", "hexagram reading", "oracle app", "I Ching chat", "Bones oracle", "oráculo I Ching"],
    openGraph: {
      title: "The Original I Ching App",
      description: "Ancient oracle. AI conversation. No subscriptions. 11 languages.",
      url: "https://theoriginaliching.com",
      siteName: "The Original I Ching App",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "The Original I Ching App",
      description: "Ancient oracle. AI conversation. No subscriptions. 11 languages.",
    },
    robots: {
      index: true,
      follow: true,
    },
    ...buildCanonicalMetadata("/"),
  };
}

const themeInitScript = `(function(){try{var k="iching_theme",t=localStorage.getItem(k);if(t!=="light"&&t!=="dark")t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await resolveDocLocale();
  const htmlLang = htmlLangFromAppLocale(locale);
  const htmlDir = locale === "ar" ? "rtl" : "ltr";
  const nonce = (await headers()).get("x-nonce") ?? "";

  return (
    <html
      lang={htmlLang}
      dir={htmlDir}
      suppressHydrationWarning
      className={rootFontClassName}
    >
      <head>
        {/* Raw <script> required for nonce in App Router — <Script strategy="beforeInteractive"> does not reliably propagate nonce on inline scripts */}
        <script nonce={nonce} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {/* Exposed for client-side use (e.g. turnstile.render cspNonce). Nonce is per-request random — reading it from the DOM is no weaker than reading it from an existing <script nonce> attribute. */}
        <meta name="csp-nonce" content={nonce} suppressHydrationWarning />
      </head>
      <body>
        <RouterReadySignal />
        <RevenueCatSupabaseSync />
        <CookieConsentGate>
          <ChatSessionProvider>{children}</ChatSessionProvider>
        </CookieConsentGate>
      </body>
    </html>
  );
}
