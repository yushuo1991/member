import { MembershipLevel } from '@/types/membership';

interface MemberBadgeProps {
  level: MembershipLevel;
  size?: 'sm' | 'md' | 'lg';
}

const levelConfig: Record<MembershipLevel, {
  name: string;
  gradient: string;
  icon: string;
}> = {
  none: {
    name: '免费用户',
    gradient: 'from-gray-400 to-gray-500',
    icon: '👤',
  },
  monthly: {
    name: '月费会员',
    gradient: 'from-blue-400 to-blue-600',
    icon: '⭐',
  },
  quarterly: {
    name: '季度会员',
    gradient: 'from-green-400 to-green-600',
    icon: '💎',
  },
  yearly: {
    name: '年费会员',
    gradient: 'from-purple-400 to-purple-600',
    icon: '👑',
  },
  lifetime: {
    name: '终身会员',
    gradient: 'from-[#ff8c42] via-orange-500 to-yellow-500',
    icon: '🌟',
  },
};

export default function MemberBadge({ level, size = 'md' }: MemberBadgeProps) {
  const config = levelConfig[level];

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg',
    lg: 'px-6 sm:px-8 py-3 sm:py-4 text-lg sm:text-xl',
  };

  const iconSizes = {
    sm: 'text-lg mr-2',
    md: 'text-xl sm:text-2xl mr-2 sm:mr-3',
    lg: 'text-2xl sm:text-3xl mr-3',
  };

  return (
    <div
      className={`inline-flex items-center rounded-full bg-gradient-to-r ${config.gradient} shadow-lg ${sizeClasses[size]}`}
    >
      <span className={iconSizes[size]}>{config.icon}</span>
      <span className="text-white font-semibold">{config.name}</span>
    </div>
  );
}
