'use client';

interface ProgressBarProps {
  completed: number;
  total: number;
  percentage: number;
}

export function ProgressBar({ completed, total, percentage }: ProgressBarProps) {
  return (
    <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            填写进度：
            <span className="text-blue-600 ml-1">
              {completed}/{total}
            </span>
            <span className="text-gray-500 ml-2">
              ({percentage}%)
            </span>
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-primary h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
