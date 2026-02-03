#!/bin/bash

#######################################
# Eagle Chat 远程部署脚本
# 已登录SSH后直接执行
#######################################

set -e

echo "=========================================="
echo "🦅 Eagle Chat 远程部署"
echo "=========================================="
echo ""

# 配置
GITHUB_REPO="https://github.com/NYCTEAM/eagle_chat.git"
DEPLOY_DIR="/opt/eagle_chat"
LARGE_DISK="/mnt/7tb-disk"

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}[步骤 1/4]${NC} 检查/更新代码..."

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
echo -e "${BLUE}[步骤 2/4]${NC} 检查大硬盘..."

if [ -d "$LARGE_DISK" ]; then
    DISK_AVAIL=$(df -h $LARGE_DISK | awk 'NR==2 {print $4}')
    DISK_USAGE=$(df -h $LARGE_DISK | awk 'NR==2 {print $5}')
    echo -e "${GREEN}✓${NC} 大硬盘可用: $DISK_AVAIL (使用率: $DISK_USAGE)"
else
    echo "✗ 大硬盘不存在"
    exit 1
fi

echo ""
echo -e "${BLUE}[步骤 3/4]${NC} 执行部署..."

if [ -f "$DEPLOY_DIR/deploy-to-large-disk.sh" ]; then
    cd $DEPLOY_DIR
    chmod +x deploy-to-large-disk.sh
    ./deploy-to-large-disk.sh
else
    echo "✗ 部署脚本不存在"
    exit 1
fi

echo ""
echo -e "${BLUE}[步骤 4/4]${NC} 验证部署..."

# 检查服务
pm2 list | grep -q "eagle-chat-server.*online" && echo -e "${GREEN}✓${NC} 后端服务运行中" || echo "⚠ 后端服务未运行"
[ -f "$DEPLOY_DIR/web/dist/index.html" ] && echo -e "${GREEN}✓${NC} Web前端已构建" || echo "⚠ Web前端未构建"
systemctl is-active --quiet nginx && echo -e "${GREEN}✓${NC} Nginx运行中" || echo "⚠ Nginx未运行"
systemctl is-active --quiet mongod && echo -e "${GREEN}✓${NC} MongoDB运行中" || echo "⚠ MongoDB未运行"

echo ""
echo "=========================================="
echo -e "${GREEN}✅ 部署完成！${NC}"
echo "=========================================="
echo ""
echo "🌐 访问地址: https://chat.eagleswaps.com"
echo "📊 查看状态: pm2 status"
echo "📝 查看日志: pm2 logs eagle-chat-server"
echo "💾 手动备份: ./backup-database.sh"
echo "📈 监控磁盘: ./monitor-disk.sh"
echo ""
