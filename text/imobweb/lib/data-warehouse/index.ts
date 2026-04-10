import type { AgentPerformance, PortalAnalytics, RegionAnalytics, TimeSeriesPoint, FunnelStage } from '@/types/analytics';

export interface DataWarehouseConfig {
  tenantId?: string;
  startDate: Date;
  endDate: Date;
}

export interface AggregationView {
  name: string;
  query: string;
  refreshInterval: number;
  lastRefresh?: Date;
}

export class DataWarehouse {
  private config: DataWarehouseConfig;

  constructor(config: DataWarehouseConfig) {
    this.config = config;
  }

  getSalesSummary(): {
    totalRevenue: number;
    revenueByMonth: TimeSeriesPoint[];
    revenueByType: Array<{ type: string; value: number }>;
    dealsByStatus: Array<{ status: string; count: number; value: number }>;
    averageDealValue: number;
    medianDealValue: number;
  } {
    const months = this.getMonthsBetween(this.config.startDate, this.config.endDate);
    const revenueByMonth = months.map(month => ({
      date: month,
      value: Math.random() * 150000 + 50000,
      metadata: { type: Math.random() > 0.3 ? 'sale' : 'rent' }
    }));

    return {
      totalRevenue: revenueByMonth.reduce((sum, p) => sum + p.value, 0),
      revenueByMonth,
      revenueByType: [
        { type: 'Venda', value: 850000 },
        { type: 'Locação', value: 350000 }
      ],
      dealsByStatus: [
        { status: 'Fechado', count: 45, value: 1200000 },
        { status: 'Em negociação', count: 28, value: 850000 },
        { status: 'Proposta', count: 35, value: 680000 }
      ],
      averageDealValue: 185000,
      medianDealValue: 150000
    };
  }

  getLeadsSummary(): {
    totalLeads: number;
    leadsBySource: Array<{ source: string; count: number; percentage: number }>;
    leadsByStatus: Array<{ status: string; count: number }>;
    leadsByAgent: Array<{ agentId: string; agentName: string; leads: number; converted: number }>;
    conversionFunnel: FunnelStage[];
    averageResponseTime: number;
  } {
    const sources = [
      { source: 'Zap Imóveis', count: 89 },
      { source: 'Viva Real', count: 67 },
      { source: 'OLX', count: 45 },
      { source: 'Indicação', count: 23 },
      { source: 'Orgânico', count: 10 }
    ];
    const total = sources.reduce((sum, s) => sum + s.count, 0);

    const funnelTotal = 234;
    const funnel: FunnelStage[] = [
      { name: 'Leads', value: funnelTotal, percentage: 100, color: '#3B82F6' },
      { name: 'Contatados', value: Math.round(funnelTotal * 0.8), percentage: 80, color: '#8B5CF6' },
      { name: 'Visitas', value: Math.round(funnelTotal * 0.38), percentage: 38, color: '#F59E0B' },
      { name: 'Propostas', value: Math.round(funnelTotal * 0.19), percentage: 19, color: '#10B981' },
      { name: 'Fechados', value: Math.round(funnelTotal * 0.085), percentage: 8.5, color: '#059669' }
    ];

    return {
      totalLeads: funnelTotal,
      leadsBySource: sources.map(s => ({ ...s, percentage: (s.count / total) * 100 })),
      leadsByStatus: [
        { status: 'Novo', count: 45 },
        { status: 'Contatado', count: 89 },
        { status: 'Qualificado', count: 56 },
        { status: 'Perdido', count: 44 }
      ],
      leadsByAgent: [
        { agentId: '1', agentName: 'Carlos Silva', leads: 45, converted: 18 },
        { agentId: '2', agentName: 'Ana Santos', leads: 38, converted: 15 },
        { agentId: '3', agentName: 'Pedro Oliveira', leads: 32, converted: 12 },
        { agentId: '4', agentName: 'Maria Costa', leads: 28, converted: 10 },
        { agentId: '5', agentName: 'João Lima', leads: 22, converted: 8 }
      ],
      conversionFunnel: funnel,
      averageResponseTime: 12
    };
  }

