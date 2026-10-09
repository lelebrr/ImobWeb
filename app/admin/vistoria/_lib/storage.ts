import Dexie, { type Table } from 'dexie';
import { defaultSettings, type SavedLaudo, type VistoriaSettings } from './types';

// Persistência local em IndexedDB.
//  - `laudos`: registro leve (sem os bytes das fotos) → listagens rápidas, pouca memória
//  - `photos`: bytes das fotos (dataURL comprimido), carregados só ao abrir/gerar um laudo
//  - `kv`: configurações e flags

interface KvRow { key: string; value: unknown }
interface PhotoRow { id: string; laudoId: string; dataUrl: string }

class VistoriaDB extends Dexie {
  laudos!: Table<SavedLaudo, string>;
  photos!: Table<PhotoRow, string>;
  kv!: Table<KvRow, string>;
  constructor() {
    super('imobweb-vistoria');
    this.version(1).stores({ laudos: 'id, savedAt', kv: 'key' });
    this.version(2).stores({ laudos: 'id, savedAt', photos: 'id, laudoId', kv: 'key' });
  }
}

let _db: VistoriaDB | null = null;
function db(): VistoriaDB {
  if (!_db) _db = new VistoriaDB();
  return _db;
}

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

/** ids de fotos já gravadas nesta sessão: o autosave só escreve fotos novas */
const knownPhotos = new Set<string>();

async function getKv<T>(key: string): Promise<T | undefined> {
  const row = await db().kv.get(key);
  return row?.value as T | undefined;
}
async function setKv(key: string, value: unknown): Promise<void> {
  await db().kv.put({ key, value });
}

const isBlob = (dataUrl: string) => dataUrl.startsWith('data:');

/** Grava o laudo separando os bytes das fotos. Retorna o laudo "leve" gravado. */
export async function putLaudo(laudo: SavedLaudo): Promise<SavedLaudo> {
  const newPhotos: PhotoRow[] = [];
  const keepIds = new Set<string>();

  const light: SavedLaudo = {
    ...laudo,
    rooms: laudo.rooms.map((room) => ({
      ...room,
      photos: room.photos.map((p) => {
        if (!p.dataUrl || !isBlob(p.dataUrl)) {
          // sem bytes (legado) ou URL pública (exemplos): grava como está
          if (p.id) keepIds.add(p.id);
          return p;
        }
        const id = p.id || uid();
        keepIds.add(id);
        if (!knownPhotos.has(id)) newPhotos.push({ id, laudoId: laudo.id, dataUrl: p.dataUrl });
        return { ...p, id, dataUrl: '' };
      }),
    })),
  };

  await db().transaction('rw', db().laudos, db().photos, async () => {
    if (newPhotos.length) await db().photos.bulkPut(newPhotos);
    const stored = await db().photos.where('laudoId').equals(laudo.id).primaryKeys();
    const orphans = stored.filter((id) => !keepIds.has(id as string));
    if (orphans.length) await db().photos.bulkDelete(orphans);
    await db().laudos.put(light);
  });
  newPhotos.forEach((p) => knownPhotos.add(p.id));
  keepIds.forEach((id) => knownPhotos.add(id));
  return light;
}

/** Registros leves (sem bytes de fotos). */
export async function listLaudos(): Promise<SavedLaudo[]> {
  return db().laudos.toArray();
}

/** Registro leve de um laudo. */
export async function getLaudoLight(id: string): Promise<SavedLaudo | undefined> {
  return db().laudos.get(id);
}

/** Laudo completo, com as fotos reidratadas. */
export async function getLaudoFull(id: string): Promise<SavedLaudo | undefined> {
  const laudo = await db().laudos.get(id);
  if (!laudo) return undefined;
  return hydrate(laudo);
}

export async function hydrate(laudo: SavedLaudo): Promise<SavedLaudo> {
  const ids = laudo.rooms.flatMap((r) => r.photos.map((p) => p.id).filter((x): x is string => !!x));
  if (ids.length === 0) return laudo;
  const rows = await db().photos.bulkGet(ids);
  const map = new Map(rows.filter((r): r is PhotoRow => !!r).map((r) => [r.id, r.dataUrl]));
  ids.forEach((id) => { if (map.has(id)) knownPhotos.add(id); });
  return {
    ...laudo,
    rooms: laudo.rooms.map((room) => ({
      ...room,
      photos: room.photos.map((p) => (p.id && map.has(p.id) ? { ...p, dataUrl: map.get(p.id)! } : p)),
    })),
  };
}

