const { withSentryConfig } = require("@sentry/nextjs");
const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../../'),
  reactStrictMode: true,
  transpilePackages: ['@repo/ui', '@repo/auth', '@repo/database', '@repo/utils'],

  // Exclude server-only packages from client bundle
  serverComponentsExternalPackages: ['winston', '@repo/utils', '@repo/database', '@repo/auth'],

  // Webpack configuration for Node.js built-ins
  webpack: (config, { isServer }) => {
    // Add fallbacks for Node.js built-in modules in client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        os: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },

  experimental: {
    // 启用 instrumentation 以支持优雅关闭
    instrumentationHook: true,
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
    // 禁用图片优化以避免sharp依赖问题
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'wuqq-obsidian.oss-cn-shanghai.aliyuncs.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.taoguba.com.cn',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the Sentry DSN is configured in the environment variables.
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
};

// Make sure adding Sentry options is the last code to run before exporting
module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
// Trigger deployment - 2026年02月12日 19:05:05
