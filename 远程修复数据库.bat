@echo off
chcp 65001 > nul
setlocal

echo =========================================
echo 远程服务器数据库诊断和修复工具
echo =========================================
echo.

set SERVER=8.153.110.212
set USER=root
set PASSWORD=ChangeMe2026!Secure

echo 服务器: %SERVER%
echo 用户: %USER%
echo.

REM 检查是否有plink
where plink >nul 2>&1
if %errorlevel% equ 0 (
    echo [使用plink连接]
    echo.

    REM 上传修复脚本
    echo 上传修复脚本到服务器...
    type "C:\Users\yushu\Desktop\我的会员体系\fix-database-remote.sh" | plink -ssh -batch -pw "%PASSWORD%" %USER%@%SERVER% "cat > /tmp/fix-database.sh && chmod +x /tmp/fix-database.sh"

    if %errorlevel% equ 0 (
        echo ✓ 脚本已上传
        echo.
        echo 执行修复脚本...
        echo.
        plink -ssh -batch -pw "%PASSWORD%" %USER%@%SERVER% "bash /tmp/fix-database.sh"
    ) else (
        echo ✗ 上传失败
    )

) else (
    echo plink未找到，请安装PuTTY或使用以下命令手动连接:
    echo.
    echo ssh %USER%@%SERVER%
    echo 密码: %PASSWORD%
    echo.
    echo 然后执行以下命令:
    echo.
    echo ----------------------------------------
    type "C:\Users\yushu\Desktop\我的会员体系\fix-database-remote.sh"
    echo ----------------------------------------
)

echo.
echo 按任意键退出...
pause >nul
