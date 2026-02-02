'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import MobileProductCard from '@/components/MobileProductCard';
import { PRODUCTS, MEMBERSHIP_LEVELS, getMembershipProducts, getStandaloneProducts } from '@/lib/membership-levels';
import type { MembershipLevel } from '@/types/membership';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'all' | 'membership' | 'standalone'>('all');
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 根据tab筛选产品
  const getFilteredProducts = () => {
    switch (activeTab) {
      case 'membership':
        return getMembershipProducts();
      case 'standalone':
        return getStandaloneProducts();
      default:
        return PRODUCTS;
    }
  };

  const filteredProducts = getFilteredProducts();

  // 会员等级（不包括none）
  const membershipTiers = Object.values(MEMBERSHIP_LEVELS).filter(m => m.level !== 'none');

  // 处理移动端卡片滑动
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const cardWidth = 296; // 280px + 16px gap
      const newIndex = Math.round(scrollLeft / cardWidth);
      setActiveCardIndex(newIndex);
    }
  };

  // 滚动到指定卡片
  const scrollToCard = (index: number) => {
    if (scrollContainerRef.current) {
      const cardWidth = 296;
      scrollContainerRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section - 响应式 */}
      <section className="relative pt-20 pb-12 sm:pt-24 sm:pb-16 md:pt-32 md:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* 移动端装饰性背景 */}
        <div className="absolute inset-0 lg:hidden pointer-events-none">
          <div className="absolute w-72 h-72 bg-[#ff8c42] rounded-full opacity-10 blur-3xl -top-20 -right-20 animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute w-64 h-64 bg-[#e67d3a] rounded-full opacity-10 blur-3xl -bottom-10 -left-10 animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        </div>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            宇硕短线
            <br />
            <span className="text-[#ff8c42]">交易成长平台</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
            整合板块节奏分析、心理测评、交易复盘等核心系统，
            为短线交易者提供全方位的学习工具与成长支持
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link
              href="/register"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-[#ff8c42] text-white rounded-full hover:bg-[#e67d3a] transition-all duration-300 font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl"
            >
              免费注册体验
            </Link>
            <Link
              href="#products"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gray-100 text-gray-900 rounded-full hover:bg-gray-200 transition-all duration-300 font-semibold text-base sm:text-lg"
            >
              查看全部产品
            </Link>
          </div>
        </div>
      </section>

      {/* Products Section - 移动端滑动卡片 / 桌面端网格 */}
      <section id="products" className="py-12 sm:py-16 md:py-20 bg-gray-50 lg:bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16 px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">产品服务</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
              <span className="hidden lg:inline">专业工具助力交易成长</span>
              <span className="lg:hidden">左右滑动查看更多</span>
            </p>
          </div>

          {/* 桌面端：产品筛选Tab */}
          <div className="hidden lg:flex justify-center mb-8 sm:mb-12 px-4 sm:px-6 lg:px-8">
            <div className="inline-flex bg-white rounded-full p-1 shadow-sm border border-gray-100">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base font-medium transition-all ${
                  activeTab === 'all'
                    ? 'bg-[#ff8c42] text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setActiveTab('membership')}
                className={`px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base font-medium transition-all ${
                  activeTab === 'membership'
                    ? 'bg-[#ff8c42] text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                会员专属
              </button>
              <button
                onClick={() => setActiveTab('standalone')}
                className={`px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base font-medium transition-all ${
                  activeTab === 'standalone'
                    ? 'bg-[#ff8c42] text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                单独购买
              </button>
            </div>
          </div>

          {/* 移动端：滑动卡片展示 */}
          <div className="lg:hidden">
            <div
              ref={scrollContainerRef}
              className="overflow-x-auto overflow-y-hidden scrollbar-hide px-4 pb-4"
              onScroll={handleScroll}
              style={{
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <div className="flex gap-4" style={{ paddingLeft: 'calc(50vw - 140px)' }}>
                {PRODUCTS.map((product) => (
                  <div key={product.slug} style={{ scrollSnapAlign: 'center' }}>
                    <MobileProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>

            {/* 滑动指示器 */}
            <div className="flex justify-center gap-2 mt-6">
              {PRODUCTS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToCard(index)}
                  className={`transition-all duration-300 ${
                    index === activeCardIndex
                      ? 'w-8 h-2 bg-gradient-to-r from-[#ff8c42] to-[#e67d3a] rounded-full'
                      : 'w-2 h-2 bg-gray-300 rounded-full hover:bg-gray-400'
                  }`}
                  aria-label={`查看产品 ${index + 1}`}
                />
              ))}
            </div>

            {/* 快速导航按钮 */}
            <div className="grid grid-cols-2 gap-3 px-4 mt-8">
              <Link
                href="/membership"
                className="flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-[#ff8c42]/5 to-[#e67d3a]/5 border-2 border-[#ff8c42]/20 rounded-2xl hover:border-[#ff8c42]/40 transition-all duration-300"
              >
                <svg className="w-6 h-6 text-[#ff8c42]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span className="text-sm font-semibold text-[#ff8c42]">会员方案</span>
              </Link>
              <Link
                href="/login"
                className="flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-[#ff8c42]/5 to-[#e67d3a]/5 border-2 border-[#ff8c42]/20 rounded-2xl hover:border-[#ff8c42]/40 transition-all duration-300"
              >
                <svg className="w-6 h-6 text-[#ff8c42]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-semibold text-[#ff8c42]">立即登录</span>
              </Link>
            </div>
          </div>

          {/* 桌面端：产品网格 */}
          <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-6 lg:px-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - 响应式 */}
      <section id="pricing" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">会员方案</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">选择适合您的会员等级，解锁更多功能</p>
          </div>

          {/* 价格卡片 - 响应式 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {membershipTiers.map((tier) => (
              <PricingCard key={tier.level} tier={tier} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer - 响应式 */}
      <footer className="bg-white border-t border-gray-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                宇硕<span className="text-[#ff8c42]">短线</span>
              </h3>
              <p className="text-gray-600 text-sm">专业的短线交易学习平台</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">产品</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#products" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    全部产品
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    会员方案
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">支持</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/help" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    帮助中心
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    联系我们
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">法律</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    隐私政策
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    服务条款
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 text-center text-gray-600 text-sm">
            <p>&copy; 2024 宇硕短线. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

// 价格卡片组件
interface PricingCardProps {
  tier: {
    level: MembershipLevel;
    name: string;
    price: number;
    duration: number | null;
    features: string[];
    description: string;
  };
}

function PricingCard({ tier }: PricingCardProps) {
  const isPopular = tier.level === 'quarterly';
  const isLifetime = tier.level === 'lifetime';

  return (
    <div
      className={`relative bg-white rounded-2xl p-6 sm:p-8 shadow-sm border transition-all duration-300 ${
        isPopular
          ? 'border-[#ff8c42] shadow-lg sm:scale-105'
          : 'border-gray-100 hover:border-[#ff8c42]/20 hover:shadow-lg'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-[#ff8c42] text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
            最受欢迎
          </span>
        </div>
      )}
      <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">{tier.name}</h3>
      <p className="text-gray-500 text-sm mb-4">{tier.description}</p>
      <div className="mb-6">
        <span className="text-3xl sm:text-4xl font-bold text-gray-900">¥{tier.price}</span>
        <span className="text-gray-600 ml-2 text-sm sm:text-base">
          / {tier.duration ? `${tier.duration}天` : '永久'}
        </span>
      </div>
      <ul className="space-y-3 mb-6 sm:mb-8">
        {tier.features.map((feature, idx) => (
          <li key={idx} className="flex items-start text-sm sm:text-base">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff8c42] mt-0.5 mr-2 sm:mr-3 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/register"
        className={`block w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-full font-medium transition-all duration-300 text-center text-sm sm:text-base ${
          isPopular || isLifetime
            ? 'bg-[#ff8c42] text-white hover:bg-[#e67d3a] shadow-md hover:shadow-lg'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        }`}
      >
        选择方案
      </Link>
    </div>
  );
}
