'use client'

import { useMemo } from 'react'

const VIDEO_LINK = 'https://mp.weixin.qq.com/s/J4ixYxRY7FN4DWaVaSlPyg?mpshare=1&scene=1&srcid=0105jUXKSWzDt0pRUkQdwsWL&sharer_shareinfo=498a87bde624da3a9d0343925e914ba0&sharer_shareinfo_first=498a87bde624da3a9d0343925e914ba0&from=industrynews&color_scheme=light#rd'

type TableItem = {
  key: string
  title: string
  image: string
  points: string[]
}

export default function EmotionTablesIntro() {
  const tables: TableItem[] = useMemo(
    () => [
      {
        key: 'A1',
        title: '表 A1：市场整体数据（2020年底起）',
        image:
          'https://wuqq-obsidian.oss-cn-shanghai.aliyuncs.com/obsidian%E5%9B%BE%E7%89%87/20231120155629.png',
        points: [
          '左侧看"势能"，右侧看"动能"，共振提示机会/风险。',
          '自动底色表达历史极值区间，用于预判次日分歧。',
          '板块栏记录涨停>4的板块，配合后续表格建立板块印象。',
        ],
      },
      {
        key: 'A2',
        title: '表 A2：连板数据溢价',
        image:
          'https://wuqq-obsidian.oss-cn-shanghai.aliyuncs.com/obsidian%E5%9B%BE%E7%89%87/72cfe5ac5510436e9c28366a78ca2ee.png',
        points: [
          '记录2板以上与20cm首板溢价，直观看多空强弱。',
          '出现"黑色块跌停"可能是吹哨信号，用于风险识别。',
          '支持纵向筛选亏钱效应、横向筛选板块节奏。',
        ],
      },
      {
        key: 'A3',
        title: '表 A3：情绪溢价统计',
        image:
          'https://wuqq-obsidian.oss-cn-shanghai.aliyuncs.com/obsidian%E5%9B%BE%E7%89%87/20231120162317.png',
        points: ['用首板/连板数据按权重计算情绪阶段，辅助判断（以人工判断为主）。'],
      },
      {
        key: 'A4',
        title: '表 A4：最高连板 & 断板溢价',
        image:
          'https://wuqq-obsidian.oss-cn-shanghai.aliyuncs.com/obsidian%E5%9B%BE%E7%89%87/20231120162603.png',
        points: [
          '晋级向右上、掉队向右下，直观看高度演化。',
          '用于观察高度压制与做空动能逆转。',
        ],
      },
      {
        key: 'A5',
        title: '表 A5：板块强度',
        image:
          'https://wuqq-obsidian.oss-cn-shanghai.aliyuncs.com/obsidian%E5%9B%BE%E7%89%87/20231120162758.png',
        points: ['数据源来自板块强度，用于观察板块轮动与强弱变化。'],
      },
      {
        key: 'A6',
        title: '表 A6：板块梯队（节奏）',
        image:
          'https://wuqq-obsidian.oss-cn-shanghai.aliyuncs.com/obsidian%E5%9B%BE%E7%89%87/20231120162904.png',
        points: [
          '一栏一个题材，按首封时间排序，节奏一眼可见。',
          '可同时观察板块内部节奏与板块间竞争。',
        ],
      },
      {
        key: 'A7',
        title: '表 A7：连板个股溢价情况',
        image:
          'https://wuqq-obsidian.oss-cn-shanghai.aliyuncs.com/obsidian%E5%9B%BE%E7%89%87/20231120152139.png',
        points: [
          '记录连板属性及后两日溢价，直观反映情绪。',
          '名称底色区分形态（如一字/T字），便于快速筛选。',
        ],
      },
      {
        key: 'A8',
        title: '表 A8：趋势板块及个股（参考）',
        image:
          'https://wuqq-obsidian.oss-cn-shanghai.aliyuncs.com/obsidian%E5%9B%BE%E7%89%87/20231120163424.png',
        points: ['按区间涨幅排行的板块/个股与溢价，用于趋势行情核心捕捉。'],
      },
    ],
    []
  )

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#ff8c42]/10 via-white to-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#ff8c42]/20">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#ff8c42] text-white">
            宇硕情绪周期表格
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            共 8 表 · 用于复盘/看盘
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">把情绪"看得见"：从数据到节奏，一套表格打通</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          这套表格是我长期复盘与实战中不断优化的记录体系，用于快速捕捉市场整体势能/动能、连板溢价、情绪阶段、
          高度演化与板块节奏。照着设计思路，你也可以复刻出属于自己的版本。
        </p>

        <div className="mt-4">
          <a
            href={VIDEO_LINK}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#ff8c42] text-white hover:bg-[#e67d3a] transition-colors font-medium"
          >
            点击观看表格解读，精准判断情绪
          </a>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">8 张核心表格（逐表说明）</h2>
        <p className="text-sm text-gray-600 mb-4">按"看整体 → 看溢价 → 看高度 → 看板块节奏"的顺序组织。</p>

        <div className="grid grid-cols-1 gap-5">
          {tables.map((t) => (
            <div key={t.key} className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
                <div className="font-semibold text-gray-900">{t.title}</div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#ff8c42]/10 text-[#ff8c42]">
                  {t.key}
                </span>
              </div>

              <div className="p-5 space-y-4">
                <img
                  src={t.image}
                  alt={t.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full rounded-2xl border border-gray-100 shadow-sm"
                  referrerPolicy="no-referrer"
                />

                <ul className="space-y-2">
                  {t.points.map((p) => (
                    <li key={p} className="flex items-start text-sm text-gray-700">
                      <span className="mt-1 mr-2 inline-block w-1.5 h-1.5 rounded-full bg-[#ff8c42]" />
                      <span className="leading-relaxed">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">适合谁</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: '想系统复盘', desc: '用结构化数据沉淀盘感，复盘不再"凭感觉"。' },
            { title: '想看懂情绪', desc: '从溢价、连板、高度与板块节奏理解周期变化。' },
            { title: '想提升效率', desc: '减少信息筛选与记忆负担，把精力留给决策。' },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl border border-gray-100 p-5 bg-gradient-to-br from-white to-gray-50">
              <div className="font-semibold text-gray-900">{c.title}</div>
              <div className="mt-2 text-sm text-gray-700 leading-relaxed">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">用户评价</h2>
        <div className="grid grid-cols-1 gap-4">
          {[
            {
              name: '复盘达人',
              duration: '使用6个月',
              content: '以前复盘就是随便看看涨停板，现在有了这套表格，每天花20分钟就能把市场情绪摸清楚。特别是连板溢价那张表，对判断次日该不该追高帮助很大。',
            },
            {
              name: '情绪周期研究者',
              duration: '使用1年',
              content: '表格设计得很用心，从势能到动能，从高度到板块节奏，逻辑很清晰。我现在基本每天都会看A1和A2表，已经成习惯了。',
            },
            {
              name: '短线新手',
              duration: '使用3个月',
              content: '刚开始看不太懂，后来看了宇硕的解读视频才明白每张表的用法。现在慢慢能看出一些规律了，比如黑色块出现确实要小心。',
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
    </div>
  )
}

