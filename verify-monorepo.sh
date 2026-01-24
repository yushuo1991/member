#!/bin/bash

echo "======================================"
echo "  宇硕会员体系 Monorepo 结构验证"
echo "======================================"
echo ""

# 检查必要的文件
echo "1. 检查根目录配置文件..."
files=(
  "package.json"
  "pnpm-workspace.yaml"
  "turbo.json"
  ".gitignore"
  "MONOREPO-README.md"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "   ✓ $file"
  else
    echo "   ✗ $file (缺失)"
  fi
done

echo ""
echo "2. 检查共享包..."
packages=(
  "packages/ui"
  "packages/auth"
  "packages/database"
  "packages/config"
  "packages/utils"
)

for pkg in "${packages[@]}"; do
  if [ -d "$pkg" ] && [ -f "$pkg/package.json" ]; then
    echo "   ✓ $pkg"
  else
    echo "   ✗ $pkg (缺失)"
  fi
done

echo ""
echo "3. 检查应用目录..."
apps=(
  "apps/web"
  "apps/bk"
  "apps/fuplan"
  "apps/xinli"
)

for app in "${apps[@]}"; do
  if [ -d "$app" ]; then
    echo "   ✓ $app (已创建)"
  else
    echo "   ○ $app (待迁移)"
  fi
done

echo ""
echo "4. 检查包结构完整性..."

# 检查ui包
if [ -f "packages/ui/src/index.ts" ]; then
  component_count=$(ls packages/ui/src/components/*.tsx 2>/dev/null | wc -l)
  echo "   ✓ UI组件库 ($component_count 个组件)"
else
  echo "   ✗ UI组件库 (结构不完整)"
fi

# 检查auth包
if [ -f "packages/auth/src/index.ts" ]; then
  echo "   ✓ 认证模块"
else
  echo "   ✗ 认证模块 (结构不完整)"
fi

# 检查database包
if [ -f "packages/database/src/connection.ts" ]; then
  echo "   ✓ 数据库连接池"
else
  echo "   ✗ 数据库连接池 (结构不完整)"
fi

# 检查utils包
if [ -f "packages/utils/src/index.ts" ]; then
  echo "   ✓ 工具函数库"
else
  echo "   ✗ 工具函数库 (结构不完整)"
fi

echo ""
echo "======================================"
echo "  验证完成"
echo "======================================"
echo ""
echo "下一步操作："
echo "1. 运行 'pnpm install' 安装依赖"
echo "2. 迁移现有应用到 apps/ 目录"
echo "3. 运行 'pnpm dev' 启动开发服务器"
echo ""
