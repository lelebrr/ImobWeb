import { NextRequest, NextResponse } from 'next/server';
import { requireUser, rateLimited } from './api-guard';
import { GeminiError, resolveApiKey } from './gemini';

/** Verificações comuns das rotas de IA: login, limite por usuário e chave disponível. */
export async function aiPreflight(
  req: NextRequest,
  bucket: string,
  limitPerMinute = 20,
): Promise<{ userId: string; apiKey: string } | { response: NextResponse }> {
  const guard = await requireUser();
  if ('response' in guard) return guard;
  if (rateLimited(`${bucket}:${guard.userId}`, limitPerMinute, 60_000)) {
    return { response: NextResponse.json({ success: false, error: 'Muitas solicitações seguidas. Aguarde um instante.' }, { status: 429 }) };
  }
  const apiKey = resolveApiKey(req.headers.get('x-gemini-key'));
  if (!apiKey) {
    return { response: NextResponse.json({ success: false, error: 'IA não configurada: defina GEMINI_API_KEY no servidor ou informe sua chave em Configurações.' }, { status: 503 }) };
  }
  return { userId: guard.userId, apiKey };
}

export function aiErrorResponse(err: unknown, scope: string): NextResponse {
  console.error(`[vistoria/${scope}]`, err);
  if (err instanceof GeminiError) {
    const status = err.status === 429 ? 429 : err.status === 401 || err.status === 403 ? 502 : err.status >= 500 ? 502 : 422;
    return NextResponse.json({ success: false, error: err.userMessage }, { status });
  }
  return NextResponse.json({ success: false, error: 'Erro ao processar com a IA' }, { status: 500 });
}

export const clamp = (n: unknown, min: number, max: number) => Math.min(max, Math.max(min, Number(n) || 0));
