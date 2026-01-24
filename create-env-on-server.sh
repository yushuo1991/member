#!/bin/bash
# 在服务器上创建 .env 文件的脚本
# 使用方法: ssh root@8.153.110.212 'bash -s' < create-env-on-server.sh

DEPLOY_PATH="/www/wwwroot/member-system"

echo "正在创建 .env 文件..."

cat > "$DEPLOY_PATH/.env" << 'EOF'
# 应用配置
NODE_ENV=production
APP_URL=http://yushuofupan.com
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=ChangeMe2026!Secure
DB_NAME=member_system

# JWT配置
JWT_SECRET=yushuo_member_system_jwt_secret_key_2026
JWT_EXPIRES_IN=7d

# 会话配置
SESSION_SECRET=yushuo_member_system_session_secret_key_2026

# 安全配置
BCRYPT_ROUNDS=10

# 管理员账号配置（环境变量登录，优先级高于数据库）
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@yushuo.com
ADMIN_PASSWORD=7287843Wu

# 日志配置
LOG_LEVEL=info
EOF

echo "✅ .env 文件已创建: $DEPLOY_PATH/.env"
echo ""
echo "验证文件内容（隐藏密码）："
grep -v "PASSWORD\|SECRET" "$DEPLOY_PATH/.env"
