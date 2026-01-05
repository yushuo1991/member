import { MembershipLevel } from '@/types/membership';
import { MEMBERSHIP_LEVELS } from '@/lib/membership-levels';

interface ProductCardProps {
  name: string;
  description: string;
  features: string[];
  icon: string;
  url?: string;
  requiredLevel?: MembershipLevel;
}

export default function ProductCard({
  name,
  description,
  features,
  icon,
  url,
  requiredLevel
}: ProductCardProps) {
  const levelConfig = requiredLevel ? MEMBERSHIP_LEVELS[requiredLevel] : null;

  // 等级徽章颜色映射
  const levelColors: Record<MembershipLevel, string> = {
    none: 'bg-gray-100 text-gray-700',
    monthly: 'bg-blue-100 text-blue-700',
    quarterly: 'bg-purple-100 text-purple-700',
    yearly: 'bg-yellow-100 text-yellow-700',
    lifetime: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
  };

  return (
    <div className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#007AFF]/30 hover:-translate-y-1">
      {/* Required Level Badge */}
      {requiredLevel && levelConfig && (
        <div className="mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${levelColors[requiredLevel]}`}>
            🔑 需要{levelConfig.name}
          </span>
        </div>
      )}

      {/* Icon */}
      <div className="w-16 h-16 bg-gradient-to-br from-[#007AFF] to-[#0051D5] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
        <span className="text-3xl">{icon}</span>
      </div>

      {/* Title */}
      <h3 className="text-2xl font-semibold text-gray-900 mb-3 group-hover:text-[#007AFF] transition-colors">
        {name}
      </h3>

      {/* Description */}
      <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg
              className="w-5 h-5 text-[#007AFF] mt-0.5 mr-3 flex-shrink-0"
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
            <span className="text-gray-700 text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 px-6 bg-gradient-to-r from-[#007AFF] to-[#0051D5] text-white rounded-full hover:shadow-lg transition-all duration-300 font-medium text-center group-hover:scale-105"
        >
          立即访问 →
        </a>
      ) : (
        <button className="w-full py-3 px-6 bg-gray-50 text-gray-900 rounded-full hover:bg-[#007AFF] hover:text-white transition-all duration-300 font-medium">
          了解更多
        </button>
      )}
    </div>
  );
}
