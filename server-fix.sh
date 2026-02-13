#!/bin/bash
# 服务器修复脚本 - 自动修复常见的502错误
# 使用方法: bash server-fix.sh

set -e  # 遇到错误立即退出

echo "=========================================="
echo "宇硕会员体系 - 自动修复脚本"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否为root或有sudo权限
if [ "$EUID" -ne 0 ] && ! sudo -n true 2>/dev/null; then
    echo -e "${RED}错误: 需要sudo权限${NC}"
    exit 1
fi

echo -e "\n${YELLOW}[步骤 1/6] 检查PM2进程状态${NC}"
echo "----------------------------------------"
PM2_STATUS=$(pm2 list | grep -E 'member-web|member-fuplan|member-bk|member-xinli' || echo "")

if [ -z "$PM2_STATUS" ]; then
    echo -e "${RED}未发现PM2进程，需要启动应用${NC}"
    NEED_START=true
else
    echo "当前PM2进程:"
    pm2 list
    NEED_START=false
fi

echo -e "\n${YELLOW}[步骤 2/6] 检查端口占用${NC}"
echo "----------------------------------------"
for port in 3000 3001 3002 3003; do
    PID=$(lsof -ti:$port 2>/dev/null || echo "")
    if [ -n "$PID" ]; then
        PROCESS=$(ps -p $PID -o comm= 2>/dev/null || echo "unknown")
        echo "端口 $port 被进程 $PID ($PROCESS) 占用"

        # 如果不是node进程，询问是否杀掉
        if [[ "$PROCESS" != *"node"* ]]; then
            echo -e "${YELLOW}警告: 端口被非Node进程占用${NC}"
            read -p "是否杀掉该进程? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                kill -9 $PID
                echo -e "${GREEN}已杀掉进程 $PID${NC}"
            fi
        fi
    else
        echo "端口 $port 空闲"
    fi
done

echo -e "\n${YELLOW}[步骤 3/6] 检查数据库连接${NC}"
echo "----------------------------------------"
if command -v mysql &> /dev/null; then
    if mysql -u root -p -e "SHOW DATABASES;" 2>/dev/null; then
        echo -e "${GREEN}数据库连接正常${NC}"
    else
        echo -e "${RED}数据库连接失败，请检查MySQL服务和密码${NC}"
        sudo systemctl status mysql --no-pager
    fi
else
    echo -e "${YELLOW}未安装MySQL客户端，跳过检查${NC}"
fi

echo -e "\n${YELLOW}[步骤 4/6] 检查.env文件${NC}"
echo "----------------------------------------"
for dir in member-system fuplan-system bk-system xinli-system; do
    ENV_FILE="/www/wwwroot/$dir/.env"
    if [ -f "$ENV_FILE" ]; then
        echo -e "${GREEN}✓${NC} $dir/.env 存在"
    else
        echo -e "${RED}✗${NC} $dir/.env 不存在"
    fi
done

echo -e "\n${YELLOW}[步骤 5/6] 重启PM2应用${NC}"
echo "----------------------------------------"

if [ "$NEED_START" = true ]; then
    echo "启动所有应用..."
    cd /www/wwwroot/member-system

    if [ -f "ecosystem.config.monorepo.js" ]; then
        pm2 start ecosystem.config.monorepo.js --env production
        echo -e "${GREEN}应用已启动${NC}"
    else
        echo -e "${RED}错误: 找不到 ecosystem.config.monorepo.js${NC}"
        exit 1
    fi
else
    echo "重启现有应用..."
    pm2 restart all
    echo -e "${GREEN}应用已重启${NC}"
fi

# 等待应用启动
echo "等待应用启动..."
sleep 5

echo -e "\n${YELLOW}[步骤 6/6] 重启Nginx${NC}"
echo "----------------------------------------"
sudo nginx -t
if [ $? -eq 0 ]; then
    sudo systemctl reload nginx
    echo -e "${GREEN}Nginx配置正确，已重新加载${NC}"
else
    echo -e "${RED}Nginx配置有误，请检查配置文件${NC}"
    exit 1
fi

echo -e "\n=========================================="
echo -e "${GREEN}修复完成！${NC}"
echo "=========================================="

echo -e "\n最终状态检查:"
echo "----------------------------------------"
pm2 list
echo ""
echo "请访问以下地址测试:"
echo "  - https://yushuofupan.com"
echo "  - http://localhost:3000"
echo ""
echo "如果仍有问题，请运行: pm2 logs"
