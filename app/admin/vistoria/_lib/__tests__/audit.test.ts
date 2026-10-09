import { describe, it, expect } from 'vitest';
import { auditLaudo } from '../audit';
import { compareLaudos, buildCompareHtml } from '../compare';
import { defaultPropertyInfo, type RoomData, type SavedLaudo } from '../types';

const room = (over: Partial<RoomData> = {}): RoomData => ({
  id: Math.random().toString(36), name: 'SALA', photos: [], items: [], furniture: [], damages: [], analyzing: false, analyzed: false, ...over,
});
const full = {
  ...defaultPropertyInfo, endereco: 'Rua A', cidade: 'Curitiba', tipoImovel: 'Apartamento', metragem: '60',
  locadora: 'Ana', locatario: 'Bruno', vistoriadora: 'Carla', consideracoes: 'ok',
};

describe('auditLaudo', () => {
  it('reprova laudo vazio com erros', () => {
    const r = auditLaudo({ ...defaultPropertyInfo }, []);
    expect(r.errors).toBeGreaterThan(0);
    expect(r.score).toBeLessThan(100);
    expect(r.issues.some((i) => i.id === 'sem-comodos')).toBe(true);
  });
  it('aponta cômodos duplicados e avaria sem foto', () => {
    const r = auditLaudo(full, [room({ damages: ['Mancha'] }), room()]);
    expect(r.issues.some((i) => i.id.startsWith('dup-'))).toBe(true);
    expect(r.issues.some((i) => i.id.startsWith('avaria-sem-foto'))).toBe(true);
  });
  it('não tem erros quando o essencial está preenchido', () => {
    const r = auditLaudo(full, [room({ items: ['Piso'] })], { locadora: 'data:image/png;base64,AAA' });
    expect(r.errors).toBe(0);
  });
});

describe('buildCompareHtml com IA', () => {
  const l = (rooms: RoomData[]): SavedLaudo => ({ id: 'a', name: 'L', condominio: '', savedAt: '', propertyInfo: { ...defaultPropertyInfo }, rooms });
  it('inclui análise da IA escapando HTML', () => {
    const e = l([room()]); const s = l([room()]);
    const html = buildCompareHtml(e, s, compareLaudos(e, s), {
      rooms: { SALA: { summary: '<script>x</script>', differences: [{ type: 'dano_novo', description: '<img onerror=1>', severity: 'grave', confidence: 0.9 }] } },
      summary: 'resumo <b>',
    });
    expect(html).toContain('Análise por IA');
    expect(html).not.toContain('<script>x');
    expect(html).not.toContain('<img onerror');
    expect(html).toContain('90%');
  });
});
