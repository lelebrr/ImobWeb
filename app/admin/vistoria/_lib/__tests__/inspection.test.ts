import { describe, it, expect } from 'vitest';
import { proposalsFromInspection, proposalsFromAnalysis, acceptProposals, defectText, isPreselected } from '../inspection';
import { normalizeInspection, InspectOut, toBox } from '@/lib/vistoria/inspection-schema';
import { auditLaudo } from '../audit';
import { defaultPropertyInfo, type RoomData } from '../types';
import type { PhotoInspection } from '@/lib/vistoria/shared';

const room = (over: Partial<RoomData> = {}): RoomData => ({
  id: 'r1', name: 'COZINHA', photos: [{ id: 'p1', dataUrl: 'data:image/jpeg;base64,AAA', name: 'a', annotations: [] }],
  items: [], furniture: [], damages: [], analyzing: false, analyzed: false, ...over,
});
const insp: PhotoInspection = {
  at: '', objects: [
    { name: 'Fogão 4 bocas', category: 'eletrodomestico', condition: 'bom', confidence: 0.92, box: { x: 10, y: 20, w: 30, h: 40 } },
    { name: 'Parede', category: 'estrutura', condition: 'bom', confidence: 0.9 },
    { name: 'Micro-ondas', category: 'eletrodomestico', condition: 'bom', confidence: 0.3 },
  ],
  defects: [
    { type: 'risco', severity: 'moderada', description: 'Risco no tampo da mesa', confidence: 0.85, box: { x: 40, y: 40, w: 10, h: 10 } },
    { type: 'trinca', severity: 'leve', description: 'Trinca no azulejo', confidence: 0.6 },
    { type: 'mofo', severity: 'leve', description: 'Mofo no teto', confidence: 0.4 },
  ],
};

describe('sugestões da inspeção', () => {
  it('só sugere o que é confiável e nada é gravado sozinho', () => {
    const r = room();
    const ps = proposalsFromInspection(r, 'p1', insp);
    expect(ps.map((p) => p.text)).toContain('Fogão 4 bocas');
    expect(ps.some((p) => /micro/i.test(p.text))).toBe(false); // confiança baixa
    expect(ps.some((p) => /parede/i.test(p.text))).toBe(false); // estrutura
    expect(ps.some((p) => /mofo/i.test(p.text))).toBe(false); // <0,55
    expect(r.damages).toHaveLength(0);
    expect(r.furniture).toHaveLength(0);
  });
  it('confiança média vira “Possível …” e vem desmarcada', () => {
    const ps = proposalsFromInspection(room(), 'p1', insp);
    const trinca = ps.find((p) => /trinca/i.test(p.text))!;
    expect(trinca.text.startsWith('Possível ')).toBe(true);
    expect(isPreselected(trinca)).toBe(false);
    const risco = ps.find((p) => /risco/i.test(p.text))!;
    expect(risco.text).toContain('(moderada)');
    expect(isPreselected(risco)).toBe(true);
    expect(risco.mark).toEqual({ x: 45, y: 45, label: 'Risco' });
  });
  it('não repete o que já está no cômodo', () => {
    const r = room({ furniture: ['Fogão 4 bocas'] });
    expect(proposalsFromInspection(r, 'p1', insp).some((p) => p.text === 'Fogão 4 bocas')).toBe(false);
  });
  it('aceitar grava o texto EDITADO, marca a foto e limpa a fila', () => {
    const r = room();
    const ps = proposalsFromInspection(r, 'p1', insp);
    const withQueue = { ...r, proposals: ps };
    const risco = { ...ps.find((p) => /risco/i.test(p.text))!, text: 'Risco profundo no tampo da mesa de jantar' };
    const patch = acceptProposals(withQueue, [risco], ps.map((p) => p.id));
    expect(patch.damages).toContain('Risco profundo no tampo da mesa de jantar');
    expect(patch.furniture).toHaveLength(0);
    expect(patch.photos![0].annotations).toHaveLength(1);
    expect(patch.proposals).toHaveLength(0);
  });
  it('respeita “marcar na foto” desligado', () => {
    const r = room();
    const ps = proposalsFromInspection(r, 'p1', insp);
    const risco = { ...ps.find((p) => /risco/i.test(p.text))!, applyMark: false };
    const patch = acceptProposals({ ...r, proposals: ps }, [risco], [risco.id]);
    expect(patch.photos![0].annotations).toHaveLength(0);
    expect(patch.proposals).toHaveLength(ps.length - 1);
  });
  it('a análise geral também vira sugestão', () => {
    const ps = proposalsFromAnalysis(room(), { suggestedFurniture: ['Geladeira'], suggestedDamages: ['Mancha de umidade no teto'], annotations: [{ photo: 0, x: 30, y: 10, label: 'Mancha de umidade' }] }, ['p1'], true);
    expect(ps).toHaveLength(2);
    expect(ps.find((p) => p.kind === 'damage')!.mark).toEqual({ x: 30, y: 10, label: 'Mancha de umidade' });
    expect(ps.find((p) => p.kind === 'damage')!.photoId).toBe('p1');
  });
  it('defectText', () => {
    expect(defectText({ type: 'quebrado', severity: 'grave', description: 'Porta do armário partida', confidence: 0.9 })).toBe('Quebrado: Porta do armário partida (grave)');
  });
  it('auditoria avisa de sugestões pendentes', () => {
    const r = room({ proposals: proposalsFromInspection(room(), 'p1', insp) });
    expect(auditLaudo({ ...defaultPropertyInfo }, [r]).issues.some((i) => i.id.startsWith('sugestoes-'))).toBe(true);
  });
});

describe('normalização da resposta da IA', () => {
  it('converte caixas 0–1000 em %, valida enums e descarta o fraco', () => {
    expect(toBox([100, 200, 300, 600])).toEqual({ x: 20, y: 10, w: 40, h: 20 });
    expect(toBox([0, 0, 0, 0])).toBeUndefined();
    const raw = InspectOut.parse({ photos: [{ photo: 0, objects: [{ name: 'Mesa', category: 'MÓVEL', condition: 'bom', confidence: 1.4 }, { name: 'mesa', category: 'movel' }],
      defects: [{ type: 'Descascado', severity: 'GRAVE', description: 'Tinta soltando', confidence: 0.8, box_2d: [10, 10, 200, 300] }, { type: 'xyz', description: 'fraco', confidence: 0.2 }, { type: 'risco', description: 'x', confidence: 0.9 }, { photo: 9 }] }, { photo: 7, objects: [] }] });
    const out = normalizeInspection(raw, 1);
    expect(out).toHaveLength(1);
    expect(out[0].objects).toHaveLength(1);
    expect(out[0].objects[0].confidence).toBe(1);
    expect(out[0].defects.map((d) => d.type)).toEqual(['descascado', 'risco']);
    expect(out[0].defects[0].severity).toBe('grave');
    expect(out[0].defects[0].box).toBeTruthy();
  });
});
