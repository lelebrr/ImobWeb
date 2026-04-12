import { NextRequest, NextResponse } from 'next/server';
import { PriceRecommender } from '@/lib/predictive/price-recommender';

/**
 * Endpoint para obter recomendações de preço via IA.
 * POST /api/ai-predictive/price-recommend
 * Body: { propertyId: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { propertyId } = await req.json();

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    const recommendation = await PriceRecommender.suggestPrice(propertyId);

    return NextResponse.json(recommendation);
  } catch (error: any) {
    console.error('Error in Price Recommendation API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
