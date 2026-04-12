import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { portalParser } from '@/lib/xml-processor/parser';
import { portalAnalytics } from '@/lib/portals/analytics';

const prisma = new PrismaClient();

/**
 * Endpoint de Webhook para recepção de Leads dos portais (Zap, VivaReal, etc.)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 0. Identificar Organização (Baseline: primeira da lista ou fallback)
    const org = await prisma.organization.findFirst();
    if (!org) throw new Error('Organization not found');

    // 1. Parsear o lead de acordo com o portal (ex: OLX Group)
    const leadData = portalParser.parseOLXLead(body);

    // 2. Tentar encontrar o imóvel pelo externalId do anúncio
    let propertyId: string | undefined;
    if (leadData.externalPropertyId) {
      const announcement = await prisma.announcement.findFirst({
        where: { externalId: leadData.externalPropertyId }
      });
      propertyId = announcement?.propertyId;
    }

    // 4. Identificar corretor responsável pelo imóvel para atribuição
    let assignedUserId: string | null = null;
    if (propertyId) {
      const propertyResponsible = await prisma.user.findFirst({
        where: {
          properties: { some: { id: propertyId } }
        }
      });
      assignedUserId = propertyResponsible?.id || null;
    }

    // 5. Salvar o lead no banco
    const lead = await prisma.lead.create({
      data: {
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        whatsapp: leadData.whatsapp,
        status: leadData.status,
        source: leadData.source,
        notes: leadData.notes,
        sourceDetails: leadData.sourceDetails as any,
        organizationId: org.id,
        propertyId: propertyId,
        assignedToId: assignedUserId
      }
    });

    // 6. Track Analytics
    if (propertyId && leadData.sourceDetails?.portal) {
      await portalAnalytics.trackEvent(
        propertyId, 
        leadData.sourceDetails.portal, 
        'lead'
      );
    }

    // 7. Criar notificação para o corretor responsável (ou primeiro admin da org)
    const notificationUser = assignedUserId || (await prisma.user.findFirst({ where: { organizationId: org.id } }))?.id;
    
    if (notificationUser) {
      await prisma.notification.create({
        data: {
          title: 'Novo Lead do Portal',
          message: `${lead.name} se interessou por um imóvel via ${leadData.sourceDetails?.portal}.`,
          type: 'LEAD',
          userId: notificationUser
        }
      });
    }


    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });

  } catch (error: any) {
    console.error('[PortalWebhook] Error processing lead:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
