/**
 * SERVIÇO DE SEGURANÇA - CSP & NONCE
 * Implementação de Content Security Policy dinâmica para Next.js 16 (2026)
 */

export function generateNonce() {
  return Buffer.from(crypto.randomUUID()).toString('base64');
}

export function getCSP(nonce: string) {
  const isProd = process.env.NODE_ENV === 'production';

  // Lista de domínios confiáveis
  const trustedDomains = [
    "'self'",
    "https://*.sentry.io",
    "https://*.supabase.co",
    "https://*.stripe.com",
    "https://*.vercel-storage.com",
    "https://*.upstash.io",
  ];

  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    ...(isProd ? [] : ["'unsafe-eval'"]), // Necessário para desenvolvimento no Next.js
  ];

  const styleSrc = [
    "'self'",
    "'unsafe-inline'", // Tailwind e CSS-in-JS precisam disso, mas limitamos com nonce onde possível
    "https://fonts.googleapis.com",
  ];

  const connectSrc = [
    ...trustedDomains,
    "wss://*.supabase.co",
    "https://vitals.vercel-insights.com",
  ];

  const policy = `
    default-src 'self';
    script-src ${scriptSrc.join(' ')};
    style-src ${styleSrc.join(' ')};
    img-src 'self' blob: data: https:;
    font-src 'self' data: https://fonts.gstatic.com;
    connect-src ${connectSrc.join(' ')};
    frame-src 'self' https://*.stripe.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
    report-uri https://o123456.ingest.sentry.io/api/security-report;
  `.replace(/\s+/g, ' ').trim();

  return policy;
}
