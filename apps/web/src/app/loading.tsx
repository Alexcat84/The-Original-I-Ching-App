"use client";

import { useEffect, useState } from "react";

export default function Loading() {
  const [bg, setBg] = useState("#0c0f14");
  useEffect(() => {
    const theme = document.documentElement.getAttribute("data-theme");
    if (theme === "light") setBg("#d4ebf5");
  }, []);
  return <div style={{ minHeight: "100dvh", background: bg }} />;
}
