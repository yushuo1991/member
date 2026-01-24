'use client';

import React from 'react';

export type MembershipLevel = 'none' | 'monthly' | 'quarterly' | 'yearly' | 'lifetime';

export interface StandalonePrices {
  monthly?: number;
  yearly?: number;
  lifetime?: number;
}

export type PriceType = 'membership' | 'standalone' | 'both';

export interface Product {
  slug: string;
  name: string;
  description: string;
  detailDescription?: string;
  url?: string;
  icon: string;
  imageUrl?: string;
  requiredLevel: MembershipLevel;
  priceType: PriceType;
  standalonePrices?: StandalonePrices;
  trialEnabled: boolean;
  trialCount: number;
  features: string[];
  sortOrder: number;
}

export interface ProductCardProps {
  product: Product;
  LinkComponent?: React.ComponentType<any>;
  ImageComponent?: React.ComponentType<any>;
  membershipLevels?: Record<MembershipLevel, { name: string; [key: string]: any }>;
}

export function ProductCard({
  product,
  LinkComponent,
  ImageComponent,
  membershipLevels
}: ProductCardProps) {
  const Link = LinkComponent || 'a';
  const Image = ImageComponent || 'img';

  const levelConfig = product.requiredLevel !== 'none' && membershipLevels
    ? membershipLevels[product.requiredLevel]
    : null;

  const shouldOpenInNewTab = product.slug === 'bk' || product.slug === 'fuplan';

  const levelColors: Record<MembershipLevel, string> = {
    none: 'bg-gray-100 text-gray-600',
    monthly: 'bg-blue-100 text-blue-700',
    quarterly: 'bg-green-100 text-green-700',
    yearly: 'bg-purple-100 text-purple-700',
    lifetime: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
  };

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
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-[#ff8c42]/30 hover:-translate-y-1 flex flex-col h-full">
      {/* Product Image */}
      <div className="relative w-full h-40 sm:h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {product.imageUrl ? (
          ImageComponent ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              priority={false}
            />
          ) : (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#ff8c42] to-[#e67d3a]">
            <span className="text-6xl">{product.icon}</span>
          </div>
        )}

        {/* Badges on Image */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {priceTypeLabel && (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm bg-white/90 ${priceTypeLabel.color} shadow-sm`}>
              {priceTypeLabel.text}
            </span>
          )}
          {product.trialEnabled && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm bg-white/90 bg-green-100 text-green-700 shadow-sm">
              可试用{product.trialCount}次
            </span>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-grow p-4 sm:p-5">
        {/* Title */}
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#ff8c42] transition-colors line-clamp-1">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 sm:mb-4 leading-relaxed line-clamp-2 flex-grow-0">
          {product.description}
        </p>

        {/* Required Level or Price */}
        <div className="mb-3 sm:mb-4">
          {product.priceType === 'membership' && levelConfig && (
            <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${levelColors[product.requiredLevel]}`}>
              🔑 需要{levelConfig.name}
            </div>
          )}

          {(product.priceType === 'standalone' || product.priceType === 'both') && product.standalonePrices && (
            <div className="flex flex-wrap gap-1.5">
              {product.standalonePrices.monthly && (
                <span className="inline-block bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                  ¥{product.standalonePrices.monthly}/月
                </span>
              )}
              {product.standalonePrices.yearly && (
                <span className="inline-block bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                  ¥{product.standalonePrices.yearly}/年
                </span>
              )}
              {product.standalonePrices.lifetime && (
                <span className="inline-block bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs font-medium">
                  ¥{product.standalonePrices.lifetime}买断
                </span>
              )}
            </div>
          )}
        </div>

        {/* Features - Desktop */}
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
              <span className="text-gray-600 text-xs leading-relaxed">{feature}</span>
            </li>
          ))}
          {product.features.length > 3 && (
            <li className="text-gray-400 text-xs ml-6">
              +{product.features.length - 3} 更多功能...
            </li>
          )}
        </ul>

        {/* Features - Mobile */}
        <div className="sm:hidden text-xs text-gray-500 mb-3 flex items-center gap-1 flex-grow">
          <svg className="w-3 h-3 text-[#ff8c42]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
          </svg>
          <span>{product.features.length} 项功能特性</span>
        </div>

        {/* CTA Button */}
        <div className="mt-auto">
          <Link
            href={`/products/${product.slug}`}
            className="block w-full py-2.5 sm:py-3 px-4 sm:px-6 bg-gray-100 text-gray-900 rounded-full hover:bg-[#ff8c42] hover:text-white transition-all duration-300 font-medium text-center text-sm sm:text-base shadow-sm hover:shadow-md"
            {...(shouldOpenInNewTab && {
              target: '_blank',
              rel: 'noopener noreferrer'
            })}
          >
            了解详情
          </Link>
        </div>
      </div>
    </div>
  );
}
