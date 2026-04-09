import { PrismaClient } from '@prisma/client';
import { ChurnRisk } from '../../types/insights';

const prisma = new PrismaClient();

/**
 * Motor de Previsão de Churn.
 * Detecta riscos de perda de imóveis e cancelamento de imobiliárias.
 */
export class ChurnPredictor {
  /**
   * Predição de Churn de Imóvel (Risco do proprietário retirar o anúncio).
   */
  static async predictPropertyChurn(propertyId: string): Promise<ChurnRisk> {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        owner: true,
      },
    });

    if (!property) throw new Error('Property not found');

    let probability = 0.1; // Base risk
    const factors: string[] = [];
    const suggestedActions: string[] = [];

    // 1. Tempo sem atualização (Se > 30 dias, risco aumenta)
    const daysSinceUpdate = property.updatedAt 
      ? Math.floor((Date.now() - property.updatedAt.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    if (daysSinceUpdate > 60) {
      probability += 0.4;
      factors.push('Imóvel sem atualização há mais de 60 dias.');
      suggestedActions.push('Fazer uma chamada de cortesia para o proprietário.');
    } else if (daysSinceUpdate > 30) {
      probability += 0.2;
      factors.push('Imóvel desatualizado há 30 dias.');
      suggestedActions.push('Solicitar atualização de fotos ou status via WhatsApp.');
    }

    // 2. Análise de visualizações e leads
    if (property.views > 200 && (await prisma.lead.count({ where: { propertyId } })) === 0) {
      probability += 0.15;
      factors.push('Alta exposição mas sem leads gerados (proprietário pode estar frustrado).');
      suggestedActions.push('Sugerir ajuste de preço baseado no relatório de mercado.');
    }

    // 3. Proprietário Engajamento
    if (property.owner?.lastContact) {
      const daysSinceContact = Math.floor((Date.now() - property.owner.lastContact.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceContact > 45) {
        probability += 0.25;
        factors.push('Falta de contato direto com o proprietário há mais de 45 dias.');
        suggestedActions.push('Enviar um relatório de desempenho do anúncio para o proprietário hoje.');
      }
    }

    let riskLevel: ChurnRisk['riskLevel'] = 'LOW';
    if (probability > 0.8) riskLevel = 'CRITICAL';
    else if (probability > 0.6) riskLevel = 'HIGH';
    else if (probability > 0.3) riskLevel = 'MEDIUM';

    return {
      probability: Math.min(1, probability),
      riskLevel,
      factors,
      suggestedActions,
    };
  }

  /**
   * Predição de Churn de Imobiliária (Risco de cancelamento do SaaS).
   */
  static async predictOrganizationChurn(organizationId: string): Promise<ChurnRisk> {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        users: true,
        properties: true,
      },
    });

    if (!org) throw new Error('Organization not found');

    let probability = 0.05;
    const factors: string[] = [];
    const actions: string[] = [];

    // 1. Uso da plataforma
    const activeUsers = org.users.filter(u => u.lastLogin && (Date.now() - u.lastLogin.getTime()) < (1000 * 60 * 60 * 24 * 7));
    if (activeUsers.length === 0) {
      probability += 0.5;
      factors.push('Nenhum usuário logou na última semana.');
      actions.push('Entrar em contato com o gerente da imobiliária para entender o desuso.');
    }

    // 2. Volume de leads
    const leadsLast30Days = await prisma.lead.count({
      where: { 
        organizationId,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    });

    if (leadsLast30Days === 0 && org.properties.length > 0) {
      probability += 0.3;
      factors.push('Zero leads gerados nos últimos 30 dias.');
      actions.push('Revisar a publicação dos imóveis nos portais integrados.');
    }

    let riskLevel: ChurnRisk['riskLevel'] = 'LOW';
    if (probability > 0.7) riskLevel = 'CRITICAL';
    else if (probability > 0.4) riskLevel = 'HIGH';

    return {
      probability: Math.min(1, probability),
      riskLevel,
      factors,
      suggestedActions: actions,
    };
  }
}
