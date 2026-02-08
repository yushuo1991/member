'use client';

import { useState, useEffect } from 'react';
import { MEMBERSHIP_LEVELS, MembershipLevel } from '@/lib/membership-levels';

interface Member {
  id: number;
  username: string;
  email: string;
  membershipLevel: MembershipLevel;
  membershipExpiry: string | null;
  isFrozen: boolean;
  createdAt: string;
  updatedAt: string;
  // 试用次数
  trialBk?: number;
  trialXinli?: number;
  trialFuplan?: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface EditModalData {
  memberId: number;
  username: string;
  currentLevel: MembershipLevel;
  currentExpiry: string | null;
  newLevel: MembershipLevel;
  customExpiry: string;
  // 试用次数
  trialBk: number;
  trialXinli: number;
  trialFuplan: number;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastIdCounter, setToastIdCounter] = useState(0);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editModalData, setEditModalData] = useState<EditModalData | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; username: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast functions
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const newToast: Toast = {
      id: toastIdCounter,
      message,
      type
    };
    setToastIdCounter(prev => prev + 1);
    setToasts(prev => [...prev, newToast]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 5000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Fetch members from API
  const fetchMembers = async (page: number = 1, search: string = '', level: string = 'all') => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '20');
      if (search) {
        params.append('search', search);
      }
      if (level && level !== 'all') {
        params.append('level', level);
      }

      const response = await fetch(`/api/admin/members?${params.toString()}`, {
        credentials: 'include' // Include admin_token cookie
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('未授权访问，请先登录管理员账户');
        }
        throw new Error('获取会员列表失败');
      }

      const data = await response.json();

      if (data.success) {
        setMembers(data.data.members);
        setPagination(data.data.pagination);
      } else {
        throw new Error(data.message || '获取会员列表失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取会员列表失败');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchMembers(1, searchTerm, filterLevel);
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchTerm) {
        setSearchTerm(searchInput);
        fetchMembers(1, searchInput, filterLevel);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Handle filter change
  const handleFilterChange = (level: string) => {
    setFilterLevel(level);
    fetchMembers(1, searchTerm, level);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchMembers(newPage, searchTerm, filterLevel);
    }
  };

  // Handle edit member
  const handleEditClick = (member: Member) => {
    const expiryDate = member.membershipExpiry
      ? new Date(member.membershipExpiry).toISOString().split('T')[0]
      : '';

    setEditModalData({
      memberId: member.id,
      username: member.username,
      currentLevel: member.membershipLevel,
      currentExpiry: member.membershipExpiry,
      newLevel: member.membershipLevel,
      customExpiry: expiryDate,
      trialBk: member.trialBk ?? 5,
      trialXinli: member.trialXinli ?? 5,
      trialFuplan: member.trialFuplan ?? 5
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!editModalData) return;

    try {
      setEditLoading(true);

      const response = await fetch(`/api/admin/members/${editModalData.memberId}/adjust`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          membershipLevel: editModalData.newLevel,
          customExpiry: editModalData.customExpiry || undefined,
          trialBk: editModalData.trialBk,
          trialXinli: editModalData.trialXinli,
          trialFuplan: editModalData.trialFuplan
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast('会员信息更新成功', 'success');
        setShowEditModal(false);
        setEditModalData(null);
        // Refresh the member list
        fetchMembers(pagination.page, searchTerm, filterLevel);
      } else {
        throw new Error(data.message || '更新失败');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : '更新会员信息失败', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  // Handle delete member
  const handleDeleteClick = (member: Member) => {
    setDeleteTarget({ id: member.id, username: member.username });
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteLoading(true);

      const response = await fetch(`/api/admin/members/${deleteTarget.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast(`会员 ${deleteTarget.username} 已删除`, 'success');
        setShowDeleteConfirm(false);
        setDeleteTarget(null);
        // Refresh the member list
        fetchMembers(pagination.page, searchTerm, filterLevel);
      } else {
        throw new Error(data.message || '删除失败');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : '删除会员失败', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle freeze/unfreeze member
  const handleToggleFreeze = async (member: Member) => {
    try {
      const newFrozenStatus = !member.isFrozen;

      const response = await fetch(`/api/admin/members/${member.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          isFrozen: newFrozenStatus
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast(newFrozenStatus ? `已冻结 ${member.username}` : `已解冻 ${member.username}`, 'success');
        // Update local state
        setMembers(prev =>
          prev.map(m =>
            m.id === member.id ? { ...m, isFrozen: newFrozenStatus } : m
          )
        );
      } else {
        throw new Error(data.message || '操作失败');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : '更新状态失败', 'error');
    }
  };

  // Get membership level display name
  const getLevelDisplayName = (level: MembershipLevel): string => {
    return MEMBERSHIP_LEVELS[level]?.name || '未知';
  };

  // Get membership level badge color
  const getLevelBadgeColor = (level: MembershipLevel): string => {
    const colors: Record<MembershipLevel, string> = {
      none: 'bg-gray-100 text-gray-700',
      monthly: 'bg-blue-100 text-blue-700',
      quarterly: 'bg-green-100 text-green-700',
      yearly: 'bg-purple-100 text-purple-700',
      lifetime: 'bg-yellow-100 text-yellow-700'
    };
    return colors[level] || 'bg-gray-100 text-gray-700';
  };

  // Format date
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '永久';
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

  // Check if membership is expired
  const isMembershipExpired = (expiryDate: string | null, level: MembershipLevel): boolean => {
    if (!expiryDate || level === 'lifetime') return false;
    try {
      return new Date(expiryDate) < new Date();
    } catch {
      return false;
    }
  };

  // Get member status
  const getMemberStatus = (member: Member): { label: string; color: string } => {
    if (member.isFrozen) {
      return { label: '已冻结', color: 'bg-red-100 text-red-700' };
    }
    if (member.membershipLevel === 'none') {
      return { label: '免费用户', color: 'bg-gray-100 text-gray-700' };
    }
    if (isMembershipExpired(member.membershipExpiry, member.membershipLevel)) {
      return { label: '已过期', color: 'bg-orange-100 text-orange-700' };
    }
    return { label: '正常', color: 'bg-green-100 text-green-700' };
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">会员管理</h1>
        <p className="text-gray-600">管理所有会员账户和等级</p>
      </div>

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
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="搜索用户名或邮箱..."
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all duration-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
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
              onChange={(e) => handleFilterChange(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all duration-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
            >
              <option value="all">全部等级</option>
              <option value="none">免费用户</option>
              <option value="monthly">月费会员</option>
              <option value="quarterly">季度会员</option>
              <option value="yearly">年费会员</option>
              <option value="lifetime">终身会员</option>
            </select>
          </div>
        </div>
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 border-4 border-[#007AFF] border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-gray-600">加载中...</p>
                    </div>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-gray-600 text-lg">暂无会员数据</p>
                      <p className="text-gray-400 text-sm mt-2">
                        {searchTerm || filterLevel !== 'all' ? '尝试调整搜索条件' : '系统中还没有注册用户'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                members.map((member) => {
                  const status = getMemberStatus(member);
                  return (
                    <tr key={member.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#007AFF] to-[#0051D5] rounded-full flex items-center justify-center text-white font-semibold mr-3">
                            {member.username[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{member.username}</div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelBadgeColor(member.membershipLevel)}`}>
                          {getLevelDisplayName(member.membershipLevel)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{formatDate(member.createdAt)}</td>
                      <td className="px-6 py-4 text-gray-700">{formatDate(member.membershipExpiry)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(member)}
                            className="p-2 text-[#007AFF] hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="编辑会员"
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
                          <button
                            onClick={() => handleToggleFreeze(member)}
                            className={`p-2 rounded-lg transition-colors duration-200 ${
                              member.isFrozen
                                ? 'text-green-600 hover:bg-green-50'
                                : 'text-orange-600 hover:bg-orange-50'
                            }`}
                            title={member.isFrozen ? '解冻会员' : '冻结会员'}
                          >
                            {member.isFrozen ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(member)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="删除会员"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && members.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              显示 {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)} 条，共 {pagination.total} 条
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1 || loading}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <div className="flex items-center px-4 py-2 text-sm text-gray-600">
                第 {pagination.page} / {pagination.totalPages} 页
              </div>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages || loading}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">编辑会员信息</h3>
              <button
                onClick={() => setShowEditModal(false)}
                disabled={editLoading}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  会员用户
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-700">
                  {editModalData.username}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  当前等级
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-700">
                  {getLevelDisplayName(editModalData.currentLevel)}
                  {editModalData.currentExpiry && (
                    <span className="text-sm text-gray-500 ml-2">
                      (到期: {formatDate(editModalData.currentExpiry)})
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="newLevel" className="block text-sm font-medium text-gray-700 mb-2">
                  新等级
                </label>
                <select
                  id="newLevel"
                  value={editModalData.newLevel}
                  onChange={(e) => setEditModalData({ ...editModalData, newLevel: e.target.value as MembershipLevel })}
                  disabled={editLoading}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all duration-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                  <option value="none">免费用户</option>
                  <option value="monthly">月费会员</option>
                  <option value="quarterly">季度会员</option>
                  <option value="yearly">年费会员</option>
                  <option value="lifetime">终身会员</option>
                </select>
              </div>

              <div>
                <label htmlFor="customExpiry" className="block text-sm font-medium text-gray-700 mb-2">
                  自定义到期日期 (可选)
                </label>
                <input
                  type="date"
                  id="customExpiry"
                  value={editModalData.customExpiry}
                  onChange={(e) => setEditModalData({ ...editModalData, customExpiry: e.target.value })}
                  disabled={editLoading || editModalData.newLevel === 'lifetime'}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all duration-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  留空则根据等级自动计算到期时间
                </p>
              </div>

              {/* 试用次数设置 */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  🎯 试用次数设置
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="trialBk" className="block text-xs text-gray-500 mb-1">
                      板块节奏
                    </label>
                    <input
                      type="number"
                      id="trialBk"
                      min="0"
                      max="99"
                      value={editModalData.trialBk}
                      onChange={(e) => setEditModalData({ ...editModalData, trialBk: parseInt(e.target.value) || 0 })}
                      disabled={editLoading}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent text-center disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label htmlFor="trialXinli" className="block text-xs text-gray-500 mb-1">
                      心理测评
                    </label>
                    <input
                      type="number"
                      id="trialXinli"
                      min="0"
                      max="99"
                      value={editModalData.trialXinli}
                      onChange={(e) => setEditModalData({ ...editModalData, trialXinli: parseInt(e.target.value) || 0 })}
                      disabled={editLoading}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent text-center disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label htmlFor="trialFuplan" className="block text-xs text-gray-500 mb-1">
                      复盘系统
                    </label>
                    <input
                      type="number"
                      id="trialFuplan"
                      min="0"
                      max="99"
                      value={editModalData.trialFuplan}
                      onChange={(e) => setEditModalData({ ...editModalData, trialFuplan: parseInt(e.target.value) || 0 })}
                      disabled={editLoading}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent text-center disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => setEditModalData({ ...editModalData, trialBk: 5, trialXinli: 5, trialFuplan: 5 })}
                    disabled={editLoading}
                    className="text-xs text-[#007AFF] hover:underline disabled:opacity-50"
                  >
                    全部重置为5次
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={editLoading}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                取消
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={editLoading}
                className="flex-1 px-4 py-3 rounded-xl bg-[#007AFF] text-white hover:bg-[#0051D5] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {editLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    保存中...
                  </>
                ) : (
                  '保存更改'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">确认删除会员</h3>
            <p className="text-gray-600 text-center mb-6">
              确定要删除会员 <span className="font-semibold text-gray-900">{deleteTarget.username}</span> 吗？
              <br />
              <span className="text-sm text-red-600">此操作无法撤销，将删除所有相关数据。</span>
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteTarget(null);
                }}
                disabled={deleteLoading}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                取消
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {deleteLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    删除中...
                  </>
                ) : (
                  '确认删除'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`min-w-80 max-w-md rounded-xl shadow-lg p-4 backdrop-blur-sm transform transition-all duration-300 ${
              toast.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : toast.type === 'error'
                ? 'bg-red-50 border border-red-200'
                : 'bg-blue-50 border border-blue-200'
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {toast.type === 'success' && (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {toast.type === 'error' && (
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {toast.type === 'info' && (
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="ml-3 flex-1">
                <p
                  className={`text-sm font-medium ${
                    toast.type === 'success'
                      ? 'text-green-800'
                      : toast.type === 'error'
                      ? 'text-red-800'
                      : 'text-blue-800'
                  }`}
                >
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
