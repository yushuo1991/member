'use client'

import { useMemo, useState } from 'react'

const WECHAT_ID = 'yushuoeee'

const upgradeImage =
  'https://mmbiz.qpic.cn/sz_mmbiz_png/vECIuIBmOPEvkkzROXbSH2p5N2Q0HvV1PwKUbyRueIvJpqicaX1FkhYSCXTFVicm9llxMDEPwOdSpCKSkZAbMUcg/640?wx_fmt=png&from=appmsg'
const reviewImage1 =
  'https://mmbiz.qpic.cn/sz_mmbiz_png/vECIuIBmOPEvkkzROXbSH2p5N2Q0HvV1xuDdsjeaP96kibYAPDibnLcUqhmRU9KbzaUNvEPbRNaPo8BiaL0dobxCg/640?wx_fmt=png&from=appmsg'
const reviewImage2 =
  'https://mmbiz.qpic.cn/sz_mmbiz_png/vECIuIBmOPEvkkzROXbSH2p5N2Q0HvV1BMVwlXOvezjg0qCibmwG8icSQph8pM0mEHAAFjTv6FNH78fWnfQP6kHw/640?wx_fmt=png&from=appmsg'
const contactImage =
  'https://mmbiz.qpic.cn/sz_mmbiz_png/vECIuIBmOPEvkkzROXbSH2p5N2Q0HvV1Jria2X6uQdvFIw65Xfatkxke1GYSOriaFzBCCr4xFuE1fLfFpyiaevdYw/640?wx_fmt=png&from=appmsg'

type Theme = {
  title: string
  desc: string
  tag?: string
}

