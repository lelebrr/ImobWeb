import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/billing/stripe'
import { trackBillingEvent } from '@/lib/analytics/events'

interface CheckoutRequestBody {
    userId: string
    organizationId: string
    priceId: string
    mode: 'subscription' | 'payment'
    successUrl?: string
    cancelUrl?: string
    metadata?: Record<string, string>
}

export async function POST(request: NextRequest) {
    try {
        const body: CheckoutRequestBody = await request.json()

        // Valida os campos obrigatórios
        const { userId, organizationId, priceId, mode } = body

        if (!userId || !organizationId || !priceId || !mode) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Cria a sessão de checkout
        const session = await createCheckoutSession({
            userId,
            organizationId,
            priceId,
            mode,
            successUrl: body.successUrl,
            cancelUrl: body.cancelUrl,
            metadata: body.metadata,
        })

        // Track the checkout initiation
        trackBillingEvent('Checkout Initiated', session.id, {
            user_id: userId,
            organization_id: organizationId,
            price_id: priceId,
            mode,
        })

        // Retorna a sessão de checkout
        return NextResponse.json({ sessionId: session.id })
    } catch (error) {
        console.error('Error creating checkout session:', error)

        // Track the error
        trackBillingEvent('Checkout Error', '', {
            error_message: error instanceof Error ? error.message : 'Unknown error',
        })

        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        )
    }
}