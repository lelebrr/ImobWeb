import { headers } from 'next/headers'
import { stripe } from './stripe'
import { webhookHandlers } from './stripe'
import { trackBillingEvent } from '@/lib/analytics/events'
import { db } from '@/lib/db' // Presumindo que você tem um arquivo de configuração do Prisma

/**
 * Processa eventos do Stripe webhook
 * @param request Request HTTP
 * @returns Response HTTP
 */
export async function handleWebhook(request: Request) {
    const body = await request.text()
    const signature = headers().get('stripe-signature')!

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (err) {
        console.error('Webhook signature verification failed:', err)
        return new Response('Webhook Error: Invalid signature', { status: 400 })
    }

    // Processa o evento
    try {
        const handler = webhookHandlers[event.type as keyof typeof webhookHandlers]

        if (handler) {
            await handler(event)

            // Track the webhook event
            trackBillingEvent('Webhook Received', event.id, {
                event_type: event.type,
            })
        } else {
            console.log(`Unhandled event type: ${event.type}`)
        }

        return new Response('Webhook processed successfully', { status: 200 })
    } catch (err) {
        console.error('Error processing webhook:', err)
        return new Response('Webhook Error: Failed to process event', { status: 500 })
    }
}

/**
 * Função para lidar com eventos específicos do Stripe
 */
export const handleStripeEvents = {
    /**
     * Quando uma nova assinatura é criada
     */
    async subscriptionCreated(event: Stripe.Event) {
        const subscription = event.data.object as Stripe.Subscription

        // Atualiza o banco de dados com a nova assinatura
        await db.organization.update({
            where: {
                stripeCustomerId: subscription.customer as string,
            },
            data: {
                subscription: {
                    create: {
                        stripeSubscriptionId: subscription.id,
                        stripePriceId: subscription.items.data[0].price.id,
                        status: subscription.status,
                        currentPeriodStart: new Date(subscription.current_period_start * 1000),
                        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                        cancelAtPeriodEnd: subscription.cancel_at_period_end,
                        trialEnd: subscription.trial_end
                            ? new Date(subscription.trial_end * 1000)
                            : null,
                        metadata: subscription.metadata,
                    },
                },
            },
        })

        // Track the event
        trackBillingEvent('Subscription Created', subscription.id, {
            customer_id: subscription.customer,
            price_id: subscription.items.data[0].price.id,
            status: subscription.status,
        })
    },

    /**
     * Quando uma assinatura é atualizada
     */
    async subscriptionUpdated(event: Stripe.Event) {
        const subscription = event.data.object as Stripe.Subscription

        // Atualiza o banco de dados com as mudanças na assinatura
        await db.subscription.update({
            where: {
                stripeSubscriptionId: subscription.id,
            },
            data: {
                status: subscription.status,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                trialEnd: subscription.trial_end
                    ? new Date(subscription.trial_end * 1000)
                    : null,
                metadata: subscription.metadata,
            },
        })

        // Track the event
        trackBillingEvent('Subscription Updated', subscription.id, {
            customer_id: subscription.customer,
            price_id: subscription.items.data[0].price.id,
            status: subscription.status,
            cancel_at_period_end: subscription.cancel_at_period_end,
        })
    },

    /**
     * Quando uma assinatura é cancelada
     */
    async subscriptionDeleted(event: Stripe.Event) {
        const subscription = event.data.object as Stripe.Subscription

        // Atualiza o banco de dados para marcar a assinatura como cancelada
        await db.subscription.update({
            where: {
                stripeSubscriptionId: subscription.id,
            },
            data: {
                status: 'canceled',
                canceledAt: new Date(),
            },
        })

        // Track the event
        trackBillingEvent('Subscription Canceled', subscription.id, {
            customer_id: subscription.customer,
            cancel_at_period_end: subscription.cancel_at_period_end,
        })
    },

    /**
     * Quando um pagamento é bem-sucedido
     */
    async invoicePaid(event: Stripe.Event) {
        const invoice = event.data.object as Stripe.Invoice

        // Atualiza o banco de dados para marcar o pagamento como pago
        await db.subscription.update({
            where: {
                stripeSubscriptionId: invoice.subscription as string,
            },
            data: {
                status: 'active',
                lastPaymentDate: new Date(),
                lastPaymentAmount: invoice.amount_paid,
            },
        })

        // Track the event
        trackBillingEvent('Invoice Paid', invoice.id, {
            customer_id: invoice.customer,
            amount_paid: invoice.amount_paid,
            currency: invoice.currency,
            subscription_id: invoice.subscription,
        })
    },

    /**
     * Quando um pagamento falha
     */
    async invoicePaymentFailed(event: Stripe.Event) {
        const invoice = event.data.object as Stripe.Invoice

        // Notifica o usuário sobre o pagamento falhado
        // Em uma implementação real, você enviaria um email ou notificação
        await db.organization.update({
            where: {
                stripeCustomerId: invoice.customer as string,
            },
            data: {
                paymentFailed: true,
                lastPaymentFailedDate: new Date(),
            },
        })

        // Track the event
        trackBillingEvent('Invoice Payment Failed', invoice.id, {
            customer_id: invoice.customer,
            amount_due: invoice.amount_due,
            currency: invoice.currency,
            subscription_id: invoice.subscription,
        })
    },

    /**
     * Quando um novo cliente é criado no Stripe
     */
    async customerCreated(event: Stripe.Event) {
        const customer = event.data.object as Stripe.Customer

        // Cria um registro no banco de dados para o novo cliente
        await db.customer.create({
            data: {
                stripeCustomerId: customer.id,
                email: customer.email,
                name: customer.name,
                metadata: customer.metadata,
            },
        })

        // Track the event
        trackBillingEvent('Customer Created', customer.id, {
            email: customer.email,
            name: customer.name,
        })
    },

    /**
     * Quando um cliente é atualizado no Stripe
     */
    async customerUpdated(event: Stripe.Event) {
        const customer = event.data.object as Stripe.Customer

        // Atualiza o registro no banco de dados
        await db.customer.update({
            where: {
                stripeCustomerId: customer.id,
            },
            data: {
                email: customer.email,
                name: customer.name,
                metadata: customer.metadata,
            },
        })

        // Track the event
        trackBillingEvent('Customer Updated', customer.id, {
            email: customer.email,
            name: customer.name,
        })
    },
}

