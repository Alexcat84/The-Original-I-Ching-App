import type { Metadata } from "next";
import Script from "next/script";
import CookieConsentGate from "@/components/CookieConsentGate";
import RevenueCatSupabaseSync from "@/components/RevenueCatSupabaseSync";
import { ChatSessionProvider } from "@/providers/chat-session-provider";
import { rootFontClassName } from "@/lib/google-fonts-root";
import "@fontsource/noto-serif-sc/700.css";
import "@fontsource/noto-serif-tc/700.css";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "I Ching Oracle",
  description: "Classical I Ching with Zhu Xi mutation rules",
};

const themeInitScript = `(function(){try{var k="iching_theme",t=localStorage.getItem(k);if(t!=="light"&&t!=="dark")t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
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
