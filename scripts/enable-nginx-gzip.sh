#!/bin/bash

###############################################################################
# Nginx Gzip压缩自动配置脚本
# 用途: 自动启用Nginx的Gzip压缩，提升网站加载速度
# 使用: bash enable-nginx-gzip.sh
###############################################################################

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}==================== Nginx Gzip压缩配置 ====================${NC}"
echo ""

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ 请使用root权限运行此脚本${NC}"
    echo "使用: sudo bash enable-nginx-gzip.sh"
    exit 1
fi

# 检查Nginx是否安装
if ! command -v nginx &> /dev/null; then
    echo -e "${RED}❌ Nginx未安装，请先安装Nginx${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Nginx已安装${NC}"

# 备份当前配置
BACKUP_FILE="/etc/nginx/nginx.conf.backup.$(date +%Y%m%d_%H%M%S)"
echo -e "${YELLOW}📦 备份当前配置到: $BACKUP_FILE${NC}"
cp /etc/nginx/nginx.conf "$BACKUP_FILE"

# 检查是否已启用gzip
if grep -q "gzip on;" /etc/nginx/nginx.conf; then
    echo -e "${YELLOW}⚠️  检测到已有gzip配置，将进行更新${NC}"

    # 注释掉旧的gzip配置
    sed -i '/gzip/s/^/#/' /etc/nginx/nginx.conf
fi

# 查找http块的位置
HTTP_LINE=$(grep -n "http {" /etc/nginx/nginx.conf | head -1 | cut -d: -f1)

if [ -z "$HTTP_LINE" ]; then
    echo -e "${RED}❌ 未找到http配置块${NC}"
    exit 1
fi

# 计算插入位置（http { 的下一行）
INSERT_LINE=$((HTTP_LINE + 1))

echo -e "${GREEN}✓ 找到http配置块，准备插入gzip配置${NC}"

# 创建临时文件
TEMP_FILE=$(mktemp)

# 生成gzip配置
cat > "$TEMP_FILE" << 'EOF'

    ##
    # Gzip 压缩配置 (自动生成)
    ##
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss
               application/rss+xml font/truetype font/opentype
               application/vnd.ms-fontobject image/svg+xml;
    gzip_min_length 256;
    gzip_disable "msie6";

EOF

# 插入配置
head -n $HTTP_LINE /etc/nginx/nginx.conf > /etc/nginx/nginx.conf.new
cat "$TEMP_FILE" >> /etc/nginx/nginx.conf.new
tail -n +$((INSERT_LINE)) /etc/nginx/nginx.conf >> /etc/nginx/nginx.conf.new

# 替换配置文件
mv /etc/nginx/nginx.conf.new /etc/nginx/nginx.conf
rm "$TEMP_FILE"

echo -e "${GREEN}✓ Gzip配置已添加${NC}"

# 测试Nginx配置
echo -e "${YELLOW}🔍 测试Nginx配置...${NC}"
if nginx -t 2>&1 | grep -q "successful"; then
    echo -e "${GREEN}✓ Nginx配置测试通过${NC}"
else
    echo -e "${RED}❌ Nginx配置测试失败，正在恢复备份${NC}"
    cp "$BACKUP_FILE" /etc/nginx/nginx.conf
    nginx -t
    exit 1
fi

# 重新加载Nginx
echo -e "${YELLOW}🔄 重新加载Nginx...${NC}"
systemctl reload nginx

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Nginx已成功重新加载${NC}"
else
    echo -e "${RED}❌ Nginx重新加载失败${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}==================== 配置完成 ====================${NC}"
echo ""
echo -e "${GREEN}✅ Gzip压缩已成功启用！${NC}"
echo ""
echo "📊 验证方法："
echo "1. 检查响应头:"
echo "   curl -I -H 'Accept-Encoding: gzip' http://bk.yushuofupan.com/"
echo ""
echo "2. 对比压缩效果:"
echo "   未压缩大小: curl -so /dev/null -w '%{size_download}' http://bk.yushuofupan.com/"
echo "   压缩后大小: curl -so /dev/null -w '%{size_download}' -H 'Accept-Encoding: gzip' http://bk.yushuofupan.com/"
echo ""
echo "3. 查看详细信息:"
echo "   curl -I http://bk.yushuofupan.com/ | grep -i 'content-encoding'"
echo ""
echo "📝 备份文件: $BACKUP_FILE"
echo ""
