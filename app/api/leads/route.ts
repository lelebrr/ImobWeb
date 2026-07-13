import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * LEADS API - IMOBWEB 2026
 * Full CRUD with Prisma database operations.
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const assignedToId = searchParams.get('assignedTo');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 });
    }

    const where: any = { organizationId };
    if (status) where.status = status;
    if (source) where.source = source;
    if (assignedToId) where.assignedToId = assignedToId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { whatsapp: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [leads, total, stats] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          property: { select: { id: true, title: true, address: true, city: true } },
          assignedTo: { select: { id: true, name: true, email: true } },
          _count: { select: { conversations: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.lead.count({ where }),
      prisma.lead.groupBy({
        by: ['status'],
        where: { organizationId },
        _count: true,
      }),
    ]);

    const statsMap = {
      total,
      new: 0,
      contatado: 0,
      interessado: 0,
      convertido: 0,
      perdido: 0,
    };
    stats.forEach((s: any) => {
      if (s.status === 'NOVO') statsMap.new = s._count;
      else if (s.status === 'CONTATADO') statsMap.contatado = s._count;
      else if (s.status === 'INTERESSADO') statsMap.interessado = s._count;
      else if (s.status === 'CONVERTIDO') statsMap.convertido = s._count;
      else if (s.status === 'PERDIDO') statsMap.perdido = s._count;
    });

    return NextResponse.json({
      leads,
      stats: statsMap,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'updateStatus') {
      const { leadId, status } = body;
      if (!leadId || !status) {
        return NextResponse.json({ error: 'leadId and status are required' }, { status: 400 });
      }

      const lead = await prisma.lead.update({
        where: { id: leadId },
        data: { status },
      });

      return NextResponse.json({ success: true, lead });
    }

    if (action === 'assign') {
      const { leadId, userId } = body;
      if (!leadId || !userId) {
        return NextResponse.json({ error: 'leadId and userId are required' }, { status: 400 });
      }

      const lead = await prisma.lead.update({
        where: { id: leadId },
        data: { assignedToId: userId },
      });

      return NextResponse.json({ success: true, lead });
    }

    // Default: create lead
    const {
      name, email, phone, whatsapp, source, propertyId,
      notes, organizationId, budget, maxPrice, bedrooms, bathrooms,
      city, neighborhood, state,
    } = body;

    if (!name || !organizationId) {
      return NextResponse.json({ error: 'name and organizationId are required' }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        whatsapp: whatsapp || null,
        source: source || 'OTHER',
        status: 'NOVO',
        propertyId: propertyId || null,
        organizationId,
        notes: notes || null,
        budget: budget || null,
        maxPrice: maxPrice || null,
        bedrooms: bedrooms || null,
        bathrooms: bathrooms || null,
        city: city || null,
        neighborhood: neighborhood || null,
        state: state || null,
      },
      include: {
        property: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch (error: any) {
    console.error('Error processing lead action:', error);
    return NextResponse.json({ error: 'Failed to process action', details: error.message }, { status: 500 });
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

    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        name: body.name || undefined,
        email: body.email || undefined,
        phone: body.phone || undefined,
        whatsapp: body.whatsapp || undefined,
        status: body.status || undefined,
        notes: body.notes || undefined,
        assignedToId: body.assignedTo || undefined,
        budget: body.budget || undefined,
        maxPrice: body.maxPrice || undefined,
      },
      include: {
        property: { select: { id: true, title: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ error: 'Failed to update lead', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('id');

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    await prisma.lead.delete({ where: { id: leadId } });

    return NextResponse.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
  }
}
