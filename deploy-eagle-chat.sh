#!/bin/bash

# Eagle Chat 自动部署脚本
# 版本: 1.0.0
# 用途: 在服务器上自动创建和部署Eagle Chat系统

set -e

echo "🦅 Eagle Chat 自动部署脚本"
echo "================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}请使用root权限运行此脚本${NC}"
  echo "使用: sudo ./deploy-eagle-chat.sh"
  exit 1
fi

# 配置变量
PROJECT_DIR="/opt/eagle-chat"
DOMAIN="chat.eagleswaps.com"
MEET_DOMAIN="meet.eagleswaps.com"

echo -e "${GREEN}步骤 1/10: 检查系统要求${NC}"
# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "安装 Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# 检查MongoDB
if ! command -v mongod &> /dev/null; then
    echo "安装 MongoDB..."
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    apt-get update
    apt-get install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
fi

# 检查PM2
if ! command -v pm2 &> /dev/null; then
    echo "安装 PM2..."
    npm install -g pm2
fi

echo -e "${GREEN}步骤 2/10: 创建项目目录${NC}"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

echo -e "${GREEN}步骤 3/10: 创建服务器文件结构${NC}"
mkdir -p server/src/{config,models,routes,controllers,middleware,socket,utils}
mkdir -p server/uploads/{avatars,voices,images,files,videos}
mkdir -p server/logs
mkdir -p web/public
mkdir -p web/src/{components,pages,services,utils}
mkdir -p deploy

echo -e "${GREEN}步骤 4/10: 生成package.json${NC}"
cat > server/package.json << 'PACKAGE_EOF'
{
  "name": "eagle-chat-server",
  "version": "1.0.0",
  "description": "Eagle Wallet Chat Server",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.6.1",
    "mongoose": "^7.0.3",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "multer": "^1.4.5-lts.1",
    "helmet": "^7.0.0",
    "compression": "^1.7.4",
    "express-rate-limit": "^6.7.0",
    "express-validator": "^7.0.1",
    "ethers": "^6.4.0",
    "qrcode": "^1.5.3",
    "uuid": "^9.0.0",
    "moment": "^2.29.4",
    "winston": "^3.8.2",
    "node-cron": "^3.0.2"
  }
}
PACKAGE_EOF

echo -e "${GREEN}步骤 5/10: 生成环境变量文件${NC}"
cat > server/.env << ENV_EOF
NODE_ENV=production
PORT=4000
HOST=0.0.0.0

MONGODB_URI=mongodb://localhost:27017/eagle-chat

JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d

UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

JITSI_DOMAIN=$MEET_DOMAIN
JITSI_ROOM_PREFIX=eagle-

CORS_ORIGIN=*
CORS_CREDENTIALS=true

LOG_LEVEL=info
LOG_DIR=./logs

SOCKET_PING_TIMEOUT=60000
SOCKET_PING_INTERVAL=25000

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ENV_EOF

echo -e "${GREEN}步骤 6/10: 安装依赖${NC}"
cd server
npm install --production
cd ..

echo -e "${GREEN}步骤 7/10: 配置Nginx${NC}"
cat > /etc/nginx/sites-available/$DOMAIN << 'NGINX_EOF'
server {
    listen 80;
    server_name chat.eagleswaps.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name chat.eagleswaps.com;
    
    ssl_certificate /etc/letsencrypt/live/eagleswaps.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/eagleswaps.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    location /socket.io/ {
        proxy_pass http://localhost:4000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
    
    client_max_body_size 10M;
}
NGINX_EOF

ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

echo -e "${GREEN}步骤 8/10: 启动服务${NC}"
cd $PROJECT_DIR/server
pm2 start src/app.js --name eagle-chat-server
pm2 save
pm2 startup

echo -e "${GREEN}步骤 9/10: 配置防火墙${NC}"
ufw allow 4000/tcp
ufw allow 80/tcp
ufw allow 443/tcp

echo -e "${GREEN}步骤 10/10: 验证部署${NC}"
sleep 5
if pm2 list | grep -q "eagle-chat-server.*online"; then
    echo -e "${GREEN}✅ Eagle Chat 部署成功！${NC}"
    echo ""
    echo "📊 服务状态:"
    pm2 list
    echo ""
    echo "🌐 访问地址:"
    echo "  - API: https://$DOMAIN/health"
    echo "  - Web: https://$DOMAIN"
    echo ""
    echo "📝 日志查看:"
    echo "  pm2 logs eagle-chat-server"
    echo ""
    echo "🔧 管理命令:"
    echo "  pm2 restart eagle-chat-server  # 重启"
    echo "  pm2 stop eagle-chat-server     # 停止"
    echo "  pm2 delete eagle-chat-server   # 删除"
else
    echo -e "${RED}❌ 部署失败，请检查日志${NC}"
    pm2 logs eagle-chat-server --lines 50
    exit 1
fi

echo ""
echo -e "${YELLOW}⚠️  重要提示:${NC}"
echo "1. 请在Cloudflare添加DNS记录: $DOMAIN -> 服务器IP"
echo "2. 修改 $PROJECT_DIR/server/.env 配置文件"
echo "3. 重启服务: pm2 restart eagle-chat-server"
echo ""
echo "🎉 部署完成！"
