import Link from 'next/link';

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">📖 使用说明</h1>
            <Link href="/xinli" className="btn btn-secondary">
              返回测评
            </Link>
          </div>

          <div className="prose prose-blue max-w-none">
            <h2>系统简介</h2>
            <p>
              这是一个基于<strong>情绪短线交易</strong>和<strong>龙头战法</strong>的可交互式心理诊断工具。
              通过80个精心设计的交易场景，全面评估您的交易心理特征。
            </p>

            <h2>核心特性</h2>
            <ul>
              <li>✅ 80个精心设计的交易场景</li>
              <li>✅ 实时保存，随时恢复进度</li>
              <li>✅ 详细的心理分析报告</li>
              <li>✅ 历史记录追踪对比</li>
              <li>✅ 支持导出Markdown格式</li>
            </ul>

            <h2>填写提示</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <ul className="mb-0">
                <li><strong>必须真实</strong> - 写出您的真实想法和情绪</li>
                <li><strong>必须详细</strong> - 包括纠结、恐惧、贪婪等内心活动</li>
                <li><strong>无需完美</strong> - 不要写"正确答案"</li>
                <li><strong>随时保存</strong> - 不必一次填完，可分多次进行</li>
              </ul>
            </div>

            <h2>场景分类（80个）</h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    类别
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    场景数
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    说明
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">一、持有龙头</td>
                  <td className="px-6 py-4 whitespace-nowrap">17</td>
                  <td className="px-6 py-4">持有龙头股时的各种情况</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">二、持有跟风</td>
                  <td className="px-6 py-4 whitespace-nowrap">15</td>
                  <td className="px-6 py-4">持有跟风股时的各种情况</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">三、空仓观望</td>
                  <td className="px-6 py-4 whitespace-nowrap">10</td>
                  <td className="px-6 py-4">空仓时的入场时机判断</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">四、特殊情境</td>
                  <td className="px-6 py-4 whitespace-nowrap">5</td>
                  <td className="px-6 py-4">盘中实时决策场景</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">五、隔日表现</td>
                  <td className="px-6 py-4 whitespace-nowrap">4</td>
                  <td className="px-6 py-4">隔日走势的应对策略</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">六、连板高度</td>
                  <td className="px-6 py-4 whitespace-nowrap">4</td>
                  <td className="px-6 py-4">高度板相关决策</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">七、仓位管理</td>
                  <td className="px-6 py-4 whitespace-nowrap">5</td>
                  <td className="px-6 py-4">加减仓时机判断</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">八、换股决策</td>
                  <td className="px-6 py-4 whitespace-nowrap">6</td>
                  <td className="px-6 py-4">龙头跟风之间切换</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">九、情绪周期</td>
                  <td className="px-6 py-4 whitespace-nowrap">14</td>
                  <td className="px-6 py-4">板块不同阶段应对</td>
                </tr>
              </tbody>
            </table>

            <h2>快捷键</h2>
            <ul>
              <li><kbd>←</kbd> 上一个场景</li>
              <li><kbd>→</kbd> 下一个场景</li>
              <li><kbd>Ctrl+S</kbd> / <kbd>Cmd+S</kbd> 保存进度</li>
            </ul>

            <h2>填写建议</h2>
            <h3>✅ 好的回答</h3>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="font-semibold">场景：我持有龙头，龙头涨停，跟风却跌停</p>
              <p><strong>操作：</strong>卖出一半，留一半观察</p>
              <p><strong>想法：</strong>看到跟风跌停心里很慌，担心龙头也要崩。但理智告诉我龙头还在涨停，应该持有。最后妥协卖一半，感觉很纠结。</p>
              <p className="text-sm text-green-700 mt-2">
                ✅ 具体操作 | ✅ 真实情绪 | ✅ 内心冲突 | ✅ 细节丰富
              </p>
            </div>

            <h3>❌ 不好的回答</h3>
            <div className="bg-red-50 p-4 rounded-lg mt-4">
              <p className="font-semibold">场景：我持有龙头，龙头涨停，跟风却跌停</p>
              <p><strong>操作：</strong>持有</p>
              <p><strong>想法：</strong>按照主线思维应该持有龙头</p>
              <p className="text-sm text-red-700 mt-2">
                ❌ 像背答案 | ❌ 缺少真实想法 | ❌ 太过简略 | ❌ 无法分析
              </p>
            </div>

            <h2>常见问题</h2>
            <h3>Q: 数据会丢失吗？</h3>
            <p>系统每30秒自动保存，关闭前也会保存。但建议定期导出备份。</p>

            <h3>Q: 必须一次填完吗？</h3>
            <p>不需要！随时可以中断，下次打开会自动加载进度。</p>

            <h3>Q: 填错了怎么修改？</h3>
            <p>通过导航栏跳转到对应场景，直接修改即可，自动保存。</p>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <Link href="/xinli" className="btn btn-primary">
              开始测评 →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
