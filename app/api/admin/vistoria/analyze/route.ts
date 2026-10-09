import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isSafeImageSrc } from '@/lib/vistoria/api-guard';
import { aiPreflight, aiErrorResponse, clamp } from '@/lib/vistoria/ai-route';
import { cleanText, dataUrlToPart, generateJson, geminiModels, resolveApiKey, type GeminiPart } from '@/lib/vistoria/gemini';
import { CHECKLIST_ITEMS } from '@/lib/vistoria/shared';
import { requireUser } from '@/lib/vistoria/api-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const strArr = z.array(z.string()).catch([]);
const state = z.enum(['ok', 'regular', 'ruim', 'na']);

const AnalyzeOut = z.object({
  items: strArr,
  furniture: z.array(z.object({ name: z.string(), color: z.string().catch(''), condition: z.string().catch('') })).catch([]),
  appliances: z.array(z.object({ name: z.string(), brand: z.string().optional().catch(undefined), condition: z.string().catch('') })).catch([]),
  damages: z.array(z.object({ description: z.string(), severity: z.string().catch('leve'), photo: z.number().optional().catch(undefined) })).catch([]),
  suggestedFurniture: strArr,
  suggestedDamages: strArr,
  checklist: z.record(z.string(), state.catch('na')).catch({}),
  annotations: z.array(z.object({ photo: z.coerce.number(), x: z.coerce.number(), y: z.coerce.number(), label: z.string() })).catch([]),
  photoNotes: z.array(z.object({ photo: z.coerce.number(), issue: z.string(), advice: z.string().catch('') })).catch([]),
  missingShots: strArr,
});

export interface AnalyzeResult {
  items: string[];
  furniture: { name: string; color: string; condition: string }[];
  appliances: { name: string; brand?: string; condition: string }[];
  damages: { description: string; severity: string }[];
  suggestedFurniture: string[];
  suggestedDamages: string[];
  checklist: Record<string, 'ok' | 'regular' | 'ruim' | 'na'>;
  annotations: { photo: number; x: number; y: number; label: string }[];
  photoNotes: { photo: number; issue: string; advice: string }[];
  missingShots: string[];
}

interface RoomInput {
  name: string;
  photos: string[];
  knownFurniture?: string[];
  knownDamages?: string[];
}

const SYSTEM = `Você é uma vistoriadora de imóveis experiente no Brasil e redige laudos para fins locatícios.
Regras invioláveis:
- Descreva SOMENTE o que está visível nas fotos. Nunca invente itens, marcas, medidas ou defeitos. Na dúvida, não afirme.
- Seja objetiva, técnica e neutra: descreva o estado do imóvel, sem atribuir culpa a ninguém.
- Diferencie desgaste natural de uso (leve) de avaria (dano que exige reparo).
- Escreva em português do Brasil.
- Responda APENAS com JSON válido no formato pedido.`;

