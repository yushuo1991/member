import Navbar from '@/components/Navbar';
import { MEMBERSHIP_LEVELS, PRODUCTS } from '@/lib/membership-levels';
import { MembershipLevel } from '@/types/membership';

export default function MembershipPage() {
  const membershipTiers = [
    {
      level: 'monthly' as MembershipLevel,
      popular: false,
    },
    {
      level: 'quarterly' as MembershipLevel,
      popular: true,
    },
    {
      level: 'yearly' as MembershipLevel,
      popular: false,
    },
    {
      level: 'lifetime' as MembershipLevel,
      popular: false,
    },
  ];

  const faqs = [
    {
      question: '如何开通会员？',
      answer: '您可以通过激活码开通会员。管理员会发放激活码给您，在会员中心输入激活码即可激活对应等级的会员权益。'
    },
    {
      question: '会员到期后会怎样？',
      answer: '会员到期后，您将无法继续访问需要会员权限的系统。但您的历史数据会保留，续费后即可继续使用。'
    },
    {
      question: '可以升级会员等级吗？',
      answer: '可以。使用更高等级的激活码即可升级会员，未使用的天数会自动叠加到新的会员期限中。'
    },
    {
      question: '支持退款吗？',
      answer: '由于激活码一经激活即生效，我们暂不支持退款。请在激活前确认您的选择。'
    },
    {
      question: '会员可以转让吗？',
      answer: '会员权益绑定账户，不支持转让。但您可以在多个设备上使用同一账户登录。'
    },
    {
      question: '数据安全吗？',
      answer: '我们采用银行级加密技术保护您的数据，所有数据传输均使用HTTPS加密，数据库每天自动备份。'
    },
    {
      question: '如何联系客服？',
      answer: '月度及以上会员可通过邮件联系客服，年度及以上会员享有VIP客服通道，响应时间更快。'
    },
    {
      question: '终身会员真的是永久吗？',
      answer: '是的。终身会员一次付费，永久享受所有会员权益，包括未来新增的功能和系统升级。'
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            御朔复盘
            <br />
            <span className="bg-gradient-to-r from-[#007AFF] to-purple-600 bg-clip-text text-transparent">
              会员体系
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            整合板块节奏分析、心理评估、交易复盘三大核心系统
            <br />
            为投资者提供全方位的决策支持与成长工具
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="px-8 py-4 bg-gradient-to-r from-[#007AFF] to-[#0051D5] text-white rounded-full hover:shadow-xl transition-all duration-300 font-semibold text-lg"
            >
              立即注册
            </a>
            <a
              href="#pricing"
              className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-full hover:border-[#007AFF] hover:shadow-lg transition-all duration-300 font-semibold text-lg"
            >
              查看方案
            </a>
          </div>
        </div>
      </section>

      {/* 产品访问权限矩阵 */}
      <section className="py-20 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">产品访问权限</h2>
            <p className="text-xl text-gray-600">一目了然的会员权益对比</p>
          </div>

          {/* 桌面端表格 */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full bg-white rounded-2xl shadow-sm overflow-hidden">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">产品/服务</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">月度会员</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 bg-blue-50">
                    季度会员
                    <span className="ml-2 inline-block px-2 py-1 bg-blue-500 text-white text-xs rounded-full">推荐</span>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">年度会员</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">终身会员</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {PRODUCTS.map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{product.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {product.requiredLevel === 'monthly' || product.requiredLevel === 'none' ? (
                        <span className="text-green-600 text-2xl">✓</span>
                      ) : (
                        <span className="text-gray-300 text-2xl">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center bg-blue-50/50">
                      {['monthly', 'quarterly', 'none'].includes(product.requiredLevel) ? (
                        <span className="text-green-600 text-2xl">✓</span>
                      ) : (
                        <span className="text-gray-300 text-2xl">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-green-600 text-2xl">✓</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-green-600 text-2xl">✓</span>
                    </td>
                  </tr>
                ))}
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium">邮件客服支持</td>
                  <td className="px-6 py-4 text-center"><span className="text-green-600 text-2xl">✓</span></td>
                  <td className="px-6 py-4 text-center bg-blue-50/50"><span className="text-green-600 text-2xl">✓</span></td>
                  <td className="px-6 py-4 text-center"><span className="text-green-600 text-2xl">✓</span></td>
                  <td className="px-6 py-4 text-center"><span className="text-green-600 text-2xl">✓</span></td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium">VIP客服通道</td>
                  <td className="px-6 py-4 text-center"><span className="text-gray-300 text-2xl">-</span></td>
                  <td className="px-6 py-4 text-center bg-blue-50/50"><span className="text-gray-300 text-2xl">-</span></td>
                  <td className="px-6 py-4 text-center"><span className="text-green-600 text-2xl">✓</span></td>
                  <td className="px-6 py-4 text-center"><span className="text-green-600 text-2xl">✓</span></td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium">一对一顾问服务</td>
                  <td className="px-6 py-4 text-center"><span className="text-gray-300 text-2xl">-</span></td>
                  <td className="px-6 py-4 text-center bg-blue-50/50"><span className="text-gray-300 text-2xl">-</span></td>
                  <td className="px-6 py-4 text-center"><span className="text-gray-300 text-2xl">-</span></td>
                  <td className="px-6 py-4 text-center"><span className="text-green-600 text-2xl">✓</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 移动端卡片 */}
          <div className="lg:hidden space-y-6">
            {membershipTiers.map((tier) => {
              const config = MEMBERSHIP_LEVELS[tier.level];
              return (
                <div key={tier.level} className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{config.name}</h3>
                  <ul className="space-y-3">
                    {config.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 会员等级卡片 */}
      <section id="pricing" className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">选择您的会员方案</h2>
            <p className="text-xl text-gray-600">灵活的会员等级，满足不同需求</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {membershipTiers.map((tier) => {
              const config = MEMBERSHIP_LEVELS[tier.level];
              return (
                <div
                  key={tier.level}
                  className={`relative bg-white rounded-3xl p-8 shadow-sm border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    tier.popular
                      ? 'border-[#007AFF] shadow-lg scale-105'
                      : 'border-gray-100'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-[#007AFF] to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                        🔥 最受欢迎
                      </span>
                    </div>
                  )}

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{config.name}</h3>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-900">¥{config.price}</span>
                    <span className="text-gray-600 ml-2">
                      / {config.duration ? `${config.duration}天` : '永久'}
                    </span>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {config.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-sm">
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="/register"
                    className={`block w-full py-3 px-6 rounded-full font-medium transition-all duration-300 text-center ${
                      tier.popular
                        ? 'bg-gradient-to-r from-[#007AFF] to-purple-600 text-white shadow-md hover:shadow-lg'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    立即开通
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">常见问题</h2>
            <p className="text-xl text-gray-600">解答您的疑惑</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <summary className="flex justify-between items-center cursor-pointer font-semibold text-gray-900 text-lg">
                  {faq.question}
                  <svg
                    className="w-6 h-6 text-gray-400 group-open:rotate-180 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8 bg-gradient-to-br from-[#007AFF] to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            准备好开始了吗？
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            立即注册，使用激活码开通会员，解锁专业投资工具
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="px-8 py-4 bg-white text-[#007AFF] rounded-full hover:shadow-2xl transition-all duration-300 font-semibold text-lg"
            >
              立即注册
            </a>
            <a
              href="/login"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full hover:bg-white hover:text-[#007AFF] transition-all duration-300 font-semibold text-lg"
            >
              已有账户？登录
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-gray-600">
          <p>&copy; 2024 御朔复盘. 保留所有权利.</p>
        </div>
      </footer>
    </div>
  );
}
