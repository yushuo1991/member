'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/membership';

interface MobileProductCardProps {
  product: Product;
}

export default function MobileProductCard({ product }: MobileProductCardProps) {
  // 价格类型标签
  const getPriceTypeLabel = () => {
    switch (product.priceType) {
      case 'membership':
        return { text: '会员专属', bg: 'bg-[#ff8c42]/90', textColor: 'text-white' };
      case 'standalone':
        return { text: '单独购买', bg: 'bg-blue-500/90', textColor: 'text-white' };
      case 'both':
        return { text: '会员/单购', bg: 'bg-purple-500/90', textColor: 'text-white' };
      default:
        return null;
    }
  };

  const priceTypeLabel = getPriceTypeLabel();

  return (
    <Link
      href={`/products/${product.slug}`}
      className="block w-[280px] flex-shrink-0 rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm active:scale-[0.98] transition-transform"
    >
      {/* 图片区域 + 浮动标签 */}
      <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="280px"
            className="object-contain"
            priority={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-5xl bg-gradient-to-br from-[#ff8c42] to-[#e67d3a]">
            {product.icon}
          </div>
        )}

        {/* 浮动标签 - 左上角 */}
        {priceTypeLabel && (
          <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-medium ${priceTypeLabel.bg} ${priceTypeLabel.textColor} backdrop-blur-sm`}>
            {priceTypeLabel.text}
          </span>
        )}

        {/* 试用标签 - 右上角 */}
        {product.trialEnabled && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-medium bg-green-500/90 text-white backdrop-blur-sm">
            可试用{product.trialCount}次
          </span>
        )}
      </div>

      {/* 内容区域 - 紧贴图片 */}
      <div className="px-4 py-3">
        <h3 className="text-[15px] font-semibold text-gray-900 leading-snug line-clamp-1">
          {product.name}
        </h3>
        <p className="mt-1 text-xs text-gray-500 leading-relaxed line-clamp-2">
          {product.description}
        </p>

        {/* 特性标签 */}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {product.features.slice(0, 3).map((feature, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-50 text-[11px] text-gray-600"
            >
              {feature.length > 6 ? feature.slice(0, 6) + '…' : feature}
            </span>
          ))}
          {product.features.length > 3 && (
            <span className="inline-flex items-center px-2 py-0.5 text-[11px] text-gray-400">
              +{product.features.length - 3}
            </span>
          )}
        </div>

        {/* 底部操作提示 */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-[#ff8c42] font-medium">了解详情</span>
          <svg className="w-4 h-4 text-[#ff8c42]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
