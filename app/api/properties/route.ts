import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * PROPERTY API - IMOBWEB 2026
 * Handles CRUD for properties with Prisma.
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const city = searchParams.get('city');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 });
    }

    const where: any = { organizationId };
    if (status) where.status = status;
    if (type) where.type = type;
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          photos: { where: { isPrimary: true }, take: 1 },
          owner: { select: { id: true, name: true, phone: true, whatsapp: true } },
          _count: { select: { leads: true, announcements: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      title, description, type, businessType, status,
      price, priceRent, priceCondominium, priceIptu,
      areaPrivate, areaTotal, areaLand,
      bedrooms, bathrooms, garages,
      address, neighborhood, city, state, cep,
      latitude, longitude,
      organizationId, ownerId, userId,
      ...rest
    } = body;

    if (!title || !type || !businessType || !organizationId) {
      return NextResponse.json(
        { error: 'title, type, businessType, and organizationId are required' },
        { status: 400 }
      );
    }

    // Generate property code
    const propertyCount = await prisma.property.count({ where: { organizationId } });
    const code = `IW${String(propertyCount + 1).padStart(6, '0')}`;

    const newProperty = await prisma.property.create({
      data: {
        title,
        description,
        code,
        type,
        businessType,
        status: status || 'RASCUNHO',
        price: price || null,
        priceRent: priceRent || null,
        priceCondominium: priceCondominium || null,
        priceIptu: priceIptu || null,
        areaPrivate: areaPrivate || null,
        areaTotal: areaTotal || null,
        areaLand: areaLand || null,
        bedrooms: bedrooms || null,
        bathrooms: bathrooms || null,
        garages: garages || null,
        address,
        neighborhood,
        city,
        state,
        cep,
        latitude: latitude || null,
        longitude: longitude || null,
        organizationId,
        ownerId: ownerId || null,
        userId: userId || null,
      },
      include: {
        photos: true,
        owner: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: newProperty,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating property:', error);
    return NextResponse.json({ error: 'Failed to create property', details: error.message }, { status: 500 });
  }
}
