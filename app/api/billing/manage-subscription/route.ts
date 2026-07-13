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

        const { action, customerId, returnUrl } = body

        if (!action || !customerId) {
            return NextResponse.json(
                { error: 'Action and customerId are required' },
                { status: 400 }
            )
        }

        switch (action) {
            case 'portal': {
                const portalSession = await createCustomerPortal(
                    customerId,
                    returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
                )

                await trackBillingEvent('Customer Portal Accessed', portalSession.id, {
                    customer_id: customerId,
                })

                return NextResponse.json({ url: portalSession.url })
            }

            case 'cancel': {
                if (!body.subscriptionId) {
                    return NextResponse.json(
                        { error: 'subscriptionId is required for cancel action' },
                        { status: 400 }
                    )
                }

                const canceledSubscription = await cancelSubscription(
                    body.subscriptionId,
                    true
                )

                await trackBillingEvent('Subscription Canceled', canceledSubscription.id, {
                    customer_id: customerId,
                    subscriptionId: canceledSubscription.id,
                    status: canceledSubscription.status,
                    cancelAtPeriodEnd: canceledSubscription.cancel_at_period_end,
                })

                return NextResponse.json({
                    success: true,
                    subscription: canceledSubscription,
                })
            }

            case 'upgrade':
            case 'downgrade': {
                if (!body.subscriptionId || !body.newPriceId) {
                    return NextResponse.json(
                        { error: 'subscriptionId and newPriceId are required for upgrade/downgrade action' },
                        { status: 400 }
                    )
                }

                const updatedSubscription = await updateSubscription(
                    body.subscriptionId,
                    body.newPriceId
                )

                await trackBillingEvent('Subscription Updated', updatedSubscription.id, {
                    customer_id: customerId,
                    subscriptionId: updatedSubscription.id,
                    priceId: (updatedSubscription.items as any).data[0].price.id,
                    status: updatedSubscription.status,
                })

                return NextResponse.json({
                    success: true,
                    subscription: updatedSubscription,
                })
            }

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                )
        }
    } catch (error) {
        console.error('Error managing subscription:', error)

        await trackBillingEvent('Subscription Management Error', '', {
            error_message: error instanceof Error ? error.message : 'Unknown error',
            action: 'unknown',
        })

        return NextResponse.json(
            { error: 'Failed to manage subscription' },
            { status: 500 }
        )
    }
}
