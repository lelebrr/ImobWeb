import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
  './lib/i18n/config.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Otimizações específicas para Vercel
  output: 'standalone',
  trailingSlash: true,

  // Headers de segurança e performance otimizados para Vercel
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Performance headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
          // Cache otimizado para Vercel
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          // Link Header para prefetching
          {
            key: 'Link',
            value: '<https://fonts.googleapis.com>; rel=preconnect; crossorigin',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      // Headers específicos para assets estáticos
      {
        source: '/(.*)\\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Otimizações de Compilação e Runtime para 2026
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-icons',
      'shadcn-ui',
      'recharts',
      'zustand',
    ],
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['imobweb.com', '*.imobweb.com'],
    },
    reactCompiler: false,
  },
  outputFileTracingRoot: process.cwd(),

  // Configurações de servidor externo para Vercel
  serverExternalPackages: ['@prisma/client'],

  // State-of-the-Art Image Optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    minimumCacheTTL: 31536000,
    // Otimização para Vercel
    unoptimized: false,
  },

  // Compressão otimizada para Vercel
  compress: true,

  // Configurações de ambiente para Vercel
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Redirecionamentos e rewrites (serão configurados em vercel.json)
  async rewrites() {
    return [
      {
        source: '/api/public/:path*',
        destination: '/api/public/v1/:path*',
      },
    ];
  },
};

export default withNextIntl(nextConfig);

