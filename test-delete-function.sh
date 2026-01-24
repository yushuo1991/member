#!/bin/bash

# 测试会员管理删除功能
# 1. 管理员登录
# 2. 获取会员列表
# 3. 删除一个会员
# 4. 验证列表中不再显示该会员

BASE_URL="http://yushuofupan.com"
ADMIN_USER="admin"
ADMIN_PASS="Yu2025!Sx"

echo "================================"
echo "会员管理删除功能测试"
echo "================================"
echo ""

# 1. 管理员登录
echo "[步骤1] 管理员登录..."
LOGIN_RESPONSE=$(curl -s -c admin_cookies.txt -X POST "${BASE_URL}/api/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${ADMIN_USER}\",\"password\":\"${ADMIN_PASS}\"}")

echo "登录响应: $LOGIN_RESPONSE"

if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
    echo "✅ 管理员登录成功"
else
    echo "❌ 管理员登录失败"
    exit 1
fi
echo ""

# 2. 获取会员列表（第一页）
echo "[步骤2] 获取会员列表..."
MEMBERS_RESPONSE=$(curl -s -b admin_cookies.txt "${BASE_URL}/api/admin/members?page=1&limit=10")

echo "会员列表响应: $MEMBERS_RESPONSE"
echo ""

# 提取第一个会员的ID和用户名
FIRST_MEMBER_ID=$(echo "$MEMBERS_RESPONSE" | grep -oP '"id":\K\d+' | head -1)
FIRST_MEMBER_USERNAME=$(echo "$MEMBERS_RESPONSE" | grep -oP '"username":"\K[^"]+' | head -1)

if [ -z "$FIRST_MEMBER_ID" ]; then
    echo "⚠️  没有可测试的会员（可能列表为空）"
    exit 0
fi

echo "准备测试删除会员:"
echo "  ID: $FIRST_MEMBER_ID"
echo "  用户名: $FIRST_MEMBER_USERNAME"
echo ""

# 3. 删除会员
echo "[步骤3] 删除会员..."
DELETE_RESPONSE=$(curl -s -b admin_cookies.txt -X DELETE "${BASE_URL}/api/admin/members/${FIRST_MEMBER_ID}")

echo "删除响应: $DELETE_RESPONSE"

if echo "$DELETE_RESPONSE" | grep -q '"success":true'; then
    echo "✅ 删除API返回成功"
else
    echo "❌ 删除API返回失败"
    exit 1
fi
echo ""

# 4. 再次获取会员列表，验证已删除
echo "[步骤4] 验证会员列表..."
sleep 1  # 等待1秒确保数据库更新
VERIFY_RESPONSE=$(curl -s -b admin_cookies.txt "${BASE_URL}/api/admin/members?page=1&limit=10")

echo "验证响应: $VERIFY_RESPONSE"
echo ""

# 检查删除的会员是否还在列表中
if echo "$VERIFY_RESPONSE" | grep -q "\"id\":$FIRST_MEMBER_ID"; then
    echo "❌ 测试失败：删除后会员仍在列表中"
    echo "   问题：API未正确过滤软删除的用户"
    exit 1
else
    echo "✅ 测试成功：删除后会员不再显示在列表中"
fi

echo ""
echo "================================"
echo "测试完成 - 删除功能正常工作"
echo "================================"

# 清理
rm -f admin_cookies.txt
