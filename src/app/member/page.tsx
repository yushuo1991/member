'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import MemberBadge from '@/components/MemberBadge';
import ActivationForm from '@/components/ActivationForm';
import { PRODUCTS, canAccessProduct } from '@/lib/membership-levels';
import { MembershipLevel } from '@/types/membership';
import { useAuth } from '@/contexts/AuthContext';

export default function MemberPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [memberData, setMemberData] = useState<{
    name: string;
    email: string;
    level: MembershipLevel;
    expiryDate: string;
    daysRemaining: number;
  } | null>(null);

  useEffect(() => {
    // 检查登录状态，未登录则跳转到登录页
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // 从真实用户数据计算会员信息
    if (user) {
      const expiryDate = user.membershipExpiry ? new Date(user.membershipExpiry) : null;
      const daysRemaining = expiryDate
        ? Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0;

      setMemberData({
        name: user.username,
        email: user.email,
        level: user.membershipLevel,
        expiryDate: expiryDate ? expiryDate.toLocaleDateString('zh-CN') : '永久',
        daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      });
    }
  }, [user, isAuthenticated, loading, router]);

  // 加载中显示
  if (loading || !memberData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-24 pb-20 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007AFF] mx-auto"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        </main>
      </div>
    );
  }

  const expiryDate = memberData.expiryDate && memberData.expiryDate !== '永久'
    ? new Date(memberData.expiryDate)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="pt-24 pb-20 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">会员中心</h1>
            <p className="text-xl text-gray-600">管理您的会员权益</p>
          </div>

          {/* Member Info Card */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  欢迎回来, {memberData.name}
                </h2>
                <p className="text-gray-600">{memberData.email}</p>
              </div>
              <div className="mt-4 lg:mt-0">
                <MemberBadge level={memberData.level} />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                <div className="text-blue-600 mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">
                  {memberData.level === 'lifetime' ? '∞' : memberData.daysRemaining}
                </h3>
                <p className="text-gray-600">剩余天数</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                <div className="text-purple-600 mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">
                  {memberData.level === 'lifetime' ? '永久' : memberData.expiryDate}
                </h3>
                <p className="text-gray-600">到期日期</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                <div className="text-green-600 mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">
                  {PRODUCTS.filter((p) => canAccessProduct(memberData.level, p.slug, expiryDate)).length}
                </h3>
                <p className="text-gray-600">可用产品</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Products Access */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">产品访问权限</h3>
              <div className="space-y-4">
                {PRODUCTS.map((product) => {
                  const hasAccess = canAccessProduct(memberData.level, product.slug, expiryDate);

                  return (
                    <div
                      key={product.slug}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                        hasAccess
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50 opacity-70'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-3xl mr-4">{product.icon}</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-600">
                            需要: {product.requiredLevel === 'monthly' && '月度会员'}
                            {product.requiredLevel === 'quarterly' && '季度会员'}
                            {product.requiredLevel === 'yearly' && '年度会员'}
                            {product.requiredLevel === 'lifetime' && '终身会员'}
                          </p>
                        </div>
                      </div>
                      {hasAccess ? (
                        <a
                          href={product.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-[#007AFF] text-white rounded-full hover:bg-[#0051D5] transition-all duration-300 text-sm font-medium"
                        >
                          立即访问 →
                        </a>
                      ) : (
                        <a
                          href="/membership"
                          className="px-4 py-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-all duration-300 text-sm font-medium"
                        >
                          升级会员
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Activation Form */}
            <ActivationForm />
          </div>
        </div>
      </main>
    </div>
  );
}
