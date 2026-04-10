import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const createPropertySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  price: z.number().positive(),
  transactionType: z.enum(['sale', 'rent']),
  propertyType: z.enum(['apartment', 'house', 'commercial', 'land', 'industrial']),
  address: z.object({
    street: z.string(),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string().optional()
  }),
  features: z.object({
    bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
    parkingSpaces: z.number().optional(),
    area: z.number().optional(),
    totalArea: z.number().optional(),
    builtArea: z.number().optional()
  }).optional(),
  photos: z.array(z.string()).optional(),
  status: z.enum(['active', 'pending', 'sold', 'rented', 'inactive']).optional()
});

const MOCK_PROPERTIES = [
  { id: '1', title: 'Apartamento no Centro', price: 450000, transactionType: 'sale', status: 'active', city: 'São Paulo', views: 1250 },
  { id: '2', title: 'Casa na Zona Sul', price: 850000, transactionType: 'sale', status: 'active', city: 'São Paulo', views: 980 },
  { id: '3', title: 'Apartamento na Av. Paulista', price: 5000, transactionType: 'rent', status: 'active', city: 'São Paulo', views: 756 },
  { id: '4', title: 'Sala Comercial', price: 350000, transactionType: 'sale', status: 'pending', city: 'São Paulo', views: 432 },
  { id: '5', title: 'Terreno na Zona Oeste', price: 280000, transactionType: 'sale', status: 'active', city: 'São Paulo', views: 321 }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const transactionType = searchParams.get('transactionType');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');

    let properties = MOCK_PROPERTIES;

    if (status) properties = properties.filter(p => p.status === status);
    if (transactionType) properties = properties.filter(p => p.transactionType === transactionType);
    if (minPrice) properties = properties.filter(p => p.price >= parseFloat(minPrice));
    if (maxPrice) properties = properties.filter(p => p.price <= parseFloat(maxPrice));
    if (search) properties = properties.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

    return NextResponse.json({ properties, total: properties.length });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createPropertySchema.parse(body);

    const property = {
      id: `prop-${Date.now()}`,
      ...validated,
      status: validated.status || 'active',
      views: 0,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({ success: true, property }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('Error creating property:', error);
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
  }
}