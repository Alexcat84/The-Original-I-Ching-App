"use client";
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontFamily: "sans-serif",
          background: "#0a0a0a",
          color: "#e5e5e5",
          gap: "1rem",
        }}
      >
        <h2 style={{ margin: 0 }}>Something went wrong</h2>
        <button
          onClick={() => reset()}
          style={{
            padding: "0.5rem 1.25rem",
            background: "#c9a227",
            color: "#0a0a0a",
            border: "none",
            borderRadius: "0.375rem",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
