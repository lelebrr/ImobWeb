import { NextRequest, NextResponse } from 'next/server';
import { AutomatedInsightsEngine } from '@/lib/insights/automated-reports';

/**
 * Endpoint para gerar resumo semanal de insights.
 * GET /api/insights/weekly-summary?organizationId=xxx
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json({ error: 'OrganizationId is required' }, { status: 400 });
    }

    const summary = await AutomatedInsightsEngine.generateWeeklySummary(organizationId);

    return NextResponse.json(summary);
  } catch (error: any) {
    console.error('Error Generating Weekly Summary:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
