#!/bin/bash

##############################################################################
# Monorepo自动化部署脚本
#
# 功能:
# - 自动配置GitHub Secrets
# - 初始化服务器环境
# - 推送代码触发部署
# - 验证部署结果
#
# 使用方法:
# chmod +x deploy-monorepo-setup.sh
# ./deploy-monorepo-setup.sh
##############################################################################

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 配置
DEPLOY_HOST="8.153.110.212"
DEPLOY_USER="root"
SSH_KEY_PATH="$HOME/.ssh/deploy_key"
REPO_PATH="C:/Users/yushu/Desktop/我的会员体系"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Monorepo自动化部署配置脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

##############################################################################
# 步骤1: 检查前置条件
##############################################################################

echo -e "${YELLOW}[1/7] 检查前置条件...${NC}"

# 检查gh CLI
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) 未安装${NC}"
    echo "请安装: https://cli.github.com/"
    exit 1
fi
echo -e "${GREEN}✅ GitHub CLI已安装${NC}"

# 检查git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git未安装${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Git已安装${NC}"

# 检查gh登录状态
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ 未登录GitHub${NC}"
    echo "请运行: gh auth login"
    exit 1
fi
echo -e "${GREEN}✅ GitHub已登录${NC}"

echo ""

##############################################################################
# 步骤2: 生成SSH密钥
##############################################################################

echo -e "${YELLOW}[2/7] 配置SSH密钥...${NC}"

if [ ! -f "$SSH_KEY_PATH" ]; then
    echo "生成SSH密钥对..."
    ssh-keygen -t rsa -b 4096 -C "deploy@member-system" -f "$SSH_KEY_PATH" -N ""
    echo -e "${GREEN}✅ SSH密钥已生成${NC}"
else
    echo -e "${GREEN}✅ SSH密钥已存在${NC}"
fi

# 显示公钥 (需要添加到服务器)
echo ""
echo "请将以下公钥添加到服务器 $DEPLOY_USER@$DEPLOY_HOST 的 ~/.ssh/authorized_keys:"
echo "---"
cat "${SSH_KEY_PATH}.pub"
echo "---"
echo ""
read -p "已添加公钥到服务器? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}请先添加公钥到服务器后再继续${NC}"
    echo "命令: ssh-copy-id -i ${SSH_KEY_PATH}.pub $DEPLOY_USER@$DEPLOY_HOST"
    exit 1
fi

# 测试SSH连接
echo "测试SSH连接..."
if ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no "$DEPLOY_USER@$DEPLOY_HOST" "echo 'SSH连接成功'" &> /dev/null; then
    echo -e "${GREEN}✅ SSH连接测试成功${NC}"
else
    echo -e "${RED}❌ SSH连接失败${NC}"
    exit 1
fi

echo ""

##############################################################################
# 步骤3: 配置GitHub Secrets
##############################################################################

echo -e "${YELLOW}[3/7] 配置GitHub Secrets...${NC}"

# 设置DEPLOY_HOST
echo "设置 DEPLOY_HOST..."
echo "$DEPLOY_HOST" | gh secret set DEPLOY_HOST
echo -e "${GREEN}✅ DEPLOY_HOST已设置${NC}"

# 设置DEPLOY_SSH_KEY
echo "设置 DEPLOY_SSH_KEY..."
cat "$SSH_KEY_PATH" | gh secret set DEPLOY_SSH_KEY
echo -e "${GREEN}✅ DEPLOY_SSH_KEY已设置${NC}"

# 验证Secrets
echo ""
echo "已配置的Secrets:"
gh secret list

echo ""

##############################################################################
# 步骤4: 初始化服务器环境
##############################################################################

echo -e "${YELLOW}[4/7] 初始化服务器环境...${NC}"

read -p "数据库密码: " -s DB_PASSWORD
echo ""
read -p "JWT密钥 (至少32字符): " JWT_SECRET
echo ""

ssh -i "$SSH_KEY_PATH" "$DEPLOY_USER@$DEPLOY_HOST" bash <<EOF
set -e

echo "创建部署目录..."
mkdir -p /www/wwwroot/{member-system,bk-system,fuplan-system,xinli-system}/logs

echo "创建.env文件..."

# Web应用
cat > /www/wwwroot/member-system/.env << 'ENVEOF'
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=$DB_PASSWORD
DB_NAME=member_system
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d
NODE_ENV=production
APP_URL=http://$DEPLOY_HOST:3000
PORT=3000
BCRYPT_ROUNDS=12
SESSION_SECRET=$JWT_SECRET
ENVEOF

