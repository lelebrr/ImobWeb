/**
 * Ponte com o app Android (Capacitor). No navegador comum tudo cai no comportamento web normal.
 *
 * O app Android abre o próprio site dentro de um WebView; o Capacitor injeta `window.Capacitor`
 * na página, e `nativePromise` chama os plugins nativos:
 *  - Filesystem / Share (oficiais) para salvar e compartilhar arquivos;
 *  - HtmlPrint (plugin próprio em mobile/android) para imprimir/salvar o laudo em PDF.
 */

type CapacitorBridge = {
  isNativePlatform?: () => boolean;
  nativePromise?: (plugin: string, method: string, options?: unknown) => Promise<unknown>;
};

const bridge = (): CapacitorBridge | undefined =>
  typeof window === 'undefined' ? undefined : (window as unknown as { Capacitor?: CapacitorBridge }).Capacitor;

/** true somente dentro do app Android. */
export function isNativeApp(): boolean {
  const c = bridge();
  return !!c?.isNativePlatform?.() && typeof c.nativePromise === 'function';
}

function call<T = unknown>(plugin: string, method: string, options?: unknown): Promise<T> {
  const c = bridge();
  if (!c?.nativePromise) return Promise.reject(new Error('Recurso disponível só no app'));
  return c.nativePromise(plugin, method, options) as Promise<T>;
}

// Blocos múltiplos de 3 bytes: o base64 de cada pedaço se concatena sem corromper o arquivo.
const CHUNK = 3 * 256 * 1024;

function toBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] ?? '');
    r.onerror = () => reject(r.error ?? new Error('Falha ao ler arquivo'));
    r.readAsDataURL(blob);
  });
}

/** Grava o blob no cache do app (em pedaços, para laudos grandes) e devolve a URI do arquivo. */
async function writeToCache(blob: Blob, filename: string): Promise<string> {
  const path = `vistoria/${filename}`;
  let uri = '';
  for (let off = 0, first = true; off < blob.size || first; off += CHUNK, first = false) {
    const data = await toBase64(blob.slice(off, off + CHUNK));
    if (first) {
      const res = await call<{ uri: string }>('Filesystem', 'writeFile', { path, data, directory: 'CACHE', recursive: true });
      uri = res.uri;
    } else {
      await call('Filesystem', 'appendFile', { path, data, directory: 'CACHE' });
    }
  }
  return uri;
}

function webDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Baixa (web) ou abre a folha de compartilhamento do Android (app) para salvar/enviar o arquivo. */
export async function saveFile(blob: Blob, filename: string): Promise<'downloaded' | 'shared'> {
  if (!isNativeApp()) {
    webDownload(blob, filename);
    return 'downloaded';
  }
  const uri = await writeToCache(blob, filename);
  await call('Share', 'share', { title: filename, url: uri, dialogTitle: 'Salvar ou enviar' });
  return 'shared';
}

/**
 * Abre o documento HTML para ler/imprimir.
 * Web: nova aba (o usuário usa Ctrl+P). App: tela de impressão do Android, que já tem "Salvar como PDF".
 */
export async function openHtmlDocument(html: string, name: string): Promise<'tab' | 'print'> {
  if (isNativeApp()) {
    const uri = await writeToCache(new Blob([html], { type: 'text/html' }), `${name}.html`);
    await call('HtmlPrint', 'print', { path: uri, name });
    return 'print';
  }
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  window.open(url, '_blank', 'noopener');
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  return 'tab';
}

/** Abre um link em outro app (WhatsApp, navegador...). */
export function openExternal(url: string) {
  if (isNativeApp()) {
    // O Capacitor entrega URLs de outros domínios ao Android (abre o app certo).
    window.location.href = url;
    return;
  }
  window.open(url, '_blank', 'noopener');
}

/** Texto do aviso depois de abrir o laudo. */
export function openedHint(kind: 'tab' | 'print'): string {
  return kind === 'print' ? 'Escolha "Salvar como PDF" na tela de impressão' : 'Use Ctrl+P para salvar como PDF';
}
