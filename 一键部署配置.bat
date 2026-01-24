@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM ############################################################################
REM Monorepo自动化部署配置脚本 (Windows版本)
REM
REM 功能:
REM - 配置GitHub Secrets
REM - 推送代码触发部署
REM - 验证部署结果
REM
REM 使用方法: 双击运行或在PowerShell中执行
REM ############################################################################

title Monorepo自动化部署配置

echo ========================================
echo Monorepo自动化部署配置脚本
echo ========================================
echo.

REM 配置
set DEPLOY_HOST=8.153.110.212
set DEPLOY_USER=root
set REPO_PATH=%~dp0

REM ############################################################################
REM 步骤1: 检查前置条件
REM ############################################################################

echo [1/5] 检查前置条件...
echo.

REM 检查gh CLI
gh --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] GitHub CLI (gh) 未安装
    echo 请从 https://cli.github.com/ 下载安装
    pause
    exit /b 1
)
echo [OK] GitHub CLI已安装

REM 检查git
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git未安装
    pause
    exit /b 1
)
echo [OK] Git已安装

REM 检查gh登录状态
gh auth status >nul 2>&1
if errorlevel 1 (
    echo [ERROR] 未登录GitHub
    echo 请运行: gh auth login
    pause
    exit /b 1
)
echo [OK] GitHub已登录

echo.

REM ############################################################################
REM 步骤2: 配置GitHub Secrets
REM ############################################################################

echo [2/5] 配置GitHub Secrets...
echo.

REM 设置DEPLOY_HOST
echo %DEPLOY_HOST% | gh secret set DEPLOY_HOST
if errorlevel 1 (
    echo [ERROR] 设置DEPLOY_HOST失败
    pause
    exit /b 1
)
echo [OK] DEPLOY_HOST已设置

REM 设置DEPLOY_SSH_KEY
if exist "%USERPROFILE%\.ssh\id_rsa" (
    gh secret set DEPLOY_SSH_KEY < "%USERPROFILE%\.ssh\id_rsa"
    if errorlevel 1 (
        echo [ERROR] 设置DEPLOY_SSH_KEY失败
        pause
        exit /b 1
    )
    echo [OK] DEPLOY_SSH_KEY已设置
) else if exist "%USERPROFILE%\.ssh\deploy_key" (
    gh secret set DEPLOY_SSH_KEY < "%USERPROFILE%\.ssh\deploy_key"
    echo [OK] DEPLOY_SSH_KEY已设置
) else (
    echo [WARNING] 未找到SSH密钥文件
    echo 请确保以下文件存在:
    echo   %USERPROFILE%\.ssh\id_rsa
    echo   或 %USERPROFILE%\.ssh\deploy_key
    echo.
    echo 生成SSH密钥:
    echo   ssh-keygen -t rsa -b 4096 -C "deploy@member-system"
    pause
)

echo.
echo 已配置的Secrets:
gh secret list
echo.

REM ############################################################################
REM 步骤3: 创建备份分支
REM ############################################################################

echo [3/5] 创建Git备份分支...
echo.

cd /d "%REPO_PATH%"

REM 获取当前日期 (格式: YYYYMMDD)
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set BACKUP_DATE=%datetime:~0,8%
set BACKUP_BRANCH=backup/pre-monorepo-%BACKUP_DATE%

REM 创建并推送备份分支
git checkout -b %BACKUP_BRANCH% 2>nul || git checkout %BACKUP_BRANCH%
git push origin %BACKUP_BRANCH% 2>nul
git checkout main

echo [OK] 备份分支已创建: %BACKUP_BRANCH%
echo.

REM ############################################################################
REM 步骤4: 提交配置文件
REM ############################################################################

echo [4/5] 提交Monorepo配置文件...
echo.

REM 添加配置文件
git add turbo.json 2>nul
git add .github\workflows\deploy-monorepo.yml 2>nul
git add .github\workflows\deploy-optimized.yml 2>nul
git add ecosystem.config.monorepo.js 2>nul
git add nginx-monorepo.conf 2>nul
git add MONOREPO-DEPLOYMENT.md 2>nul
git add QUICK-START.md 2>nul
git add GITHUB-SETUP-CHECKLIST.md 2>nul
git add deploy-monorepo-setup.sh 2>nul
git add 一键部署配置.bat 2>nul

REM 检查是否有变更
git diff --cached --quiet
if errorlevel 1 (
    REM 有变更,提交
    git commit -m "feat: 配置Monorepo自动化部署系统

- 添加Turborepo配置支持并行构建
- 创建GitHub Actions workflow支持智能部署
- 配置PM2多应用管理
- 添加Nginx反向代理配置
- 编写完整部署文档

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

    echo [OK] 配置文件已提交
) else (
    echo [WARNING] 没有新的变更需要提交
)

echo.

REM ############################################################################
REM 步骤5: 推送并触发部署
REM ############################################################################

echo [5/5] 推送代码触发自动部署...
echo.

set /p CONFIRM="是否现在推送到GitHub并触发部署? (y/n): "
if /i "%CONFIRM%"=="y" (
    git push origin main

    echo.
    echo [OK] 代码已推送,部署已触发
    echo.
    echo 监控部署进度:
    echo   命令行: gh run watch
    echo   网页: https://github.com/yushuo1991/member/actions
    echo.

    REM 等待5秒
    timeout /t 5 /nobreak >nul

    echo 启动实时监控 (Ctrl+C退出)...
    echo.
    gh run watch
) else (
    echo [WARNING] 跳过自动部署,稍后手动推送: git push origin main
)

echo.
echo ========================================
echo 配置完成!
echo ========================================
echo.
echo 下一步:
echo 1. 等待GitHub Actions部署完成 (~5-10分钟)
echo 2. 验证部署: ssh %DEPLOY_USER%@%DEPLOY_HOST% "pm2 list"
echo 3. 测试应用: curl http://%DEPLOY_HOST%:3000
echo 4. 查看文档: MONOREPO-DEPLOYMENT.md
echo.

pause