export async function deleteLaudoById(id: string): Promise<void> {
  await db().transaction('rw', db().laudos, db().photos, async () => {
    const ids = await db().photos.where('laudoId').equals(id).primaryKeys();
    await db().photos.bulkDelete(ids);
    await db().laudos.delete(id);
  });
}
export async function clearLaudos(): Promise<void> {
  await db().transaction('rw', db().laudos, db().photos, async () => {
    await db().photos.clear();
    await db().laudos.clear();
  });
  knownPhotos.clear();
}

export async function loadSettings(): Promise<VistoriaSettings> {
  const saved = await getKv<Partial<VistoriaSettings>>('settings');
  return { ...defaultSettings, ...(saved || {}) };
}
export async function saveSettingsToDb(settings: VistoriaSettings): Promise<void> {
  await setKv('settings', settings);
}

/** Importa dados antigos do localStorage e separa fotos embutidas (v1) — uma única vez. */
export async function migrateLegacyStorage(): Promise<number> {
  let migrated = 0;
  if (!(await getKv<boolean>('legacyMigrated'))) {
    try {
      const raw = localStorage.getItem('vistoria_saved');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existing = new Set((await db().laudos.toCollection().primaryKeys()) as string[]);
          for (const l of parsed as SavedLaudo[]) {
            if (l && l.id && !existing.has(l.id)) { await putLaudo(l); migrated++; }
          }
        }
      }
      const rawSettings = localStorage.getItem('vistoria_settings');
      if (rawSettings && !(await getKv('settings'))) await setKv('settings', JSON.parse(rawSettings));
      await setKv('legacyMigrated', true);
      localStorage.removeItem('vistoria_saved');
    } catch {
      /* mantém o localStorage intacto se algo falhar */
    }
  }
  // laudos gravados no formato v1 (fotos embutidas) → separa em `photos`
  if (!(await getKv<boolean>('photosSplit'))) {
    try {
      const all = await db().laudos.toArray();
      for (const l of all) {
        if (l.rooms.some((r) => r.photos.some((p) => p.dataUrl && isBlob(p.dataUrl)))) await putLaudo(l);
      }
      await setKv('photosSplit', true);
    } catch { /* tenta de novo na próxima abertura */ }
  }
  return migrated;
}

/** Carrega os laudos de exemplo da API apenas na primeira vez. */
export async function seedExamplesOnce(): Promise<void> {
  if (await getKv<boolean>('examplesSeeded')) return;
  try {
    const res = await fetch('/api/admin/vistoria/examples');
    const data = await res.json();
    if (data?.success && Array.isArray(data.examples)) {
      const existing = new Set((await db().laudos.toCollection().primaryKeys()) as string[]);
      for (const ex of data.examples as { data: SavedLaudo }[]) {
        if (ex.data?.id && !existing.has(ex.data.id)) await putLaudo({ ...ex.data, isExample: true });
      }
      await setKv('examplesSeeded', true);
    }
  } catch {
    /* tenta de novo no próximo carregamento */
  }
}

export interface BackupFile {
  app: 'imobweb-vistoria';
  version: 1;
  exportedAt: string;
  laudos: SavedLaudo[];
}

export async function exportBackup(ids?: string[]): Promise<Blob> {
  const light = await listLaudos();
  const chosen = ids ? light.filter((l) => ids.includes(l.id)) : light;
  const laudos = await Promise.all(chosen.map(hydrate));
  const payload: BackupFile = { app: 'imobweb-vistoria', version: 1, exportedAt: new Date().toISOString(), laudos };
  return new Blob([JSON.stringify(payload)], { type: 'application/json' });
}

export async function importBackup(text: string): Promise<number> {
  const parsed = JSON.parse(text) as Partial<BackupFile>;
  if (parsed.app !== 'imobweb-vistoria' || !Array.isArray(parsed.laudos)) {
    throw new Error('Arquivo de backup inválido');
  }
  const valid = parsed.laudos.filter((l) => l && typeof l.id === 'string' && l.propertyInfo && Array.isArray(l.rooms));
  for (const l of valid) await putLaudo(l);
  return valid.length;
}

export async function estimateUsage(): Promise<{ usage: number; quota: number } | null> {
  try {
    if (navigator.storage?.estimate) {
      const e = await navigator.storage.estimate();
      return { usage: e.usage || 0, quota: e.quota || 0 };
    }
  } catch { /* ignore */ }
  return null;
}

/** Pede ao navegador que não apague os dados sob pressão de espaço. */
export async function requestPersistence(): Promise<boolean> {
  try {
    if (navigator.storage?.persist) return await navigator.storage.persist();
  } catch { /* ignore */ }
  return false;
}
