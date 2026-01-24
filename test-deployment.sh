#!/bin/bash

# 全面功能测试脚本（使用curl）
BASE_URL="http://yushuofupan.com"
COOKIE_FILE="test-cookies.txt"
TEST_USERNAME="test_$(date +%s)"
TEST_EMAIL="${TEST_USERNAME}@test.com"
TEST_PASSWORD="Test123456"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试结果统计
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
FAILURES=""

# 测试函数
test_api() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"
    local category="$6"

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    echo -e "\n${YELLOW}测试: ${test_name}${NC}"

    local cmd="curl -s -w '\n%{http_code}' -X ${method} ${BASE_URL}${endpoint}"

    if [ -f "$COOKIE_FILE" ]; then
        cmd="$cmd -b $COOKIE_FILE"
    fi

    cmd="$cmd -c $COOKIE_FILE"

    if [ -n "$data" ]; then
        cmd="$cmd -H 'Content-Type: application/json' -d '$data'"
    fi

    local start_time=$(date +%s%N)
    local response=$(eval $cmd)
    local end_time=$(date +%s%N)

    local http_code=$(echo "$response" | tail -n1)
    local response_body=$(echo "$response" | head -n-1)
    local response_time=$(( (end_time - start_time) / 1000000 ))

    echo "  状态码: $http_code"
    echo "  响应时间: ${response_time}ms"

    if [ "$http_code" = "$expected_status" ]; then
        echo -e "  ${GREEN}✅ 通过${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "  ${RED}❌ 失败${NC}"
        echo "  期望: $expected_status, 实际: $http_code"
        echo "  响应: $response_body"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        FAILURES="${FAILURES}\n[$category] ${test_name}: 期望${expected_status}, 实际${http_code}"
    fi
}

echo "=========================================="
echo "    全面功能测试 - yushuofupan.com"
echo "=========================================="
echo "测试时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 清理旧的cookie文件
rm -f "$COOKIE_FILE"

# ==========================================
# A. 用户功能测试
# ==========================================
echo ""
echo "=========================================="
echo "  A. 用户功能测试"
echo "=========================================="

# A1. 用户注册
test_api \
    "A1. 用户注册" \
    "POST" \
    "/api/auth/register" \
    "{\"username\":\"${TEST_USERNAME}\",\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\"}" \
    "200" \
    "用户功能"

# A2. 用户登录
test_api \
    "A2. 用户登录" \
    "POST" \
    "/api/auth/login" \
    "{\"username\":\"${TEST_USERNAME}\",\"password\":\"${TEST_PASSWORD}\"}" \
    "200" \
    "用户功能"

# A3. 获取用户信息
test_api \
    "A3. 获取用户信息" \
    "GET" \
    "/api/auth/me" \
    "" \
    "200" \
    "用户功能"

# A4. 产品访问门控 - 学习圈
test_api \
    "A4. 产品访问门控 - 学习圈" \
    "GET" \
    "/api/gate/circle" \
    "" \
    "200" \
    "用户功能"

# A5. 产品访问门控 - 板块节奏系统
test_api \
    "A5. 产品访问门控 - 板块节奏系统" \
    "GET" \
    "/api/gate/bk" \
    "" \
    "200" \
    "用户功能"

# ==========================================
# B. 管理员功能测试
# ==========================================
echo ""
echo "=========================================="
echo "  B. 管理员功能测试"
echo "=========================================="

# 清理用户cookie，准备管理员登录
rm -f "$COOKIE_FILE"

# B1. 管理员登录
test_api \
    "B1. 管理员登录" \
    "POST" \
    "/api/admin/auth/login" \
    "{\"username\":\"admin\",\"password\":\"admin123456\"}" \
    "200" \
    "管理员功能"

# B2. 获取会员列表
test_api \
    "B2. 获取会员列表" \
    "GET" \
    "/api/admin/members/list" \
    "" \
    "200" \
    "管理员功能"

# B3. 获取统计数据
test_api \
    "B3. 获取统计数据" \
    "GET" \
    "/api/admin/dashboard/stats" \
    "" \
    "200" \
    "管理员功能"

# ==========================================
# C. 前端页面测试
# ==========================================
echo ""
echo "=========================================="
echo "  C. 前端页面测试"
echo "=========================================="

# C1. 首页
test_api \
    "C1. 访问首页" \
    "GET" \
    "/" \
    "" \
    "200" \
    "前端页面"

# C2. 会员页
test_api \
    "C2. 访问会员页" \
    "GET" \
    "/member" \
    "" \
    "307" \
    "前端页面"

# C3. 管理后台
test_api \
    "C3. 访问管理后台" \
    "GET" \
    "/admin" \
    "" \
    "307" \
    "前端页面"

# ==========================================
# 生成测试报告
# ==========================================
echo ""
echo "=========================================="
echo "           测试报告"
echo "=========================================="
echo ""
echo "总测试数: $TOTAL_TESTS"
echo -e "${GREEN}✅ 成功: $PASSED_TESTS${NC}"
echo -e "${RED}❌ 失败: $FAILED_TESTS${NC}"

SUCCESS_RATE=$(awk "BEGIN {printf \"%.2f\", ($PASSED_TESTS/$TOTAL_TESTS)*100}")
echo ""
echo "成功率: ${SUCCESS_RATE}%"

# 系统健康评分
if (( $(echo "$SUCCESS_RATE >= 100" | bc -l) )); then
    HEALTH_SCORE="A"
elif (( $(echo "$SUCCESS_RATE >= 90" | bc -l) )); then
    HEALTH_SCORE="B"
elif (( $(echo "$SUCCESS_RATE >= 80" | bc -l) )); then
    HEALTH_SCORE="C"
elif (( $(echo "$SUCCESS_RATE >= 70" | bc -l) )); then
    HEALTH_SCORE="D"
else
    HEALTH_SCORE="F"
fi

echo "系统健康评分: $HEALTH_SCORE"

if [ $FAILED_TESTS -gt 0 ]; then
    echo ""
    echo "失败的测试:"
    echo "----------------------------------------"
    echo -e "$FAILURES"
fi

echo ""
echo "=========================================="

# 清理
rm -f "$COOKIE_FILE"

# 返回退出码
if [ $FAILED_TESTS -eq 0 ]; then
    exit 0
else
    exit 1
fi
