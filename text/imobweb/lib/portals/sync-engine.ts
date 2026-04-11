import { PrismaClient } from '@prisma/client';
import { SyncResult, SyncStatus, PortalType } from '../../types/portals';
import { portalValidator } from './validator';
import { autoMaintenance } from './auto-maintenance';

const prisma = new PrismaClient();

/**
 * Motor de Sincronização Bidirecional Avançado (Sync Engine)
 * Responsável por orquestrar a publicação e atualização de imóveis nos portais.
 */
export class SyncEngine {
  /**
   * Sincroniza um imóvel específico com um portal
   */
  async syncProperty(propertyId: string, portalId: string): Promise<SyncResult> {
    const timestamp = new Date();
    
    // 1. Buscar dados do imóvel e da integração
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { photos: true, announcements: { where: { portalId } } }
    });

    const integration = await prisma.portalIntegration.findUnique({
      where: { id: portalId }
    });

    if (!property || !integration) {
      return {
        success: false,
        portalId,
        propertyId,
        timestamp,
        error: 'Property or Integration not found'
      };
    }

    try {
      // 2. Detecção de Conflitos
      // Se o imóvel foi alterado no portal após a última sincronização do CRM
      const announcement = property.announcements[0];
      if (announcement?.lastSync && announcement.updatedAt > announcement.lastSync) {
        // Lógica de conflito: Aqui poderíamos disparar um alerta ou seguir regra pré-definida
        console.warn(`[SyncEngine] Conflict detected for property ${propertyId} on portal ${portalId}`);
        // Por padrão, CRM vence em 2026, mas marcamos como conflito para revisão
      }

      // 1. Validar imóvel para o portal específico
      const { valid, errors } = portalValidator.validate(property, integration.type as any);
      if (!valid) {
        return { 
          success: false, 
          portalId,
          propertyId,
          timestamp,
          error: `Validation failed: ${errors.join(', ')}`
        };
      }

      // 4. Executar Sincronização (Simulação de Push ou Atualização de Feed)
      // Se for um portal via API (OLX Pro), fazemos o POST/PATCH
      // Se for via XML, apenas marcamos como pronto para o próximo crawl
      
      const externalId = announcement?.externalId || `imob-${property.code || property.id}`;

      // Atualizar status do anúncio
      await prisma.announcement.upsert({
        where: { 
          externalId_portalId: { 
            externalId, 
            portalId 
          } 
        },
        create: {
          propertyId,
          portalId,
          externalId,
          title: property.title,
          portalType: integration.type,
          status: 'PUBLICADO',
          lastSync: timestamp,
          price: property.price
        },
        update: {
          title: property.title,
          status: 'PUBLICADO',
          lastSync: timestamp,
          price: property.price
        }
      });

      return {
        success: true,
        portalId,
        propertyId,
        externalId,
        timestamp,
        details: { action: announcement ? 'UPDATE' : 'CREATE' }
      };

    } catch (error: any) {
      console.error(`[SyncEngine] Error syncing property ${propertyId}:`, error);
      return {
        success: false,
        portalId,
        propertyId,
        timestamp,
        error: error.message
      };
    }
  }

  /**
   * Valida se o imóvel atende aos requisitos mínimos do portal desejado
   */
  private validateForPortal(property: any, type: PortalType): string[] {
    const errors: string[] = [];
    
    if (!property.title) errors.push('Title is required');
    if (!property.price && !property.priceRent) errors.push('Price is required');
    if (!property.photos || property.photos.length === 0) errors.push('At least one photo is required');
    
    // Regras específicas do Grupo OLX (Zap/VivaReal)
    if (['ZAP', 'VIVAREAL'].includes(type)) {
      if (!property.address) errors.push('Full address is required for Zap/VivaReal');
      if (property.photos.length < 3) errors.push('Zap requires at least 3 photos for better ranking');
    }

    return errors;
  }

  /**
   * Força a sincronização completa de todos os imóveis ativos para um portal
   */
  async syncAll(portalId: string): Promise<SyncResult[]> {
    const integration = await prisma.portalIntegration.findUnique({
      where: { id: portalId }
    });

    if (!integration) throw new Error('Integration not found');

    const activeProperties = await prisma.property.findMany({
      where: { 
        status: 'DISPONIVEL',
        organizationId: integration.id // Simplificação: assume integração pertence à org
      },
      select: { id: true }
    });

    const results = await Promise.all(
      activeProperties.map(p => this.syncProperty(p.id, portalId))
    );

    // Atualizar stats da integração
    await prisma.portalIntegration.update({
      where: { id: portalId },
      data: {
        lastSync: new Date(),
        syncCount: { increment: 1 },
        errorCount: results.filter(r => !r.success).length
      }
    });

    return results;
  }

  /**
   * Executa a rotina de manutenção automática
   */
  async runMaintenance() {
    const staleListings = await autoMaintenance.checkStaleListings();
    if (staleListings.length > 0) {
      await autoMaintenance.notifyOwnersOfStaleListings(staleListings.map(l => l.id));
    }
    return { count: staleListings.length };
  }
}

export const syncEngine = new SyncEngine();
