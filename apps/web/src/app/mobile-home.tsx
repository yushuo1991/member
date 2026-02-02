'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import MobileProductCard from '@/components/MobileProductCard';
import { PRODUCTS } from '@/lib/membership-levels';

export default function MobileHome() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 处理滑动
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const cardWidth = 280 + 16; // 卡片宽度 + gap
      const newIndex = Math.round(scrollLeft / cardWidth);
      setActiveIndex(newIndex);
    }
  };

  // 滚动到指定卡片
  const scrollToCard = (index: number) => {
    if (scrollContainerRef.current) {
      const cardWidth = 280 + 16;
      scrollContainerRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="mobile-home">
      {/* Hero Section - 上半部分 */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            宇硕短线
            <br />
            <span className="hero-highlight">交易成长平台</span>
          </h1>
          <p className="hero-description">
            整合板块节奏分析、心理测评、交易复盘等核心系统，
            为短线交易者提供全方位的学习工具与成长支持
          </p>
          <div className="hero-actions">
            <Link href="/register" className="btn-primary">
              免费注册体验
            </Link>
            <Link href="#products" className="btn-secondary">
              查看产品
            </Link>
          </div>
        </div>

        {/* 装饰性背景 */}
        <div className="hero-decoration">
          <div className="decoration-blob decoration-blob-1" />
          <div className="decoration-blob decoration-blob-2" />
          <div className="decoration-blob decoration-blob-3" />
        </div>
      </section>

      {/* Products Section - 下半部分 */}
      <section id="products" className="products-section">
        <div className="section-header">
          <h2 className="section-title">产品服务</h2>
          <p className="section-subtitle">左右滑动查看更多</p>
        </div>

        {/* 产品卡片滑动容器 */}
        <div
          ref={scrollContainerRef}
          className="products-scroll-container"
          onScroll={handleScroll}
        >
          <div className="products-scroll-content">
            {PRODUCTS.map((product) => (
              <MobileProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>

        {/* 指示器 */}
        <div className="scroll-indicators">
          {PRODUCTS.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === activeIndex ? 'active' : ''}`}
              onClick={() => scrollToCard(index)}
              aria-label={`查看产品 ${index + 1}`}
            />
          ))}
        </div>

        {/* 快速导航 */}
        <div className="quick-nav">
          <Link href="/membership" className="quick-nav-item">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span>会员方案</span>
          </Link>
          <Link href="/login" className="quick-nav-item">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>登录</span>
          </Link>
        </div>
      </section>

      <style jsx>{`
        .mobile-home {
          min-height: 100vh;
          background: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%);
        }

        /* Hero Section */
        .hero-section {
          position: relative;
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 24px 60px;
          overflow: hidden;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 500px;
        }

        .hero-title {
          font-size: 36px;
          font-weight: 800;
          color: #111827;
          line-height: 1.2;
          margin: 0 0 16px;
        }

        .hero-highlight {
          background: linear-gradient(135deg, #ff8c42 0%, #e67d3a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: 15px;
          color: #6b7280;
          line-height: 1.6;
          margin: 0 0 32px;
        }

        .hero-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 32px;
          background: linear-gradient(135deg, #ff8c42 0%, #e67d3a 100%);
          color: white;
          border-radius: 30px;
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          box-shadow: 0 8px 24px rgba(255, 140, 66, 0.3);
          transition: all 0.3s ease;
          cursor: pointer;
          width: 100%;
          max-width: 280px;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(255, 140, 66, 0.4);
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 32px;
          background: rgba(255, 140, 66, 0.1);
          color: #ff8c42;
          border-radius: 30px;
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
          width: 100%;
          max-width: 280px;
        }

        .btn-secondary:hover {
          background: rgba(255, 140, 66, 0.15);
        }

        /* 装饰性背景 */
        .hero-decoration {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1;
          overflow: hidden;
        }

        .decoration-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.15;
          animation: float 20s infinite ease-in-out;
        }

        .decoration-blob-1 {
          width: 300px;
          height: 300px;
          background: #ff8c42;
          top: -100px;
          right: -100px;
          animation-delay: 0s;
        }

        .decoration-blob-2 {
          width: 250px;
          height: 250px;
          background: #e67d3a;
          bottom: -80px;
          left: -80px;
          animation-delay: 7s;
        }

        .decoration-blob-3 {
          width: 200px;
          height: 200px;
          background: #ffa366;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: 14s;
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        /* Products Section */
        .products-section {
          padding: 40px 0 60px;
          background: white;
          border-radius: 40px 40px 0 0;
          margin-top: -20px;
          position: relative;
          z-index: 2;
        }

        .section-header {
          text-align: center;
          padding: 0 24px 32px;
        }

        .section-title {
          font-size: 28px;
          font-weight: 800;
          color: #111827;
          margin: 0 0 8px;
        }

        .section-subtitle {
          font-size: 14px;
          color: #9ca3af;
          margin: 0;
        }

        .products-scroll-container {
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding: 0 24px 24px;
        }

        .products-scroll-container::-webkit-scrollbar {
          display: none;
        }

        .products-scroll-content {
          display: flex;
          gap: 16px;
          padding: 4px;
        }

        /* 指示器 */
        .scroll-indicators {
          display: flex;
          justify-content: center;
          gap: 8px;
          padding: 24px 0;
        }

        .indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #d1d5db;
          border: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .indicator.active {
          width: 24px;
          border-radius: 4px;
          background: linear-gradient(135deg, #ff8c42 0%, #e67d3a 100%);
        }

        /* 快速导航 */
        .quick-nav {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          padding: 0 24px;
          margin-top: 16px;
        }

        .quick-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 20px;
          background: linear-gradient(135deg, rgba(255, 140, 66, 0.05) 0%, rgba(230, 125, 58, 0.05) 100%);
          border: 2px solid rgba(255, 140, 66, 0.1);
          border-radius: 16px;
          color: #ff8c42;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .quick-nav-item:hover {
          background: linear-gradient(135deg, rgba(255, 140, 66, 0.1) 0%, rgba(230, 125, 58, 0.1) 100%);
          border-color: rgba(255, 140, 66, 0.3);
          transform: translateY(-2px);
        }

        /* 响应式调整 */
        @media (min-width: 768px) {
          .hero-title {
            font-size: 48px;
          }

          .hero-description {
            font-size: 17px;
          }

          .hero-actions {
            flex-direction: row;
            gap: 16px;
          }

          .btn-primary,
          .btn-secondary {
            width: auto;
          }
        }
      `}</style>
    </div>
  );
}
