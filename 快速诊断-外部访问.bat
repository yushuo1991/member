@echo off
REM 快速服务器诊断工具 - 使用curl测试外部访问

echo =========================================
echo 服务器500错误快速诊断
echo =========================================
echo.

echo [1] 测试服务器首页（外部访问）
echo -----------------------------------------
curl -v http://8.153.110.212/ 2>&1 | findstr /C:"HTTP" /C:"Server" /C:"error" /C:"500"
echo.

echo [2] 测试API端点 /api/auth/me（外部访问）
echo -----------------------------------------
curl -v http://8.153.110.212/api/auth/me 2>&1
echo.

echo [3] 测试登录页面（外部访问）
echo -----------------------------------------
curl -s -o nul -w "HTTP状态码: %%{http_code}\n" http://8.153.110.212/login
echo.

echo [4] 获取首页实际响应内容
echo -----------------------------------------
curl -s http://8.153.110.212/ > server-homepage-response.txt
echo 响应已保存到: server-homepage-response.txt
type server-homepage-response.txt | more
echo.

echo =========================================
echo 诊断完成
echo =========================================
echo.
echo 请查看上述输出，特别注意：
echo 1. HTTP状态码（应该是200，而不是500）
echo 2. 错误信息（如果有）
echo 3. Server响应头信息
echo.

pause
