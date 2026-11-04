// Fotos das vistorias no Cloudflare R2 (binding STORAGE do wrangler.jsonc).
// As fotos são endereçadas pelo conteúdo (SHA-256): a mesma foto nunca sobe duas vezes
// e a sincronização envia só o JSON com as chaves.
import { getCloudflareContext } from '@opennextjs/cloudflare';

/** Subconjunto da API do R2 que usamos (evita depender dos tipos do Workers). */
interface R2ObjectLike { body: ReadableStream; httpMetadata?: { contentType?: string }; size: number }
interface R2BucketLike {
  head(key: string): Promise<unknown | null>;
  get(key: string): Promise<R2ObjectLike | null>;
  put(key: string, value: ArrayBuffer, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
}

export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const KEY_RE = /^vistoria\/[A-Za-z0-9_-]{1,64}\/[a-f0-9]{64}\.(jpg|png|webp)$/;

/** Bucket R2 ou null quando não disponível (ex.: `next dev` sem o ambiente do Cloudflare). */
export async function photoBucket(): Promise<R2BucketLike | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const bucket = (env as unknown as Record<string, unknown>).STORAGE as R2BucketLike | undefined;
    return bucket && typeof bucket.put === 'function' ? bucket : null;
  } catch {
    return null;
  }
}

export function keyFor(orgId: string, sha256: string, ext = 'jpg'): string {
  return `vistoria/${orgId}/${sha256}.${ext}`;
}

/** A chave é válida e pertence à organização? */
export function ownsKey(orgId: string, key: string): boolean {
  return KEY_RE.test(key) && key.startsWith(`vistoria/${orgId}/`);
}

export async function sha256Hex(data: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Tipo pelo cabeçalho do arquivo (não confia no Content-Type do cliente). */
export function sniffImage(data: ArrayBuffer): { ext: 'jpg' | 'png' | 'webp'; mime: string } | null {
  const b = new Uint8Array(data.slice(0, 12));
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: 'jpg', mime: 'image/jpeg' };
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { ext: 'png', mime: 'image/png' };
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) {
    return { ext: 'webp', mime: 'image/webp' };
  }
  return null;
}
