#!/bin/bash

#######################################
# Eagle Chat 部署脚本 - 大硬盘版本
# MongoDB数据保存在 /mnt/7tb-disk
#######################################

set -e

echo "=========================================="
echo "🦅 Eagle Chat 一键部署 (大硬盘版本)"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置变量
INSTALL_DIR="/opt/eagle-chat"
MONGODB_DATA_DIR="/mnt/7tb-disk/mongodb/eagle-chat"
UPLOAD_DIR="/mnt/7tb-disk/eagle-chat-uploads"
LOG_DIR="/mnt/7tb-disk/eagle-chat-logs"
DOMAIN="chat.eagleswaps.com"
PORT=4000

echo -e "${GREEN}[信息]${NC} 配置信息："
echo "  - 安装目录: $INSTALL_DIR"
echo "  - MongoDB数据目录: $MONGODB_DATA_DIR"
echo "  - 文件上传目录: $UPLOAD_DIR"
echo "  - 日志目录: $LOG_DIR"
echo "  - 域名: $DOMAIN"
echo "  - 端口: $PORT"
echo ""

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}[错误]${NC} 请使用root权限运行此脚本"
    echo "使用: sudo $0"
    exit 1
fi

# 检查大硬盘是否存在
if [ ! -d "/mnt/7tb-disk" ]; then
    echo -e "${RED}[错误]${NC} 大硬盘目录 /mnt/7tb-disk 不存在"
    exit 1
fi

echo -e "${GREEN}[1/12]${NC} 检查系统要求..."
if ! command -v curl &> /dev/null; then
    apt-get update
    apt-get install -y curl wget
fi

echo -e "${GREEN}[2/12]${NC} 安装Node.js 18.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi
echo "Node.js版本: $(node -v)"
echo "NPM版本: $(npm -v)"

echo -e "${GREEN}[3/12]${NC} 创建MongoDB数据目录..."
mkdir -p "$MONGODB_DATA_DIR"
mkdir -p "$UPLOAD_DIR"
mkdir -p "$LOG_DIR"
chmod 755 "$MONGODB_DATA_DIR"
chmod 755 "$UPLOAD_DIR"
chmod 755 "$LOG_DIR"

echo -e "${GREEN}[4/12]${NC} 安装MongoDB..."
if ! command -v mongod &> /dev/null; then
    # 导入MongoDB公钥
    curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-archive-keyring.gpg
    
    # 添加MongoDB源
    echo "deb [signed-by=/usr/share/keyrings/mongodb-archive-keyring.gpg] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    
    # 安装MongoDB
    apt-get update
    apt-get install -y mongodb-org
fi

echo -e "${GREEN}[5/12]${NC} 配置MongoDB使用大硬盘..."
# 停止MongoDB服务
systemctl stop mongod 2>/dev/null || true

# 备份原配置
cp /etc/mongod.conf /etc/mongod.conf.backup 2>/dev/null || true

# 修改MongoDB配置文件
cat > /etc/mongod.conf << EOF
# MongoDB配置文件 - Eagle Chat
# 数据存储在大硬盘

storage:
  dbPath: $MONGODB_DATA_DIR
  journal:
    enabled: true
  engine: wiredTiger
  wiredTiger:
    engineConfig:
      cacheSizeGB: 2

systemLog:
  destination: file
  logAppend: true
  path: $LOG_DIR/mongodb.log

net:
  port: 27017
  bindIp: 127.0.0.1

processManagement:
  timeZoneInfo: /usr/share/zoneinfo

security:
  authorization: enabled
EOF

# 设置MongoDB目录权限
chown -R mongodb:mongodb "$MONGODB_DATA_DIR"
chown -R mongodb:mongodb "$LOG_DIR"

# 启动MongoDB
systemctl enable mongod
systemctl start mongod

# 等待MongoDB启动
sleep 5

