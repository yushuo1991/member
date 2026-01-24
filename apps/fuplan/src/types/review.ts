/**
 * 复盘系统类型定义
 * 基于原始的Supabase类型，适配MySQL
 */

// 市场方向
export type MarketDirection = '多头' | '空头' | '震荡';

// 情绪阶段
export type EmotionStage = '混沌期' | '主升期' | '盘顶期' | '退潮期';

// 泳道图数据项
export interface SwimLaneItem {
  id: string;
  sector: string;
  stocks: string[];
  position: number;
  color?: string;
}

// 泳道图数据
export type SwimLaneData = SwimLaneItem[];

// 复盘记录
export interface ReviewRecord {
  id: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  review_date: string;

  // Section 1: 市场多空
  macro_risk_free: boolean;
  non_breaking_index: boolean;
  market_direction: MarketDirection | null;

  // Section 2: 情绪阶段
  emotion_stage: EmotionStage | null;
  volume_amplified: boolean;
  index_turning_point: boolean;

  // Section 3: 板块节奏
  sector_option1: string | null;
  sector_option2: string | null;
  sector_option3: string | null;
  sector_option4: string | null;
  sector_option5: string | null;
  rising_theme1: string | null;
  rising_theme2: string | null;
  swim_lane_data: SwimLaneData | null;

  // Section 4: 策略方法
  personal_strategy: string | null;

  // Section 5: 执行计划
  stock_position: string | null;
  funding_support: string | null;
  expectation: string | null;
  stock_selection: string | null;
  focus_stocks: string | null;
  buy_plan: string | null;
  sell_plan: string | null;
  risk_control: string | null;
  mental_adjustment: string | null;

  // Section 6: 交易记录
  trading_reflection: string | null;
}

// 交易记录
export interface TradingRecord {
  id: string;
  review_id: string;
  stock_name: string | null;
  buy_price: number | null;
  sell_price: number | null;
  profit_percent: number | null;
  created_at: string;
}

// 表单数据（用于创建和更新）
export type ReviewFormData = Omit<ReviewRecord, 'id' | 'created_at' | 'updated_at' | 'user_id'>;

// 情绪阶段配置
export interface EmotionStageConfig {
  name: EmotionStage;
  color: string;
  bgColor: string;
  cardBg: string;
  description: string;
  audioFile: string;
}

// 情绪阶段配置常量
export const EMOTION_STAGES: Record<EmotionStage, EmotionStageConfig> = {
  混沌期: {
    name: '混沌期',
    color: '#f97316',
    bgColor: '#fffbf7',
    cardBg: '#fefaf6',
    description: '市场方向不明，个股分化严重，情绪混乱',
    audioFile: '/audio/混沌期.mp3',
  },
  主升期: {
    name: '主升期',
    color: '#ef4444',
    bgColor: '#fff9f9',
    cardBg: '#fff5f5',
    description: '情绪高涨，赚钱效应扩散，主升浪启动',
    audioFile: '/audio/主升期.mp3',
  },
  盘顶期: {
    name: '盘顶期',
    color: '#3b82f6',
    bgColor: '#f5f8ff',
    cardBg: '#f0f5ff',
    description: '情绪亢奋，分歧加剧，谨防见顶',
    audioFile: '/audio/盘顶期.mp3',
  },
  退潮期: {
    name: '退潮期',
    color: '#10b981',
    bgColor: '#f0fbf8',
    cardBg: '#edfcf7',
    description: '情绪退潮，赚钱效应消失，调整开始',
    audioFile: '/audio/退潮期.mp3',
  },
};
