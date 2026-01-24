'use client';

import { Scenario } from '@/lib/scenarios';

interface ScenarioFormProps {
  scenario: Scenario;
  operation: string;
  thought: string;
  onOperationChange: (value: string) => void;
  onThoughtChange: (value: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  currentIndex: number;
  totalCount: number;
}

export function ScenarioForm({
  scenario,
  operation,
  thought,
  onOperationChange,
  onThoughtChange,
  onPrev,
  onNext,
  isFirst = false,
  isLast = false,
  currentIndex,
  totalCount,
}: ScenarioFormProps) {
  return (
    <div className="card max-w-4xl mx-auto">
      {/* 场景头部 */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            场景 {scenario.id}/80
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
            {scenario.category}
          </span>
          {scenario.important && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              ⚠️ 关键场景
            </span>
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {scenario.title}
        </h2>
      </div>

      {/* 表单 */}
      <form className="space-y-6">
        {/* 操作输入 */}
        <div>
          <label
            htmlFor={`operation-${scenario.id}`}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            您的操作：
          </label>
          <textarea
            id={`operation-${scenario.id}`}
            value={operation}
            onChange={(e) => onOperationChange(e.target.value)}
            placeholder="例如：卖出、持有、加仓、观望等..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            rows={3}
          />
          <p className="mt-1 text-sm text-gray-500">
            请详细描述您的操作决策
          </p>
        </div>

        {/* 想法输入 */}
        <div>
          <label
            htmlFor={`thought-${scenario.id}`}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            您的想法：
          </label>
          <textarea
            id={`thought-${scenario.id}`}
            value={thought}
            onChange={(e) => onThoughtChange(e.target.value)}
            placeholder="请详细描述您的判断依据、内心想法、情绪变化等..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            rows={6}
          />
          <p className="mt-1 text-sm text-blue-600">
            💡 提示：请如实写出您的真实想法，包括纠结、恐惧、贪婪等情绪。越详细越好！
          </p>
        </div>
      </form>

      {/* 导航按钮 */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={onPrev}
          disabled={isFirst}
          className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← 上一个
        </button>

        <span className="text-sm text-gray-600 font-medium">
          场景 {currentIndex + 1}/{totalCount}
        </span>

        <button
          onClick={onNext}
          className="btn btn-primary"
        >
          {isLast ? '完成' : '下一个 →'}
        </button>
      </div>
    </div>
  );
}
