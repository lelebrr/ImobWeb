import { ChurnRisk, PriceRecommendation } from '../../types/insights';

/**
 * Utilitário para gerar mensagens de WhatsApp baseadas em insights de IA.
 * Focado em proatividade e persuasão.
 */
export class WhatsAppInsightNotificator {
  /**
   * Gera uma mensagem para o corretor sobre um imóvel em risco de churn.
   */
  static generateChurnAlertForAgent(agentName: string, propertyTitle: string, risk: ChurnRisk) {
    const riskEmoji = risk.riskLevel === 'CRITICAL' ? '🚨' : '⚠️';
    return `Olá ${agentName}, sou o assistente IA da ImobWeb! ${riskEmoji} Detectei um risco de churn ${risk.riskLevel} no imóvel "${propertyTitle}".

Motivos:
${risk.factors.map(f => `- ${f}`).join('\n')}

Recomendação:
👉 ${risk.suggestedActions[0]}

Acesse o painel de insights para detalhes: https://app.imobweb.com.br/insights`;
  }

  /**
   * Gera um resumo de oportunidade de preço para o proprietário.
   */
  static generatePriceOpportunityForOwner(ownerName: string, propertyTitle: string, rec: PriceRecommendation) {
    const diff = Math.round(((rec.marketAverage - rec.suggestedPrice) / rec.marketAverage) * 100);
    
    return `Olá ${ownerName}, tudo bem? Sou da equipe imobiliária. Fizemos uma análise via Inteligência Artificial do seu imóvel "${propertyTitle}" e detectamos uma oportunidade! 📈

O preço sugerido para acelerar sua venda hoje é de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rec.suggestedPrice)}. 

Imóveis similares em seu bairro estão sendo fechados com 15% mais velocidade nesta faixa. Gostaria de autorizar o ajuste para aumentarmos os leads esta semana?`;
  }
}
