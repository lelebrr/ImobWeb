export type KpiCategory = 
  | 'sales'
  | 'leads'
  | 'performance'
  | 'financial'
  | 'portfolio'
  | 'team'
  | 'portals';

export type KpiUnit = 'currency' | 'percentage' | 'number' | 'days' | 'minutes' | 'ratio';

export type KpiTrend = 'up' | 'down' | 'stable' | 'neutral';

export interface KpiDefinition {
  id: string;
  name: string;
  description: string;
  category: KpiCategory;
  unit: KpiUnit;
  calculation: string;
  source: string[];
  thresholds?: {
    warning?: number;
    critical?: number;
    target?: number;
  };
}

export interface KpiValue {
  kpiId: string;
  value: number;
  previousValue?: number;
  trend?: KpiTrend;
  trendPercentage?: number;
  period: {
    start: Date;
    end: Date;
  };
  updatedAt: Date;
}

export interface KpiBreakdown {
  kpiId: string;
  dimension: string;
  values: Array<{
    label: string;
    value: number;
    percentage?: number;
  }>;
}

export interface DashboardConfig {
  id: string;
  name: string;
  type: 'executive' | 'sales' | 'agent' | 'franchise';
  filters: DashboardFilter[];
  widgets: DashboardWidget[];
}

export interface DashboardFilter {
  id: string;
  type: 'date_range' | 'agent' | 'region' | 'property_type' | 'portal' | 'status';
  label: string;
  options?: Array<{ value: string; label: string }>;
  defaultValue?: string | string[];
}

export interface DashboardWidget {
  id: string;
  type: 'kpi_card' | 'chart' | 'table' | 'funnel' | 'heatmap' | 'ranking';
  title: string;
  config: Record<string, unknown>;
  position: { x: number; y: number; w: number; h: number };
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    color?: string;
  }>;
}

export interface FunnelStage {
  name: string;
  value: number;
  percentage: number;
  color?: string;
}

export interface HeatmapCell {
  x: string;
  y: string;
  value: number;
  color?: string;
}

export interface RankingItem {
  rank: number;
  label: string;
  value: number;
  previousValue?: number;
  trend?: KpiTrend;
  metadata?: Record<string, unknown>;
}

export interface AnalyticsPeriod {
  start: Date;
  end: Date;
  label: string;
}

export interface TimeSeriesPoint {
  date: Date;
  value: number;
  metadata?: Record<string, unknown>;
}

export interface AgentPerformance {
  agentId: string;
  agentName: string;
  deals: number;
  revenue: number;
  leads: number;
  conversionRate: number;
  averageDealTime: number;
  ranking: number;
}

export interface PortalAnalytics {
  portalId: string;
  portalName: string;
  leads: number;
  views: number;
  contacts: number;
  conversionRate: number;
  spend: number;
  roi: number;
}

export interface RegionAnalytics {
  region: string;
  properties: number;
  deals: number;
  averagePrice: number;
  averageDaysOnMarket: number;
  topNeighborhoods: string[];
}

export interface ReportConfig {
  id: string;
  name: string;
  type: 'monthly' | 'weekly' | 'custom';
  frequency?: 'daily' | 'weekly' | 'monthly';
  filters: Record<string, unknown>;
  sections: string[];
  format: 'pdf' | 'excel' | 'email';
  recipients: string[];
  scheduledAt?: string;
}

export interface ReportData {
  reportId: string;
  generatedAt: Date;
  period: AnalyticsPeriod;
  sections: Record<string, unknown>;
}
