#!/bin/bash

# Eagle Chat - Git 初始化和推送脚本
# 用途：初始化Git仓库并推送到GitHub

set -e

echo "🦅 Eagle Chat - Git 初始化脚本"
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# GitHub仓库信息
GITHUB_REPO="https://github.com/NYCTEAM/eagle_chat.git"

echo -e "${GREEN}步骤 1/6: 初始化Git仓库${NC}"
git init

echo -e "${GREEN}步骤 2/6: 创建.gitignore${NC}"
cat > .gitignore << 'GITIGNORE_EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.production

# Logs
logs/
*.log

# Uploads
uploads/
!uploads/.gitkeep

# Build
dist/
build/
.next/
out/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# PM2
.pm2/
pm2.log

# MongoDB
data/

# Temporary files
tmp/
temp/
*.tmp

# Coverage
coverage/
.nyc_output/

# Misc
.cache/
GITIGNORE_EOF

echo -e "${GREEN}步骤 3/6: 创建README.md${NC}"
# README.md已存在，跳过

echo -e "${GREEN}步骤 4/6: 添加所有文件${NC}"
git add .

echo -e "${GREEN}步骤 5/6: 提交${NC}"
git commit -m "Initial commit: Eagle Chat - Decentralized Wallet Chat System

Features:
- Wallet address login (MetaMask, WalletConnect)
- One-to-one chat
- Group chat with admin features
- Video conferencing (Jitsi Meet)
- QR code support
- Real-time messaging (Socket.IO)
- Web and Android support
- End-to-end encryption ready

Tech Stack:
- Backend: Node.js, Express, Socket.IO, MongoDB
- Frontend: React, ethers.js
- Mobile: Kotlin, Android
- Deployment: PM2, Nginx, Docker"

echo -e "${GREEN}步骤 6/6: 推送到GitHub${NC}"
git branch -M main
git remote add origin $GITHUB_REPO
git push -u origin main

echo ""
echo -e "${GREEN}✅ 成功推送到GitHub！${NC}"
echo ""
echo "🌐 仓库地址: $GITHUB_REPO"
echo ""
echo "📋 下一步:"
echo "  1. 访问 https://github.com/NYCTEAM/eagle_chat"
echo "  2. 在服务器上克隆: git clone $GITHUB_REPO"
echo "  3. 运行部署脚本: ./deploy-eagle-chat.sh"
echo ""
echo "🎉 完成！"
