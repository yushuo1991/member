@echo off
REM Windows批处理 - 远程服务器诊断
REM 使用方法: 双击运行此文件

echo ==========================================
echo   会员系统服务器诊断工具
echo ==========================================
echo.

REM 检查是否安装了ssh
where ssh >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未找到SSH命令，请先安装OpenSSH或使用PuTTY/Xshell
    echo.
    pause
    exit /b 1
)

echo [提示] 准备连接到服务器 8.153.110.212
echo        请输入root密码: ChangeMe2026!Secure
echo.
echo 将执行以下检查:
echo   1. PM2 进程状态
echo   2. 端口3000监听情况
echo   3. Nginx状态
echo   4. 本地3000端口测试
echo.

REM 执行远程诊断命令
ssh root@8.153.110.212 "bash -s" << 'ENDSSH'
echo "=========================================="
echo "1️⃣ PM2 进程状态"
echo "=========================================="
pm2 list

echo ""
echo "=========================================="
echo "2️⃣ 端口3000监听情况"
echo "=========================================="
netstat -tlnp 2>/dev/null | grep :3000 || ss -tlnp 2>/dev/null | grep :3000 || echo "❌ 端口3000未监听"

echo ""
echo "=========================================="
echo "3️⃣ Nginx状态"
echo "=========================================="
systemctl status nginx --no-pager -l | head -15

echo ""
echo "=========================================="
echo "4️⃣ Nginx配置文件"
echo "=========================================="
nginx -t

echo ""
echo "=========================================="
echo "5️⃣ 部署目录文件"
echo "=========================================="
ls -lh /www/wwwroot/member-system/ | head -20

echo ""
echo "=========================================="
echo "6️⃣ 测试本地3000端口"
echo "=========================================="
curl -I http://127.0.0.1:3000 2>&1 | head -10

echo ""
echo "=========================================="
echo "7️⃣ PM2最近日志 (最后20行)"
echo "=========================================="
pm2 logs member-system --lines 20 --nostream 2>&1 || echo "无法获取日志"

echo ""
echo "=========================================="
echo "✅ 诊断完成"
echo "=========================================="
ENDSSH

echo.
echo [完成] 诊断信息已显示
echo.
pause
