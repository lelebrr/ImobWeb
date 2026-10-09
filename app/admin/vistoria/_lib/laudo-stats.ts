import type { SavedLaudo } from './types';

export interface LaudoSummary {
  rooms: number;
  photos: number;
  annotations: number;
  analyzed: number;
  thumb: string;
  /** 0-100: quão completo está o laudo (dados, partes, cômodos, fotos, análise, checklist, assinaturas) */
  completeness: number;
}

export function summarize(l: SavedLaudo): LaudoSummary {
  const rooms = l.rooms || [];
  const photos = rooms.reduce((s, r) => s + (r.photos?.length || 0), 0);
  const annotations = rooms.reduce((s, r) => s + (r.photos || []).reduce((s2, p) => s2 + (p.annotations?.length || 0), 0), 0);
  const analyzed = rooms.filter((r) => r.analyzed).length;
  const thumb = l.thumb || rooms.flatMap((r) => r.photos || []).find((p) => p.dataUrl)?.dataUrl || '';
  const i = l.propertyInfo || ({} as SavedLaudo['propertyInfo']);
  const checks = [
    !!(i.endereco && i.cidade), !!i.tipoImovel, !!i.metragem,
    !!(i.locadora && i.locatario), !!i.vistoriadora, rooms.length > 0,
    photos > 0, rooms.length > 0 && rooms.every((r) => (r.photos?.length || 0) > 0),
    rooms.length > 0 && analyzed === rooms.length,
    rooms.some((r) => Object.keys(r.checklist || {}).length > 0),
    !!(l.signatures && (l.signatures.locadora || l.signatures.locatario || l.signatures.vistoriadora)),
  ];
  const completeness = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  return { rooms: rooms.length, photos, annotations, analyzed, thumb, completeness };
}

export function formatSaved(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const today = d.toDateString() === new Date().toDateString();
  return today
    ? `Hoje às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    : d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}
