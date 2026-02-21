'use client'

import { useMemo } from 'react'

export default function FuplanIntro() {
  const concepts = useMemo(
    () => [
      { title: '流程化', desc: '把复盘从"随便看看"变成有步骤、有结构的标准流程，不遗漏关键信息。' },
      { title: '可视化', desc: '用图表和数据替代主观感受，让复盘结论有据可依。' },
      { title: '可追溯', desc: '每一次复盘都有记录，回头看时能清晰还原当时的市场状态和自己的判断。' },
      { title: '可迭代', desc: '通过持续复盘积累数据，发现自己交易体系中的薄弱环节并持续改进。' },
    ],
    []
  )

  const features = useMemo(
    () => [
      { title: '每日复盘流程', desc: '结构化的复盘模板，从大盘环境到板块热点到个股操作，逐步梳理不遗漏。', tag: '流程' },
      { title: '情绪记录分析', desc: '记录每日交易情绪状态，长期追踪情绪与盈亏的关联性。', tag: '情绪' },
      { title: '交易日志管理', desc: '完整记录每笔交易的买卖逻辑、执行情况和事后反思。', tag: '日志' },
      { title: '统计图表', desc: '自动生成盈亏曲线、胜率统计、持仓分布等可视化图表。', tag: '图表' },
      { title: '市场快照', desc: '保存每日市场关键数据快照，方便回溯历史行情环境。', tag: '数据' },
      { title: '标签归类', desc: '为复盘内容打标签，按板块、策略、情绪等维度归类检索。', tag: '管理' },
    ],
    []
  )

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#ff8c42]/10 via-white to-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#ff8c42]/20">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#ff8c42] text-white">
            宇硕复盘系统
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            流程 · 记录 · 迭代
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              流程化梳理市场，让复盘成为交易图鉴
            </h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              复盘不是"收盘后随便看看"，而是一套完整的市场梳理流程。宇硕复盘系统帮你把每天的市场信息、
              交易操作、情绪状态结构化记录下来，日积月累形成属于你自己的交易图鉴。
            </p>
          </div>
          {/* Calendar + Chart SVG */}
          <svg className="w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0" viewBox="0 0 120 120" fill="none">
            {/* Calendar */}
            <rect x="15" y="15" width="50" height="45" rx="6" stroke="#ff8c42" strokeWidth="2" fill="#ff8c42" fillOpacity="0.08" />
            <line x1="15" y1="28" x2="65" y2="28" stroke="#ff8c42" strokeWidth="1.5" />
            <line x1="30" y1="15" x2="30" y2="22" stroke="#e67d3a" strokeWidth="2" strokeLinecap="round" />
            <line x1="50" y1="15" x2="50" y2="22" stroke="#e67d3a" strokeWidth="2" strokeLinecap="round" />
            {/* Calendar dots */}
            <circle cx="27" cy="37" r="2" fill="#ff8c42" />
            <circle cx="40" cy="37" r="2" fill="#e67d3a" />
            <circle cx="53" cy="37" r="2" fill="#ff8c42" />
            <circle cx="27" cy="48" r="2" fill="#e67d3a" />
            <circle cx="40" cy="48" r="2" fill="#ff8c42" />
            <circle cx="53" cy="48" r="2" fill="#e67d3a" />
            {/* Chart */}
            <rect x="55" y="60" width="50" height="45" rx="6" stroke="#ff8c42" strokeWidth="2" fill="#ff8c42" fillOpacity="0.05" />
            <polyline points="62,92 70,85 78,88 86,75 94,78 98,70" stroke="#ff8c42" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="62,92 70,90 78,82 86,85 94,80 98,82" stroke="#e67d3a" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 2" />
          </svg>
        </div>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: '复盘模板', value: '结构化' },
            { label: '情绪追踪', value: '每日' },
            { label: '数据图表', value: '自动' },
            { label: '免费试用', value: '5次' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="text-2xl font-semibold text-gray-900">{s.value}</div>
              <div className="mt-1 text-xs text-gray-600">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 复盘理念 */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">复盘理念：从记录到迭代</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          好的复盘不是事后诸葛亮，而是建立一套可重复、可追溯、可迭代的市场观察体系。
          每天花20分钟结构化梳理，一个月后你会发现自己对市场的理解完全不同。
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {concepts.map((c, i) => (
            <div key={c.title} className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-[#ff8c42] text-white text-xs flex items-center justify-center font-medium">
                  {i + 1}
                </span>
                <h3 className="font-semibold text-gray-900">{c.title}</h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 功能特性 */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">六大核心功能</h2>
          <p className="text-gray-600 mt-1 text-sm">从每日复盘到长期统计，覆盖交易复盘全流程。</p>
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
            { scene: '每日收盘复盘', desc: '按照结构化模板梳理当日大盘、板块、个股表现，记录操作和情绪。' },
            { scene: '周末总结回顾', desc: '汇总一周复盘数据，通过图表发现本周交易中的规律和问题。' },
            { scene: '亏损原因排查', desc: '回溯历史复盘记录，对比情绪日志和交易日志，定位亏损的真正原因。' },
            { scene: '策略验证优化', desc: '通过长期复盘数据积累，验证交易策略的有效性并持续优化。' },
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
          复盘系统把"每天看看盘"变成一套有流程、有记录、有数据的市场梳理体系。
          日积月累，你的复盘记录就是一本属于自己的交易图鉴，每一页都是真实的市场经验。
        </p>
      </div>

      {/* 用户评价 */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">用户评价</h2>
        <div className="grid grid-cols-1 gap-4">
          {[
            { name: '学员A', duration: '使用4个月', content: '以前复盘就是翻翻涨停板，现在有了结构化流程，每天20分钟就能把市场梳理清楚。最有用的是情绪记录，回头看才发现自己亏钱的日子情绪评分都很低。' },
            { name: '学员B', duration: '使用6个月', content: '统计图表功能挺实用的，我发现自己周一的胜率明显低于其他日子，调整之后整体收益有提升。数据摆在那里，比自己凭感觉靠谱。' },
            { name: '学员C', duration: '使用2个月', content: '刚开始觉得每天复盘挺麻烦的，坚持一个月后发现对市场的感觉完全不一样了。模板化的流程让我不会遗漏重要信息，慢慢就成习惯了。' },
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
