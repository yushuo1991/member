export default function AdminPage() {
  const stats = [
    {
      title: '总会员数',
      value: '2,543',
      change: '+12.5%',
      icon: '👥',
      color: 'bg-blue-500',
    },
    {
      title: '今日新增',
      value: '56',
      change: '+8.2%',
      icon: '📈',
      color: 'bg-green-500',
    },
    {
      title: '激活码总数',
      value: '1,234',
      change: '-3.1%',
      icon: '🔑',
      color: 'bg-purple-500',
    },
    {
      title: '本月收入',
      value: '¥45,678',
      change: '+18.7%',
      icon: '💰',
      color: 'bg-yellow-500',
    },
  ];

  const recentMembers = [
    { name: '张三', email: 'zhang@example.com', level: '专业会员', date: '2024-01-15' },
    { name: '李四', email: 'li@example.com', level: '基础会员', date: '2024-01-15' },
    { name: '王五', email: 'wang@example.com', level: '至尊会员', date: '2024-01-14' },
    { name: '赵六', email: 'zhao@example.com', level: '免费会员', date: '2024-01-14' },
    { name: '钱七', email: 'qian@example.com', level: '专业会员', date: '2024-01-13' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">控制台</h1>
        <p className="text-gray-600">欢迎回来，这是您的会员系统概览</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-2xl`}
              >
                {stat.icon}
              </div>
              <span
                className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Members */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">最近注册会员</h2>
            <a
              href="/admin/members"
              className="text-[#007AFF] hover:underline text-sm font-medium"
            >
              查看全部
            </a>
          </div>
          <div className="space-y-4">
            {recentMembers.map((member, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors duration-300">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#007AFF] to-[#0051D5] rounded-full flex items-center justify-center text-white font-semibold mr-3">
                    {member.name[0]}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{member.name}</h4>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{member.level}</p>
                  <p className="text-xs text-gray-500">{member.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">快捷操作</h2>
          <div className="grid grid-cols-2 gap-4">
            <a
              href="/admin/codes"
              className="p-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#007AFF] hover:bg-blue-50 transition-all duration-300 text-center group"
            >
              <div className="w-12 h-12 bg-gray-100 group-hover:bg-[#007AFF] rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors duration-300">
                <svg
                  className="w-6 h-6 text-gray-600 group-hover:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900">生成激活码</p>
            </a>

            <a
              href="/admin/members"
              className="p-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#007AFF] hover:bg-blue-50 transition-all duration-300 text-center group"
            >
              <div className="w-12 h-12 bg-gray-100 group-hover:bg-[#007AFF] rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors duration-300">
                <svg
                  className="w-6 h-6 text-gray-600 group-hover:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900">管理会员</p>
            </a>

            <a
              href="/admin/stats"
              className="p-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#007AFF] hover:bg-blue-50 transition-all duration-300 text-center group"
            >
              <div className="w-12 h-12 bg-gray-100 group-hover:bg-[#007AFF] rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors duration-300">
                <svg
                  className="w-6 h-6 text-gray-600 group-hover:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900">数据统计</p>
            </a>

            <a
              href="#"
              className="p-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#007AFF] hover:bg-blue-50 transition-all duration-300 text-center group"
            >
              <div className="w-12 h-12 bg-gray-100 group-hover:bg-[#007AFF] rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors duration-300">
                <svg
                  className="w-6 h-6 text-gray-600 group-hover:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900">系统设置</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
