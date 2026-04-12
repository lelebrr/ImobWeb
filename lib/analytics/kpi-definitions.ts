import type { KpiDefinition, KpiValue, KpiCategory, KpiUnit } from '@/types/analytics';

export const KPI_DEFINITIONS: KpiDefinition[] = [
  {
    id: 'total_revenue',
    name: 'Faturamento Total',
    description: 'Valor total das vendas e locações fechadas no período',
    category: 'financial',
    unit: 'currency',
    calculation: 'SUM(contract.value) WHERE status = signed',
    source: ['contracts', 'deals'],
    thresholds: { target: 100000 }
  },
  {
    id: 'monthly_revenue',
    name: 'Faturamento Mensal',
    description: 'Valor total das operações do mês atual',
    category: 'financial',
    unit: 'currency',
    calculation: 'SUM(contract.value) WHERE month = current',
    source: ['contracts', 'deals'],
    thresholds: { target: 50000 }
  },
  {
    id: 'commission_total',
    name: 'Comissão Total',
    description: 'Valor total de comissões geradas',
    category: 'financial',
    unit: 'currency',
    calculation: 'SUM(deal.commission)',
    source: ['deals', 'commissions']
  },
  {
    id: 'average_ticket',
    name: 'Ticket Médio',
    description: 'Valor médio por transação fechada',
    category: 'sales',
    unit: 'currency',
    calculation: 'AVG(contract.value) WHERE status = signed',
    source: ['contracts', 'deals'],
    thresholds: { target: 300000 }
  },
  {
    id: 'conversion_rate',
    name: 'Taxa de Conversão',
    description: 'Percentual de leads que se tornaram clientes',
    category: 'sales',
    unit: 'percentage',
    calculation: '(deals.closed / leads.total) * 100',
    source: ['leads', 'deals'],
    thresholds: { warning: 5, target: 10 }
  },
  {
    id: 'lead_to_visit_rate',
    name: 'Taxa Lead → Visita',
    description: 'Percentual de leads que agendaram visita',
    category: 'leads',
    unit: 'percentage',
    calculation: '(visits.scheduled / leads.total) * 100',
    source: ['leads', 'visits']
  },
  {
    id: 'visit_to_contract_rate',
    name: 'Taxa Visita → Contrato',
    description: 'Percentual de visitas que resultaram em contrato',
    category: 'sales',
    unit: 'percentage',
    calculation: '(contracts.signed / visits.completed) * 100',
    source: ['visits', 'contracts']
  },
  {
    id: 'average_sale_time',
    name: 'Tempo Médio de Venda',
    description: 'Dias médios entre publicação e venda do imóvel',
    category: 'performance',
    unit: 'days',
    calculation: 'AVG(property.soldAt - property.publishedAt)',
    source: ['properties'],
    thresholds: { warning: 90, target: 60 }
  },
  {
    id: 'average_rent_time',
    name: 'Tempo Médio de Locação',
    description: 'Dias médios entre publicação e locação do imóvel',
    category: 'performance',
    unit: 'days',
    calculation: 'AVG(property.rentedAt - property.publishedAt)',
    source: ['properties'],
    thresholds: { warning: 45, target: 30 }
  },
  {
    id: 'active_properties',
    name: 'Imóveis Ativos',
    description: 'Número de imóveis disponíveis para venda/locação',
    category: 'portfolio',
    unit: 'number',
    calculation: 'COUNT(properties WHERE status = active)',
    source: ['properties']
  },
  {
    id: 'properties_sold_month',
    name: 'Imóveis Vendidos no Mês',
    description: 'Número de vendas concretizadas no mês',
    category: 'sales',
    unit: 'number',
    calculation: 'COUNT(properties WHERE soldAt IN current_month)',
    source: ['properties', 'deals']
  },
  {
    id: 'properties_rented_month',
    name: 'Imóveis Locados no Mês',
    description: 'Número de locações concretizadas no mês',
    category: 'sales',
    unit: 'number',
    calculation: 'COUNT(properties WHERE rentedAt IN current_month)',
    source: ['properties', 'deals']
  },
  {
    id: 'total_leads',
    name: 'Total de Leads',
    description: 'Número de novos leads recebidos no período',
    category: 'leads',
    unit: 'number',
    calculation: 'COUNT(leads WHERE createdAt IN period)',
    source: ['leads'],
    thresholds: { target: 100 }
  },
  {
    id: 'leads_by_portal',
    name: 'Leads por Portal',
    description: 'Distribuição de leads por portal de origem',
    category: 'portals',
    unit: 'number',
    calculation: 'GROUP_COUNT(leads BY portal)',
    source: ['leads', 'portals']
  },
  {
    id: 'portal_roi',
    name: 'ROI por Portal',
    description: 'Retorno sobre investimento por portal de anúncios',
    category: 'portals',
    unit: 'ratio',
    calculation: '(revenue.portal - spend.portal) / spend.portal',
    source: ['portals', 'deals', 'billing']
  },
  {
    id: 'lead_response_time',
    name: 'Tempo de Resposta',
    description: 'Tempo médio entre lead recebido e primeiro contato',
    category: 'performance',
    unit: 'minutes',
    calculation: 'AVG(lead.firstContact - lead.createdAt)',
    source: ['leads'],
    thresholds: { warning: 60, target: 10 }
  },
  {
    id: 'owner_portfolio_score',
    name: 'Score Médio da Carteira',
    description: 'Média do score de engajamento dos proprietários',
    category: 'portfolio',
    unit: 'percentage',
    calculation: 'AVG(owner.engagementScore)',
    source: ['owners', 'scoring']
  },
  {
    id: 'stale_properties',
    name: 'Imóveis Estagnados',
    description: 'Imóveis sem atualização há mais de 30 dias',
    category: 'portfolio',
    unit: 'number',
    calculation: 'COUNT(properties WHERE lastUpdate < 30 days ago)',
    source: ['properties'],
    thresholds: { warning: 10, critical: 20 }
  },
  {
    id: 'agent_deals_count',
    name: 'Negócios por Corretor',
    description: 'Número de transações por corretor',
    category: 'team',
    unit: 'number',
    calculation: 'COUNT(deals WHERE agentId = X)',
    source: ['deals', 'agents']
  },
  {
    id: 'agent_productivity',
    name: 'Produtividade do Corretor',
    description: 'Valor médio de transações por corretor',
    category: 'team',
    unit: 'currency',
    calculation: 'SUM(deals.value) / COUNT(deals) BY agent',
    source: ['deals', 'agents']
  },
  {
    id: 'pipeline_value',
    name: 'Valor do Pipeline',
    description: 'Valor total de todos os negócios em aberto',
    category: 'sales',
    unit: 'currency',
    calculation: 'SUM(deals.value WHERE status IN (proposal, negotiation, contract))',
    source: ['deals']
  },
  {
    id: 'churn_rate',
    name: 'Taxa de Attrition',
    description: 'Percentual de imóveis excluídos sem venda/locação',
    category: 'portfolio',
    unit: 'percentage',
    calculation: '(properties.removed / properties.total) * 100',
    source: ['properties']
  }
];

