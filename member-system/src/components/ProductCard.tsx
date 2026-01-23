'use client';

import Link from 'next/link';
import { Product, MembershipLevel } from '@/types/membership';
import { MEMBERSHIP_LEVELS } from '@/lib/membership-levels';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const levelConfig = product.requiredLevel !== 'none'
    ? MEMBERSHIP_LEVELS[product.requiredLevel]
    : null;

  // 等级徽章颜色映射
  const levelColors: Record<MembershipLevel, string> = {
    none: 'bg-gray-100 text-gray-600',
    monthly: 'bg-blue-100 text-blue-700',
    quarterly: 'bg-green-100 text-green-700',
    yearly: 'bg-purple-100 text-purple-700',
    lifetime: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
  };

  // 价格类型标签
  const getPriceTypeLabel = () => {
    switch (product.priceType) {
      case 'membership':
        return { text: '会员专属', color: 'bg-[#ff8c42]/10 text-[#ff8c42]' };
      case 'standalone':
        return { text: '单独购买', color: 'bg-blue-100 text-blue-700' };
      case 'both':
        return { text: '会员/单购', color: 'bg-purple-100 text-purple-700' };
      default:
        return null;
    }
  };

  const priceTypeLabel = getPriceTypeLabel();

  return (
    <div className="group bg-white rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#ff8c42]/30 hover:-translate-y-1 flex flex-col h-full">
      {/* 顶部标签区域 */}
      <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
        {/* 价格类型标签 */}
        {priceTypeLabel && (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${priceTypeLabel.color}`}>
            {priceTypeLabel.text}
          </span>
        )}

        {/* 试用标签 */}
        {product.trialEnabled && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            可试用{product.trialCount}次
          </span>
        )}
      </div>

      {/* Icon */}
      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#ff8c42] to-[#e67d3a] rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
        <span className="text-2xl sm:text-3xl">{product.icon}</span>
      </div>

      {/* Title */}
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#ff8c42] transition-colors line-clamp-1">
        {product.name}
      </h3>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-3 sm:mb-4 leading-relaxed line-clamp-2 flex-grow-0">
        {product.description}
      </p>

      {/* 所需等级或价格 */}
      <div className="mb-3 sm:mb-4">
        {product.priceType === 'membership' && levelConfig && (
          <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${levelColors[product.requiredLevel]}`}>
            🔑 需要{levelConfig.name}
          </div>
        )}

        {(product.priceType === 'standalone' || product.priceType === 'both') && product.standalonePrices && (
          <div className="flex flex-wrap gap-1.5">
            {product.standalonePrices.monthly && (
              <span className="inline-block bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                ¥{product.standalonePrices.monthly}/月
              </span>
            )}
            {product.standalonePrices.yearly && (
              <span className="inline-block bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs">
                ¥{product.standalonePrices.yearly}/年
              </span>
            )}
            {product.standalonePrices.lifetime && (
              <span className="inline-block bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs">
                ¥{product.standalonePrices.lifetime}买断
              </span>
            )}
          </div>
        )}
      </div>

      {/* Features - 只在较大屏幕显示 */}
      <ul className="hidden sm:block space-y-2 mb-4 flex-grow">
        {product.features.slice(0, 3).map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg
              className="w-4 h-4 text-[#ff8c42] mt-0.5 mr-2 flex-shrink-0"
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
            <span className="text-gray-600 text-xs">{feature}</span>
          </li>
        ))}
        {product.features.length > 3 && (
          <li className="text-gray-400 text-xs ml-6">
            +{product.features.length - 3} 更多功能...
          </li>
        )}
      </ul>

      {/* 移动端简化features显示 */}
      <div className="sm:hidden text-xs text-gray-500 mb-3 flex-grow">
        {product.features.length}项功能特性
      </div>

      {/* CTA Button */}
      <div className="mt-auto">
        <Link
          href={`/products/${product.slug}`}
          className="block w-full py-2.5 sm:py-3 px-4 sm:px-6 bg-gray-100 text-gray-900 rounded-full hover:bg-[#ff8c42] hover:text-white transition-all duration-300 font-medium text-center text-sm sm:text-base"
        >
          了解详情
        </Link>
      </div>
    </div>
  );
}
