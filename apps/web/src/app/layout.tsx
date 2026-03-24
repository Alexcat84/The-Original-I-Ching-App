import type { Metadata } from "next";
import { Cinzel, Ma_Shan_Zheng, Noto_Serif } from "next/font/google";
import Script from "next/script";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "I Ching Oracle",
  description: "Classical I Ching with Zhu Xi mutation rules",
};

const fontDisplay = Cinzel({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-oracle-display",
  display: "swap",
});

const fontOracleCn = Ma_Shan_Zheng({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-oracle-cn",
  display: "swap",
});

const fontPresentationSerif = Noto_Serif({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-oracle-serif",
  display: "swap",
});

const themeInitScript = `(function(){try{var k="iching_theme",t=localStorage.getItem(k);if(t!=="light"&&t!=="dark")t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${fontDisplay.variable} ${fontOracleCn.variable} ${fontPresentationSerif.variable}`}
    >
      <body>
        <Script
          id="iching-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        {children}
      </body>
    </html>
  );
}
