import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth/get-auth';
import { rateLimited } from '@/lib/vistoria/api-guard';
import { MAX_PHOTO_BYTES, keyFor, photoBucket, sha256Hex, sniffImage } from '@/lib/vistoria/photo-storage';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/vistoria/photos  (corpo = bytes da imagem JPEG/PNG/WebP)
 * Grava no R2 e devolve { key }. Se a mesma foto já existe, não grava de novo.
 * 501 quando o servidor não tem R2: o cliente então envia a foto embutida na vistoria.
 */
export async function POST(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth?.id || !auth.organizationId) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
  if (rateLimited(`photos:${auth.id}`, 600, 60_000)) {
    return NextResponse.json({ success: false, error: 'Muitas fotos seguidas. Aguarde um instante.' }, { status: 429 });
  }
  const bucket = await photoBucket();
  if (!bucket) return NextResponse.json({ success: false, error: 'Armazenamento de fotos indisponível' }, { status: 501 });

  const length = Number(request.headers.get('content-length') || 0);
  if (length > MAX_PHOTO_BYTES) return NextResponse.json({ success: false, error: 'Foto grande demais' }, { status: 413 });
  const data = await request.arrayBuffer();
  if (data.byteLength === 0 || data.byteLength > MAX_PHOTO_BYTES) {
    return NextResponse.json({ success: false, error: 'Foto vazia ou grande demais' }, { status: 413 });
  }
  const type = sniffImage(data);
  if (!type) return NextResponse.json({ success: false, error: 'Formato de imagem não suportado' }, { status: 415 });

  const key = keyFor(auth.organizationId, await sha256Hex(data), type.ext);
  try {
    if (!(await bucket.head(key))) await bucket.put(key, data, { httpMetadata: { contentType: type.mime } });
    return NextResponse.json({ success: true, key });
  } catch (err) {
    console.error('[vistoria/photos] erro no R2:', err);
    return NextResponse.json({ success: false, error: 'Falha ao gravar a foto' }, { status: 502 });
  }
}
