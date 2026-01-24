'use client';

import { useState, useEffect } from 'react';
import { MembershipLevel } from '@/lib/membership-levels';

interface DashboardStats {
  overview: {
    totalUsers: number;
    todayNewUsers: number;
    activeUsers7Days: number;
    totalRevenue: number;
  };
  membershipStats: Array<{
    level: string;
    count: number;
  }>;
  activationCodes: {
    total: number;
    used: number;
    available: number;
  };
  registrationTrend?: Array<{
    date: string;
    count: number;
  }>;
}

interface Member {
  id: number;
  username: string;
  email: string;
  membershipLevel: MembershipLevel;
  createdAt: string;
}

interface ActivationCode {
  id: number;
  code: string;
  level: string;
  used: boolean;
  used_by_username?: string;
  used_at?: string;
  created_at: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentMembers, setRecentMembers] = useState<Member[]>([]);
  const [recentCodes, setRecentCodes] = useState<ActivationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsRes, membersRes, codesRes] = await Promise.all([
          fetch('/api/admin/dashboard/stats', { credentials: 'include' }),
          fetch('/api/admin/members?page=1&limit=5', { credentials: 'include' }),
          fetch('/api/admin/codes/list', { credentials: 'include' })
        ]);

        if (!statsRes.ok) throw new Error('获取统计数据失败');
        const statsData = await statsRes.json();
        if (statsData.success) setStats(statsData.data);

        if (membersRes.ok) {
          const membersData = await membersRes.json();
          if (membersData.success) setRecentMembers(membersData.data.members);
        }

        if (codesRes.ok) {
          const codesData = await codesRes.json();
          if (codesData.success) setRecentCodes(codesData.data.codes.slice(0, 5));
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : '加载数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getLevelDisplayName = (level: string): string => {
    const levelMap: Record<string, string> = {
      none: '免费用户',
      monthly: '月度会员',
      quarterly: '季度会员',
      yearly: '年度会员',
      lifetime: '终身会员'
    };
    return levelMap[level] || level;
  };

  const getLevelColor = (level: string): string => {
    const colorMap: Record<string, string> = {
      none: 'bg-gray-100 text-gray-700',
      monthly: 'bg-blue-100 text-blue-700',
      quarterly: 'bg-purple-100 text-purple-700',
      yearly: 'bg-orange-100 text-orange-700',
      lifetime: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
    };
    return colorMap[level] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <div className="w-12 h-12 border-4 border-[#007AFF] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  const totalMembers = stats?.membershipStats.reduce((sum, s) => sum + s.count, 0) || 0;
  const paidMembers = stats?.membershipStats.filter(s => s.level !== 'none').reduce((sum, s) => sum + s.count, 0) || 0;

  return (
    <div className="space-y-4 max-w-[1600px]">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">控制台</h1>
          <p className="text-sm text-gray-500 mt-0.5">会员系统概览</p>
        </div>
        <div className="text-xs text-gray-500">
          {new Date().toLocaleString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Compact Stats Grid - 6 columns */}
      <div className="grid grid-cols-6 gap-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs opacity-90">总用户</span>
            <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold">{stats?.overview.totalUsers || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs opacity-90">今日新增</span>
            <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-3xl font-bold">{stats?.overview.todayNewUsers || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs opacity-90">7日活跃</span>
            <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold">{stats?.overview.activeUsers7Days || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs opacity-90">付费用户</span>
            <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-3xl font-bold">{paidMembers}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs opacity-90">预估收入</span>
            <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(stats?.overview.totalRevenue || 0)}</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 text-white shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs opacity-90">激活码</span>
            <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <p className="text-2xl font-bold">{stats?.activationCodes.available || 0}<span className="text-sm opacity-75">/{stats?.activationCodes.total || 0}</span></p>
        </div>
      </div>

      {/* Main Content Grid - 3 columns */}
      <div className="grid grid-cols-3 gap-4">
        {/* Left Column: Membership Distribution */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-1.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            会员等级分布
          </h2>
          <div className="space-y-2">
            {stats?.membershipStats.map((stat) => (
              <div key={stat.level} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getLevelColor(stat.level)}`}>
                    {getLevelDisplayName(stat.level)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                      style={{ width: `${totalMembers > 0 ? (stat.count / totalMembers * 100) : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-8 text-right">{stat.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Column: Recent Members */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center">
              <svg className="w-4 h-4 mr-1.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              最近注册
            </h2>
            <a href="/admin/members" className="text-xs text-[#007AFF] hover:underline">全部</a>
          </div>
          <div className="space-y-1.5">
            {recentMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-xs">暂无数据</p>
              </div>
            ) : (
              recentMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-7 h-7 bg-gradient-to-br from-[#007AFF] to-[#0051D5] rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {member.username[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium text-gray-900 truncate">{member.username}</h4>
                      <p className="text-xs text-gray-500 truncate">{member.email}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-xs font-medium text-gray-700">{getLevelDisplayName(member.membershipLevel)}</p>
                    <p className="text-xs text-gray-400">{formatDate(member.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Recent Activation Codes */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center">
              <svg className="w-4 h-4 mr-1.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              激活码动态
            </h2>
            <a href="/admin/codes" className="text-xs text-[#007AFF] hover:underline">全部</a>
          </div>
          <div className="space-y-1.5">
            {recentCodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-xs">暂无数据</p>
              </div>
            ) : (
              recentCodes.map((code) => (
                <div key={code.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <code className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{code.code}</code>
                      {code.used ? (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-700">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          已使用
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-700">未使用</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {code.used && code.used_by_username ? `${code.used_by_username} · ${formatDate(code.used_at || '')}` : formatDate(code.created_at)}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${getLevelColor(code.level)}`}>
                    {getLevelDisplayName(code.level)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Quick Actions - Compact */}
      <div className="grid grid-cols-4 gap-3">
        <a
          href="/admin/codes"
          className="bg-white p-4 rounded-xl border border-gray-200 hover:border-[#007AFF] hover:shadow-md transition-all duration-200 text-center group"
        >
          <div className="w-10 h-10 bg-blue-50 group-hover:bg-[#007AFF] rounded-lg flex items-center justify-center mx-auto mb-2 transition-colors">
            <svg className="w-5 h-5 text-blue-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p className="text-xs font-medium text-gray-900">生成激活码</p>
        </a>

        <a
          href="/admin/members"
          className="bg-white p-4 rounded-xl border border-gray-200 hover:border-[#007AFF] hover:shadow-md transition-all duration-200 text-center group"
        >
          <div className="w-10 h-10 bg-purple-50 group-hover:bg-[#007AFF] rounded-lg flex items-center justify-center mx-auto mb-2 transition-colors">
            <svg className="w-5 h-5 text-purple-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-xs font-medium text-gray-900">会员管理</p>
        </a>

        <a
          href="/admin/stats"
          className="bg-white p-4 rounded-xl border border-gray-200 hover:border-[#007AFF] hover:shadow-md transition-all duration-200 text-center group"
        >
          <div className="w-10 h-10 bg-orange-50 group-hover:bg-[#007AFF] rounded-lg flex items-center justify-center mx-auto mb-2 transition-colors">
            <svg className="w-5 h-5 text-orange-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-xs font-medium text-gray-900">数据统计</p>
        </a>

        <a
          href="#"
          className="bg-white p-4 rounded-xl border border-gray-200 hover:border-[#007AFF] hover:shadow-md transition-all duration-200 text-center group"
        >
          <div className="w-10 h-10 bg-gray-50 group-hover:bg-[#007AFF] rounded-lg flex items-center justify-center mx-auto mb-2 transition-colors">
            <svg className="w-5 h-5 text-gray-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-xs font-medium text-gray-900">系统设置</p>
        </a>
      </div>
    </div>
  );
}
