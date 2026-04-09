import Stripe from 'stripe'

// Inicializa o Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16.acacia',
    typescript: true,
})

// Tipos personalizados
export interface CreateCheckoutSessionParams {
    userId: string
    organizationId: string
    priceId: string
    mode: 'subscription' | 'payment'
    successUrl?: string
    cancelUrl?: string
    metadata?: Record<string, string>
}

export interface CreateCustomerPortalParams {
    customerId: string
    returnUrl?: string
}

export interface Subscription {
    id: string
    customerId: string
    priceId: string
    status: 'active' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'incomplete_expired'
    currentPeriodStart: Date
    currentPeriodEnd: Date
    cancelAtPeriodEnd: boolean
    trialEnd: Date | null
    createdAt: Date
    updatedAt: Date
}

// Funções principais

/**
 * Cria uma sessão de checkout do Stripe
 */
export async function createCheckoutSession(params: CreateCheckoutSessionParams) {
    const { userId, organizationId, priceId, mode, successUrl, cancelUrl, metadata } = params

    // Define URLs padrão se não forem fornecidas
    const defaultSuccessUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`
    const defaultCancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/pricing`

    try {
        const session = await stripe.checkout.sessions.create({
            customer_email: metadata?.email,
            mode,
            success_url: successUrl || defaultSuccessUrl,
            cancel_url: cancelUrl || defaultCancelUrl,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            metadata: {
                userId,
                organizationId,
                ...(metadata || {}),
            },
            allow_promotion_codes: true,
            billing_address_collection: mode === 'subscription' ? 'required' : 'auto',
            payment_method_types: ['card'],
        })

        return session
    } catch (error) {
        console.error('Error creating Stripe checkout session:', error)
        throw new Error('Failed to create checkout session')
    }
}

/**
 * Cria um cliente no Stripe
 */
export async function createCustomer(email: string, name?: string, metadata?: Record<string, string>) {
    try {
        const customer = await stripe.customers.create({
            email,
            name,
            metadata,
        })

        return customer
    } catch (error) {
        console.error('Error creating Stripe customer:', error)
        throw new Error('Failed to create customer')
    }
}

/**
 * Atualiza um cliente no Stripe
 */
export async function updateCustomer(customerId: string, data: {
    email?: string
    name?: string
    metadata?: Record<string, string>
}) {
    try {
        const customer = await stripe.customers.update(customerId, data)

        return customer
    } catch (error) {
        console.error('Error updating Stripe customer:', error)
        throw new Error('Failed to update customer')
    }
}

/**
 * Cria uma assinatura no Stripe
 */
export async function createSubscription(
    customerId: string,
    priceId: string,
    trialPeriodDays?: number,
    metadata?: Record<string, string>
) {
    try {
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [
                {
                    price: priceId,
                },
            ],
            trial_period_days: trialPeriodDays || 7, // Período de teste padrão de 7 dias
            metadata,
            expand: ['latest_invoice.payment_intent'],
        })

        return subscription
    } catch (error) {
        console.error('Error creating Stripe subscription:', error)
        throw new Error('Failed to create subscription')
    }
}

/**
 * Cancela uma assinatura no Stripe
 */
export async function cancelSubscription(subscriptionId: string, atPeriodEnd = true) {
    try {
        const subscription = await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: atPeriodEnd,
        })

        return subscription
    } catch (error) {
        console.error('Error canceling Stripe subscription:', error)
        throw new Error('Failed to cancel subscription')
    }
}

/**
 * Atualiza uma assinatura (upgrade/downgrade)
 */
export async function updateSubscription(
    subscriptionId: string,
    priceId: string,
    prorationBehavior: 'create_prorations' | 'none' = 'create_prorations'
) {
    try {
        const subscription = await stripe.subscriptions.update(subscriptionId, {
            items: [
                {
                    id: (await stripe.subscriptions.retrieve(subscriptionId)).items.data[0].id,
                    price: priceId,
                },
            ],
            proration_behavior: prorationBehavior,
        })

        return subscription
    } catch (error) {
        console.error('Error updating Stripe subscription:', error)
        throw new Error('Failed to update subscription')
    }
}

/**
 * Cria uma sessão do portal do cliente
 */
export async function createCustomerPortal(params: CreateCustomerPortalParams) {
    const { customerId, returnUrl } = params

    try {
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        })

        return portalSession
    } catch (error) {
        console.error('Error creating Stripe customer portal:', error)
        throw new Error('Failed to create customer portal')
    }
}

/**
 * Busca uma assinatura pelo ID
 */
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
            expand: ['latest_invoice.payment_intent'],
        })

        return subscription
    } catch (error) {
        console.error('Error retrieving Stripe subscription:', error)
        throw new Error('Failed to retrieve subscription')
    }
}

/**
 * Lista todas as assinaturas de um cliente
 */
