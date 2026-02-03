'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product, MembershipLevel } from '@/types/membership';
import { MEMBERSHIP_LEVELS } from '@/lib/membership-levels';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const levelConfig = product.requiredLevel !== 'none'
    ? MEMBERSHIP_LEVELS[product.requiredLevel]
    : null;

  // 判断是否需要在新窗口打开（板块节奏系统和复盘系统）
  const shouldOpenInNewTab = product.slug === 'bk' || product.slug === 'fuplan';

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
        return { text: '会员专属', color: 'text-[#ff8c42]' };
      case 'standalone':
        return { text: '单独购买', color: 'text-blue-600' };
      case 'both':
        return { text: '会员/单购', color: 'text-purple-600' };
      default:
        return null;
    }
  };

  const priceTypeLabel = getPriceTypeLabel();

  const linkProps = shouldOpenInNewTab
    ? { target: '_blank' as const, rel: 'noopener noreferrer' }
    : {};

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#ff8c42]/30 transition-all duration-300 flex flex-col">
      {/* 产品图片区域 - 可点击 */}
      <Link
        href={`/products/${product.slug}`}
        {...linkProps}
        className="relative w-full aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden cursor-pointer"
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain group-hover:scale-[1.02] transition-transform duration-500"
            priority={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#ff8c42] to-[#e67d3a]">
            <span className="text-6xl">{product.icon}</span>
          </div>
        )}

        {/* 悬浮遮罩 */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </Link>

      {/* 内容区域 */}
      <div className="flex flex-col p-5 border-t border-gray-100">
        {/* 标签行 */}
        <div className="flex items-center justify-between mb-3">
          {priceTypeLabel && (
            <span className={`text-xs font-medium ${priceTypeLabel.color}`}>
              {priceTypeLabel.text}
            </span>
          )}
          {product.trialEnabled && (
            <span className="text-xs font-medium text-green-600">
              可试用{product.trialCount}次
            </span>
          )}
        </div>

        {/* 标题 - 可点击 */}
        <Link
          href={`/products/${product.slug}`}
          {...linkProps}
          className="block"
        >
          <h3 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-[#ff8c42] transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* 简短描述 */}
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">
          {product.description}
        </p>

        {/* 分隔线 */}
        <div className="w-full h-[1px] bg-gray-100 mb-4" />

        {/* 功能特性 - 简约展示 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {product.features.slice(0, 3).map((feature, index) => (
            <span
              key={index}
              className="inline-flex items-center text-xs text-gray-500"
            >
              <svg className="w-3 h-3 text-[#ff8c42] mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {feature.length > 8 ? feature.slice(0, 8) + '...' : feature}
            </span>
          ))}
          {product.features.length > 3 && (
            <span className="text-xs text-gray-400">
              +{product.features.length - 3}
            </span>
          )}
        </div>

        {/* 底部：价格/等级 + 按钮 */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex-shrink-0">
            {product.priceType === 'membership' && levelConfig && (
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${levelColors[product.requiredLevel]}`}>
                {levelConfig.name}
              </span>
            )}
            {(product.priceType === 'standalone' || product.priceType === 'both') && product.standalonePrices && (
              <span className="text-sm font-semibold text-gray-900">
                ¥{product.standalonePrices.lifetime || product.standalonePrices.yearly || product.standalonePrices.monthly}
                <span className="text-xs text-gray-400 font-normal ml-1">起</span>
              </span>
            )}
          </div>

          <Link
            href={`/products/${product.slug}`}
            {...linkProps}
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-[#ff8c42] hover:text-white transition-all duration-300"
          >
            了解详情
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
