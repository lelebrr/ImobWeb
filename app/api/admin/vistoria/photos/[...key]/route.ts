import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth/get-auth';
import { ownsKey, photoBucket } from '@/lib/vistoria/photo-storage';

export const dynamic = 'force-dynamic';

/** GET /api/admin/vistoria/photos/vistoria/<org>/<sha>.jpg — só a organização dona lê. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ key: string[] }> }) {
  const auth = await getAuthFromRequest(request);
  if (!auth?.id || !auth.organizationId) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
  const key = (await params).key.join('/');
  if (!ownsKey(auth.organizationId, key)) return NextResponse.json({ success: false, error: 'Foto não encontrada' }, { status: 404 });
  const bucket = await photoBucket();
  if (!bucket) return NextResponse.json({ success: false, error: 'Armazenamento de fotos indisponível' }, { status: 501 });
  const obj = await bucket.get(key);
  if (!obj) return NextResponse.json({ success: false, error: 'Foto não encontrada' }, { status: 404 });
  return new NextResponse(obj.body, {
    headers: {
      'Content-Type': obj.httpMetadata?.contentType || 'image/jpeg',
      'Content-Length': String(obj.size),
      // conteúdo endereçado por hash: nunca muda
      'Cache-Control': 'private, max-age=31536000, immutable',
    },
  });
}
