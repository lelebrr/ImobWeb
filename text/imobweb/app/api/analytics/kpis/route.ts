import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { KPI_DEFINITIONS, KpiCalculator, formatKpiValue } from '@/lib/analytics/kpi-definitions';
import type { KpiCalculationContext } from '@/lib/analytics/kpi-definitions';
import type { KpiValue, KpiCategory } from '@/types/analytics';

const kpiQuerySchema = z.object({
  kpiId: z.string().optional(),
  category: z.enum(['sales', 'leads', 'performance', 'financial', 'portfolio', 'team', 'portals']).optional(),
  period: z.enum(['week', 'month', 'quarter', 'year']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

function getMockKpiValue(kpiId: string): KpiValue {
  const mockValues: Record<string, number> = {
    total_revenue: 1250000,
    monthly_revenue: 185000,
    commission_total: 125000,
    average_ticket: 450000,
    conversion_rate: 8.5,
    lead_to_visit_rate: 38,
    visit_to_contract_rate: 22,
    average_sale_time: 45,
    average_rent_time: 28,
    active_properties: 156,
    properties_sold_month: 12,
    properties_rented_month: 8,
    total_leads: 234,
    lead_response_time: 12,
    owner_portfolio_score: 72,
    stale_properties: 8,
    agent_deals_count: 10,
    agent_productivity: 165000,
    pipeline_value: 3200000,
    churn_rate: 3.2
  };

  const mockPrevious: Record<string, number> = {
    total_revenue: 980000,
    monthly_revenue: 165000,
    average_ticket: 420000,
    conversion_rate: 7.2,
    active_properties: 142,
    total_leads: 198,
    average_sale_time: 52,
    pipeline_value: 2800000
  };

  const value = mockValues[kpiId] || Math.random() * 100000;
  const previousValue = mockPrevious[kpiId] || value * 0.9;
  const trend = value >= previousValue ? 'up' : 'down';

  return {
    kpiId,
    value,
    previousValue,
    trend,
    trendPercentage: ((value - previousValue) / previousValue) * 100,
    period: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    updatedAt: new Date()
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kpiId = searchParams.get('kpiId');
    const category = searchParams.get('category');
    const period = searchParams.get('period') || 'month';

    if (kpiId) {
      const definition = KPI_DEFINITIONS.find(k => k.id === kpiId);
      if (!definition) {
        return NextResponse.json({ error: 'KPI not found' }, { status: 404 });
      }

      const value = getMockKpiValue(kpiId);
      const formattedValue = formatKpiValue(value.value, definition.unit);

      return NextResponse.json({
        kpi: {
          ...definition,
          value: value.value,
          formatted: formattedValue,
          previousValue: value.previousValue,
          trend: value.trend,
          trendPercentage: value.trendPercentage,
          period: value.period
        }
      });
    }

    let kpis = KPI_DEFINITIONS;
    if (category) {
      kpis = kpis.filter(k => k.category === category);
    }

    const kpiValues = kpis.map(definition => {
      const value = getMockKpiValue(definition.id);
      return {
        ...definition,
        value: value.value,
        formatted: formatKpiValue(value.value, definition.unit),
        previousValue: value.previousValue,
        trend: value.trend,
        trendPercentage: value.trendPercentage,
        period: value.period
      };
    });

    const kpisByCategory = kpiValues.reduce((acc, kpi) => {
      if (!acc[kpi.category]) {
        acc[kpi.category] = [];
      }
      acc[kpi.category].push(kpi);
      return acc;
    }, {} as Record<string, typeof kpiValues>);

    return NextResponse.json({
      kpis: kpiValues,
      byCategory: kpisByCategory,
      summary: {
        totalKpis: kpis.length,
        categories: Object.keys(kpisByCategory).length,
        period
      }
    });
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    return NextResponse.json({ error: 'Failed to fetch KPIs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { kpiId, filters, dimensions } = z.object({
      kpiId: z.string(),
      filters: z.record(z.unknown()).optional(),
      dimensions: z.array(z.string()).optional()
    }).parse(body);

    const definition = KPI_DEFINITIONS.find(k => k.id === kpiId);
    if (!definition) {
      return NextResponse.json({ error: 'KPI not found' }, { status: 404 });
    }

    const value = getMockKpiValue(kpiId);

    const breakdown = dimensions?.map(dimension => {
      const mockBreakdown = [
        { label: 'São Paulo', value: value.value * 0.4, percentage: 40 },
        { label: 'Rio de Janeiro', value: value.value * 0.25, percentage: 25 },
        { label: 'Belo Horizonte', value: value.value * 0.2, percentage: 20 },
        { label: 'Outros', value: value.value * 0.15, percentage: 15 }
      ];
      return { dimension, values: mockBreakdown };
    }) || [];

    return NextResponse.json({
      kpi: definition,
      value,
      breakdown,
      filters
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.errors }, { status: 400 });
    }
    console.error('Error calculating KPI:', error);
    return NextResponse.json({ error: 'Failed to calculate KPI' }, { status: 500 });
  }
}
