'use client'

import { useMemo, useState } from 'react'

const WECHAT_ID = 'yushuoeee'

type Feature = {
  title: string
  desc: string
  icon: string
}

export default function BoardAssistantIntro() {
  const [copied, setCopied] = useState(false)

  const painPoints = useMemo(
    () => [
      { icon: '🧩', text: '不会划分概念板块，热点来得快、走得也快' },
      { icon: '🧱', text: '不会整理板块梯队与核心股，复盘效率低' },
      { icon: '⏱️', text: '手动整理耗时，盘前准备与盘后复盘都被拖慢' },
    ],
    []
  )

  const features = useMemo<Feature[]>(
    () => [
      {
        icon: '🔄',
        title: '自动同步盘面信息',
        desc: '自动导入当日盘面亮点、亏钱效应，并生成“今天/1天前/2天前”的板块核心清单。',
      },
      {
        icon: '🧠',
        title: '一键生成自定义板块',
        desc: '基于“板块核心”涉及板块的3日涨停表现，自动生成自定义板块列表并按重要性排序。',
      },
      {
        icon: '🏷️',
        title: '智能标记强弱信号',
        desc: '对关键个股做颜色标记：当日强势、历史强势与冲高回落一眼可辨，辅助快速决策。',
      },
      {
        icon: '🧹',
        title: '自动清理与保持整洁',
        desc: '若连续3个交易日未出现在板块核心中，自动移除相关自定义板块，避免信息堆积。',
      },
    ],
    []
  )

  const howTo = useMemo(
    () => [
      { title: '解压并放置', desc: '将文件解压后放到通达信根目录。' },
      { title: '先运行工具', desc: '双击运行板块助手，首次会弹出选项，后续按默认执行。' },
      { title: '再打开通达信', desc: '运行后再启动通达信，即可看到板块与个股已刷新（建议12点前执行）。' },
    ],
    []
  )

  const copyWechat = async () => {
    try {
      await navigator.clipboard.writeText(WECHAT_ID)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <section className="bg-gradient-to-br from-[#ff8c42]/10 via-white to-white rounded-3xl border border-[#ff8c42]/20 p-6 sm:p-10 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#ff8c42]/20 text-[#ff8c42] text-xs font-medium">
              🧰 通达信插件 · 自动化复盘工具
            </div>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900">宇硕板块助手</h2>
            <p className="mt-2 text-gray-600 leading-relaxed">
              用更少的时间，把“热点板块—梯队—核心股—强弱信号”整理成可用的盘前清单与盘后复盘素材。
            </p>
          </div>

          <div className="flex flex-col items-stretch sm:items-end gap-2">
            <button
              onClick={copyWechat}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#ff8c42] text-white font-medium hover:bg-[#e67d3a] transition-colors shadow-sm"
            >
              {copied ? '已复制微信号' : `复制微信号：${WECHAT_ID}`}
            </button>
            <p className="text-xs text-gray-500 sm:text-right">
              获取安装包/更新说明：添加微信并备注“板块助手”
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">解决这些痛点</h3>
          <ul className="mt-4 space-y-3">
            {painPoints.map((item) => (
              <li key={item.text} className="flex gap-3">
                <span className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                  {item.icon}
                </span>
                <p className="text-gray-700 leading-relaxed">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">它会自动做什么</h3>
          <div className="mt-4 grid gap-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-start gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-white border border-gray-200 flex items-center justify-center">
                    {f.icon}
                  </span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{f.title}</h4>
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">快速上手（3步）</h3>
        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          {howTo.map((step, idx) => (
            <div key={step.title} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[#ff8c42]/15 text-[#ff8c42] flex items-center justify-center text-sm font-semibold">
                  {idx + 1}
                </span>
                <h4 className="font-semibold text-gray-900">{step.title}</h4>
              </div>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">用户评价</h3>
        <div className="mt-4 grid gap-4">
          {[
            {
              name: '效率控',
              duration: '使用5个月',
              content: '以前每天手动整理板块要花一个多小时，现在用板块助手几分钟就搞定了。自动生成的自定义板块列表很实用，省去了大量重复劳动。',
            },
            {
              name: '通达信深度用户',
              duration: '使用8个月',
              content: '强弱信号标记这个功能很贴心，当日强势和历史强势用颜色区分，复盘的时候一眼就能看出哪些票值得关注。',
            },
            {
              name: '盘前准备党',
              duration: '使用3个月',
              content: '每天开盘前运行一下，板块核心清单就出来了，盘前准备变得很轻松。自动清理功能也不错，不用担心板块越积越多。',
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
      </section>

      <section className="mt-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
        <h3 className="text-lg font-semibold">适用人群</h3>
        <p className="mt-2 text-sm text-white/80 leading-relaxed">
          适合“想把板块与核心股体系化”“盘前需要快速清单”“盘后想稳定复盘节奏”的短线交易者。
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {['盘前整理', '板块梯队', '核心股清单', '强弱信号', '自动清理'].map((t) => (
            <span
              key={t}
              className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs"
            >
              {t}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}

