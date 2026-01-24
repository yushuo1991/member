'use client';

import { useState, useEffect, useCallback } from 'react';
import { EmotionStage, EMOTION_STAGES } from '@/types/review';

interface EmotionStageSelectorProps {
  value: EmotionStage | null;
  onChange: (stage: EmotionStage) => void;
}

export default function EmotionStageSelector({ value, onChange }: EmotionStageSelectorProps) {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [currentPlaying, setCurrentPlaying] = useState<EmotionStage | null>(null);

  // 播放音效
  const playAudio = useCallback((stage: EmotionStage) => {
    // 停止当前播放
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    // 播放新音频
    const newAudio = new Audio(EMOTION_STAGES[stage].audioFile);
    newAudio.play().catch(err => {
      console.error('Failed to play audio:', err);
    });

    setAudio(newAudio);
    setCurrentPlaying(stage);

    // 音频结束后清除状态
    newAudio.onended = () => {
      setCurrentPlaying(null);
    };
  }, [audio]);

  // 选择情绪阶段
  const handleSelect = (stage: EmotionStage) => {
    onChange(stage);
    playAudio(stage);
  };

  // 清理音频
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [audio]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">情绪阶段判断</h3>
        {value && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <i className="fas fa-volume-up"></i>
            <span>点击卡片播放音效</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(Object.keys(EMOTION_STAGES) as EmotionStage[]).map((stage) => {
          const config = EMOTION_STAGES[stage];
          const isSelected = value === stage;
          const isPlaying = currentPlaying === stage;

          return (
            <button
              key={stage}
              onClick={() => handleSelect(stage)}
              className={`
                relative p-6 rounded-2xl border-2 transition-all duration-300
                ${
                  isSelected
                    ? 'border-current shadow-lg scale-105'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }
              `}
              style={{
                backgroundColor: isSelected ? config.cardBg : '#ffffff',
                color: isSelected ? config.color : '#1c1c1e',
              }}
            >
              {/* 播放指示器 */}
              {isPlaying && (
                <div className="absolute top-2 right-2">
                  <i className="fas fa-volume-up text-sm animate-pulse"></i>
                </div>
              )}

              {/* 选中标记 */}
              {isSelected && (
                <div className="absolute top-2 left-2">
                  <i className="fas fa-check-circle text-lg"></i>
                </div>
              )}

              {/* 阶段名称 */}
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">{stage}</div>
                <p className="text-xs opacity-80 leading-relaxed">{config.description}</p>
              </div>

              {/* 颜色指示条 */}
              <div
                className="mt-4 h-1 rounded-full"
                style={{ backgroundColor: config.color }}
              ></div>
            </button>
          );
        })}
      </div>

      {/* 详细说明 */}
      {value && (
        <div
          className="p-4 rounded-xl border-2 animate-fadeIn"
          style={{
            backgroundColor: EMOTION_STAGES[value].cardBg,
            borderColor: EMOTION_STAGES[value].color,
          }}
        >
          <div className="flex items-start gap-3">
            <i
              className="fas fa-info-circle text-xl mt-0.5"
              style={{ color: EMOTION_STAGES[value].color }}
            ></i>
            <div>
              <h4 className="font-semibold mb-1">当前阶段：{value}</h4>
              <p className="text-sm text-gray-600">{EMOTION_STAGES[value].description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
