import { describe, it, expect, vi, beforeEach } from 'vitest';
import { defaultPropertyInfo, type SavedLaudo } from '../types';

// IndexedDB em memória (só o necessário para a sincronização)
const mem = vi.hoisted(() => ({ laudos: new Map<string, SavedLaudo>(), kv: new Map<string, unknown>() }));
vi.mock('../storage', () => ({
  listLaudos: async () => [...mem.laudos.values()],
  hydrate: async (l: SavedLaudo) => l,
  putLaudo: async (l: SavedLaudo) => { mem.laudos.set(l.id, l); return l; },
  getKv: async (k: string) => mem.kv.get(k),
  setKv: async (k: string, v: unknown) => { mem.kv.set(k, v); },
  deleteLaudoById: async (id: string) => { mem.laudos.delete(id); },
}));
vi.mock('../image', () => ({ downscaleDataUrl: async (d: string) => d }));

import { toCloudPayload, fromCloud, syncWithCloud, deleteRemote, keepLocalVersion, useServerVersion, CloudAuthError } from '../cloud';

const PIXEL = 'data:image/png;base64,iVBORw0KGgo=';

const laudo = (over: Partial<SavedLaudo> = {}): SavedLaudo => ({
  id: 'L1', name: 'Ed. Sol', condominio: 'Ed. Sol', savedAt: '2026-01-01T00:00:00.000Z',
  propertyInfo: {
    ...defaultPropertyInfo, condominio: 'Ed. Sol', endereco: 'Rua A', apto: '12', locadoraTelefone: '1199',
    tipoVistoria: 'ENTRADA', medidores: { agua: { numero: 'A1', leitura: '10' }, luz: { numero: '', leitura: '' }, gas: { numero: '', leitura: '' } },
    chaves: [{ id: 'k', descricao: 'Chave', quantidade: 2 }],
  },
  signatures: { locadora: PIXEL },
  rooms: [{ id: 'r', name: 'SALA', items: ['✓ ok'], furniture: ['Sofá'], damages: ['Risco'], analyzing: true, analyzed: true,
    checklist: { Piso: 'ruim' }, observations: 'obs', photoProblems: ['x'],
    photos: [{ id: 'p', dataUrl: PIXEL, name: 'f', annotations: [{ x: 1, y: 2, label: 'a' }] }, { id: 'q', dataUrl: '/vistoria-exemplos/x.jpg', name: '', annotations: [] }] }],
  ...over,
});

type Route = (url: string, init?: RequestInit) => { status?: number; body: unknown };
function mockFetch(route: Route) {
  const calls: { url: string; method: string; body?: unknown }[] = [];
  vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
    const raw = init?.body;
    calls.push({ url, method: init?.method || 'GET', body: typeof raw === 'string' ? JSON.parse(raw) : raw });
    const r = route(url, init);
    if (r.body instanceof Blob) return new Response(r.body, { status: r.status ?? 200 });
    return new Response(JSON.stringify(r.body), { status: r.status ?? 200 });
  });
  return calls;
}

beforeEach(() => { mem.laudos.clear(); mem.kv.clear(); vi.unstubAllGlobals(); });

describe('formato compartilhado com o app', () => {
  it('converte o laudo do navegador para o formato do app', () => {
    const p = toCloudPayload(laudo(), 'R-ENTRADA').vistoria;
    expect(p.condominio).toBe('Ed. Sol');
    expect(p.tipoVistoria).toBe('ENTRADA');
    expect(p.linkedRemoteId).toBe('R-ENTRADA');
    expect(p.chaves).toHaveLength(1);
    expect(p.signatures.locadora).toBe(PIXEL);
    expect(p.rooms[0].analyzing).toBe(false);
    expect(p.rooms[0].problems).toEqual([]);
    expect(p.rooms[0].photos).toHaveLength(1); // URL pública (exemplo) não vai
    expect(p.rooms[0].photoProblems).toEqual(['x']); // campo só do web vai junto
  });

  it('converte a vistoria do app e preserva dados que só existem no navegador', () => {
    const existing = laudo({ favorite: true });
    const l = fromCloud({
      remoteId: 'R1', condominio: 'Novo nome', endereco: 'Rua B', updatedAt: 99, tipoVistoria: 'SAIDA',
      rooms: [{ id: 'r', name: 'SALA', damages: ['Risco'], problems: ['Tomada'], items: [], furniture: [],
        photos: [{ dataUrl: PIXEL, name: 'f', annotations: [] }, { dataUrl: '', name: 'sem arquivo' }] }],
      chaves: [], signatures: null, medidores: null,
    }, existing);
    expect(l.id).toBe('L1');
    expect(l.favorite).toBe(true);
    expect(l.remoteId).toBe('R1');
    expect(l.cloudUpdatedAt).toBe(99);
    expect(l.savedAt).toBe(l.cloudSavedAt);
    expect(l.propertyInfo.condominio).toBe('Novo nome');
    expect(l.propertyInfo.apto).toBe('12'); // campo do web mantido
    expect(l.propertyInfo.tipoVistoria).toBe('SAIDA');
    expect(l.rooms[0].damages).toEqual(['Risco', 'Tomada']);
    expect(l.rooms[0].photos).toHaveLength(1);
    expect(l.rooms[0].photos[0].id).toBeTruthy();
  });
});

