# 从Windows上传脚本到服务器
# 使用方法: 在PowerShell中运行此脚本
# .\upload-scripts.ps1

# 配置服务器信息
$SERVER_IP = Read-Host "请输入服务器IP或域名 (例如: yushuofupan.com)"
$SERVER_USER = Read-Host "请输入SSH用户名 (默认: root)"
if ([string]::IsNullOrWhiteSpace($SERVER_USER)) {
    $SERVER_USER = "root"
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "上传修复脚本到服务器" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 要上传的文件列表
$files = @(
    "server-diagnose.sh",
    "server-fix.sh",
    "server-quick-restart.sh",
    "one-line-fix.sh"
)

# 检查文件是否存在
Write-Host "[1/3] 检查本地文件..." -ForegroundColor Yellow
$allFilesExist = $true
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file 不存在" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "错误: 部分文件不存在，请确保在项目根目录运行此脚本" -ForegroundColor Red
    exit 1
}

# 上传文件
Write-Host ""
Write-Host "[2/3] 上传文件到服务器..." -ForegroundColor Yellow

foreach ($file in $files) {
    Write-Host "  上传 $file..." -ForegroundColor Gray
    scp $file "${SERVER_USER}@${SERVER_IP}:/tmp/"

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ $file 上传成功" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file 上传失败" -ForegroundColor Red
    }
}

# 设置执行权限
Write-Host ""
Write-Host "[3/3] 设置执行权限..." -ForegroundColor Yellow

$chmodCommand = "chmod +x /tmp/server-diagnose.sh /tmp/server-fix.sh /tmp/server-quick-restart.sh /tmp/one-line-fix.sh"
ssh "${SERVER_USER}@${SERVER_IP}" $chmodCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ 权限设置成功" -ForegroundColor Green
} else {
    Write-Host "  ✗ 权限设置失败" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "上传完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步操作:" -ForegroundColor Yellow
Write-Host "1. SSH登录服务器: ssh ${SERVER_USER}@${SERVER_IP}" -ForegroundColor White
Write-Host "2. 运行修复脚本: bash /tmp/server-fix.sh" -ForegroundColor White
Write-Host ""
Write-Host "或者直接运行:" -ForegroundColor Yellow
Write-Host "  ssh ${SERVER_USER}@${SERVER_IP} 'bash /tmp/server-fix.sh'" -ForegroundColor White
Write-Host ""

# 询问是否立即运行修复
$runNow = Read-Host "是否立即运行修复脚本? (y/n)"
if ($runNow -eq "y" -or $runNow -eq "Y") {
    Write-Host ""
    Write-Host "正在运行修复脚本..." -ForegroundColor Yellow
    ssh "${SERVER_USER}@${SERVER_IP}" "bash /tmp/server-fix.sh"
}
