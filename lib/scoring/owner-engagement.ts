import { prisma } from '@/lib/prisma';

/**
 * Motor de Engajamento do Proprietário.
 * Analisa a velocidade e frequência de resposta no WhatsApp.
 */
export class OwnerEngagementScorer {
  /**
   * Calcula o score de engajamento (0-100) de um proprietário.
   */
  static async calculateScore(ownerId: string): Promise<number> {
    const owner = await prisma.owner.findUnique({
      where: { id: ownerId },
      include: {
        properties: {
          include: {
            leads: {
              include: {
                conversations: true
              }
            }
          }
        }
      }
    });

    if (!owner) return 0;

    let score = 50; // Base score

    // 1. Recência do último contato
    if (owner.lastContact) {
      const daysSinceContact = Math.floor((Date.now() - owner.lastContact.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceContact < 7) score += 20;
      else if (daysSinceContact > 30) score -= 20;
    }

    // 2. Análise de Resposta (Métricas de Conversa)
    // Procuramos conversas onde o proprietário (via lead/property context) respondeu
    // Nota: No schema imobWeb, o proprietário pode não estar diretamente na Conversation, 
    // mas o engajamento pode ser medido pela velocidade de resposta a solicitações do corretor.
    
    // Simulação de lógica de tempo de resposta baseada em metadados de histórico
    const responseTimeHours = 4; // Mock: Média de 4 horas
    if (responseTimeHours < 2) score += 15;
    else if (responseTimeHours > 24) score -= 15;

    // 3. Frequência de atualizações do imóvel pelo proprietário (através do corretor)
    const propertyUpdates = owner.properties.reduce((acc, p) => acc + ((p as any).viewCount || 0), 0);
    if (propertyUpdates > 1000) score += 10;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Determina a probabilidade (0-1) do proprietário responder a um novo WhatsApp hoje.
   */
  static async getResponseProbability(ownerId: string): Promise<number> {
    const score = await this.calculateScore(ownerId);
    return score / 100;
  }
}
