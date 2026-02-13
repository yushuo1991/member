#!/bin/bash
# 修复standalone构建缺少依赖的问题
# 在部署后运行此脚本确保standalone有所需的node_modules

echo "修复standalone依赖..."

APPS=("member-system" "bk-system" "fuplan-system" "xinli-system")

for app in "${APPS[@]}"; do
    STANDALONE_DIR="/www/wwwroot/$app/.next/standalone"

    if [ -d "$STANDALONE_DIR" ]; then
        echo "处理 $app..."

        # 备份原package.json（避免workspace依赖问题）
        if [ -f "$STANDALONE_DIR/package.json" ]; then
            mv "$STANDALONE_DIR/package.json" "$STANDALONE_DIR/package.json.bak"
        fi

        # 创建node_modules目录
        mkdir -p "$STANDALONE_DIR/node_modules"

        # 安装核心依赖
        cd "$STANDALONE_DIR/node_modules"
        npm install next@14.2.35 react@18.3.1 react-dom@18.3.1 sharp@0.33.5 --no-save --legacy-peer-deps

        echo "✓ $app 依赖已安装"
    else
        echo "⚠ $app standalone目录不存在，跳过"
    fi
done

echo ""
echo "所有应用依赖已修复！"
echo "现在可以重启PM2: pm2 restart all"
