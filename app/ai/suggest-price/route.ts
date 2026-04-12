import { NextRequest, NextResponse } from 'next/server';
import { PriceInputSchema, suggestPrice, formatPrice } from '@/lib/ai/price-suggester';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validation = PriceInputSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: validation.error.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const result = suggestPrice(validation.data);

    return NextResponse.json({
      success: true,
      data: {
        suggestedPrice: result.suggestedPrice,
        formattedPrice: formatPrice(result.suggestedPrice),
        range: {
          min: result.minPrice,
          max: result.maxPrice,
          formattedMin: formatPrice(result.minPrice),
          formattedMax: formatPrice(result.maxPrice),
        },
        pricePerSqm: result.pricePerSqm,
        formattedPricePerSqm: formatPrice(result.pricePerSqm),
        confidence: result.confidence,
        confidenceLevel: getConfidenceLevel(result.confidence),
        factors: result.factors,
        marketData: result.marketData,
      },
    });
  } catch (error) {
    console.error('Price suggestion error:', error);
    
    return NextResponse.json(
      {
        error: 'Erro ao processar solicitação',
        message: 'Não foi possível gerar a sugestão de preço. Tente novamente.',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/ai/suggest-price',
    method: 'POST',
    description: 'Sugere preço para imóvel baseado em características',
    body: {
      type: 'Tipo do imóvel (apartamento, casa, terreno, comercial, salas, galpão, loja)',
      area: 'Área em metros quadrados',
      location: 'Localização/bairro',
      zone: 'Zona (opcional): centro, zona-norte, zona-sul, zona-leste, zona-oeste, periferia, litoral, interior',
      beds: 'Número de quartos (opcional)',
      baths: 'Número de banheiros (opcional)',
      parking: 'Número de vagas (opcional)',
      age: 'Idade do imóvel em anos (opcional)',
      features: 'Array de características (opcional)',
      floor: 'Andar (opcional)',
      hasElevator: 'Possui elevador (opcional)',
    },
    response: {
      suggestedPrice: 'Preço sugerido em reais',
      formattedPrice: 'Preço formatado (R$ X.XXX,XX)',
      range: 'Faixa de preço com mínimo e máximo',
      confidence: 'Nível de confiança (0-1)',
      factors: 'Fatores que influenciaram o preço',
      marketData: 'Dados de mercado仅供参考',
    },
  });
}

function getConfidenceLevel(confidence: number): string {
  if (confidence >= 0.9) return 'Muito alto';
  if (confidence >= 0.75) return 'Alto';
  if (confidence >= 0.6) return 'Médio';
  if (confidence >= 0.45) return 'Baixo';
  return 'Muito baixo';
}
