@echo off
echo ========================================
echo   GitHub Actions Secrets 配置向导
echo ========================================
echo.

echo [信息] 你需要在GitHub网站上手动添加以下Secrets
echo.
echo 访问网址: https://github.com/yushuo1991/member/settings/secrets/actions
echo.
echo ========================================
echo Secret 1: DEPLOY_HOST
echo ========================================
echo 名称: DEPLOY_HOST
echo 值: 8.153.110.212
echo.
pause

echo.
echo ========================================
echo Secret 2: DEPLOY_SSH_KEY
echo ========================================
echo 名称: DEPLOY_SSH_KEY
echo.
echo [准备中] 正在读取SSH私钥...
echo.

REM 显示私钥内容
echo -------- 复制以下全部内容 --------
type deploy_key
echo.
echo -------- 复制到此为止 --------
echo.
echo.
echo [说明] 将上面的内容（从 -----BEGIN 到 -----END）
echo        完整复制到GitHub Secret的值中
echo.
pause

echo.
echo ========================================
echo   配置完成后的验证
echo ========================================
echo.
echo 1. 访问: https://github.com/yushuo1991/member/actions
echo 2. 查看是否有workflow正在运行
echo 3. 如果没有，可以手动触发:
echo    https://github.com/yushuo1991/member/actions/workflows/deploy-optimized.yml
echo    点击 "Run workflow"
echo.
echo 或者推送一个小改动测试:
echo   cd member-system
echo   echo # Test >> README.md
echo   git add README.md
echo   git commit -m "test: GitHub Actions"
echo   git push origin main
echo.
pause

echo.
echo ========================================
echo   配置完成！
echo ========================================
echo.
echo 现在你只需要执行 git push，GitHub Actions会自动部署！
echo.
pause
