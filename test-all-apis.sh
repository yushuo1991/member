#!/bin/bash

# API Testing Script for Member System
# Tests all API endpoints and reports results

BASE_URL="http://yushuofupan.com"
REPORT_FILE="api-test-report.txt"

echo "=== API Testing Report ===" > "$REPORT_FILE"
echo "Generated: $(date)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Function to test API endpoint
test_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    local headers=${5:-""}

    echo "Testing: $description" | tee -a "$REPORT_FILE"
    echo "  $method $endpoint" | tee -a "$REPORT_FILE"

    if [ -n "$data" ]; then
        response=$(curl -s -X "$method" "${BASE_URL}${endpoint}" \
            -H "Content-Type: application/json" \
            $headers \
            -d "$data" \
            -w "\nHTTP_STATUS:%{http_code}")
    else
        response=$(curl -s -X "$method" "${BASE_URL}${endpoint}" \
            $headers \
            -w "\nHTTP_STATUS:%{http_code}")
    fi

    status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
    body=$(echo "$response" | grep -v "HTTP_STATUS")

    echo "  Status: $status" | tee -a "$REPORT_FILE"
    echo "  Response: ${body:0:200}..." | tee -a "$REPORT_FILE"
    echo "" | tee -a "$REPORT_FILE"
}

# 1. User Authentication APIs
echo "=== 1. User Authentication APIs ===" | tee -a "$REPORT_FILE"

# Test registration
test_api "POST" "/api/auth/register" \
    '{"username":"testuser999","email":"test999@example.com","password":"Test123456"}' \
    "Register new user"

# Test login
login_response=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"testuser","password":"Test123456"}' \
    -c cookies.txt -i)

echo "Login test:" | tee -a "$REPORT_FILE"
echo "$login_response" | head -30 | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

# Test /api/auth/me with cookie
test_api "GET" "/api/auth/me" "" \
    "Get current user info (with auth)" \
    "-b cookies.txt"

# Test /api/auth/me without cookie
test_api "GET" "/api/auth/me" "" \
    "Get current user info (no auth)"

# Test logout
test_api "POST" "/api/auth/logout" "" \
    "Logout user" \
    "-b cookies.txt"

# 2. Product Gate APIs
echo "=== 2. Product Gate APIs ===" | tee -a "$REPORT_FILE"

test_api "GET" "/api/gate/circle" "" \
    "Gate check for circle (short slug)"

test_api "GET" "/api/gate/xuexiquan" "" \
    "Gate check for xuexiquan (full slug)"

test_api "GET" "/api/gate/bk" "" \
    "Gate check for bk (short slug)"

test_api "GET" "/api/gate/bankuaijiezou" "" \
    "Gate check for bankuaijiezou (full slug)"

test_api "GET" "/api/gate/xinli" "" \
    "Gate check for xinli"

test_api "GET" "/api/gate/fuplan" "" \
    "Gate check for fuplan"

# 3. Products API
echo "=== 3. Products API ===" | tee -a "$REPORT_FILE"

test_api "GET" "/api/products" "" \
    "List all products"

# 4. Admin Authentication
echo "=== 4. Admin Authentication ===" | tee -a "$REPORT_FILE"

# Login as admin
admin_login_response=$(curl -s -X POST "${BASE_URL}/api/admin/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}' \
    -c admin_cookies.txt -i)

echo "Admin login test:" | tee -a "$REPORT_FILE"
echo "$admin_login_response" | head -30 | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

# 5. Admin APIs
echo "=== 5. Admin APIs ===" | tee -a "$REPORT_FILE"

test_api "GET" "/api/admin/dashboard/stats" "" \
    "Get dashboard stats" \
    "-b admin_cookies.txt"

test_api "GET" "/api/admin/members" "" \
    "List all members" \
    "-b admin_cookies.txt"

test_api "GET" "/api/admin/codes/list" "" \
    "List activation codes" \
    "-b admin_cookies.txt"

test_api "POST" "/api/activation/generate" \
    '{"level":"monthly","quantity":1,"note":"Test code"}' \
    "Generate activation code" \
    "-b admin_cookies.txt"

# 6. Test without auth
echo "=== 6. Unauthorized Access Tests ===" | tee -a "$REPORT_FILE"

test_api "GET" "/api/admin/dashboard/stats" "" \
    "Get dashboard stats (no auth)"

test_api "GET" "/api/admin/members" "" \
    "List members (no auth)"

# Summary
echo "" | tee -a "$REPORT_FILE"
echo "=== Test Summary ===" | tee -a "$REPORT_FILE"
echo "Full report saved to: $REPORT_FILE" | tee -a "$REPORT_FILE"

# Cleanup
rm -f cookies.txt admin_cookies.txt

echo ""
echo "Testing complete! Check $REPORT_FILE for full results."
