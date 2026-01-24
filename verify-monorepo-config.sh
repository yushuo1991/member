#!/bin/bash

# Monorepo配置验证脚本
# 用途: 验证所有配置文件是否正确设置

echo "🔍 验证Monorepo配置..."
echo "======================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查计数器
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# 检查函数
check_file() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}✗${NC} $2 - 文件不存在: $1"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

check_dir() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}✗${NC} $2 - 目录不存在: $1"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

check_port_in_file() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $3"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}✗${NC} $3 - 未找到端口 $2 在文件 $1"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

# 1. 根配置文件检查
echo "📁 1. 根配置文件"
echo "--------------------------------------"
check_file "package.json" "根package.json"
check_file "turbo.json" "Turborepo配置"
check_file "pnpm-workspace.yaml" "pnpm workspace配置"
check_file "ecosystem.config.monorepo.js" "PM2配置"
check_file "nginx-monorepo.conf" "Nginx配置"
check_file ".github/workflows/deploy-monorepo.yml" "GitHub Actions配置"
echo ""

# 2. 应用目录检查
echo "📁 2. 应用目录结构"
echo "--------------------------------------"
check_dir "apps/web" "Web应用目录"
check_dir "apps/bk" "BK应用目录"
check_dir "apps/fuplan" "Fuplan应用目录"
check_dir "apps/xinli" "Xinli应用目录"
echo ""

# 3. 应用package.json检查
echo "📁 3. 应用配置文件"
echo "--------------------------------------"
check_file "apps/web/package.json" "Web应用package.json"
check_file "apps/bk/package.json" "BK应用package.json"
check_file "apps/fuplan/package.json" "Fuplan应用package.json"
check_file "apps/xinli/package.json" "Xinli应用package.json"
echo ""

# 4. 端口配置检查
echo "🔌 4. 端口配置验证"
echo "--------------------------------------"
check_port_in_file "apps/web/package.json" "3000" "Web应用端口3000"
check_port_in_file "apps/bk/package.json" "3001" "BK应用端口3001"
check_port_in_file "apps/fuplan/package.json" "3002" "Fuplan应用端口3002"
check_port_in_file "apps/xinli/package.json" "3003" "Xinli应用端口3003"
echo ""

# 5. PM2配置检查
echo "⚙️  5. PM2配置验证"
echo "--------------------------------------"
check_port_in_file "ecosystem.config.monorepo.js" "3000" "PM2配置 - Web端口3000"
check_port_in_file "ecosystem.config.monorepo.js" "3001" "PM2配置 - BK端口3001"
check_port_in_file "ecosystem.config.monorepo.js" "3002" "PM2配置 - Fuplan端口3002"
check_port_in_file "ecosystem.config.monorepo.js" "3003" "PM2配置 - Xinli端口3003"
echo ""

# 6. 共享包检查
echo "📦 6. 共享包目录"
echo "--------------------------------------"
check_dir "packages/ui" "UI组件包"
check_dir "packages/auth" "认证包"
check_dir "packages/database" "数据库包"
check_dir "packages/utils" "工具包"
check_dir "packages/config" "配置包"
echo ""

# 7. 文档检查
echo "📝 7. 文档文件"
echo "--------------------------------------"
check_file "MONOREPO-DEVELOPMENT-GUIDE.md" "开发指南"
check_file "MONOREPO-CONFIG-SUMMARY.md" "配置摘要"
check_file "CLAUDE.md" "项目说明"
echo ""

# 8. package.json脚本检查
echo "🔧 8. npm脚本验证"
echo "--------------------------------------"
if grep -q "dev:web" "package.json" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} dev:web脚本"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${RED}✗${NC} dev:web脚本缺失"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

if grep -q "dev:all" "package.json" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} dev:all脚本"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${RED}✗${NC} dev:all脚本缺失"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

if grep -q "build:web" "package.json" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} build:web脚本"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${RED}✗${NC} build:web脚本缺失"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
echo ""

# 9. Turbo配置检查
echo "🚀 9. Turborepo配置"
echo "--------------------------------------"
if grep -q "\"build\":" "turbo.json" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} build任务配置"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${RED}✗${NC} build任务配置缺失"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

if grep -q "\"dev\":" "turbo.json" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} dev任务配置"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${RED}✗${NC} dev任务配置缺失"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

if grep -q "\"lint\":" "turbo.json" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} lint任务配置"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${RED}✗${NC} lint任务配置缺失"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
echo ""

# 10. GitHub Actions检查
echo "🔄 10. CI/CD配置"
echo "--------------------------------------"
if grep -q "detect-changes" ".github/workflows/deploy-monorepo.yml" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} 变更检测job"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${RED}✗${NC} 变更检测job缺失"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

if grep -q "deploy-web" ".github/workflows/deploy-monorepo.yml" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Web部署job"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${RED}✗${NC} Web部署job缺失"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

if grep -q "deploy-bk" ".github/workflows/deploy-monorepo.yml" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} BK部署job"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${RED}✗${NC} BK部署job缺失"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
echo ""

# 总结
echo "======================================"
echo "📊 验证总结"
echo "======================================"
echo -e "总检查项: $TOTAL_CHECKS"
echo -e "${GREEN}通过: $PASSED_CHECKS${NC}"
echo -e "${RED}失败: $FAILED_CHECKS${NC}"
echo ""

if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "${GREEN}✅ 所有检查通过！Monorepo配置完成。${NC}"
    echo ""
    echo "📌 下一步操作:"
    echo "   1. 运行 'pnpm install' 安装依赖"
    echo "   2. 运行 'pnpm dev:all' 启动所有应用"
    echo "   3. 运行 'pnpm build' 测试构建"
    echo ""
    exit 0
else
    echo -e "${RED}❌ 发现 $FAILED_CHECKS 个问题，请修复后重试。${NC}"
    echo ""
    exit 1
fi
