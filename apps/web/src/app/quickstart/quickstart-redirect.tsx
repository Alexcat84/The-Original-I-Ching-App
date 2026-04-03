"use client";

import { useEffect } from "react";

/** Legacy URL: same content now lives under `/guia#primeros-pasos`. */
export function QuickstartRedirect() {
  useEffect(() => {
    window.location.replace("/guia#primeros-pasos");
  }, []);
  return (
    <p className="doc-lead" style={{ padding: "2rem" }}>
      Redirecting to the user guide…
    </p>
  );
}
