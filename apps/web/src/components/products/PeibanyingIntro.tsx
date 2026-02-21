'use client'

import { useMemo } from 'react'

export default function PeibanyingIntro() {
  const benefits = useMemo(
    () => [
      { name: '板块节奏系统', desc: '板块联动与节奏追踪，数据驱动看市场。' },
      { name: '复盘系统', desc: '结构化每日复盘，积累交易图鉴。' },
      { name: '心理测评系统', desc: '80场景心理问卷，扫描交易心理盲点。' },
      { name: '情绪表格', desc: '量化市场情绪，辅助判断周期位置。' },
      { name: '板块助手', desc: '板块数据分析工具，快速定位热点。' },
      { name: '简单复盘', desc: '轻量级数据复盘，一网打尽核心信息。' },
    ],
    []
  )

  const stages = useMemo(
    () => [
      { phase: '第一阶段', title: '建立认知框架', desc: '通过心理测评了解自己，通过情绪表格理解市场周期，建立基础认知。' },
      { phase: '第二阶段', title: '掌握分析工具', desc: '学习使用板块节奏系统和板块助手，培养数据驱动的市场分析习惯。' },
      { phase: '第三阶段', title: '养成复盘习惯', desc: '每日使用复盘系统梳理市场，积累交易日志，形成自己的交易图鉴。' },
      { phase: '第四阶段', title: '体系融合迭代', desc: '将所有工具融入个人交易体系，持续迭代优化，实现稳定进步。' },
    ],
    []
  )

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#ff8c42]/10 via-white to-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#ff8c42]/20">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#ff8c42] text-white">
            陪伴营
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            深度陪伴 · 全产品 · 永久
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              深度陪伴式学习，全体系产品永久访问
            </h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              陪伴营不是一门课程，而是一个完整的交易成长体系。加入后永久解锁全部产品工具，
              在实战中持续学习、复盘、迭代，用时间换成长。不定期开放，名额有限。
            </p>
          </div>
          {/* Learning Path SVG */}
          <svg className="w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0" viewBox="0 0 120 120" fill="none">
            {/* Steps */}
            <rect x="15" y="85" width="22" height="20" rx="4" fill="#ff8c42" fillOpacity="0.15" stroke="#ff8c42" strokeWidth="1.5" />
            <rect x="42" y="65" width="22" height="40" rx="4" fill="#ff8c42" fillOpacity="0.2" stroke="#ff8c42" strokeWidth="1.5" />
            <rect x="69" y="45" width="22" height="60" rx="4" fill="#ff8c42" fillOpacity="0.25" stroke="#ff8c42" strokeWidth="1.5" />
            <rect x="96" y="25" width="22" height="80" rx="4" fill="#ff8c42" fillOpacity="0.3" stroke="#ff8c42" strokeWidth="1.5" />
            {/* Arrow */}
            <path d="M20 80 L107 20" stroke="#e67d3a" strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" />
            <path d="M102 18 L110 20 L105 27" stroke="#e67d3a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* Star at top */}
            <circle cx="107" cy="15" r="5" fill="#ff8c42" fillOpacity="0.3" stroke="#ff8c42" strokeWidth="1" />
          </svg>
        </div>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: '产品权限', value: '全部' },
            { label: '有效期', value: '永久' },
            { label: '开放方式', value: '不定期' },
            { label: '学习路径', value: '4阶段' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="text-2xl font-semibold text-gray-900">{s.value}</div>
              <div className="mt-1 text-xs text-gray-600">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 陪伴营理念 */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">陪伴营理念</h2>
        <p className="text-gray-700 leading-relaxed mb-3">
          交易是一条需要长期积累的路，没有捷径，但可以少走弯路。陪伴营的核心不是"教你怎么做"，
          而是"陪你一起走"——提供工具、提供方法、提供环境，让你在实战中自己成长。
        </p>
        <p className="text-gray-700 leading-relaxed">
          我们相信，好的交易者不是教出来的，而是在正确的框架下，通过大量实践和复盘"长"出来的。
        </p>
      </div>

      {/* 包含权益 */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">包含全部产品权益</h2>
          <p className="text-gray-600 mt-1 text-sm">加入陪伴营即永久解锁以下所有产品，无需额外付费。</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {benefits.map((b) => (
            <div key={b.name} className="group rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-[#ff8c42]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-[#ff8c42]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{b.name}</h3>
                  <p className="mt-1 text-sm text-gray-700">{b.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 学习路径 */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">推荐学习路径</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          不需要一次学完所有工具，按照阶段循序渐进，每个阶段都有明确的目标和对应的工具。
        </p>
        <div className="space-y-4">
          {stages.map((s, i) => (
            <div key={s.phase} className="flex items-start gap-4">
              <div className="flex flex-col items-center flex-shrink-0">
                <span className="w-8 h-8 rounded-full bg-[#ff8c42] text-white text-sm flex items-center justify-center font-medium">
                  {i + 1}
                </span>
                {i < stages.length - 1 && <div className="w-0.5 h-8 bg-[#ff8c42]/20 mt-1" />}
              </div>
              <div className="pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-[#ff8c42] font-medium">{s.phase}</span>
                </div>
                <h3 className="font-semibold text-gray-900">{s.title}</h3>
                <p className="mt-1 text-sm text-gray-700">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 适合人群 */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">适合人群</h2>
        <div className="space-y-4">
          {[
            { type: '想系统学习的新手', desc: '有学习意愿但不知道从哪开始，需要一套完整的工具和方法论。' },
            { type: '遇到瓶颈的老手', desc: '交易多年但一直无法突破，需要重新审视自己的交易体系。' },
            { type: '追求长期成长的人', desc: '不急于求成，愿意花时间通过复盘和实践持续进步。' },
            { type: '需要全套工具的人', desc: '不想单独购买多个产品，希望一次性获得全部工具的永久使用权。' },
          ].map((item) => (
            <div key={item.type} className="flex items-start gap-3">
              <span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-[#ff8c42] flex-shrink-0" />
              <div>
                <span className="font-medium text-gray-900">{item.type}：</span>
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
          陪伴营是一个完整的交易成长体系——全部产品永久解锁，按阶段循序渐进，
          在实战中用工具辅助学习、复盘、迭代。不定期开放，适合愿意长期投入的交易者。
        </p>
      </div>

      {/* 用户评价 */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">用户评价</h2>
        <div className="grid grid-cols-1 gap-4">
          {[
            { name: '学员A', duration: '加入1年', content: '陪伴营最大的价值不是某个单独的工具，而是把所有工具串起来形成体系。心理测评让我认识自己，复盘系统帮我记录成长，板块系统辅助分析——组合在一起的效果比单独用强很多。' },
            { name: '学员B', duration: '加入8个月', content: '从基金转到短线，一开始完全不知道怎么看盘。陪伴营的学习路径比较清晰，先建立认知再学工具，不会一上来就被信息淹没。永久权限也让我可以按自己的节奏来。' },
            { name: '学员C', duration: '加入6个月', content: '工作忙没法全职盯盘，但每天晚上花半小时用复盘系统梳理一下市场，周末用板块系统看看节奏，慢慢也建立起了自己的市场感觉。没有时间压力这点很重要。' },
          ].map((review) => (
            <div key={review.name} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-gray-900">{review.name}</span>
                <span className="text-xs text-gray-500">{review.duration}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{review.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
