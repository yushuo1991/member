'use client';

import { useState, useEffect } from 'react';

interface ActivationCode {
  id: number;
  code: string;
  level: string;
  duration_days: number;
  used: boolean;
  used_by: number | null;
  used_by_email: string | null;
  used_at: string | null;
  created_at: string;
  expires_at: string | null;
  batch_id: string | null;
}

export default function CodesPage() {
  const [generating, setGenerating] = useState(false);
  const [quantity, setQuantity] = useState(10);
  const [selectedLevel, setSelectedLevel] = useState('monthly');
  const [codes, setCodes] = useState<ActivationCode[]>([]);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载激活码列表
  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    try {
      const response = await fetch('/api/admin/codes/list', {
        credentials: 'include',
      });
      const data = await response.json();
      const payload = (data as any)?.data ?? data;
      if (response.ok) {
        setCodes(payload.codes || []);
      }
    } catch (error) {
      console.error('加载激活码失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setGeneratedCodes([]);

    try {
      const response = await fetch('/api/activation/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          membershipLevel: selectedLevel,
          quantity: quantity,
        }),
      });

      const data = await response.json();
      const payload = (data as any)?.data ?? data;

      if (!response.ok) {
        throw new Error(data.message || '生成失败');
      }

      setGeneratedCodes(payload.codes || []);
      alert(`成功生成 ${payload.quantity ?? (payload.codes?.length ?? 0)} 个激活码！`);

      // 重新加载列表
      await loadCodes();

    } catch (error: any) {
      alert('生成失败：' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const statusColors = {
    unused: 'bg-green-100 text-green-700',
    used: 'bg-gray-100 text-gray-700',
    expired: 'bg-red-100 text-red-700',
  };

  const levelColors: Record<string, string> = {
    none: 'bg-gray-100 text-gray-700',
    monthly: 'bg-blue-100 text-blue-700',
    quarterly: 'bg-purple-100 text-purple-700',
    yearly: 'bg-yellow-100 text-yellow-700',
    lifetime: 'bg-green-100 text-green-700',
  };

  const levelNames: Record<string, string> = {
    none: '无会员',
    monthly: '月度会员',
    quarterly: '季度会员',
    yearly: '年度会员',
    lifetime: '终身会员',
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">激活码管理</h1>
        <p className="text-gray-600">生成和管理会员激活码</p>
      </div>

      {/* Generate Form */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">生成新激活码</h2>

        {/* Display newly generated codes */}
        {generatedCodes.length > 0 && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <h3 className="text-lg font-semibold text-green-900 mb-3">
              成功生成 {generatedCodes.length} 个激活码：
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {generatedCodes.map((code, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-2 rounded">
                  <code className="font-mono text-sm">{code}</code>
                  <button
                    onClick={() => navigator.clipboard.writeText(code)}
                    className="ml-2 p-1 text-blue-600 hover:bg-blue-50 rounded"
                    title="复制"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
              会员等级
            </label>
            <select
              id="level"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all duration-300"
            >
              <option value="monthly">月度会员 (30天)</option>
              <option value="quarterly">季度会员 (90天)</option>
              <option value="yearly">年度会员 (365天)</option>
              <option value="lifetime">终身会员 (永久)</option>
            </select>
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
              生成数量
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min="1"
              max="100"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all duration-300"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-3 px-6 bg-[#007AFF] text-white rounded-xl hover:bg-[#0051D5] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-sm hover:shadow-md"
            >
              {generating ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  生成中...
                </span>
              ) : (
                '立即生成'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Codes Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">激活码列表</h2>
          <button className="px-4 py-2 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium text-sm">
            导出CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  激活码
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  等级
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  有效期
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  创建日期
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  使用信息
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007AFF] mb-4"></div>
                      <p className="text-gray-600">加载中...</p>
                    </div>
                  </td>
                </tr>
              ) : codes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    暂无激活码数据
                  </td>
                </tr>
              ) : (
                codes.map((code) => (
                  <tr key={code.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <code className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">
                        {code.code}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          levelColors[code.level] || levelColors.none
                        }`}
                      >
                        {levelNames[code.level] || code.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {code.duration_days === 999999 ? '永久' : `${code.duration_days}天`}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          code.used ? statusColors.used : statusColors.unused
                        }`}
                      >
                        {code.used ? '已使用' : '未使用'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(code.created_at).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4">
                      {code.used_by_email ? (
                        <div className="text-sm">
                          <div className="text-gray-900">{code.used_by_email}</div>
                          <div className="text-gray-500">
                            {code.used_at ? new Date(code.used_at).toLocaleDateString('zh-CN') : '-'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigator.clipboard.writeText(code.code)}
                          className="p-2 text-[#007AFF] hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="复制激活码"
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
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
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
          <p className="text-sm text-gray-600">显示 1-3 条，共 3 条</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              上一页
            </button>
            <button className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
