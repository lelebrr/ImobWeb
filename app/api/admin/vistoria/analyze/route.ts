import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-2.0-flash';

interface RoomInput {
  name: string;
  photos: string[]; // base64 data URLs
}

interface AnalyzeRequest {
  rooms: RoomInput[];
  propertyType: string;
  finality: string;
}

async function analyzeRoomWithGemini(
  roomName: string,
  photos: string[],
  propertyType: string,
  finality: string
): Promise<string[]> {
  const photoParts = photos.map((dataUrl) => {
    const base64 = dataUrl.split(',')[1];
    const mimeType = dataUrl.split(';')[0].split(':')[1] || 'image/jpeg';
    return {
      inlineData: {
        mimeType,
        data: base64,
      },
    };
  });

  const prompt = `Você é uma vistoriadora profissional de imóveis no Brasil. Analise estas fotos do cômodo "${roomName}" de um(a) ${propertyType} com finalidade ${finality}.

Para CADA foto, descreva UM item/elemento visível no cômodo seguindo EXATAMENTE este formato:

✓ [descrição do item] em [estado de conservação];

Estados permitidos: "novo estado", "ótimo estado", "bom estado", "estado regular", "estado ruim"

Regras:
- Comece cada linha com ✓ (checkmark)
- Descreva materiais (madeira, cerâmica, mármore, alvenaria, etc.)
- Mencione cores quando visíveis
- Indique se está funcionando (para equipamentos)
- Seja específica: "porta de madeira e batente na cor branca" não "porta"
- Inclua TODOS os itens visíveis: pisos, paredes, tetos, portas, janelas, torneiras, louças,interruptores, luminárias, etc.
- Não invente itens que não estão nas fotos
- Retorne APENAS as linhas com ✓, uma por linha, sem numeração adicional`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              ...photoParts,
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${err}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Extract lines starting with ✓
  const items = text
    .split('\n')
    .map((line: string) => line.trim())
    .filter((line: string) => line.startsWith('✓'));

  return items.length > 0 ? items : [`✓ Cômodo "${roomName}" avaliado - ver fotos para detalhes`];
}

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY não configurada. Adicione a variável de ambiente.' },
        { status: 500 }
      );
    }

    const body: AnalyzeRequest = await request.json();
    const { rooms, propertyType, finality } = body;

    if (!rooms || rooms.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum cômodo fornecido' },
        { status: 400 }
      );
    }

    const results: Record<string, string[]> = {};

    // Process rooms sequentially to avoid rate limits
    for (const room of rooms) {
      if (room.photos && room.photos.length > 0) {
        try {
          const items = await analyzeRoomWithGemini(
            room.name,
            room.photos,
            propertyType,
            finality
          );
          results[room.name] = items;
        } catch (err) {
          console.error(`Error analyzing room ${room.name}:`, err);
          results[room.name] = [
            `✓ Erro ao analisar fotos do(a) ${room.name} - verificar manualmente`,
          ];
        }
      } else {
        results[room.name] = [
          `✓ Cômodo "${room.name}" - sem fotos para análise`,
        ];
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Vistoria analyze error:', error);
    return NextResponse.json(
      { error: 'Erro ao analisar vistoria' },
      { status: 500 }
    );
  }
}
