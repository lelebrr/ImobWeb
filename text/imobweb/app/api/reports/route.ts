import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createReport, generateMonthlyReport } from '@/lib/reporting/report-generator';
import { createDataWarehouse } from '@/lib/data-warehouse';
import type { ReportConfig, AnalyticsPeriod } from '@/types/analytics';

const createReportSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['monthly', 'weekly', 'custom']),
  sections: z.array(z.string()),
  filters: z.record(z.unknown()).optional(),
  format: z.enum(['pdf', 'excel', 'email']).optional()
});

const generateReportSchema = z.object({
  reportId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  format: z.enum(['pdf', 'excel', 'html']).optional()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const reportId = searchParams.get('id');

    const mockReports: Array<ReportConfig & { lastGenerated?: string; nextScheduled?: string }> = [
      {
        id: 'monthly-jan-2026',
        name: 'Relatório Mensal Janeiro 2026',
        type: 'monthly',
        frequency: 'monthly',
        filters: { month: '2026-01' },
        sections: ['executive_summary', 'sales_performance', 'leads_analysis', 'team_performance', 'recommendations'],
        format: 'pdf',
        recipients: ['gerente@imobweb.com'],
        lastGenerated: '2026-01-31T23:00:00Z',
        nextScheduled: '2026-02-28T23:00:00Z'
      },
      {
        id: 'weekly-week-5-2026',
        name: 'Relatório Semanal - Semana 5',
        type: 'weekly',
        frequency: 'weekly',
        filters: { week: '2026-W5' },
        sections: ['sales_performance', 'leads_analysis'],
        format: 'email',
        recipients: ['equipe@imobweb.com'],
        lastGenerated: '2026-02-02T18:00:00Z',
        nextScheduled: '2026-02-09T18:00:00Z'
      }
    ];

    if (action === 'scheduled') {
      const scheduledReports = mockReports.filter(r => r.frequency && r.nextScheduled);
      return NextResponse.json({ reports: scheduledReports });
    }

    if (reportId) {
      const report = mockReports.find(r => r.id === reportId);
      if (!report) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 });
      }

      const dataWarehouse = createDataWarehouse(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        new Date()
      );
      const reportData = dataWarehouse.getSalesSummary();

      return NextResponse.json({ report, data: reportData });
    }

    return NextResponse.json({ reports: mockReports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'generate') {
      const validated = generateReportSchema.parse(body);
      
      const now = new Date();
      const startDate = validated.startDate ? new Date(validated.startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = validated.endDate ? new Date(validated.endDate) : now;

      const period: AnalyticsPeriod = { start: startDate, end: endDate, label: now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) };
      const reportData = generateMonthlyReport(period);

      if (validated.format === 'html') {
        const generator = createReport({ 
          id: validated.reportId || reportData.reportId, 
          name: 'Relatório',
          type: 'custom',
          sections: ['executive_summary', 'sales_performance', 'recommendations'],
          format: 'pdf',
          recipients: []
        });
        
        const html = generator.toHTML(reportData);
        
        return NextResponse.json({
          success: true,
          reportId: reportData.reportId,
          html,
          format: 'html'
        });
      }

      return NextResponse.json({
        success: true,
        reportId: reportData.reportId,
        reportData,
        downloadUrl: `/api/reports/download/${reportData.reportId}`
      });
    }

    if (action === 'create') {
      const validated = createReportSchema.parse(body);
      
      const newReport: ReportConfig = {
        id: `report-${Date.now()}`,
        name: validated.name,
        type: validated.type,
        sections: validated.sections,
        filters: validated.filters || {},
        format: validated.format || 'pdf',
        recipients: [],
        frequency: validated.type === 'monthly' ? 'monthly' : validated.type === 'weekly' ? 'weekly' : undefined
      };

      return NextResponse.json({
        success: true,
        report: newReport,
        message: 'Report created successfully'
      }, { status: 201 });
    }

    if (action === 'schedule') {
      const { reportId, schedule } = z.object({
        reportId: z.string(),
        schedule: z.object({
          frequency: z.enum(['daily', 'weekly', 'monthly']),
          time: z.string(),
          dayOfWeek: z.number().min(0).max(6).optional(),
          dayOfMonth: z.number().min(1).max(31).optional()
        })
      }).parse(body);

      return NextResponse.json({
        success: true,
        message: `Report ${reportId} scheduled for ${schedule.frequency}`,
        nextRun: new Date(Date.now() + 86400000).toISOString()
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('Error processing report action:', error);
    return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('id');

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Report ${reportId} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 });
  }
}
