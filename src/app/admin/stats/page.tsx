'use client';

export default function StatsPage() {
  const stats = {
    overview: [
      { label: '总收入', value: '¥458,932', trend: '+18.7%', color: 'text-green-600' },
      { label: '本月收入', value: '¥45,678', trend: '+12.3%', color: 'text-green-600' },
      { label: '活跃会员', value: '2,543', trend: '+8.9%', color: 'text-green-600' },
      { label: '激活率', value: '78.5%', trend: '+2.1%', color: 'text-green-600' },
    ],
    memberDistribution: [
      { level: '免费会员', count: 1234, percentage: 48.5, color: 'bg-gray-500' },
      { level: '基础会员', count: 789, percentage: 31.0, color: 'bg-blue-500' },
      { level: '专业会员', count: 432, percentage: 17.0, color: 'bg-purple-500' },
      { level: '至尊会员', count: 88, percentage: 3.5, color: 'bg-yellow-500' },
    ],
    recentActivity: [
      { date: '2024-01-15', newMembers: 23, activations: 15, revenue: '¥4,560' },
      { date: '2024-01-14', newMembers: 18, activations: 12, revenue: '¥3,890' },
      { date: '2024-01-13', newMembers: 31, activations: 20, revenue: '¥6,120' },
      { date: '2024-01-12', newMembers: 27, activations: 18, revenue: '¥5,340' },
      { date: '2024-01-11', newMembers: 19, activations: 13, revenue: '¥4,230' },
    ],
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">数据统计</h1>
        <p className="text-gray-600">查看系统运营数据和趋势分析</p>
      </div>

      {/* Overview Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.overview.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm">{stat.label}</h3>
              <span className={`text-sm font-medium ${stat.color}`}>{stat.trend}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Member Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">会员分布</h2>
          <div className="space-y-4">
            {stats.memberDistribution.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 font-medium">{item.level}</span>
                  <span className="text-gray-600">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Pie Chart Representation */}
          <div className="mt-8 flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="20"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#6B7280"
                  strokeWidth="20"
                  strokeDasharray="48.5 251.2"
                  strokeDashoffset="0"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="20"
                  strokeDasharray="31 251.2"
                  strokeDashoffset="-48.5"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="20"
                  strokeDasharray="17 251.2"
                  strokeDashoffset="-79.5"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#EAB308"
                  strokeWidth="20"
                  strokeDasharray="3.5 251.2"
                  strokeDashoffset="-96.5"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">2,543</div>
                  <div className="text-sm text-gray-600">总会员</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">近期活动</h2>
          <div className="space-y-4">
            {stats.recentActivity.map((activity, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-900">{activity.date}</span>
                  <span className="text-sm font-bold text-[#007AFF]">{activity.revenue}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">新增会员</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {activity.newMembers}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">激活码使用</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {activity.activations}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">收入趋势</h2>
        <div className="h-64 flex items-end justify-between gap-2">
          {[45, 62, 38, 75, 58, 82, 48, 91, 67, 73, 56, 88].map((height, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gradient-to-t from-[#007AFF] to-[#0051D5] rounded-t-lg transition-all duration-300 hover:opacity-80" style={{ height: `${height}%` }} />
              <span className="text-xs text-gray-500 mt-2">{index + 1}月</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
