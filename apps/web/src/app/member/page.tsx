'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import MemberBadge from '@/components/MemberBadge';
import ActivationForm from '@/components/ActivationForm';
import {
  PRODUCTS,
  MEMBERSHIP_LEVELS,
  canAccessProductByMembership,
  getMembershipProducts,
  getStandaloneProducts
} from '@/lib/membership-levels';
import { TRIAL_PRODUCTS, isTrialSupported } from '@/lib/trial-service';
import { MembershipLevel } from '@/types/membership';
import { useAuth } from '@/contexts/AuthContext';

interface TrialCounts {
  bk: number;
  xinli: number;
  fuplan: number;
}

interface PurchasedProduct {
  productSlug: string;
  purchaseType: string;
  expiresAt: string | null;
}

export default function MemberPage() {
  const { user, isAuthenticated, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [trialCounts, setTrialCounts] = useState<TrialCounts>({ bk: 5, xinli: 5, fuplan: 5 });
  const [purchasedProducts, setPurchasedProducts] = useState<PurchasedProduct[]>([]);
  const [, setLoadingData] = useState(true);

  useEffect(() => {
    // 检查登录状态，未登录则跳转到登录页
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // 获取用户详细数据
    if (user) {
      fetchUserData();
    }
  }, [user, isAuthenticated, loading, router]);

  const fetchUserData = async () => {
    try {
      // 获取试用次数和购买记录
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        const payload = data?.data || {};
        if (payload.user?.trialCounts) {
          setTrialCounts(payload.user.trialCounts);
        }
        if (payload.purchases) {
          setPurchasedProducts(payload.purchases);
        }
      }
    } catch (error) {
      console.error('获取用户数据失败:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // 加载中显示
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-20 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff8c42] mx-auto"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        </main>
      </div>
    );
  }

  const memberLevel: MembershipLevel = user.membershipLevel;
  const expiryDate = user.membershipExpiry ? new Date(user.membershipExpiry) : null;
  const daysRemaining = expiryDate
    ? Math.max(0, Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  // 获取试用次数映射
  const getTrialCount = (slug: string): number => {
    switch (slug) {
      case 'bk': return trialCounts.bk;
      case 'xinli': return trialCounts.xinli;
      case 'fuplan': return trialCounts.fuplan;
      default: return 0;
    }
  };

  // 检查产品是否已购买
  const isPurchased = (slug: string): boolean => {
    return purchasedProducts.some(p => p.productSlug === slug);
  };

  // 获取产品访问状态
  const getProductAccessStatus = (slug: string) => {
    const product = PRODUCTS.find(p => p.slug === slug);
    if (!product) return { hasAccess: false, accessType: 'none' as const };

    // 会员权限
    if (product.priceType === 'membership' || product.priceType === 'both') {
      if (canAccessProductByMembership(memberLevel, slug, expiryDate)) {
        return { hasAccess: true, accessType: 'membership' as const };
      }
    }

    // 已购买
    if (isPurchased(slug)) {
      return { hasAccess: true, accessType: 'purchased' as const };
    }

    // 可试用
    if (isTrialSupported(slug) && getTrialCount(slug) > 0) {
      return { hasAccess: true, accessType: 'trial' as const, trialRemaining: getTrialCount(slug) };
    }

    return { hasAccess: false, accessType: 'none' as const };
  };

  const membershipProducts = getMembershipProducts();
  const grantedMembershipProducts = membershipProducts
    .map((product) => {
      const status = getProductAccessStatus(product.slug);
      return { product, status };
    })
    .filter(({ status }) => status.hasAccess);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="pt-20 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">会员中心</h1>
            <p className="text-sm sm:text-lg text-gray-600">管理您的会员权益</p>
          </div>

          {/* Member Info Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-5 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                  欢迎回来, {user.username}
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm">{user.email}</p>
              </div>
              <div>
                <MemberBadge level={memberLevel} />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 sm:p-4">
                <div className="text-blue-600 mb-1">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-0.5">
                  {memberLevel === 'lifetime' ? '∞' : memberLevel === 'none' ? '-' : daysRemaining}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">剩余天数</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 sm:p-4">
                <div className="text-purple-600 mb-1">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-0.5">
                  {memberLevel === 'lifetime' ? '永久' : memberLevel === 'none' ? '-' : expiryDate?.toLocaleDateString('zh-CN')}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">到期日期</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 sm:p-4">
                <div className="text-green-600 mb-1">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-0.5">
                  {PRODUCTS.filter(p => getProductAccessStatus(p.slug).hasAccess).length}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">可用产品</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 sm:p-4">
                <div className="text-orange-600 mb-1">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-0.5">
                  {trialCounts.bk + trialCounts.xinli + trialCounts.fuplan}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">剩余试用</p>
              </div>
            </div>
          </div>

          {/* 已获得的访问权限 */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-5 sm:mb-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">已获得的访问权限</h3>
              <span className="text-xs sm:text-sm text-gray-500">{grantedMembershipProducts.length} 个</span>
            </div>
            {grantedMembershipProducts.length === 0 ? (
              <div className="text-sm text-gray-500 bg-gray-50 border border-gray-100 rounded-xl p-3 sm:p-4">
                暂无可用的会员产品权限
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {grantedMembershipProducts.map(({ product, status }) => (
                  <div
                    key={product.slug}
                    className="flex items-center justify-between p-3 rounded-xl border border-green-200 bg-green-50"
                  >
                    <div className="flex items-center min-w-0">
                      <span className="text-xl mr-2 flex-shrink-0">{product.icon}</span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">{product.name}</div>
                        <div className="text-xs text-green-600">
                          {status.accessType === 'membership' && '会员权限'}
                          {status.accessType === 'purchased' && '已购买'}
                          {status.accessType === 'trial' && `试用${status.trialRemaining}次`}
                        </div>
                      </div>
                    </div>
                    <Link
                      href={product.url || `/products/${product.slug}`}
                      target={product.openInNewWindow ? '_blank' : undefined}
                      rel={product.openInNewWindow ? 'noopener noreferrer' : undefined}
                      className="px-3 py-1.5 bg-[#ff8c42] text-white rounded-full text-xs font-medium hover:bg-[#e67d3a] transition-all whitespace-nowrap"
                    >
                      访问
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Trial Status - 只显示没有会员权限的产品的试用额度 */}
          {(() => {
            // 过滤出没有会员权限但支持试用的产品
            const trialOnlyProducts = TRIAL_PRODUCTS.filter(slug => {
              const status = getProductAccessStatus(slug);
              // 只有当用户没有会员权限时才显示试用
              return status.accessType === 'trial' || !status.hasAccess;
            });

            if (trialOnlyProducts.length === 0) return null;

            return (
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-5 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">试用额度</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {trialOnlyProducts.map((slug) => {
                    const product = PRODUCTS.find(p => p.slug === slug);
                    const count = getTrialCount(slug);
                    if (!product) return null;

                    return (
                      <div
                        key={slug}
                        className={`flex items-center justify-between p-3 rounded-xl border ${
                          count > 0 ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="text-xl mr-2">{product.icon}</span>
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm">{product.name}</h4>
                            <p className={`text-xs ${count > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                              {count > 0 ? `剩余${count}次` : '已用完'}
                            </p>
                          </div>
                        </div>
                        {count > 0 && (
                          <Link
                            href={`/products/${slug}`}
                            className="px-3 py-1.5 bg-green-500 text-white rounded-full text-xs font-medium hover:bg-green-600 transition-colors"
                          >
                            试用
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          <div className="grid lg:grid-cols-2 gap-5 sm:gap-6">
            {/* Products Access */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">产品访问权限</h3>
              <div className="space-y-3">
                {membershipProducts.map((product) => {
                  const status = getProductAccessStatus(product.slug);
                  const levelConfig = MEMBERSHIP_LEVELS[product.requiredLevel];

                  return (
                    <div
                      key={product.slug}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                        status.hasAccess
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50 opacity-80'
                      }`}
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <span className="text-xl mr-3 flex-shrink-0">{product.icon}</span>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm truncate">{product.name}</h4>
                          <p className="text-xs text-gray-600">
                            {status.hasAccess ? (
                              <span className="text-green-600">
                                {status.accessType === 'membership' && '会员权限'}
                                {status.accessType === 'purchased' && '已购买'}
                                {status.accessType === 'trial' && `试用${status.trialRemaining}次`}
                              </span>
                            ) : (
                              `需要${levelConfig?.name || product.requiredLevel}`
                            )}
                          </p>
                        </div>
                      </div>
                      {status.hasAccess ? (
                        <Link
                          href={product.url || `/products/${product.slug}`}
                          className="px-3 py-1.5 bg-[#ff8c42] text-white rounded-full hover:bg-[#e67d3a] transition-all duration-300 text-xs font-medium whitespace-nowrap"
                        >
                          访问
                        </Link>
                      ) : (
                        <Link
                          href="/#pricing"
                          className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-all duration-300 text-xs font-medium whitespace-nowrap"
                        >
                          升级
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 单独购买产品 */}
              <h4 className="text-sm sm:text-base font-semibold text-gray-900 mt-5 mb-3">单独购买产品</h4>
              <div className="space-y-3">
                {getStandaloneProducts().map((product) => {
                  const purchased = isPurchased(product.slug);

                  return (
                    <div
                      key={product.slug}
                      className={`flex items-center justify-between p-3 rounded-xl border ${
                        purchased ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <span className="text-xl mr-2 flex-shrink-0">{product.icon}</span>
                        <div className="min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm truncate">{product.name}</h4>
                          <p className="text-xs text-gray-600">
                            {purchased ? (
                              <span className="text-blue-600">已购买</span>
                            ) : (
                              product.standalonePrices?.lifetime
                                ? `¥${product.standalonePrices.lifetime}买断`
                                : '可购买'
                            )}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/products/${product.slug}`}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                          purchased
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        } transition-colors`}
                      >
                        {purchased ? '查看' : '购买'}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Activation Form */}
            <ActivationForm onSuccess={refreshUser} />
          </div>
        </div>
      </main>
    </div>
  );
}
