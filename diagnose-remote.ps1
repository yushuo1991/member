# PowerShell脚本 - 服务器500错误诊断
$server = "8.153.110.212"
$username = "root"
$password = "ChangeMe2026!Secure"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "开始服务器500错误诊断" -ForegroundColor Cyan
Write-Host "服务器: $server" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# 创建诊断命令
$diagnosticCommands = @"
echo '========================================='
echo '服务器500错误紧急诊断报告'
echo '时间: `$(date "+%Y-%m-%d %H:%M:%S")'
echo '========================================='
echo ''

echo '1. PM2进程状态检查'
echo '-----------------------------------------'
pm2 list
echo ''

echo '2. PM2错误日志（最近100行）'
echo '-----------------------------------------'
pm2 logs member-system --err --lines 100 --nostream 2>&1 || echo '无法获取错误日志'
echo ''

echo '3. PM2标准输出日志（最近50行）'
echo '-----------------------------------------'
pm2 logs member-system --out --lines 50 --nostream 2>&1 || echo '无法获取标准输出'
echo ''

echo '4. .env文件检查'
echo '-----------------------------------------'
if [ -f /www/wwwroot/member-system/.env ]; then
    echo '✓ .env文件存在'
    echo '环境变量配置（隐藏敏感信息）：'
    cat /www/wwwroot/member-system/.env | sed 's/=.*/=***HIDDEN***/'
else
    echo '✗ .env文件不存在！'
fi
echo ''

echo '5. 端口3000占用情况'
echo '-----------------------------------------'
lsof -i :3000 2>&1 || echo '端口3000未被占用或无权限查看'
echo ''

echo '6. 关键文件检查'
echo '-----------------------------------------'
cd /www/wwwroot/member-system
echo '部署路径: '`$(pwd)
echo ''
echo '目录结构（前20项）:'
ls -la | head -20
echo ''
echo '检查关键文件:'
[ -f server.js ] && echo '✓ server.js 存在' || echo '✗ server.js 不存在'
[ -f .next/standalone/server.js ] && echo '✓ .next/standalone/server.js 存在' || echo '✗ .next/standalone/server.js 不存在'
[ -d .next ] && echo '✓ .next 目录存在' || echo '✗ .next 目录不存在'
[ -d node_modules ] && echo '✓ node_modules 目录存在' || echo '✗ node_modules 目录不存在'
[ -f package.json ] && echo '✓ package.json 存在' || echo '✗ package.json 不存在'
echo ''

echo '7. ecosystem.config.js检查'
echo '-----------------------------------------'
if [ -f ecosystem.config.js ]; then
    echo '✓ ecosystem.config.js 存在'
    cat ecosystem.config.js
else
    echo '✗ ecosystem.config.js 不存在'
fi
echo ''

echo '8. API端点测试（本地curl）'
echo '-----------------------------------------'
echo '测试首页:'
curl -s -o /dev/null -w 'HTTP Status: %{http_code}\n' http://localhost:3000/ 2>&1
echo ''
echo '测试 /api/auth/me:'
curl -s -o /dev/null -w 'HTTP Status: %{http_code}\n' http://localhost:3000/api/auth/me 2>&1
echo ''

echo '9. 获取实际错误响应'
echo '-----------------------------------------'
echo '首页响应（前500字符）:'
curl -s http://localhost:3000/ 2>&1 | head -c 500
echo ''
echo ''
echo '/api/auth/me 响应:'
curl -s http://localhost:3000/api/auth/me 2>&1
echo ''

echo '10. 尝试重启并捕获启动日志'
echo '-----------------------------------------'
pm2 restart member-system
sleep 3
pm2 logs member-system --lines 30 --nostream
echo ''

echo '========================================='
echo '诊断完成'
echo '========================================='
"@

# 使用plink执行（如果安装了PuTTY）
if (Get-Command plink -ErrorAction SilentlyContinue) {
    Write-Host "使用plink执行诊断..." -ForegroundColor Yellow
    $diagnosticCommands | plink -ssh -batch -pw $password "$username@$server" "bash"
}
else {
    Write-Host "plink未安装，尝试使用ssh..." -ForegroundColor Yellow

    # 将命令保存到临时文件
    $tempScript = Join-Path $env:TEMP "diagnose-temp.sh"
    $diagnosticCommands | Out-File -FilePath $tempScript -Encoding UTF8

    # 提示用户
    Write-Host ""
    Write-Host "请手动执行以下命令:" -ForegroundColor Green
    Write-Host "ssh root@$server" -ForegroundColor Yellow
    Write-Host "密码: $password" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "然后在服务器上执行以下命令:" -ForegroundColor Green
    Write-Host $diagnosticCommands -ForegroundColor Cyan
    Write-Host ""
    Write-Host "或者复制以下内容到服务器执行:" -ForegroundColor Green
    Write-Host "--------------------------------------------" -ForegroundColor Gray
    Write-Host $diagnosticCommands -ForegroundColor White
    Write-Host "--------------------------------------------" -ForegroundColor Gray
}
