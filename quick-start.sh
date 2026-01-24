#!/bin/bash

# Monorepo快速启动脚本
# 用途: 一键安装依赖并启动所有应用

set -e

echo "🚀 启动Monorepo开发环境..."
echo "======================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. 检查pnpm
echo -e "${BLUE}1/4 检查pnpm...${NC}"
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}pnpm未安装，正在安装...${NC}"
    npm install -g pnpm@8.15.0
else
    echo -e "${GREEN}✓ pnpm已安装${NC}"
fi
echo ""

# 2. 安装依赖
echo -e "${BLUE}2/4 安装依赖...${NC}"
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖，这可能需要几分钟..."
    pnpm install
    echo -e "${GREEN}✓ 依赖安装完成${NC}"
else
    echo -e "${GREEN}✓ 依赖已安装${NC}"
    echo "如需重新安装，运行: pnpm install"
fi
echo ""

# 3. 验证配置
echo -e "${BLUE}3/4 验证配置...${NC}"
bash verify-monorepo-config.sh > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 配置验证通过${NC}"
else
    echo -e "${YELLOW}⚠ 配置验证失败，请检查verify-monorepo-config.sh${NC}"
fi
echo ""

# 4. 显示启动选项
echo -e "${BLUE}4/4 启动应用${NC}"
echo "======================================"
echo ""
echo "请选择启动方式:"
echo ""
echo "  ${GREEN}1${NC}. 启动所有应用 (并行)"
echo "  ${GREEN}2${NC}. 只启动Web应用 (Port 3000)"
echo "  ${GREEN}3${NC}. 只启动BK应用 (Port 3001)"
echo "  ${GREEN}4${NC}. 只启动Fuplan应用 (Port 3002)"
echo "  ${GREEN}5${NC}. 只启动Xinli应用 (Port 3003)"
echo "  ${GREEN}6${NC}. 不启动，只显示命令"
echo ""
read -p "请输入选项 (1-6): " choice

echo ""
echo "======================================"

case $choice in
    1)
        echo "🚀 启动所有应用..."
        echo ""
        echo "应用访问地址:"
        echo "  Web:    http://localhost:3000"
        echo "  BK:     http://localhost:3001"
        echo "  Fuplan: http://localhost:3002"
        echo "  Xinli:  http://localhost:3003"
        echo ""
        pnpm dev:all
        ;;
    2)
        echo "🚀 启动Web应用 (http://localhost:3000)..."
        pnpm dev:web
        ;;
    3)
        echo "🚀 启动BK应用 (http://localhost:3001)..."
        pnpm dev:bk
        ;;
    4)
        echo "🚀 启动Fuplan应用 (http://localhost:3002)..."
        pnpm dev:fuplan
        ;;
    5)
        echo "🚀 启动Xinli应用 (http://localhost:3003)..."
        pnpm dev:xinli
        ;;
    6)
        echo "📋 开发命令列表:"
        echo ""
        echo "  启动开发服务器:"
        echo "    pnpm dev:all      # 启动所有应用"
        echo "    pnpm dev:web      # 启动Web应用"
        echo "    pnpm dev:bk       # 启动BK应用"
        echo "    pnpm dev:fuplan   # 启动Fuplan应用"
        echo "    pnpm dev:xinli    # 启动Xinli应用"
        echo ""
        echo "  构建应用:"
        echo "    pnpm build        # 构建所有应用"
        echo "    pnpm build:web    # 构建Web应用"
        echo "    pnpm build:bk     # 构建BK应用"
        echo ""
        echo "  代码检查:"
        echo "    pnpm lint         # ESLint检查"
        echo "    pnpm type-check   # TypeScript检查"
        echo ""
        echo "  清理:"
        echo "    pnpm clean        # 清理构建缓存"
        echo "    pnpm clean:all    # 清理所有node_modules"
        echo ""
        ;;
    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac

echo ""
echo "✅ 完成！"
