import * as Sentry from "@sentry/nextjs";

/**
 * External Dependencies Health Monitor.
 * Checks the availability of third-party APIs (Stripe, WhatsApp/Meta, etc.).
 */

export interface DependencyStatus {
  name: string;
  status: 'up' | 'down' | 'degraded';
  latency?: number;
  lastChecked: Date;
}

export const checkExternalDependencies = async (): Promise<DependencyStatus[]> => {
  const results: DependencyStatus[] = [];

  // 1. Check Stripe API
  try {
    const start = Date.now();
    const res = await fetch('https://api.stripe.com/v1/healthcheck', { method: 'HEAD' });
    results.push({
      name: 'Stripe',
      status: res.ok ? 'up' : 'degraded',
      latency: Date.now() - start,
      lastChecked: new Date(),
    });
  } catch (error) {
    results.push({ name: 'Stripe', status: 'down', lastChecked: new Date() });
    Sentry.captureMessage('Stripe API appearing down in health check');
  }

  // 2. Check WhatsApp (Meta Graph API)
  try {
    const start = Date.now();
    // Simplified ping to Meta's public status or API endpoint
    const res = await fetch('https://graph.facebook.com/health', { method: 'HEAD' });
    results.push({
      name: 'WhatsApp/Meta',
      status: res.ok ? 'up' : 'degraded',
      latency: Date.now() - start,
      lastChecked: new Date(),
    });
  } catch (error) {
    results.push({ name: 'WhatsApp/Meta', status: 'down', lastChecked: new Date() });
    Sentry.captureMessage('Meta Graph API appearing down in health check');
  }

  return results;
};
