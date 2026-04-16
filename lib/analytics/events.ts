/**
 * Business Analytics Event Tracking - ImobWeb 2026
 */

/**
 * Tracks billing-related events (subscriptions, payments, etc.)
 */
export async function trackBillingEvent(eventName: string, id: string, data: any) {
  console.log("[Analytics] : ", data);
}

/**
 * Tracks onboarding steps and completion
 */
export async function trackOnboardingEvent(step: string, data: any) {
  console.log("[Analytics] Onboarding: ", data);
}

/**
 * Tracks admin-related events (dashboard actions, user management, etc.)
 */
export async function trackAdminEvent(eventName: string, id: string, data: any) {
  console.log("[Analytics] Admin: ", data);
}
