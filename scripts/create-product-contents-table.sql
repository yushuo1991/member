-- ============================================================================
-- Product Contents Management - 产品内容管理表
-- 功能：管理员可编辑的产品宣传页内容
-- 版本：v1.0
-- 创建日期：2026-02-07
-- ============================================================================

USE member_system;

-- 创建产品内容表
CREATE TABLE IF NOT EXISTS product_contents (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '内容ID',
    product_slug VARCHAR(50) NOT NULL UNIQUE COMMENT '产品标识符',
    title VARCHAR(200) NOT NULL COMMENT '产品标题',
    subtitle VARCHAR(500) COMMENT '副标题',
    description TEXT COMMENT '简短描述',
    detail_description TEXT COMMENT '详细描述',
    features JSON COMMENT '功能特性列表',
    images JSON COMMENT '图片列表',
    video_url VARCHAR(500) COMMENT '视频链接',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    status TINYINT DEFAULT 1 COMMENT '状态：1=启用，0=禁用',
    updated_by INT UNSIGNED COMMENT '更新者ID',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_slug (product_slug),
    INDEX idx_status (status),
    INDEX idx_sort_order (sort_order),
    FOREIGN KEY (updated_by) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品内容管理表';

-- 添加索引以提高查询性能
CREATE INDEX idx_status_sort ON product_contents(status, sort_order);
