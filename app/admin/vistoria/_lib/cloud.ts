// Sincronização com o servidor (mesmas rotas usadas pelo app Android).
// Os laudos continuam no IndexedDB; o servidor guarda uma cópia por organização.
// Fotos vão para o R2 uma única vez (endereçadas por SHA-256) e o JSON leva só as chaves.
import { getKv, setKv, hydrate, listLaudos, putLaudo, deleteLaudoById } from './storage';
import { downscaleDataUrl } from './image';
import { defaultPropertyInfo, type PhotoData, type PropertyInfo, type Reparo, type RoomData, type SavedLaudo } from './types';

const API = '/api/admin/vistoria';
const TOMBSTONES = 'cloudDeleted';
const PENDING_DELETES = 'cloudPendingDeletes';
const ORG = 'cloudOrg';
const PHOTO_API_OFF = 'cloudPhotoApiOff';

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export class CloudAuthError extends Error {
  constructor() { super('Sessão expirada: entre novamente para sincronizar com o app'); }
}

export class CloudHttpError extends Error {
  constructor(public status: number, message: string, public data: Record<string, unknown> = {}) { super(message); }
}

async function call<T = Record<string, unknown>>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: 'same-origin', ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } });
  if (res.status === 401) throw new CloudAuthError();
  let data: Record<string, unknown> = {};
  try { data = await res.json(); } catch { /* corpo vazio */ }
  if (!res.ok || data.success === false) throw new CloudHttpError(res.status, String(data.error || `Erro ${res.status}`), data);
  return data as T;
}

/** Campos de texto do imóvel que o app também conhece. */
const SHARED_FIELDS = [
  'condominio', 'endereco', 'numero', 'conjApto', 'cep', 'bairro', 'cidade', 'estado', 'tipoImovel', 'finalidade',
  'metragem', 'mobiliado', 'locadora', 'locadoraCpf', 'locatario', 'locatarioCpf', 'vistoriadora', 'dataFotografia',
  'dataLaudo', 'solicitante', 'consideracoes', 'andar', 'locadoraTelefone', 'locatarioTelefone', 'emailContestacao',
] as const;
type SharedField = (typeof SHARED_FIELDS)[number];

// ---------------------------------------------------------------- fotos no R2

