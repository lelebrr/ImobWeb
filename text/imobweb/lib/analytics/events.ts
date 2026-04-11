/**
 * Business Analytics Event Tracking - ImobWeb 2026
 */

/**
 * Tracks billing-related events (subscriptions, payments, etc.)
 */
export async function trackBillingEvent(eventName: string, id: string, data: any) {
  console.log(`[Analytics] ${eventName}: ${id}`, data);
}
