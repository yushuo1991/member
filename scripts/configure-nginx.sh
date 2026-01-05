#!/bin/bash
set -e

echo "========================================"
echo "  自动配置 Nginx 反向代理"
echo "========================================"

# 备份现有配置
if [ -f /etc/nginx/sites-enabled/default ]; then
  echo "[1/5] 备份现有 Nginx 配置..."
  cp /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.backup.$(date +%Y%m%d_%H%M%S)
fi

# 创建新的 Nginx 配置
echo "[2/5] 创建 Nginx 配置文件..."
cat > /etc/nginx/sites-available/member-system <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name 8.153.110.212 yushuofupan.com www.yushuofupan.com;

    # 访问日志
    access_log /var/log/nginx/member-system-access.log;
    error_log /var/log/nginx/member-system-error.log;

    # 客户端最大上传大小
    client_max_body_size 10M;

    # 反向代理到 Next.js 应用
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;

        # WebSocket 支持
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';

        # 代理头
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 缓存配置
        proxy_cache_bypass $http_upgrade;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Next.js 静态资源缓存
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=3600, immutable";
    }

    # 图片等静态资源
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
EOF

# 启用配置
echo "[3/5] 启用配置文件..."
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/member-system /etc/nginx/sites-enabled/member-system

# 测试配置
echo "[4/5] 测试 Nginx 配置..."
nginx -t

# 重启 Nginx
echo "[5/5] 重启 Nginx..."
systemctl restart nginx
systemctl enable nginx

echo ""
echo "========================================"
echo "  ✅ Nginx 配置完成！"
echo "========================================"
echo ""
echo "现在可以通过以下方式访问："
echo "  - http://8.153.110.212"
echo "  - http://8.153.110.212:3000 （依然可用）"
echo ""
echo "域名备案通过后还可以通过："
echo "  - http://yushuofupan.com"
echo "  - http://www.yushuofupan.com"
echo ""
echo "状态检查："
echo "  - Nginx: systemctl status nginx"
echo "  - 应用: pm2 status"
echo ""
echo "✨ 晚安！系统已配置完毕！"
echo ""
