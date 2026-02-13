@echo off
REM Windows批处理脚本 - 上传修复脚本到服务器
REM 使用方法: 双击运行或在CMD中执行 upload-scripts.bat

echo ==========================================
echo 上传修复脚本到服务器
echo ==========================================
echo.

REM 设置服务器信息
set /p SERVER_IP="请输入服务器IP或域名 (例如: yushuofupan.com): "
set /p SERVER_USER="请输入SSH用户名 (默认: root): "
if "%SERVER_USER%"=="" set SERVER_USER=root

echo.
echo [1/3] 上传文件到服务器...
echo.

scp server-diagnose.sh %SERVER_USER%@%SERVER_IP%:/tmp/
scp server-fix.sh %SERVER_USER%@%SERVER_IP%:/tmp/
scp server-quick-restart.sh %SERVER_USER%@%SERVER_IP%:/tmp/
scp one-line-fix.sh %SERVER_USER%@%SERVER_IP%:/tmp/

echo.
echo [2/3] 设置执行权限...
echo.

ssh %SERVER_USER%@%SERVER_IP% "chmod +x /tmp/server-diagnose.sh /tmp/server-fix.sh /tmp/server-quick-restart.sh /tmp/one-line-fix.sh"

echo.
echo ==========================================
echo 上传完成！
echo ==========================================
echo.
echo 下一步操作:
echo 1. SSH登录服务器: ssh %SERVER_USER%@%SERVER_IP%
echo 2. 运行修复脚本: bash /tmp/server-fix.sh
echo.

set /p RUN_NOW="是否立即运行修复脚本? (y/n): "
if /i "%RUN_NOW%"=="y" (
    echo.
    echo 正在运行修复脚本...
    ssh %SERVER_USER%@%SERVER_IP% "bash /tmp/server-fix.sh"
)

pause
