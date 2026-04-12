import posthog, { PostHog } from 'posthog-js';

/**
 * PostHog Integration for imobWeb
 * Focused on conversion funnels, lead behavior tracking, and product usage.
 */

export interface UserTraits {
  name?: string;
  email?: string;
  role?: 'admin' | 'corretor' | 'proprietario' | 'lead';
  plan?: string;
  [key: string]: any;
}

export interface SearchFilters {
  city?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  [key: string]: any;
}

class AnalyticsService {
  private client: PostHog | null = null;
  public isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      try {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
          capture_pageview: false, // Pageviews are routed safely through Next.js App Router hooks
          persistence: 'localStorage+cookie',
          autocapture: true, // Captures clicks, inputs automatically
          disable_session_recording: process.env.NODE_ENV === 'development',
        });
        this.client = posthog;
        this.isInitialized = true;
      } catch (error) {
        console.error('[Analytics] Failed to initialize PostHog', error);
      }
    }
  }

  /**
   * Identify a user to connect events across devices
   */
  public identify(userId: string, traits?: UserTraits) {
    if (this.client) {
      this.client.identify(userId, traits);
    }
  }

  /**
   * Reset session (usually on logout)
   */
  public reset() {
    if (this.client) {
      this.client.reset();
    }
  }

  /**
   * Captures a generic event
   */
  public capture(event: string, properties?: Record<string, any>) {
    if (this.client) {
      this.client.capture(event, properties);
    }
  }

  /**
   * Tracks a Lead Conversion (When a user submits a form on a property)
   */
  public trackLeadConversion(source: string, propertyId?: string, brokerId?: string) {
    this.capture('lead_converted', {
      source,
      propertyId,
      brokerId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Tracks Property Views
   */
  public trackPropertyView(propertyId: string, title?: string, value?: number, city?: string) {
    this.capture('property_viewed', {
      propertyId,
      title,
      value,
      city,
    });
  }

  /**
   * Tracks Search usage
   */
  public trackSearch(filters: SearchFilters, resultCount: number) {
    this.capture('search_performed', {
      ...filters,
      resultCount,
    });
  }

  /**
   * Subscription related tracking
   */
  public trackSubscription(planName: string, interval: 'monthly' | 'yearly', amount: number) {
    this.capture('subscription_started', {
      planName,
      interval,
      amount,
    });
  }

  /**
   * Track AI Feature usage
   */
  public trackAiUsage(feature: 'description_generation' | 'price_suggestion' | 'virtual_staging' | 'chat_owner', success: boolean) {
    this.capture('ai_feature_used', {
      feature,
      success,
    });
  }

  /**
   * Pageview tracking for Next.js App Router
   */
  public capturePageview(url?: string) {
    if (this.client) {
      this.client.capture('$pageview', {
        $current_url: url || (typeof window !== 'undefined' ? window.location.href : ''),
      });
    }
  }
}

export const analytics = new AnalyticsService();

// Provider component for PostHog
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return <>{ children } </>;
}
