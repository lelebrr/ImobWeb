import { NextRequest, NextResponse } from 'next/server'
import { createCustomerPortal, cancelSubscription, updateSubscription } from '@/lib/billing/stripe'
import { trackBillingEvent } from '@/lib/analytics/events'

interface ManageSubscriptionRequestBody {
    action: 'portal' | 'cancel' | 'upgrade' | 'downgrade'
    subscriptionId?: string
    newPriceId?: string
    customerId: string
    returnUrl?: string
}

export async function POST(request: NextRequest) {
    try {
        const body: ManageSubscriptionRequestBody = await request.json()

        // Valida os campos necessários
        const { action, customerId, returnUrl } = body

        if (!action || !customerId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        switch (action) {
            case 'portal':
                // Abre o portal do cliente
                const portalSession = await createCustomerPortal({
                    customerId,
                    returnUrl: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
                })

                // Track the portal access
                trackBillingEvent('Customer Portal Accessed', portalSession.id, {
                    customer_id: customerId,
                })

                return NextResponse.json({ portalUrl: portalSession.url })

            case 'cancel':
                // Cancela a assinatura
                if (!body.subscriptionId) {
                    return NextResponse.json(
                        { error: 'Subscription ID is required for cancellation' },
                        { status: 400 }
                    )
                }

                const canceledSubscription = await cancelSubscription(
                    body.subscriptionId,
                    true // Cancel no final do período
                )

                // Track the cancellation
                trackBillingEvent('Subscription Canceled', canceledSubscription.id, {
                    customer_id: customerId,
                    subscription_id: body.subscriptionId,
                })

                return NextResponse.json({
                    subscriptionId: canceledSubscription.id,
                    status: canceledSubscription.status,
                    cancelAtPeriodEnd: canceledSubscription.cancel_at_period_end,
                })

            case 'upgrade':
            case 'downgrade':
                // Atualiza a assinatura (upgrade/downgrade)
                if (!body.subscriptionId || !body.newPriceId) {
                    return NextResponse.json(
                        { error: 'Subscription ID and new Price ID are required for update' },
                        { status: 400 }
                    )
                }

                const updatedSubscription = await updateSubscription(
                    body.subscriptionId,
                    body.newPriceId
                )

                // Track the update
                trackBillingEvent('Subscription Updated', updatedSubscription.id, {
                    customer_id: customerId,
                    subscription_id: body.subscriptionId,
                    new_price_id: body.newPriceId,
                    action: action,
                })

                return NextResponse.json({
                    subscriptionId: updatedSubscription.id,
                    priceId: updatedSubscription.items.data[0].price.id,
                    status: updatedSubscription.status,
                })

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                )
        }
    } catch (error) {
        console.error('Error managing subscription:', error)

        // Track the error
        trackBillingEvent('Subscription Management Error', '', {
            error_message: error instanceof Error ? error.message : 'Unknown error',
            action: body?.action,
        })

        return NextResponse.json(
            { error: 'Failed to manage subscription' },
            { status: 500 }
        )
    }
}

// Função auxiliar para obter o status da assinatura
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const subscriptionId = searchParams.get('subscriptionId')
    const customerId = searchParams.get('customerId')

    if (!subscriptionId && !customerId) {
        return NextResponse.json(
            { error: 'Subscription ID or Customer ID is required' },
            { status: 400 }
        )
    }

    try {
        // Se temos o ID da assinatura, buscamos diretamente
        if (subscriptionId) {
            const subscription = await getSubscription(subscriptionId)
            return NextResponse.json({
                subscriptionId: subscription.id,
                status: subscription.status,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
            })
        }

        // Se temos apenas o ID do cliente, buscamos todas as assinaturas
        if (customerId) {
            const subscriptions = await listSubscriptions(customerId)
            return NextResponse.json({
                customerId,
                subscriptions: subscriptions.map(sub => ({
                    id: sub.id,
                    status: sub.status,
                    currentPeriodStart: new Date(sub.current_period_start * 1000),
                    currentPeriodEnd: new Date(sub.current_period_end * 1000),
                    cancelAtPeriodEnd: sub.cancel_at_period_end,
                    trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
                })),
            })
        }
    } catch (error) {
        console.error('Error fetching subscription:', error)
        return NextResponse.json(
            { error: 'Failed to fetch subscription' },
            { status: 500 }
        )
    }
}