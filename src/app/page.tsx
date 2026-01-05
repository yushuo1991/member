import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';

export default function Home() {
  const products = [
    {
      name: '板块节奏系统',
      description: '专业的股市板块轮动分析工具，实时追踪热点板块，把握投资机会',
      features: ['实时板块监控', '资金流向分析', '热点主题挖掘', '板块轮动预测'],
      icon: '📊',
      url: 'https://bk.yushuo.click',
      requiredLevel: 'monthly' as const,
    },
    {
      name: '心理评估系统',
      description: '专业心理健康评估平台，提供科学的心理测评和专业咨询建议',
      features: ['专业量表测评', '心理健康报告', '个性化建议', '情绪趋势分析'],
      icon: '🧠',
      url: 'https://xinli.yushuo.click',
      requiredLevel: 'monthly' as const,
    },
    {
      name: '交易复盘系统',
      description: '系统化的交易复盘工具，帮助您总结经验，提升交易水平',
      features: ['交易记录管理', '盈亏分析', '策略回测', '交易日志'],
      icon: '📈',
      url: 'https://yushuo.click',
      requiredLevel: 'quarterly' as const,
    },
  ];

  const pricingTiers = [
    {
      name: '月度会员',
      price: '¥99',
      period: '30天',
      features: [
        '板块节奏系统访问权',
        '心理评估系统访问权',
        '邮件客服支持',
        '会员专属内容',
      ],
      level: 'monthly' as const,
      popular: false,
    },
    {
      name: '季度会员',
      price: '¥249',
      period: '90天',
      features: [
        '所有月度会员权益',
        '交易复盘系统访问权',
        '优先客服支持',
        '15%续费折扣',
      ],
      level: 'quarterly' as const,
      popular: true,
    },
    {
      name: '年度会员',
      price: '¥899',
      period: '365天',
      features: [
        '所有季度会员权益',
        '专属投资策略分享',
        '25%续费折扣',
        '会员专属勋章',
      ],
      level: 'yearly' as const,
      popular: false,
    },
    {
      name: '终身会员',
      price: '¥2999',
      period: '永久有效',
      features: [
        '所有年度会员权益',
        '终身访问所有系统',
        'VIP专属标识',
        '优先体验新功能',
        '一对一顾问服务',
      ],
      level: 'lifetime' as const,
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            御朔复盘
            <br />
            <span className="text-[#007AFF]">专业投资决策平台</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            整合板块节奏分析、心理评估、交易复盘三大核心系统，
            为投资者提供全方位的决策支持与成长工具
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="px-8 py-4 bg-[#007AFF] text-white rounded-full hover:bg-[#0051D5] transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              开始免费试用
            </a>
            <a
              href="#pricing"
              className="px-8 py-4 bg-gray-100 text-gray-900 rounded-full hover:bg-gray-200 transition-all duration-300 font-semibold text-lg"
            >
              查看会员方案
            </a>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">三大核心系统</h2>
            <p className="text-xl text-gray-600">专业工具助力投资决策</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <ProductCard key={index} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">会员方案</h2>
            <p className="text-xl text-gray-600">选择适合您的会员等级，解锁更多功能</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingTiers.map((tier, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl p-8 shadow-sm border transition-all duration-300 ${
                  tier.popular
                    ? 'border-[#007AFF] shadow-lg scale-105'
                    : 'border-gray-100 hover:border-[#007AFF]/20 hover:shadow-lg'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#007AFF] text-white px-4 py-1 rounded-full text-sm font-semibold">
                      最受欢迎
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">{tier.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                  <span className="text-gray-600 ml-2">/ {tier.period}</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-[#007AFF] mt-0.5 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 px-6 rounded-full font-medium transition-all duration-300 ${
                    tier.popular
                      ? 'bg-[#007AFF] text-white hover:bg-[#0051D5] shadow-md hover:shadow-lg'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  选择方案
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Member<span className="text-[#007AFF]">System</span>
              </h3>
              <p className="text-gray-600">专业的会员管理系统</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">产品</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                    功能特性
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                    定价方案
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">支持</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                    帮助中心
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                    联系我们
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">法律</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                    隐私政策
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                    服务条款
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 text-center text-gray-600">
            <p>&copy; 2024 MemberSystem. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
