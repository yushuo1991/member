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
      <div className="min-h-screen bg-[#fbfbfd]">
        <Navbar />
        <main className="pt-14 pb-16 px-5">
          <div className="max-w-[980px] mx-auto text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#0071E3] border-t-transparent mx-auto"></div>
            <p className="mt-3 text-[13px] text-[#6e6e73]">加载中...</p>
          </div>
        </main>
      </div>
    );
  }

  const expiryDate = memberData.expiryDate && memberData.expiryDate !== '永久'
    ? new Date(memberData.expiryDate)
    : null;

  return (
    <div className="min-h-screen bg-[#fbfbfd]">
      <Navbar />

      <main className="pt-14 pb-16 px-5">
        <div className="max-w-[980px] mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-semibold text-[#1d1d1f] tracking-tight leading-tight mb-2">会员中心</h1>
            <p className="text-[17px] text-[#6e6e73] font-normal">管理您的会员权益</p>
          </div>

          {/* Member Info Card */}
          <div className="card mb-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-[#1d1d1f] mb-1">
                  欢迎回来, {memberData.name}
                </h2>
                <p className="text-[15px] text-[#6e6e73]">{memberData.email}</p>
              </div>
              <div className="mt-3 lg:mt-0">
                <MemberBadge level={memberData.level} />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-[#0071E3]/5 to-[#0071E3]/10 rounded-xl p-5">
                <div className="text-[#0071E3] mb-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-[#1d1d1f] mb-0.5">
                  {memberData.level === 'lifetime' ? '∞' : memberData.daysRemaining}
                </h3>
                <p className="text-[13px] text-[#6e6e73]">剩余天数</p>
              </div>

              <div className="bg-gradient-to-br from-[#AF52DE]/5 to-[#AF52DE]/10 rounded-xl p-5">
                <div className="text-[#AF52DE] mb-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-[#1d1d1f] mb-0.5">
                  {memberData.level === 'lifetime' ? '永久' : memberData.expiryDate}
                </h3>
                <p className="text-[13px] text-[#6e6e73]">到期日期</p>
              </div>

              <div className="bg-gradient-to-br from-[#34c759]/5 to-[#34c759]/10 rounded-xl p-5">
                <div className="text-[#34c759] mb-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-[#1d1d1f] mb-0.5">
                  {PRODUCTS.filter((p) => canAccessProduct(memberData.level, p.slug, expiryDate)).length}
                </h3>
                <p className="text-[13px] text-[#6e6e73]">可用产品</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Products Access */}
            <div className="card">
              <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-5">产品访问权限</h3>
              <div className="space-y-3">
                {PRODUCTS.map((product) => {
                  const hasAccess = canAccessProduct(memberData.level, product.slug, expiryDate);

                  return (
                    <div
                      key={product.slug}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                        hasAccess
                          ? 'border-[#34c759]/20 bg-[#34c759]/5'
                          : 'border-[#d2d2d7] bg-[#f5f5f7]/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{product.icon}</span>
                        <div>
                          <h4 className="font-medium text-[15px] text-[#1d1d1f]">{product.name}</h4>
                          <p className="text-[13px] text-[#6e6e73]">
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
                          className="px-4 py-1.5 bg-[#0071E3] text-white rounded-full hover:bg-[#0077ED] transition-all duration-150 text-[13px] font-normal whitespace-nowrap"
                        >
                          立即访问 →
                        </a>
                      ) : (
                        <a
                          href="/membership"
                          className="px-4 py-1.5 bg-[#f5f5f7] text-[#86868b] rounded-full hover:bg-[#e8e8ed] transition-all duration-150 text-[13px] font-normal whitespace-nowrap"
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
