-- 复盘系统数据迁移 - 从Supabase到MySQL
-- 基于原始的review_data_schema.sql

-- 用户表（复用主系统的users表，这里只是注释说明）
-- users表已经在主系统的database-init-v3.sql中定义

-- 复盘记录主表
CREATE TABLE IF NOT EXISTS review_records (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  review_date DATE NOT NULL DEFAULT (CURRENT_DATE),

  -- Section 1: 市场多空
  macro_risk_free BOOLEAN DEFAULT FALSE,
  non_breaking_index BOOLEAN DEFAULT FALSE,
  market_direction VARCHAR(20), -- '多头', '空头', '震荡'

  -- Section 2: 情绪阶段
  emotion_stage VARCHAR(20), -- '混沌期', '主升期', '盘顶期', '退潮期'
  volume_amplified BOOLEAN DEFAULT FALSE,
  index_turning_point BOOLEAN DEFAULT FALSE,

  -- Section 3: 板块节奏
  sector_option1 VARCHAR(100),
  sector_option2 VARCHAR(100),
  sector_option3 VARCHAR(100),
  sector_option4 VARCHAR(100),
  sector_option5 VARCHAR(100),
  rising_theme1 VARCHAR(100),
  rising_theme2 VARCHAR(100),
  swim_lane_data JSON, -- 存储泳道图的完整数据

  -- Section 4: 策略方法
  personal_strategy TEXT,

  -- Section 5: 执行计划
  stock_position TEXT,
  funding_support TEXT,
  expectation TEXT,
  stock_selection TEXT,
  focus_stocks TEXT,
  buy_plan TEXT,
  sell_plan TEXT,
  risk_control TEXT,
  mental_adjustment TEXT,

  -- Section 6: 交易记录
  trading_reflection TEXT,

  -- 外键和约束
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_review_date (user_id, review_date),
  INDEX idx_review_user_date (user_id, review_date DESC),
  INDEX idx_review_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 交易记录子表
CREATE TABLE IF NOT EXISTS trading_records (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  review_id VARCHAR(36) NOT NULL,
  stock_name VARCHAR(100),
  buy_price DECIMAL(10, 2),
  sell_price DECIMAL(10, 2),
  profit_percent DECIMAL(6, 2),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- 外键和索引
  FOREIGN KEY (review_id) REFERENCES review_records(id) ON DELETE CASCADE,
  INDEX idx_trading_review (review_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 数据迁移说明
-- 1. Supabase的UUID类型迁移为VARCHAR(36)
-- 2. Supabase的JSONB迁移为MySQL的JSON
-- 3. Supabase的user_id (uuid)迁移为MySQL的user_id (int)，需要建立映射关系
-- 4. 时间戳字段从timestamptz迁移为TIMESTAMP
-- 5. RLS策略改为应用层权限控制（通过@repo/auth实现）

-- 数据迁移步骤（手动执行）：
-- 1. 从Supabase导出数据（使用Supabase Dashboard或CLI）
-- 2. 转换UUID到INT（建立wechat_nickname到user_id的映射）
-- 3. 转换时间格式
-- 4. 导入到MySQL