  getPropertiesSummary(): {
    total: number;
    byType: Array<{ type: string; count: number; value: number }>;
    byStatus: Array<{ status: string; count: number }>;
    byRegion: RegionAnalytics[];
    timeOnMarket: Array<{ range: string; count: number }>;
    staleCount: number;
    priceDistribution: Array<{ range: string; count: number }>;
  } {
    return {
      total: 156,
      byType: [
        { type: 'Apartamento', count: 78, value: 52000000 },
        { type: 'Casa', count: 45, value: 38000000 },
        { type: 'Comercial', count: 22, value: 28000000 },
        { type: 'Terreno', count: 8, value: 12000000 },
        { type: 'Galpão', count: 3, value: 8000000 }
      ],
      byStatus: [
        { status: 'Ativo', count: 156 },
        { status: 'Vendido', count: 42 },
        { status: 'Locado', count: 28 },
        { status: 'Excluído', count: 12 }
      ],
      byRegion: [
        { region: 'Zona Sul', properties: 45, deals: 12, averagePrice: 520000, averageDaysOnMarket: 38, topNeighborhoods: ['Moema', 'Vila Olimpia'] },
        { region: 'Zona Oeste', properties: 38, deals: 9, averagePrice: 450000, averageDaysOnMarket: 42, topNeighborhoods: ['Pinheiros', 'Jaraguá'] },
        { region: 'Centro', properties: 32, deals: 8, averagePrice: 480000, averageDaysOnMarket: 35, topNeighborhoods: ['Centro', 'Sé'] },
        { region: 'Zona Leste', properties: 25, deals: 6, averagePrice: 320000, averageDaysOnMarket: 55, topNeighborhoods: ['Tatuapé', 'Mooca'] },
        { region: 'Zona Norte', properties: 16, deals: 4, averagePrice: 280000, averageDaysOnMarket: 48, topNeighborhoods: ['Santana', 'Casa Verde'] }
      ],
      timeOnMarket: [
        { range: '< 30 dias', count: 45 },
        { range: '30-60 dias', count: 38 },
        { range: '60-90 dias', count: 32 },
        { range: '90-180 dias', count: 28 },
        { range: '> 180 dias', count: 13 }
      ],
      staleCount: 8,
      priceDistribution: [
        { range: '< R$ 200mil', count: 15 },
        { range: 'R$ 200-400mil', count: 42 },
        { range: 'R$ 400-600mil', count: 38 },
        { range: 'R$ 600k-1M', count: 32 },
        { range: '> R$ 1M', count: 29 }
      ]
    };
  }

  getTeamSummary(): {
    agents: AgentPerformance[];
    topPerformer: AgentPerformance;
    averageDeals: number;
    averageRevenue: number;
    averageConversion: number;
  } {
    const agents: AgentPerformance[] = [
      { agentId: '1', agentName: 'Carlos Silva', deals: 18, revenue: 280000, leads: 45, conversionRate: 12.5, averageDealTime: 38, ranking: 1 },
      { agentId: '2', agentName: 'Ana Santos', deals: 15, revenue: 245000, leads: 38, conversionRate: 11.2, averageDealTime: 42, ranking: 2 },
      { agentId: '3', agentName: 'Pedro Oliveira', deals: 12, revenue: 198000, leads: 32, conversionRate: 9.8, averageDealTime: 45, ranking: 3 },
      { agentId: '4', agentName: 'Maria Costa', deals: 10, revenue: 175000, leads: 28, conversionRate: 8.5, averageDealTime: 48, ranking: 4 },
      { agentId: '5', agentName: 'João Lima', deals: 8, revenue: 152000, leads: 22, conversionRate: 7.2, averageDealTime: 52, ranking: 5 }
    ];

    return {
      agents,
      topPerformer: agents[0],
      averageDeals: 10.6,
      averageRevenue: 210000,
      averageConversion: 9.8
    };
  }

