@echo off
REM ============================================================================
REM 数据库索引应用脚本 (Windows)
REM Database Index Application Script (Windows)
REM ============================================================================

echo ==========================================
echo 数据库索引优化工具
echo Database Index Optimization Tool
echo ==========================================
echo.

REM 检查 database-indexes.sql 文件是否存在
if not exist "database-indexes.sql" (
    echo 错误: 找不到 database-indexes.sql 文件
    echo Error: database-indexes.sql file not found
    echo 请确保在项目根目录下运行此脚本
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

echo 正在应用数据库索引优化...
echo Applying database index optimizations...
echo.

REM 执行索引创建脚本
mysql -u root -p member_system < database-indexes.sql

if %errorlevel% equ 0 (
    echo.
    echo ==========================================
    echo √ 索引优化完成！
    echo √ Index optimization completed!
    echo ==========================================
    echo.
    echo 建议执行以下命令验证索引：
    echo Recommended: Verify indexes with:
    echo   pnpm db:verify-indexes
    echo.
) else (
    echo.
    echo ==========================================
    echo × 索引优化失败
    echo × Index optimization failed
    echo ==========================================
    echo.
    echo 请检查：
    echo Please check:
    echo   1. MySQL 服务是否运行
    echo      Is MySQL service running?
    echo   2. 数据库连接信息是否正确
    echo      Are database credentials correct?
    echo   3. member_system 数据库是否存在
    echo      Does member_system database exist?
    echo.
    pause
    exit /b 1
)

pause
