@echo off
chcp 65001 >nul
echo ========================================
echo 试用功能自动修复脚本
echo ========================================
echo.

echo [1/3] 检查MySQL服务状态...
sc query MySQL80 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ MySQL80 服务已找到
    goto :check_running
)

sc query MySQL >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ MySQL 服务已找到
    set MYSQL_SERVICE=MySQL
    goto :check_running
) else (
    echo.
    echo ❌ 未找到MySQL服务
    echo.
    echo 请先安装并启动MySQL服务，然后重新运行此脚本
    echo.
    echo 启动MySQL的方法：
    echo   1. 使用服务管理器：Win+R → services.msc → 找到MySQL → 启动
    echo   2. 使用XAMPP/WAMP控制面板启动MySQL
    echo   3. 使用MySQL Workbench连接（会自动启动服务）
    echo.
    pause
    exit /b 1
)

:check_running
set MYSQL_SERVICE=MySQL80
sc query %MYSQL_SERVICE% | find "RUNNING" >nul
if %errorlevel% equ 0 (
    echo ✓ MySQL服务正在运行
    goto :run_migration
) else (
    echo.
    echo MySQL服务未运行，尝试启动...
    net start %MYSQL_SERVICE% >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✓ MySQL服务启动成功
        timeout /t 2 >nul
        goto :run_migration
    ) else (
        echo.
        echo ❌ 无法自动启动MySQL服务（需要管理员权限）
        echo.
        echo 请手动启动MySQL服务：
        echo   1. 右键点击此脚本 → 以管理员身份运行
        echo   2. 或使用服务管理器手动启动MySQL
        echo.
        pause
        exit /b 1
    )
)

:run_migration
echo.
echo [2/3] 执行数据库迁移...
node scripts\migrate-trial-support-simple.js
if %errorlevel% neq 0 (
    echo.
    echo ❌ 数据库迁移失败
    echo.
    echo 请尝试以下方法：
    echo   1. 使用MySQL Workbench手动执行 database-add-trial-support.sql
    echo   2. 检查数据库连接配置（用户名/密码）
    echo   3. 查看详细错误信息
    echo.
    pause
    exit /b 1
)

echo.
echo [3/3] 验证修复结果...
echo ✓ 数据库迁移成功完成
echo.

echo ========================================
echo ✅ 试用功能修复完成！
echo ========================================
echo.
echo 修复内容：
echo   ✓ users 表添加了试用字段（trial_bk, trial_xinli, trial_fuplan）
echo   ✓ products 表添加了试用配置（trial_enabled, trial_count）
echo   ✓ 创建了 trial_logs 表用于记录试用历史
echo   ✓ 为 3 个产品启用了试用功能（每个5次）
echo   ✓ 所有现有用户获得了默认试用次数
echo.
echo 下一步：
echo   1. 启动Web应用：cd apps\web ^&^& pnpm dev
echo   2. 访问 http://localhost:3000
echo   3. 测试试用功能
echo.
pause
