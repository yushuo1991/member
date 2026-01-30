'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';

export default function LearningCircleGuidePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [copiedNode, setCopiedNode] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/products/circle/guide');
      return;
    }
    if (user?.membershipLevel === 'none') {
      router.push('/products/circle');
      return;
    }
    setIsLoading(false);
  }, [isAuthenticated, user, router]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNode(true);
    setTimeout(() => setCopiedNode(false), 2000);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 pb-12 px-4 text-center">
          <div className="animate-pulse">加载中...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <section className="pt-20 sm:pt-24 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#ff8c42]/10 via-white to-white">
        <div className="max-w-4xl mx-auto">
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li><Link href="/" className="hover:text-gray-900">首页</Link></li>
              <li>/</li>
              <li><Link href="/products/circle" className="hover:text-gray-900">学习圈</Link></li>
              <li>/</li>
              <li className="text-gray-900 font-medium">必读指南</li>
            </ol>
          </nav>
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#ff8c42] text-white text-sm font-medium mb-4">宇硕学习圈必读指南</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">欢迎加入宇硕学习圈</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">本群是学习群，旨在辅助群友打造属于自己的模式，提升对情绪演化的理解，进而增强对市场的理解力。</p>
          </div>
        </div>
      </section>
      <section className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-[#ff8c42] text-white rounded-lg flex items-center justify-center text-sm">核</span>
              学习圈核心价值
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>本学习圈最大的价值不仅是为你提供了快速的学习路线和高价值材料，更重要的是帮你屏蔽掉了非捷径的选项，防止学错方向耽误几年。</p>
              <p>根据提问情况，摘选合适的问题放在群内讨论，如果您是初学，建议您先认真学习指南内容，循序渐进的建立对市场的理解，而后再尝试解决市场问题。</p>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-red-50 rounded-xl border border-red-100"><div className="font-medium text-red-700">A区域 - 学习路径</div><div className="text-sm text-red-600">定制的学习路线和资料</div></div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100"><div className="font-medium text-blue-700">B区域 - 盘面解读</div><div className="text-sm text-blue-600">当下盘面解读和复盘</div></div>
              <div className="p-3 bg-orange-50 rounded-xl border border-orange-100"><div className="font-medium text-orange-700">C区域 - 工具使用</div><div className="text-sm text-orange-600">高效复盘工具，Ai辅助学习</div></div>
              <div className="p-3 bg-green-50 rounded-xl border border-green-100"><div className="font-medium text-green-700">D区域 - 辅助成长</div><div className="text-sm text-green-600">高价值工具辅助使用</div></div>
            </div>
          </div>

          {/* A区域 - 学习路径 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border-l-4 border-red-500">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">A、定制的学习路径和资料</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-medium text-gray-900 mb-3">第1步：谨记【交易原则】交易思维</h3>
                <div className="space-y-2 text-gray-700 text-sm">
                  <p><strong>联系而非孤立，发展而非静止，多空转换，辩证思考。</strong></p>
                  <p><strong>择时：</strong>情绪转暖试错新龙，情绪主升聚焦主线，情绪钝化减仓博弈，情绪衰退空仓休息。</p>
                  <p><strong>选股：</strong>关注主流核心，关注最强合力票。</p>
                  <p><strong>操作：</strong>买在共振弱转强，卖在鼎盛强转弱。</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-medium text-gray-900 mb-3">第2步：【学习方法与大局观培养】</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>0、《宇硕情绪短线基础名词科普》</li>
                  <li>1、《股市大框架与加速悟道的方法》</li>
                  <li>2、《从大本大源处探究股市盈利的根本》</li>
                  <li>3、《情绪节点与龙头股的全系买点梳理》</li>
                  <li>4、《如何通过资金角度本质的分析市场》</li>
                  <li>5、悟道篇系列视频</li>
                </ul>
                <div className="mt-3 text-sm text-gray-500">
                  <p>下方附件仅作学习词典使用，不是重点学习内容：</p>
                  <p>附1、《宇硕学习圈-基础概念词典（基本面）》</p>
                  <p>附2、《宇硕学习圈-基础概念词典（技术面）》</p>
                </div>
              </div>
              <a href="https://pan.baidu.com/s/1Cs3tmmMn-QJ2A28zpfxTEg?pwd=d617" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors group">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📚</span>
                  <div><div className="font-medium text-gray-900">学习资料下载</div><div className="text-sm text-gray-500">百度网盘 · 提取码: d617</div></div>
                </div>
                <span className="text-gray-400 group-hover:text-gray-600">→</span>
              </a>
              <p className="text-sm text-gray-600">学习完成后，梳理自己的笔记，对照视频记录对自己有帮助的内容，初步建立自己的股市学习框架。</p>
            </div>
          </div>

          {/* B区域 - 盘面解读 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border-l-4 border-blue-500">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">B、当前市场理解视频，每日更新</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-medium text-gray-900 mb-2">第1步：【盘后更新】</h3>
                <p className="text-gray-700 text-sm">每日的解盘视频可选择看完，理解当下行情。跟随市场盘面，理解盘面节奏，在微信群中积极讨论，在实践和讨论中发现盲点，讨论学习。对于解盘的内容不要盲目跟票。</p>
              </div>
              <a href="https://pan.baidu.com/s/1S0cQTYeDuyja73dDxDSGKg?pwd=555p" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📰</span>
                  <div><div className="font-medium text-gray-900">每晚更新链接</div><div className="text-sm text-gray-500">百度网盘 · 提取码: 555p</div></div>
                </div>
                <span className="text-gray-400 group-hover:text-gray-600">→</span>
              </a>
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-medium text-gray-900 mb-2">第2步：【盘中同步】</h3>
                <p className="text-gray-700 text-sm">市面上超150+大V的盘中资讯，从交易回测，操作风格，盘面问答，逻辑研判，授课风格等多方面，优选出多位最优质的短线老师，供补充学习</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-3">MX技术 安装指南</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p><strong>安卓：</strong>复制到浏览器下载：mx小站下载</p>
                  <p className="text-xs text-blue-600">请用手机打开下载地址。【不要在微信内直接打开，不要用360浏览器打开】</p>
                  <p><strong>苹果：</strong>商店搜索 MX技术</p>
                  <p><strong>网页版：</strong>MX技术小筑</p>
                </div>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <h3 className="font-medium text-yellow-900 mb-2">节点配置</h3>
                <p className="text-sm text-yellow-800 mb-3">账号私信我获取，而后账号如果登录不上需要配置节点：</p>
                <div className="flex items-center justify-between bg-white rounded-lg p-3">
                  <code className="text-blue-600 font-mono text-sm">http://43.142.67.10:1001</code>
                  <button onClick={() => copyToClipboard('http://43.142.67.10:1001')} className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors">{copiedNode ? '已复制' : '复制'}</button>
                </div>
                <p className="text-xs text-yellow-700 mt-2">请注意，某些苹果机型，复制节点过去后，最后面会自动加上斜杠。记得要删除最后面的斜杠。节点地址是复制到APP那里面去的，不需要点击打开。</p>
              </div>
            </div>
          </div>

          {/* 特别强调 */}
          <div className="bg-red-50 rounded-2xl p-5 sm:p-6 shadow-sm border border-red-200">
            <h2 className="text-lg font-semibold text-red-900 mb-3">特别强调</h2>
            <ul className="space-y-2 text-red-800">
              <li>1. 群内仅作思路交流，无暗示，不带票，不要跟票。</li>
              <li>2. 初学降低仓位至1w以下，学习为先，不要在没理解的情况下推重仓。</li>
              <li>3. 本阶段的可按自己的时间安排完成学习。视频中的内容不必全部理解，但是建立首先建立一个全盘视角非常重要。</li>
            </ul>
          </div>

          {/* C区域 - 工具使用 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border-l-4 border-orange-500">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">C、使用工具</h2>
            <div className="space-y-4">
              <div className="bg-orange-50 rounded-xl p-4">
                <h3 className="font-medium text-orange-900 mb-2">宇硕板块助手</h3>
                <p className="text-sm text-orange-800">一键同步核心个股工具</p>
                <p className="text-sm text-orange-700 mt-2">使用教程：宇硕板块助手 | 一键梳理核心个股</p>
                <p className="text-xs text-orange-600 mt-1">不能访问请私信我提供</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4">
                <h3 className="font-medium text-orange-900 mb-2">ima情绪超短知识库</h3>
                <p className="text-sm text-orange-800">18000多篇干货文章</p>
                <a href="https://ima.qq.com" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">腾讯ima - 知识库</a>
                <p className="text-sm text-orange-700 mt-2">点击上方链接，广场搜索游资情绪周期，加入即可</p>
                <p className="text-xs text-orange-600 mt-1">文章总数超1.8万篇，包含短线干货，历史行情，指标公式，游资心得等，可借助Ai辅助学习股票</p>
              </div>
            </div>
          </div>

          {/* D区域 - 辅助成长 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border-l-4 border-green-500">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">D、辅助成长，快速进步</h2>
            <p className="text-sm text-gray-500 mb-4">（下方介绍为个人常用的辅助工具，思路可学习借鉴，【不包含在学习圈】，可私信我单独购买）</p>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-xl"><span className="font-medium text-gray-900">1、情绪表格</span><span className="text-gray-600 text-sm"> —— 感知当下情绪，方便周期复盘</span></div>
              <div className="p-3 bg-gray-50 rounded-xl"><span className="font-medium text-gray-900">2、复盘看盘版面</span><span className="text-gray-600 text-sm"> —— 高效复盘看盘，宇硕独家出品</span></div>
              <div className="p-3 bg-gray-50 rounded-xl"><span className="font-medium text-gray-900">3、情绪周期笔记（14页）</span></div>
              <div className="p-3 bg-gray-50 rounded-xl"><span className="font-medium text-gray-900">4、简单复盘</span><span className="text-gray-600 text-sm"> —— 视频教程</span></div>
              <div className="p-3 bg-gray-50 rounded-xl"><span className="font-medium text-gray-900">5、万0.85免5开户，最低1毛</span><p className="text-gray-600 text-sm mt-1">做超短，是一定要有低佣费率的账号，一年能节省几千元手续费，免5账户也越来越难开了，建议备一个。</p></div>
            </div>
            <div className="mt-4 bg-green-50 rounded-xl p-4">
              <h3 className="font-medium text-green-900 mb-2">费率对比举例</h3>
              <div className="text-sm text-green-800 space-y-2">
                <div><p className="font-medium">一笔交易5000元</p><p>万0.85免5最低一毛：手续费5毛</p><p>万2.5不免5：手续费5元</p></div>
                <div><p className="font-medium">一笔交易10万元</p><p>万0.85免5最低一毛：手续费8.5元</p><p>万2.5不免5：手续费25元</p></div>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center pt-4">
            <Link href="/products/circle" className="inline-flex items-center justify-center px-6 py-3 bg-[#ff8c42] text-white rounded-full font-medium hover:bg-[#e67d3a] transition-colors">返回学习圈产品页</Link>
          </div>
        </div>
      </section>
      <footer className="bg-white border-t border-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center text-gray-600 text-sm">
          <p>&copy; 2024 宇硕短线. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
