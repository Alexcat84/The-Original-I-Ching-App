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
    // Facebook's in-app browser (Android) injects its own navigation-performance
    // bridge ("navigation_performance_logger_android") to report perf beacons back
    // to native Facebook code. When the user navigates away before that async
    // postMessage call resolves, the underlying Java bridge object is already torn
    // down. This is a bug/lifecycle quirk in Facebook's own injected script, not in
    // our code — we have no bridge object by that name and can't catch or prevent
    // it. Non-actionable noise, suppress it.
    if (msg.includes("Error invoking postMessage: Java object is gone")) {
      return null;
    }
    // The installed Android APK loads "/" in a WebView and our pre-hydration
    // guard immediately redirects it to "/chat". That navigation aborts the
    // marketing page's in-flight RSC stream, and the WebView surfaces the
    // aborted read as an uncaught "Connection closed." It is expected and
    // non-actionable (the user lands on /chat) — suppress the noise.
    if (msg === "Connection closed." || msg === "Connection closed") {
      return null;
    }
    return event;
  },
});

// Required by @sentry/nextjs to instrument App Router client-side navigations.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