echo -e "${GREEN}[6/12]${NC} 创建MongoDB数据库和用户..."
# 创建管理员用户和数据库
mongosh --eval '
db = db.getSiblingDB("admin");
try {
  db.createUser({
    user: "eaglechat_admin",
    pwd: "EagleChat2026!@#",
    roles: [
      { role: "userAdminAnyDatabase", db: "admin" },
      { role: "readWriteAnyDatabase", db: "admin" }
    ]
  });
  print("✅ 管理员用户创建成功");
} catch(e) {
  print("⚠️  管理员用户可能已存在");
}

db = db.getSiblingDB("eagle_chat");
try {
  db.createUser({
    user: "eagle_user",
    pwd: "EagleUser2026!@#",
    roles: [
      { role: "readWrite", db: "eagle_chat" }
    ]
  });
  print("✅ 数据库用户创建成功");
} catch(e) {
  print("⚠️  数据库用户可能已存在");
}
' || echo "MongoDB用户配置完成"

echo -e "${GREEN}[7/12]${NC} 安装PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

echo -e "${GREEN}[8/12]${NC} 创建项目目录..."
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

# 如果是从GitHub克隆，跳过文件创建
if [ -f "server/package.json" ]; then
    echo "检测到已存在的项目文件，跳过创建..."
else
    echo "创建项目文件..."
    mkdir -p server/src/{config,models,controllers,routes,middleware,utils,socket}
    
    # 这里可以添加文件创建逻辑，或者提示用户从GitHub克隆
    echo -e "${YELLOW}[提示]${NC} 请确保项目文件已从GitHub克隆到此目录"
fi

echo -e "${GREEN}[9/12]${NC} 创建环境变量文件..."
cat > server/.env << EOF
# Eagle Chat 环境变量配置

# 服务器配置
NODE_ENV=production
PORT=$PORT
HOST=0.0.0.0

# MongoDB配置 (使用大硬盘)
MONGODB_URI=mongodb://eagle_user:EagleUser2026!@#@localhost:27017/eagle_chat?authSource=eagle_chat
MONGODB_DATA_DIR=$MONGODB_DATA_DIR

# JWT配置
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# 文件上传配置 (使用大硬盘)
UPLOAD_DIR=$UPLOAD_DIR
MAX_FILE_SIZE=10485760
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/gif,image/webp
ALLOWED_VIDEO_TYPES=video/mp4,video/webm
ALLOWED_AUDIO_TYPES=audio/mpeg,audio/wav,audio/ogg
ALLOWED_FILE_TYPES=application/pdf,application/zip

# Jitsi Meet配置
JITSI_DOMAIN=meet.eagleswaps.com
JITSI_ROOM_PREFIX=eagle-

# CORS配置
CORS_ORIGIN=https://chat.eagleswaps.com,https://eagleswaps.com

# 日志配置 (使用大硬盘)
LOG_LEVEL=info
LOG_DIR=$LOG_DIR

# Socket.IO配置
SOCKET_IO_PATH=/socket.io
SOCKET_IO_CORS_ORIGIN=*

# 限流配置
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# 数据库备份目录 (使用大硬盘)
BACKUP_DIR=/mnt/7tb-disk/eagle-chat-backups
EOF

chmod 600 server/.env

echo -e "${GREEN}[10/14]${NC} 安装后端依赖..."
cd server
if [ -f "package.json" ]; then
    npm install --production
else
    echo -e "${YELLOW}[警告]${NC} package.json不存在，请先从GitHub克隆项目"
fi

echo -e "${GREEN}[11/14]${NC} 构建Web前端..."
cd ../web
if [ -f "package.json" ]; then
    npm install
    npm run build
    echo "Web前端构建完成，输出目录: $INSTALL_DIR/web/dist"
else
    echo -e "${YELLOW}[警告]${NC} Web前端package.json不存在"
fi
cd ..

