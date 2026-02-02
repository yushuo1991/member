'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/membership';

interface MobileProductCardProps {
  product: Product;
}

export default function MobileProductCard({ product }: MobileProductCardProps) {
  const shouldOpenInNewTab = product.slug === 'bk' || product.slug === 'fuplan';

  // 根据产品类型设置动态背景颜色
  const getBlobColor = () => {
    const colors = [
      '#ff8c42', // 主题橙色
      '#e67d3a', // 深橙色
      '#ffa366', // 浅橙色
      '#ff7629', // 活力橙
    ];
    // 根据产品slug生成一致的颜色
    const index = product.slug.length % colors.length;
    return colors[index];
  };

  return (
    <div className="mobile-product-card">
      {/* 动态背景 blob */}
      <div
        className="blob"
        style={{
          backgroundColor: getBlobColor(),
          '--blob-color': getBlobColor()
        } as React.CSSProperties}
      />

      {/* 玻璃态背景 */}
      <div className="bg" />

      {/* 内容区域 */}
      <div className="card-content">
        {/* 产品图片 - 更大更突出 */}
        <div className="product-image">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={150}
              height={150}
              className="rounded-3xl object-cover shadow-xl"
            />
          ) : (
            <div className="w-[150px] h-[150px] rounded-3xl bg-gradient-to-br from-[#ff8c42] to-[#e67d3a] flex items-center justify-center text-6xl shadow-xl">
              {product.icon}
            </div>
          )}
        </div>

        {/* 产品信息 - 精致排版 */}
        <div className="product-info">
          <h3 className="product-title">{product.name}</h3>
          <p className="product-description">{product.description}</p>

          {/* 价格标签 - 更小 */}
          {product.priceType === 'standalone' && product.standalonePrices?.monthly && (
            <div className="price-tag">
              ¥{product.standalonePrices.monthly}/月
            </div>
          )}

          {product.priceType === 'membership' && (
            <div className="membership-tag">
              会员专属
            </div>
          )}
        </div>

        {/* 查看详情按钮 - 更小 */}
        <Link
          href={`/products/${product.slug}`}
          className="view-details-btn"
          {...(shouldOpenInNewTab && {
            target: '_blank',
            rel: 'noopener noreferrer'
          })}
        >
          查看详情
          <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <style jsx>{`
        .mobile-product-card {
          position: relative;
          width: 280px;
          height: 420px;
          border-radius: 24px;
          overflow: hidden;
          flex-shrink: 0;
          box-shadow: 20px 20px 60px rgba(190, 190, 190, 0.3),
                      -20px -20px 60px rgba(255, 255, 255, 0.8);
        }

        .blob {
          position: absolute;
          z-index: 1;
          top: 50%;
          left: 50%;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          opacity: 0.7;
          filter: blur(50px);
          animation: blob-bounce 8s infinite ease-in-out;
        }

        @keyframes blob-bounce {
          0% {
            transform: translate(-100%, -100%) translate3d(0, 0, 0);
          }
          25% {
            transform: translate(-100%, -100%) translate3d(120%, 0, 0);
          }
          50% {
            transform: translate(-100%, -100%) translate3d(120%, 120%, 0);
          }
          75% {
            transform: translate(-100%, -100%) translate3d(0, 120%, 0);
          }
          100% {
            transform: translate(-100%, -100%) translate3d(0, 0, 0);
          }
        }

        .bg {
          position: absolute;
          top: 8px;
          left: 8px;
          right: 8px;
          bottom: 8px;
          z-index: 2;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(24px);
          border-radius: 20px;
          border: 2px solid rgba(255, 255, 255, 0.8);
        }

        .card-content {
          position: relative;
          z-index: 3;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 32px 20px 24px;
          gap: 14px;
        }

        .product-image {
          margin-bottom: 6px;
        }

        .product-info {
          text-align: center;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          max-width: 100%;
          padding: 0 4px;
        }

        .product-title {
          font-size: 17px;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
          line-height: 1.4;
          letter-spacing: -0.01em;
        }

        .product-description {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.6;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          max-width: 100%;
          letter-spacing: 0.01em;
        }

        .price-tag {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          background: linear-gradient(135deg, #ff8c42 0%, #e67d3a 100%);
          color: white;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
          margin-top: 2px;
        }

        .membership-tag {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          background: rgba(255, 140, 66, 0.1);
          color: #ff8c42;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
          margin-top: 2px;
        }

        .view-details-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 28px;
          background: linear-gradient(135deg, #ff8c42 0%, #e67d3a 100%);
          color: white;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(255, 140, 66, 0.3);
          cursor: pointer;
          margin-top: auto;
        }

        .view-details-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 140, 66, 0.4);
        }

        .view-details-btn:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
