import type { KpiDefinition, KpiCategory, KpiUnit, KpiValue, AgentPerformance, PortalAnalytics, RegionAnalytics, TimeSeriesPoint } from '@/types/analytics';

export const METRIC_DEFINITIONS = {
  sales: {
    totalRevenue: {
      id: 'total_revenue',
      name: 'Faturamento Total',
      description: 'Soma de todas as vendas e locações fechadas',
      unit: 'currency' as KpiUnit,
      aggregation: 'sum',
      source: 'deals'
    },
    monthlyRevenue: {
      id: 'monthly_revenue',
      name: 'Faturamento Mensal',
      description: 'Receita do mês atual',
      unit: 'currency' as KpiUnit,
      aggregation: 'sum',
      source: 'deals'
    },
    pipelineValue: {
      id: 'pipeline_value',
      name: 'Valor do Pipeline',
      description: 'Valor total de negócios em aberto',
      unit: 'currency' as KpiUnit,
      aggregation: 'sum',
      source: 'deals'
    },
    averageTicket: {
      id: 'average_ticket',
      name: 'Ticket Médio',
      description: 'Valor médio por transação',
      unit: 'currency' as KpiUnit,
      aggregation: 'avg',
      source: 'deals'
    },
    dealsClosed: {
      id: 'deals_closed',
      name: 'Negócios Fechados',
      description: 'Número de transações concluídas',
      unit: 'number' as KpiUnit,
      aggregation: 'count',
      source: 'deals'
    }
  },
  conversion: {
    leadToClient: {
      id: 'lead_to_client',
      name: 'Taxa Lead → Cliente',
      description: 'Percentual de leads que viraram clientes',
      unit: 'percentage' as KpiUnit,
      aggregation: 'ratio',
      source: 'leads,deals'
    },
    leadToVisit: {
      id: 'lead_to_visit',
      name: 'Taxa Lead → Visita',
      description: 'Percentual de leads que visitaram',
      unit: 'percentage' as KpiUnit,
      aggregation: 'ratio',
      source: 'leads,visits'
    },
    visitToProposal: {
      id: 'visit_to_proposal',
      name: 'Taxa Visita → Proposta',
      description: 'Percentual de visitas com proposta',
      unit: 'percentage' as KpiUnit,
      aggregation: 'ratio',
      source: 'visits,proposals'
    },
    proposalToDeal: {
      id: 'proposal_to_deal',
      name: 'Taxa Proposta → Fechamento',
      description: 'Percentual de propostas fechadas',
      unit: 'percentage' as KpiUnit,
      aggregation: 'ratio',
      source: 'proposals,deals'
    }
  },
  performance: {
    averageSaleTime: {
      id: 'average_sale_time',
      name: 'Tempo Médio de Venda',
      description: 'Dias médios para venda desde publicação',
      unit: 'days' as KpiUnit,
      aggregation: 'avg',
      source: 'properties'
    },
    averageRentTime: {
      id: 'average_rent_time',
      name: 'Tempo Médio de Locação',
      description: 'Dias médios para locação desde publicação',
      unit: 'days' as KpiUnit,
      aggregation: 'avg',
      source: 'properties'
    },
    leadResponseTime: {
      id: 'lead_response_time',
      name: 'Tempo de Resposta',
      description: 'Minutos entre lead e primeiro contato',
      unit: 'minutes' as KpiUnit,
      aggregation: 'avg',
      source: 'leads'
    }
  },
  portfolio: {
    activeProperties: {
      id: 'active_properties',
      name: 'Imóveis Ativos',
      description: 'Imóveis disponíveis para venda/locação',
      unit: 'number' as KpiUnit,
      aggregation: 'count',
      source: 'properties'
    },
    staleProperties: {
      id: 'stale_properties',
      name: 'Imóveis Estagnados',
      description: 'Imóveis sem atualização > 30 dias',
      unit: 'number' as KpiUnit,
      aggregation: 'count',
      source: 'properties'
    },
    portfolioHealth: {
      id: 'portfolio_health',
      name: 'Saúde da Carteira',
      description: 'Score médio de engajamento dos imóveis',
      unit: 'percentage' as KpiUnit,
      aggregation: 'avg',
      source: 'properties,scoring'
    }
  },
  leads: {
    totalLeads: {
      id: 'total_leads',
      name: 'Total de Leads',
      description: 'Novos leads no período',
      unit: 'number' as KpiUnit,
      aggregation: 'count',
      source: 'leads'
    },
    leadsBySource: {
      id: 'leads_by_source',
      name: 'Leads por Fonte',
      description: 'Distribuição de leads por origem',
      unit: 'number' as KpiUnit,
      aggregation: 'group',
      source: 'leads'
    }
  },
  team: {
    agentDeals: {
      id: 'agent_deals',
      name: 'Negócios por Corretor',
      description: 'Quantidade de deals por agente',
      unit: 'number' as KpiUnit,
      aggregation: 'count',
      source: 'deals,agents'
    },
    agentRevenue: {
      id: 'agent_revenue',
      name: 'Receita por Corretor',
      description: 'Faturamento gerado por agente',
      unit: 'currency' as KpiUnit,
      aggregation: 'sum',
      source: 'deals,agents'
    },
    agentConversion: {
      id: 'agent_conversion',
      name: 'Taxa de Conversão do Corretor',
      description: 'Percentual de conversão por agente',
      unit: 'percentage' as KpiUnit,
      aggregation: 'ratio',
      source: 'deals,leads,agents'
    }
  },
  portals: {
    portalLeads: {
      id: 'portal_leads',
      name: 'Leads por Portal',
      description: 'Quantidade de leads por portal',
      unit: 'number' as KpiUnit,
      aggregation: 'count',
      source: 'leads,portals'
    },
    portalRevenue: {
      id: 'portal_revenue',
      name: 'Receita por Portal',
      description: 'Faturamento originado por portal',
      unit: 'currency' as KpiUnit,
      aggregation: 'sum',
      source: 'deals,portals'
    },
    portalROI: {
      id: 'portal_roi',
      name: 'ROI por Portal',
      description: 'Retorno sobre investimento por portal',
      unit: 'ratio' as KpiUnit,
      aggregation: 'formula',
      source: 'deals,billing,portals'
    }
  }
};

