#!/bin/bash
# 安全清理脚本 - 只删除明确的临时文件

echo "=== 安全清理项目冗余文件 ==="

# 删除临时日志文件
rm -f *.log
rm -f *-log.txt
rm -f api-test-report.txt
rm -f server-diagnosis-report.txt
rm -f test-report.json

# 删除临时cookies和测试文件
rm -f *_cookies.txt
rm -f tmp_*.txt
rm -f tmp_*.json
rm -f _tmp_*.txt
rm -f _tmp_*.json

# 删除部署脚本（保留重要的）
rm -f auto-deploy-monitor.sh
rm -f auto-fix-server.sh
rm -f check-server-status.sh
rm -f create-env-on-server.sh
rm -f deploy-direct.sh
rm -f deploy-manual.sh
rm -f deploy-monorepo-setup.sh
rm -f diagnose-and-fix.sh
rm -f diagnose-server-500.sh
rm -f diagnose-remote.ps1
rm -f fix-database-remote.sh
rm -f manual-fix-server.sh
rm -f redeploy-server.sh
rm -f setup-github.sh
rm -f test-*.sh
rm -f test-*.js
rm -f verify-members-fix.sh

# 删除临时备份目录
rm -rf temp_*_repo

# 删除SQL更新文件
rm -f update-admin-password.sql

# 删除打包文件
rm -f next-builds.tar.gz

# 删除Windows批处理文件
rm -f *.bat

# 删除多余的markdown文档（保留重要的README等）
rm -f API-FIX-REPORT.md
rm -f DIAGNOSIS_AND_FIX_REPORT.md
rm -f "会员列表500错误修复.md"
rm -f "修复完成总结.md"
rm -f "服务器500错误修复报告.md"
rm -f "服务器连接问题诊断.md"
rm -f "系统完成报告.md"
rm -f "部署测试报告.md"
rm -f "部署状态报告.md"
rm -f "明天操作指南.md"
rm -f "晚安报告-自动化部署中.md"
rm -f "1 - 宇硕情绪表格.md"

# 删除其他临时文件
rm -f index.html
rm -f remote_member_page.b64
rm -f remote_member_page.tsx
rm -f admin_cookies.txt

echo "✅ 清理完成"
echo ""
echo "保留的重要文件:"
echo "- README.md (如果存在)"
echo "- package.json"
echo "- pnpm-workspace.yaml"
echo "- turbo.json"
echo "- .env 文件"
echo "- apps/ 和 packages/ 目录"
echo "- .github/ workflow文件"