function dataUrlToBytes(dataUrl: string): { bytes: Uint8Array; ext: string } | null {
  const m = /^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/.exec(dataUrl);
  if (!m) return null;
  const bin = atob(m[2]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { bytes, ext: m[1] === 'jpeg' ? 'jpg' : m[1] };
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', bytes as unknown as ArrayBuffer);
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  const type = (blob.type || 'image/jpeg').split(';')[0];
  return `data:${type};base64,${btoa(bin)}`;
}

/**
 * Sobe só as fotos que o servidor ainda não tem e devolve o laudo com `remoteKey` nelas.
 * Servidor sem a rota de fotos (antigo): devolve o laudo como está e as fotos vão embutidas.
 */
async function uploadPhotos(laudo: SavedLaudo, org: string | undefined): Promise<SavedLaudo> {
  if (!org) return laudo;
  const off = await getKv<number>(PHOTO_API_OFF);
  if (off && Date.now() - off < 24 * 3600 * 1000) return laudo;
  const pending: { photo: PhotoData; key: string; bytes: Uint8Array }[] = [];
  for (const r of laudo.rooms) {
    for (const p of r.photos) {
      if (p.remoteKey || !p.dataUrl?.startsWith('data:image/')) continue;
      const parsed = dataUrlToBytes(p.dataUrl);
      if (!parsed) continue;
      pending.push({ photo: p, bytes: parsed.bytes, key: `vistoria/${org}/${await sha256Hex(parsed.bytes)}.${parsed.ext}` });
    }
  }
  if (!pending.length) return laudo;
  let missing: Set<string>;
  try {
    const res = await call<{ missing: string[] }>(`${API}/photos/check`, { method: 'POST', body: JSON.stringify({ keys: [...new Set(pending.map((p) => p.key))] }) });
    missing = new Set(res.missing || []);
  } catch (err) {
    if (err instanceof CloudHttpError && (err.status === 404 || err.status === 501)) { await setKv(PHOTO_API_OFF, Date.now()); return laudo; }
    throw err;
  }
  const keys = new Map<PhotoData, string>();
  for (const p of pending) {
    if (!missing.has(p.key)) { keys.set(p.photo, p.key); continue; }
    const res = await fetch(`${API}/photos`, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/octet-stream' }, body: p.bytes as unknown as BodyInit });
    if (res.status === 401) throw new CloudAuthError();
    if (res.status === 501) { await setKv(PHOTO_API_OFF, Date.now()); break; }
    const data = await res.json().catch(() => ({}));
    if (res.ok && data?.key) { keys.set(p.photo, String(data.key)); missing.delete(p.key); }
  }
  if (!keys.size) return laudo;
  return { ...laudo, rooms: laudo.rooms.map((r) => ({ ...r, photos: r.photos.map((p) => (keys.has(p) ? { ...p, remoteKey: keys.get(p) } : p)) })) };
}

async function downloadPhoto(key: string): Promise<string | null> {
  const res = await fetch(`${API}/photos/${key}`, { credentials: 'same-origin' });
  if (res.status === 401) throw new CloudAuthError();
  if (!res.ok) return null;
  return blobToDataUrl(await res.blob());
}

// ---------------------------------------------------------------- conversões

/** Formato aceito por POST /sync (o mesmo do app Android). */
export function toCloudPayload(laudo: SavedLaudo, linkedRemoteId?: string | null) {
  const i = laudo.propertyInfo || defaultPropertyInfo;
  const fields = Object.fromEntries(SHARED_FIELDS.map((k) => [k, String(i[k] ?? '')])) as Record<SharedField, string>;
  return {
    force: !!laudo.cloudForce,
    vistoria: {
      ...fields,
      remoteId: laudo.remoteId || null,
      baseUpdatedAt: laudo.remoteId ? laudo.cloudUpdatedAt ?? null : null,
      force: !!laudo.cloudForce,
      tipoVistoria: i.tipoVistoria || 'ENTRADA',
      linkedRemoteId: linkedRemoteId || null,
      medidores: i.medidores || null,
      medidoresEntrada: i.medidoresEntrada || null,
      chaves: i.chaves || [],
      reparos: i.reparos || [],
      signatures: laudo.signatures || {},
      rooms: laudo.rooms.map((r) => ({
        ...r, // campos só do web (checklist de fotos, sugestões...) seguem junto e voltam intactos
        analyzing: false,
        problems: [],
        furniture: r.furniture || [],
        damages: r.damages || [],
        items: r.items || [],
        checklist: r.checklist || {},
        observations: r.observations || '',
        photos: r.photos
          .filter((p) => p.remoteKey || (p.dataUrl && p.dataUrl.startsWith('data:image/')))
          .map((p) => ({
            id: p.id, name: p.name || '', annotations: p.annotations || [], inspection: p.inspection,
            ...(p.remoteKey ? { key: p.remoteKey } : { dataUrl: p.dataUrl }),
          })),
      })),
    },
  };
}

interface CloudPhoto { id?: string; dataUrl?: string; key?: string; name?: string; annotations?: { x: number; y: number; label: string }[] }
interface CloudRoom extends Partial<Omit<RoomData, 'photos'>> { problems?: string[]; photos?: CloudPhoto[] }
interface CloudVistoria extends Partial<Record<SharedField, string>> {
  remoteId: string;
  status?: string;
  rooms?: CloudRoom[];
  createdAt?: number;
  updatedAt?: number;
  tipoVistoria?: string;
  linkedRemoteId?: string | null;
  medidores?: PropertyInfo['medidores'] | null;
  medidoresEntrada?: PropertyInfo['medidoresEntrada'] | null;
  chaves?: PropertyInfo['chaves'];
  reparos?: Reparo[];
  signatures?: SavedLaudo['signatures'] | null;
}

/** Converte a vistoria do servidor em laudo do navegador, preservando o que só existe localmente. */
export function fromCloud(v: CloudVistoria, existing?: SavedLaudo, linkedId?: string): SavedLaudo {
  const shared = Object.fromEntries(SHARED_FIELDS.map((k) => [k, v[k] ?? ''])) as Partial<PropertyInfo>;
  const tipo = v.tipoVistoria === 'SAIDA' || v.tipoVistoria === 'PERIODICA' ? v.tipoVistoria : 'ENTRADA';
  const rooms: RoomData[] = (v.rooms || []).map((r) => {
    const damages = [...(r.damages || []), ...(r.problems || []).filter((p) => !(r.damages || []).includes(p))];
    const rest: CloudRoom = { ...r };
    delete rest.problems;
    return {
      ...rest,
      id: r.id || uid(),
      name: r.name || '',
      items: r.items || [],
      furniture: r.furniture || [],
      damages,
      checklist: r.checklist || {},
      observations: r.observations || '',
      analyzing: false,
      analyzed: r.analyzed ?? (r.items || []).length > 0,
      photos: (r.photos || [])
        .filter((p) => (p.dataUrl && p.dataUrl.startsWith('data:image/')) || p.key)
        .map((p) => {
          const { key, ...photo } = p;
          return { ...photo, id: p.id || uid(), dataUrl: p.dataUrl || '', name: p.name || '', annotations: p.annotations || [], ...(key ? { remoteKey: key } : {}) };
        }),
    } as RoomData;
  });
  const now = new Date().toISOString();
  const propertyInfo: PropertyInfo = {
    ...defaultPropertyInfo,
    ...(existing?.propertyInfo || {}),
    ...shared,
    tipoVistoria: tipo,
    medidores: v.medidores || undefined,
    medidoresEntrada: v.medidoresEntrada || undefined,
    chaves: v.chaves || [],
    reparos: Array.isArray(v.reparos) ? v.reparos : existing?.propertyInfo?.reparos || [],
    totalComodos: rooms.length,
  };
  return {
    id: existing?.id || uid(),
    name: propertyInfo.condominio || propertyInfo.endereco || 'Vistoria do app',
    condominio: propertyInfo.condominio,
    savedAt: now,
    createdAt: existing?.createdAt || (v.createdAt ? new Date(v.createdAt).toISOString() : now),
    favorite: existing?.favorite,
    signatures: v.signatures || {},
    linkedId: linkedId ?? existing?.linkedId,
    propertyInfo,
    rooms,
    remoteId: v.remoteId,
    cloudUpdatedAt: v.updatedAt,
    cloudSavedAt: now,
  };
}

/** Baixa os bytes das fotos que vieram só com a chave do R2. */
async function hydrateRemotePhotos(laudo: SavedLaudo): Promise<SavedLaudo> {
  const rooms = await Promise.all(laudo.rooms.map(async (r) => ({
    ...r,
    photos: (await Promise.all(r.photos.map(async (p) => {
      if (p.dataUrl || !p.remoteKey) return p;
      const data = await downloadPhoto(p.remoteKey);
      return data ? { ...p, dataUrl: data } : null;
    }))).filter((p): p is PhotoData => !!p),
  })));
  return { ...laudo, rooms };
}

async function thumbOf(laudo: SavedLaudo): Promise<string | undefined> {
  const first = laudo.rooms.flatMap((r) => r.photos).find((p) => p.dataUrl?.startsWith('data:'));
  if (!first) return undefined;
  try { return await downscaleDataUrl(first.dataUrl, 280, 0.65); } catch { return undefined; }
}

// ---------------------------------------------------------------- exclusões

/** Marca um laudo apagado no navegador para não voltar do servidor e apaga a cópia remota. */
export async function deleteRemote(remoteId: string): Promise<void> {
  const tomb = new Set((await getKv<string[]>(TOMBSTONES)) || []);
  tomb.add(remoteId);
  await setKv(TOMBSTONES, [...tomb]);
  const pending = new Set((await getKv<string[]>(PENDING_DELETES)) || []);
  pending.add(remoteId);
  await setKv(PENDING_DELETES, [...pending]);
  try { await flushDeletes(); } catch { /* tenta de novo na próxima sincronização */ }
}

async function flushDeletes(): Promise<number> {
  const pending = (await getKv<string[]>(PENDING_DELETES)) || [];
  const left: string[] = [];
  for (const id of pending) {
    try {
      await call(`${API}/sync?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    } catch (err) {
      if (err instanceof CloudAuthError) throw err;
      left.push(id);
    }
  }
  await setKv(PENDING_DELETES, left);
  return pending.length - left.length;
}

// ---------------------------------------------------------------- sincronização

export interface CloudSyncResult { pushed: number; pulled: number; deleted: number; removedLocally: number; conflicts: number; errors: string[] }

async function fetchFull(remoteId: string): Promise<CloudVistoria | undefined> {
  const one = await call<{ vistorias: CloudVistoria[] }>(`${API}/list?id=${encodeURIComponent(remoteId)}`);
  return one.vistorias?.[0];
}

/**
 * Envia os laudos criados/alterados no navegador e baixa os criados/alterados no app.
 *  - Alterado aqui e lá ao mesmo tempo → conflito: nada é sobrescrito até o usuário escolher.
 *  - Apagado no servidor (por outro caminho) e sem alterações aqui → sai do navegador também.
 * [skipId]: laudo aberto no editor agora (não é tocado para não disputar com o autosave).
 */
export async function syncWithCloud(skipId?: string | null, onProgress?: (msg: string) => void): Promise<CloudSyncResult> {
  const errors: string[] = [];
  const deleted = await flushDeletes();

  const list = await call<{ vistorias: CloudVistoria[]; organizationId?: string }>(`${API}/list`);
  const summaries = list.vistorias || [];
  const org = list.organizationId;
  const knownOrg = await getKv<string>(ORG);
  if (org && org !== knownOrg) await setKv(ORG, org);
  const sameAccount = !!org && org === knownOrg;
  const tomb = new Set((await getKv<string[]>(TOMBSTONES)) || []);

  // 1) Envio
  let local = (await listLaudos()).filter((l) => !l.isExample);
  const toPush = local.filter((l) => l.id !== skipId && !l.cloudConflict && !l.cloudForeign && (!l.remoteId || l.savedAt !== l.cloudSavedAt || l.cloudForce));
  let pushed = 0;
  let conflicts = 0;
  const touched = new Set<string>(); // enviados nesta rodada: ainda não estão na lista do servidor
  // entradas antes das saídas, para o vínculo já ter remoteId
  toPush.sort((a, b) => (a.linkedId ? 1 : 0) - (b.linkedId ? 1 : 0));
  for (const light of toPush) {
    onProgress?.(`Enviando ${light.name || 'laudo'}…`);
    try {
      let full = await hydrate(light);
      full = await uploadPhotos(full, org);
      const linked = full.linkedId ? local.find((l) => l.id === full.linkedId)?.remoteId : null;
      try {
        const res = await call<{ remoteId: string; updatedAt?: number }>(`${API}/sync`, {
          method: 'POST',
          body: JSON.stringify(toCloudPayload(full, linked)),
        });
        const saved = await putLaudo({ ...full, remoteId: res.remoteId, cloudUpdatedAt: res.updatedAt ?? Date.now(), cloudSavedAt: full.savedAt, cloudForce: false, cloudConflict: false });
        local = local.map((l) => (l.id === saved.id ? saved : l));
        touched.add(saved.id);
        pushed++;
      } catch (err) {
        if (err instanceof CloudHttpError && err.status === 409) {
          const saved = await putLaudo({ ...full, cloudConflict: true });
          local = local.map((l) => (l.id === saved.id ? saved : l));
          conflicts++;
        } else if (err instanceof CloudHttpError && err.status === 403) {
          const saved = await putLaudo({ ...full, cloudForeign: true });
          local = local.map((l) => (l.id === saved.id ? saved : l));
          errors.push(`${light.name || 'Laudo'}: pertence a outra conta`);
        } else {
          // guarda as chaves de fotos já enviadas mesmo se o JSON falhar
          await putLaudo(full);
          throw err;
        }
      }
    } catch (err) {
      if (err instanceof CloudAuthError) throw err;
      errors.push(`${light.name || 'Laudo'}: ${err instanceof Error ? err.message : 'erro'}`);
    }
  }

  // 2) Recebimento
  const byRemote = new Map(local.filter((l) => l.remoteId).map((l) => [l.remoteId as string, l]));
  let pulled = 0;
  for (const s of summaries) {
    if (!s.remoteId || tomb.has(s.remoteId)) continue;
    const existing = byRemote.get(s.remoteId);
    if (existing) {
      const unchangedLocally = existing.savedAt === existing.cloudSavedAt && !existing.cloudConflict;
      const newerOnServer = (s.updatedAt || 0) > (existing.cloudUpdatedAt || 0);
      if (existing.id === skipId || !unchangedLocally || !newerOnServer) continue;
    }
    onProgress?.(`Baixando ${s.condominio || s.endereco || 'vistoria'}…`);
    try {
      const v = await fetchFull(s.remoteId);
      if (!v) continue;
      const linkedId = v.linkedRemoteId ? byRemote.get(v.linkedRemoteId)?.id : undefined;
      const laudo = await hydrateRemotePhotos(fromCloud(v, existing, linkedId));
      laudo.thumb = await thumbOf(laudo);
      const saved = await putLaudo(laudo);
      byRemote.set(s.remoteId, saved);
      pulled++;
    } catch (err) {
      if (err instanceof CloudAuthError) throw err;
      errors.push(`${s.condominio || s.endereco || s.remoteId}: ${err instanceof Error ? err.message : 'erro'}`);
    }
  }

  // 3) Apagados no servidor por outro caminho: só na mesma conta e sem alterações locais
  let removedLocally = 0;
  if (sameAccount) {
    const remoteIds = new Set(summaries.map((s) => s.remoteId));
    for (const l of local) {
      if (!l.remoteId || l.id === skipId || touched.has(l.id) || l.cloudConflict || l.cloudForeign || l.cloudForce) continue;
      if (remoteIds.has(l.remoteId) || l.savedAt !== l.cloudSavedAt) continue;
      await deleteLaudoById(l.id);
      removedLocally++;
    }
  }

  await setKv('cloudLastSync', new Date().toISOString());
  return { pushed, pulled, deleted, removedLocally, conflicts, errors };
}

/** Conflito: mantém a versão do navegador (o próximo envio substitui a do servidor). */
export async function keepLocalVersion(id: string): Promise<void> {
  const l = (await listLaudos()).find((x) => x.id === id);
  if (!l) return;
  await putLaudo({ ...(await hydrate(l)), cloudConflict: false, cloudForce: true });
}

/** Conflito: substitui pela versão do servidor (descarta as alterações deste navegador). */
export async function useServerVersion(id: string): Promise<void> {
  const l = (await listLaudos()).find((x) => x.id === id);
  if (!l?.remoteId) throw new Error('Laudo sem cópia no servidor');
  const v = await fetchFull(l.remoteId);
  if (!v) throw new Error('A vistoria não existe mais no servidor');
  const laudo = await hydrateRemotePhotos(fromCloud(v, l, l.linkedId));
  laudo.thumb = await thumbOf(laudo);
  await putLaudo({ ...laudo, cloudConflict: false, cloudForce: false });
}

export async function lastCloudSync(): Promise<string | undefined> {
  return getKv<string>('cloudLastSync');
}
