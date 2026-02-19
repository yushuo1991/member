'use client'

import { useMemo } from 'react'

export default function JiandanFupanIntro() {
  const features = useMemo(
    () => [
      { title: '涨停数据汇总', desc: '每日涨停个股、连板梯队、板块归属一目了然，不用手动整理。', tag: '涨停' },
      { title: '跌停与炸板', desc: '记录跌停和炸板数据，全面了解市场风险面。', tag: '风险' },
      { title: '板块热度排行', desc: '按涨停数量自动排列板块热度，快速定位当日主线。', tag: '板块' },
      { title: '市场情绪指标', desc: '涨跌比、涨停跌停比、连板高度等核心情绪数据集中展示。', tag: '情绪' },
      { title: '历史数据回溯', desc: '支持查看历史任意交易日的数据，方便对比和回顾。', tag: '历史' },
      { title: '移动端适配', desc: '手机端清晰展示，随时随地查看当日市场数据。', tag: '移动' },
    ],
    []
  )

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#ff8c42]/10 via-white to-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#ff8c42]/20">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#ff8c42] text-white">
            简单复盘
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            轻量 · 数据 · 一网打尽
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              轻量级数据复盘，核心信息一网打尽
            </h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              不需要复杂的分析流程，只需要每天最核心的市场数据。简单复盘把涨停、跌停、板块热度、
              市场情绪等关键信息集中罗列，打开就能看，一分钟掌握全天市场概况。
            </p>
          </div>
          {/* Checklist SVG */}
          <svg className="w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0" viewBox="0 0 120 120" fill="none">
            <rect x="20" y="10" width="80" height="100" rx="8" stroke="#ff8c42" strokeWidth="2" fill="#ff8c42" fillOpacity="0.06" />
            <line x1="20" y1="30" x2="100" y2="30" stroke="#ff8c42" strokeWidth="1" strokeOpacity="0.3" />
            {/* Header lines */}
            <rect x="32" y="17" width="36" height="4" rx="2" fill="#ff8c42" fillOpacity="0.4" />
            {/* Row 1 */}
            <rect x="30" y="40" width="8" height="8" rx="2" stroke="#ff8c42" strokeWidth="1.5" fill="none" />
            <path d="M32 44l2 2 4-4" stroke="#ff8c42" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="44" y="42" width="40" height="4" rx="2" fill="#e67d3a" fillOpacity="0.25" />
            {/* Row 2 */}
            <rect x="30" y="56" width="8" height="8" rx="2" stroke="#ff8c42" strokeWidth="1.5" fill="none" />
            <path d="M32 60l2 2 4-4" stroke="#ff8c42" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="44" y="58" width="34" height="4" rx="2" fill="#e67d3a" fillOpacity="0.25" />
            {/* Row 3 */}
            <rect x="30" y="72" width="8" height="8" rx="2" stroke="#ff8c42" strokeWidth="1.5" fill="none" />
            <path d="M32 76l2 2 4-4" stroke="#ff8c42" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="44" y="74" width="44" height="4" rx="2" fill="#e67d3a" fillOpacity="0.25" />
            {/* Row 4 */}
            <rect x="30" y="88" width="8" height="8" rx="2" stroke="#ff8c42" strokeWidth="1.5" fill="none" />
            <rect x="44" y="90" width="30" height="4" rx="2" fill="#e67d3a" fillOpacity="0.15" />
          </svg>
        </div>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: '数据维度', value: '6项' },
            { label: '查看耗时', value: '1分钟' },
            { label: '历史回溯', value: '支持' },
            { label: '单独购买', value: '¥200' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="text-2xl font-semibold text-gray-900">{s.value}</div>
              <div className="mt-1 text-xs text-gray-600">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 产品理念 */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">产品理念：少即是多</h2>
        <p className="text-gray-700 leading-relaxed mb-3">
          不是每个人都需要深度复盘系统。有时候你只需要快速看一眼今天市场发生了什么——
          多少个涨停、哪些板块最热、市场情绪如何。简单复盘就是为这个需求而生。
        </p>
        <p className="text-gray-700 leading-relaxed">
          没有复杂的流程，没有需要填写的表单，打开就是数据，看完就走。
          适合时间有限但又不想错过市场关键信息的交易者。
        </p>
      </div>

      {/* 功能特性 */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">核心功能</h2>
          <p className="text-gray-600 mt-1 text-sm">精选最核心的市场数据，不多不少刚刚好。</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f) => (
            <div key={f.title} className="group rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-gray-900">{f.title}</h3>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#ff8c42]/10 text-[#ff8c42]">
                  {f.tag}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 使用场景 */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">典型使用场景</h2>
        <div className="space-y-4">
          {[
            { scene: '收盘快速浏览', desc: '下午三点收盘后，花一分钟看完当日涨停、板块热度和市场情绪。' },
            { scene: '通勤路上看盘', desc: '手机端打开即看，不需要登录复杂系统，核心数据一屏展示。' },
            { scene: '周末回顾对比', desc: '翻看本周每天的数据，对比板块热度变化，感受市场节奏。' },
          ].map((item) => (
            <div key={item.scene} className="flex items-start gap-3">
              <span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-[#ff8c42] flex-shrink-0" />
              <div>
                <span className="font-medium text-gray-900">{item.scene}：</span>
                <span className="text-gray-700">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 总结 */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm text-white">
        <h2 className="text-lg sm:text-xl font-semibold mb-3">一句话总结</h2>
        <p className="text-white/90 leading-relaxed">
          简单复盘是一个"打开就能看"的轻量级市场数据工具——涨停、跌停、板块、情绪，
          核心信息一网打尽，适合每天花一分钟快速了解市场全貌的交易者。
        </p>
      </div>
    </div>
  )
}
