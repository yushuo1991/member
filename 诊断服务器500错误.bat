@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

echo =========================================
echo 服务器500错误诊断工具
echo =========================================
echo.

REM 检查是否安装了plink
where plink >nul 2>&1
if %errorlevel% equ 0 (
    echo 使用plink连接服务器...
    echo.

    REM 使用plink执行诊断命令
    echo echo "=========================================" > %TEMP%\diag.sh
    echo echo "服务器500错误紧急诊断报告" >> %TEMP%\diag.sh
    echo echo "时间: $(date '+%%Y-%%m-%%d %%H:%%M:%%S')" >> %TEMP%\diag.sh
    echo echo "=========================================" >> %TEMP%\diag.sh
    echo echo "" >> %TEMP%\diag.sh
    echo. >> %TEMP%\diag.sh
    echo echo "1. PM2进程状态" >> %TEMP%\diag.sh
    echo echo "-----------------------------------------" >> %TEMP%\diag.sh
    echo pm2 list >> %TEMP%\diag.sh
    echo echo "" >> %TEMP%\diag.sh
    echo. >> %TEMP%\diag.sh
    echo echo "2. PM2错误日志（最近100行）" >> %TEMP%\diag.sh
    echo pm2 logs member-system --err --lines 100 --nostream 2^>^&1 ^|^| echo "无法获取日志" >> %TEMP%\diag.sh
    echo echo "" >> %TEMP%\diag.sh
    echo. >> %TEMP%\diag.sh
    echo echo "3. 检查.env文件" >> %TEMP%\diag.sh
    echo if [ -f /www/wwwroot/member-system/.env ]; then echo "✓ .env存在"; else echo "✗ .env不存在"; fi >> %TEMP%\diag.sh
    echo echo "" >> %TEMP%\diag.sh
    echo. >> %TEMP%\diag.sh
    echo echo "4. 检查关键文件" >> %TEMP%\diag.sh
    echo cd /www/wwwroot/member-system >> %TEMP%\diag.sh
    echo ls -la ^| head -20 >> %TEMP%\diag.sh
    echo echo "" >> %TEMP%\diag.sh
    echo. >> %TEMP%\diag.sh
    echo echo "5. 测试API端点" >> %TEMP%\diag.sh
    echo curl -s -o /dev/null -w "首页状态: %%{http_code}\n" http://localhost:3000/ >> %TEMP%\diag.sh
    echo curl -s -o /dev/null -w "API状态: %%{http_code}\n" http://localhost:3000/api/auth/me >> %TEMP%\diag.sh
    echo echo "" >> %TEMP%\diag.sh
    echo. >> %TEMP%\diag.sh
    echo echo "6. 实际错误响应" >> %TEMP%\diag.sh
    echo curl -s http://localhost:3000/api/auth/me 2^>^&1 >> %TEMP%\diag.sh
    echo echo "" >> %TEMP%\diag.sh
    echo. >> %TEMP%\diag.sh
    echo echo "7. 重启服务" >> %TEMP%\diag.sh
    echo pm2 restart member-system >> %TEMP%\diag.sh
    echo sleep 3 >> %TEMP%\diag.sh
    echo pm2 logs member-system --lines 30 --nostream >> %TEMP%\diag.sh

    type %TEMP%\diag.sh | plink -ssh -batch -pw "ChangeMe2026!Secure" root@8.153.110.212 "bash" > server-diagnosis-report.txt

    echo.
    echo 诊断完成！报告已保存到: server-diagnosis-report.txt
    echo.
    type server-diagnosis-report.txt

) else (
    echo plink未安装，尝试使用标准SSH...
    echo.
    echo 请手动执行以下操作：
    echo 1. 打开新的命令行窗口
    echo 2. 执行: ssh root@8.153.110.212
    echo 3. 输入密码: ChangeMe2026!Secure
    echo 4. 执行以下命令:
    echo.
    echo ----------------------------------------
    echo pm2 list
    echo pm2 logs member-system --err --lines 100 --nostream
    echo cd /www/wwwroot/member-system
    echo ls -la
    echo cat .env
    echo curl http://localhost:3000/
    echo curl http://localhost:3000/api/auth/me
    echo pm2 restart member-system
    echo pm2 logs member-system --lines 30
    echo ----------------------------------------
    echo.
)

pause
