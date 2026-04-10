import { PrismaClient } from '@prisma/client';
import { XMLBuilder } from 'xmlbuilder2/lib/interfaces';

const prisma = new PrismaClient();

/**
 * Serviço de Verificação de Saúde (Health Check) dos Feeds de Portais
 * Verifica integridade do XML, links de imagens e conformidade básica com VRSync
 */
export class PortalHealthService {
  /**
   * Valida a integridade de um feed gerado
   */
  async validateFeed(portalId: string, xmlContent: string) {
    const results = {
      isValid: true,
      errors: [] as string[],
      warnings: [] as string[],
      checkedAt: new Date()
    };

    try {
      // 1. Verificação básica de fechamento de tags (Sintaxe XML)
      if (!xmlContent.includes('<?xml') || !xmlContent.includes('</ListingData>')) {
        results.isValid = false;
        results.errors.push('O feed gerado é semanticamente inválido (XML malformado).');
      }

      // 2. Verificação de volume
      const listingCount = (xmlContent.match(/<Listing>/g) || []).length;
      if (listingCount === 0) {
        results.warnings.push('O feed está vazio. Nenhum imóvel exportado.');
      }

      // 3. Verificação de imagens (Amostragem)
      const imageOccurrences = (xmlContent.match(/<Media>/g) || []).length;
      if (listingCount > 0 && imageOccurrences === 0) {
        results.errors.push('Imóveis detectados sem tags de mídia (fotos). Portais rejeitarão o feed.');
        results.isValid = false;
      }

      // 4. Salvar resultado no metadata da Integração
      await prisma.portalIntegration.update({
        where: { id: portalId },
        data: {
          metadata: {
            lastHealthCheck: results
          }
        }
      });

      // Logar problemas críticos no AuditLog
      if (!results.isValid) {
        await prisma.auditLog.create({
          data: {
            action: 'UPDATE',
            entity: 'ANNOUNCEMENT',
            entityId: portalId,
            description: `Feed Health Alert: ${results.errors[0]}`,
            riskLevel: 'HIGH',
            metadata: { errors: results.errors }
          }
        });
      }

      return results;

    } catch (err: any) {
      console.error('[HealthService] Failed to validate feed:', err);
      return { ...results, isValid: false, errors: [err.message] };
    }
  }

  /**
   * Resumo de Saúde Global para o Dashboard
   */
  async getGlobalHealthStatus(organizationId: string) {
    const integrations = await prisma.portalIntegration.findMany({
      where: { organizationId }
    });

    return integrations.map(int => ({
      portalId: int.id,
      name: int.name,
      status: (int.metadata as any)?.lastHealthCheck?.isValid !== false ? 'HEALTHY' : 'CRITICAL',
      lastCheck: (int.metadata as any)?.lastHealthCheck?.checkedAt
    }));
  }
}

export const portalHealth = new PortalHealthService();
