/**
 * Stripe Billing Integration - ImobWeb 2026
 */

export const createCheckoutSession = async (data: {
  userId: string;
  organizationId: string;
  priceId: string;
  mode: 'subscription' | 'payment';
}) => {
  console.log('[Stripe] Creating checkout session for', data);
  return {
    id: `sess_${Math.random().toString(36).substr(2, 9)}`,
    url: 'https://checkout.stripe.com/pay/p_mock',
  };
};
