'use client';

import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function UpgradePage() {
  const currentLevel = {
    name: '基础会员',
    icon: '⭐',
  };

  const requiredLevel = {
    name: '专业会员',
    icon: '💎',
  };

  const features = [
    { name: '500GB 存储空间', current: false, required: true },
    { name: '无限项目数量', current: false, required: true },
    { name: '优先技术支持', current: false, required: true },
    { name: '高级数据分析', current: false, required: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="pt-24 pb-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              需要升级会员等级
            </h1>
            <p className="text-xl text-gray-600">
              抱歉，当前功能需要更高的会员等级才能访问
            </p>
          </div>

          {/* Level Comparison */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Current Level */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">{currentLevel.icon}</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  {currentLevel.name}
                </h3>
                <p className="text-gray-600">您当前的等级</p>
              </div>
            </div>

            {/* Required Level */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 shadow-sm border-2 border-purple-300">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">{requiredLevel.icon}</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  {requiredLevel.name}
                </h3>
                <p className="text-purple-700 font-medium">需要的等级</p>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">专业会员专享功能</h3>
            <ul className="space-y-4">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-900 font-medium">{feature.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-[#007AFF] to-[#0051D5] rounded-2xl p-8 text-center text-white shadow-lg">
            <h3 className="text-2xl font-semibold mb-4">立即升级，解锁全部功能</h3>
            <p className="mb-8 opacity-90">
              升级到专业会员，享受更多高级功能和服务
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/member"
                className="px-8 py-3 bg-white text-[#007AFF] rounded-full hover:bg-gray-100 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
              >
                使用激活码升级
              </Link>
              <Link
                href="/"
                className="px-8 py-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all duration-300 font-semibold"
              >
                查看升级方案
              </Link>
            </div>
          </div>

          {/* Back Link */}
          <div className="text-center mt-8">
            <Link
              href="/member"
              className="text-gray-600 hover:text-gray-900 transition-colors duration-300 inline-flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              返回会员中心
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
