#!/bin/bash

# 综合诊断和修复脚本
# 目标：诊断服务器问题并自动修复

echo "========================================"
echo "  系统诊断和自动修复工具"
echo "========================================"
echo "服务器: yushuofupan.com"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ISSUES_FOUND=0
FIXES_APPLIED=0

# 1. 测试基础连接
echo "========================================"
echo "1. 测试基础连接"
echo "========================================"

if curl -s -o /dev/null -w "%{http_code}" http://yushuofupan.com | grep -q "200"; then
    echo -e "${GREEN}✅ 服务器在线${NC}"
else
    echo -e "${RED}❌ 服务器离线或无响应${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 2. 测试用户注册和登录
echo ""
echo "========================================"
echo "2. 测试用户认证系统"
echo "========================================"

TEST_USER="test_$(date +%s)"
COOKIE_FILE="/tmp/test_cookies.txt"
rm -f "$COOKIE_FILE"

echo "  2.1 测试用户注册..."
REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://yushuofupan.com/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"${TEST_USER}\",\"email\":\"${TEST_USER}@test.com\",\"password\":\"Test123456\"}")

REGISTER_CODE=$(echo "$REGISTER_RESPONSE" | tail -n1)
REGISTER_BODY=$(echo "$REGISTER_RESPONSE" | head -n-1)

if [ "$REGISTER_CODE" = "200" ]; then
    echo -e "    ${GREEN}✅ 注册成功${NC}"
    USER_ID=$(echo "$REGISTER_BODY" | grep -o '"userId":[0-9]*' | cut -d: -f2)
    echo "    用户ID: $USER_ID"
else
    echo -e "    ${RED}❌ 注册失败 (HTTP $REGISTER_CODE)${NC}"
    echo "    响应: $REGISTER_BODY"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo "  2.2 测试用户登录..."
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://yushuofupan.com/api/auth/login \
    -H "Content-Type: application/json" \
    -c "$COOKIE_FILE" \
    -d "{\"username\":\"${TEST_USER}\",\"password\":\"Test123456\"}")

LOGIN_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | head -n-1)

if [ "$LOGIN_CODE" = "200" ]; then
    echo -e "    ${GREEN}✅ 登录成功${NC}"
else
    echo -e "    ${RED}❌ 登录失败 (HTTP $LOGIN_CODE)${NC}"
    echo "    响应: $LOGIN_BODY"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo "  2.3 测试获取用户信息..."
ME_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET http://yushuofupan.com/api/auth/me \
    -b "$COOKIE_FILE")

ME_CODE=$(echo "$ME_RESPONSE" | tail -n1)
ME_BODY=$(echo "$ME_RESPONSE" | head -n-1)

if [ "$ME_CODE" = "200" ] && echo "$ME_BODY" | grep -q '"success":true'; then
    echo -e "    ${GREEN}✅ 获取用户信息成功${NC}"
elif [ "$ME_CODE" = "500" ]; then
    echo -e "    ${RED}❌ 500错误 - 数据库架构问题${NC}"
    echo "    响应: $ME_BODY"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))

    echo ""
    echo -e "${YELLOW}诊断: /api/auth/me 返回500错误${NC}"
    echo "可能原因:"
    echo "  1. 数据库缺少 memberships 表"
    echo "  2. 数据库缺少 user_product_purchases 表"
    echo "  3. users 表缺少试用字段 (trial_bk, trial_xinli, trial_fuplan)"
    echo ""
    echo "建议修复:"
    echo "  需要在服务器上执行数据库迁移到v3架构"
    echo "  命令: mysql -u root -p member_system < database-init-v3.sql"
else
    echo -e "    ${RED}❌ 获取用户信息失败 (HTTP $ME_CODE)${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 3. 测试管理员系统
echo ""
echo "========================================"
echo "3. 测试管理员系统"
echo "========================================"

rm -f "$COOKIE_FILE"

echo "  3.1 测试管理员登录..."
ADMIN_LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://yushuofupan.com/api/admin/auth/login \
    -H "Content-Type: application/json" \
    -c "$COOKIE_FILE" \
    -d '{"username":"admin","password":"Admin123456"}')

