// Compressão de imagens no cliente: reduz fotos de câmera (3-8 MB) para ~150-400 KB.

async function loadBitmap(file: Blob): Promise<{ source: CanvasImageSource; width: number; height: number; close?: () => void }> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' } as ImageBitmapOptions);
      return { source: bmp, width: bmp.width, height: bmp.height, close: () => bmp.close() };
    } catch {
      /* cai para <img> */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new window.Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Imagem inválida'));
      el.src = url;
    });
    return { source: img, width: img.naturalWidth, height: img.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function canvasToDataUrl(canvas: HTMLCanvasElement, quality: number): string {
  return canvas.toDataURL('image/jpeg', quality);
}

export async function compressImage(file: Blob, maxDim = 1600, quality = 0.82): Promise<string> {
  const { source, width, height, close } = await loadBitmap(file);
  try {
    const scale = Math.min(1, maxDim / Math.max(width, height));
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas indisponível');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(source, 0, 0, w, h);
    return canvasToDataUrl(canvas, quality);
  } finally {
    close?.();
  }
}

/** Reduz uma foto já em dataURL (usado para enviar o PDF sem estourar o limite de payload). */
export async function downscaleDataUrl(dataUrl: string, maxDim = 1100, quality = 0.7): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image')) return dataUrl;
  try {
    const blob = await (await fetch(dataUrl)).blob();
    return await compressImage(blob, maxDim, quality);
  } catch {
    return dataUrl;
  }
}

export function dataUrlBytes(dataUrl: string): number {
  const i = dataUrl.indexOf(',');
  return i < 0 ? 0 : Math.floor(((dataUrl.length - i - 1) * 3) / 4);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
