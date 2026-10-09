import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { aiPreflight, aiErrorResponse } from '@/lib/vistoria/ai-route';
import { cleanText, generateJson } from '@/lib/vistoria/gemini';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const Out = z.object({
  text: z.string(),
  highlights: z.array(z.string()).catch([]),
});

const list = (v: unknown, n: number, len = 160): string[] =>
  (Array.isArray(v) ? v : []).map((x) => cleanText(x, len)).filter(Boolean).slice(0, n);

const SYSTEM = `Você redige as "Considerações Finais" de laudos de vistoria de imóveis no Brasil, para fins locatícios.
Regras:
- Use SOMENTE os dados fornecidos. Não invente testes, reparos, valores, datas nem estados que não constem nos dados.
- Texto formal, objetivo e neutro, em português do Brasil, em 2 a 4 parágrafos curtos (máximo 230 palavras).
- Cite avarias e itens relevantes por cômodo; se não houver avarias registradas, diga apenas que não foram registradas avarias relevantes nos dados da vistoria.
- Não faça conclusões jurídicas nem atribua culpa. Em vistoria de saída com dados da entrada, descreva divergências de forma factual ("constata-se, em relação à vistoria de entrada, ...").
- Se os dados forem escassos, seja breve e não complete com suposições.
- Responda APENAS com JSON: {"text": "...", "highlights": ["até 5 pontos de atenção curtos"]}.`;

export async function POST(request: NextRequest) {
  const pre = await aiPreflight(request, 'considerations', 10);
  if ('response' in pre) return pre.response;
  try {
    const b = await request.json();
    const rooms = (Array.isArray(b?.rooms) ? b.rooms : []).slice(0, 40).map((r: Record<string, unknown>) => ({
      cômodo: cleanText(r.name, 60),
      fotos: Number(r.photoCount) || 0,
      itens_observados: list(r.items, 10, 140),
      moveis_equipamentos: list(r.furniture, 25, 60),
      avarias: list(r.damages, 15, 160),
      problemas: list(r.problems, 15, 120),
      conservação: r.checklist && typeof r.checklist === 'object' ? Object.fromEntries(Object.entries(r.checklist as Record<string, unknown>).slice(0, 14).map(([k, v]) => [cleanText(k, 50), cleanText(v, 10)])) : {},
      observações: cleanText(r.observations, 300),
    }));
    if (rooms.length === 0) return NextResponse.json({ success: false, error: 'Sem cômodos para analisar' }, { status: 400 });

    const info = b.propertyInfo || {};
    const payload = {
      tipo_vistoria: ({ ENTRADA: 'entrada', SAIDA: 'saída', PERIODICA: 'periódica' } as Record<string, string>)[String(info.tipoVistoria)] || 'entrada',
      imóvel: { tipo: cleanText(info.tipoImovel, 30), finalidade: cleanText(info.finalidade, 30), metragem: cleanText(info.metragem, 20), mobiliado: cleanText(info.mobiliado, 20) },
      cômodos: rooms,
      divergências_em_relação_à_entrada: b.entradaResumo ? cleanText(b.entradaResumo, 1500) : undefined,
    };
    const out = await generateJson(Out, {
      parts: [{ text: `Dados da vistoria (JSON):\n${JSON.stringify(payload)}\n\nRedija as considerações finais.` }],
      system: SYSTEM, apiKey: pre.apiKey, temperature: 0.3, maxOutputTokens: 1500,
    });
    return NextResponse.json({ success: true, text: out.text.trim().slice(0, 2500), highlights: out.highlights.map((h) => cleanText(h, 140)).filter(Boolean).slice(0, 5) });
  } catch (err) {
    return aiErrorResponse(err, 'considerations');
  }
}