describe('syncWithCloud', () => {
  it('envia laudos novos/alterados e baixa os do app', async () => {
    mem.laudos.set('L1', laudo());
    mem.laudos.set('EX', laudo({ id: 'EX', isExample: true }));
    mem.laudos.set('L2', laudo({ id: 'L2', linkedId: 'L1', name: 'Saída' }));
    const calls = mockFetch((url, init) => {
      if (url.endsWith('/list')) return { body: { success: true, vistorias: [{ remoteId: 'APP1', condominio: 'Do app', updatedAt: 10 }] } };
      if (url.includes('/list?id=APP1')) return { body: { success: true, vistorias: [{ remoteId: 'APP1', condominio: 'Do app', updatedAt: 10, rooms: [] }] } };
      if (url.endsWith('/sync') && init?.method === 'POST') {
        const b = JSON.parse(String(init.body));
        return { body: { success: true, remoteId: b.vistoria.condominio === 'Ed. Sol' && !b.vistoria.linkedRemoteId ? 'R1' : 'R2', updatedAt: 5 } };
      }
      return { status: 404, body: {} };
    });

    const r = await syncWithCloud(null);
    expect(r).toMatchObject({ pushed: 2, pulled: 1, errors: [] });
    const posts = calls.filter((c) => c.method === 'POST');
    expect(posts[0].body).toMatchObject({ vistoria: { linkedRemoteId: null } }); // entrada antes da saída
    expect(posts[1].body).toMatchObject({ vistoria: { linkedRemoteId: 'R1' } });
    expect(mem.laudos.get('L1')!.remoteId).toBe('R1');
    expect(mem.laudos.get('L1')!.cloudSavedAt).toBe(mem.laudos.get('L1')!.savedAt);
    expect(mem.laudos.get('EX')!.remoteId).toBeUndefined();
    expect([...mem.laudos.values()].some((l) => l.remoteId === 'APP1')).toBe(true);

    // segunda rodada: nada mudou → nada enviado nem baixado
    const before = calls.length;
    const r2 = await syncWithCloud(null);
    expect(r2).toMatchObject({ pushed: 0, pulled: 0 });
    expect(calls.slice(before).filter((c) => c.method === 'POST')).toHaveLength(0);
  });

  it('não sobrescreve laudo com alteração local nem o que está aberto no editor', async () => {
    mem.laudos.set('L1', laudo({ remoteId: 'R1', cloudUpdatedAt: 1, cloudSavedAt: 'antigo' })); // alterado localmente
    mem.laudos.set('L3', laudo({ id: 'L3', remoteId: 'R3', cloudUpdatedAt: 1, cloudSavedAt: '2026-01-01T00:00:00.000Z' })); // aberto no editor
    const calls = mockFetch((url, init) => {
      if (url.endsWith('/list')) return { body: { success: true, vistorias: [{ remoteId: 'R1', updatedAt: 50 }, { remoteId: 'R3', updatedAt: 50 }] } };
      if (url.endsWith('/sync') && init?.method === 'POST') return { body: { success: true, remoteId: 'R1', updatedAt: 60 } };
      return { body: { success: true, vistorias: [{ remoteId: 'R?', condominio: 'NÃO DEVIA', rooms: [] }] } };
    });
    const r = await syncWithCloud('L3');
    expect(r.pushed).toBe(1);
    expect(r.pulled).toBe(0);
    expect(calls.some((c) => c.url.includes('list?id='))).toBe(false);
    expect(mem.laudos.get('L1')!.cloudUpdatedAt).toBe(60);
  });

  it('exclusão vira lápide: apaga no servidor e não baixa de novo', async () => {
    const calls = mockFetch((url, init) => {
      if (init?.method === 'DELETE') return { body: { success: true } };
      if (url.endsWith('/list')) return { body: { success: true, vistorias: [{ remoteId: 'R9', updatedAt: 1 }] } };
      return { status: 404, body: {} };
    });
    await deleteRemote('R9');
    expect(calls.some((c) => c.method === 'DELETE' && c.url.includes('id=R9'))).toBe(true);
    const r = await syncWithCloud(null);
    expect(r.pulled).toBe(0);
  });

  it('sem login avisa para entrar de novo', async () => {
    mockFetch(() => ({ status: 401, body: { success: false } }));
    await expect(syncWithCloud(null)).rejects.toBeInstanceOf(CloudAuthError);
  });

  it('fotos vão para o servidor uma vez só e o JSON leva só a chave', async () => {
    mem.kv.set('cloudOrg', 'ORG');
    mem.laudos.set('L1', laudo());
    let uploads = 0;
    const calls = mockFetch((url, init) => {
      if (url.endsWith('/list')) return { body: { success: true, organizationId: 'ORG', vistorias: [] } };
      if (url.endsWith('/photos/check')) return { body: { success: true, missing: uploads ? [] : JSON.parse(String(init!.body)).keys } };
      if (url.endsWith('/photos')) { uploads++; return { body: { success: true, key: 'vistoria/ORG/' + 'a'.repeat(64) + '.png' } }; }
      if (url.endsWith('/sync')) return { body: { success: true, remoteId: 'R1', updatedAt: 5 } };
      return { status: 404, body: {} };
    });
    await syncWithCloud(null);
    expect(uploads).toBe(1);
    const post = calls.find((c) => c.url.endsWith('/sync'))!.body as { vistoria: { rooms: { photos: Record<string, unknown>[] }[] } };
    expect(post.vistoria.rooms[0].photos[0].key).toMatch(/^vistoria\/ORG\//);
    expect(post.vistoria.rooms[0].photos[0].dataUrl).toBeUndefined();
    expect(mem.laudos.get('L1')!.rooms[0].photos[0].remoteKey).toBeTruthy();
  });

  it('servidor sem rota de fotos: envia embutido', async () => {
    mem.kv.set('cloudOrg', 'ORG');
    mem.laudos.set('L1', laudo());
    const calls = mockFetch((url) => {
      if (url.endsWith('/list')) return { body: { success: true, organizationId: 'ORG', vistorias: [] } };
      if (url.endsWith('/sync')) return { body: { success: true, remoteId: 'R1', updatedAt: 5 } };
      return { status: 404, body: {} };
    });
    await syncWithCloud(null);
    const post = calls.find((c) => c.url.endsWith('/sync'))!.body as { vistoria: { rooms: { photos: Record<string, unknown>[] }[] } };
    expect(post.vistoria.rooms[0].photos[0].dataUrl).toBe(PIXEL);
  });

  it('baixa as fotos pela chave ao receber do app', async () => {
    const calls = mockFetch((url) => {
      if (url.endsWith('/list')) return { body: { success: true, vistorias: [{ remoteId: 'APP1', updatedAt: 10 }] } };
      if (url.includes('/list?id=APP1')) return { body: { success: true, vistorias: [{ remoteId: 'APP1', updatedAt: 10,
        rooms: [{ id: 'r', name: 'SALA', photos: [{ id: 'p', key: 'vistoria/ORG/' + 'b'.repeat(64) + '.jpg', name: 'f' }] }] }] } };
      if (url.includes('/photos/vistoria/ORG/')) return { body: new Blob([new Uint8Array([0xff, 0xd8, 0xff])], { type: 'image/jpeg' }) };
      return { status: 404, body: {} };
    });
    const r = await syncWithCloud(null);
    expect(r.errors).toEqual([]);
    const l = [...mem.laudos.values()][0];
    expect(l.rooms[0].photos[0].dataUrl).toMatch(/^data:image\/jpeg;base64,/);
    expect(l.rooms[0].photos[0].remoteKey).toContain('vistoria/ORG/');
    expect(calls.some((c) => c.url.includes('/photos/vistoria/'))).toBe(true);
  });

  it('conflito: não sobrescreve e deixa escolher qual versão manter', async () => {
    mem.laudos.set('L1', laudo({ remoteId: 'R1', cloudUpdatedAt: 1, cloudSavedAt: 'antigo' }));
    let force = false;
    const calls = mockFetch((url, init) => {
      if (url.endsWith('/list')) return { body: { success: true, vistorias: [{ remoteId: 'R1', updatedAt: 50 }] } };
      if (url.endsWith('/sync') && init?.method === 'POST') {
        const b = JSON.parse(String(init.body));
        force = b.force;
        if (!b.force) return { status: 409, body: { success: false, conflict: true, remoteId: 'R1', serverUpdatedAt: 50 } };
        return { body: { success: true, remoteId: 'R1', updatedAt: 70 } };
      }
      if (url.includes('list?id=R1')) return { body: { success: true, vistorias: [{ remoteId: 'R1', condominio: 'Do servidor', updatedAt: 50, rooms: [] }] } };
      return { status: 404, body: {} };
    });
    const r = await syncWithCloud(null);
    expect(r.conflicts).toBe(1);
    expect(mem.laudos.get('L1')!.cloudConflict).toBe(true);
    expect(mem.laudos.get('L1')!.propertyInfo.condominio).toBe('Ed. Sol');
    // de novo: continua parado até o usuário decidir
    expect((await syncWithCloud(null)).pushed).toBe(0);

    await keepLocalVersion('L1');
    const r2 = await syncWithCloud(null);
    expect(force).toBe(true);
    expect(r2.pushed).toBe(1);
    expect(mem.laudos.get('L1')!.cloudConflict).toBe(false);
    expect(mem.laudos.get('L1')!.cloudUpdatedAt).toBe(70);

    mem.laudos.set('L1', { ...mem.laudos.get('L1')!, cloudConflict: true });
    await useServerVersion('L1');
    expect(mem.laudos.get('L1')!.propertyInfo.condominio).toBe('Do servidor');
    expect(mem.laudos.get('L1')!.cloudConflict).toBe(false);
    expect(calls.length).toBeGreaterThan(0);
  });

  it('apagada no servidor sai do navegador (mesma conta, sem alteração local)', async () => {
    mem.kv.set('cloudOrg', 'ORG');
    mem.laudos.set('L1', laudo({ remoteId: 'R1', cloudUpdatedAt: 1, cloudSavedAt: '2026-01-01T00:00:00.000Z' }));
    mem.laudos.set('L2', laudo({ id: 'L2', remoteId: 'R2', cloudUpdatedAt: 1, cloudSavedAt: 'antigo' })); // alterada aqui
    mockFetch((url, init) => {
      if (url.endsWith('/list')) return { body: { success: true, organizationId: 'ORG', vistorias: [] } };
      if (url.endsWith('/photos/check')) return { body: { success: true, missing: [] } };
      if (url.endsWith('/sync') && init?.method === 'POST') return { body: { success: true, remoteId: 'R2b', updatedAt: 9 } };
      return { status: 404, body: {} };
    });
    const r = await syncWithCloud(null);
    expect(r.removedLocally).toBe(1);
    expect(mem.laudos.has('L1')).toBe(false);
    expect(mem.laudos.has('L2')).toBe(true);
  });

  it('outra conta: nada é apagado e o laudo de outra conta não é enviado', async () => {
    mem.kv.set('cloudOrg', 'ORG-A');
    mem.laudos.set('L1', laudo({ remoteId: 'R1', cloudUpdatedAt: 1, cloudSavedAt: '2026-01-01T00:00:00.000Z' }));
    mem.laudos.set('L2', laudo({ id: 'L2', remoteId: 'R2', cloudUpdatedAt: 1, cloudSavedAt: 'antigo' }));
    mockFetch((url, init) => {
      if (url.endsWith('/list')) return { body: { success: true, organizationId: 'ORG-B', vistorias: [] } };
      if (url.endsWith('/sync') && init?.method === 'POST') return { status: 403, body: { success: false, error: 'Sem permissão' } };
      return { status: 404, body: {} };
    });
    const r = await syncWithCloud(null);
    expect(r.removedLocally).toBe(0);
    expect(mem.laudos.get('L2')!.cloudForeign).toBe(true);
    expect((await syncWithCloud(null)).pushed).toBe(0);
  });

  it('envia os campos extras (andar, telefones, e-mail, reparos)', () => {
    const l = laudo();
    l.propertyInfo = { ...l.propertyInfo, andar: '3', emailContestacao: 'x@y.com', reparos: [{ id: 'a', comodo: 'SALA', descricao: 'Pintura', min: 1, max: 2, origem: 'manual' }] };
    const p = toCloudPayload(l).vistoria;
    expect(p.andar).toBe('3');
    expect(p.locadoraTelefone).toBe('1199');
    expect(p.emailContestacao).toBe('x@y.com');
    expect(p.reparos).toHaveLength(1);
    const back = fromCloud({ ...p, remoteId: 'R', rooms: [] } as never);
    expect(back.propertyInfo.andar).toBe('3');
    expect(back.propertyInfo.reparos).toHaveLength(1);
  });
});
