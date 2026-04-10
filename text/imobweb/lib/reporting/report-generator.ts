import type { ReportConfig, ReportData, AnalyticsPeriod } from '@/types/analytics';
import { KPI_DEFINITIONS, formatKpiValue, KpiCalculator, type KpiCalculationContext } from '@/lib/analytics/kpi-definitions';

export interface ReportSection {
  id: string;
  title: string;
  type: 'kpi_summary' | 'chart' | 'table' | 'text' | 'list';
  content: unknown;
}

export class ReportGenerator {
  private config: ReportConfig;
  private data: KpiCalculationContext | null = null;

  constructor(config: ReportConfig) {
    this.config = config;
  }

  setData(data: KpiCalculationContext): void {
    this.data = data;
  }

  generate(): ReportData {
    if (!this.data) {
      throw new Error('Data not set. Call setData() first.');
    }

    const calculator = new KpiCalculator(this.data);
    const sections: Record<string, unknown> = {};

    for (const sectionId of this.config.sections) {
      sections[sectionId] = this.generateSection(sectionId, calculator);
    }

    return {
      reportId: this.config.id,
      generatedAt: new Date(),
      period: {
        start: this.data.period.start,
        end: this.data.period.end,
        label: this.getPeriodLabel()
      },
      sections
    };
  }

  private generateSection(sectionId: string, calculator: KpiCalculator): unknown {
    switch (sectionId) {
      case 'executive_summary':
        return this.generateExecutiveSummary(calculator);
      case 'sales_performance':
        return this.generateSalesPerformance(calculator);
      case 'leads_analysis':
        return this.generateLeadsAnalysis(calculator);
      case 'portal_performance':
        return this.generatePortalPerformance(calculator);
      case 'team_performance':
        return this.generateTeamPerformance(calculator);
      case 'pipeline_overview':
        return this.generatePipelineOverview(calculator);
      case 'recommendations':
        return this.generateRecommendations(calculator);
      default:
        return {};
    }
  }

  private generateExecutiveSummary(calculator: KpiCalculator): Record<string, unknown> {
    const kpis = [
      'total_revenue',
      'monthly_revenue',
      'conversion_rate',
      'average_ticket',
      'active_properties',
      'total_leads'
    ];

    const values = kpis.map(kpiId => {
      const kpi = KPI_DEFINITIONS.find(k => k.id === kpiId);
      const value = calculator.calculate(kpiId);
      return {
        id: kpiId,
        name: kpi?.name || kpiId,
        value: value.value,
        formatted: formatKpiValue(value.value, kpi?.unit || 'number'),
        trend: value.trend,
        trendPercentage: value.trendPercentage
      };
    });

    return {
      title: 'Resumo Executivo',
      description: 'Visão geral dos principais indicadores do período',
      kpis: values
    };
  }

  private generateSalesPerformance(calculator: KpiCalculator): Record<string, unknown> {
    const totalRevenue = calculator.calculate('total_revenue');
    const monthlyRevenue = calculator.calculate('monthly_revenue');
    const avgTicket = calculator.calculate('average_ticket');
    const conversionRate = calculator.calculate('conversion_rate');
    const avgSaleTime = calculator.calculate('average_sale_time');

    return {
      title: 'Performance de Vendas',
      revenue: {
        total: totalRevenue.value,
        formatted: formatKpiValue(totalRevenue.value, 'currency'),
        monthly: formatKpiValue(monthlyRevenue.value, 'currency')
      },
      metrics: {
        avgTicket: formatKpiValue(avgTicket.value, 'currency'),
        conversionRate: formatKpiValue(conversionRate.value, 'percentage'),
        avgSaleTime: formatKpiValue(avgSaleTime.value, 'days')
      },
      chart: this.generateSalesChartData()
    };
  }

