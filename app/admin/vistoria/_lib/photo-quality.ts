/**
 * Análise rápida da qualidade de uma foto (luz, nitidez), 100% local no aparelho.
 * Usada no assistente de câmera (ao vivo) e na checagem de fotos enviadas.
 */
export interface QualityMetrics {
  /** luminância média 0–255 */
  brightness: number;
  /** variância do Laplaciano (quanto maior, mais nítida) */
  sharpness: number;
  /** fração de pixels muito escuros (<20) */
  dark: number;
  /** fração de pixels estourados (>245) */
  bright: number;
}

export type QualityIssueId = 'dark' | 'bright' | 'blurry' | 'backlit';
export interface QualityIssue { id: QualityIssueId; message: string; tip: string }
export interface QualityReport { metrics: QualityMetrics; issues: QualityIssue[]; ok: boolean; score: number; note?: string }

/** largura padrão de análise: a mesma ao vivo e na foto final, para os limites valerem nos dois casos */
export const ANALYSIS_WIDTH = 256;

export const THRESHOLDS = { darkMean: 55, brightMean: 205, darkFrac: 0.45, brightFrac: 0.25, sharp: 15, backlitBright: 0.08, backlitDark: 0.25 } as const;

const ISSUE: Record<QualityIssueId, QualityIssue> = {
  dark: { id: 'dark', message: 'Foto escura', tip: 'Acenda as luzes, abra as cortinas ou ligue o flash/lanterna.' },
  bright: { id: 'bright', message: 'Luz estourada', tip: 'Evite apontar para a janela ou lâmpada. Mude de ângulo.' },
  backlit: { id: 'backlit', message: 'Contraluz', tip: 'Há uma janela ou lâmpada muito forte no quadro. Mude de ângulo ou ligue a lanterna.' },
  blurry: { id: 'blurry', message: 'Pode estar tremida', tip: 'Segure firme com as duas mãos e apoie os cotovelos no corpo.' },
};

/** RGBA → luminância 0–255 */
export function lumaFromRGBA(rgba: ArrayLike<number>): Uint8Array {
  const n = Math.floor(rgba.length / 4);
  const out = new Uint8Array(n);
  for (let i = 0; i < n; i++) out[i] = (rgba[i * 4] * 299 + rgba[i * 4 + 1] * 587 + rgba[i * 4 + 2] * 114) / 1000;
  return out;
}

export function analyzeLuma(gray: Uint8Array, w: number, h: number): QualityReport {
  const n = gray.length;
  let sum = 0; let dark = 0; let bright = 0;
  for (let i = 0; i < n; i++) { const g = gray[i]; sum += g; if (g < 20) dark++; else if (g > 245) bright++; }
  const brightness = n ? sum / n : 0;

  // variância do Laplaciano (4-vizinhos) nos pixels internos
  let lsum = 0; let lsq = 0; let cnt = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const l = 4 * gray[i] - gray[i - 1] - gray[i + 1] - gray[i - w] - gray[i + w];
      lsum += l; lsq += l * l; cnt++;
    }
  }
  const mean = cnt ? lsum / cnt : 0;
  const sharpness = cnt ? lsq / cnt - mean * mean : 0;

  const metrics: QualityMetrics = { brightness, sharpness, dark: n ? dark / n : 0, bright: n ? bright / n : 0 };
  const issues: QualityIssue[] = [];
  if (brightness < THRESHOLDS.darkMean || metrics.dark > THRESHOLDS.darkFrac) issues.push(ISSUE.dark);
  else if (brightness > THRESHOLDS.brightMean || metrics.bright > THRESHOLDS.brightFrac) issues.push(ISSUE.bright);
  else if (metrics.bright > THRESHOLDS.backlitBright && metrics.dark > THRESHOLDS.backlitDark) issues.push(ISSUE.backlit);
  if (sharpness < THRESHOLDS.sharp) issues.push(ISSUE.blurry);
  const score = Math.max(0, 100 - issues.length * 35);
  return { metrics, issues, ok: issues.length === 0, score };
}

export function analyzePixels(rgba: ArrayLike<number>, w: number, h: number): QualityReport {
  return analyzeLuma(lumaFromRGBA(rgba), w, h);
}

/** diferença média absoluta entre dois quadros em tons de cinza (detecta movimento) */
export function frameDiff(a: Uint8Array, b: Uint8Array): number {
  const n = Math.min(a.length, b.length);
  if (!n) return 0;
  let s = 0;
  for (let i = 0; i < n; i += 3) s += Math.abs(a[i] - b[i]);
  return s / Math.ceil(n / 3);
}

/** Desenha a fonte reduzida (largura ~ maxW) e devolve luminância + dimensões. */
let sharedCanvas: HTMLCanvasElement | null = null;
export function grabLuma(src: CanvasImageSource, srcW: number, srcH: number, maxW = ANALYSIS_WIDTH): { gray: Uint8Array; w: number; h: number } | null {
  if (!srcW || !srcH || typeof document === 'undefined') return null;
  const w = Math.min(maxW, srcW);
  const h = Math.max(1, Math.round((srcH * w) / srcW));
  const c = (sharedCanvas ||= document.createElement('canvas'));
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  const ctx = c.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(src, 0, 0, w, h);
  return { gray: lumaFromRGBA(ctx.getImageData(0, 0, w, h).data), w, h };
}

export async function analyzeDataUrl(dataUrl: string): Promise<QualityReport | null> {
  if (typeof Image === 'undefined') return null;
  const img = await new Promise<HTMLImageElement | null>((resolve) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => resolve(null);
    i.src = dataUrl;
  });
  if (!img) return null;
  const g = grabLuma(img, img.naturalWidth, img.naturalHeight);
  return g ? analyzeLuma(g.gray, g.w, g.h) : null;
}

/** Orientação: 0 = nivelado. Retorna dicas só quando a diferença é relevante (celular em pé). */
export function tiltHint(beta: number | null, gamma: number | null): { roll: number; pitch: number; level: boolean; message?: string } | null {
  if (beta == null || gamma == null) return null;
  const roll = Math.round(gamma);
  const pitch = Math.round(beta - 90);
  if (Math.abs(roll) > 8) return { roll, pitch, level: false, message: roll > 0 ? 'Incline levemente para a esquerda' : 'Incline levemente para a direita' };
  if (Math.abs(pitch) > 20) return { roll, pitch, level: false, message: pitch > 0 ? 'Aponte um pouco mais para cima' : 'Aponte um pouco mais para baixo' };
  return { roll, pitch, level: true };
}

/**
 * Parede lisa também tem pouca "nitidez" medida. Se o aparelho estava firme (sem movimento recente),
 * a falta de detalhe não é tremor: remove o aviso de foto tremida e deixa só uma observação.
 */
export function relaxBlur(report: QualityReport, steadyMs: number, minSteadyMs = 900): QualityReport {
  if (steadyMs < minSteadyMs || !report.issues.some((i) => i.id === 'blurry')) return report;
  const issues = report.issues.filter((i) => i.id !== 'blurry');
  return { ...report, issues, ok: issues.length === 0, score: Math.max(0, 100 - issues.length * 35), note: 'Pouco detalhe visível (parede lisa?). Tudo bem se for isso.' };
}
