-- 心理测评系统数据库表
-- 添加到现有的 member_system 数据库

-- 1. 用户测评记录表
CREATE TABLE IF NOT EXISTS `user_psychology_tests` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `test_name` VARCHAR(100) NOT NULL DEFAULT '龙头与跟风交易心理问卷',
  `status` ENUM('in_progress', 'completed') NOT NULL DEFAULT 'in_progress',
  `progress` INT NOT NULL DEFAULT 0 COMMENT '完成进度0-80',
  `started_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` DATETIME NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_tests` (`user_id`, `status`),
  INDEX `idx_updated` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户心理测评记录';

-- 2. 测评答案表
CREATE TABLE IF NOT EXISTS `user_psychology_answers` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `test_id` INT NOT NULL,
  `scenario_id` INT NOT NULL COMMENT '场景ID (1-80)',
  `operation` TEXT COMMENT '操作内容',
  `thought` TEXT COMMENT '想法内容',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`test_id`) REFERENCES `user_psychology_tests`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_test_scenario` (`test_id`, `scenario_id`),
  INDEX `idx_test_answers` (`test_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='心理测评答案';

-- 3. 测评报告表（可选，用于存储AI分析报告）
CREATE TABLE IF NOT EXISTS `user_psychology_reports` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `test_id` INT NOT NULL,
  `report_content` LONGTEXT NOT NULL COMMENT 'Markdown格式的分析报告',
  `generated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`test_id`) REFERENCES `user_psychology_tests`(`id`) ON DELETE CASCADE,
  INDEX `idx_test_reports` (`test_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='心理测评分析报告';
