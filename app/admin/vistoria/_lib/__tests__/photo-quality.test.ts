import { describe, it, expect } from 'vitest';
import { analyzeLuma, frameDiff, tiltHint, relaxBlur } from '../photo-quality';

const W = 64, H = 48;
const flat = (v: number) => new Uint8Array(W * H).fill(v);
const noisy = (base: number) => { const a = new Uint8Array(W * H); for (let i = 0; i < a.length; i++) a[i] = base + (((i * 7919) % 41) - 20); return a; };

describe('photo-quality', () => {
  it('detecta foto escura', () => {
    expect(analyzeLuma(noisy(25), W, H).issues.map((i) => i.id)).toContain('dark');
  });
  it('detecta luz estourada', () => {
    expect(analyzeLuma(noisy(240), W, H).issues.map((i) => i.id)).toContain('bright');
  });
  it('detecta imagem sem nitidez e aceita imagem detalhada e bem exposta', () => {
    expect(analyzeLuma(flat(128), W, H).issues.map((i) => i.id)).toContain('blurry');
    const good = analyzeLuma(noisy(128), W, H);
    expect(good.ok).toBe(true);
    expect(good.score).toBe(100);
  });
  it('mede movimento entre quadros', () => {
    expect(frameDiff(flat(100), flat(100))).toBe(0);
    expect(frameDiff(flat(100), flat(140))).toBeGreaterThan(30);
  });
  it('orienta a inclinação', () => {
    expect(tiltHint(90, 0)?.level).toBe(true);
    expect(tiltHint(90, 20)?.level).toBe(false);
    expect(tiltHint(40, 0)?.message).toMatch(/baixo/);
    expect(tiltHint(null, null)).toBeNull();
  });
  it('detecta contraluz (janela forte em ambiente escuro)', () => {
    const a = new Uint8Array(W * H);
    for (let i = 0; i < a.length; i++) a[i] = i % 5 === 0 ? 255 : i % 3 === 0 ? 5 : 90 + ((i * 31) % 40);
    expect(analyzeLuma(a, W, H).issues.map((x) => x.id)).toContain('backlit');
  });
  it('não chama de tremida uma parede lisa fotografada com o aparelho firme', () => {
    const r = analyzeLuma(flat(128), W, H);
    expect(r.issues.map((x) => x.id)).toContain('blurry');
    expect(relaxBlur(r, 200).ok).toBe(false);
    const relaxed = relaxBlur(r, 2000);
    expect(relaxed.ok).toBe(true);
    expect(relaxed.note).toMatch(/parede lisa/);
  });
});