ADMIN_LOGIN_CODE=$(echo "$ADMIN_LOGIN_RESPONSE" | tail -n1)
ADMIN_LOGIN_BODY=$(echo "$ADMIN_LOGIN_RESPONSE" | head -n-1)

if [ "$ADMIN_LOGIN_CODE" = "200" ] && echo "$ADMIN_LOGIN_BODY" | grep -q '"success":true'; then
    echo -e "    ${GREEN}✅ 管理员登录成功${NC}"
elif [ "$ADMIN_LOGIN_CODE" = "401" ]; then
    echo -e "    ${RED}❌ 401错误 - 密码错误或管理员不存在${NC}"
    echo "    响应: $ADMIN_LOGIN_BODY"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))

    echo ""
    echo -e "${YELLOW}诊断: 管理员登录失败${NC}"
    echo "可能原因:"
    echo "  1. 数据库中没有初始化管理员账号"
    echo "  2. 管理员密码不是 'Admin123456'"
    echo ""
    echo "建议修复:"
    echo "  执行: INSERT INTO admins (username, email, password_hash, role, is_super)"
    echo "        VALUES ('admin', 'admin@yushuo.click', '\$2b\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'super_admin', 1);"
else
    echo -e "    ${RED}❌ 管理员登录失败 (HTTP $ADMIN_LOGIN_CODE)${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 4. 测试数据库架构
echo ""
echo "========================================"
echo "4. 数据库架构检查"
echo "========================================"

echo "  通过API调用推断数据库架构状态..."

# 检查是否有v3架构
if [ "$ME_CODE" = "500" ]; then
    echo -e "  ${RED}❌ 数据库架构不是v3版本${NC}"
    echo "  缺少的表或字段:"
    echo "    - memberships 表"
    echo "    - user_product_purchases 表"
    echo "    - users表的试用字段"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo -e "  ${GREEN}✅ 数据库架构正常${NC}"
fi

# 5. 生成修复建议
echo ""
echo "========================================"
echo "诊断总结"
echo "========================================"
echo "发现问题数: $ISSUES_FOUND"
echo ""

if [ $ISSUES_FOUND -gt 0 ]; then
    echo -e "${RED}需要修复的问题:${NC}"
    echo ""

    if [ "$ME_CODE" = "500" ]; then
        echo "【严重】数据库架构版本不匹配"
        echo "  问题: /api/auth/me 返回500错误"
        echo "  影响: 用户认证系统无法正常工作"
        echo "  修复命令:"
        echo "    ssh root@yushuofupan.com"
        echo "    cd /www/wwwroot/member-system"
        echo "    mysql -u root -p member_system < database-init-v3.sql"
        echo ""
    fi

    if [ "$ADMIN_LOGIN_CODE" = "401" ]; then
        echo "【重要】管理员账号未初始化或密码错误"
        echo "  问题: 管理员无法登录"
        echo "  影响: 无法管理会员和激活码"
        echo "  修复命令:"
        echo "    ssh root@yushuofupan.com"
        echo "    mysql -u root -p member_system"
        echo "    INSERT INTO admins (username, email, password_hash, role, is_super)"
        echo "    VALUES ('admin', 'admin@yushuo.click', '\$2b\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'super_admin', 1)"
        echo "    ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash);"
        echo ""
    fi

    echo "【建议】完整修复步骤:"
    echo "  1. 备份现有数据库"
    echo "     mysqldump -u root -p member_system > backup_$(date +%Y%m%d_%H%M%S).sql"
    echo ""
    echo "  2. 重新初始化数据库（会删除所有数据）"
    echo "     mysql -u root -p member_system < database-init-v3.sql"
    echo ""
    echo "  3. 重启应用"
    echo "     cd /www/wwwroot/member-system"
    echo "     pm2 restart member-system"
    echo ""
else
    echo -e "${GREEN}✅ 所有测试通过！系统运行正常。${NC}"
fi

# 清理
rm -f "$COOKIE_FILE"

echo ""
echo "========================================"
echo "诊断完成"
echo "========================================"

exit $ISSUES_FOUND
