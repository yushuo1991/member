@echo off
chcp 65001 >nul
echo =========================================
echo   推送代码到 GitHub - yushuo1991/member
echo =========================================
echo.

cd /d "C:\Users\yushu\Desktop\我的会员体系"

echo [1/3] 检查 Git 状态...
git status
echo.

echo [2/3] 添加所有修改...
git add .
git commit -m "feat: 更新会员系统 - %date% %time%"
echo.

echo [3/3] 推送到 GitHub...
git push -u origin main

if %errorlevel% == 0 (
    echo.
    echo =========================================
    echo   ✅ 推送成功!
    echo =========================================
    echo.
    echo GitHub Actions 将自动部署到服务器
    echo.
    echo 查看部署进度:
    echo https://github.com/yushuo1991/member/actions
    echo.
    echo 部署完成后访问:
    echo http://8.153.110.212:3000/admin/login
    echo.
    echo 管理员账号:
    echo   用户名: admin
    echo   密码: 7287843Wu
    echo.
) else (
    echo.
    echo =========================================
    echo   ❌ 推送失败
    echo =========================================
    echo.
    echo 可能的原因:
    echo 1. 网络连接问题
    echo 2. GitHub 认证失败
    echo 3. 仓库权限问题
    echo.
    echo 请检查网络后重试
)

echo.
pause
