import { DEFECT_LABEL, type DetectedDefect, type PhotoInspection } from '@/lib/vistoria/shared';
import type { PhotoAnnotation, Proposal, RoomData } from './types';

export const MIN_CONFIDENCE = 0.55; // abaixo disso, nem é sugerido
export const SURE_CONFIDENCE = 0.75; // abaixo disso, vira “Possível …” e vem desmarcado

const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const pid = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);

export function defectText(d: DetectedDefect): string {
  const possible = d.confidence < SURE_CONFIDENCE;
  const label = DEFECT_LABEL[d.type];
  const body = `${possible ? label.charAt(0).toLowerCase() + label.slice(1) : label}: ${d.description}`;
  return `${possible ? 'Possível ' : ''}${body}${d.severity === 'leve' ? '' : ` (${d.severity})`}`;
}

export function defectShort(d: DetectedDefect): string {
  const t = `${DEFECT_LABEL[d.type]}${d.object ? ` - ${d.object}` : ''}`;
  return t.length > 30 ? t.slice(0, 29) + '…' : t;
}

/** o item já está na lista (igual ou contido num texto existente)? */
export const hasSimilar = (list: string[], text: string) => {
  const n = norm(text);
  if (!n) return true;
  return list.some((x) => { const m = norm(x); return m === n || m.includes(n) || n.includes(m); });
};

/** Pré-seleção: só o que a IA tem alta confiança vem marcado; o resto o usuário decide. */
export const isPreselected = (p: Proposal) => p.confidence >= SURE_CONFIDENCE;

/** Converte a inspeção de uma foto em sugestões (sem repetir o que já está no cômodo ou na fila). */
export function proposalsFromInspection(room: RoomData, photoId: string, insp: PhotoInspection, withMarks = true): Proposal[] {
  const known = [...(room.furniture || []), ...(room.damages || []), ...(room.proposals || []).map((p) => p.text)];
  const out: Proposal[] = [];
  for (const o of insp.objects) {
    if (o.confidence < MIN_CONFIDENCE || o.category === 'estrutura') continue;
    if (hasSimilar([...known, ...out.map((x) => x.text)], o.name)) continue;
    out.push({ id: pid(), kind: 'furniture', text: o.name, confidence: o.confidence, source: 'inspecao', photoId });
  }
  for (const d of insp.defects) {
    if (d.confidence < MIN_CONFIDENCE) continue;
    const text = defectText(d);
    if (hasSimilar([...known, ...out.map((x) => x.text)], text)) continue;
    out.push({
      id: pid(), kind: 'damage', text, confidence: d.confidence, source: 'inspecao', photoId,
      mark: withMarks && d.box ? { x: Math.round(d.box.x + d.box.w / 2), y: Math.round(d.box.y + d.box.h / 2), label: defectShort(d) } : undefined,
    });
  }
  return out;
}

/** Sugestões vindas da análise geral do cômodo (itens, avarias e marcações). */
export function proposalsFromAnalysis(
  room: RoomData,
  r: { suggestedFurniture?: string[]; suggestedDamages?: string[]; annotations?: { photo: number; x: number; y: number; label: string }[] },
  photoIds: string[], withMarks: boolean,
): Proposal[] {
  const known = [...(room.furniture || []), ...(room.damages || []), ...(room.proposals || []).map((p) => p.text)];
  const out: Proposal[] = [];
  for (const f of r.suggestedFurniture || []) {
    if (!f || hasSimilar([...known, ...out.map((x) => x.text)], f)) continue;
    out.push({ id: pid(), kind: 'furniture', text: f, confidence: 0.8, source: 'analise' });
  }
  const marks = withMarks ? (r.annotations || []) : [];
  for (const d of r.suggestedDamages || []) {
    if (!d || hasSimilar([...known, ...out.map((x) => x.text)], d)) continue;
    // liga a avaria à marcação cujo rótulo aparece no texto, quando houver
    const m = marks.find((a) => norm(d).includes(norm(a.label)) || norm(a.label).includes(norm(d)));
    out.push({
      id: pid(), kind: 'damage', text: d, confidence: 0.8, source: 'analise',
      photoId: m ? photoIds[m.photo] : undefined, mark: m ? { x: m.x, y: m.y, label: m.label } : undefined,
    });
  }
  return out;
}

/**
 * Aplica as sugestões ACEITAS (com o texto já editado) ao cômodo e limpa as pendentes decididas.
 * `decidedIds`: todas as sugestões que saem da fila (aceitas + descartadas).
 */
export function acceptProposals(room: RoomData, accepted: (Proposal & { applyMark?: boolean })[], decidedIds: string[]): Partial<RoomData> {
  const furniture = [...(room.furniture || [])];
  const damages = [...(room.damages || [])];
  const photos = room.photos.map((p) => ({ ...p, annotations: [...p.annotations] }));
  for (const a of accepted) {
    const text = a.text.trim();
    if (!text) continue;
    if (a.kind === 'furniture') { if (!hasSimilar(furniture, text)) furniture.push(text); continue; }
    if (!damages.some((x) => norm(x) === norm(text))) damages.push(text);
    if (a.mark && a.applyMark !== false && a.photoId) {
      const ph = photos.find((p) => p.id === a.photoId);
      if (ph && !ph.annotations.some((n: PhotoAnnotation) => Math.hypot(n.x - a.mark!.x, n.y - a.mark!.y) < 8)) {
        ph.annotations.push({ x: a.mark.x, y: a.mark.y, label: a.mark.label });
      }
    }
  }
  const gone = new Set(decidedIds);
  return { furniture, damages, photos, proposals: (room.proposals || []).filter((p) => !gone.has(p.id)) };
}

export function inspectionSummary(i?: PhotoInspection | null): { objects: number; defects: number; serious: number } {
  if (!i) return { objects: 0, defects: 0, serious: 0 };
  const defects = i.defects.filter((d) => d.confidence >= MIN_CONFIDENCE);
  return { objects: i.objects.filter((o) => o.confidence >= MIN_CONFIDENCE).length, defects: defects.length, serious: defects.filter((d) => d.severity !== 'leve').length };
}
