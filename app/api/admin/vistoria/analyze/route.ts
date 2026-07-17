import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-2.0-flash';

interface RoomInput {
  name: string;
  photos: string[];
}

interface AnalyzeRequest {
  rooms: RoomInput[];
  propertyType: string;
  finality: string;
}

interface AnalyzeResult {
  items: string[];
  furniture: { name: string; color: string; condition: string }[];
  appliances: { name: string; brand?: string; condition: string }[];
  damages: { description: string; severity: string }[];
  suggestedFurniture: string[];
  suggestedDamages: string[];
}

async function analyzeRoomWithGemini(
  roomName: string,
  photos: string[],
  propertyType: string,
  finality: string
): Promise<AnalyzeResult> {
  const photoParts = photos.map((dataUrl) => {
    const base64 = dataUrl.split(',')[1];
    const mimeType = dataUrl.split(';')[0].split(':')[1] || 'image/jpeg';
    return { inlineData: { mimeType, data: base64 } };
  });

  const prompt = [
    'Você é uma vistoriadora profissional de imóveis no Brasil.',
    'Analise estas fotos do cômodo "' + roomName + '" de um(a) ' + propertyType + ' com finalidade ' + finality + '.',
    '',
    'Retorne um JSON com esta estrutura EXATA (sem markdown, sem ```):',
    '',
    '{',
    '  "items": ["✓ descrição do item 1 em estado", "✓ descrição do item 2 em estado"],',
    '  "furniture": [{"name": "móvel", "color": "cor", "condition": "estado"}],',
    '  "appliances": [{"name": "eletrodoméstico", "brand": "marca", "condition": "estado"}],',
    '  "damages": [{"description": "descrição da avaria", "severity": "leve/moderada/grave"}],',
    '  "suggestedFurniture": ["Porta", "Janela", "Torneira"],',
    '  "suggestedDamages": ["Desgaste na fechadura"]',
    '}',
    '',
    'Regras:',
    '- items: cada linha começa com ✓ e descreve um item visível com estado',
    '- furniture: móveis visíveis com nome, COR observada e estado',
    '- appliances: eletrodomésticos com marca se visível e estado',
    '- damages: avarias/defeitos visíveis com severidade',
    '- suggestedFurniture: móveis que o vistoriador deve adicionar ao inventário',
    '- suggestedDamages: avarias que devem ser registradas',
    '- Estados: novo, ótimo, bom, regular, ruim',
    '- Severidades: leve, moderada, grave',
    '- Não invente itens que não estão nas fotos',
    '- Retorne APENAS o JSON, sem texto adicional',
  ].join('\n');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, ...photoParts] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${err}`);
  }

  const data = await response.json();
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Clean up markdown code blocks if present
  text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    const parsed = JSON.parse(text);
    return {
      items: parsed.items || [],
      furniture: parsed.furniture || [],
      appliances: parsed.appliances || [],
      damages: parsed.damages || [],
      suggestedFurniture: parsed.suggestedFurniture || [],
      suggestedDamages: parsed.suggestedDamages || [],
    };
  } catch {
    // Fallback: try to extract items from text
    const items = text.split('\n').map((l: string) => l.trim()).filter((l: string) => l.startsWith('✓'));
    return {
      items: items.length > 0 ? items : [`✓ Cômodo "${roomName}" avaliado`],
      furniture: [],
      appliances: [],
      damages: [],
      suggestedFurniture: [],
      suggestedDamages: [],
    };
  }
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
      return NextResponse.json({ error: 'Nenhum cômodo fornecido' }, { status: 400 });
    }

    const results: Record<string, AnalyzeResult> = {};

    for (const room of rooms) {
      if (room.photos && room.photos.length > 0) {
        try {
          results[room.name] = await analyzeRoomWithGemini(room.name, room.photos, propertyType, finality);
        } catch (err) {
          console.error(`Error analyzing room ${room.name}:`, err);
          results[room.name] = {
            items: [`✓ Erro ao analisar fotos do(a) ${room.name}`],
            furniture: [], appliances: [], damages: [],
            suggestedFurniture: [], suggestedDamages: [],
          };
        }
      } else {
        results[room.name] = {
          items: [`✓ Cômodo "${room.name}" - sem fotos`],
          furniture: [], appliances: [], damages: [],
          suggestedFurniture: [], suggestedDamages: [],
        };
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Vistoria analyze error:', error);
    return NextResponse.json({ error: 'Erro ao analisar vistoria' }, { status: 500 });
  }
}
