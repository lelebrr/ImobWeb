import type { KpiCategory } from '@/types/analytics';
import { 
  Building2, 
  Users, 
  DollarSign, 
  FileText, 
  Target, 
  Activity, 
  PieChart,
  Map,
  TrendingUp,
  Clock
} from 'lucide-react';

export interface WidgetDefinition {
  id: string;
  type: 'stat' | 'chart_area' | 'chart_bar' | 'chart_pie' | 'ranking' | 'funnel' | 'map';
  title: string;
  category: KpiCategory | 'insights';
  icon: any;
  defaultVisible: boolean;
  gridSpan: number; // 1 to 4
}

export const DASHBOARD_WIDGETS: WidgetDefinition[] = [
  // STATS
  { id: 'total_revenue', type: 'stat', title: 'Faturamento Total', category: 'sales', icon: DollarSign, defaultVisible: true, gridSpan: 1 },
  { id: 'monthly_revenue', type: 'stat', title: 'Faturamento Mensal', category: 'sales', icon: TrendingUp, defaultVisible: true, gridSpan: 1 },
  { id: 'conversion_rate', type: 'stat', title: 'Taxa de Conversão', category: 'performance', icon: Target, defaultVisible: true, gridSpan: 1 },
  { id: 'total_leads', type: 'stat', title: 'Total de Leads', category: 'leads', icon: Users, defaultVisible: true, gridSpan: 1 },
  { id: 'active_properties', type: 'stat', title: 'Imóveis Ativos', category: 'portfolio', icon: Building2, defaultVisible: true, gridSpan: 1 },
  { id: 'revenue_projection', type: 'stat', title: 'Projeção Proxima', category: 'insights' as any, icon: FileText, defaultVisible: true, gridSpan: 1 },
  
  // CHARTS
  { id: 'revenue_growth', type: 'chart_area', title: 'Crescimento de Receita', category: 'sales', icon: Activity, defaultVisible: true, gridSpan: 2 },
  { id: 'leads_funnel', type: 'funnel', title: 'Funil de Vendas', category: 'leads', icon: PieChart, defaultVisible: true, gridSpan: 1 },
  { id: 'portal_performance', type: 'chart_bar', title: 'Desempenho por Portal', category: 'portals', icon: Map, defaultVisible: true, gridSpan: 2 },
  { id: 'top_agents', type: 'ranking', title: 'Top Corretores', category: 'team', icon: Users, defaultVisible: true, gridSpan: 1 },
  
  // NEW COMPLEX WIDGETS
  { id: 'property_yield_chart', type: 'chart_bar', title: 'Yield por Categoria', category: 'insights' as any, icon: Building2, defaultVisible: false, gridSpan: 1 },
  { id: 'lead_response_time', type: 'chart_area', title: 'Tempo de Resposta (Média)', category: 'performance', icon: Clock, defaultVisible: false, gridSpan: 2 }
];
