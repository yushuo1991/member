#!/bin/bash

# SSH免密登录配置脚本
# 服务器: root@8.153.110.212

SERVER_USER="root"
SERVER_HOST="8.153.110.212"
PUBLIC_KEY_FILE="deploy_key.pub"

echo "================================================"
echo "SSH免密登录配置脚本"
echo "服务器: $SERVER_USER@$SERVER_HOST"
echo "================================================"
echo ""

# 检查公钥文件是否存在
if [ ! -f "$PUBLIC_KEY_FILE" ]; then
    echo "错误: 找不到公钥文件 $PUBLIC_KEY_FILE"
    exit 1
fi

echo "找到公钥文件: $PUBLIC_KEY_FILE"
PUBLIC_KEY=$(cat "$PUBLIC_KEY_FILE")
echo "公钥内容: $PUBLIC_KEY"
echo ""

echo "正在上传公钥到服务器..."
echo "注意: 请输入服务器密码"
echo ""

# 使用 ssh 连接到服务器并配置 authorized_keys
ssh "$SERVER_USER@$SERVER_HOST" << 'ENDSSH'
# 创建 .ssh 目录（如果不存在）
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# 检查 authorized_keys 文件
if [ ! -f ~/.ssh/authorized_keys ]; then
    touch ~/.ssh/authorized_keys
    chmod 600 ~/.ssh/authorized_keys
    echo "已创建 authorized_keys 文件"
else
    echo "authorized_keys 文件已存在"
fi

# 显示当前的 authorized_keys
echo ""
echo "当前 authorized_keys 内容:"
cat ~/.ssh/authorized_keys || echo "(空文件)"
echo ""
ENDSSH

# 将公钥追加到 authorized_keys
cat "$PUBLIC_KEY_FILE" | ssh "$SERVER_USER@$SERVER_HOST" "cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo '公钥已添加到 authorized_keys'"

echo ""
echo "================================================"
echo "配置完成！"
echo "================================================"
echo ""
echo "下一步: 测试免密登录"
echo "运行: ssh -i deploy_key root@8.153.110.212"
echo ""
