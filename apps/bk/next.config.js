const { withSentryConfig } = require("@sentry/nextjs");
const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',  // 生产环境启用standalone模式
  outputFileTracingRoot: path.join(__dirname, '../../'),
  reactStrictMode: true,
  swcMinify: true,

  experimental: {
    // 启用 instrumentation 以支持优雅关闭
    instrumentationHook: true,
  },

  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
      {
        // 允许所有页面被iframe嵌入
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self' https://yushuofupan.com https://*.yushuofupan.com" },
        ],
      },
    ]
  },

  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'https://apphq.longhuvip.com/:path*',
      },
    ]
  },

  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  },

  images: {
    domains: ['image.sinajs.cn'],
    unoptimized: true,
  },

  typescript: {
    ignoreBuildErrors: true,  // 暂时忽略类型错误，待后续完善
  },
  eslint: {
    ignoreDuringBuilds: true,  // 构建时忽略ESLint错误
  },

  transpilePackages: ['@repo/ui', '@repo/auth', '@repo/database', '@repo/utils'],
}

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

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions)
