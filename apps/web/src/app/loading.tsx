"use client";

// Client component so it can read data-theme from <html> before painting.
// Prevents the white flash on Next.js App Router client-side navigation.
import { useEffect, useState } from "react";

export default function Loading() {
  const [bg, setBg] = useState("#0c0f14"); // dark default (matches WebView bg)
  useEffect(() => {
    const theme = document.documentElement.getAttribute("data-theme");
    if (theme === "light") setBg("#d4ebf5");
  }, []);
  return <div style={{ minHeight: "100dvh", background: bg }} />;
}
