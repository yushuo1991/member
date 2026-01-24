'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { scenarios, calculateProgress } from '@/lib/scenarios';
import { ScenarioForm } from '@/components/scenario/ScenarioForm';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { NavigationSidebar } from '@/components/ui/NavigationSidebar';

interface Answer {
  scenarioId: number;
  operation: string;
  thought: string;
}

export default function XinliPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, Answer>>(new Map());
  const [testId, setTestId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  // 检查访问权限
  useEffect(() => {
    checkAccess();
  }, []);

  // 加载已保存的数据
  useEffect(() => {
    if (!showWelcome) {
      loadData();
    }
  }, [showWelcome]);

  // 自动保存
  useEffect(() => {
    if (!showWelcome && !loading) {
      const timer = setInterval(() => {
        saveData();
      }, 30000); // 每30秒自动保存

      return () => clearInterval(timer);
    }
  }, [showWelcome, loading, answers]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showWelcome) return;

      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < scenarios.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveData();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, showWelcome]);

  const checkAccess = async () => {
    try {
      const res = await fetch('/api/gate/xinli');
      const data = await res.json();

      if (!data.hasAccess) {
        if (data.requireLogin) {
          router.push('/login?redirect=/xinli');
        } else {
          alert(data.reason);
          router.push('/upgrade');
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('权限检查失败:', error);
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const res = await fetch('/api/psychology/load');
      if (res.ok) {
        const data = await res.json();
        if (data.testId) {
          setTestId(data.testId);
          const answersMap = new Map();
          data.answers.forEach((a: any) => {
            answersMap.set(a.scenarioId, {
              scenarioId: a.scenarioId,
              operation: a.operation || '',
              thought: a.thought || '',
            });
          });
          setAnswers(answersMap);
        }
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };

  const saveData = async () => {
    if (answers.size === 0) return;

    setSaving(true);
    try {
      const answersArray = Array.from(answers.values());
      await fetch('/api/psychology/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: answersArray,
          status: 'in_progress',
        }),
      });
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveManually = async () => {
    await saveData();
    alert('保存成功！');
  };

  const handleExport = async () => {
    if (!testId) {
      alert('请先填写并保存问卷');
      return;
    }

    window.open(`/api/psychology/export?testId=${testId}`, '_blank');
  };

  const updateAnswer = useCallback(
    (scenarioId: number, field: 'operation' | 'thought', value: string) => {
      setAnswers((prev) => {
        const newAnswers = new Map(prev);
        const existing = newAnswers.get(scenarioId) || {
          scenarioId,
          operation: '',
          thought: '',
        };
        newAnswers.set(scenarioId, { ...existing, [field]: value });
        return newAnswers;
      });
    },
    []
  );

  const handleStart = () => {
    setShowWelcome(false);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < scenarios.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      alert('恭喜完成！您已完成所有场景的填写！');
      saveData();
    }
  };

  const handleScenarioClick = (scenarioId: number) => {
    const index = scenarios.findIndex((s) => s.id === scenarioId);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (showWelcome) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-3xl mx-auto">
          <div className="card text-center">
            <h1 className="text-4xl font-bold mb-6">
              👋 欢迎使用交易心理问卷系统
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              本问卷包含80个场景，全面评估您的交易心理特征。
            </p>

            <div className="bg-yellow-50 rounded-xl p-6 mb-8 text-left">
              <h3 className="font-semibold text-yellow-900 mb-4">⚠️ 填写提示：</h3>
              <ul className="space-y-2 text-yellow-800">
                <li>✅ <strong>必须真实</strong> - 写出您的真实想法和情绪</li>
                <li>✅ <strong>必须详细</strong> - 包括纠结、恐惧、贪婪等内心活动</li>
                <li>✅ <strong>无需完美</strong> - 不要写"正确答案"</li>
                <li>✅ <strong>随时保存</strong> - 不必一次填完，可分多次进行</li>
              </ul>
            </div>

            <button
              onClick={handleStart}
              className="btn btn-primary btn-lg px-8 py-3 text-lg"
            >
              开始填写 →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentScenario = scenarios[currentIndex];
  const currentAnswer = answers.get(currentScenario.id) || {
    scenarioId: currentScenario.id,
    operation: '',
    thought: '',
  };

  const completedScenarios = new Set(
    Array.from(answers.values())
      .filter((a) => a.operation || a.thought)
      .map((a) => a.scenarioId)
  );

  const progress = calculateProgress(Array.from(completedScenarios));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部操作栏 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">🎯 龙头与跟风交易心理问卷</h1>
            <div className="flex gap-3">
              <button
                onClick={handleSaveManually}
                disabled={saving}
                className="btn btn-secondary text-sm"
              >
                💾 {saving ? '保存中...' : '保存进度'}
              </button>
              <button
                onClick={handleExport}
                className="btn btn-success text-sm"
              >
                📥 导出问卷
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 进度条 */}
      <ProgressBar {...progress} />

      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* 侧边栏导航 */}
          <NavigationSidebar
            currentScenario={currentScenario.id}
            completedScenarios={completedScenarios}
            onScenarioClick={handleScenarioClick}
          />

          {/* 场景表单 */}
          <main className="flex-1">
            <ScenarioForm
              scenario={currentScenario}
              operation={currentAnswer.operation}
              thought={currentAnswer.thought}
              onOperationChange={(value) =>
                updateAnswer(currentScenario.id, 'operation', value)
              }
              onThoughtChange={(value) =>
                updateAnswer(currentScenario.id, 'thought', value)
              }
              onPrev={handlePrev}
              onNext={handleNext}
              isFirst={currentIndex === 0}
              isLast={currentIndex === scenarios.length - 1}
              currentIndex={currentIndex}
              totalCount={scenarios.length}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
