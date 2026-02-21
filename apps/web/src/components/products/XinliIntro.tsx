'use client'

import { useMemo } from 'react'

export default function XinliIntro() {
  const dimensions = useMemo(
    () => [
      { title: '风险感知', desc: '面对亏损和回撤时的心理反应模式，是否容易恐慌或麻木。' },
      { title: '贪婪控制', desc: '盈利时的心态管理，能否及时止盈而非被贪婪驱动。' },
      { title: '纪律执行', desc: '能否严格执行交易计划，还是频繁临时改变策略。' },
      { title: '情绪稳定', desc: '连续盈亏后的情绪波动程度，是否影响后续决策。' },
      { title: '认知偏差', desc: '是否存在确认偏误、锚定效应等常见认知陷阱。' },
    ],
    []
  )

  const scenarios = useMemo(
    () => [
      { q: '当持仓大幅亏损时，你通常会...', a: '测试你的止损纪律与恐慌应对' },
      { q: '连续3天盈利后，你的仓位会...', a: '测试盈利后的贪婪与过度自信' },
      { q: '看到朋友推荐的股票大涨，你会...', a: '测试从众心理与FOMO情绪' },
      { q: '计划好的买点到了但大盘在跌，你会...', a: '测试计划执行力与市场噪音干扰' },
      { q: '卖出后股票继续大涨，你的反应是...', a: '测试后悔情绪与决策复盘能力' },
      { q: '账户连续一周没有操作机会，你会...', a: '测试耐心与空仓焦虑' },
    ],
    []
  )

  const features = useMemo(
    () => [
      { title: '80场景问卷', desc: '覆盖交易全流程的心理场景，从选股到持仓到卖出，全面扫描心理盲点。', tag: '核心' },
      { title: '五维心理画像', desc: '从风险感知、贪婪控制、纪律执行、情绪稳定、认知偏差五个维度生成画像。', tag: '分析' },
      { title: '个性化建议', desc: '根据测评结果，给出针对性的心理调节建议和训练方法。', tag: '建议' },
      { title: '历史对比', desc: '多次测评结果对比，追踪心理状态的变化趋势。', tag: '追踪' },
      { title: '交易日志关联', desc: '将心理测评与实际交易记录关联，验证心理因素对交易的影响。', tag: '关联' },
      { title: '移动端适配', desc: '手机端流畅答题，随时随地完成心理测评。', tag: '移动' },
    ],
    []
  )

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#ff8c42]/10 via-white to-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#ff8c42]/20">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#ff8c42] text-white">
            心理测评系统
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            认知 · 情绪 · 纪律
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              80个交易场景，深度扫描你的心理盲点
            </h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              大多数交易者亏损的根源不是策略，而是心理。恐惧让你过早止损，贪婪让你错过止盈，
              从众让你追高接盘。心理测评系统通过80个真实交易场景，帮你找到那些"你以为没问题，但其实一直在亏钱"的心理模式。
            </p>
          </div>
          {/* Brain + Waveform SVG */}
          <svg className="w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="50" r="30" stroke="#ff8c42" strokeWidth="2" fill="#ff8c42" fillOpacity="0.08" rx="8" />
            <path d="M45 50c3-8 7-12 15-12s12 4 15 12" stroke="#ff8c42" strokeWidth="2" strokeLinecap="round" />
            <path d="M48 45c2-5 5-8 12-8s10 3 12 8" stroke="#e67d3a" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="55" cy="44" r="2" fill="#ff8c42" />
            <circle cx="65" cy="44" r="2" fill="#ff8c42" />
            {/* Waveform */}
            <polyline points="15,95 25,95 30,85 35,105 40,80 45,100 50,90 55,95 60,75 65,105 70,85 75,95 80,90 85,95 90,88 95,95 105,95" stroke="#ff8c42" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="15" y1="95" x2="105" y2="95" stroke="#e67d3a" strokeWidth="0.5" strokeDasharray="3 3" />
          </svg>
        </div>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: '场景题目', value: '80道' },
            { label: '分析维度', value: '5大' },
            { label: '深度报告', value: '个性化' },
            { label: '免费试用', value: '5次' },
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
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">为什么交易心理如此重要？</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          研究表明，80%以上的交易失误源于心理因素而非技术分析。同样的策略，不同心理状态下执行的结果天差地别。
          认识自己的心理模式，是稳定盈利的第一步。
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dimensions.map((d, i) => (
            <div key={d.title} className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-[#ff8c42] text-white text-xs flex items-center justify-center font-medium">
                  {i + 1}
                </span>
                <h3 className="font-semibold text-gray-900">{d.title}</h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{d.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 场景示例 */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">场景问题示例</h2>
          <p className="text-gray-600 mt-1 text-sm">以下是80道场景题中的部分示例，每道题都对应真实的交易心理维度。</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {scenarios.map((s) => (
            <div key={s.q} className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-5">
              <p className="font-medium text-gray-900 mb-2">"{s.q}"</p>
              <p className="text-sm text-[#ff8c42]">{s.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 功能特性 */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">六大核心功能</h2>
          <p className="text-gray-600 mt-1 text-sm">从测评到分析到改进，形成完整的心理提升闭环。</p>
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
            { scene: '新手入门自测', desc: '刚开始做交易，通过测评了解自己的心理基线，提前规避常见心理陷阱。' },
            { scene: '连续亏损后复盘', desc: '亏损不一定是策略问题，测评帮你判断是否是心理因素导致执行变形。' },
            { scene: '阶段性自我检查', desc: '每月或每季度做一次测评，追踪心理状态变化，及时调整。' },
            { scene: '交易体系完善', desc: '将心理测评纳入交易体系，让"知行合一"不再只是口号。' },
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
          交易心理测评不是算命，而是一面镜子——帮你看清那些在盘中反复让你亏钱的心理模式。
          认识问题是解决问题的第一步，80道场景题，给你一份属于自己的交易心理画像。
        </p>
      </div>

      {/* 用户评价 */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">用户评价</h2>
        <div className="grid grid-cols-1 gap-4">
          {[
            { name: '学员A', duration: '使用3个月', content: '做完测评才发现自己最大的问题是"报复性交易"——亏了就想马上赚回来，结果越亏越多。现在每次有冲动的时候都会想起测评结果，冷静了不少。' },
            { name: '学员B', duration: '使用5个月', content: '我一直觉得自己心态挺好的，测评结果显示我在"确认偏误"上得分很高——只看支持自己判断的信息。意识到这点后开始刻意寻找反面证据，确实有改善。' },
            { name: '学员C', duration: '使用2个月', content: '从量化转到主观交易后一直不适应，测评帮我找到了问题：我对不确定性的容忍度很低，习惯了数据驱动后很难接受模糊决策。知道问题在哪就好办了。' },
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
