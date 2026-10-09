import type { CapacitorConfig } from '@capacitor/cli';

/**
 * O app é uma "casca" nativa que abre o sistema publicado.
 * Troque CAP_SERVER_URL pelo endereço real do site (sem barra no final) antes de gerar o APK:
 *   set CAP_SERVER_URL=https://seu-dominio.com.br   (Windows)
 */
const SERVER = (process.env.CAP_SERVER_URL || 'https://imobweb2.vercel.app').replace(/\/+$/, '');
const START_PATH = process.env.CAP_START_PATH || '/admin/vistoria';
const host = new URL(SERVER).host;

const config: CapacitorConfig = {
  appId: 'com.imobweb.vistoria',
  appName: 'Vistoria imobWeb',
  webDir: 'www',
  backgroundColor: '#0a0a0f',
  server: {
    url: `${SERVER}${START_PATH}`,
    cleartext: false,
    // Supabase (login) e o próprio site ficam dentro do app; o resto abre em outro app
    allowNavigation: [host, '*.supabase.co'],
    errorPath: 'offline.html',
  },
  android: {
    allowMixedContent: false,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 600,
      launchAutoHide: true,
      backgroundColor: '#0a0a0f',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    // Respeita a barra de status e a de navegação (tela cheia do Android 15+)
    SystemBars: { insetsHandling: 'native', style: 'DARK' },
  },
};

export default config;
