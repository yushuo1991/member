/** @type {import('next').NextConfig} */
const nextConfig = {
  // Windows环境下暂时禁用standalone以避免符号链接权限问题
  // 生产环境（Linux）可以启用
  // output: 'standalone',
  reactStrictMode: true,
  transpilePackages: ['@repo/ui', '@repo/auth', '@repo/database', '@repo/utils'],

  // Security headers
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
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Environment variables
  env: {
    APP_NAME: '心理测评系统',
    APP_PORT: '3004',
  },
};

module.exports = nextConfig;
