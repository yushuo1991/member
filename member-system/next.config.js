/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,

  experimental: {
    // Standalone output tracing can miss server-only deps; force-include critical ones.
    outputFileTracingIncludes: {
      '/*': [
        './node_modules/mysql2/**',
        './node_modules/bcryptjs/**',
        './node_modules/jsonwebtoken/**',
      ],
    },
  },

  // 环境变量配置
  env: {
    APP_NAME: 'Member System',
    APP_VERSION: '1.0.0',
  },

  // 安全头配置
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self'",
              "frame-ancestors 'self'"
            ].join('; ')
          }
        ],
      },
      {
        // Legacy Fuplan system embeds external CDNs + Supabase; relax CSP only for these static assets.
        source: '/systems/fuplan-legacy/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self' https: data: blob:",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https:",
              "style-src 'self' 'unsafe-inline' https:",
              "img-src 'self' data: https:",
              "font-src 'self' data: https:",
              "connect-src 'self' https:",
              "frame-src 'self' https://www.youtube.com https://trytako.com",
              "frame-ancestors 'self'"
            ].join('; ')
          }
        ],
      },
    ];
  },

  // 编译优化
  compiler: {
    // Keep console logs in production for now (debugging deployments).
    // TODO: set back to `process.env.NODE_ENV === 'production'` after stabilizing.
    removeConsole: false,
  },

  // 图片优化配置
  images: {
    remotePatterns: [],
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = nextConfig;
