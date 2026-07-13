import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * CONTRACTS API - IMOBWEB 2026
 * Full CRUD with Prisma database operations.
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('id');
    const organizationId = searchParams.get('organizationId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 });
    }

    if (contractId) {
      const contract = await prisma.contract.findUnique({
        where: { id: contractId },
        include: {
          property: { select: { id: true, title: true, address: true, city: true } },
          parties: true,
          clauses: true,
          invoices: true,
        },
      });
      if (!contract) {
        return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
      }
      return NextResponse.json({ contract });
    }

    const where: any = { organizationId };
    if (type) where.type = type;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        include: {
          property: { select: { id: true, title: true, address: true } },
          parties: { select: { id: true, type: true, name: true, status: true } },
          _count: { select: { parties: true, invoices: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.contract.count({ where }),
    ]);

    return NextResponse.json({
      contracts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      type, title, description, propertyId, organizationId,
      totalValue, installments, startDate, endDate,
      parties, clauses, metadata,
    } = body;

    if (!type || !title || !organizationId) {
      return NextResponse.json(
        { error: 'type, title, and organizationId are required' },
        { status: 400 }
      );
    }

    const contract = await prisma.contract.create({
      data: {
        type,
        title,
        description: description || null,
        status: 'DRAFT',
        propertyId: propertyId || null,
        organizationId,
        totalValue: totalValue || null,
        installments: installments || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        metadata: metadata || null,
        parties: parties ? {
          create: parties.map((p: any) => ({
            type: p.type,
            name: p.name,
            document: p.document,
            documentType: p.documentType,
            email: p.email,
            phone: p.phone,
            address: p.address || null,
          })),
        } : undefined,
        clauses: clauses ? {
          create: clauses.map((c: any) => ({
            title: c.title,
            content: c.content,
            order: c.order || 0,
          })),
        } : undefined,
      },
      include: {
        property: { select: { id: true, title: true } },
        parties: true,
        clauses: true,
      },
    });

    return NextResponse.json({
      success: true,
      contract,
      message: 'Contract created successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating contract:', error);
    return NextResponse.json({ error: 'Failed to create contract', details: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('id');

    if (!contractId) {
      return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 });
    }

    const body = await request.json();

    const contract = await prisma.contract.update({
      where: { id: contractId },
      data: {
        status: body.status || undefined,
        title: body.title || undefined,
        description: body.description || undefined,
        totalValue: body.totalValue || undefined,
        installments: body.installments || undefined,
        metadata: body.metadata || undefined,
      },
      include: {
        property: { select: { id: true, title: true } },
        parties: true,
      },
    });

    return NextResponse.json({ success: true, contract });
  } catch (error: any) {
    console.error('Error updating contract:', error);
    return NextResponse.json({ error: 'Failed to update contract', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('id');

    if (!contractId) {
      return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 });
    }

    await prisma.contract.delete({ where: { id: contractId } });

    return NextResponse.json({ success: true, message: 'Contract deleted successfully' });
  } catch (error) {
    console.error('Error deleting contract:', error);
    return NextResponse.json({ error: 'Failed to delete contract' }, { status: 500 });
  }
}
