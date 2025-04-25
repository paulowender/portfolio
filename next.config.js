/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: false,
  // disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 ano
        },
      },
    },
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-font-assets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 dias
        },
      },
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60, // 24 horas
        },
      },
    },
    {
      urlPattern: /\/_next\/image\?url=.+$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-image',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60, // 24 horas
        },
      },
    },
    {
      urlPattern: /\.(?:mp3|wav|ogg)$/i,
      handler: 'CacheFirst',
      options: {
        rangeRequests: true,
        cacheName: 'static-audio-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 horas
        },
      },
    },
    {
      urlPattern: /\.(?:mp4|webm)$/i,
      handler: 'CacheFirst',
      options: {
        rangeRequests: true,
        cacheName: 'static-video-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 horas
        },
      },
    },
    {
      urlPattern: /\.(?:js)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-js-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 horas
        },
      },
    },
    {
      urlPattern: /\.(?:css|less)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-style-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 horas
        },
      },
    },
    {
      urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-data',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 horas
        },
      },
    },
    {
      urlPattern: /\/api\/.*$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'apis',
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 24 * 60 * 60, // 24 horas
        },
        networkTimeoutSeconds: 10, // Timeout após 10 segundos
      },
    },
    {
      urlPattern: /.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'others',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 horas
        },
        networkTimeoutSeconds: 10,
      },
    },
  ],
});

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Desabilitar a verificação do ESLint durante o build
    ignoreDuringBuilds: true,
  },

  // Configuração para Docker deployment
  output: 'standalone',

  // Otimizações de imagem
  images: {
    domains: [
      'ryotetscdbdqmzdfbpon.supabase.co',
      'wwxyvknhjtdmfunslpqi.supabase.co',
      'images.unsplash.com',
      'pps.whatsapp.net',
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60, // Cache de imagens por 60 segundos
  },

  // Compressão de arquivos estáticos
  compress: true,

  // Configuração para produção
  // output: 'standalone',

  // Otimizações de produção
  productionBrowserSourceMaps: false, // Desabilitar source maps em produção para reduzir o tamanho do bundle

  // Configuração de cache para builds mais rápidos
  onDemandEntries: {
    // Período (em ms) onde a página compilada deve permanecer em buffer
    maxInactiveAge: 25 * 1000,
    // Número de páginas que devem ser mantidas simultaneamente sem serem descartadas
    pagesBufferLength: 4,
  },

  // Desabilitar PWA

  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PWA_DISABLE: 'true',
  },

  // Configurações de headers HTTP
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

  // Configurações de redirecionamento
  async redirects() {
    return [];
  },

  // Configurações de reescrita
  async rewrites() {
    return [
      {
        source: '/:path*/_rsc/:params*',
        destination: '/api/rsc-handler',
      },
      {
        // Usando a nova sintaxe para capturar parâmetros de consulta
        source: '/:path*',
        has: [
          {
            type: 'query',
            key: '_rsc',
          },
        ],
        destination: '/api/rsc-handler',
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);
