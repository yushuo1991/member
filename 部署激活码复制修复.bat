@echo off
chcp 65001 >nul
echo ========================================
echo 激活码复制功能修复 - 部署脚本
echo ========================================
echo.

cd /d "%~dp0member-system"

echo [1/5] 检查 Git 状态...
git status
echo.

echo [2/5] 添加所有更改...
git add .
echo.

echo [3/5] 创建提交...
git commit -m "fix: 修复激活码管理页面复制按钮功能

- 添加 Toast 通知组件（支持 success/error/info/warning 类型）
- 实现剪贴板复制工具（支持 Clipboard API 和 execCommand 降级）
- 更新激活码管理页面集成复制功能
- 添加复制成功/失败 Toast 提示
- 支持 HTTPS 和 HTTP 环境自动适配
- 添加 Toast 滑入动画效果

技术改进：
- 创建通用 Toast 组件（Toast.tsx）
- 创建剪贴板工具函数（clipboard-utils.ts）
- 优先使用 navigator.clipboard API
- HTTP 环境自动降级到 document.execCommand
- 完整的错误处理和用户反馈
- 支持多 Toast 堆叠显示

测试地址：http://yushuofupan.com/admin/codes

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
echo.

echo [4/5] 推送到 GitHub（将自动触发部署）...
echo 即将推送，按任意键继续或 Ctrl+C 取消...
pause >nul
git push origin main
echo.

echo [5/5] 部署完成！
echo.
echo ========================================
echo 下一步操作：
echo ========================================
echo 1. 等待 GitHub Actions 完成部署（约 2-3 分钟）
echo 2. 访问：http://yushuofupan.com/admin/codes
echo 3. 测试复制按钮功能
echo 4. 观察 Toast 提示是否正常
echo.
echo 详细测试指南：member-system\ACTIVATION-CODE-COPY-FIX.md
echo ========================================
echo.
pause
