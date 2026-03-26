import { Cinzel, Ma_Shan_Zheng, Noto_Serif } from "next/font/google";

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

export const rootFontClassName = `${fontDisplay.variable} ${fontOracleCn.variable} ${fontPresentationSerif.variable}`;