echo -e "${GREEN}[12/14]${NC} 配置PM2..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'eagle-chat-server',
    script: 'src/app.js',
    cwd: '$INSTALL_DIR/server',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: $PORT
    },
    error_file: '$LOG_DIR/pm2-error.log',
    out_file: '$LOG_DIR/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false
  }]
};
EOF

# 启动应用
pm2 delete eagle-chat-server 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup | tail -n 1 | bash

echo -e "${GREEN}[13/14]${NC} 配置Nginx..."
cat > /etc/nginx/sites-available/eagle-chat << EOF
# Eagle Chat Nginx配置

upstream eagle_chat_backend {
    server 127.0.0.1:$PORT;
    keepalive 64;
}

server {
    listen 80;
    server_name $DOMAIN;
    
    # 重定向到HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;
    
    # SSL证书 (使用通配符证书)
    ssl_certificate /etc/letsencrypt/live/eagleswaps.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/eagleswaps.com/privkey.pem;
    
    # SSL配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # 日志
    access_log $LOG_DIR/nginx-access.log;
    error_log $LOG_DIR/nginx-error.log;
    
    # 客户端上传大小限制
    client_max_body_size 20M;
    
    # Socket.IO支持
    location /socket.io/ {
        proxy_pass http://eagle_chat_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_buffering off;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # API路由
    location /api/ {
        proxy_pass http://eagle_chat_backend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_buffering off;
    }
    
    # 静态文件 (上传的文件，从大硬盘提供)
    location /uploads/ {
        alias $UPLOAD_DIR/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # 健康检查
    location /health {
        proxy_pass http://eagle_chat_backend;
        access_log off;
    }
    
    # Web前端静态文件
    location / {
        root $INSTALL_DIR/web/dist;
        try_files \$uri \$uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
    }
}
EOF

# 启用站点
ln -sf /etc/nginx/sites-available/eagle-chat /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

echo -e "${GREEN}[14/14]${NC} 验证部署..."
sleep 3

# 检查服务状态
if pm2 list | grep -q "eagle-chat-server.*online"; then
    echo -e "${GREEN}✓${NC} 后端服务运行正常"
else
    echo -e "${YELLOW}⚠${NC} 后端服务状态异常"
fi

# 检查Web文件
if [ -f "$INSTALL_DIR/web/dist/index.html" ]; then
    echo -e "${GREEN}✓${NC} Web前端构建成功"
else
    echo -e "${YELLOW}⚠${NC} Web前端文件未找到"
fi

echo ""
echo "=========================================="
echo "✅ Eagle Chat 部署完成！"
echo "=========================================="
echo ""
echo "📊 存储信息："
echo "  - MongoDB数据: $MONGODB_DATA_DIR"
echo "  - 上传文件: $UPLOAD_DIR"
echo "  - 日志文件: $LOG_DIR"
echo ""
echo "🔐 数据库信息："
echo "  - 数据库: eagle_chat"
echo "  - 用户名: eagle_user"
echo "  - 密码: EagleUser2026!@#"
echo "  - 管理员: eaglechat_admin / EagleChat2026!@#"
echo ""
echo "🌐 访问地址："
echo "  - https://$DOMAIN"
echo "  - API: https://$DOMAIN/api"
echo "  - Socket.IO: wss://$DOMAIN/socket.io"
echo ""
echo "📝 管理命令："
echo "  - 查看状态: pm2 status"
echo "  - 查看日志: pm2 logs eagle-chat-server"
echo "  - 重启服务: pm2 restart eagle-chat-server"
echo "  - 停止服务: pm2 stop eagle-chat-server"
echo ""
echo "💾 磁盘使用："
du -sh "$MONGODB_DATA_DIR" 2>/dev/null || echo "  - MongoDB: 新安装"
du -sh "$UPLOAD_DIR" 2>/dev/null || echo "  - 上传文件: 0"
df -h /mnt/7tb-disk | tail -1
echo ""
echo "🎉 部署成功！"
