import { describe, it, expect } from 'vitest';
import { validateCpfCnpj, formatCpfCnpj, formatPhone, formatCep } from '../utils';
import { compareLaudos, normalizeName, buildCompareHtml } from '../compare';
import { summarize } from '../laudo-stats';
import { formatBytes, dataUrlBytes } from '../image';
import { defaultPropertyInfo, type RoomData, type SavedLaudo } from '../types';

const room = (over: Partial<RoomData> = {}): RoomData => ({
  id: Math.random().toString(36), name: 'SALA', photos: [], items: [], furniture: [], damages: [], analyzing: false, analyzed: false, ...over,
});
const laudo = (rooms: RoomData[], over: Partial<SavedLaudo> = {}): SavedLaudo => ({
  id: 'x', name: 'Teste', condominio: 'Edifício Teste', savedAt: new Date().toISOString(),
  propertyInfo: { ...defaultPropertyInfo }, rooms, ...over,
});

describe('utils', () => {
  it('valida CPF e CNPJ', () => {
    expect(validateCpfCnpj('529.982.247-25').valid).toBe(true);
    expect(validateCpfCnpj('111.111.111-11').valid).toBe(false);
    expect(validateCpfCnpj('11.222.333/0001-81').valid).toBe(true);
    expect(validateCpfCnpj('123').type).toBe('invalid');
  });
  it('formata CPF, telefone e CEP', () => {
    expect(formatCpfCnpj('52998224725')).toBe('529.982.247-25');
    expect(formatPhone('11987654321')).toContain('98765');
    expect(formatCep('01310100')).toBe('01310-100');
  });
});

describe('compare', () => {
  it('normaliza nomes de cômodos', () => {
    expect(normalizeName('Suíte  ')).toBe('suite');
    expect(normalizeName('BANHEIRO-SOCIAL')).toBe('banheiro social');
  });
  it('detecta novas avarias, itens ausentes e piora no checklist', () => {
    const entrada = laudo([room({ furniture: ['Armário', 'Espelho'], damages: ['Risco no piso'], checklist: { Piso: 'ok', Paredes: 'regular' } })]);
    const saida = laudo([room({ furniture: ['Armário'], damages: ['Risco no piso', 'Mancha de umidade'], checklist: { Piso: 'ruim', Paredes: 'regular' } })]);
    const c = compareLaudos(entrada, saida);
    expect(c.rooms).toHaveLength(1);
    expect(c.rooms[0].newDamages).toEqual(['Mancha de umidade']);
    expect(c.rooms[0].missingFurniture).toEqual(['Espelho']);
    expect(c.rooms[0].worsened).toBe(1);
    expect(c.rooms[0].status).toBe('piorou');
    expect(c.totals).toMatchObject({ newDamages: 1, worsened: 1, missingFurniture: 1, roomsWithIssues: 1 });
  });
  it('marca cômodos sem registro de saída e cômodos novos', () => {
    const c = compareLaudos(laudo([room({ name: 'COZINHA' })]), laudo([room({ name: 'VARANDA' })]));
    expect(c.rooms.find((r) => r.name === 'COZINHA')?.status).toBe('sem-saida');
    expect(c.rooms.find((r) => r.name === 'VARANDA')?.status).toBe('novo');
    expect(c.totals.roomsMissingExit).toBe(1);
  });
  it('relatório HTML escapa texto do usuário', () => {
    const e = laudo([room({ damages: [] })], { name: '<script>alert(1)</script>' });
    const s = laudo([room({ damages: ['<img src=x onerror=alert(1)>'] })]);
    const html = buildCompareHtml(e, s, compareLaudos(e, s));
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).not.toContain('<img src=x onerror');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });
});

describe('laudo-stats', () => {
  it('resume e calcula completude', () => {
    const l = laudo([room({ photos: [{ dataUrl: 'data:image/jpeg;base64,AAAA', name: 'a', annotations: [{ x: 1, y: 1, label: 'x' }] }], analyzed: true })]);
    const s = summarize(l);
    expect(s).toMatchObject({ rooms: 1, photos: 1, annotations: 1, analyzed: 1 });
    expect(s.completeness).toBeGreaterThan(0);
    expect(s.completeness).toBeLessThanOrEqual(100);
  });
  it('prefere a miniatura salva', () => {
    expect(summarize(laudo([room()], { thumb: 'data:image/jpeg;base64,T' })).thumb).toBe('data:image/jpeg;base64,T');
  });
});

describe('image helpers', () => {
  it('formata bytes', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
  });
  it('estima bytes de um dataURL', () => {
    expect(dataUrlBytes('data:image/png;base64,AAAA')).toBe(3);
    expect(dataUrlBytes('sem-virgula')).toBe(0);
  });
});
