import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';

/**
 * Exige usuário autenticado nas rotas /api/admin/vistoria/*.
 */
export async function requireUser(): Promise<{ userId: string } | { response: NextResponse }> {
  try {
    // 1. Tentar validar via token nativo (cookie ou header)
    const cookieStore = await cookies();
    let token = cookieStore.get('imobweb_token')?.value;

    if (!token) {
      const headerList = await headers();
      const authHeader = headerList.get('authorization') || headerList.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
      }
    }

    if (token) {
      const payload = await verifyToken(token);
      if (payload && payload.id) {
        return { userId: payload.id };
      }
    }

    // 2. Fallback opcional Supabase se configurado
    const isSupabaseConfigured =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (isSupabaseConfigured) {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        return { userId: data.user.id };
      }
    }

    return { response: NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 }) };
  } catch (err) {
    console.error('[vistoria] falha ao validar sessão:', err);
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
