'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ActivationFormProps {
  onSuccess?: () => void;
}

export default function ActivationForm({ onSuccess }: ActivationFormProps) {
  const { refreshUser } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
    details?: string;
  } | null>(null);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/activation/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '激活失败');
      }

      // 构建成功消息
      let successText = data.message || '激活成功！';
      let details = '';

      if (data.codeType === 'membership') {
        details = `会员等级: ${data.membershipLevel}`;
        if (data.membershipExpiresAt) {
          const expiryDate = new Date(data.membershipExpiresAt);
          details += ` | 有效期至: ${expiryDate.toLocaleDateString('zh-CN')}`;
        }
      } else if (data.codeType === 'product') {
        details = `产品: ${data.productSlug}`;
        if (data.productExpiresAt) {
          const expiryDate = new Date(data.productExpiresAt);
          details += ` | 有效期至: ${expiryDate.toLocaleDateString('zh-CN')}`;
        }
      }

      setMessage({
        type: 'success',
        text: successText,
        details
      });
      setCode('');

      // 刷新用户信息
      await refreshUser();

      // 调用成功回调
      if (onSuccess) {
        onSuccess();
      }

    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || '激活失败，请检查激活码'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-gray-100">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">激活码</h3>
      <p className="text-gray-600 text-sm mb-4">
        支持会员激活码和产品激活码
      </p>

      <form onSubmit={handleActivate} className="space-y-4 sm:space-y-6">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
            激活码
          </label>
          <input
            type="text"
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
            placeholder="请输入激活码"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff8c42] focus:border-transparent transition-all duration-300 text-center tracking-wider font-mono text-base sm:text-lg"
          />
          <p className="mt-2 text-xs text-gray-500">
            激活码格式如：YS-M-XXXXXX（会员）或 YS-BK-XXXXXX（产品）
          </p>
        </div>

        {message && (
          <div
            className={`p-3 sm:p-4 rounded-xl ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <div className="flex items-start">
              {message.type === 'success' ? (
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <div>
                <span className="text-sm font-medium">{message.text}</span>
                {message.details && (
                  <p className="text-xs mt-1 opacity-80">{message.details}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || code.length < 8}
          className="w-full py-2.5 sm:py-3 px-6 bg-[#ff8c42] text-white rounded-full hover:bg-[#e67d3a] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-sm hover:shadow-md text-sm sm:text-base"
        >
          {loading ? (
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
              激活中...
            </span>
          ) : (
            '立即激活'
          )}
        </button>
      </form>

      {/* 激活码说明 */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <h4 className="text-sm font-medium text-gray-900 mb-3">激活码说明</h4>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>• 会员激活码：激活后自动延长会员有效期</li>
          <li>• 产品激活码：激活后获得对应产品使用权</li>
          <li>• 每个激活码只能使用一次</li>
          <li>• 如有问题请联系客服</li>
        </ul>
      </div>
    </div>
  );
}
