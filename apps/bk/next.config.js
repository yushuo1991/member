/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone',  // 暂时禁用standalone模式 (Windows symlink权限问题)
  reactStrictMode: true,
  swcMinify: true,

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

module.exports = nextConfig
