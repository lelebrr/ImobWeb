/**
 * Stripe Billing Integration - ImobWeb 2026
 */

import Stripe from "stripe"

let stripeInstance: Stripe | null = null

function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY environment variable is required for billing operations")
    }
    stripeInstance = new Stripe(key, { apiVersion: "2025-02-24.acacia" as any })
  }
  return stripeInstance
}

export const createCheckoutSession = async (data: {
  userId: string;
  organizationId: string;
  priceId: string;
  mode: 'subscription' | 'payment';
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, any>;
}) => {
  const stripe = getStripe()

  const session = await stripe.checkout.sessions.create({
    mode: data.mode,
    payment_method_types: ["card", "boleto", "pix"],
    line_items: [
      {
        price: data.priceId,
        quantity: 1,
      },
    ],
    success_url: data.successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: data.cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/billing/cancel`,
    metadata: {
      userId: data.userId,
      organizationId: data.organizationId,
      ...data.metadata,
    },
    allow_promotion_codes: true,
  })

  return {
    id: session.id,
    url: session.url!,
  }
}

export const createCustomerPortal = async (customerId: string, returnUrl?: string) => {
  const stripe = getStripe()

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
  })

  return {
    id: portalSession.id,
    url: portalSession.url,
  }
}

export const cancelSubscription = async (subscriptionId: string, cancelAtPeriodEnd?: boolean) => {
  const stripe = getStripe()

  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: cancelAtPeriodEnd ?? true,
  })

  return {
    id: subscription.id,
    status: subscription.status,
    cancel_at_period_end: subscription.cancel_at_period_end,
  }
}

export const updateSubscription = async (subscriptionId: string, newPriceId: string) => {
  const stripe = getStripe()

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const existingItem = subscription.items.data[0]

  if (!existingItem) {
    throw new Error("No existing subscription item found")
  }

  const updated = await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: existingItem.id,
        price: newPriceId,
      },
    ],
    proration_behavior: "create_prorations",
  })

  return {
    id: updated.id,
    status: updated.status,
    items: updated.items,
  }
}

/**
 * Create a Stripe customer for an organization
 */
export const createCustomer = async (data: {
  organizationId: string;
  name: string;
  email: string;
  phone?: string;
}) => {
  const stripe = getStripe()

  const customer = await stripe.customers.create({
    name: data.name,
    email: data.email,
    phone: data.phone,
    metadata: {
      organizationId: data.organizationId,
    },
  })

  return {
    id: customer.id,
    email: customer.email,
    name: customer.name,
  }
}

/**
 * Validate Stripe webhook signature
 */
export const validateWebhookSignature = (payload: string, signature: string): boolean => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.warn("[Stripe] STRIPE_WEBHOOK_SECRET not configured")
    return false
  }

  try {
    Stripe.webhooks.constructEvent(payload, signature, webhookSecret)
    return true
  } catch (err) {
    console.error("[Stripe] Webhook signature validation failed:", err)
    return false
  }
}