export function getKpiById(id: string): KpiDefinition | undefined {
  return KPI_DEFINITIONS.find(k => k.id === id);
}

export function getKpisByCategory(category: KpiCategory): KpiDefinition[] {
  return KPI_DEFINITIONS.filter(k => k.category === category);
}

export function getKpiUnits(): KpiUnit[] {
  return [...new Set(KPI_DEFINITIONS.map(k => k.unit))];
}

export interface KpiCalculationContext {
  properties: PropertyData[];
  leads: LeadData[];
  deals: DealData[];
  contracts: ContractData[];
  agents: AgentData[];
  portals: PortalData[];
  period: { start: Date; end: Date };
}

interface PropertyData {
  id: string;
  status: 'active' | 'sold' | 'rented' | 'inactive';
  value?: number;
  publishedAt?: Date;
  soldAt?: Date;
  rentedAt?: Date;
  lastUpdate?: Date;
  portalId?: string;
  agentId?: string;
}

interface LeadData {
  id: string;
  createdAt: Date;
  firstContact?: Date;
  source: string;
  portalId?: string;
  agentId?: string;
}

interface DealData {
  id: string;
  value: number;
  status: string;
  closedAt?: Date;
  createdAt: Date;
  agentId?: string;
  commission?: number;
}

interface ContractData {
  id: string;
  value: number;
  status: 'draft' | 'signed' | 'cancelled';
  type: 'sale' | 'rent';
}

