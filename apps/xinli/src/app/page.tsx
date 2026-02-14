import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-3xl mx-auto text-center">
        <div className="card">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            🎯 龙头与跟风交易心理问卷
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            基于情绪短线交易和龙头战法的可交互式心理诊断工具
          </p>

          <div className="space-y-4 mb-8">
            <div className="p-4 bg-blue-50 rounded-xl text-left">
              <h3 className="font-semibold text-blue-900 mb-2">✨ 核心特性</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✅ 80个精心设计的交易场景</li>
                <li>✅ 实时保存，随时恢复进度</li>
                <li>✅ 详细的心理分析报告</li>
                <li>✅ 历史记录追踪对比</li>
              </ul>
            </div>

            <div className="p-4 bg-yellow-50 rounded-xl text-left">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ 填写提示</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>✅ 必须真实 - 写出您的真实想法和情绪</li>
                <li>✅ 必须详细 - 包括纠结、恐惧、贪婪等内心活动</li>
                <li>✅ 无需完美 - 不要写"正确答案"</li>
                <li>✅ 随时保存 - 不必一次填完，可分多次进行</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl text-left mt-3">
              <p className="text-blue-800 font-semibold text-sm mb-1">📋 关于测评报告</p>
              <p className="text-blue-700 text-xs">试用用户仅支持根据问题进行自我梳理，不会产生测试报告。年费会员填写完成后可导出问卷，由专业人员为您出具个性化分析报告。</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link
              href="/xinli"
              className="btn btn-primary btn-lg px-8 py-3 text-lg"
            >
              开始测评 →
            </Link>
            <Link
              href="/xinli/guide"
              className="btn btn-secondary px-8 py-3 text-lg"
            >
              📖 使用说明
            </Link>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>需要年度会员权限 | 免费用户可试用5次</p>
          </div>
        </div>
      </div>
    </div>
  );
}
