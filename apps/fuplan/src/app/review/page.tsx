'use client';

import { useState } from 'react';
import EmotionStageSelector from '@/components/EmotionStageSelector';
import { EmotionStage, MarketDirection } from '@/types/review';

export default function ReviewPage() {
  const [emotionStage, setEmotionStage] = useState<EmotionStage | null>(null);
  const [marketDirection, setMarketDirection] = useState<MarketDirection | null>(null);

  // TODO: 实现表单状态管理和提交逻辑

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">YS</span>
              </div>
              <h1 className="text-lg font-semibold tracking-tight text-gray-900">
                市场情绪复盘
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors px-4 py-2 rounded-full hover:bg-gray-100">
                <i className="fas fa-save mr-2"></i>
                保存草稿
              </button>
              <button className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors px-4 py-2 rounded-full">
                <i className="fas fa-check mr-2"></i>
                提交复盘
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 侧边栏 */}
      <div className="flex">
        <aside className="fixed left-0 top-16 w-56 h-[calc(100vh-4rem)] bg-white/95 backdrop-blur-xl border-r border-gray-200/50 overflow-y-auto">
          <nav className="p-4 space-y-1">
            {[
              { icon: 'fa-chart-line', label: '市场多空', id: 'section-1' },
              { icon: 'fa-heart-pulse', label: '情绪阶段', id: 'section-2' },
              { icon: 'fa-layer-group', label: '板块节奏', id: 'section-3' },
              { icon: 'fa-chess', label: '策略方法', id: 'section-4' },
              { icon: 'fa-clipboard-list', label: '执行计划', id: 'section-5' },
              { icon: 'fa-file-invoice-dollar', label: '交易记录', id: 'section-6' },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
              >
                <i className={`fas ${item.icon} text-gray-400`}></i>
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* 主要内容区域 */}
        <main className="ml-56 flex-1 p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Section 1: 市场多空 */}
            <section id="section-1" className="bg-white rounded-3xl p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
              <h2 className="text-2xl font-bold mb-6">市场多空判断</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    市场方向
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['多头', '空头', '震荡'] as MarketDirection[]).map((direction) => (
                      <button
                        key={direction}
                        onClick={() => setMarketDirection(direction)}
                        className={`
                          px-4 py-3 rounded-xl border-2 font-medium transition-all
                          ${
                            marketDirection === direction
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        {direction}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                    <span className="text-sm font-medium">宏观无风险</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                    <span className="text-sm font-medium">指数不破位</span>
                  </label>
                </div>
              </div>
            </section>

            {/* Section 2: 情绪阶段 */}
            <section id="section-2" className="bg-white rounded-3xl p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
              <EmotionStageSelector value={emotionStage} onChange={setEmotionStage} />

              <div className="mt-6 grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                  <span className="text-sm font-medium">量能放大</span>
                </label>
                <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                  <span className="text-sm font-medium">指数转折点</span>
                </label>
              </div>
            </section>

            {/* Section 3: 板块节奏 */}
            <section id="section-3" className="bg-white rounded-3xl p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
              <h2 className="text-2xl font-bold mb-6">板块节奏</h2>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      板块选项 {i}
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
                      placeholder={`输入板块名称...`}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* 更多section待添加... */}
          </div>
        </main>
      </div>
    </div>
  );
}
