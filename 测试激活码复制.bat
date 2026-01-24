@echo off
chcp 65001 >nul
echo ========================================
echo 激活码复制功能 - 本地测试
echo ========================================
echo.

cd /d "%~dp0member-system"

echo [启动开发服务器]
echo.
echo 服务器将在 http://localhost:3000 启动
echo 按 Ctrl+C 停止服务器
echo.
echo 测试步骤：
echo 1. 访问：http://localhost:3000/admin
echo 2. 登录管理员账号
echo 3. 进入激活码管理：http://localhost:3000/admin/codes
echo 4. 点击任意激活码的复制按钮
echo 5. 观察右上角 Toast 提示
echo 6. 粘贴（Ctrl+V）验证剪贴板内容
echo.
echo ========================================
echo.

npm run dev
