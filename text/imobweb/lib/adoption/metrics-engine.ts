import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface FeatureMetrics {
  featureName: string;
  activationRate: number; // 0-1
  lastUsedAt: Date | null;
}

/**
 * Motor de Acompanhamento de Adoção.
 * Monitora o progresso do onboarding e a ativação de funcionalidades chave.
 */
export class AdoptionMetricsEngine {
  /**
   * Monitora a conclusão do onboarding de um usuário.
   */
  static async trackOnboardingProgress(userId: string, step: number) {
    console.log(`Tracking Onboarding Step ${step} for user ${userId}`);
    // Em produção, salvaria no Banco de Dados em um campo de metadados
  }

  /**
   * Calcula a taxa de ativação de uma funcionalidade para uma organização.
   */
  static async getFeatureActivationRate(organizationId: string, featureName: string): Promise<number> {
    // Simulação de cálculo baseado no uso real
    // Ex: "Se 80% dos corretores da imobiliária já conectaram o WhatsApp, a taxa é 0.8"
    const mockRates: Record<string, number> = {
      'whatsapp': 0.65,
      'publish_portal': 0.42,
      'financial_module': 0.15
    };
    
    return mockRates[featureName] || 0;
  }

  /**
   * Gera alertas automáticos para usuários com baixa adoção.
   */
  static async getLowAdoptionAlerts(organizationId: string) {
    const features = ['whatsapp', 'publish_portal'];
    const alerts = [];

    for (const f of features) {
      const rate = await this.getFeatureActivationRate(organizationId, f);
      if (rate < 0.3) {
        alerts.push({
          level: 'WARNING',
          message: `Apenas ${Math.round(rate * 100)}% do seu time usa o recurso ${f}. Sugerimos agendar um treinamento rápido.`,
          feature: f
        });
      }
    }

    return alerts;
  }
}
