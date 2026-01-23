'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Member {
  id: number;
  username: string;
  email: string;
  membershipLevel: string;
  membershipExpiry: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // 加载会员列表
  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      if (filterLevel && filterLevel !== 'all') {
        params.append('level', filterLevel);
      }

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const response = await fetch(`/api/admin/members?${params}`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error(data.message || '加载失败');
      }

      setMembers(data.data.members);
      setPagination(data.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载会员列表失败');
      console.error('加载会员失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载和筛选/搜索变化时重新加载
  useEffect(() => {
    fetchMembers();
  }, [pagination.page, filterLevel, searchTerm]);

  const levelColors: Record<string, string> = {
    none: 'bg-gray-100 text-gray-700',
    monthly: 'bg-blue-100 text-blue-700',
    quarterly: 'bg-purple-100 text-purple-700',
    yearly: 'bg-yellow-100 text-yellow-700',
    lifetime: 'bg-green-100 text-green-700'
  };

  const levelNames: Record<string, string> = {
    none: '免费用户',
    monthly: '月度会员',
    quarterly: '季度会员',
    yearly: '年度会员',
    lifetime: '终身会员'
  };

  // 格式化日期
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  // 判断会员是否过期
  const isExpired = (expiryDate: string | null, level: string) => {
    if (level === 'lifetime') return false;
    if (!expiryDate) return true;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">会员管理</h1>
        <p className="text-gray-600">管理所有会员账户和等级</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              搜索会员
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                placeholder="搜索用户名或邮箱..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all duration-300"
              />
              <svg
                className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Filter by Level */}
          <div>
            <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-2">
              会员等级
            </label>
            <select
              id="filter"
              value={filterLevel}
              onChange={(e) => {
                setFilterLevel(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all duration-300"
            >
              <option value="all">全部等级</option>
              <option value="none">免费用户</option>
              <option value="monthly">月度会员</option>
              <option value="quarterly">季度会员</option>
              <option value="yearly">年度会员</option>
              <option value="lifetime">终身会员</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#007AFF]"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      ) : (
        <>
          {/* Members Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      会员
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      等级
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      注册日期
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      到期日期
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {members.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        暂无会员数据
                      </td>
                    </tr>
                  ) : (
                    members.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#007AFF] to-[#0051D5] rounded-full flex items-center justify-center text-white font-semibold mr-3">
                              {member.username[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{member.username}</div>
                              <div className="text-sm text-gray-500">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              levelColors[member.membershipLevel] || levelColors.none
                            }`}
                          >
                            {levelNames[member.membershipLevel] || '未知等级'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{formatDate(member.createdAt)}</td>
                        <td className="px-6 py-4 text-gray-700">
                          {member.membershipLevel === 'lifetime'
                            ? '永久'
                            : formatDate(member.membershipExpiry)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              isExpired(member.membershipExpiry, member.membershipLevel)
                                ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {isExpired(member.membershipExpiry, member.membershipLevel) ? '已过期' : '正常'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => router.push(`/admin/members/${member.id}`)}
                              className="p-2 text-[#007AFF] hover:bg-blue-50 rounded-lg transition-colors duration-200"
                              title="编辑"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                显示 {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}-
                {Math.min(pagination.page * pagination.limit, pagination.total)} 条，共 {pagination.total} 条
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page <= 1}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
