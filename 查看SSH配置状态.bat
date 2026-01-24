@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║             ✅ SSH 免密登录配置成功！                       ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📡 服务器信息
echo    • IP: 8.153.110.212
echo    • 用户: root
echo    • 别名: member-server
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🚀 现在可以使用以下方式登录服务器:
echo.
echo    1. ssh member-server
echo    2. ssh root@8.153.110.212
echo    3. ssh -i deploy_key root@8.153.110.212
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🛠️ 可用工具:
echo.
echo    • 测试SSH免密登录.bat       - 测试连接
echo    • 服务器管理工具.bat         - 管理服务器
echo    • SSH免密登录配置完成报告.md - 详细文档
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 💡 快速命令:
echo.
echo    查看状态:  ssh member-server "pm2 list"
echo    查看日志:  ssh member-server "pm2 logs member-system --lines 50"
echo    重启服务:  ssh member-server "pm2 restart member-system"
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 测试连接...
echo.
ssh -o ConnectTimeout=5 member-server "echo '✓ 连接测试成功！服务器响应正常' && pm2 list | head -5"
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 配置完成时间: %date% %time%
echo.
pause
