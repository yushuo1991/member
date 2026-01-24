#!/bin/bash

# 心理测评系统快速测试脚本

echo "🎯 开始测试心理测评系统..."
echo ""

# 检查目录
echo "📁 检查项目目录..."
if [ -d "apps/xinli" ]; then
  echo "✅ apps/xinli 目录存在"
else
  echo "❌ apps/xinli 目录不存在"
  exit 1
fi

# 检查关键文件
echo ""
echo "📄 检查关键文件..."

files=(
  "apps/xinli/package.json"
  "apps/xinli/next.config.js"
  "apps/xinli/tsconfig.json"
  "apps/xinli/tailwind.config.js"
  "apps/xinli/src/app/layout.tsx"
  "apps/xinli/src/app/page.tsx"
  "apps/xinli/src/app/xinli/page.tsx"
  "apps/xinli/src/lib/scenarios.ts"
  "apps/xinli/database-psychology.sql"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file 不存在"
  fi
done

# 检查API路由
echo ""
echo "🔌 检查API路由..."

apis=(
  "apps/xinli/src/app/api/gate/xinli/route.ts"
  "apps/xinli/src/app/api/psychology/save/route.ts"
  "apps/xinli/src/app/api/psychology/load/route.ts"
  "apps/xinli/src/app/api/psychology/history/route.ts"
  "apps/xinli/src/app/api/psychology/export/route.ts"
)

for api in "${apis[@]}"; do
  if [ -f "$api" ]; then
    echo "✅ $api"
  else
    echo "❌ $api 不存在"
  fi
done

# 检查组件
echo ""
echo "🎨 检查UI组件..."

components=(
  "apps/xinli/src/components/scenario/ScenarioForm.tsx"
  "apps/xinli/src/components/ui/ProgressBar.tsx"
  "apps/xinli/src/components/ui/NavigationSidebar.tsx"
)

for component in "${components[@]}"; do
  if [ -f "$component" ]; then
    echo "✅ $component"
  else
    echo "❌ $component 不存在"
  fi
done

# 检查场景数据
echo ""
echo "📊 验证场景数据..."

if [ -f "apps/xinli/src/lib/scenarios.ts" ]; then
  scenario_count=$(grep -c "id: [0-9]" apps/xinli/src/lib/scenarios.ts)
  if [ "$scenario_count" -ge 80 ]; then
    echo "✅ 场景数据完整 ($scenario_count 个场景)"
  else
    echo "⚠️  场景数据可能不完整 ($scenario_count 个场景，期望80个)"
  fi
fi

# 检查数据库schema
echo ""
echo "🗄️  检查数据库schema..."

if [ -f "apps/xinli/database-psychology.sql" ]; then
  tables=$(grep -c "CREATE TABLE" apps/xinli/database-psychology.sql)
  echo "✅ 数据库schema存在 ($tables 个表)"
fi

# 检查package.json配置
echo ""
echo "⚙️  检查package.json配置..."

if [ -f "apps/xinli/package.json" ]; then
  if grep -q '"dev": "next dev -p 3004"' apps/xinli/package.json; then
    echo "✅ dev脚本配置正确 (端口3004)"
  else
    echo "⚠️  dev脚本可能配置不正确"
  fi

  if grep -q '"postbuild": "node scripts/copy-standalone-assets.mjs"' apps/xinli/package.json; then
    echo "✅ postbuild脚本配置正确"
  else
    echo "⚠️  postbuild脚本可能配置不正确"
  fi
fi

# 检查环境变量模板
echo ""
echo "🔐 检查环境变量..."

if [ -f "apps/xinli/.env.example" ]; then
  echo "✅ .env.example 存在"

  if [ -f "apps/xinli/.env" ]; then
    echo "✅ .env 配置文件存在"
  else
    echo "⚠️  .env 文件不存在，需要从 .env.example 复制"
  fi
else
  echo "❌ .env.example 不存在"
fi

# 总结
echo ""
echo "================================"
echo "✨ 测试完成！"
echo "================================"
echo ""
echo "📝 下一步操作："
echo "1. 复制环境变量: cp apps/xinli/.env.example apps/xinli/.env"
echo "2. 编辑 .env 文件填入实际配置"
echo "3. 运行数据库迁移: mysql -u root -p member_system < apps/xinli/database-psychology.sql"
echo "4. 安装依赖: pnpm install"
echo "5. 启动开发服务器: pnpm dev:xinli"
echo "6. 访问: http://localhost:3004"
echo ""
