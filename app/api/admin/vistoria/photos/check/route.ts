import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth/get-auth';
import { ownsKey, photoBucket } from '@/lib/vistoria/photo-storage';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/vistoria/photos/check  { keys: string[] }  →  { missing: string[] }
 * Diz quais fotos (por chave) ainda não existem no R2, para o cliente subir só essas.
 */
export async function POST(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth?.id || !auth.organizationId) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
  const bucket = await photoBucket();
  if (!bucket) return NextResponse.json({ success: false, error: 'Armazenamento de fotos indisponível' }, { status: 501 });
  let keys: string[] = [];
  try {
    const body = await request.json();
    keys = (Array.isArray(body?.keys) ? body.keys : []).filter((k: unknown): k is string => typeof k === 'string').slice(0, 500);
  } catch { /* corpo inválido */ }
  const missing: string[] = [];
  await Promise.all(keys.map(async (key) => {
    if (!ownsKey(auth.organizationId, key) || !(await bucket.head(key))) missing.push(key);
  }));
  return NextResponse.json({ success: true, missing });
}
