import * as Sentry from "@sentry/nextjs";

/**
 * SENTRY SERVER CONFIG - imobWeb
 * 2026 - Observabilidade Enterprise
 */

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Traces para performance
  tracesSampleRate: 1.0,

  // Perfis de CPU (Beta)
  profilesSampleRate: 1.0,

  // Registro de breadcrumbs de banco de dados
  integrations: [
    // Database tracing opcional
  ],

  // Limite de logs em produção
  debug: false,
});
