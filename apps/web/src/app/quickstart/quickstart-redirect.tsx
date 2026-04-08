"use client";

import { useAppLocale } from "@/lib/use-app-locale";
import { getQuickstartPageUiMessages } from "@iching-oracle/i18n";
import { useEffect, useMemo } from "react";

/** Legacy URL: same content now lives under `/guia#primeros-pasos`. */
export function QuickstartRedirect() {
  const locale = useAppLocale();
  const q = useMemo(() => getQuickstartPageUiMessages(locale), [locale]);

  useEffect(() => {
    window.location.replace("/guia#primeros-pasos");
  }, []);
  return (
    <p className="doc-lead" style={{ padding: "2rem" }}>
      {q.legacyRedirectNotice}
    </p>
  );
}
