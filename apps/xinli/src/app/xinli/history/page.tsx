'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface TestHistory {
  id: number;
  name: string;
  status: string;
  progress: number;
  startedAt: string;
  completedAt: string | null;
  updatedAt: string;
}

export default function HistoryPage() {
  const [tests, setTests] = useState<TestHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await fetch('/api/psychology/history');
      if (res.ok) {
        const data = await res.json();
        setTests(data.tests || []);
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (testId: number) => {
    window.open(`/api/psychology/export?testId=${testId}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="card">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">📊 历史记录</h1>
            <Link href="/xinli" className="btn btn-secondary">
              返回测评
            </Link>
          </div>

          {tests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">暂无历史记录</p>
              <Link href="/xinli" className="btn btn-primary">
                开始第一次测评
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {tests.map((test) => (
                <div
                  key={test.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {test.name}
                      </h3>

                      <div className="flex flex-wrap gap-3 mb-3">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            test.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {test.status === 'completed' ? '✓ 已完成' : '⏳ 进行中'}
                        </span>

                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          进度: {test.progress}/80 ({Math.round((test.progress / 80) * 100)}%)
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          开始时间：
                          {new Date(test.startedAt).toLocaleString('zh-CN')}
                        </p>
                        {test.completedAt && (
                          <p>
                            完成时间：
                            {new Date(test.completedAt).toLocaleString('zh-CN')}
                          </p>
                        )}
                        <p>
                          最后更新：
                          {new Date(test.updatedAt).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleExport(test.id)}
                        className="btn btn-secondary text-sm"
                      >
                        📥 导出
                      </button>
                    </div>
                  </div>

                  {/* 进度条 */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(test.progress / 80) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
