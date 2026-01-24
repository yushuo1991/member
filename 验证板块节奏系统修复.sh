#!/bin/bash

# 板块节奏系统修复验证脚本

echo "=========================================="
echo "板块节奏系统修复验证"
echo "=========================================="
echo ""

# 1. 检查远程板块节奏系统是否可访问
echo "1. 检查远程板块节奏系统..."
if curl -s -o /dev/null -w "%{http_code}" http://bk.yushuo.click | grep -q "200"; then
    echo "✓ 远程板块节奏系统正常运行"
else
    echo "✗ 警告：远程板块节奏系统无法访问"
    echo "  请检查 http://bk.yushuo.click 是否正常"
fi
echo ""

# 2. 检查本地member-system是否运行
echo "2. 检查本地开发服务器..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo "✓ 本地服务器运行中"

    # 检查/bk路由
    echo "  检查 /bk 路由..."
    if curl -s http://localhost:3000/bk | grep -q "板块节奏系统"; then
        echo "  ✓ /bk 路由正常"
    else
        echo "  ✗ /bk 路由可能有问题"
    fi
else
    echo "✗ 本地服务器未运行"
    echo "  请先运行: cd member-system && npm run dev"
fi
echo ""

# 3. 验证代码修改
echo "3. 验证代码修改..."
if grep -q 'iframeSrc="http://bk.yushuo.click"' "member-system/src/app/bk/page.tsx"; then
    echo "✓ iframe源地址已修复"
else
    echo "✗ iframe源地址未正确修复"
fi

if grep -q "productSlug=\"bk\"" "member-system/src/app/bk/page.tsx"; then
    echo "✓ productSlug已统一为'bk'"
else
    echo "✗ productSlug未正确修复"
fi

if grep -q "'bk': 'trial_bk'" "member-system/src/lib/trial-service.ts"; then
    echo "✓ 试用服务配置已更新"
else
    echo "✗ 试用服务配置未正确更新"
fi
echo ""

# 4. TypeScript类型检查
echo "4. 运行TypeScript类型检查..."
cd member-system
if npm run type-check 2>&1 | grep -q "error"; then
    echo "✗ 类型检查失败"
    npm run type-check
else
    echo "✓ 类型检查通过"
fi
cd ..
echo ""

echo "=========================================="
echo "验证完成"
echo "=========================================="
echo ""
echo "下一步操作："
echo "1. 在浏览器中访问 http://localhost:3000/bk"
echo "2. 确认显示的是涨停板追踪系统（不是复盘系统）"
echo "3. 测试会员权限和试用功能"
echo "4. 如果一切正常，提交并推送代码到GitHub"
echo ""
