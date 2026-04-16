/**
 * Stripe Billing Integration - ImobWeb 2026
 */

export const createCheckoutSession = async (data: {
  userId: string;
  organizationId: string;
  priceId: string;
  mode: 'subscription' | 'payment';
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, any>;
}) => {
  console.log('[Stripe] Creating checkout session for', data);
  return {
    id: `sess_${Math.random().toString(36).substr(2, 9)}`,
    url: 'https://checkout.stripe.com/pay/p_mock',
  };
};

export const createCustomerPortal = async (customerId: string, returnUrl?: string) => {
  console.log('[Stripe] Creating customer portal for', customerId);
  return {
    id: `portal_${Math.random().toString(36).substr(2, 9)}`,
    url: `https://dashboard.stripe.com/test/customers/${customerId}/billing`,
  };
};

export const cancelSubscription = async (subscriptionId: string, cancelAtPeriodEnd?: boolean) => {
  console.log('[Stripe] Cancelling subscription', subscriptionId);
  return {
    id: subscriptionId,
    status: 'canceled',
    cancel_at_period_end: cancelAtPeriodEnd || false,
  };
};

export const updateSubscription = async (subscriptionId: string, newPriceId: string) => {
  console.log('[Stripe] Updating subscription', subscriptionId, 'to', newPriceId);
  return {
    id: subscriptionId,
    status: 'active',
    items: {
      data: [
        {
          price: {
            id: newPriceId,
          },
        },
      ],
    },
  };
};