export default function LearningCircleIntro() {
  const [copied, setCopied] = useState(false)

  const themes: Theme[] = useMemo(
    () => [
      {
        title: '定制学习路径',
        desc: '根据你的基础和目标，量身定制学习路线。先学什么、再学什么、怎么验证，不用自己摸索。',
        tag: '学习',
      },
      {
        title: '主流短线思维',
        desc: '清晰的市场主线思维，三套模式反复打磨，帮你过滤非重要细节，理解力胜于模式战法。',
        tag: '方法',
      },
      {
        title: '盘前精选早报',
        desc: '每日早报视频精选关键资讯，开盘前就知道今天看什么、关注什么方向。',
        tag: '资讯',
      },
      {
        title: '盘中实时解盘',
        desc: '交易回测、操作风格、聚焦核心，盘中动态解读帮你快速捕捉机会、避开风险。',
        tag: '实战',
      },
      {
        title: '盘后深度复盘',
        desc: '每日视频解析市场走势、总结规律，把盘感从"凭感觉"变成"可复用的能力"。',
        tag: '复盘',
      },
      {
        title: '情绪节点讨论',
        desc: '对当下情绪节点定性，围绕参与方向共同讨论。学习阶段最怕的就是一个人盲走。',
        tag: '讨论',
      },
      {
        title: '早晚知识卡片',
        desc: '游资前辈语录、知识卡片每日推送，碎片时间也能拓展认知边界。',
        tag: '日更',
      },
      {
        title: '宇硕板块助手',
        desc: '圈内免费使用，一键整理热门板块与核心个股，每天节省一小时筛选时间。',
        tag: '工具',
      },
      {
        title: 'AI知识库 13,000+篇',
        desc: '情绪超短干货文章持续更新，借助AI检索学习，遇到不懂的概念直接搜就有答案。',
        tag: '资料',
      },
    ],
    []
  )

  const stats = useMemo(
    () => [
      { label: '学习圈稳定运行', value: '第 3 年' },
      { label: '全网粉丝', value: '6W+' },
      { label: '单月翻倍', value: '5 次' },
      { label: '知识库沉淀', value: '13,000+' },
    ],
    []
  )

  const copyWechat = async () => {
    try {
      await navigator.clipboard.writeText(WECHAT_ID)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      setCopied(false)
      alert(`微信号：${WECHAT_ID}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#ff8c42]/10 via-white to-white rounded-2xl p-5 sm:p-6 shadow-sm border border-[#ff8c42]/20">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#ff8c42] text-white">
            宇硕学习圈
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            资讯 · 学习 · 实战 · 讨论 · 工具
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">一站式成长圈：把"学的对"变成"走得稳"</h2>
        <p className="mt-3 text-gray-700 leading-relaxed">
          学习圈已稳定运行第三年，把"学习路径、日常资讯、盘中盘后实战、情绪节点讨论、工具与知识库"做成体系化闭环。
          不是给你一堆资料自己看，而是告诉你先学什么、再学什么、怎么验证，让学习阶段不再迷路。
        </p>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="text-2xl font-semibold text-gray-900">{s.value}</div>
              <div className="mt-1 text-xs text-gray-600">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">为什么要做学习圈</h2>
        <div className="space-y-3 text-gray-700 leading-relaxed">
          <p>2019年开始学股票，笔记写了好几本，课程啃了几百个小时好几遍，才知道走错了路，耽误了三年。</p>
          <p>
            股票难在学习阶段无法确定自己走的对不对。我在学习之初，也多希望能有个人引路，给一条清晰的学习路线——先学什么、再学什么就能稳定进步。没有这样的路线，我只能自己琢磨，看了百余套视频，从易到难整理出这套学习路线。每一个趟过来的人都会知道，这样的路线有多宝贵。
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">学习圈九大主题</h2>
          <p className="text-gray-600 mt-1 text-sm">覆盖资讯、学习、实战、讨论与工具，全面提供价值。</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {themes.map((t) => (
            <div
              key={t.title}
              className="group rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-gray-900">{t.title}</h3>
                {t.tag && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#ff8c42]/10 text-[#ff8c42]">
                    {t.tag}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl bg-[#ff8c42]/10 border border-[#ff8c42]/20 p-4 text-sm text-gray-800">
          从资讯解读到实战技巧，从系统学习到社群互动——这里是你炒股进阶的一站式成长圈。
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">这次升级做了哪些工作</h2>
        <p className="text-gray-700 leading-relaxed">
          回访超300人，不断听取社群成员建议，每个人提的建议都编入小册，一步一步继续优化。内容也持续完善，精选最合适的教材，更符合你的学习需求。
        </p>

        <div className="mt-4">
          <img
            src={upgradeImage}
            alt="学习圈升级内容"
            loading="lazy"
            decoding="async"
            className="w-full rounded-2xl border border-gray-100 shadow-sm"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">他们怎么评价学习圈</h2>

        {/* 文字评价 */}
        <div className="grid grid-cols-1 gap-4 mb-5">
          {[
            {
              name: '股海老韭',
              duration: '加入8个月',
              content: '之前自己瞎摸索了两年，走了很多弯路。加入学习圈后才发现，原来有这么清晰的学习路线。现在每天跟着早报和复盘走，慢慢有了自己的节奏感。',
            },
            {
              name: '小散逆袭',
              duration: '加入1年',
              content: '最有价值的是情绪节点的讨论，以前总是追高被套，现在学会了等分歧、看确认。虽然还在学习阶段，但至少知道自己在做什么了。',
            },
            {
              name: '稳健求财',
              duration: '加入5个月',
              content: '知识库真的很强，遇到不懂的概念直接搜，基本都能找到答案。宇硕的复盘视频也很实在，不吹不黑，讲的都是干货。',
            },
            {
              name: '龙头猎手',
              duration: '加入1年半',
              content: '从月费升级到年费了，主要是觉得值。学习路径帮我省了很多时间，不用再到处找资料。板块助手也很好用，每天复盘效率提高了不少。',
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

        {/* 截图评价 */}
        <div className="grid grid-cols-1 gap-4">
          {[reviewImage1, reviewImage2].map((src) => (
            <img
              key={src}
              src={src}
              alt="学员评价"
              loading="lazy"
              decoding="async"
              className="w-full rounded-2xl border border-gray-100 shadow-sm"
              referrerPolicy="no-referrer"
            />
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm text-white">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-semibold">联系方式</h2>
            <p className="mt-2 text-white/80 text-sm leading-relaxed">
              扫描右侧二维码了解详情，或手动添加微信：<span className="font-semibold text-white">{WECHAT_ID}</span>
            </p>

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={copyWechat}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-white text-gray-900 hover:bg-gray-100 transition-colors font-medium"
              >
                {copied ? '已复制微信号' : '复制微信号'}
              </button>
              <div className="text-xs text-white/70 flex items-center">
                建议使用无痕窗口打开二维码图片，避免微信内置浏览器缓存导致加载失败。
              </div>
            </div>
          </div>

          <div className="w-full sm:w-56">
            <img
              src={contactImage}
              alt="联系二维码"
              loading="lazy"
              decoding="async"
              className="w-full rounded-2xl border border-white/10 bg-white"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

