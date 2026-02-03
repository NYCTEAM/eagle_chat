#!/bin/bash

# Eagle Chat 服务器更新脚本
# 用于将本地代码推送到服务器并重启服务

set -e

echo "🚀 Eagle Chat Server Update Script"
echo "=================================="

# 配置（根据实际情况修改）
SERVER_USER="${SERVER_USER:-root}"
SERVER_HOST="${SERVER_HOST:-eagleswapweb}"
SERVER_PATH="/opt/eagle-chat"
WEB_ROOT="/www/wwwroot/chat.eagleswap.io"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Step 1: 提交本地更改到 Git${NC}"
git add .
git commit -m "Update: $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"
git push origin main || echo "Push failed or already up to date"

echo -e "${YELLOW}📤 Step 2: 推送代码到服务器${NC}"
ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
cd /opt/eagle-chat

# 拉取最新代码
echo "📥 Pulling latest code..."
git pull origin main

# 更新后端依赖
echo "📦 Installing backend dependencies..."
cd server
npm install --production

# 更新前端依赖并构建
echo "🔨 Building frontend..."
cd ../web
npm install
npm run build

# 复制前端文件到 web root
echo "📋 Copying frontend files..."
rm -rf /www/wwwroot/chat.eagleswap.io/*
cp -r dist/* /www/wwwroot/chat.eagleswap.io/
chown -R www:www /www/wwwroot/chat.eagleswap.io

# 重启后端服务
echo "🔄 Restarting backend service..."
cd /opt/eagle-chat/server
pm2 restart eagle-chat-server --update-env || pm2 start src/app.js --name eagle-chat-server -i 1
pm2 save

# 重新加载 Nginx
echo "🔄 Reloading Nginx..."
/www/server/nginx/sbin/nginx -t && /www/server/nginx/sbin/nginx -s reload

echo "✅ Server update completed!"

# 显示服务状态
echo ""
echo "📊 Service Status:"
pm2 status

echo ""
echo "📝 Recent logs:"
pm2 logs eagle-chat-server --lines 10 --nostream

ENDSSH

echo -e "${GREEN}✅ 更新完成！${NC}"
echo ""
echo "🌐 访问地址: https://chat.eagleswap.io"
echo "📊 查看日志: ssh ${SERVER_USER}@${SERVER_HOST} 'pm2 logs eagle-chat-server'"
echo ""
