import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Handle Mandrill Webhooks
 * Ref: https://mailchimp.com/developer/transactional/docs/webhooks/
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const mandrillEvents = formData.get('mandrill_events');

    if (!mandrillEvents) {
      return new NextResponse('No events found', { status: 400 });
    }

    const events = JSON.parse(mandrillEvents as string);

    for (const event of events) {
      const messageId = event._id;
      const eventType = event.event; // 'send', 'deliver', 'open', 'click', 'bounce', 'spam', 'unsub', 'reject'

      const updateData: any = {};
      
      if (eventType === 'deliver') {
        updateData.status = 'ENTREGUE';
        updateData.deliveredAt = new Date();
      } else if (eventType === 'open') {
        updateData.status = 'LIDO';
        updateData.openedAt = new Date();
      } else if (eventType === 'click') {
        updateData.clickedAt = new Date();
      } else if (['bounce', 'spam', 'reject', 'fail'].includes(eventType)) {
        updateData.status = 'FALHOU';
        updateData.error = event.msg || eventType;
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.communicationUsage.update({
          where: { externalId: messageId },
          data: updateData,
        });
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error: any) {
    console.error('[WEBHOOK_MAILCHIMP]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// Habilitar a rota para aceitar solicitações HEAD se o Mandrill exigir para verificação
export async function HEAD() {
  return new NextResponse('OK', { status: 200 });
}
