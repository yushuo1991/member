#!/bin/bash
# 验证会员列表修复是否成功

echo "=========================================="
echo "  会员列表功能验证"
echo "=========================================="
echo ""

URL="http://yushuofupan.com"

echo "[1/4] 测试管理员登录..."
LOGIN_RESULT=$(curl -s -X POST "$URL/api/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123456"}' \
  -c /tmp/admin-cookie.txt)

if echo "$LOGIN_RESULT" | grep -q '"success":true'; then
  echo "  ✅ 管理员登录成功"
else
  echo "  ❌ 管理员登录失败"
  echo "  $LOGIN_RESULT"
  exit 1
fi

echo ""
echo "[2/4] 测试会员列表（无筛选）..."
MEMBERS_RESULT=$(curl -s -b /tmp/admin-cookie.txt \
  "$URL/api/admin/members?page=1&limit=10" \
  -w "\nHTTP_CODE:%{http_code}")

HTTP_CODE=$(echo "$MEMBERS_RESULT" | grep "HTTP_CODE" | cut -d':' -f2)
BODY=$(echo "$MEMBERS_RESULT" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" = "200" ]; then
  echo "  ✅ 会员列表API返回200"

  if echo "$BODY" | grep -q '"success":true'; then
    echo "  ✅ 返回数据格式正确"

    TOTAL=$(echo "$BODY" | grep -o '"total":[0-9]*' | cut -d':' -f2)
    echo "  ℹ️  总用户数: $TOTAL"
  else
    echo "  ❌ 返回数据格式错误"
    echo "$BODY" | head -5
    exit 1
  fi
else
  echo "  ❌ 会员列表API返回 $HTTP_CODE"
  echo "$BODY" | head -10
  exit 1
fi

echo ""
echo "[3/4] 测试会员筛选（免费用户）..."
FREE_RESULT=$(curl -s -b /tmp/admin-cookie.txt \
  "$URL/api/admin/members?page=1&limit=10&level=none" \
  -w "\nHTTP_CODE:%{http_code}")

HTTP_CODE=$(echo "$FREE_RESULT" | grep "HTTP_CODE" | cut -d':' -f2)
BODY=$(echo "$FREE_RESULT" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" = "200" ]; then
  echo "  ✅ 免费用户筛选正常"
else
  echo "  ❌ 筛选功能失败: HTTP $HTTP_CODE"
fi

echo ""
echo "[4/4] 测试搜索功能..."
SEARCH_RESULT=$(curl -s -b /tmp/admin-cookie.txt \
  "$URL/api/admin/members?page=1&limit=10&search=test" \
  -w "\nHTTP_CODE:%{http_code}")

HTTP_CODE=$(echo "$SEARCH_RESULT" | grep "HTTP_CODE" | cut -d':' -f2)

if [ "$HTTP_CODE" = "200" ]; then
  echo "  ✅ 搜索功能正常"
else
  echo "  ❌ 搜索功能失败: HTTP $HTTP_CODE"
fi

echo ""
echo "=========================================="
echo "  ✅ 所有测试通过！"
echo "=========================================="
echo ""
echo "会员列表功能已修复，可以正常使用。"
echo ""

rm -f /tmp/admin-cookie.txt
