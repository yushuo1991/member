'use client'

import { useMemo } from 'react'

const VIDEO_LINK = 'https://mp.weixin.qq.com/s/68M2Rtno3Trh5r02WrUH4A?mpshare=1&scene=1&srcid=0105Q7RSoJ3442wRRZdQk0dk&sharer_shareinfo=9db4f54af9d43d53928ff086b44ff914&sharer_shareinfo_first=9db4f54af9d43d53928ff086b44ff914&from=industrynews&color_scheme=light#rd'

type LinkItem = { label: string; href: string }

export default function EmotionLayoutIntro() {
  const screenshotsFupan = useMemo(
    () => [
      { src: '/products/fupanbanmian/F0-新闻.png', label: '新闻消息' },
      { src: '/products/fupanbanmian/F1-题材解读.png', label: '题材解读' },
      { src: '/products/fupanbanmian/F02-行情回顾.png', label: '行情回顾' },
      { src: '/products/fupanbanmian/F03-大盘复盘.png', label: '大盘复盘' },
      { src: '/products/fupanbanmian/F04-风格复盘.png', label: '风格复盘' },
      { src: '/products/fupanbanmian/F05-情绪复盘.png', label: '情绪复盘' },
      { src: '/products/fupanbanmian/F06-资金版面.png', label: '资金版面' },
      { src: '/products/fupanbanmian/F07-板块信息.png', label: '板块信息' },
      { src: '/products/fupanbanmian/F08-梯队.png', label: '梯队' },
      { src: '/products/fupanbanmian/F09-个股分时.png', label: '个股分时' },
    ],
    []
  )

  const screenshotsKanpan = useMemo(
    () => [
      { src: '/products/fupanbanmian/K01-情绪.png', label: '情绪' },
      { src: '/products/fupanbanmian/K02-看盘.png', label: '盘面' },
      { src: '/products/fupanbanmian/K03-核心板块.png', label: '核心板块' },
      { src: '/products/fupanbanmian/YS_板块.png', label: '板块总览' },
    ],
    []
  )

  const links: LinkItem[] = useMemo(
    () => [
      { label: '核心干货：情绪周期全系列表格分享（收藏版）', href: 'https://www.taoguba.com.cn/Article/5393606/1' },
      { label: '1小时讲完22个股市高效工具', href: 'https://www.taoguba.com.cn/Article/5347708/1' },
      { label: '顶级视角：如何全面客观本质地分析市场', href: 'https://www.taoguba.com.cn/Article/5464652/1' },
      { label: '全局视角：情绪节点与龙头股买点梳理', href: 'https://www.taoguba.com.cn/Article/5495986/1' },
      { label: '从大本大源处探究如何在股市盈利', href: 'https://www.taoguba.com.cn/Article/5560562/1' },
    ],
    []
  )

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#ff8c42]/10 via-white to-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#ff8c42]/20">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#ff8c42] text-white">
            通达信复盘/看盘版面
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            共 28 个版 · 常用 8 个
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">全面信息捕捉：让复盘与看盘更高效</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          第三次大版本更新，免安装使用。新版版面从两个层级系统构建，新增分时线，不仅能够高效看盘复盘，也蕴含了操盘思路。
        </p>
        <div className="mt-3 text-sm text-gray-700 space-y-1">
          <p><span className="font-medium text-gray-900">复盘：</span>新闻消息 → 题材解读 → 大盘 → 风格 → 情绪 → 板块 → 个股</p>
          <p><span className="font-medium text-gray-900">看盘：</span>情绪 → 盘面 → 板块</p>
        </div>

        <div className="mt-4">
          <a
            href={VIDEO_LINK}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#ff8c42] text-white hover:bg-[#e67d3a] transition-colors font-medium"
          >
            点击查看，如何高效复盘看盘
          </a>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">三版规划（理解设计逻辑）</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              title: '第一版：信息全面',
              desc: '全面客观呈现市场方方面面信息，适合做“全景扫描”。',
            },
            {
              title: '第二版：核心精简',
              desc: '只保留最核心的数据与信号，对新手更友好，快速直观看懂当前环境。',
            },
            {
              title: '第三版：按情绪组合',
              desc: '回归全面信息，但按择时/情绪阶段组合不同版面，做到“阶段看阶段”。',
            },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl border border-gray-100 p-5 bg-gradient-to-br from-white to-gray-50">
              <div className="font-semibold text-gray-900">{c.title}</div>
              <div className="mt-2 text-sm text-gray-700 leading-relaxed">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">设计原则（你可以照着复刻）</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          {[
            '把“必须看”的信息固定位置，减少每天重复寻找。',
            '把“可选看”的信息放到次级版面，避免噪音干扰决策。',
            '不同阶段关注点不同：用“版面组合”替代“临时加指标”。',
            '工具为理解服务：节省精力，把注意力留给市场结构与节奏。',
          ].map((t) => (
            <li key={t} className="flex items-start">
              <span className="mt-1 mr-2 inline-block w-1.5 h-1.5 rounded-full bg-[#ff8c42]" />
              <span className="leading-relaxed">{t}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">复盘版面</h2>
        <p className="text-sm text-gray-600 mb-4">新闻消息 → 题材解读 → 大盘 → 风格 → 情绪 → 板块 → 个股，完整复盘流程。</p>
        <div className="space-y-4">
          {screenshotsFupan.map((item) => (
            <div key={item.src}>
              <p className="text-sm font-medium text-gray-700 mb-2">{item.label}</p>
              <img
                src={item.src}
                alt={`复盘版面 - ${item.label}`}
                loading="lazy"
                decoding="async"
                className="w-full rounded-2xl border border-gray-100 shadow-sm"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">看盘版面</h2>
        <p className="text-sm text-gray-600 mb-4">情绪 → 盘面 → 板块，盘中快速捕捉关键信息。</p>
        <div className="space-y-4">
          {screenshotsKanpan.map((item) => (
            <div key={item.src}>
              <p className="text-sm font-medium text-gray-700 mb-2">{item.label}</p>
              <img
                src={item.src}
                alt={`看盘版面 - ${item.label}`}
                loading="lazy"
                decoding="async"
                className="w-full rounded-2xl border border-gray-100 shadow-sm"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">相关干货（建议收藏）</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow bg-gradient-to-br from-white to-gray-50"
            >
              <span className="text-sm font-medium text-gray-900">{l.label}</span>
              <span className="text-xs text-[#ff8c42]">打开</span>
            </a>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">用户评价</h2>
        <div className="grid grid-cols-1 gap-4">
          {[
            {
              name: '学员A',
              duration: '使用8个月',
              content: '之前自己也折腾过版面，但总是东一块西一块不成体系。用了这套之后才发现信息可以这样组织，复盘的时候关键数据一眼就能看到，效率确实提高了。',
            },
            {
              name: '学员B',
              duration: '使用1年',
              content: '按情绪阶段组合的那版我用得最多，不同阶段切不同版面，省去了临时加指标的麻烦。整体设计思路很清晰，能看出来是实战中打磨出来的。',
            },
            {
              name: '学员C',
              duration: '使用4个月',
              content: '白天上班没时间盯盘，晚上复盘用这套版面挺方便的。核心精简版对我这种时间不多的人比较友好，重点信息都有，不用到处翻。',
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

