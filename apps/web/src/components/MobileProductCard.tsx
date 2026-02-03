'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/membership';

interface MobileProductCardProps {
  product: Product;
}

export default function MobileProductCard({ product }: MobileProductCardProps) {
  const shouldOpenInNewTab = product.slug === 'bk' || product.slug === 'fuplan';

  const linkProps = shouldOpenInNewTab
    ? { target: '_blank' as const, rel: 'noopener noreferrer' }
    : {};

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

  return (
    <div className="mobile-product-card">
      {/* 产品图片区域 - 可点击 */}
      <Link
        href={`/products/${product.slug}`}
        {...linkProps}
        className="image-section"
      >
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
          <div className="placeholder-icon">
            {product.icon}
          </div>
        )}
      </Link>

      {/* 内容区域 */}
      <div className="content-section">
        {/* 标签行 */}
        <div className="tags-row">
          {priceTypeLabel && (
            <span className={`tag ${priceTypeLabel.color}`}>
              {priceTypeLabel.text}
            </span>
          )}
          {product.trialEnabled && (
            <span className="tag text-green-600">
              可试用{product.trialCount}次
            </span>
          )}
        </div>

        {/* 标题 - 可点击 */}
        <Link href={`/products/${product.slug}`} {...linkProps}>
          <h3 className="product-title">{product.name}</h3>
        </Link>

        {/* 简短描述 */}
        <p className="product-description">{product.description}</p>

        {/* 分隔线 */}
        <div className="separator" />

        {/* 功能特性 - 简约展示 */}
        <div className="features-row">
          {product.features.slice(0, 2).map((feature, index) => (
            <span key={index} className="feature-item">
              <svg className="feature-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {feature.length > 6 ? feature.slice(0, 6) + '...' : feature}
            </span>
          ))}
          {product.features.length > 2 && (
            <span className="feature-more">+{product.features.length - 2}</span>
          )}
        </div>

        {/* 底部按钮 */}
        <Link
          href={`/products/${product.slug}`}
          {...linkProps}
          className="view-btn"
        >
          了解详情
          <svg className="btn-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <style jsx>{`
        .mobile-product-card {
          width: 280px;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          flex-shrink: 0;
          border: 1px solid #f1f3f4;
          display: flex;
          flex-direction: column;
        }

        .image-section {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          display: block;
        }

        .placeholder-icon {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4rem;
          background: linear-gradient(135deg, #ff8c42 0%, #e67d3a 100%);
        }

        .content-section {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          border-top: 1px solid #f1f3f4;
        }

        .tags-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 20px;
        }

        .tag {
          font-size: 11px;
          font-weight: 500;
        }

        .product-title {
          font-size: 15px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-description {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.5;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .separator {
          width: 100%;
          height: 1px;
          background: #f1f3f4;
        }

        .features-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }

        .feature-item {
          display: inline-flex;
          align-items: center;
          font-size: 11px;
          color: #6b7280;
        }

        .feature-icon {
          width: 12px;
          height: 12px;
          color: #ff8c42;
          margin-right: 3px;
          flex-shrink: 0;
        }

        .feature-more {
          font-size: 11px;
          color: #9ca3af;
        }

        .view-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 20px;
          background: #f3f4f6;
          color: #374151;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.3s ease;
          margin-top: 4px;
        }

        .view-btn:active {
          background: #ff8c42;
          color: white;
        }

        .btn-arrow {
          width: 14px;
          height: 14px;
          margin-left: 4px;
        }
      `}</style>
    </div>
  );
}
