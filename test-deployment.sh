#!/bin/bash

# Eagle Chat 部署测试脚本
# 用于验证部署是否成功

set -e

SERVER_USER="${SERVER_USER:-root}"
SERVER_HOST="${SERVER_HOST:-eagleswapweb}"

echo "🧪 Eagle Chat Deployment Test"
echo "=============================="
echo ""

echo "📡 Testing server connection..."
ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'

echo ""
echo "1️⃣ Checking backend service..."
pm2 status | grep eagle-chat-server || echo "❌ Backend service not found"

echo ""
echo "2️⃣ Testing backend API..."
HEALTH_CHECK=$(curl -s http://localhost:4000/health)
if echo "$HEALTH_CHECK" | grep -q "ok"; then
    echo "✅ Backend API is responding"
    echo "$HEALTH_CHECK"
else
    echo "❌ Backend API not responding"
fi

echo ""
echo "3️⃣ Checking MongoDB connection..."
pm2 logs eagle-chat-server --lines 10 --nostream | grep "MongoDB connected" && echo "✅ MongoDB connected" || echo "⚠️  Check MongoDB connection"

echo ""
echo "4️⃣ Checking frontend files..."
if [ -f "/www/wwwroot/chat.eagleswap.io/index.html" ]; then
    echo "✅ Frontend files exist"
    ls -lh /www/wwwroot/chat.eagleswap.io/ | head -10
else
    echo "❌ Frontend files not found"
fi

echo ""
echo "5️⃣ Checking Nginx configuration..."
/www/server/nginx/sbin/nginx -t 2>&1 | grep "successful" && echo "✅ Nginx config is valid" || echo "❌ Nginx config has errors"

echo ""
echo "6️⃣ Testing Socket.IO port..."
netstat -tulpn | grep :4000 && echo "✅ Port 4000 is listening" || echo "❌ Port 4000 not listening"

echo ""
echo "7️⃣ Checking file permissions..."
ls -la /www/wwwroot/chat.eagleswap.io/ | head -5

echo ""
echo "8️⃣ Recent backend logs..."
pm2 logs eagle-chat-server --lines 5 --nostream

echo ""
echo "=============================="
echo "✅ Test completed!"
echo ""
echo "🌐 Access your app at: https://chat.eagleswap.io"
echo "📊 View logs: pm2 logs eagle-chat-server"
echo ""

ENDSSH

echo ""
echo "🎉 Remote tests completed!"