# BK应用
cat > /www/wwwroot/bk-system/.env << 'ENVEOF'
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=$DB_PASSWORD
DB_NAME=member_system
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d
NODE_ENV=production
APP_URL=http://$DEPLOY_HOST:3001
PORT=3001
ENVEOF

# Fuplan应用
cat > /www/wwwroot/fuplan-system/.env << 'ENVEOF'
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=$DB_PASSWORD
DB_NAME=member_system
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d
NODE_ENV=production
APP_URL=http://$DEPLOY_HOST:3002
PORT=3002
ENVEOF

# Xinli应用
cat > /www/wwwroot/xinli-system/.env << 'ENVEOF'
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=$DB_PASSWORD
DB_NAME=member_system
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d
NODE_ENV=production
APP_URL=http://$DEPLOY_HOST:3003
PORT=3003
ENVEOF

# 设置权限
chmod 600 /www/wwwroot/*/.env

echo "检查PM2..."
if ! command -v pm2 &> /dev/null; then
    echo "安装PM2..."
    npm install -g pm2
fi

echo "配置PM2开机自启..."
pm2 startup || true
pm2 save

echo "✅ 服务器环境初始化完成"
EOF

echo -e "${GREEN}✅ 服务器环境配置完成${NC}"
echo ""

##############################################################################
# 步骤5: 创建备份
##############################################################################

echo -e "${YELLOW}[5/7] 创建Git备份分支...${NC}"

cd "$REPO_PATH"

BACKUP_BRANCH="backup/pre-monorepo-$(date +%Y%m%d)"
git checkout -b "$BACKUP_BRANCH" 2>/dev/null || git checkout "$BACKUP_BRANCH"
git push origin "$BACKUP_BRANCH" 2>/dev/null || echo "备份分支已存在"
git checkout main

echo -e "${GREEN}✅ 备份分支已创建: $BACKUP_BRANCH${NC}"
echo ""

##############################################################################
# 步骤6: 提交配置文件
##############################################################################

echo -e "${YELLOW}[6/7] 提交Monorepo配置文件...${NC}"

cd "$REPO_PATH"

# 添加所有配置文件
git add turbo.json 2>/dev/null || true
git add .github/workflows/deploy-monorepo.yml 2>/dev/null || true
git add .github/workflows/deploy-optimized.yml 2>/dev/null || true
git add ecosystem.config.monorepo.js 2>/dev/null || true
git add nginx-monorepo.conf 2>/dev/null || true
git add MONOREPO-DEPLOYMENT.md 2>/dev/null || true
git add QUICK-START.md 2>/dev/null || true
git add GITHUB-SETUP-CHECKLIST.md 2>/dev/null || true

# 检查是否有变更
if git diff --cached --quiet; then
    echo -e "${YELLOW}⚠️  没有新的变更需要提交${NC}"
else
    # 提交
    git commit -m "feat: 配置Monorepo自动化部署系统

- 添加Turborepo配置支持并行构建
- 创建GitHub Actions workflow支持智能部署
- 配置PM2多应用管理
- 添加Nginx反向代理配置
- 编写完整部署文档

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

    echo -e "${GREEN}✅ 配置文件已提交${NC}"
fi

echo ""

##############################################################################
# 步骤7: 推送并触发部署
##############################################################################

echo -e "${YELLOW}[7/7] 推送代码触发自动部署...${NC}"
echo ""
read -p "是否现在推送到GitHub并触发部署? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push origin main

    echo ""
    echo -e "${GREEN}✅ 代码已推送,部署已触发${NC}"
    echo ""
    echo "监控部署进度:"
    echo "  命令行: gh run watch"
    echo "  网页: https://github.com/yushuo1991/member/actions"
    echo ""

    # 等待5秒后开始监控
    sleep 5
    echo "启动实时监控 (Ctrl+C退出)..."
    gh run watch || echo "监控已结束"
else
    echo -e "${YELLOW}⚠️  跳过自动部署,稍后手动推送: git push origin main${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}配置完成!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "下一步:"
echo "1. 等待GitHub Actions部署完成 (~5-10分钟)"
echo "2. 验证部署: ssh $DEPLOY_USER@$DEPLOY_HOST 'pm2 list'"
echo "3. 测试应用: curl http://$DEPLOY_HOST:3000"
echo "4. 查看文档: MONOREPO-DEPLOYMENT.md"
echo ""
