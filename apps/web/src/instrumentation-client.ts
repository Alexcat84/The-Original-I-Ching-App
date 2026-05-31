import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV === "production" ? "production" : "development",
  beforeSend(event) {
    // Supabase auth uses navigator.locks.request({ steal: true }) to forcefully
    // take the IndexedDB session lock when switching users or on sign-out. This
    // aborts any concurrent lock holders with this error. It is expected,
    // non-actionable, and produces noise in Sentry — suppress it.
    const msg = event.exception?.values?.[0]?.value ?? "";
    if (msg.includes("Lock broken by another request with the 'steal' option")) {
      return null;
    }
    return event;
  },
});
