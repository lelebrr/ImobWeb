import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PropertyGenerator } from '@/lib/ai/property-generator';

/**
 * PROPERTY API - IMOBWEB 2026
 * Handles CRUD for properties with Zod validation and AI auto-generation.
 */

const propertySchema = z.object({
  title: z.string().min(10),
  category: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'RURAL', 'INDUSTRIAL', 'LAND', 'VACATION']),
  typeId: z.string(),
  usage: z.enum(['FOR_SALE', 'FOR_RENT', 'BOTH']),
  price: z.object({
    amount: z.number().positive(),
    currency: z.enum(['BRL', 'USD', 'EUR']),
  }),
  address: z.object({
    street: z.string(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
  }),
  media: z.array(z.any()), // Simplified for validation
  metrics: z.record(z.any()),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const organizationId = searchParams.get('organizationId');

  // In a real scenario, this would query Prisma
  // const properties = await prisma.property.findMany({ where: { organizationId } });

  return NextResponse.json({
    success: true,
    data: [], // Mocked
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = propertySchema.parse(body);

    // 1. AI Auto-Generation for description if not provided
    const aiDescription = await PropertyGenerator.generateDescription(validatedData as any, body.media || []);

    // 2. Smart Photo Sorting
    const sortedMedia = PropertyGenerator.sortPhotos(body.media || []);

    // 3. In a real scenario: Save to DB
    // const newProperty = await prisma.property.create({ data: { ...validatedData, aiDescription, media: sortedMedia } });

    return NextResponse.json({
      success: true,
      data: {
        ...validatedData,
        aiDescription,
        media: sortedMedia,
        id: 'new-property-uuid',
      },
    });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