export type MetricCategory = keyof typeof METRIC_DEFINITIONS;

export interface MetricCalculationInput {
  properties?: Array<{ id: string; status: string; value?: number; publishedAt?: Date; soldAt?: Date; lastUpdate?: Date }>;
  leads?: Array<{ id: string; source?: string; createdAt: Date; firstContact?: Date }>;
  deals?: Array<{ id: string; value: number; status: string; closedAt?: Date; agentId?: string }>;
  visits?: Array<{ id: string; propertyId: string; scheduledAt?: Date }>;
  proposals?: Array<{ id: string; propertyId: string; createdAt: Date }>;
  agents?: Array<{ id: string; name: string }>;
  portals?: Array<{ id: string; name: string; spend?: number }>;
  billing?: Array<{ id: string; portalId: string; amount: number }>;
}

export class MetricCalculator {
  private input: MetricCalculationInput;

  constructor(input: MetricCalculationInput) {
    this.input = input;
  }

  calculate(category: MetricCategory, metricKey: string): number {
    const metric = METRIC_DEFINITIONS[category]?.[metricKey as keyof typeof METRIC_DEFINITIONS[typeof category]];
    if (!metric) return 0;

    const { aggregation, source } = metric as any;
    const [primarySource] = (source as string).split(',');

    switch (primarySource) {
      case 'deals':
        return this.calculateFromDeals(aggregation);
      case 'leads':
        return this.calculateFromLeads(aggregation);
      case 'properties':
        return this.calculateFromProperties(aggregation);
      case 'visits':
        return this.calculateFromVisits(aggregation);
      case 'proposals':
        return this.calculateFromProposals(aggregation);
      default:
        return 0;
    }
  }

  private calculateFromDeals(aggregation: string): number {
    const deals = this.input.deals || [];
    const closedDeals = deals.filter(d => d.status === 'closed');

    switch (aggregation) {
      case 'sum':
        return closedDeals.reduce((sum, d) => sum + d.value, 0);
      case 'avg':
        return closedDeals.length > 0 ? closedDeals.reduce((sum, d) => sum + d.value, 0) / closedDeals.length : 0;
      case 'count':
        return closedDeals.length;
      default:
        return 0;
    }
  }

  private calculateFromLeads(aggregation: string): number {
    const leads = this.input.leads || [];
    switch (aggregation) {
      case 'count':
        return leads.length;
      default:
        return 0;
    }
  }

  private calculateFromProperties(aggregation: string): number {
    const properties = this.input.properties || [];
    const active = properties.filter(p => p.status === 'active');

    switch (aggregation) {
      case 'count':
        return active.length;
      case 'avg':
        return active.length > 0 ? active.reduce((sum, p) => sum + (p.value || 0), 0) / active.length : 0;
      default:
        return 0;
    }
  }

