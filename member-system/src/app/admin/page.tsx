'use client';

import { useState, useEffect } from 'react';
import { MEMBERSHIP_LEVELS, MembershipLevel } from '@/lib/membership-levels';

interface DashboardStats {
  overview: {
    totalUsers: number;
    todayNewUsers: number;
    activeUsers7Days: number;
    totalRevenue: number;
  };
  activationCodes: {
    total: number;
    used: number;
    available: number;
  };
}

interface Member {
  id: number;
  username: string;
  email: string;
  membershipLevel: MembershipLevel;
  createdAt: string;
}

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentMembers, setRecentMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch stats
        const statsResponse = await fetch('/api/admin/dashboard/stats', {
          credentials: 'include'
        });

        if (!statsResponse.ok) {
          throw new Error('获取统计数据失败');
        }

        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.data);
        }

        // Fetch recent members (first 5)
        const membersResponse = await fetch('/api/admin/members?page=1&limit=5', {
          credentials: 'include'
        });

        if (!membersResponse.ok) {
          throw new Error('获取会员数据失败');
        }

        const membersData = await membersResponse.json();
        if (membersData.success) {
          setRecentMembers(membersData.data.members);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : '加载数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Get membership level display name
  const getLevelDisplayName = (level: MembershipLevel): string => {
    return MEMBERSHIP_LEVELS[level]?.name || '未知';
  };

  // Format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Build stats cards from real data
  const statsCards = stats ? [
    {
      title: '总会员数',
      value: stats.overview.totalUsers.toLocaleString(),
      change: '',
      icon: '👥',
      color: 'bg-blue-500',
    },
    {
      title: '今日新增',
      value: stats.overview.todayNewUsers.toString(),
      change: '',
      icon: '📈',
      color: 'bg-green-500',
    },
    {
      title: '激活码总数',
      value: stats.activationCodes.total.toLocaleString(),
      change: `可用: ${stats.activationCodes.available}`,
      icon: '🔑',
      color: 'bg-purple-500',
    },
    {
      title: '预估总收入',
      value: formatCurrency(stats.overview.totalRevenue),
      change: '',
      icon: '💰',
      color: 'bg-yellow-500',
    },
  ] : [];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">控制台</h1>
        <p className="text-gray-600">欢迎回来,这是您的会员系统概览</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-[#007AFF] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-2xl`}
                  >
                    {stat.icon}
                  </div>
                  {stat.change && (
                    <span className="text-sm font-medium text-gray-600">
                      {stat.change}
                    </span>
                  )}
                </div>
                <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Members */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">最近注册会员</h2>
                <a
                  href="/admin/members"
                  className="text-[#007AFF] hover:underline text-sm font-medium"
                >
                  查看全部
                </a>
              </div>
              <div className="space-y-4">
                {recentMembers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-gray-500 text-sm">暂无会员数据</p>
                  </div>
                ) : (
                  recentMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors duration-300">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#007AFF] to-[#0051D5] rounded-full flex items-center justify-center text-white font-semibold mr-3">
                          {member.username[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{member.username}</h4>
                          <p className="text-sm text-gray-600">{member.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{getLevelDisplayName(member.membershipLevel)}</p>
                        <p className="text-xs text-gray-500">{formatDate(member.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">快捷操作</h2>
              <div className="grid grid-cols-2 gap-4">
                <a
                  href="/admin/codes"
                  className="p-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#007AFF] hover:bg-blue-50 transition-all duration-300 text-center group"
                >
                  <div className="w-12 h-12 bg-gray-100 group-hover:bg-[#007AFF] rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors duration-300">
                    <svg
                      className="w-6 h-6 text-gray-600 group-hover:text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900">生成激活码</p>
                </a>

                <a
                  href="/admin/members"
                  className="p-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#007AFF] hover:bg-blue-50 transition-all duration-300 text-center group"
                >
                  <div className="w-12 h-12 bg-gray-100 group-hover:bg-[#007AFF] rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors duration-300">
                    <svg
                      className="w-6 h-6 text-gray-600 group-hover:text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900">管理会员</p>
                </a>

                <a
                  href="/admin/stats"
                  className="p-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#007AFF] hover:bg-blue-50 transition-all duration-300 text-center group"
                >
                  <div className="w-12 h-12 bg-gray-100 group-hover:bg-[#007AFF] rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors duration-300">
                    <svg
                      className="w-6 h-6 text-gray-600 group-hover:text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900">数据统计</p>
                </a>

                <a
                  href="#"
                  className="p-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#007AFF] hover:bg-blue-50 transition-all duration-300 text-center group"
                >
                  <div className="w-12 h-12 bg-gray-100 group-hover:bg-[#007AFF] rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors duration-300">
                    <svg
                      className="w-6 h-6 text-gray-600 group-hover:text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900">系统设置</p>
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
