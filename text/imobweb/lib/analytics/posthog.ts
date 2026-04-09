import posthog, { PostHog } from 'posthog-js';

/**
 * PostHog Integration for imobWeb
 * Focused on conversion funnels and lead behavior tracking.
 */

class AnalyticsService {
  private client: PostHog | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
        capture_pageview: false, // Gerenciado manualmente pelo App Router
        persistence: 'localStorage+cookie',
      });
      this.client = posthog;
    }
  }

  /**
   * Captures a generic event
   */
  capture(event: string, properties?: Record<string, any>) {
    if (this.client) {
      this.client.capture(event, properties);
    }
  }

  /**
   * Tracks a Lead Conversion
   */
  trackLead(source: string, propertyId?: string) {
    this.capture('lead_converted', {
      source,
      propertyId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Pageview tracking for Next.js 16 App Router
   */
  capturePageview() {
    if (this.client) {
      this.client.capture('$pageview');
    }
  }
}

export const analytics = new AnalyticsService();
