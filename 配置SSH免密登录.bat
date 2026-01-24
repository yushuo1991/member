@echo off
chcp 65001 >nul
echo ================================================
echo SSH免密登录配置工具
echo 服务器: root@8.153.110.212
echo ================================================
echo.

cd /d "%~dp0"

if not exist "deploy_key.pub" (
    echo 错误: 找不到 deploy_key.pub 文件
    pause
    exit /b 1
)

echo 第一步: 上传公钥到服务器
echo 注意: 需要输入服务器密码
echo.
echo 公钥内容:
type deploy_key.pub
echo.

echo 正在连接服务器并配置...
echo.

REM 使用 type 命令读取公钥，通过 ssh 添加到服务器
type deploy_key.pub | ssh root@8.153.110.212 "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo '公钥已成功添加到服务器' && echo '' && echo '当前 authorized_keys 内容:' && cat ~/.ssh/authorized_keys"

if %errorlevel% equ 0 (
    echo.
    echo ================================================
    echo 第二步: 配置本地 SSH config
    echo ================================================
    echo.

    REM 检查并创建 .ssh 目录
    if not exist "%USERPROFILE%\.ssh" (
        mkdir "%USERPROFILE%\.ssh"
        echo 已创建 %USERPROFILE%\.ssh 目录
    )

    REM 复制密钥到 .ssh 目录
    echo 复制密钥文件到 ~/.ssh 目录...
    copy /Y deploy_key "%USERPROFILE%\.ssh\deploy_key" >nul
    copy /Y deploy_key.pub "%USERPROFILE%\.ssh\deploy_key.pub" >nul
    echo 已复制 deploy_key 到 %USERPROFILE%\.ssh\
    echo.

    REM 备份现有的 config 文件
    if exist "%USERPROFILE%\.ssh\config" (
        copy /Y "%USERPROFILE%\.ssh\config" "%USERPROFILE%\.ssh\config.backup.%date:~0,4%%date:~5,2%%date:~8,2%" >nul
        echo 已备份现有 SSH config 文件
    )

    REM 创建或更新 SSH config
    echo.
    echo 正在配置 SSH config...
    powershell -Command "$configPath = '%USERPROFILE%\.ssh\config'; $content = Get-Content $configPath -ErrorAction SilentlyContinue; if ($content -notlike '*Host member-server*') { Add-Content $configPath \"`n# 会员系统服务器`nHost member-server`n    HostName 8.153.110.212`n    User root`n    IdentityFile ~/.ssh/deploy_key`n    StrictHostKeyChecking no`n\" }"

    echo.
    echo ================================================
    echo 配置完成！
    echo ================================================
    echo.
    echo 使用方法:
    echo   方式1: ssh -i deploy_key root@8.153.110.212
    echo   方式2: ssh -i "%USERPROFILE%\.ssh\deploy_key" root@8.153.110.212
    echo   方式3: ssh member-server  ^(使用 SSH config 别名^)
    echo.
    echo 第三步: 测试免密登录
    echo 按任意键开始测试...
    pause >nul

    echo.
    echo 正在测试免密登录...
    ssh -i "%USERPROFILE%\.ssh\deploy_key" root@8.153.110.212 "echo '免密登录成功！' && echo '服务器信息:' && uname -a && echo '' && echo 'PM2 状态:' && pm2 list"

    if %errorlevel% equ 0 (
        echo.
        echo ================================================
        echo ✓ SSH免密登录配置成功！
        echo ================================================
    ) else (
        echo.
        echo ================================================
        echo ✗ 测试失败，请检查配置
        echo ================================================
    )
) else (
    echo.
    echo ================================================
    echo ✗ 公钥上传失败，请检查网络和服务器密码
    echo ================================================
)

echo.
pause
