/**
 * Next.js性能优化配置
 *
 * 将这些配置添加到您的 next.config.js 文件中
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. 启用生产优化
  reactStrictMode: true,
  swcMinify: true, // 使用SWC进行更快的压缩

  // 2. 图片优化
  images: {
    formats: ['image/avif', 'image/webp'], // 使用现代图片格式
    minimumCacheTTL: 31536000, // 图片缓存1年
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // 响应式图片尺寸
  },

  // 3. 编译优化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // 生产环境移除console
  },

  // 4. 压缩配置
  compress: true, // 启用gzip压缩

  // 5. 输出配置（如果使用独立部署）
  output: 'standalone', // 减小部署体积

  // 6. 实验性功能
  experimental: {
    optimizeCss: true, // CSS优化
    optimizePackageImports: ['lucide-react', '@/components'], // 优化包导入
  },

  // 7. 生产Source Map（可选，仅调试时开启）
  productionBrowserSourceMaps: false, // 关闭可减小bundle大小

  // 8. 页面扩展
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // 9. 重定向优化
  async redirects() {
    return [
      // 如果有不必要的重定向，可以在这里优化
    ]
  },

  // 10. Headers优化
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
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

/**
 * 优化建议：
 *
 * 1. 代码分割
 *    - 使用动态导入 dynamic import
 *    - 例: const HeavyComponent = dynamic(() => import('./HeavyComponent'))
 *
 * 2. 数据预加载
 *    - 使用 getStaticProps 进行静态生成（SSG）
 *    - 使用 getServerSideProps 时添加缓存
 *
 * 3. 组件懒加载
 *    - 使用 React.lazy() 和 Suspense
 *    - 图片使用 next/image 组件
 *
 * 4. Bundle分析
 *    - 运行: npm install @next/bundle-analyzer
 *    - 在package.json添加: "analyze": "ANALYZE=true next build"
 *
 * 5. 数据库优化
 *    - 添加必要的索引
 *    - 使用数据库连接池
 *    - 实现查询结果缓存（Redis）
 */
