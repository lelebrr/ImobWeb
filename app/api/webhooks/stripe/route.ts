import { NextRequest, NextResponse } from 'next/server'
import { handleWebhook } from '@/lib/billing/webhooks'

export async function POST(request: NextRequest) {
    try {
        // Processa o webhook
        const response = await handleWebhook(request)
        return response
    } catch (error) {
        console.error('Error handling Stripe webhook:', error)
        return new NextResponse('Webhook Error', { status: 500 })
    }
}
