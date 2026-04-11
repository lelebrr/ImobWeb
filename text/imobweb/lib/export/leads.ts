import { z } from 'zod';

export const LeadExportSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  source: z.string(),
  status: z.string(),
  propertyInterest: z.string().nullable(),
  budget: z.number().nullable(),
  notes: z.string().nullable(),
  createdAt: z.number(),
  lastContact: z.number().nullable(),
});

export type LeadExport = z.infer<typeof LeadExportSchema>;

export function exportLeadsToCSV(leads: LeadExport[], includeHeaders = true): string {
  const headers = ['ID', 'Nome', 'Email', 'Telefone', 'Origem', 'Status', 'Imóvel de Interesse', 'Budget', 'Notas', 'Criado em', 'Último Contato'];
  
  const rows = leads.map(lead => [
    lead.id,
    lead.name,
    lead.email || '',
    lead.phone || '',
    lead.source,
    lead.status,
    lead.propertyInterest || '',
    lead.budget ? String(lead.budget) : '',
    lead.notes || '',
    new Date(lead.createdAt).toLocaleDateString('pt-BR'),
    lead.lastContact ? new Date(lead.lastContact).toLocaleDateString('pt-BR') : '',
  ]);

  if (includeHeaders) {
    return [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
  }
  
  return rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
}

export function transformLeadForExport(lead: {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  source?: string;
  status?: string;
  propertyInterest?: string | null;
  budget?: number | null;
  notes?: string | null;
  createdAt?: number;
  lastContact?: number | null;
}): LeadExport {
  return {
    id: lead.id,
    name: lead.name,
    email: lead.email ?? null,
    phone: lead.phone ?? null,
    source: lead.source || 'website',
    status: lead.status || 'new',
    propertyInterest: lead.propertyInterest ?? null,
    budget: lead.budget ?? null,
    notes: lead.notes ?? null,
    createdAt: lead.createdAt || Date.now(),
    lastContact: lead.lastContact ?? null,
  };
}

export interface LeadReportSummary {
  total: number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
  averageBudget: number | null;
  conversionRate: number;
}

export function generateLeadReport(leads: LeadExport[]): LeadReportSummary {
  const byStatus: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  let totalBudget = 0;
  let budgetCount = 0;
  let converted = 0;

  for (const lead of leads) {
    byStatus[lead.status] = (byStatus[lead.status] || 0) + 1;
    bySource[lead.source] = (bySource[lead.source] || 0) + 1;
    
    if (lead.budget) {
      totalBudget += lead.budget;
      budgetCount++;
    }
    
    if (lead.status === 'converted' || lead.status === 'won') {
      converted++;
    }
  }

  return {
    total: leads.length,
    byStatus,
    bySource,
    averageBudget: budgetCount > 0 ? totalBudget / budgetCount : null,
    conversionRate: leads.length > 0 ? (converted / leads.length) * 100 : 0,
  };
}
