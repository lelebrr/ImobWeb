import { z } from 'zod';
import { cleanText } from './gemini';
import { DEFECT_TYPES, OBJECT_CATEGORIES, type DefectType, type DetectedBox, type ObjectCategory, type PhotoInspection } from './shared';

const box = z.array(z.coerce.number()).length(4).optional().catch(undefined);

const ObjectItem = z.object({
  name: z.string(), category: z.string().catch('outro'), condition: z.string().catch('bom'),
  confidence: z.coerce.number().catch(0.5), box_2d: box,
});
const DefectItem = z.object({
  type: z.string().catch('outro'), severity: z.string().catch('leve'), description: z.string(),
  object: z.string().optional().catch(undefined), confidence: z.coerce.number().catch(0.5), box_2d: box,
});

/** lista tolerante: um item malformado é descartado sem derrubar os demais */
const tolerant = <T extends z.ZodTypeAny>(item: T) =>
  z.array(z.unknown()).catch([]).transform((arr) => arr.flatMap((x) => { const r = item.safeParse(x); return r.success ? [r.data as z.infer<T>] : []; }));

export const InspectOut = z.object({
  photos: z.array(z.object({
    photo: z.coerce.number(),
    imageQuality: z.string().catch(''),
    objects: tolerant(ObjectItem),
    defects: tolerant(DefectItem),
  })).catch([]),
});

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/\s+/g, '_');
const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));

/** [ymin, xmin, ymax, xmax] em 0–1000 → caixa em % (null se inválida/minúscula) */
export function toBox(b?: number[]): DetectedBox | undefined {
  if (!b || b.length !== 4 || b.some((v) => !Number.isFinite(v))) return undefined;
  const [y0, x0, y1, x1] = b.map((v) => clamp(v, 0, 1000));
  const x = Math.min(x0, x1) / 10; const y = Math.min(y0, y1) / 10;
  const w = Math.abs(x1 - x0) / 10; const h = Math.abs(y1 - y0) / 10;
  if (w < 1 || h < 1) return undefined;
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, w: Math.round(w * 10) / 10, h: Math.round(h * 10) / 10 };
}

/** Normaliza a resposta da IA: enums válidos, confiança 0–1, caixas em %, sem duplicatas. Devolve um item por foto. */
export function normalizeInspection(raw: z.infer<typeof InspectOut>, nPhotos: number): PhotoInspection[] {
  const at = new Date().toISOString();
  const out: PhotoInspection[] = Array.from({ length: nPhotos }, () => ({ objects: [], defects: [], at }));
  for (const p of raw.photos) {
    if (!Number.isInteger(p.photo) || p.photo < 0 || p.photo >= nPhotos) continue;
    const target = out[p.photo];
    target.quality = cleanText(p.imageQuality, 30) || undefined;
    const seenO = new Set<string>();
    for (const o of p.objects) {
      const name = cleanText(o.name, 60);
      if (!name || seenO.has(norm(name))) continue;
      seenO.add(norm(name));
      const cat = norm(o.category) as ObjectCategory;
      const cond = norm(o.condition);
      target.objects.push({
        name, category: (OBJECT_CATEGORIES as readonly string[]).includes(cat) ? cat : 'outro',
        condition: cond === 'ruim' || cond === 'regular' ? cond : 'bom',
        confidence: clamp(o.confidence, 0, 1), box: toBox(o.box_2d),
      });
    }
    const seenD = new Set<string>();
    for (const d of p.defects) {
      const description = cleanText(d.description, 120);
      const t = norm(d.type) as DefectType;
      const type: DefectType = (DEFECT_TYPES as readonly string[]).includes(t) ? t : 'outro';
      const key = `${type}|${norm(description)}`;
      const conf = clamp(d.confidence, 0, 1);
      if (!description || conf < 0.4 || seenD.has(key)) continue;
      seenD.add(key);
      const sev = norm(d.severity);
      target.defects.push({
        type, description, severity: sev === 'grave' || sev === 'moderada' ? sev : 'leve',
        object: d.object ? cleanText(d.object, 60) || undefined : undefined, confidence: conf, box: toBox(d.box_2d),
      });
    }
    target.objects = target.objects.slice(0, 14);
    target.defects = target.defects.slice(0, 10);
  }
  return out;
}
