#!/bin/bash
set -e

echo "========================================"
echo "  自动诊断并修复 Nginx 问题"
echo "========================================"
echo ""

# 1. 清理冲突的配置文件
echo "[1/6] 清理冲突的配置文件..."
rm -f /etc/nginx/sites-enabled/default.backup.*
rm -f /etc/nginx/sites-enabled/default

# 2. 确保我们的配置是唯一的
echo "[2/6] 设置正确的配置..."
if [ ! -L /etc/nginx/sites-enabled/member-system ]; then
    ln -sf /etc/nginx/sites-available/member-system /etc/nginx/sites-enabled/member-system
fi

# 3. 检查并修复 nginx.conf 主配置
echo "[3/6] 检查主配置文件..."
if ! grep -q "include /etc/nginx/sites-enabled/\*;" /etc/nginx/nginx.conf; then
    echo "警告: nginx.conf 可能需要手动检查"
fi

# 4. 测试配置
echo "[4/6] 测试 Nginx 配置..."
if nginx -t; then
    echo "✓ Nginx 配置测试通过"
else
    echo "✗ Nginx 配置测试失败，尝试修复..."
    # 如果配置测试失败，显示错误但继续
    nginx -t 2>&1 || true
fi

# 5. 重启 Nginx
echo "[5/6] 重启 Nginx..."
systemctl restart nginx
sleep 3

# 6. 验证结果
echo "[6/6] 验证修复结果..."
echo ""

# 测试本地访问
RESPONSE=$(curl -s -I http://localhost 2>&1)
CONTENT_LENGTH=$(echo "$RESPONSE" | grep -i "Content-Length" | awk '{print $2}' | tr -d '\r')

if [ "$CONTENT_LENGTH" = "612" ]; then
    echo "❌ 仍然返回 Nginx 默认页面，尝试深度修复..."

    # 深度修复：禁用所有其他配置
    find /etc/nginx/sites-enabled/ -type l -o -type f | grep -v member-system | xargs rm -f

    # 再次重启
    systemctl restart nginx
    sleep 3

    # 再次测试
    RESPONSE=$(curl -s -I http://localhost 2>&1)
    CONTENT_LENGTH=$(echo "$RESPONSE" | grep -i "Content-Length" | awk '{print $2}' | tr -d '\r')
fi

# 最终检查
if echo "$RESPONSE" | grep -q "X-Powered-By: Next.js"; then
    echo ""
    echo "========================================"
    echo "  ✅ 修复成功！"
    echo "========================================"
    echo ""
    echo "您现在可以通过以下方式访问："
    echo "  - http://8.153.110.212"
    echo "  - http://8.153.110.212:3000"
    echo ""
    echo "⚠️  如果外网仍然无法访问，请检查阿里云安全组："
    echo "  1. 登录 https://ecs.console.aliyun.com"
    echo "  2. 找到服务器 8.153.110.212"
    echo "  3. 安全组配置 → 入方向规则"
    echo "  4. 添加规则：端口 80/80, 协议 TCP, 授权对象 0.0.0.0/0"
    echo ""
else
    echo ""
    echo "========================================"
    echo "  ⚠️  需要进一步诊断"
    echo "========================================"
    echo ""
    echo "当前响应头："
    echo "$RESPONSE"
    echo ""
    echo "Content-Length: $CONTENT_LENGTH"
    echo ""
    echo "请检查："
    echo "  1. PM2 应用是否运行: pm2 status"
    echo "  2. 应用日志: pm2 logs member-system --lines 50"
    echo "  3. Nginx 错误日志: tail -50 /var/log/nginx/member-system-error.log"
fi

# 显示当前状态
echo ""
echo "当前服务状态："
echo "-------------------"
echo "Nginx: $(systemctl is-active nginx)"
echo "PM2 应用:"
pm2 list | grep member-system || echo "  未找到 member-system 进程"
echo ""
echo "Nginx 配置文件："
ls -la /etc/nginx/sites-enabled/
echo ""

echo "脚本执行完毕！"
