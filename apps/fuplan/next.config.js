const { withSentryConfig } = require("@sentry/nextjs");
const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',  // 生产环境启用standalone模式
  outputFileTracingRoot: path.join(__dirname, '../../'),
  reactStrictMode: true,
  transpilePackages: ['@repo/ui', '@repo/auth', '@repo/database', '@repo/utils'],

  experimental: {
    // 启用 instrumentation 以支持优雅关闭
    instrumentationHook: true,
  },

  // 配置静态资源
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },

  // 配置环境变量
  env: {
    APP_PORT: '3003',
    APP_NAME: '宇硕复盘系统',
  },
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  reactComponentAnnotation: {
    enabled: true,
  },
  tunnelRoute: "/monitoring",
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
