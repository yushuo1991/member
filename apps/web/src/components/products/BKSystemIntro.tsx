'use client'

import { useMemo } from 'react'

type Feature = {
  title: string
  desc: string
  tag?: string
}

export default function BKSystemIntro() {
  const features: Feature[] = useMemo(
    () => [
      {
        title: '7天涨停排行',
        desc: '自动统计过去7天各板块涨停个数总和，快速识别近期市场最活跃的板块方向。',
        tag: '板块',
      },
      {
        title: '板块梯队追踪',
        desc: '点击任意板块，查看每日涨停个股梯队，按连板数或涨幅排序，一目了然。',
        tag: '梯队',
      },
      {
        title: '后续5天溢价',
        desc: '记录每只涨停股后续5天的溢价情况，直观判断板块延续性和赚钱效应。',
        tag: '溢价',
      },
      {
        title: '板块强度对比',
        desc: '多板块并排展示，通过溢价颜色直观对比板块强弱，辅助判断资金流向。',
        tag: '对比',
      },
      {
        title: 'K线/分时联动',
        desc: '点击个股直接查看K线图和分时图，快速复盘不用切换软件。',
        tag: '图表',
      },
      {
        title: '手机端适配',
        desc: '横屏显示完整数据，竖屏左右滑动查看历史，随时随地复盘。',
        tag: '移动',
      },
    ],
    []
  )

  const concepts = useMemo(
    () => [
      {
        title: '看板块A',
        desc: '识别当前有表现的板块，通过涨停数量衡量板块热度。',
      },
      {
        title: '看板块B',
        desc: '同时关注其他活跃板块，理解市场资金分布。',
      },
      {
        title: '看A和B的联系',
        desc: '成交量够时共生共涨，成交量固定时此起彼伏（跷跷板效应）。',
      },
      {
        title: '看A的发展',
        desc: '追踪板块从分歧到一致、从一致到分歧的演化过程。',
      },
      {
        title: '看发展后的联系',
        desc: '当B板块分歧时，资金是否流向A？谁是前排个股？',
      },
    ],
    []
  )

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#ff8c42]/10 via-white to-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#ff8c42]/20">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#ff8c42] text-white">
            宇硕板块节奏系统
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            联系 · 发展 · 数据驱动
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          用联系和发展的视角看市场：把板块节奏"记下来"
        </h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          情绪短线难学的原因之一，是需要不断看联动——A板块和B板块的联动，A个股和B个股的联动。
          如果不去记录，只靠脑袋记，很难理清它们之间的演化和发展。这个系统就是为了把联系和发展具象化表达出来。
        </p>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: '数据维度', value: '7天' },
            { label: '溢价追踪', value: '5天' },
            { label: '板块排行', value: 'Top5' },
            { label: '历史回溯', value: '1个月' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="text-2xl font-semibold text-gray-900">{s.value}</div>
              <div className="mt-1 text-xs text-gray-600">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 核心理念 */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">核心理念：联系与发展</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          市场成交量够时，诸多板块可以共生共涨；成交量萎靡时，共同下跌；成交量固定时，就是此起彼伏的跷跷板关系。
          我们不仅要看当下A板块和B板块的关系，还要看它们各自的演化过程。
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {concepts.map((c, i) => (
            <div
              key={c.title}
              className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-5"
            >
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
          <p className="text-gray-600 mt-1 text-sm">从数据记录到可视化分析，全面辅助板块节奏判断。</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-gray-900">{f.title}</h3>
                {f.tag && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#ff8c42]/10 text-[#ff8c42]">
                    {f.tag}
                  </span>
                )}
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
            {
              scene: '共振节点分析',
              desc: '大盘共振日同时爆发多个题材，通过后续溢价对比，判断哪个板块发育更好、延续性更强。',
            },
            {
              scene: '板块轮动判断',
              desc: '当B板块从一致走向分歧，观察资金是否流向A板块，提前布局可能的轮动机会。',
            },
            {
              scene: '快速复盘',
              desc: '手机端直接查看当日涨停梯队，点击个股看K线，不用切换软件，随时随地完成复盘。',
            },
            {
              scene: '寻找板块核心',
              desc: '通过区间涨幅排序，快速定位板块中发展最好的个股，确定核心标的。',
            },
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

      {/* 用户评价 */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">用户评价</h2>
        <div className="grid grid-cols-1 gap-4">
          {[
            {
              name: '板块轮动研究者',
              duration: '使用6个月',
              content: '以前看板块就是凭感觉，现在有了这个系统，板块之间的强弱对比一目了然。特别是后续5天溢价这个功能，对判断板块延续性帮助很大。',
            },
            {
              name: '短线游击手',
              duration: '使用4个月',
              content: '手机端适配做得不错，通勤路上也能快速看一眼板块情况。7天涨停排行让我能快速定位最近的热点方向，省了不少时间。',
            },
            {
              name: '情绪周期玩家',
              duration: '使用8个月',
              content: '这个系统最大的价值是把板块节奏可视化了。以前只能靠脑子记，现在数据都摆在那里，板块从分歧到一致的过程看得很清楚。',
            },
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

      {/* 产品截图 */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">产品截图</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <img
              key={n}
              src={`/products/bk/${n}.png`}
              alt={`板块节奏系统截图 ${n}`}
              className="w-full rounded-lg shadow-sm"
            />
          ))}
        </div>
      </div>

      {/* 总结 */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm text-white">
        <h2 className="text-lg sm:text-xl font-semibold mb-3">一句话总结</h2>
        <p className="text-white/90 leading-relaxed">
          板块节奏系统通过数据记录，把板块之间的联系、板块自身的发展、以及发展后的联系具象化呈现，
          让你用联系和发展的视角看市场，而不是凭主观臆断。工具辅助判断，但核心还是你对市场的理解。
        </p>
      </div>
    </div>
  )
}
