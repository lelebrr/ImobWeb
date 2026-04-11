import { NextRequest, NextResponse } from 'next/server';
import { DescriptionInputSchema, generateDescription, createDescriptionVariations } from '@/lib/ai/description-generator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validation = DescriptionInputSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: validation.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const result = generateDescription(validation.data);
    const variations = createDescriptionVariations(result);

    return NextResponse.json({
      success: true,
      data: {
        descriptions: {
          short: result.short,
          medium: result.medium,
          full: result.full,
        },
        variations,
        tags: result.tags,
        highlights: result.highlights,
        seoKeywords: result.seoKeywords,
      },
    });
  } catch (error) {
    console.error('Description generation error:', error);
    
    return NextResponse.json(
      {
        error: 'Erro ao processar solicitação',
        message: 'Não foi possível gerar a descrição. Tente novamente.',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/ai/generate-description',
    method: 'POST',
    description: 'Gera descrições otimizadas para imóvel',
    body: {
      title: 'Título opcional (opcional)',
      location: 'Localização/bairro (obrigatório)',
      area: 'Área em metros quadrados',
      propertyType: 'Tipo do imóvel (opcional)',
      beds: 'Número de quartos (opcional)',
      baths: 'Número de banheiros (opcional)',
      parking: 'Número de vagas (opcional)',
      floor: 'Andar (opcional)',
      totalFloors: 'Total de andares do prédio (opcional)',
      age: 'Idade do imóvel (opcional)',
      features: 'Array de características (opcional)',
      highlight: 'Destaque especial (opcional)',
      targetAudience: 'Público alvo (opcional): família, jovem, idoso, investidor, corporativo, todos',
      tone: 'Tom da descrição (opcional): formal, informal, persuasivo, técnico, luxo',
    },
    response: {
      descriptions: {
        short: 'Descrição curta (para cards)',
        medium: 'Descrição média (para listagens)',
        full: 'Descrição completa (para anúncios)',
      },
      variations: 'Variações da descrição',
      tags: 'Tags para categorização',
      highlights: 'Destaques do imóvel',
      seoKeywords: 'Palavras-chave para SEO',
    },
  });
}