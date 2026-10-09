import { NextRequest, NextResponse } from 'next/server';
import { isSafeImageSrc } from '@/lib/vistoria/api-guard';
import { aiPreflight, aiErrorResponse } from '@/lib/vistoria/ai-route';
import { cleanText, dataUrlToPart, generateJson, type GeminiPart } from '@/lib/vistoria/gemini';
import { DEFECT_TYPES } from '@/lib/vistoria/shared';
import { InspectOut, normalizeInspection } from '@/lib/vistoria/inspection-schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const SYSTEM = `Você é um inspetor de imóveis experiente no Brasil. Sua tarefa é DETECTAR, nas fotos, os objetos do inventário e os DEFEITOS visíveis.
Regras invioláveis:
- Só afirme o que é claramente visível. Reflexos, sombras, poeira leve, cabos normais, bagunça e objetos pessoais NÃO são defeitos.
- "confidence" (0 a 1) deve ser honesta: foto distante, escura ou desfocada reduz a confiança. Prefira não listar a inventar.
- Desgaste natural de uso é severity "leve" e type "desgaste". Só use "moderada" ou "grave" quando houver dano que exija reparo.
- Descrição objetiva, em português do Brasil, com a localização ("no tampo da mesa, lado esquerdo"). Sem atribuir culpa.
- Responda APENAS com JSON válido.`;

function prompt(room: string, propertyType: string, n: number): string {
  return [
    `Inspecione ${n} foto(s) do cômodo "${room}" de um(a) ${propertyType || 'imóvel'}. As fotos são numeradas a partir de 0 ("Foto 0", "Foto 1"...).`,
    '',
    'OBJETOS (inventário): móveis (mesa, cadeira, cama, sofá, armário, guarda-roupa, bancada), eletrodomésticos (fogão, geladeira, micro-ondas, máquina de lavar, ar-condicionado, ventilador, coifa, chuveiro elétrico), louças e metais (pia, vaso, torneira, box), esquadrias (porta, janela) e instalações (tomada, interruptor, luminária).',
    'Para cada objeto: category = movel | eletrodomestico | estrutura | instalacao | outro; condition = bom | regular | ruim.',
    '',
    `DEFEITOS: type deve ser um de: ${DEFECT_TYPES.join(', ')}.`,
    'Definições: risco=arranhão/linha na superfície; trinca=rachadura ou fissura; quebrado=peça partida ou lascada; descascado=tinta/verniz/revestimento soltando ou descolando; mancha=mancha de líquido/gordura/tinta; umidade=sinal de infiltração, bolhas ou manchas úmidas; mofo=bolor escuro; ferrugem=oxidação; amassado=deformação/batida; desgaste=uso natural leve; sujeira=sujidade acentuada; falta_peca=item ou peça ausente (botão, puxador, grelha, prateleira); folgado=solto/desalinhado (porta, dobradiça, rodapé); queimado=marca de calor ou lâmpada/eletrodoméstico queimado; vazamento=água vazando/pingando.',
    '',
    'Formato:',
    '{"photos":[{',
    '  "photo": 0,',
    '  "imageQuality": "boa|escura|desfocada|distante",',
    '  "objects":[{"name":"Fogão 4 bocas","category":"eletrodomestico","condition":"bom","confidence":0.9,"box_2d":[ymin,xmin,ymax,xmax]}],',
    '  "defects":[{"type":"risco","severity":"leve|moderada|grave","description":"Risco no tampo da mesa, lado esquerdo","object":"Mesa","confidence":0.75,"box_2d":[ymin,xmin,ymax,xmax]}]',
    '}]}',
    'box_2d usa coordenadas normalizadas de 0 a 1000 na ordem [ymin, xmin, ymax, xmax]. Máximo 12 objetos e 8 defeitos por foto.',
  ].join('\n');
}

export async function POST(request: NextRequest) {
  const pre = await aiPreflight(request, 'inspect', 40);
  if ('response' in pre) return pre.response;
  try {
    const b = await request.json();
    const photos = (Array.isArray(b?.photos) ? b.photos : []).filter(isSafeImageSrc).filter((p: string) => p.startsWith('data:')).slice(0, 4) as string[];
    if (photos.length === 0) return NextResponse.json({ success: false, error: 'Nenhuma foto válida' }, { status: 400 });
    const parts: GeminiPart[] = [];
    let used = 0;
    const map: number[] = []; // índice enviado → índice original
    photos.forEach((p, i) => {
      const part = dataUrlToPart(p);
      if (part) { parts.push({ text: `Foto ${used}:` }, part); map.push(i); used++; }
    });
    if (used === 0) return NextResponse.json({ success: false, error: 'Formato de imagem não suportado' }, { status: 400 });
    parts.push({ text: prompt(cleanText(b?.room, 80) || 'Cômodo', cleanText(b?.propertyType, 40), used) });
    const raw = await generateJson(InspectOut, { parts, system: SYSTEM, apiKey: pre.apiKey, temperature: 0.1, maxOutputTokens: 4096 });
    const inspected = normalizeInspection(raw, used);
    // realinha com as fotos originais (as não suportadas ficam vazias)
    const results = photos.map((_, i) => {
      const k = map.indexOf(i);
      return k >= 0 ? inspected[k] : { objects: [], defects: [], at: new Date().toISOString() };
    });
    return NextResponse.json({ success: true, results });
  } catch (err) {
    return aiErrorResponse(err, 'inspect');
  }
}