  private generateLeadsAnalysis(calculator: KpiCalculator): Record<string, unknown> {
    const totalLeads = calculator.calculate('total_leads');
    const leadResponseTime = calculator.calculate('lead_response_time');

    return {
      title: 'Análise de Leads',
      metrics: {
        total: totalLeads.value,
        avgResponseTime: formatKpiValue(leadResponseTime.value, 'minutes')
      },
      funnel: [
        { stage: 'Leads recebidos', count: Math.round(totalLeads.value * 1), rate: 100 },
        { stage: 'Contatados', count: Math.round(totalLeads.value * 0.8), rate: 80 },
        { stage: 'Visitas agendadas', count: Math.round(totalLeads.value * 0.38), rate: 38 },
        { stage: 'Propostas enviadas', count: Math.round(totalLeads.value * 0.19), rate: 19 },
        { stage: 'Fechados', count: Math.round(totalLeads.value * 0.085), rate: 8.5 }
      ],
      sourceBreakdown: [
        { source: 'Zap Imóveis', count: Math.round(totalLeads.value * 0.38) },
        { source: 'Viva Real', count: Math.round(totalLeads.value * 0.28) },
        { source: 'OLX', count: Math.round(totalLeads.value * 0.19) },
        { source: 'Indicação', count: Math.round(totalLeads.value * 0.10) },
        { source: 'Outros', count: Math.round(totalLeads.value * 0.05) }
      ]
    };
  }

  private generatePortalPerformance(calculator: KpiCalculator): Record<string, unknown> {
    return {
      title: 'Performance por Portal',
      portals: [
        { name: 'Zap Imóveis', leads: 89, revenue: 520000, roi: 3.2, spend: 45000 },
        { name: 'Viva Real', leads: 67, revenue: 380000, roi: 2.8, spend: 38000 },
        { name: 'OLX', leads: 45, revenue: 210000, roi: 1.9, spend: 30000 },
        { name: 'ImovelWeb', leads: 33, revenue: 140000, roi: 1.5, spend: 25000 }
      ],
      insights: [
        'Zap Imóveis apresenta melhor ROI (3.2x)',
        'Viva Real tem maior taxa de conversão (12%)',
        'OLX tem custo por lead mais baixo'
      ]
    };
  }

  private generateTeamPerformance(calculator: KpiCalculator): Record<string, unknown> {
    return {
      title: 'Performance da Equipe',
      topPerformers: [
        { name: 'Carlos Silva', deals: 18, revenue: 280000, conversion: 12.5, avatar: null },
        { name: 'Ana Santos', deals: 15, revenue: 245000, conversion: 11.2, avatar: null },
        { name: 'Pedro Oliveira', deals: 12, revenue: 198000, conversion: 9.8, avatar: null }
      ],
      metrics: {
        avgDealsPerAgent: 10.5,
        avgRevenuePerAgent: 165000,
        avgConversionRate: 9.2
      }
    };
  }

  private generatePipelineOverview(calculator: KpiCalculator): Record<string, unknown> {
    const pipelineValue = calculator.calculate('pipeline_value');

    return {
      title: 'Visão do Pipeline',
      totalValue: formatKpiValue(pipelineValue.value, 'currency'),
      stages: [
        { name: 'Proposta', value: 1200000, count: 15, color: '#3B82F6' },
        { name: 'Negociação', value: 980000, count: 12, color: '#F59E0B' },
        { name: 'Contrato', value: 620000, count: 8, color: '#8B5CF6' },
        { name: 'Assinatura', value: 400000, count: 5, color: '#EC4899' }
      ]
    };
  }

  private generateRecommendations(calculator: KpiCalculator): Record<string, unknown> {
    const recommendations: Array<{ priority: 'high' | 'medium' | 'low'; text: string }> = [];

    const avgSaleTime = calculator.calculate('average_sale_time');
    if (avgSaleTime.value > 60) {
      recommendations.push({
        priority: 'high',
        text: 'Tempo médio de venda está acima do target (60 dias). Considere revisar preços e fotos dos imóveis mais antigos.'
      });
    }

    const staleProperties = calculator.calculate('stale_properties');
    if (staleProperties.value > 10) {
      recommendations.push({
        priority: 'high',
        text: `${Math.round(staleProperties.value)} imóveis estão sem atualização há mais de 30 dias.`
      });
    }

    recommendations.push({
      priority: 'medium',
      text: 'Aumentar investimento no portal Zap Imóveis que apresenta melhor ROI.'
    });

    return {
      title: 'Recomendações',
      items: recommendations
    };
  }

  private generateSalesChartData(): Array<{ month: string; value: number }> {
    return [
      { month: 'Jan', value: 85000 },
      { month: 'Feb', value: 92000 },
      { month: 'Mar', value: 78000 },
      { month: 'Apr', value: 115000 },
      { month: 'May', value: 98000 },
      { month: 'Jun', value: 142000 }
    ];
  }

  private getPeriodLabel(): string {
    const now = new Date();
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return monthNames[now.getMonth()] + ' ' + now.getFullYear();
  }

