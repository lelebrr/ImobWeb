import { LeadSource, LeadStatus, PropertyType, BusinessType } from '@prisma/client';

/**
 * Processador de Leads recebidos de Portais (Webhooks)
 * Converte formatos específicos (Zap, OLX, etc.) para o modelo interno do imobWeb.
 */
export class PortalParser {
  /**
   * Converte um lead recebido do Grupo OLX (Zap/VivaReal)
   */
  parseOLXLead(data: any) {
    return {
      name: data.lead?.name || 'Lead sem nome',
      email: data.lead?.email,
      phone: data.lead?.phone,
      whatsapp: data.lead?.phone, // Assume que o cel do lead é WhatsApp
      status: 'NOVO' as LeadStatus,
      source: 'PORTAL' as LeadSource,
      budget: data.property?.price,
      notes: `Lead vindo do portal: ${data.portal || 'OLX Group'}\nMensagem: ${data.lead?.message || ''}`,
      sourceDetails: {
        portal: data.portal,
        externalId: data.property?.externalId,
        url: data.property?.url
      },
      // Busca propertyId por externalId depois no service
      externalPropertyId: data.property?.externalId
    };
  }

  /**
   * Converte um lead vindo via XML de outros portais (fallback)
   */
  parseGenericLead(data: any) {
    // Implementação para formatos legados ou outros portais via RSS/Email
    return {
      name: data.name || 'Interessado',
      email: data.email,
      phone: data.phone,
      source: 'PORTAL' as LeadSource,
      status: 'NOVO' as LeadStatus,
    };
  }
}

export const portalParser = new PortalParser();
