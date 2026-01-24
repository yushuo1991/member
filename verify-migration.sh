#!/bin/bash

echo "==================================="
echo "Monorepo 迁移验证脚本"
echo "==================================="
echo ""

# 检查目录结构
echo "[1/6] 检查目录结构..."
required_dirs=(
  "apps/web"
  "packages/ui"
  "packages/auth"
  "packages/database"
)

for dir in "${required_dirs[@]}"; do
  if [ -d "$dir" ]; then
    echo "  ✓ $dir 存在"
  else
    echo "  ✗ $dir 不存在"
    exit 1
  fi
done

echo ""
echo "[2/6] 检查配置文件..."
required_files=(
  "package.json"
  "pnpm-workspace.yaml"
  "turbo.json"
  ".gitignore"
  "apps/web/package.json"
  "packages/ui/package.json"
  "packages/auth/package.json"
  "packages/database/package.json"
)

for file in "${required_files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✓ $file 存在"
  else
    echo "  ✗ $file 不存在"
    exit 1
  fi
done

echo ""
echo "[3/6] 检查包名称..."
check_package_name() {
  local file=$1
  local expected=$2
  local actual=$(grep -o '"name": "[^"]*"' "$file" | head -1 | cut -d'"' -f4)
  
  if [ "$actual" == "$expected" ]; then
    echo "  ✓ $file: $actual"
  else
    echo "  ✗ $file: 期望 $expected, 实际 $actual"
    exit 1
  fi
}

check_package_name "apps/web/package.json" "web"
check_package_name "packages/ui/package.json" "@repo/ui"
check_package_name "packages/auth/package.json" "@repo/auth"
check_package_name "packages/database/package.json" "@repo/database"

echo ""
echo "[4/6] 检查源文件..."
required_src_files=(
  "apps/web/src/app/page.tsx"
  "apps/web/src/app/api/auth/login/route.ts"
  "packages/ui/src/index.tsx"
  "packages/auth/src/index.ts"
  "packages/database/src/index.ts"
)

for file in "${required_src_files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✓ $file 存在"
  else
    echo "  ✗ $file 不存在"
    exit 1
  fi
done

echo ""
echo "[5/6] 检查导入路径（采样）..."

# 检查是否使用了新的导入路径
if grep -r "@repo/database" apps/web/src/app/api/ > /dev/null; then
  echo "  ✓ API路由使用 @repo/database"
else
  echo "  ✗ API路由未使用 @repo/database"
  exit 1
fi

if grep -r "@repo/auth" apps/web/src/app/api/ > /dev/null; then
  echo "  ✓ API路由使用 @repo/auth"
else
  echo "  ✗ API路由未使用 @repo/auth"
  exit 1
fi

echo ""
echo "[6/6] 检查是否有旧的导入路径..."

# 检查是否还有旧的导入路径
if grep -r "from '@/lib/database'" apps/web/src/ 2>/dev/null; then
  echo "  ✗ 发现旧的导入路径 @/lib/database"
  exit 1
else
  echo "  ✓ 未发现旧的 @/lib/database 导入"
fi

if grep -r "from '@/lib/auth-middleware'" apps/web/src/ 2>/dev/null; then
  echo "  ✗ 发现旧的导入路径 @/lib/auth-middleware"
  exit 1
else
  echo "  ✓ 未发现旧的 @/lib/auth-middleware 导入"
fi

echo ""
echo "==================================="
echo "✅ 所有检查通过！"
echo "==================================="
echo ""
echo "下一步："
echo "1. 运行 'pnpm install' 安装依赖"
echo "2. 运行 'pnpm dev' 启动开发服务器"
echo "3. 运行 'pnpm build' 测试构建"
echo ""