function buildPrompt(room: RoomInput, propertyType: string, finality: string, tipoVistoria: string, nPhotos: number): string {
  return [
    `Analise as ${nPhotos} foto(s) do cômodo "${room.name}" de um(a) ${propertyType || 'imóvel'} (${finality || 'RESIDENCIAL'}). Tipo de vistoria: ${tipoVistoria}.`,
    'As fotos vêm numeradas a partir de 0 ("Foto 0", "Foto 1"...).',
    room.knownFurniture?.length ? `Móveis/equipamentos já registrados pela vistoriadora: ${room.knownFurniture.slice(0, 40).join('; ')}. Não os repita em suggestedFurniture.` : '',
    room.knownDamages?.length ? `Avarias já registradas: ${room.knownDamages.slice(0, 40).join('; ')}. Não as repita em suggestedDamages.` : '',
    '',
    'Retorne JSON com EXATAMENTE estas chaves:',
    '{',
    '  "items": ["✓ Parede em pintura branca, bom estado", ...],   // 6 a 14 linhas, cada uma começa com "✓ " e descreve um elemento visível e seu estado',
    '  "furniture": [{"name": "Armário de cozinha", "color": "branco", "condition": "bom"}],',
    '  "appliances": [{"name": "Fogão 4 bocas", "brand": "marca só se legível", "condition": "bom"}],',
    '  "damages": [{"description": "Mancha de umidade no canto superior esquerdo da parede", "severity": "leve|moderada|grave", "photo": 0}],',
    '  "suggestedFurniture": ["nomes curtos de itens do inventário ainda não registrados"],',
    '  "suggestedDamages": ["descrições curtas de avarias ainda não registradas"],',
    `  "checklist": {"<elemento>": "ok|regular|ruim|na"},   // elementos permitidos: ${CHECKLIST_ITEMS.join(' | ')}. Inclua somente os que dá para avaliar nas fotos`,
    '  "annotations": [{"photo": 0, "x": 35, "y": 60, "label": "Mancha de umidade"}],   // x e y em % (0-100) a partir do canto superior esquerdo da foto; apenas para avarias claras; máximo 8; label com até 30 caracteres',
    '  "photoNotes": [{"photo": 1, "issue": "foto escura|desfocada|distante|cortada|reflexo", "advice": "como refazer a foto"}],   // só para fotos com problema real de qualidade',
    '  "missingShots": ["fotos que ainda faltam para documentar bem o cômodo, ex.: Teto e luminária"]   // máximo 5',
    '}',
    'Estados: ok=bom/novo, regular=desgaste visível, ruim=dano relevante, na=não se aplica.',
  ].filter(Boolean).join('\n');
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

function normalize(raw: z.infer<typeof AnalyzeOut>, nPhotos: number): AnalyzeResult {
  const items = raw.items.map((i) => cleanText(i, 220)).filter(Boolean).slice(0, 20)
    .map((i) => (i.startsWith('✓') ? i : `✓ ${i}`));
  const damages = raw.damages.map((d) => ({
    description: cleanText(d.description, 200),
    severity: ['leve', 'moderada', 'grave'].includes(norm(d.severity)) ? norm(d.severity) : 'leve',
  })).filter((d) => d.description).slice(0, 15);

  const sd = new Map<string, string>();
  for (const d of damages) sd.set(norm(d.description), d.severity === 'leve' ? d.description : `${d.description} (${d.severity})`);
  for (const s of raw.suggestedDamages) { const t = cleanText(s, 160); if (t && !sd.has(norm(t))) sd.set(norm(t), t); }

  const sf = new Map<string, string>();
  for (const f of raw.furniture) { const t = cleanText(f.name, 80); if (t) sf.set(norm(t), t); }
  for (const f of raw.appliances) { const t = cleanText(f.name, 80); if (t) sf.set(norm(t), t); }
  for (const s of raw.suggestedFurniture) { const t = cleanText(s, 80); if (t) sf.set(norm(t), t); }

  const allowed = new Set<string>(CHECKLIST_ITEMS);
  const checklist: AnalyzeResult['checklist'] = {};
  for (const [k, v] of Object.entries(raw.checklist)) if (allowed.has(k) && v !== 'na') checklist[k] = v;

  return {
    items,
    furniture: raw.furniture.map((f) => ({ name: cleanText(f.name, 80), color: cleanText(f.color, 40), condition: cleanText(f.condition, 40) })).filter((f) => f.name),
    appliances: raw.appliances.map((f) => ({ name: cleanText(f.name, 80), brand: f.brand ? cleanText(f.brand, 40) : undefined, condition: cleanText(f.condition, 40) })).filter((f) => f.name),
    damages,
    suggestedFurniture: [...sf.values()].slice(0, 30),
    suggestedDamages: [...sd.values()].slice(0, 20),
    checklist,
    annotations: raw.annotations
      .filter((a) => Number.isInteger(a.photo) && a.photo >= 0 && a.photo < nPhotos && cleanText(a.label, 40))
      .map((a) => ({ photo: a.photo, x: Math.round(clamp(a.x, 2, 98)), y: Math.round(clamp(a.y, 2, 98)), label: cleanText(a.label, 30) }))
      .slice(0, 8),
    photoNotes: raw.photoNotes
      .filter((n) => Number.isInteger(n.photo) && n.photo >= 0 && n.photo < nPhotos)
      .map((n) => ({ photo: n.photo, issue: cleanText(n.issue, 60), advice: cleanText(n.advice, 160) })).slice(0, 8),
    missingShots: raw.missingShots.map((m) => cleanText(m, 80)).filter(Boolean).slice(0, 5),
  };
}

export async function POST(request: NextRequest) {
  const pre = await aiPreflight(request, 'analyze', 20);
  if ('response' in pre) return pre.response;
  try {
    const body = await request.json();
    const rooms: RoomInput[] = Array.isArray(body?.rooms) ? body.rooms : [];
    if (rooms.length === 0 || rooms.length > 5) {
      return NextResponse.json({ success: false, error: 'Nenhum cômodo fornecido' }, { status: 400 });
    }
    const propertyType = cleanText(body.propertyType, 40);
    const finality = cleanText(body.finality, 40);
    const tipoVistoria = ({ ENTRADA: 'entrada', SAIDA: 'saída', PERIODICA: 'periódica' } as Record<string, string>)[String(body.tipoVistoria)] || 'entrada';

    const results: Record<string, AnalyzeResult> = {};
    for (const r of rooms) {
      const name = cleanText(r.name, 80) || 'Cômodo';
      const photos = (Array.isArray(r.photos) ? r.photos : []).filter(isSafeImageSrc).filter((p) => p.startsWith('data:')).slice(0, 8);
      if (photos.length === 0) {
        results[name] = normalize(AnalyzeOut.parse({ items: [`✓ Cômodo "${name}" - sem fotos`] }), 0);
        continue;
      }
      const parts: GeminiPart[] = [];
      photos.forEach((p, i) => {
        const part = dataUrlToPart(p);
        if (part) { parts.push({ text: `Foto ${i}:` }, part); }
      });
      parts.push({ text: buildPrompt({ ...r, name, knownFurniture: (r.knownFurniture || []).map((s) => cleanText(s, 80)), knownDamages: (r.knownDamages || []).map((s) => cleanText(s, 160)) }, propertyType, finality, tipoVistoria, photos.length) });
      const raw = await generateJson(AnalyzeOut, { parts, system: SYSTEM, apiKey: pre.apiKey, temperature: 0.2, maxOutputTokens: 4096 });
      results[name] = normalize(raw, photos.length);
    }
    return NextResponse.json({ success: true, results });
  } catch (error) {
    return aiErrorResponse(error, 'analyze');
  }
}

/** Estado real da IA (chave presente? qual modelo?) — usado pela interface. */
export async function GET(request: NextRequest) {
  const guard = await requireUser();
  if ('response' in guard) return guard.response;
  const configured = !!resolveApiKey(request.headers.get('x-gemini-key'));
  return NextResponse.json({ success: true, configured, model: geminiModels()[0], source: process.env.GEMINI_API_KEY ? 'server' : configured ? 'user' : 'none' });
}
