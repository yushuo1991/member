'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getProductBySlug, MEMBERSHIP_LEVELS } from '@/lib/membership-levels';
import type { Product, MembershipLevel } from '@/types/membership';
import { useAuth } from '@/contexts/AuthContext';
import LearningCircleIntro from '@/components/products/LearningCircleIntro';
import EmotionTablesIntro from '@/components/products/EmotionTablesIntro';
import EmotionLayoutIntro from '@/components/products/EmotionLayoutIntro';
import BoardAssistantIntro from '@/components/products/BoardAssistantIntro';
import BKSystemIntro from '@/components/products/BKSystemIntro';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { isAuthenticated } = useAuth();
  const isCustomIntroSlug =
    slug === 'xuexiquan' ||
    slug === 'bankuaizhushou' ||
    slug === 'qingxubiaoge_2018' ||
    slug === 'qingxubiaoge_2022' ||
    slug === 'qingxubiaoge' ||
    slug === 'fupanbanmian' ||
    slug === 'bk';

  const [product, setProduct] = useState<Product | null>(null);
  const [productContent, setProductContent] = useState<any>(null);
  const [trialStatus, setTrialStatus] = useState<{
    trialRemaining: number;
    canUseTrial: boolean;
  } | null>(null);
  const [isTrialLoading, setIsTrialLoading] = useState(false);

  useEffect(() => {
    const p = getProductBySlug(slug);
    if (p) {
      setProduct(p);
    }

    // 从数据库获取产品内容
    fetchProductContent();
  }, [slug]);

  const fetchProductContent = async () => {
    try {
      const response = await fetch(`/api/products/content/${slug}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProductContent(data.data);
        }
      }
    } catch (error) {
      console.error('获取产品内容失败:', error);
      // 如果获取失败，使用代码中的默认数据
    }
  };

  // 获取试用状态
  useEffect(() => {
    if (!product || !product.trialEnabled || !isAuthenticated) return;

    const fetchTrialStatus = async () => {
      try {
        const response = await fetch(`/api/products/trial/${slug}`);
        const data = await response.json();

        if (data.success && data.data) {
          setTrialStatus({
            trialRemaining: data.data.trialRemaining,
            canUseTrial: data.data.canUseTrial
          });
        }
      } catch (error) {
        console.error('获取试用状态失败:', error);
      }
    };

    fetchTrialStatus();
  }, [product, slug, isAuthenticated]);

  // 处理试用按钮点击
  const handleTrialClick = async () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(`/products/${slug}`));
      return;
    }

    if (!trialStatus?.canUseTrial) {
      alert('试用次数已用完');
      return;
    }

    setIsTrialLoading(true);

    // 在点击时立即打开新窗口（避免被浏览器拦截）
    // 试用产品都有外部URL，应该在新窗口打开
    const newWindow = window.open('about:blank', '_blank');
    console.log('[试用] 新窗口已打开:', newWindow);

    try {
      console.log('[试用] 开始调用API:', `/api/products/trial/${slug}`);
      const response = await fetch(`/api/products/trial/${slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      console.log('[试用] API响应状态:', response.status);
      const data = await response.json();
      console.log('[试用] API响应数据:', data);

      if (data.success) {
        // 更新试用状态
        setTrialStatus({
          trialRemaining: data.data.trialRemaining,
          canUseTrial: data.data.trialRemaining > 0
        });

        // 跳转到产品页面
        console.log('[试用] redirectUrl:', data.data.redirectUrl);
        console.log('[试用] newWindow存在:', !!newWindow);

        if (data.data.redirectUrl && newWindow) {
          console.log('[试用] 准备跳转到:', data.data.redirectUrl);
          newWindow.location.href = data.data.redirectUrl;
          console.log('[试用] 跳转命令已执行');
        } else {
          console.error('[试用] 跳转失败 - redirectUrl:', data.data.redirectUrl, 'newWindow:', newWindow);
          if (newWindow) {
            newWindow.close();
          }
          alert('跳转失败：未获取到跳转地址');
        }
      } else {
        console.error('[试用] API返回失败:', data.message);
        // 如果失败，关闭已打开的窗口
        if (newWindow) {
          newWindow.close();
        }
        alert(data.message || '试用失败，请稍后重试');
      }
    } catch (error) {
      console.error('[试用] 捕获异常:', error);
      // 如果出错，关闭已打开的窗口
      if (newWindow) {
        newWindow.close();
      }
      alert('试用失败，请稍后重试');
    } finally {
      setIsTrialLoading(false);
    }
  };

  if (!product) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-24 pb-12 px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">产品未找到</h1>
          <Link href="/" className="text-[#ff8c42] hover:underline">
            返回首页
          </Link>
        </div>
      </main>
    );
  }

  const levelConfig = product.requiredLevel !== 'none'
    ? MEMBERSHIP_LEVELS[product.requiredLevel]
    : null;

  // 等级徽章颜色
  const levelColors: Record<MembershipLevel, string> = {
    none: 'bg-gray-100 text-gray-600',
    monthly: 'bg-blue-100 text-blue-700',
    quarterly: 'bg-green-100 text-green-700',
    yearly: 'bg-purple-100 text-purple-700',
    lifetime: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-6 sm:mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li>
                <Link href="/" className="hover:text-gray-900 transition-colors">
                  首页
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/#products" className="hover:text-gray-900 transition-colors">
                  产品
                </Link>
              </li>
              <li>/</li>
              <li className="text-gray-900 font-medium">{product.name}</li>
            </ol>
          </nav>

          {/* Product Header */}
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            {/* Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#ff8c42] to-[#e67d3a] rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-3xl sm:text-4xl">{product.icon}</span>
            </div>

            <div className="flex-grow">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {/* 价格类型标签 */}
                {product.priceType === 'membership' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#ff8c42]/10 text-[#ff8c42]">
                    会员专属
                  </span>
                )}
                {product.priceType === 'standalone' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    单独购买
                  </span>
                )}
                {product.priceType === 'both' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                    会员/单购
                  </span>
                )}

                {/* 试用标签 */}
                {product.trialEnabled && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    可试用{product.trialCount}次
                  </span>
                )}

                {/* 所需等级 */}
                {product.priceType !== 'standalone' && levelConfig && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${levelColors[product.requiredLevel]}`}>
                    需要{levelConfig.name}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {productContent?.title || product.name}
              </h1>

              {/* Subtitle */}
              {productContent?.subtitle && (
                <p className="text-gray-500 text-sm sm:text-base mb-2">
                  {productContent.subtitle}
                </p>
              )}

              {/* Short Description */}
              <p className="text-gray-600 text-base sm:text-lg">
                {productContent?.description || product.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {slug === 'xuexiquan' && <LearningCircleIntro />}
              {slug === 'bankuaizhushou' && <BoardAssistantIntro />}
              {(slug === 'qingxubiaoge_2018' || slug === 'qingxubiaoge_2022' || slug === 'qingxubiaoge') && (
                <EmotionTablesIntro />
              )}
              {slug === 'fupanbanmian' && <EmotionLayoutIntro />}
              {slug === 'bk' && <BKSystemIntro />}

              {!isCustomIntroSlug && (
                <>
              {/* Detail Description */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">产品介绍</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {productContent?.detail_description || product.detailDescription || product.description}
                </p>
              </div>

              {/* Video */}
              {productContent?.video_url && (
                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">产品视频</h2>
                  <div className="aspect-video">
                    <iframe
                      src={productContent.video_url}
                      className="w-full h-full rounded-lg"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">功能特性</h2>
                <ul className="space-y-3">
                  {(productContent?.features || product.features).map((feature: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-[#ff8c42] mt-0.5 mr-3 flex-shrink-0"
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
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Images */}
              {productContent?.images && productContent.images.length > 0 && (
                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">产品截图</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {productContent.images.map((image: string, index: number) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${product.name} 截图 ${index + 1}`}
                        className="w-full rounded-lg shadow-sm"
                      />
                    ))}
                  </div>
                </div>
              )}
                </>
              )}
            </div>

            {/* Sidebar - Pricing & Actions */}
            <div className="space-y-4">
              {/* Pricing Card */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm sticky top-20">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">价格方案</h2>

                {/* 会员专属产品 */}
                {product.priceType === 'membership' && levelConfig && (
                  <div className="mb-4">
                    <div className="text-gray-600 text-sm mb-2">会员权益包含</div>
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${levelColors[product.requiredLevel]}`}>
                      {levelConfig.name}及以上
                    </div>
                    <div className="mt-3 text-sm text-gray-500">
                      开通会员即可使用
                    </div>
                  </div>
                )}

                {/* 单独购买价格 */}
                {(product.priceType === 'standalone' || product.priceType === 'both') &&
                  product.standalonePrices && slug !== 'qingxubiaoge' && (
                    <div className="space-y-3 mb-4">
                      {product.standalonePrices.monthly && (
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                          <span className="text-gray-700">月付</span>
                          <span className="text-lg font-semibold text-gray-900">
                            ¥{product.standalonePrices.monthly}/月
                          </span>
                        </div>
                      )}
                      {product.standalonePrices.yearly && (
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl border border-green-100">
                          <div>
                            <span className="text-gray-700">年付</span>
                            {product.standalonePrices.monthly && (
                              <span className="ml-2 text-xs text-green-600">
                                省 ¥{product.standalonePrices.monthly * 12 - product.standalonePrices.yearly}
                              </span>
                            )}
                          </div>
                          <span className="text-lg font-semibold text-gray-900">
                            ¥{product.standalonePrices.yearly}/年
                          </span>
                        </div>
                      )}
                      {product.standalonePrices.lifetime && (
                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl border border-purple-100">
                          <span className="text-gray-700">买断</span>
                          <span className="text-lg font-semibold text-gray-900">
                            ¥{product.standalonePrices.lifetime}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                {/* 情绪表格特殊价格 */}
                {slug === 'qingxubiaoge' && (
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl border border-green-200">
                      <div>
                        <div className="font-medium text-gray-900">自2022年数据</div>
                        <div className="text-xs text-gray-600">永久更新</div>
                      </div>
                      <div className="text-lg font-bold text-[#ff8c42]">限时 ¥600</div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl border border-purple-200">
                      <div>
                        <div className="font-medium text-gray-900">自2018年数据</div>
                        <div className="text-xs text-gray-600">永久更新</div>
                      </div>
                      <div className="text-lg font-bold text-[#ff8c42]">限时 ¥999</div>
                    </div>
                    <p className="text-xs text-gray-500 text-center">随数据量积累，价格逐年上涨</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  {/* 试用按钮 */}
                  {product.trialEnabled && (
                    <button
                      onClick={handleTrialClick}
                      disabled={isTrialLoading || !!(trialStatus && !trialStatus.canUseTrial)}
                      className={`w-full py-3 px-6 rounded-full transition-all duration-300 font-medium ${
                        isTrialLoading || (trialStatus && !trialStatus.canUseTrial)
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {isTrialLoading
                        ? '处理中...'
                        : trialStatus
                        ? trialStatus.canUseTrial
                          ? `免费试用（剩${trialStatus.trialRemaining}次）`
                          : '试用已用完'
                        : `免费试用（${product.trialCount}次）`}
                    </button>
                  )}

                  {/* 购买按钮 */}
                  {(product.priceType === 'standalone' || product.priceType === 'both') && (
                    <button
                      onClick={() => {
                        if (!isAuthenticated) {
                          router.push('/login?redirect=' + encodeURIComponent(`/products/${slug}`));
                          return;
                        }
                        // TODO: 打开购买弹窗
                        alert('购买功能开发中...');
                      }}
                      className="w-full py-3 px-6 bg-[#ff8c42] text-white rounded-full hover:bg-[#e67d3a] transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                    >
                      立即购买
                    </button>
                  )}

                  {/* 开通会员/领取权益按钮 */}
                  {product.priceType === 'membership' && (
                    slug === 'circle' ? (
                      <Link
                        href="/products/circle/guide"
                        className="block w-full py-3 px-6 bg-[#ff8c42] text-white rounded-full hover:bg-[#e67d3a] transition-all duration-300 font-medium text-center shadow-md hover:shadow-lg"
                      >
                        领取权益
                      </Link>
                    ) : (
                      <Link
                        href="/register"
                        className="block w-full py-3 px-6 bg-[#ff8c42] text-white rounded-full hover:bg-[#e67d3a] transition-all duration-300 font-medium text-center shadow-md hover:shadow-lg"
                      >
                        开通会员
                      </Link>
                    )
                  )}

                  {/* 外部链接（如果有） */}
                  {product.url && (
                    <button
                      onClick={() => {
                        if (!isAuthenticated) {
                          router.push('/login?redirect=' + encodeURIComponent(`/products/${slug}`));
                          return;
                        }
                        // TODO: 验证权限后跳转
                        router.push(product.url!);
                      }}
                      className="w-full py-3 px-6 bg-gray-100 text-gray-900 rounded-full hover:bg-gray-200 transition-all duration-300 font-medium"
                    >
                      进入使用 →
                    </button>
                  )}
                </div>

                {/* 提示 */}
                {!isAuthenticated && (
                  <p className="mt-4 text-xs text-gray-500 text-center">
                    请先<Link href="/login" className="text-[#ff8c42] hover:underline">登录</Link>
                    或<Link href="/register" className="text-[#ff8c42] hover:underline">注册</Link>
                    以使用产品
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center text-gray-600 text-sm">
          <p>&copy; 2024 宇硕短线. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
