import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isNativeApp, openedHint, saveFile, openHtmlDocument } from '../native';

type W = { Capacitor?: unknown };
const w: W = {};

// Ambiente node: simula window e FileReader (readAsDataURL)
class FakeReader {
  result: string | null = null;
  error: Error | null = null;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  readAsDataURL(blob: Blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = `data:;base64,${Buffer.from(buf).toString('base64')}`;
      this.onload?.();
    });
  }
}

beforeEach(() => {
  vi.stubGlobal('window', w);
  vi.stubGlobal('FileReader', FakeReader);
});
afterEach(() => { delete w.Capacitor; vi.unstubAllGlobals(); });

describe('native bridge', () => {
  it('não é app no navegador comum', () => {
    expect(isNativeApp()).toBe(false);
  });

  it('detecta o app quando o Capacitor está presente', () => {
    w.Capacitor = { isNativePlatform: () => true, nativePromise: vi.fn() };
    expect(isNativeApp()).toBe(true);
  });

  it('saveFile no app grava em pedaços e abre o compartilhamento', async () => {
    const calls: Array<[string, string, Record<string, unknown>]> = [];
    w.Capacitor = {
      isNativePlatform: () => true,
      nativePromise: async (p: string, m: string, o: Record<string, unknown>) => { calls.push([p, m, o]); return { uri: 'file:///cache/vistoria/a.json' }; },
    };
    const big = new Blob([new Uint8Array(3 * 256 * 1024 + 10)]);
    expect(await saveFile(big, 'a.json')).toBe('shared');
    expect(calls.map((c) => `${c[0]}.${c[1]}`)).toEqual(['Filesystem.writeFile', 'Filesystem.appendFile', 'Share.share']);
    expect(calls[2][2].url).toBe('file:///cache/vistoria/a.json');
  });

  it('openHtmlDocument no app chama a impressão nativa com o caminho do arquivo', async () => {
    const calls: Array<[string, string, Record<string, unknown>]> = [];
    w.Capacitor = {
      isNativePlatform: () => true,
      nativePromise: async (p: string, m: string, o: Record<string, unknown>) => { calls.push([p, m, o]); return { uri: 'file:///cache/vistoria/l.html' }; },
    };
    expect(await openHtmlDocument('<p>oi</p>', 'laudo')).toBe('print');
    expect(calls.at(-1)).toEqual(['HtmlPrint', 'print', { path: 'file:///cache/vistoria/l.html', name: 'laudo' }]);
  });

  it('dicas por modo', () => {
    expect(openedHint('print')).toMatch(/Salvar como PDF/);
    expect(openedHint('tab')).toMatch(/Ctrl\+P/);
  });
});
