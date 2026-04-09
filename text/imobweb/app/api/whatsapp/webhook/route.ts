import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'
import { verifyWhatsAppSignature } from '@/lib/whatsapp/verify'
import { processIncomingMessage } from '@/lib/whatsapp/process-message'
import { processIncomingCall } from '@/lib/whatsapp/process-call'

const prisma = new PrismaClient()

/**
 * Webhook Handler para WhatsApp Business Cloud API
 * Recebe mensagens e chamadas do WhatsApp
 * 
 * Configuração no WhatsApp Business API:
 * - Endpoint: https://seu-dominio.com/api/whatsapp/webhook
 * - Verify Token: token-seguro-aleatorio
 * - Callback URL: https://graph.facebook.com/v19.0/YOUR_PHONE_NUMBER_ID/webhooks
 */

/**
 * Verificar assinatura do webhook (segurança)
 */
function verifySignature(request: NextRequest, signature: string, payload: string): boolean {
    // Em produção, isso deve ser feito com o token de verificação configurado no WhatsApp
    // const token = process.env.WHATSAPP_VERIFY_TOKEN
    // const expectedSignature = crypto
    //   .createHmac('sha256', token)
    //   .update(payload)
    //   .digest('base64')
    // return signature === expectedSignature

    // Para desenvolvimento, aceita qualquer assinatura
    return true
}

/**
 * POST /api/whatsapp/webhook
 * Recebe eventos do WhatsApp (mensagens, chamadas, status)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.text()
        const signature = request.headers.get('x-hub-signature-256')

        // Verificar assinatura
        if (!verifySignature(request, signature || '', body)) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }

        // Parsear o payload JSON
        const payload = JSON.parse(body)
        const entry = payload.entry?.[0]
        const changes = entry?.changes?.[0]
        const value = changes?.value
        const metadata = entry?.changes?.[0]?.value?.metadata
        const from = value?.messages?.[0]?.from
        const message = value?.messages?.[0]
        const call = value?.calls?.[0]
        const status = value?.statuses?.[0]

        // Log do webhook recebido
        console.log('[WhatsApp Webhook] Event received:', {
            type: payload.object,
            from,
            hasMessage: !!message,
            hasCall: !!call,
            hasStatus: !!status,
        })

        // Processar diferentes tipos de eventos
        if (message) {
            // Mensagem recebida
            return await processIncomingMessage(message, from)
        }

        if (call) {
            // Chamada recebida
            return await processIncomingCall(call, from)
        }

        if (status) {
            // Status de mensagem
            return await processMessageStatus(status, from)
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('[WhatsApp Webhook] Error processing webhook:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * GET /api/whatsapp/webhook
 * Verificação do webhook (necessário para registrar no WhatsApp)
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const mode = searchParams.get('hub.mode')
    const token = searchParams.get('hub.verify_token')
    const challenge = searchParams.get('hub.challenge')

    // Token de verificação configurado no WhatsApp Business API
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('[WhatsApp Webhook] Webhook verified successfully')
        return NextResponse.json(parseInt(challenge || '0'))
    }

    return NextResponse.json({ error: 'Invalid verification token' }, { status: 403 })
}

/**
 * Webhook Handler para atualização de status
 */
async function processMessageStatus(status: any, phoneNumber: string) {
    try {
        const messageId = status.message_id
        const statusType = status.status
        const timestamp = status.timestamp

        // Buscar mensagem no banco de dados
        const message = await prisma.conversation.findFirst({
            where: {
                externalId: messageId,
            },
        })

        if (!message) {
            console.log('[WhatsApp Webhook] Message not found:', messageId)
            return NextResponse.json({ received: true })
        }

        // Atualizar status da mensagem
        await prisma.conversation.update({
            where: { id: message.id },
            data: {
                status: statusType === 'sent' ? 'ENVIADO' : 'ENTREGUE',
                deliveredAt: new Date(timestamp * 1000),
            },
        })

        console.log('[WhatsApp Webhook] Message status updated:', {
            messageId,
            status: statusType,
        })

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('[WhatsApp Webhook] Error processing status:', error)
        return NextResponse.json({ error: 'Error processing status' }, { status: 500 })
    }
}

/**
 * Webhook Handler para chamadas
 */
async function processIncomingCall(call: any, phoneNumber: string) {
    try {
        const callId = call.id
        const callType = call.direction === 'inbound' ? 'ENTRADA' : 'SAÍDA'
        const from = call.from
        const to = call.to

        // Registrar chamada no banco de dados
        await prisma.conversation.create({
            data: {
                leadId: phoneNumber, // Em produção, buscar lead pelo número
                message: `Chamada ${callType} registrada`,
                direction: 'INCOMING',
                status: 'ATIVA',
                messageType: 'call',
                metadata: {
                    callId,
                    callType,
                    from,
                    to,
                    duration: call.creation_timestamp,
                },
            },
        })

        console.log('[WhatsApp Webhook] Call processed:', {
            callId,
            type: callType,
        })

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('[WhatsApp Webhook] Error processing call:', error)
        return NextResponse.json({ error: 'Error processing call' }, { status: 500 })
    }
}
