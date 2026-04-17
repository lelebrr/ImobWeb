import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dealPipeline, createDealFromProperty, convertToContract } from '@/lib/deal-flow';
import { ContractType } from '@/types/contracts';

const createDealSchema = z.object({
  propertyId: z.string(),
  property: z.object({
    address: z.string(),
    city: z.string().optional(),
    state: z.string().optional()
  }),
  clientId: z.string(),
  client: z.object({
    name: z.string(),
    document: z.string(),
    email: z.string(),
    phone: z.string()
  }),
  value: z.number(),
  stageId: z.string().optional(),
  expectedCloseDate: z.string().datetime().optional(),
  notes: z.string().optional()
});

const updateDealSchema = z.object({
  stageId: z.string().optional(),
  value: z.number().optional(),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z.string().datetime().optional(),
  notes: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stageId = searchParams.get('stageId');
    const pipeline = dealPipeline.getPipeline();
    
    let deals = pipeline.deals;
    
    if (stageId) {
      deals = deals.filter(d => d.stageId === stageId);
    }

    const stages = pipeline.stages.map(stage => ({
      ...stage,
      deals: deals.filter(d => d.stageId === stage.id)
    }));

    return NextResponse.json({ deals, stages, metrics: dealPipeline.calculateConversionMetrics() });
  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'create') {
      const validated = createDealSchema.parse(body);
      
      const deal = createDealFromProperty(
        validated.propertyId,
        validated.property,
        validated.clientId,
        validated.client,
        validated.value,
        'current-user'
      );

      if (validated.expectedCloseDate) {
        dealPipeline.updateDeal(deal.id, { expectedCloseDate: new Date(validated.expectedCloseDate) });
      }

      return NextResponse.json({ success: true, deal }, { status: 201 });
    }

    if (action === 'move') {
      const { dealId, stageId } = z.object({
        dealId: z.string(),
        stageId: z.string()
      }).parse(body);

      const deal = dealPipeline.moveToStage(dealId, stageId);
      
      return NextResponse.json({ success: true, deal });
    }

    if (action === 'convertToContract') {
      const { dealId, type } = z.object({
        dealId: z.string(),
        type: z.enum(['sale', 'rent', 'proposal'])
      }).parse(body);

      const contractId = convertToContract(dealId, type as ContractType);
      
      return NextResponse.json({ success: true, contractId });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    console.error('Error processing deal action:', error);
    return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dealId = searchParams.get('id');

    if (!dealId) {
      return NextResponse.json({ error: 'Deal ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const updates = updateDealSchema.parse(body);

    const dealUpdates = {
      ...updates,
      expectedCloseDate: updates.expectedCloseDate ? new Date(updates.expectedCloseDate) : undefined
    };

    const deal = dealPipeline.updateDeal(dealId, dealUpdates);
    
    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deal });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    console.error('Error updating deal:', error);
    return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dealId = searchParams.get('id');

    if (!dealId) {
      return NextResponse.json({ error: 'Deal ID is required' }, { status: 400 });
    }

    const deleted = dealPipeline.deleteDeal(dealId);
    
    if (!deleted) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Deal deleted' });
  } catch (error) {
    console.error('Error deleting deal:', error);
    return NextResponse.json({ error: 'Failed to delete deal' }, { status: 500 });
  }
}
