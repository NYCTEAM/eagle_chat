#!/bin/bash

#######################################
# Eagle Chat 快速部署脚本
# 适合已配置SSH密钥的用户
#######################################

SERVER="root@72.80.150.12"
REPO="https://github.com/NYCTEAM/eagle_chat.git"
DIR="/opt/eagle_chat"

echo "🦅 Eagle Chat 快速部署"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 一键执行所有命令
ssh $SERVER << EOF
set -e

# 更新代码
if [ -d "$DIR" ]; then
    echo "📥 更新代码..."
    cd $DIR && git pull origin main
else
    echo "📥 克隆代码..."
    cd /opt && git clone $REPO
fi

# 执行部署
echo "🚀 开始部署..."
cd $DIR
chmod +x deploy-to-large-disk.sh
./deploy-to-large-disk.sh

# 显示状态
echo ""
echo "✅ 部署完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 访问: https://chat.eagleswaps.com"
echo "📊 状态: pm2 status"
echo "📝 日志: pm2 logs eagle-chat-server"
EOF

echo ""
echo "🎉 完成！"