  toHTML(reportData: ReportData): string {
    const styles = `
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; }
        h1 { color: #1F2937; border-bottom: 2px solid #3B82F6; padding-bottom: 10px; }
        h2 { color: #374151; margin-top: 30px; }
        .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
        .kpi-card { border: 1px solid #E5E7EB; border-radius: 8px; padding: 15px; }
        .kpi-value { font-size: 24px; font-weight: bold; color: #1F2937; }
        .kpi-label { font-size: 12px; color: #6B7280; }
        .trend-up { color: #059669; }
        .trend-down { color: #DC2626; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #E5E7EB; padding: 10px; text-align: left; }
        th { background: #F3F4F6; }
        .recommendation { padding: 10px; margin: 10px 0; border-radius: 4px; }
        .recommendation.high { background: #FEE2E2; border-left: 4px solid #DC2626; }
        .recommendation.medium { background: #FEF3C7; border-left: 4px solid #F59E0B; }
        .recommendation.low { background: #D1FAE5; border-left: 4px solid #059669; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; font-size: 12px; color: #6B7280; }
      </style>
    `;

    let html = `<!DOCTYPE html><html><head><meta charset="UTF-8">${styles}</head><body>`;
    html += `<h1>${this.config.name}</h1>`;
    html += `<p>Período: ${reportData.period.label}</p>`;
    html += `<p>Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>`;

    const summary = reportData.sections['executive_summary'] as Record<string, unknown> | undefined;
    if (summary?.kpis) {
      html += '<h2>Resumo Executivo</h2><div class="kpi-grid">';
      (summary.kpis as Array<Record<string, unknown>>).forEach(kpi => {
        const trendClass = (kpi.trend as string) === 'up' ? 'trend-up' : (kpi.trend as string) === 'down' ? 'trend-down' : '';
        const trendArrow = (kpi.trend as string) === 'up' ? '↑' : (kpi.trend as string) === 'down' ? '↓' : '→';
        html += `<div class="kpi-card">
          <div class="kpi-label">${kpi.name}</div>
          <div class="kpi-value">${kpi.formatted}</div>
          <div class="${trendClass}">${trendArrow} ${Math.abs(kpi.trendPercentage as number || 0).toFixed(1)}%</div>
        </div>`;
      });
      html += '</div>';
    }

    const recommendations = reportData.sections['recommendations'] as Record<string, unknown> | undefined;
    if (recommendations?.items) {
      html += '<h2>Recomendações</h2>';
      (recommendations.items as Array<Record<string, unknown>>).forEach(item => {
        html += `<div class="recommendation ${item.priority}">${item.text}</div>`;
      });
    }

    html += `<div class="footer">
      <p>Relatório gerado automaticamente pelo imobWeb CRM</p>
      <p>Este documento é informativo e não possui valor contábil.</p>
    </div></body></html>`;

    return html;
  }

  toPDF(reportData: ReportData): void {
    const html = this.toHTML(reportData);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
  }

  toExcel(reportData: ReportData): void {
    console.log('[Report] Generating Excel for:', reportData.reportId);
    console.log('[Report] Data:', JSON.stringify(reportData.sections, null, 2));
  }
}

export function createReport(config: Partial<ReportConfig>): ReportGenerator {
  const fullConfig: ReportConfig = {
    id: `report-${Date.now()}`,
    name: 'Relatório Personalizado',
    type: 'custom',
    filters: {},
    sections: ['executive_summary', 'sales_performance', 'recommendations'],
    format: 'pdf',
    recipients: [],
    ...config
  };

  return new ReportGenerator(fullConfig);
}

export function generateMonthlyReport(period: AnalyticsPeriod): ReportData {
  const config: ReportConfig = {
    id: `monthly-${period.start.getMonth()}-${period.start.getFullYear()}`,
    name: 'Relatório Mensal',
    type: 'monthly',
    frequency: 'monthly',
    filters: { period },
    sections: [
      'executive_summary',
      'sales_performance',
      'leads_analysis',
      'portal_performance',
      'team_performance',
      'pipeline_overview',
      'recommendations'
    ],
    format: 'pdf',
    recipients: []
  };

  const mockData: KpiCalculationContext = {
    properties: [],
    leads: [],
    deals: [],
    contracts: [],
    agents: [],
    portals: [],
    period
  };

  const generator = new ReportGenerator(config);
  generator.setData(mockData);
  return generator.generate();
}