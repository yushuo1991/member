#!/bin/bash
# GitHub 自动部署 - 快速设置脚本

echo "========================================="
echo "  宇硕会员系统 - GitHub Actions 部署设置"
echo "========================================="
echo ""

echo "✅ 已完成的步骤:"
echo "  1. ✅ 初始化 Git 仓库"
echo "  2. ✅ 生成 SSH 密钥对"
echo "  3. ✅ 配置服务器 authorized_keys"
echo "  4. ✅ 提交代码到本地 Git"
echo ""

echo "📋 接下来您需要完成以下步骤:"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "步骤 1/3: 创建 GitHub 仓库"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. 访问: https://github.com/new"
echo "2. Repository name: member-system (或您喜欢的名字)"
echo "3. Description: 宇硕会员管理系统"
echo "4. Visibility: Private (推荐)"
echo "5. 不要勾选 'Initialize with README'"
echo "6. 点击 'Create repository'"
echo ""
echo "按 Enter 继续..."
read

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "步骤 2/3: 配置 GitHub Secrets"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "在您的 GitHub 仓库页面:"
echo "Settings → Secrets and variables → Actions → New repository secret"
echo ""
echo "请添加以下 4 个 secrets:"
echo ""

echo "━━━ Secret 1: DEPLOY_HOST ━━━"
echo "Name: DEPLOY_HOST"
echo "Secret: 8.153.110.212"
echo ""

echo "━━━ Secret 2: DEPLOY_USER ━━━"
echo "Name: DEPLOY_USER"
echo "Secret: root"
echo ""

echo "━━━ Secret 3: DEPLOY_PATH ━━━"
echo "Name: DEPLOY_PATH"
echo "Secret: /www/wwwroot/member-system"
echo ""

echo "━━━ Secret 4: DEPLOY_SSH_KEY (重要!) ━━━"
echo "Name: DEPLOY_SSH_KEY"
echo "Secret: (复制下面的完整私钥)"
echo ""
echo "私钥内容:"
cat deploy_key
echo ""
echo "⚠️  确保复制包含 BEGIN 和 END 行!"
echo ""
echo "按 Enter 继续..."
read

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "步骤 3/3: 推送代码到 GitHub"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "请输入您的 GitHub 用户名:"
read github_username
echo ""
echo "请输入您的仓库名 (刚才创建的, 例如 member-system):"
read repo_name
echo ""

remote_url="https://github.com/${github_username}/${repo_name}.git"
echo "准备推送到: $remote_url"
echo ""

# 添加远程仓库
git remote add origin "$remote_url"

# 设置分支为 main
git branch -M main

echo "正在推送代码到 GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ 部署成功!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🎉 代码已推送! GitHub Actions 将自动开始部署"
    echo ""
    echo "查看部署进度:"
    echo "👉 https://github.com/${github_username}/${repo_name}/actions"
    echo ""
    echo "部署完成后访问:"
    echo "👉 http://8.153.110.212:3000/admin/login"
    echo ""
    echo "管理员登录信息:"
    echo "  用户名: admin"
    echo "  密码: 7287843Wu"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🚀 以后更新代码只需要:"
    echo "  git add ."
    echo "  git commit -m '您的修改说明'"
    echo "  git push"
    echo ""
    echo "GitHub Actions 会自动部署到服务器!"
    echo ""
else
    echo ""
    echo "❌ 推送失败,可能需要:"
    echo "1. 检查仓库 URL 是否正确"
    echo "2. 确认 GitHub 登录凭据"
    echo "3. 手动执行:"
    echo "   git remote add origin https://github.com/${github_username}/${repo_name}.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
fi
