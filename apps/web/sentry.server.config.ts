// SENTRY_DSN — requerida en Vercel (server/edge, variable privada)
// Ver también NEXT_PUBLIC_SENTRY_DSN en sentry.client.config.ts para el bundle cliente
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
});
