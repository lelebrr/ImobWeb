import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const createLeadSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional(),
  phone: z.string().min(10).max(20),
  source: z.enum(['zap', 'viva', 'olx', 'imovelweb', 'chaves', 'website', 'referral', 'other']),
  propertyId: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'visiting', 'proposal', 'closed', 'lost']).optional()
});

const updateLeadSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).max(20).optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'visiting', 'proposal', 'closed', 'lost']).optional(),
  notes: z.string().optional(),
  assignedTo: z.string().optional()
});

const MOCK_LEADS = [
  { id: '1', name: 'Maria Santos', email: 'maria@email.com', phone: '11988887777', source: 'zap', status: 'new', propertyId: '1', createdAt: '2026-04-09T10:00:00Z' },
  { id: '2', name: 'João Silva', email: 'joao@email.com', phone: '11977776666', source: 'viva', status: 'contacted', propertyId: '2', createdAt: '2026-04-08T14:30:00Z' },
  { id: '3', name: 'Ana Costa', email: 'ana@email.com', phone: '11966665555', source: 'olx', status: 'qualified', propertyId: '1', createdAt: '2026-04-07T09:15:00Z' },
  { id: '4', name: 'Pedro Lima', email: 'pedro@email.com', phone: '11955554444', source: 'referral', status: 'visiting', propertyId: '3', createdAt: '2026-04-06T16:45:00Z' },
  { id: '5', name: 'Carlos Oliveira', email: 'carlos@email.com', phone: '11944443333', source: 'website', status: 'proposal', propertyId: '4', createdAt: '2026-04-05T11:20:00Z' }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const assignedTo = searchParams.get('assignedTo');

    let leads = MOCK_LEADS;

    if (status) leads = leads.filter(l => l.status === status);
    if (source) leads = leads.filter(l => l.source === source);
    if (assignedTo) leads = leads.filter(l => l.assignedTo === assignedTo);

    const stats = {
      total: MOCK_LEADS.length,
      new: MOCK_LEADS.filter(l => l.status === 'new').length,
      contacted: MOCK_LEADS.filter(l => l.status === 'contacted').length,
      qualified: MOCK_LEADS.filter(l => l.status === 'qualified').length,
      closed: MOCK_LEADS.filter(l => l.status === 'closed').length
    };

    return NextResponse.json({ leads, stats });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'create') {
      const validated = createLeadSchema.parse(body);
      
      const lead = {
        id: `lead-${Date.now()}`,
        ...validated,
        status: validated.status || 'new',
        createdAt: new Date().toISOString()
      };

      return NextResponse.json({ success: true, lead }, { status: 201 });
    }

    if (action === 'updateStatus') {
      const { leadId, status } = z.object({
        leadId: z.string(),
        status: z.enum(['new', 'contacted', 'qualified', 'visiting', 'proposal', 'closed', 'lost'])
      }).parse(body);

      return NextResponse.json({ success: true, message: `Lead ${leadId} updated to ${status}` });
    }

    if (action === 'assign') {
      const { leadId, userId } = z.object({
        leadId: z.string(),
        userId: z.string()
      }).parse(body);

      return NextResponse.json({ success: true, message: `Lead ${leadId} assigned to ${userId}` });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('Error processing lead action:', error);
    return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('id');

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const updates = updateLeadSchema.parse(body);

    return NextResponse.json({ success: true, leadId, updates });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('Error updating lead:', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('id');

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `Lead ${leadId} deleted` });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
  }
}
