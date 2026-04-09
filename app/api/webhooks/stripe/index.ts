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

// Em uma implementação real, você também teria endpoints para:
// - GET /api/webhooks/stripe (para verificar se o webhook está ativo)
// - PUT /api/webhooks/stripe (para atualizar a URL do webhook)
// - DELETE /api/webhooks/stripe (para remover o webhook)

// Função para registrar um novo webhook
export async function registerWebhook() {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

    try {
        // Verifica se o webhook já existe
        const webhooks = await stripe.webhooks.list({
            limit: 100,
        })

        let webhook = webhooks.data.find(
            (wh: any) => wh.url === `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/stripe`
        )

        // Se não existir, cria um novo
        if (!webhook) {
            webhook = await stripe.webhooks.create({
                url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/stripe`,
                events: [
                    'customer.created',
                    'customer.updated',
                    'customer.subscription.created',
                    'customer.subscription.updated',
                    'customer.subscription.deleted',
                    'invoice.payment_succeeded',
                    'invoice.payment_failed',
                ],
                api_version: '2023-10-16.acacia',
            })

            console.log('Webhook created:', webhook.id)
        } else {
            console.log('Webhook already exists:', webhook.id)
        }

        return webhook
    } catch (error) {
        console.error('Error registering Stripe webhook:', error)
        throw new Error('Failed to register webhook')
    }
}

// Função para atualizar um webhook existente
export async function updateWebhook(webhookId: string, events: string[]) {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

    try {
        const webhook = await stripe.webhooks.update(webhookId, {
            events,
        })

        console.log('Webhook updated:', webhook.id)
        return webhook
    } catch (error) {
        console.error('Error updating Stripe webhook:', error)
        throw new Error('Failed to update webhook')
    }
}

// Função para remover um webhook
export async function deleteWebhook(webhookId: string) {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

    try {
        await stripe.webhooks.del(webhookId)
        console.log('Webhook deleted:', webhookId)
    } catch (error) {
        console.error('Error deleting Stripe webhook:', error)
        throw new Error('Failed to delete webhook')
    }
}

// Função para testar um webhook
export async function testWebhook(eventType: string) {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

    try {
        const event = await stripe.webhooks.generateTestEventHeader({
            type: eventType,
            data: {
                // Aqui você pode adicionar dados específicos para o teste
            },
        })

        console.log('Test webhook generated for event:', eventType)
        return event
    } catch (error) {
        console.error('Error generating test webhook:', error)
        throw new Error('Failed to generate test webhook')
    }
}