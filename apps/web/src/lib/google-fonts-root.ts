import { Cinzel, Inter, Ma_Shan_Zheng, Noto_Serif } from "next/font/google";

const fontDisplay = Cinzel({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700"],
  variable: "--font-oracle-display",
  display: "swap",
});

// Ma Shan Zheng only ships `latin` (basic) and `chinese-simplified` subsets in
// Google Fonts; `latin-ext` is not available for this font. This is fine
// because `--font-oracle-cn` is used exclusively for Chinese decorative glyphs
// (e.g. `.oracle-cn-mark`), never for pinyin tone marks.
const fontOracleCn = Ma_Shan_Zheng({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-oracle-cn",
  display: "swap",
});

const fontPresentationSerif = Noto_Serif({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-oracle-serif",
  display: "swap",
});

/**
 * Body sans-serif. Loaded so the chat body and any element inheriting from
 * <body> always has a webfont with Latin Extended-A/B coverage available
 * before falling back to the device's system fonts. This is what fixes the
 * "Dày�óu" rendering glitch (U+01D2 was unsupported by `latin`-only subsets,
 * causing Samsung WebView to render the missing-glyph U+FFFD indicator).
 */
const fontOracleSans = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oracle-sans",
  display: "swap",
});

export const rootFontClassName = `${fontDisplay.variable} ${fontOracleCn.variable} ${fontPresentationSerif.variable} ${fontOracleSans.variable}`;
