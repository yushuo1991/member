/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@repo/ui', '@repo/auth', '@repo/database', '@repo/utils'],
  // Windows环境下暂时禁用standalone以避免符号链接权限问题
  // 生产环境（Linux）可以启用
  // output: 'standalone',

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

module.exports = nextConfig;
