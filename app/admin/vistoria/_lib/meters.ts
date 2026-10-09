import type { ChaveItem, Medidores, MedidorKey, Reparo } from './types';

export const MEDIDORES: { key: MedidorKey; label: string; unit: string }[] = [
  { key: 'agua', label: 'Água', unit: 'm³' },
  { key: 'luz', label: 'Energia', unit: 'kWh' },
  { key: 'gas', label: 'Gás', unit: 'm³' },
];

export const emptyMedidores = (): Medidores => ({
  agua: { numero: '', leitura: '' }, luz: { numero: '', leitura: '' }, gas: { numero: '', leitura: '' },
});

export const CHAVE_PRESETS = [
  'Chave da porta principal', 'Chave de serviço', 'Controle do portão', 'Tag / cartão de acesso',
  'Chave da caixa de correio', 'Controle do ar-condicionado', 'Chave do portão da garagem',
];

/** "1.234,5" ou "1234.5" → número; vazio/ inválido → null */
export function parseReading(v?: string): number | null {
  if (!v) return null;
  const t = v.trim().replace(/\s/g, '');
  if (!/^\d{1,3}(\.\d{3})*(,\d+)?$|^\d+([.,]\d+)?$/.test(t)) return null;
  const n = /,/.test(t) ? Number(t.replace(/\./g, '').replace(',', '.')) : Number(t);
  return Number.isFinite(n) ? n : null;
}

/** consumo = saída − entrada (null se faltar leitura ou se a saída for menor) */
export function consumption(entrada?: string, saida?: string): number | null {
  const a = parseReading(entrada); const b = parseReading(saida);
  if (a == null || b == null || b < a) return null;
  return Math.round((b - a) * 1000) / 1000;
}

export const hasAnyReading = (m?: Medidores) => !!m && (Object.values(m) as { leitura: string }[]).some((x) => x.leitura.trim());
export const totalChaves = (c?: ChaveItem[]) => (c || []).reduce((s, x) => s + (x.quantidade || 0), 0);

export const formatBRL = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export function sumReparos(list?: Reparo[]) {
  return (list || []).reduce((a, r) => ({ min: a.min + (r.min || 0), max: a.max + (r.max || 0) }), { min: 0, max: 0 });
}
