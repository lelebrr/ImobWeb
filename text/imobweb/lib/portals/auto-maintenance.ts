import { PropertyStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { differenceInDays } from 'date-fns';

/**
 * Serviço de Manutenção Automática de Inventário
 * Responsável por garantir que dados obsoletos não sejam propagados para os portais.
 */
export class AutoMaintenance {
  private readonly STALE_THRESHOLD_DAYS = 30;

  /**
   * Varre o banco de dados em busca de imóveis desatualizados
   */
  async checkStaleListings() {
    console.log('[AutoMaintenance] Checking for stale listings...');
    
    const activeProperties = await prisma.property.findMany({
      where: { 
        status: 'DISPONIVEL',
        updatedAt: {
          lt: new Date(Date.now() - this.STALE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000)
        }
      }
    });

    const results = [];

    for (const property of activeProperties) {
      // 1. Atualizar status para DESATUALIZADO
      await prisma.property.update({
        where: { id: property.id },
        data: { status: 'DESATUALIZADO' }
      });

      // 2. Suspender anúncios nos portais
      await prisma.announcement.updateMany({
        where: { propertyId: property.id },
        data: { status: 'SUSPENSO' }
      });

      // 3. Registrar auditoria (opcional - assumindo que a IA 4 fez o AuditLog)
      // await auditService.log(...)

      results.push({ id: property.id, title: property.title });
    }

    console.log(`[AutoMaintenance] ${results.length} listings suspended due to age.`);
    return results;
  }

  /**
   * Gatilho para notificação WhatsApp (Simulação)
   * Integraria com o serviço da IA 6
   */
  async notifyOwnersOfStaleListings(propertyIds: string[]) {
    // Aqui chamariamos o whatsappService da IA 6 para cada proprietário
    console.log(`[AutoMaintenance] Logic triggered for ${propertyIds.length} ownership notifications via WhatsApp.`);
  }
}

export const autoMaintenance = new AutoMaintenance();