// Função utilitária para calcular o valor baseado no uso
export function calculateUsageBasedPrice(
    basePrice: number,
    usage: number,
    pricingModel: 'per_unit' | 'tiered'
): number {
    if (pricingModel === 'per_unit') {
        return basePrice * usage
    } else if (pricingModel === 'tiered') {
        // Implementa lógica de pricing tiered
        // Exemplo: primeiros 100 unidades a R$ 1, próximas 500 a R$ 0.80, etc.
        if (usage <= 100) {
            return basePrice * usage
        } else if (usage <= 600) {
            return (100 * basePrice) + ((usage - 100) * basePrice * 0.8)
        } else {
            return (100 * basePrice) + (500 * basePrice * 0.8) + ((usage - 600) * basePrice * 0.6)
        }
    }

    return basePrice * usage
}

// Função utilitária para formatar valores para exibição
export function formatPrice(amount: number, currency = 'BRL'): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency,
    }).format(amount / 100) // O Stripe usa centavos
}

// Função utilitária para calcular pró-rata
export function calculateProration(
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    newPeriodStart: Date,
    newPeriodEnd: Date,
    amount: number
): number {
    const currentPeriodDuration = currentPeriodEnd.getTime() - currentPeriodStart.getTime()
    const newPeriodDuration = newPeriodEnd.getTime() - newPeriodStart.getTime()
    const overlappingDuration = Math.min(currentPeriodEnd.getTime(), newPeriodEnd.getTime()) -
        Math.max(currentPeriodStart.getTime(), newPeriodStart.getTime())

    return Math.round((overlappingDuration / currentPeriodDuration) * amount)
}