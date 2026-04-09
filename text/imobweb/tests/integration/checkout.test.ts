import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../../app/api/billing/checkout.ts'; // Adjust path if needed
import { createCheckoutSession } from '@/lib/billing/stripe';
import { trackBillingEvent } from '@/lib/analytics/events';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/billing/stripe', () => ({
  createCheckoutSession: vi.fn(),
}));

vi.mock('@/lib/analytics/events', () => ({
  trackBillingEvent: vi.fn(),
}));

describe('Checkout API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 if required fields are missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({ userId: 'u123' }), // Missing others
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Missing required fields');
  });

  it('should create a stripe session and track event on success', async () => {
    const mockSession = { id: 'sess_123' };
    (createCheckoutSession as any).mockResolvedValue(mockSession);

    const body = {
      userId: 'u123',
      organizationId: 'o123',
      priceId: 'p123',
      mode: 'subscription',
    };

    const request = new NextRequest('http://localhost:3000/api/billing/checkout', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const response = await POST(request);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.sessionId).toBe('sess_123');
    
    expect(createCheckoutSession).toHaveBeenCalledWith(expect.objectContaining(body));
    expect(trackBillingEvent).toHaveBeenCalledWith('Checkout Initiated', 'sess_123', expect.any(Object));
  });

  it('should return 500 and track error if stripe fails', async () => {
    (createCheckoutSession as any).mockRejectedValue(new Error('Stripe Down'));

    const request = new NextRequest('http://localhost:3000/api/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'u123',
        organizationId: 'o123',
        priceId: 'p123',
        mode: 'subscription',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
    expect(trackBillingEvent).toHaveBeenCalledWith('Checkout Error', '', expect.objectContaining({
      error_message: 'Stripe Down'
    }));
  });
});
