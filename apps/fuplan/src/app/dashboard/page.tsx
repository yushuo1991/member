'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardProps {
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export default function DashboardPage() {
  const [user, setUser] = useState<DashboardProps['user'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: 从@repo/auth获取当前用户
    // 暂时模拟用户数据
    setUser({
      id: 1,
      username: '宇硕',
      email: 'demo@example.com',
    });
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="text-sm text-gray-400 font-medium">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-gray-900">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">YS</span>
              </div>
              <h1 className="text-lg font-semibold tracking-tight text-gray-900">
                宇硕复盘系统
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-900">
                {user?.username || '用户'}
              </span>
              <button className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full">
                退出
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* 欢迎区域 */}
        <div className="bg-white rounded-3xl p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
            早安，开启复盘时刻。
          </h2>
          <p className="text-gray-500 text-lg max-w-md leading-relaxed">
            基于市场情绪周期理论，助您建立严谨的交易体系。
          </p>
        </div>

        {/* 功能入口 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 px-1">核心功能</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 复盘系统 */}
            <Link
              href="/review"
              className="group bg-white rounded-3xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 border border-gray-100 hover:border-indigo-100 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-500 transition-colors duration-300">
                <i className="fas fa-chart-line text-indigo-600 text-xl group-hover:text-white transition-colors"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">市场情绪复盘</h3>
              <p className="text-sm text-gray-500 mb-6 min-h-[40px]">
                混沌、主升、盘顶、退潮。全周期市场情绪量化分析。
              </p>
              <div className="flex items-center text-sm font-medium text-indigo-600 group-hover:translate-x-1 transition-transform">
                进入系统 <i className="fas fa-arrow-right ml-2 text-xs"></i>
              </div>
            </Link>

            {/* 历史记录 */}
            <Link
              href="/history"
              className="group bg-white rounded-3xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 border border-gray-100 hover:border-emerald-100 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-500 transition-colors duration-300">
                <i className="fas fa-history text-emerald-600 text-xl group-hover:text-white transition-colors"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">历史复盘</h3>
              <p className="text-sm text-gray-500 mb-6 min-h-[40px]">
                查看过往复盘记录，沉淀交易思想，总结规律。
              </p>
              <div className="flex items-center text-sm font-medium text-emerald-600 group-hover:translate-x-1 transition-transform">
                查看记录 <i className="fas fa-arrow-right ml-2 text-xs"></i>
              </div>
            </Link>
          </div>
        </div>

        {/* 使用指南 */}
        <div className="bg-white rounded-3xl p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <i className="fas fa-book-open text-gray-400"></i>
            <h3 className="text-lg font-semibold text-gray-900">使用指南</h3>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              复盘系统核心
            </h4>
            <ul className="space-y-3">
              {[
                '情绪周期判断：精准识别混沌、主升、盘顶、退潮',
                '板块分析：全天候跟踪板块轮动',
                '市场记录：数字化沉淀每日交易想法',
                '可视化图表：直观呈现市场情绪温差',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 mr-3 flex-shrink-0"></div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex gap-4 bg-blue-50/50 p-4 rounded-xl items-start">
              <i className="fas fa-lightbulb text-blue-500 mt-1"></i>
              <p className="text-sm text-blue-700 leading-relaxed">
                <strong>Pro Tip：</strong> 建议每天收盘后花 15 分钟使用复盘系统记录。
                复盘不是为了预判明天，而是为了在明天市场走出某种形态时，你能第一时间匹配上你的交易计划。
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
