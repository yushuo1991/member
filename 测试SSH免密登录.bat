@echo off
chcp 65001 >nul
echo ================================================
echo SSH免密登录测试
echo ================================================
echo.

echo 测试1: 使用别名登录 (ssh member-server)
echo.
ssh -o ConnectTimeout=10 member-server "echo '✓ 别名登录成功'"

if %errorlevel% equ 0 (
    echo ✓ 测试1通过
) else (
    echo ✗ 测试1失败
)

echo.
echo 测试2: 使用 IP 地址登录 (ssh root@8.153.110.212)
echo.
ssh -o ConnectTimeout=10 root@8.153.110.212 "echo '✓ IP登录成功'"

if %errorlevel% equ 0 (
    echo ✓ 测试2通过
) else (
    echo ✗ 测试2失败
)

echo.
echo 测试3: 查看服务器状态
echo.
ssh member-server "pm2 list && echo '' && echo '磁盘使用情况:' && df -h | grep -E '(Filesystem|/dev/)'"

echo.
echo ================================================
echo 测试完成！
echo ================================================
echo.
echo 现在可以使用以下方式免密登录服务器：
echo   1. ssh member-server
echo   2. ssh root@8.153.110.212
echo   3. ssh -i deploy_key root@8.153.110.212
echo.
pause
