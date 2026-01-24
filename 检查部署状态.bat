@echo off
chcp 65001 >nul
echo =========================================
echo   检查 GitHub Actions 部署状态
echo =========================================
echo.

echo 正在查询最新部署状态...
echo.

gh run list --repo yushuo1991/member --workflow="deploy-simple.yml" --limit 3

echo.
echo =========================================
echo 说明:
echo   in_progress = 正在部署中
echo   completed success = 部署成功
echo   completed failure = 部署失败
echo =========================================
echo.

echo 查看详细日志请访问:
echo https://github.com/yushuo1991/member/actions
echo.

echo 部署成功后访问:
echo http://8.153.110.212:3000/admin/login
echo.

echo 管理员登录:
echo   用户名: admin
echo   密码: 7287843Wu
echo.

pause
