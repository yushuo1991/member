#!/bin/bash

echo "========================================="
echo "GitHub Actions SSH密钥配置脚本"
echo "========================================="
echo ""

# 检查是否已存在密钥
if [ -f ~/.ssh/github_actions_deploy_key ]; then
    echo "⚠️  检测到已存在的GitHub Actions密钥"
    read -p "是否重新生成？这将覆盖现有密钥 (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "操作已取消"
        exit 0
    fi
    rm -f ~/.ssh/github_actions_deploy_key ~/.ssh/github_actions_deploy_key.pub
fi

echo "🔑 正在生成SSH密钥对..."
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy_key -N ""

echo ""
echo "✅ SSH密钥生成成功！"
echo ""

# 添加公钥到authorized_keys
cat ~/.ssh/github_actions_deploy_key.pub >> ~/.ssh/authorized_keys

# 设置正确的权限
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/github_actions_deploy_key
chmod 644 ~/.ssh/github_actions_deploy_key.pub

echo "✅ 公钥已添加到 authorized_keys"
echo "✅ 文件权限已设置"
echo ""

echo "========================================="
echo "📋 配置信息"
echo "========================================="
echo ""

echo "1️⃣ 服务器信息 (GitHub Secret: SERVER_HOST)"
echo "-------------------------------------------"
echo "8.153.110.212"
echo ""

echo "2️⃣ 用户名 (GitHub Secret: SERVER_USER)"
echo "-------------------------------------------"
echo "root"
echo ""

echo "3️⃣ SSH私钥 (GitHub Secret: SERVER_SSH_KEY)"
echo "-------------------------------------------"
echo "请复制以下完整内容（包括BEGIN和END行）："
echo ""
cat ~/.ssh/github_actions_deploy_key
echo ""

echo "========================================="
echo "🎯 下一步操作"
echo "========================================="
echo ""
echo "1. 复制上面的SSH私钥内容"
echo "2. 打开 https://github.com/yushuo1991/member/settings/secrets/actions"
echo "3. 点击 'New repository secret'"
echo "4. 添加以下3个Secrets:"
echo ""
echo "   Secret 1:"
echo "   Name: SERVER_HOST"
echo "   Value: 8.153.110.212"
echo ""
echo "   Secret 2:"
echo "   Name: SERVER_USER"
echo "   Value: root"
echo ""
echo "   Secret 3:"
echo "   Name: SERVER_SSH_KEY"
echo "   Value: [粘贴上面复制的私钥内容]"
echo ""
echo "5. 推送代码到GitHub，自动部署将开始工作！"
echo ""
echo "========================================="
echo "✅ 配置脚本执行完成！"
echo "========================================="
