import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { aiPreflight, aiErrorResponse, clamp } from '@/lib/vistoria/ai-route';
import { cleanText, generateJson } from '@/lib/vistoria/gemini';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const Out = z.object({
  repairs: z.array(z.object({
    comodo: z.string().catch(''),
    descricao: z.string(),
    min: z.coerce.number().catch(0),
    max: z.coerce.number().catch(0),
    nota: z.string().catch(''),
  })).catch([]),
});

const SYSTEM = `Você é um orçamentista de reparos residenciais no Brasil.
Para cada avaria recebida, estime uma FAIXA de custo (mão de obra + material) em reais (BRL), compatível com a cidade informada.
Regras:
- É uma estimativa referencial, não um orçamento. Use faixas realistas e conservadoras (min <= max). Nunca invente avarias novas.
- Agrupe avarias idênticas do mesmo cômodo. Descrição curta e objetiva, em português do Brasil.
- "nota": suposição principal (ex.: "pintura de 1 parede, ~12 m²"). Se a avaria for vaga demais para estimar, use min e max 0 e explique na nota.
- Responda APENAS com JSON: {"repairs":[{"comodo":"...","descricao":"...","min":150,"max":300,"nota":"..."}]}`;

export async function POST(request: NextRequest) {
  const pre = await aiPreflight(request, 'repairs', 10);
  if ('response' in pre) return pre.response;
  try {
    const b = await request.json();
    const damages = (Array.isArray(b?.damages) ? b.damages : []).slice(0, 60)
      .map((d: Record<string, unknown>) => ({ comodo: cleanText(d?.comodo, 60), descricao: cleanText(d?.descricao, 160) }))
      .filter((d: { descricao: string }) => d.descricao);
    if (damages.length === 0) return NextResponse.json({ success: false, error: 'Nenhuma avaria informada' }, { status: 400 });
    const local = [cleanText(b?.cidade, 60), cleanText(b?.estado, 2)].filter(Boolean).join('/') || 'Brasil';
    const out = await generateJson(Out, {
      parts: [{ text: `Local: ${local}\nTipo de imóvel: ${cleanText(b?.tipoImovel, 40) || 'não informado'}\nAvarias (JSON):\n${JSON.stringify(damages)}` }],
      system: SYSTEM, apiKey: pre.apiKey, temperature: 0.2, maxOutputTokens: 3000,
    });
    const repairs = out.repairs.slice(0, 60).map((r) => {
      const min = Math.round(clamp(r.min, 0, 500_000)); const max = Math.round(clamp(r.max, 0, 500_000));
      return { comodo: cleanText(r.comodo, 60), descricao: cleanText(r.descricao, 160), min: Math.min(min, max), max: Math.max(min, max), nota: cleanText(r.nota, 200) };
    }).filter((r) => r.descricao);
    return NextResponse.json({ success: true, repairs });
  } catch (err) {
    return aiErrorResponse(err, 'repairs');
  }
}
