import { MembershipLevel } from '@/types/membership';

interface MemberBadgeProps {
  level: MembershipLevel;
}

const levelConfig: Record<MembershipLevel, {
  name: string;
  color: string;
  gradient: string;
  icon: string;
}> = {
  none: {
    name: '未激活',
    color: 'bg-gray-500',
    gradient: 'from-gray-400 to-gray-600',
    icon: '🔒',
  },
  monthly: {
    name: '月度会员',
    color: 'bg-blue-500',
    gradient: 'from-blue-400 to-blue-600',
    icon: '⭐',
  },
  quarterly: {
    name: '季度会员',
    color: 'bg-purple-500',
    gradient: 'from-purple-400 to-purple-600',
    icon: '💎',
  },
  yearly: {
    name: '年度会员',
    color: 'bg-yellow-500',
    gradient: 'from-yellow-400 to-yellow-600',
    icon: '👑',
  },
  lifetime: {
    name: '终身会员',
    color: 'bg-gradient-to-r',
    gradient: 'from-pink-500 via-purple-500 to-indigo-500',
    icon: '🌟',
  },
};

export default function MemberBadge({ level }: MemberBadgeProps) {
  const config = levelConfig[level];

  return (
    <div
      className={`inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r ${config.gradient} shadow-lg`}
    >
      <span className="text-2xl mr-3">{config.icon}</span>
      <span className="text-white font-semibold text-lg">{config.name}</span>
    </div>
  );
}
