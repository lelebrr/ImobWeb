import * as Sentry from "@sentry/nextjs";

/**
 * SENTRY EDGE CONFIG - imobWeb
 * 2026 - Observabilidade Enterprise (Edge Runtime)
 */

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Traces para performance no Edge
  tracesSampleRate: 1.0,

  // Debug apenas em desenvolvimento
  debug: false,
});