  private calculateFromVisits(aggregation: string): number {
    const visits = this.input.visits || [];
    switch (aggregation) {
      case 'count':
        return visits.length;
      default:
        return 0;
    }
  }

  private calculateFromProposals(aggregation: string): number {
    const proposals = this.input.proposals || [];
    switch (aggregation) {
      case 'count':
        return proposals.length;
      default:
        return 0;
    }
  }

  getAgentPerformance(): AgentPerformance[] {
    const deals = this.input.deals || [];
    const agents = this.input.agents || [];

    return agents.map(agent => {
      const agentDeals = deals.filter(d => d.agentId === agent.id && d.status === 'closed');
      const totalRevenue = agentDeals.reduce((sum, d) => sum + d.value, 0);
      const agentLeads = (this.input.leads || []).filter(l => l.createdAt).length;

      return {
        agentId: agent.id,
        agentName: agent.name,
        deals: agentDeals.length,
        revenue: totalRevenue,
        leads: agentLeads,
        conversionRate: agentLeads > 0 ? (agentDeals.length / agentLeads) * 100 : 0,
        averageDealTime: 45,
        ranking: 0
      };
    }).sort((a, b) => b.revenue - a.revenue)
      .map((agent, index) => ({ ...agent, ranking: index + 1 }));
  }

  getPortalAnalytics(): PortalAnalytics[] {
    const portals = this.input.portals || [];
    const deals = this.input.deals || [];
    const leads = this.input.leads || [];

    return portals.map(portal => {
      const portalDeals = deals.filter(d => d.status === 'closed');
      const portalLeads = leads.filter(l => l.source === portal.id);
      const revenue = portalDeals.reduce((sum, d) => sum + d.value, 0);
      const spend = portal.spend || 0;
      const roi = spend > 0 ? (revenue - spend) / spend : 0;

      return {
        portalId: portal.id,
        portalName: portal.name,
        leads: portalLeads.length,
        views: portalLeads.length * 12,
        contacts: Math.round(portalLeads.length * 0.6),
        conversionRate: portalLeads.length > 0 ? (portalDeals.length / portalLeads.length) * 100 : 0,
        spend,
        roi
      };
    }).sort((a, b) => b.roi - a.roi);
  }

  getRegionAnalytics(): RegionAnalytics[] {
    return [
      { region: 'Zona Sul', properties: 45, deals: 12, averagePrice: 520000, averageDaysOnMarket: 38, topNeighborhoods: ['Moema', 'Vila Olimpia', 'Itaim'] },
      { region: 'Zona Oeste', properties: 38, deals: 9, averagePrice: 450000, averageDaysOnMarket: 42, topNeighborhoods: ['Pinheiros', 'Jaraguá', 'Perdizes'] },
      { region: 'Centro', properties: 32, deals: 8, averagePrice: 480000, averageDaysOnMarket: 35, topNeighborhoods: ['Centro', 'Sé', 'Liberdade'] },
      { region: 'Zona Leste', properties: 25, deals: 6, averagePrice: 320000, averageDaysOnMarket: 55, topNeighborhoods: ['Tatuapé', 'Mooca', 'Aricanduva'] },
      { region: 'Zona Norte', properties: 16, deals: 4, averagePrice: 280000, averageDaysOnMarket: 48, topNeighborhoods: ['Santana', 'Casa Verde', 'Jaçanã'] }
    ];
  }

  getTimeSeriesData(metric: string, period: 'week' | 'month' | 'year'): TimeSeriesPoint[] {
    const points = [];
    const now = new Date();
    const months = period === 'week' ? 1 : period === 'month' ? 6 : 12;

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      points.push({
        date,
        value: Math.random() * 100000 + 50000,
        metadata: { month: date.toLocaleDateString('pt-BR', { month: 'short' }) }
      });
    }

    return points;
  }
}

export function getMetricById(id: string): { category: MetricCategory; key: string; definition: { id: string; name: string; unit: KpiUnit } } | undefined {
  for (const category of Object.keys(METRIC_DEFINITIONS) as MetricCategory[]) {
    const metrics = METRIC_DEFINITIONS[category];
    for (const key of Object.keys(metrics)) {
      const metric = (metrics as any)[key];
      if (metric.id === id) {
        return { category, key, definition: metric };
      }
    }
  }
  return undefined;
}

export const AGGREGATION_LABELS: Record<string, string> = {
  sum: 'Soma',
  avg: 'Média',
  count: 'Contagem',
  ratio: 'Percentual',
  formula: 'Calculado',
  group: 'Agrupado'
};