interface AgentData {
  id: string;
  name: string;
}

interface PortalData {
  id: string;
  name: string;
  spend?: number;
}

export class KpiCalculator {
  private context: KpiCalculationContext;

  constructor(context: KpiCalculationContext) {
    this.context = context;
  }

  calculate(kpiId: string): KpiValue {
    const definition = getKpiById(kpiId);
    if (!definition) {
      throw new Error(`KPI not found: ${kpiId}`);
    }

    const value = this.computeKpi(kpiId);
    const previousValue = this.getPreviousPeriodValue(kpiId);
    const trend = this.calculateTrend(value, previousValue);

    return {
      kpiId,
      value,
      previousValue,
      trend,
      trendPercentage: previousValue ? ((value - previousValue) / previousValue) * 100 : undefined,
      period: this.context.period,
      updatedAt: new Date()
    };
  }

  private computeKpi(kpiId: string): number {
    const { properties, leads, deals, contracts, portals } = this.context;

    switch (kpiId) {
      case 'total_revenue':
        return deals
          .filter(d => d.status === 'closed')
          .reduce((sum, d) => sum + d.value, 0);

      case 'monthly_revenue':
        return deals
          .filter(d => d.closedAt && 
            d.closedAt >= this.context.period.start && 
            d.closedAt <= this.context.period.end)
          .reduce((sum, d) => sum + d.value, 0);

      case 'average_ticket':
        const closedDeals = deals.filter(d => d.status === 'closed');
        return closedDeals.length > 0 
          ? closedDeals.reduce((sum, d) => sum + d.value, 0) / closedDeals.length 
          : 0;

      case 'conversion_rate':
        const totalLeads = leads.length;
        const closedDealsCount = deals.filter(d => d.status === 'closed').length;
        return totalLeads > 0 ? (closedDealsCount / totalLeads) * 100 : 0;

      case 'average_sale_time':
        const soldProperties = properties.filter(p => p.soldAt && p.publishedAt);
        if (soldProperties.length === 0) return 0;
        const totalDays = soldProperties.reduce((sum, p) => {
          const days = (p.soldAt!.getTime() - p.publishedAt!.getTime()) / (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0);
        return totalDays / soldProperties.length;

      case 'active_properties':
        return properties.filter(p => p.status === 'active').length;

      case 'total_leads':
        return leads.filter(l => 
          l.createdAt >= this.context.period.start && 
          l.createdAt <= this.context.period.end
        ).length;

      case 'stale_properties':
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return properties.filter(p => 
          p.status === 'active' && 
          p.lastUpdate && 
          p.lastUpdate < thirtyDaysAgo
        ).length;

      case 'pipeline_value':
        return deals
          .filter(d => ['proposal', 'negotiation', 'contract'].includes(d.status))
          .reduce((sum, d) => sum + d.value, 0);

      default:
        return 0;
    }
  }

  private getPreviousPeriodValue(kpiId: string): number | undefined {
    return Math.random() * 1000;
  }

  private calculateTrend(current: number, previous?: number): 'up' | 'down' | 'stable' | 'neutral' {
    if (!previous) return 'neutral';
    const change = ((current - previous) / previous) * 100;
    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'stable';
  }
}

export function formatKpiValue(value: number, unit: KpiUnit): string {
  switch (unit) {
    case 'currency':
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'number':
      return new Intl.NumberFormat('pt-BR').format(value);
    case 'days':
      return `${Math.round(value)} dias`;
    case 'ratio':
      return `${value.toFixed(2)}x`;
    default:
      return value.toString();
  }
}
