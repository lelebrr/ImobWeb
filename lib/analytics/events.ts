import { capture } from './posthog'

// Landing page events
export const LANDING_PAGE_VIEWED = 'Landing Page Viewed'
export const PRICING_PAGE_VIEWED = 'Pricing Page Viewed'
export const CTA_CLICKED = 'CTA Clicked'
export const SIGNUP_STARTED = 'Signup Started'

// Onboarding events
export const ONBOARDING_STARTED = 'Onboarding Started'
export const ONBOARDING_STEP_COMPLETED = 'Onboarding Step Completed'
export const ORGANIZATION_CREATED = 'Organization Created'
export const PLAN_SELECTED = 'Plan Selected'
export const BILLING_INFO_SUBMITTED = 'Billing Info Submitted'

// Admin events
export const ADMIN_DASHBOARD_VIEWED = 'Admin Dashboard Viewed'
export const ORGANIZATION_MANAGED = 'Organization Managed'
export const BROADCAST_SENT = 'Broadcast Sent'

// Property events
export const PROPERTY_CREATED = 'Property Created'
export const PROPERTY_UPDATED = 'Property Updated'
export const PROPERTY_DELETED = 'Property Deleted'
export const PROPERTY_VIEWED = 'Property Viewed'

// WhatsApp events
export const MESSAGE_SENT = 'Message Sent'
export const CONVERSATION_STARTED = 'Conversation Started'
export const LEAD_CONVERTED = 'Lead Converted'

// User events
export const USER_REGISTERED = 'User Registered'
export const USER_LOGIN = 'User Login'
export const USER_UPGRADED_PLAN = 'User Upgraded Plan'
export const USER_DOWNGRADED_PLAN = 'User Downgraded Plan'
export const USER_CANCELED_PLAN = 'User Canceled Plan'

// Função para capturar eventos de propriedade
export function trackPropertyEvent(event: string, propertyId: string, data?: any) {
    capture(event, {
        property_id: propertyId,
        ...data,
    })
}

// Função para capturar eventos de usuário
export function trackUserEvent(event: string, userId: string, data?: any) {
    capture(event, {
        user_id: userId,
        ...data,
    })
}

// Função para capturar eventos de organização
export function trackOrganizationEvent(event: string, organizationId: string, data?: any) {
    capture(event, {
        organization_id: organizationId,
        ...data,
    })
}

// Função para capturar eventos de conversa do WhatsApp
export function trackWhatsAppEvent(event: string, conversationId: string, data?: any) {
    capture(event, {
        conversation_id: conversationId,
        ...data,
    })
}

// Função para capturar eventos de onboarding
export function trackOnboardingEvent(event: string, step: number, data?: any) {
    capture(event, {
        onboarding_step: step,
        ...data,
    })
}

// Função para capturar eventos de billing
export function trackBillingEvent(event: string, subscriptionId: string, data?: any) {
    capture(event, {
        subscription_id: subscriptionId,
        ...data,
    })
}

// Função para capturar eventos de admin
export function trackAdminEvent(event: string, data?: any) {
    capture(event, {
        ...data,
    })
}

// Função para capturar eventos de erro
export function trackError(error: Error, context?: any) {
    capture('Error', {
        error_message: error.message,
        error_stack: error.stack,
        ...context,
    })
}