export async function listSubscriptions(customerId: string): Promise<Stripe.Subscription[]> {
    try {
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'all',
            expand: ['data.latest_invoice.payment_intent'],
        })

        return subscriptions.data
    } catch (error) {
        console.error('Error listing Stripe subscriptions:', error)
        throw new Error('Failed to list subscriptions')
    }
}

/**
 * Busca um cliente pelo ID
 */
export async function getCustomer(customerId: string): Promise<Stripe.Customer> {
    try {
        const customer = await stripe.customers.retrieve(customerId)

        if (customer.deleted) {
            throw new Error('Customer has been deleted')
        }

        return customer as Stripe.Customer
    } catch (error) {
        console.error('Error retrieving Stripe customer:', error)
        throw new Error('Failed to retrieve customer')
    }
}

/**
 * Lista todos os preços (planos) disponíveis
 */
export async function listPrices(): Promise<Stripe.Price[]> {
    try {
        const prices = await stripe.prices.list({
            active: true,
            expand: ['data.product'],
        })

        return prices.data
    } catch (error) {
        console.error('Error listing Stripe prices:', error)
        throw new Error('Failed to list prices')
    }
}

/**
 * Busca um preço (plano) pelo ID
 */
export async function getPrice(priceId: string): Promise<Stripe.Price> {
    try {
        const price = await stripe.prices.retrieve(priceId, {
            expand: ['product'],
        })

        return price
    } catch (error) {
        console.error('Error retrieving Stripe price:', error)
        throw new Error('Failed to retrieve price')
    }
}

/**
 * Cria um produto no Stripe
 */
export async function createProduct(data: {
    name: string
    description?: string
    metadata?: Record<string, string>
}): Promise<Stripe.Product> {
    try {
        const product = await stripe.products.create(data)

        return product
    } catch (error) {
        console.error('Error creating Stripe product:', error)
        throw new Error('Failed to create product')
    }
}

/**
 * Atualiza um produto no Stripe
 */
export async function updateProduct(
    productId: string,
    data: {
        name?: string
        description?: string
        metadata?: Record<string, string>
    }
): Promise<Stripe.Product> {
    try {
        const product = await stripe.products.update(productId, data)

        return product
    } catch (error) {
        console.error('Error updating Stripe product:', error)
        throw new Error('Failed to update product')
    }
}

/**
 * Cria um preço (plano) para um produto
 */
export async function createPrice(data: {
    product: string
    unit_amount: number
    currency: string
    recurring?: {
        interval: 'day' | 'week' | 'month' | 'year'
        interval_count?: number
    }
    metadata?: Record<string, string>
}): Promise<Stripe.Price> {
    try {
        const price = await stripe.prices.create(data)

        return price
    } catch (error) {
        console.error('Error creating Stripe price:', error)
        throw new Error('Failed to create price')
    }
}

// Webhook handling utilities

/**
 * Verifica se o evento do Stripe é válido
 */
export function verifyStripeEvent(payload: Buffer, signature: string): Stripe.Event | null {
    try {
        const event = stripe.webhooks.constructEvent(
            payload,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )

        return event
    } catch (error) {
        console.error('Error verifying Stripe webhook:', error)
        return null
    }
}

/**
 * Mapeia eventos de webhook para ações
 */
export const webhookHandlers = {
    'customer.subscription.created': async (event: Stripe.Event) => {
        const subscription = event.data.object as Stripe.Subscription
        // Aqui você atualizaria seu banco de dados com a nova assinatura
        console.log('Subscription created:', subscription.id)
    },

    'customer.subscription.updated': async (event: Stripe.Event) => {
        const subscription = event.data.object as Stripe.Subscription
        // Aqui você atualizaria seu banco de dados com as mudanças na assinatura
        console.log('Subscription updated:', subscription.id)
    },

    'customer.subscription.deleted': async (event: Stripe.Event) => {
        const subscription = event.data.object as Stripe.Subscription
        // Aqui você atualizaria seu banco de dados para marcar a assinatura como cancelada
        console.log('Subscription deleted:', subscription.id)
    },

    'invoice.payment_succeeded': async (event: Stripe.Event) => {
        const invoice = event.data.object as Stripe.Invoice
        // Aqui você atualizaria seu banco de dados para marcar o pagamento como pago
        console.log('Payment succeeded for invoice:', invoice.id)
    },

    'invoice.payment_failed': async (event: Stripe.Event) => {
        const invoice = event.data.object as Stripe.Invoice
        // Aqui você notificaria o usuário sobre o pagamento falhado
        console.log('Payment failed for invoice:', invoice.id)
    },

    'customer.created': async (event: Stripe.Event) => {
        const customer = event.data.object as Stripe.Customer
        // Aqui você criaria um cliente em seu banco de dados
        console.log('Customer created:', customer.id)
    },
}

// Exporta a instância do Stripe para uso em outros lugares
export default stripe