import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Vistoria',
  description: 'Vistoria de imóveis com fotos, IA e laudo em PDF — funciona offline.',
  manifest: '/manifest.json',
  icons: { apple: '/icons/apple-touch-icon.png' },
  appleWebApp: { capable: true, title: 'Vistoria', statusBarStyle: 'black-translucent' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0f',
};

export default function VistoriaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
