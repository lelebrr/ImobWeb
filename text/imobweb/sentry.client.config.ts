import * as Sentry from "@sentry/nextjs";

/**
 * SENTRY CLIENT CONFIG - imobWeb
 * 2026 - Observabilidade Enterprise
 */

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Traces para performance (10% em produção, 100% em dev)
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Captura de erros em componentes React
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Debug apenas em desenvolvimento
  debug: false,
});
