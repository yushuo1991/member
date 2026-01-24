#!/bin/bash
# sync-to-apps-web.sh
# 同步member-system的更新到apps/web
# 使用方法: bash sync-to-apps-web.sh

echo "🔄 ===== 同步member-system到apps/web ====="
echo ""

# 检查目录是否存在
if [ ! -d "member-system" ]; then
    echo "❌ member-system目录不存在"
    exit 1
fi

if [ ! -d "apps/web" ]; then
    echo "❌ apps/web目录不存在"
    exit 1
fi

echo "✅ 目录检查通过"
echo ""

# 询问同步范围
echo "请选择同步范围:"
echo "1) 仅同步API路由"
echo "2) 仅同步页面组件"
echo "3) 仅同步lib库文件"
echo "4) 全量同步（谨慎使用）"
echo "5) 自定义同步"
echo ""
read -p "请选择 (1-5): " choice

case $choice in
    1)
        echo "📋 同步API路由..."
        rsync -av --delete \
            --exclude='node_modules' \
            --exclude='.next' \
            member-system/src/app/api/ apps/web/src/app/api/
        echo "✅ API路由同步完成"
        ;;
    2)
        echo "📋 同步页面组件..."
        rsync -av --delete \
            --exclude='node_modules' \
            --exclude='.next' \
            --exclude='api' \
            member-system/src/app/ apps/web/src/app/
        echo "✅ 页面组件同步完成"
        ;;
    3)
        echo "📋 同步lib库文件..."
        rsync -av --delete \
            --exclude='node_modules' \
            member-system/src/lib/ apps/web/src/lib/
        echo "✅ lib库文件同步完成"
        ;;
    4)
        echo "⚠️  全量同步将覆盖apps/web的所有更改"
        read -p "确认继续? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            echo "📋 执行全量同步..."

            # 同步src目录
            rsync -av --delete \
                --exclude='node_modules' \
                --exclude='.next' \
                member-system/src/ apps/web/src/

            # 同步public目录
            rsync -av --delete \
                --exclude='node_modules' \
                member-system/public/ apps/web/public/

            # 同步配置文件（保留apps/web特有的package.json）
            cp member-system/next.config.js apps/web/
            cp member-system/tailwind.config.js apps/web/
            cp member-system/postcss.config.js apps/web/
            cp member-system/tsconfig.json apps/web/

            echo "✅ 全量同步完成"
        else
            echo "❌ 同步已取消"
            exit 0
        fi
        ;;
    5)
        echo "📋 自定义同步"
        echo "请输入要同步的源路径（相对于member-system/）:"
        read -p "源路径: " src_path
        echo "请输入目标路径（相对于apps/web/）:"
        read -p "目标路径: " dest_path

        rsync -av \
            --exclude='node_modules' \
            --exclude='.next' \
            "member-system/$src_path" "apps/web/$dest_path"
        echo "✅ 自定义同步完成"
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo ""
echo "🔍 检查apps/web状态..."
cd apps/web

# 检查TypeScript
echo "  - TypeScript检查..."
if pnpm type-check 2>&1 | grep -q "error"; then
    echo "  ⚠️  TypeScript检查发现错误，请手动修复"
else
    echo "  ✅ TypeScript检查通过"
fi

# 检查ESLint
echo "  - ESLint检查..."
if pnpm lint 2>&1 | grep -q "error"; then
    echo "  ⚠️  ESLint检查发现错误，请手动修复"
else
    echo "  ✅ ESLint检查通过"
fi

echo ""
echo "✅ ===== 同步完成 ====="
echo ""
echo "📌 下一步:"
echo "   1. 测试apps/web是否正常运行"
echo "      cd apps/web && pnpm dev"
echo ""
echo "   2. 测试主要功能"
echo "      - 登录/注册"
echo "      - 会员系统"
echo "      - 管理后台"
echo ""
echo "   3. 如果测试通过，提交更改"
echo "      git add apps/web"
echo "      git commit -m 'sync: 同步member-system更新到apps/web'"
echo ""
