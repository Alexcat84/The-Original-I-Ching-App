// NEXT_PUBLIC_SENTRY_DSN — requerida en Vercel (bundle cliente, debe ser variable pública)
// SENTRY_DSN           — requerida en Vercel (server/edge, variable privada)
// Ambas deben tener el mismo valor: el DSN del proyecto en sentry.io
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV === "production" ? "production" : "development",
});
