'use client';

import { ScenarioSection, SCENARIO_SECTIONS } from '@/lib/scenarios';

interface NavigationSidebarProps {
  currentScenario: number;
  completedScenarios: Set<number>;
  onScenarioClick: (scenarioId: number) => void;
}

export function NavigationSidebar({
  currentScenario,
  completedScenarios,
  onScenarioClick,
}: NavigationSidebarProps) {
  return (
    <aside className="w-64 flex-shrink-0">
      <div className="sticky top-24 card max-h-[calc(100vh-7rem)] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          📑 场景导航
        </h3>

        <nav className="space-y-4">
          {SCENARIO_SECTIONS.map((section) => {
            const sectionScenarios = getSectionScenarios(section.id);
            const completedCount = sectionScenarios.filter((id) =>
              completedScenarios.has(id)
            ).length;

            return (
              <div key={section.id} className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center justify-between">
                  <span>
                    {section.id}. {section.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {completedCount}/{section.count}
                  </span>
                </h4>

                <div className="space-y-1">
                  {sectionScenarios.map((scenarioId) => {
                    const isCompleted = completedScenarios.has(scenarioId);
                    const isCurrent = scenarioId === currentScenario;

                    return (
                      <button
                        key={scenarioId}
                        onClick={() => onScenarioClick(scenarioId)}
                        className={`
                          w-full text-left px-3 py-2 rounded-lg text-sm transition-all
                          ${isCurrent
                            ? 'bg-blue-100 text-blue-900 font-medium'
                            : isCompleted
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : 'text-gray-600 hover:bg-gray-100'
                          }
                        `}
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-5">
                            {isCompleted ? '✓' : scenarioId}
                          </span>
                          <span className="truncate">场景 {scenarioId}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

// 辅助函数：根据section获取场景ID列表
function getSectionScenarios(sectionId: number): number[] {
  const ranges: Record<number, [number, number]> = {
    1: [1, 17],
    2: [18, 32],
    3: [33, 42],
    4: [43, 47],
    5: [48, 51],
    6: [52, 55],
    7: [56, 60],
    8: [61, 66],
    9: [67, 80],
  };

  const [start, end] = ranges[sectionId] || [0, 0];
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
