@echo off
REM 快速验证服务器状态 - 一键健康检查
chcp 65001 > nul
setlocal

echo =========================================
echo 会员系统服务器健康检查
echo 服务器: yushuofupan.com
echo =========================================
echo.

echo [1/5] 测试首页...
curl -s -o nul -w "首页: %%{http_code} " http://yushuofupan.com/ && echo ✓ || echo ✗
echo.

echo [2/5] 测试用户注册API...
curl -s -o nul -w "注册API: %%{http_code} " http://yushuofupan.com/register && echo ✓ || echo ✗
echo.

echo [3/5] 测试登录API...
curl -s -o nul -w "登录API: %%{http_code} " http://yushuofupan.com/login && echo ✓ || echo ✗
echo.

echo [4/5] 测试管理员登录页...
curl -s -o nul -w "管理员: %%{http_code} " http://yushuofupan.com/admin/login && echo ✓ || echo ✗
echo.

echo [5/5] 测试API响应...
curl -s http://yushuofupan.com/api/auth/me > temp_api_response.txt
findstr /C:"timestamp" temp_api_response.txt >nul && (
    echo API响应: 正常 ✓
) || (
    echo API响应: 异常 ✗
)
del temp_api_response.txt
echo.

echo =========================================
echo 健康检查完成
echo.
echo 如果所有项目都显示 ✓，服务器运行正常
echo 如果有 ✗，请运行完整诊断脚本
echo =========================================
echo.

pause
