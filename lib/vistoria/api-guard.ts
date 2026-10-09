import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Exige usuário autenticado nas rotas /api/admin/vistoria/*.
 * (O middleware libera todo "/api" como público, então a verificação precisa ser feita aqui.)
 */
export async function requireUser(): Promise<{ userId: string } | { response: NextResponse }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      return { response: NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 }) };
    }
    return { userId: data.user.id };
  } catch (err) {
    console.error('[vistoria] falha ao validar sessão:', err);
    if (process.env.NODE_ENV !== 'production') return { userId: 'dev' };
    return { response: NextResponse.json({ success: false, error: 'Falha ao validar sessão' }, { status: 503 }) };
  }
}

const hits = new Map<string, number[]>();

/** Limite simples em memória (por instância) para proteger endpoints que gastam cota de IA. */
export function rateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return false;
}

const DATA_URL_RE = /^data:image\/(jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/;

/** Aceita apenas data URLs de imagem ou imagens públicas do próprio app. */
export function isSafeImageSrc(src: unknown): src is string {
  if (typeof src !== 'string') return false;
  return DATA_URL_RE.test(src) || /^\/vistoria-exemplos\/[\w./-]+$/.test(src);
}
