#!/bin/bash

# 完整的服务器功能测试脚本
# 测试所有API端点和页面

BASE_URL="http://yushuofupan.com"

echo "========================================"
echo "服务器功能完整测试"
echo "基础URL: $BASE_URL"
echo "测试时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"
echo ""

# 1. 测试公开页面
echo "1. 测试公开页面"
echo "----------------------------------------"
curl -s -o /dev/null -w "首页: HTTP %{http_code}\n" $BASE_URL/
curl -s -o /dev/null -w "登录页: HTTP %{http_code}\n" $BASE_URL/login
curl -s -o /dev/null -w "注册页: HTTP %{http_code}\n" $BASE_URL/register
curl -s -o /dev/null -w "会员页: HTTP %{http_code}\n" $BASE_URL/membership
curl -s -o /dev/null -w "管理员登录: HTTP %{http_code}\n" $BASE_URL/admin/login
echo ""

# 2. 测试未认证的API端点
echo "2. 测试未认证API端点"
echo "----------------------------------------"
echo "GET /api/auth/me:"
curl -s $BASE_URL/api/auth/me
echo ""
echo ""

# 3. 测试用户注册
echo "3. 测试用户注册功能"
echo "----------------------------------------"
RANDOM_USER="testuser_$(date +%s)"
RANDOM_EMAIL="test_$(date +%s)@test.com"

echo "注册新用户: $RANDOM_USER"
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$RANDOM_USER\",
    \"email\": \"$RANDOM_EMAIL\",
    \"password\": \"Test123456\"
  }")

echo "注册响应:"
echo "$REGISTER_RESPONSE"
echo ""

# 检查注册是否成功
if echo "$REGISTER_RESPONSE" | grep -q '"success":true'; then
    echo "✓ 注册成功"

    # 4. 测试用户登录
    echo ""
    echo "4. 测试用户登录功能"
    echo "----------------------------------------"
    LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
      -H "Content-Type: application/json" \
      -c cookies.txt \
      -d "{
        \"username\": \"$RANDOM_USER\",
        \"password\": \"Test123456\"
      }")

    echo "登录响应:"
    echo "$LOGIN_RESPONSE"
    echo ""

    if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
        echo "✓ 登录成功"

        # 5. 测试认证后的API调用
        echo ""
        echo "5. 测试认证后API调用"
        echo "----------------------------------------"
        echo "GET /api/auth/me (带cookie):"
        curl -s -b cookies.txt $BASE_URL/api/auth/me
        echo ""
        echo ""

        # 6. 测试访问保护页面
        echo "6. 测试访问保护页面"
        echo "----------------------------------------"
        curl -s -o /dev/null -w "会员中心: HTTP %{http_code}\n" -b cookies.txt $BASE_URL/member
        echo ""

        # 7. 测试产品访问权限检查
        echo "7. 测试产品访问权限"
        echo "----------------------------------------"
        echo "访问板块节奏系统（需要quarterly会员）:"
        BK_GATE=$(curl -s -b cookies.txt $BASE_URL/api/gate/bk)
        echo "$BK_GATE"
        echo ""

        echo "访问学习圈（需要monthly会员）:"
        CIRCLE_GATE=$(curl -s -b cookies.txt $BASE_URL/api/gate/circle)
        echo "$CIRCLE_GATE"
        echo ""

    else
        echo "✗ 登录失败"
    fi
else
    echo "✗ 注册失败"
fi

# 8. 测试管理员登录（如果有默认管理员）
echo ""
echo "8. 测试管理员登录"
echo "----------------------------------------"
ADMIN_LOGIN=$(curl -s -X POST $BASE_URL/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -c admin_cookies.txt \
  -d '{
    "username": "admin",
    "password": "admin123"
  }')

echo "管理员登录响应:"
echo "$ADMIN_LOGIN"
echo ""

if echo "$ADMIN_LOGIN" | grep -q '"success":true'; then
    echo "✓ 管理员登录成功"

    # 测试管理员API
    echo ""
    echo "9. 测试管理员API"
    echo "----------------------------------------"
    echo "获取统计信息:"
    curl -s -b admin_cookies.txt $BASE_URL/api/admin/dashboard/stats
    echo ""
    echo ""
else
    echo "✗ 管理员登录失败（可能需要先创建管理员账户）"
fi

# 清理
rm -f cookies.txt admin_cookies.txt

echo ""
echo "========================================"
echo "测试完成"
echo "========================================"
