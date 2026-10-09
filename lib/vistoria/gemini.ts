import { z } from 'zod';

/**
 * Cliente mínimo e robusto da API Gemini para o módulo de vistoria.
 *  - modelo configurável (GEMINI_MODEL) com fallback automático
 *  - chave enviada em header (nunca na URL)
 *  - saída JSON nativa (responseMimeType) + parse tolerante
 *  - timeout e retentativas em 429/5xx
 */

export type GeminiPart = { text: string } | { inlineData: { mimeType: string; data: string } };

const DEFAULT_MODELS = ['gemini-2.5-flash', 'gemini-3.5-flash'];

export function geminiModels(): string[] {
  const env = (process.env.GEMINI_MODEL || '').trim();
  return env ? [env, ...DEFAULT_MODELS.filter((m) => m !== env)] : DEFAULT_MODELS;
}

export function resolveApiKey(headerKey?: string | null): string {
  return (process.env.GEMINI_API_KEY || '').trim() || (headerKey || '').trim();
}

export class GeminiError extends Error {
  constructor(message: string, public status: number, public userMessage: string) {
    super(message);
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function dataUrlToPart(dataUrl: string): GeminiPart | null {
  const m = /^data:(image\/(?:jpeg|jpg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  return m ? { inlineData: { mimeType: m[1] === 'image/jpg' ? 'image/jpeg' : m[1], data: m[2] } } : null;
}

function extractJson(text: string): unknown {
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const a = cleaned.indexOf('{');
    const b = cleaned.lastIndexOf('}');
    if (a >= 0 && b > a) return JSON.parse(cleaned.slice(a, b + 1));
    throw new Error('Resposta da IA não é JSON');
  }
}

interface CallOptions {
  parts: GeminiPart[];
  system?: string;
  apiKey: string;
  temperature?: number;
  maxOutputTokens?: number;
  timeoutMs?: number;
}

async function callOnce(model: string, o: CallOptions): Promise<string> {
  const generationConfig: Record<string, unknown> = {
    temperature: o.temperature ?? 0.2,
    maxOutputTokens: o.maxOutputTokens ?? 4096,
    responseMimeType: 'application/json',
  };
  // modelos 2.5 "pensam" por padrão: desliga para baixa latência/custo em tarefas estruturadas
  if (model.startsWith('gemini-2.5-flash')) generationConfig.thinkingConfig = { thinkingBudget: 0 };

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': o.apiKey },
    body: JSON.stringify({
      ...(o.system ? { systemInstruction: { parts: [{ text: o.system }] } } : {}),
      contents: [{ role: 'user', parts: o.parts }],
      generationConfig,
    }),
    signal: AbortSignal.timeout(o.timeoutMs ?? 50_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const status = res.status;
    const user =
      status === 429 ? 'A IA está com muitas solicitações. Tente novamente em instantes.'
      : status === 401 || status === 403 ? 'Chave do Gemini inválida ou sem permissão.'
      : status === 404 ? 'Modelo de IA indisponível.'
      : status === 400 ? 'A IA recusou a solicitação (imagem/dados inválidos).'
      : 'A IA está temporariamente indisponível.';
    throw new GeminiError(`Gemini ${status} (${model}): ${body.slice(0, 300)}`, status, user);
  }
  const data = await res.json();
  const cand = data?.candidates?.[0];
  const text = (cand?.content?.parts || []).map((p: { text?: string }) => p.text || '').join('');
  if (!text) {
    const reason = cand?.finishReason || data?.promptFeedback?.blockReason || 'sem conteúdo';
    throw new GeminiError(`Gemini sem texto (${reason})`, 422, 'A IA não conseguiu gerar uma resposta para este conteúdo.');
  }
  return text;
}

export async function generateJson<S extends z.ZodTypeAny>(schema: S, o: CallOptions): Promise<z.infer<S>> {
  let lastErr: unknown;
  for (const model of geminiModels()) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const text = await callOnce(model, o);
        return schema.parse(extractJson(text));
      } catch (err) {
        lastErr = err;
        if (err instanceof GeminiError) {
          if (err.status === 404) break; // tenta o próximo modelo
          if (err.status === 401 || err.status === 403 || err.status === 400) throw err;
          if (err.status === 429 || err.status >= 500) { await sleep(700 * 2 ** attempt); continue; }
          throw err;
        }
        if (err instanceof z.ZodError || err instanceof SyntaxError || (err instanceof Error && /JSON/.test(err.message))) {
          if (attempt < 1) continue; // uma segunda tentativa para JSON malformado
          throw new GeminiError('Resposta da IA inválida', 502, 'A IA devolveu uma resposta inesperada. Tente novamente.');
        }
        if (err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError')) {
          if (attempt < 1) continue;
          throw new GeminiError('Timeout Gemini', 504, 'A IA demorou demais para responder.');
        }
        throw err;
      }
    }
  }
  if (lastErr instanceof GeminiError) throw lastErr;
  throw new GeminiError(String(lastErr), 502, 'A IA está indisponível no momento.');
}

/** Limpa texto vindo da IA antes de usar no laudo. */
export const cleanText = (s: unknown, max = 400): string =>
  String(s ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
