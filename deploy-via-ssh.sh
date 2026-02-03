#!/bin/bash

#######################################
# Eagle Chat SSH部署脚本
# 本地执行，通过SSH部署到服务器
#######################################

SERVER="root@72.80.150.12"

echo "=========================================="
echo "🦅 Eagle Chat SSH部署"
echo "=========================================="
echo ""
echo "连接服务器: $SERVER"
echo ""

# 通过SSH执行远程命令（自动接受主机密钥）
ssh -o StrictHostKeyChecking=no $SERVER << 'EOF'
set -e

# 配置
GITHUB_REPO="https://github.com/NYCTEAM/eagle_chat.git"
DEPLOY_DIR="/opt/eagle_chat"
LARGE_DISK="/mnt/7tb-disk"

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo "🚀 开始远程部署"
echo "=========================================="
echo ""

# 步骤1: 更新代码
echo -e "${BLUE}[1/4]${NC} 检查/更新代码..."

if [ -d "$DEPLOY_DIR" ]; then
    echo "→ 更新现有代码..."
    cd $DEPLOY_DIR
    git stash save "Auto-stash $(date)" 2>/dev/null || true
    git pull origin main
    echo -e "${GREEN}✓${NC} 代码已更新"
else
    echo "→ 克隆代码仓库..."
    cd /opt
    git clone $GITHUB_REPO
    cd $DEPLOY_DIR
    echo -e "${GREEN}✓${NC} 代码克隆完成"
fi

echo ""

# 步骤2: 检查磁盘
echo -e "${BLUE}[2/4]${NC} 检查大硬盘..."

if [ -d "$LARGE_DISK" ]; then
    DISK_AVAIL=$(df -h $LARGE_DISK | awk 'NR==2 {print $4}')
    DISK_USAGE=$(df -h $LARGE_DISK | awk 'NR==2 {print $5}')
    echo -e "${GREEN}✓${NC} 大硬盘可用: $DISK_AVAIL (使用率: $DISK_USAGE)"
else
    echo "✗ 大硬盘不存在"
    exit 1
fi

echo ""

# 步骤3: 执行部署
echo -e "${BLUE}[3/4]${NC} 执行部署脚本..."

cd $DEPLOY_DIR
if [ -f "deploy-to-large-disk.sh" ]; then
    chmod +x deploy-to-large-disk.sh
    ./deploy-to-large-disk.sh
else
    echo "✗ 部署脚本不存在"
    exit 1
fi

echo ""

# 步骤4: 验证
echo -e "${BLUE}[4/4]${NC} 验证部署..."

pm2 list | grep -q "eagle-chat-server.*online" && echo -e "${GREEN}✓${NC} 后端服务运行中" || echo "⚠ 后端服务未运行"
[ -f "$DEPLOY_DIR/web/dist/index.html" ] && echo -e "${GREEN}✓${NC} Web前端已构建" || echo "⚠ Web前端未构建"
systemctl is-active --quiet nginx && echo -e "${GREEN}✓${NC} Nginx运行中" || echo "⚠ Nginx未运行"
systemctl is-active --quiet mongod && echo -e "${GREEN}✓${NC} MongoDB运行中" || echo "⚠ MongoDB未运行"

echo ""
echo "=========================================="
echo -e "${GREEN}✅ 部署完成！${NC}"
echo "=========================================="
echo ""
echo "📊 部署信息："
echo "  - 项目目录: $DEPLOY_DIR"
echo "  - MongoDB: $LARGE_DISK/mongodb/eagle-chat"
echo "  - 上传文件: $LARGE_DISK/eagle-chat-uploads"
echo "  - 备份目录: $LARGE_DISK/eagle-chat-backups"
echo ""
echo "🌐 访问地址："
echo "  - https://chat.eagleswaps.com"
echo ""
echo "🔧 管理命令："
echo "  - pm2 status"
echo "  - pm2 logs eagle-chat-server"
echo "  - pm2 restart eagle-chat-server"
echo ""

EOF

echo ""
echo "=========================================="
echo "🎉 部署完成！"
echo "=========================================="
echo ""
echo "现在可以访问: https://chat.eagleswaps.com"
echo ""
