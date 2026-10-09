import { describe, it, expect } from 'vitest';
import { parseReading, consumption, sumReparos, formatBRL } from '../meters';

describe('meters', () => {
  it('interpreta leituras em formato brasileiro', () => {
    expect(parseReading('1.234,5')).toBe(1234.5);
    expect(parseReading('1234.5')).toBe(1234.5);
    expect(parseReading('00123')).toBe(123);
    expect(parseReading('abc')).toBeNull();
    expect(parseReading('')).toBeNull();
  });
  it('calcula consumo e rejeita leitura menor', () => {
    expect(consumption('100', '112,5')).toBe(12.5);
    expect(consumption('200', '100')).toBeNull();
    expect(consumption('', '100')).toBeNull();
  });
  it('soma reparos', () => {
    const t = sumReparos([
      { id: '1', comodo: '', descricao: 'a', min: 100, max: 200, origem: 'manual' },
      { id: '2', comodo: '', descricao: 'b', min: 50, max: 80, origem: 'ia' },
    ]);
    expect(t).toEqual({ min: 150, max: 280 });
    expect(formatBRL(1500)).toContain('1.500,00');
  });
});
