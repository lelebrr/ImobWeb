/**
 * ============================================
 * NEXT.JS CONFIG - IMOBWEB MERGE COMPLETO
 * ============================================
 * Combina configurações de todas as IAs:
 * - IA 1: Images, redirects
 * - IA 2: Headers, rewrites
 * - IA 3: PWA headers, service worker
 * - IA 4: Security headers, CSP, monitoring
 * ============================================
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ============================================
  // IA 1 - CORE CONFIG
  // ============================================
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  transpilePackages: [
    "swagger-ui-react",
    "swagger-client",
    "@swagger-api/apidom-core",
    "@swagger-api/apidom-ns-openapi-3-1",
    "@swagger-api/apidom-error",
  ],

  // ============================================
  // IA 1 - IMAGES CONFIG
  // ============================================
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "**.google.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.googlesyndication.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.doubleclick.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.iherb.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // ============================================
  // IA 2 - EXPERIMENTAL FEATURES
  // ============================================
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "date-fns",
      "framer-motion",
    ],
  },

  // ============================================
  // IA 3 - PWA CONFIG
  // ============================================
  // PWA is handled via service worker registration in app
  // Manifest is served from public/manifest.json

  // ============================================
  // IA 4 - TYPESCRIPT CONFIG
  // ============================================
  typescript: {
    ignoreBuildErrors: false,
  },

  // ============================================
  // IA 4 - ESLINT CONFIG
  // ============================================
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ["app", "components", "lib", "types"],
  },

  // ============================================
  // IA 4 - SECURITY HEADERS (async)
  // ============================================
  async headers() {
    return [
      // ============================================
      // IA 4 - MAIN SECURITY HEADERS
      // ============================================
      {
        source: "/(.*)",
        headers: [
          // Basic security headers
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },

          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'unsafe-hashes' https://app.posthog.com https://us.i.posthog.com https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self'",
              "img-src 'self' blob: data: https: https://app.posthog.com",
              "media-src 'self' blob:",
              "connect-src 'self' https://*.supabase.co https://api.stripe.com https://api.openai.com https://app.posthog.com https://us.i.posthog.com https://va.vercel-scripts.com",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
              "worker-src 'self' blob:",
              "manifest-src 'self'",
              "object-src 'self' data:",
            ].join("; "),
          },
        ],
      },

      // ============================================
      // IA 3 - PWA HEADERS
      // ============================================
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
          {
            key: "Content-Type",
            value: "application/javascript",
          },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
      {
        source: "/offline.html",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
        ],
      },
      {
        source: "/icons/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000",
          },
        ],
      },

      // ============================================
      // IA 2 - API HEADERS
      // ============================================
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.ALLOWED_ORIGINS || "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "Content-Type, Authorization, X-Requested-With, X-HTTP-Method-Override",
          },
          {
            key: "Access-Control-Max-Age",
            value: "86400",
          },
          {
            key: "X-RateLimit-Limit",
            value: "100",
          },
          {
            key: "X-RateLimit-Window",
            value: "60s",
          },
        ],
      },

      // ============================================
      // IA 2 - STRIPE WEBHOOKS
      // ============================================
      {
        source: "/api/webhooks/stripe/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },

      // ============================================
      // IA 4 - PUBLIC API HEADERS
      // ============================================
      {
        source: "/api/public/v1/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, X-API-Key",
          },
          {
            key: "X-API-Version",
            value: "v1",
          },
        ],
      },

      // ============================================
      // IA 4 - DEVELOPMENT TOOLS (dev only)
      // ============================================
      ...(process.env.NODE_ENV === "development"
        ? [
          {
            source: "/:path*",
            headers: [
              {
                key: "X-Debug-Mode",
                value: "true",
              },
            ],
          },
        ]
        : []),
    ];
  },

  // ============================================
  // IA 2 - REDIRECTS
  // ============================================
  async redirects() {
    return [
      // Redirect old routes to new ones
      {
        source: "/imovel/:slug",
        destination: "/properties/:slug",
        permanent: true,
      },

      // Marketing redirects
      {
        source: "/planos",
        destination: "/pricing",
        permanent: true,
      },
      {
        source: "/precos",
        destination: "/pricing",
        permanent: true,
      },

      // Auth redirects
      {
        source: "/signin",
        destination: "/login",
        permanent: true,
      },
      {
        source: "/signup",
        destination: "/register",
        permanent: true,
      },
    ];
  },

  // ============================================
  // IA 2 - REWRITES
  // ============================================
  async rewrites() {
    return [
      // Rewrite for API proxy (if needed)
      {
        source: "/proxy/:path*",
        destination: "/api/proxy/:path*",
      },

      // Static rewrite for offline page
      {
        source: "/offline",
        destination: "/offline.html",
      },

      // Health check rewrite
      {
        source: "/health",
        destination: "/api/devops/health",
      },
    ];
  },

  // ============================================
  // IA 4 - WEBPACK CONFIG
  // ============================================
  webpack: (config, { dev, isServer, webpack }) => {
    // Preserve existing aliases
    config.resolve.alias = {
      ...config.resolve.alias,
    };

    // ============================================
    // SUPPRESS OPENTELEMETRY CRITICAL DEPENDENCY WARNING
    // The @opentelemetry/instrumentation package uses dynamic requires
    // that trigger false-positive "critical dependency" warnings.
    // ============================================
    config.module = {
      ...config.module,
      exprContextCritical: false,
    };

    // ============================================
    // FIX SWAGGER MJS RESOLUTION
    // ============================================
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
      resolve: {
        fullySpecified: false,
      },
    });

    // ============================================
    // IA 4 - MONITORING PLUGINS
    // ============================================
    if (!dev && !isServer) {
      // Add monitoring plugins here if needed
    }

    return config;
  },
};

export default nextConfig;