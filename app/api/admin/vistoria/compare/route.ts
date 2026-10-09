import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isSafeImageSrc } from '@/lib/vistoria/api-guard';
import { aiPreflight, aiErrorResponse } from '@/lib/vistoria/ai-route';
import { cleanText, dataUrlToPart, generateJson, type GeminiPart } from '@/lib/vistoria/gemini';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const Diff = z.object({
  type: z.enum(['dano_novo', 'item_ausente', 'piora', 'melhoria', 'desgaste_normal', 'sem_alteracao']).catch('piora'),
  description: z.string(),
  severity: z.enum(['leve', 'moderada', 'grave']).catch('leve'),
  confidence: z.coerce.number().catch(0.5),
});
const RoomOut = z.object({ summary: z.string().catch(''), differences: z.array(Diff).catch([]) });
const SummaryOut = z.object({ summary: z.string(), attention: z.array(z.string()).catch([]) });

const list = (v: unknown, n: number, len = 160) => (Array.isArray(v) ? v : []).map((x) => cleanText(x, len)).filter(Boolean).slice(0, n);
const side = (s: Record<string, unknown> | undefined) => ({
  itens: list(s?.items, 10, 140), moveis: list(s?.furniture, 30, 60), avarias: list(s?.damages, 20, 160),
  conservação: s?.checklist && typeof s.checklist === 'object' ? s.checklist : {}, observações: cleanText(s?.observations, 300),
});

const SYSTEM_ROOM = `Você compara a vistoria de ENTRADA e a de SAÍDA de um mesmo cômodo de imóvel alugado, no Brasil.
Regras:
- Baseie-se nas fotos (se houver) e nos dados fornecidos. Nunca invente diferenças. Se as fotos forem insuficientes ou de ângulos diferentes, diga isso e reduza a confiança.
- Classifique cada diferença: dano_novo, item_ausente, piora, melhoria, desgaste_normal (uso comum, sem dano) ou sem_alteracao.
- "confidence" de 0 a 1 reflete a certeza visual/documental.
- Linguagem neutra e factual, sem atribuir culpa nem fazer conclusões jurídicas. Português do Brasil.
- Responda APENAS com JSON: {"summary": "1 a 2 frases", "differences": [{"type": "...", "description": "...", "severity": "leve|moderada|grave", "confidence": 0.8}]}. No máximo 8 diferenças.`;

const SYSTEM_SUMMARY = `Você resume a comparação entre vistoria de entrada e de saída de um imóvel alugado, no Brasil.
Use SOMENTE os resultados por cômodo fornecidos. Seja factual, neutro e conciso (máx. 150 palavras), sem conclusões jurídicas.
Responda APENAS com JSON: {"summary": "...", "attention": ["até 6 pontos que merecem conferência humana"]}.`;

export async function POST(request: NextRequest) {
  const pre = await aiPreflight(request, 'compare', 40);
  if ('response' in pre) return pre.response;
  try {
    const b = await request.json();

    if (b?.mode === 'summary') {
      const rooms = (Array.isArray(b.rooms) ? b.rooms : []).slice(0, 40).map((r: Record<string, unknown>) => ({
        cômodo: cleanText(r.name, 60), resumo: cleanText(r.summary, 300),
        diferenças: (Array.isArray(r.differences) ? r.differences : []).slice(0, 8).map((d: Record<string, unknown>) => ({ tipo: cleanText(d.type, 20), descrição: cleanText(d.description, 200), gravidade: cleanText(d.severity, 10) })),
      }));
      const out = await generateJson(SummaryOut, {
        parts: [{ text: `Resultados por cômodo (JSON):\n${JSON.stringify(rooms)}` }], system: SYSTEM_SUMMARY, apiKey: pre.apiKey, temperature: 0.2, maxOutputTokens: 1200,
      });
      return NextResponse.json({ success: true, summary: cleanText(out.summary, 1500), attention: out.attention.map((a) => cleanText(a, 160)).filter(Boolean).slice(0, 6) });
    }

    const name = cleanText(b?.name, 60) || 'Cômodo';
    const grab = (v: unknown) => (Array.isArray(v) ? v : []).filter(isSafeImageSrc).filter((p: string) => p.startsWith('data:')).slice(0, 3);
    const ePhotos = grab(b?.entradaPhotos);
    const sPhotos = grab(b?.saidaPhotos);

    const parts: GeminiPart[] = [];
    ePhotos.forEach((p: string, i: number) => { const part = dataUrlToPart(p); if (part) parts.push({ text: `ENTRADA — foto ${i}:` }, part); });
    sPhotos.forEach((p: string, i: number) => { const part = dataUrlToPart(p); if (part) parts.push({ text: `SAÍDA — foto ${i}:` }, part); });
    parts.push({ text: `Cômodo: ${name}\nDados (JSON):\n${JSON.stringify({ entrada: side(b?.entrada), saída: side(b?.saida) })}\n\nCompare entrada e saída.` });

    const out = await generateJson(RoomOut, { parts, system: SYSTEM_ROOM, apiKey: pre.apiKey, temperature: 0.2, maxOutputTokens: 2500 });
    return NextResponse.json({
      success: true,
      summary: cleanText(out.summary, 400),
      differences: out.differences.slice(0, 8).map((d) => ({ type: d.type, description: cleanText(d.description, 240), severity: d.severity, confidence: Math.min(1, Math.max(0, d.confidence)) })).filter((d) => d.description),
    });
  } catch (err) {
    return aiErrorResponse(err, 'compare');
  }
}
