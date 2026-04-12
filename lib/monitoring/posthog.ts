import posthog from 'posthog-js';

/**
 * PostHog Analytics helper for imobWeb.
 * Tracks custom business events for product intelligence and conversion tracking.
 */

const isBrowser = typeof window !== 'undefined';

export const initPostHog = () => {
  if (isBrowser && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      capture_pageview: false, // Handled manually or via nextjs router
      persistence: 'localStorage',
    });
  }
};

/**
 * Capture business events with custom properties.
 * Example: captureEvent('property_published', { price: 500000, type: 'CASA' })
 */
export const captureEvent = (eventName: string, properties?: Record<string, any>) => {
  if (isBrowser) {
    posthog.capture(eventName, {
      ...properties,
      $current_url: window.location.href,
      app_version: process.env.NEXT_PUBLIC_APP_VERSION,
    });
  }
};

/**
 * Identify user for cross-session tracking.
 */
export const identifyUser = (userId: string, traits?: Record<string, any>) => {
  if (isBrowser) {
    posthog.identify(userId, traits);
  }
};

/**
 * Reset PostHog session (usually on logout).
 */
export const resetSession = () => {
  if (isBrowser) {
    posthog.reset();
  }
};

/**
 * Built-in event shortcuts for imobWeb
 */
export const trackPropertyView = (propertyId: string, source: string) => {
  captureEvent('property_viewed', { propertyId, source });
};

export const trackLeadConversion = (leadId: string, propertyId: string) => {
  captureEvent('lead_converted', { leadId, propertyId });
};

export const trackWhatsAppSent = (direction: 'incoming' | 'outgoing', type: string) => {
  captureEvent('whatsapp_message', { direction, type });
};
