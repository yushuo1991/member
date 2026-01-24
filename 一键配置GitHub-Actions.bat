@echo off
echo.
echo ========================================
echo   GitHub Actions 一键配置
echo ========================================
echo.
echo 步骤1: 打开GitHub Secrets设置页面
start https://github.com/yushuo1991/member/settings/secrets/actions/new
timeout /t 3 /nobreak >nul

echo.
echo 步骤2: 配置 DEPLOY_HOST
echo.
echo   在打开的页面中填写:
echo   Name: DEPLOY_HOST
echo   Secret: 8.153.110.212
echo.
echo   点击 "Add secret"
echo.
pause

echo.
echo 步骤3: 添加 DEPLOY_SSH_KEY
start https://github.com/yushuo1991/member/settings/secrets/actions/new
timeout /t 2 /nobreak >nul

echo.
echo   在新打开的页面中填写:
echo   Name: DEPLOY_SSH_KEY
echo.
echo   Secret: 按 Ctrl+C 后，点击下面的记事本会自动打开SSH密钥
echo.
pause

notepad deploy_key

echo.
echo   将记事本中的全部内容复制到GitHub Secret的值中
echo   (从 -----BEGIN OPENSSH PRIVATE KEY----- 到 -----END OPENSSH PRIVATE KEY-----)
echo.
echo   点击 "Add secret"
echo.
pause

echo.
echo ========================================
echo   配置完成！测试部署
echo ========================================
echo.
echo 打开GitHub Actions页面查看...
start https://github.com/yushuo1991/member/actions

echo.
echo 代码已推送，如果Secrets配置正确，
echo 应该会看到一个workflow正在运行！
echo.
echo 如果没有看到，点击 "Deploy member-system (Optimized)"
echo 然后点击 "Run workflow" 手动触发。
echo.
pause