  getPortalsSummary(): {
    portals: PortalAnalytics[];
    totalSpend: number;
    totalRevenue: number;
    averageROI: number;
    bestPerformer: PortalAnalytics;
  } {
    const portals: PortalAnalytics[] = [
      { portalId: 'zap', portalName: 'Zap Imóveis', leads: 89, views: 12500, contacts: 234, conversionRate: 12.5, spend: 45000, roi: 3.2 },
      { portalId: 'viva', portalName: 'Viva Real', leads: 67, views: 9800, contacts: 178, conversionRate: 11.8, spend: 38000, roi: 2.8 },
      { portalId: 'olx', portalName: 'OLX', leads: 45, views: 8200, contacts: 145, conversionRate: 9.5, spend: 30000, roi: 1.9 },
      { portalId: 'imovelweb', portalName: 'ImovelWeb', leads: 33, views: 5600, contacts: 98, conversionRate: 8.2, spend: 25000, roi: 1.5 }
    ];

    const totalSpend = portals.reduce((sum, p) => sum + p.spend, 0);
    const totalRevenue = portals.reduce((sum, p) => sum + (p.spend * p.roi), 0);

    return {
      portals,
      totalSpend,
      totalRevenue,
      averageROI: totalRevenue / totalSpend,
      bestPerformer: portals.reduce((best, p) => p.roi > best.roi ? p : best, portals[0])
    };
  }

  getFinancialSummary(): {
    totalRevenue: number;
    totalCosts: number;
    grossMargin: number;
    commissions: number;
    netRevenue: number;
    revenueByMonth: TimeSeriesPoint[];
    costsByCategory: Array<{ category: string; value: number }>;
  } {
    const months = this.getMonthsBetween(this.config.startDate, this.config.endDate);
    const revenueByMonth = months.map(month => ({
      date: month,
      value: Math.random() * 150000 + 50000
    }));

    return {
      totalRevenue: 1250000,
      totalCosts: 280000,
      grossMargin: 0.776,
      commissions: 125000,
      netRevenue: 970000,
      revenueByMonth,
      costsByCategory: [
        { category: 'Marketing', value: 85000 },
        { category: 'Operacional', value: 120000 },
        { category: 'Pessoal', value: 75000 }
      ]
    };
  }

  private getMonthsBetween(start: Date, end: Date): Date[] {
    const months: Date[] = [];
    const current = new Date(start);
    while (current <= end) {
      months.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }
    return months;
  }

  executeRawQuery(query: string): unknown {
    console.log('[DataWarehouse] Executing query:', query);
    return { rows: [], columns: [] };
  }

  getAggregatedView(viewName: string): unknown {
    const views: Record<string, () => unknown> = {
      'sales.summary': () => this.getSalesSummary(),
      'leads.summary': () => this.getLeadsSummary(),
      'properties.summary': () => this.getPropertiesSummary(),
      'team.summary': () => this.getTeamSummary(),
      'portals.summary': () => this.getPortalsSummary(),
      'financial.summary': () => this.getFinancialSummary()
    };

    return views[viewName]?.() || null;
  }
}

export const AGGREGATION_VIEWS: AggregationView[] = [
  { name: 'sales.summary', query: 'SELECT * FROM sales_agg', refreshInterval: 300 },
  { name: 'leads.summary', query: 'SELECT * FROM leads_agg', refreshInterval: 300 },
  { name: 'properties.summary', query: 'SELECT * FROM properties_agg', refreshInterval: 600 },
  { name: 'team.summary', query: 'SELECT * FROM team_agg', refreshInterval: 300 },
  { name: 'portals.summary', query: 'SELECT * FROM portals_agg', refreshInterval: 600 },
  { name: 'financial.summary', query: 'SELECT * FROM financial_agg', refreshInterval: 300 }
];

export function createDataWarehouse(startDate: Date, endDate: Date, tenantId?: string): DataWarehouse {
  return new DataWarehouse({ startDate, endDate, tenantId });
}