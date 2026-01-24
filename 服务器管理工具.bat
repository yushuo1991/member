@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:menu
cls
echo ================================================
echo 服务器管理快捷工具
echo 服务器: root@8.153.110.212 (member-server)
echo ================================================
echo.
echo 请选择操作:
echo.
echo   1. 登录服务器
echo   2. 查看 PM2 进程状态
echo   3. 查看服务器日志 (最近50行)
echo   4. 重启会员系统服务
echo   5. 查看系统资源使用情况
echo   6. 部署最新代码 (git pull + pm2 restart)
echo   7. 查看数据库状态
echo   8. 执行自定义命令
echo   0. 退出
echo.
set /p choice=请输入选项 (0-8):

if "%choice%"=="1" goto login
if "%choice%"=="2" goto pm2_status
if "%choice%"=="3" goto logs
if "%choice%"=="4" goto restart
if "%choice%"=="5" goto system_info
if "%choice%"=="6" goto deploy
if "%choice%"=="7" goto database
if "%choice%"=="8" goto custom
if "%choice%"=="0" goto end
echo 无效选项，请重新选择
timeout /t 2 >nul
goto menu

:login
echo.
echo 正在登录服务器...
ssh member-server
goto menu

:pm2_status
echo.
echo 正在获取 PM2 进程状态...
echo.
ssh member-server "pm2 list && echo '' && pm2 describe member-system"
echo.
pause
goto menu

:logs
echo.
echo 正在获取服务器日志 (最近50行)...
echo.
ssh member-server "pm2 logs member-system --lines 50 --nostream"
echo.
pause
goto menu

:restart
echo.
echo 警告: 即将重启会员系统服务
set /p confirm=确认重启? (y/n):
if /i "%confirm%" neq "y" (
    echo 已取消重启
    timeout /t 2 >nul
    goto menu
)
echo.
echo 正在重启服务...
ssh member-server "pm2 restart member-system && pm2 list"
echo.
echo 重启完成！
pause
goto menu

:system_info
echo.
echo 正在获取系统资源使用情况...
echo.
ssh member-server "echo '=== CPU 和内存 ===' && free -h && echo '' && echo '=== 磁盘使用 ===' && df -h && echo '' && echo '=== 系统负载 ===' && uptime"
echo.
pause
goto menu

:deploy
echo.
echo 警告: 即将部署最新代码到生产环境
set /p confirm=确认部署? (y/n):
if /i "%confirm%" neq "y" (
    echo 已取消部署
    timeout /t 2 >nul
    goto menu
)
echo.
echo 正在部署...
echo.
ssh member-server "cd /www/wwwroot/member-system && echo '1. Git pull...' && git pull && echo '' && echo '2. 安装依赖...' && npm ci --only=production && echo '' && echo '3. 重启服务...' && pm2 restart member-system && echo '' && echo '4. 查看状态...' && pm2 list"
echo.
echo 部署完成！
pause
goto menu

:database
echo.
echo 正在检查数据库状态...
echo.
ssh member-server "systemctl status mysql --no-pager && echo '' && mysql -u root -p -e 'SHOW DATABASES; SELECT COUNT(*) as user_count FROM member_system.users;'"
echo.
pause
goto menu

:custom
echo.
set /p cmd=请输入要执行的命令:
echo.
echo 正在执行: %cmd%
echo.
ssh member-server "%cmd%"
echo.
pause
goto menu

:end
echo.
echo 再见！
timeout /t 1 >nul
exit /b 0
