#!/bin/bash

#######################################
# Eagle Chat 一键SSH部署脚本
# 自动SSH登录、拉取代码、部署
#######################################

set -e

echo "=========================================="
echo "🦅 Eagle Chat 一键部署脚本"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 服务器配置
SERVER_IP="72.80.150.12"
SERVER_USER="root"
GITHUB_REPO="https://github.com/NYCTEAM/eagle_chat.git"
DEPLOY_DIR="/opt/eagle_chat"
LARGE_DISK="/mnt/7tb-disk"

echo -e "${BLUE}[配置信息]${NC}"
echo "  服务器: $SERVER_USER@$SERVER_IP"
echo "  GitHub仓库: $GITHUB_REPO"
echo "  部署目录: $DEPLOY_DIR"
echo "  大硬盘: $LARGE_DISK"
echo ""

# 检查SSH连接
echo -e "${YELLOW}[步骤 1/6]${NC} 检查SSH连接..."
if ssh -o ConnectTimeout=5 -o BatchMode=yes $SERVER_USER@$SERVER_IP exit 2>/dev/null; then
    echo -e "${GREEN}✓${NC} SSH连接正常"
else
    echo -e "${YELLOW}⚠${NC} 需要输入SSH密码"
fi
echo ""

# 执行远程部署
echo -e "${YELLOW}[步骤 2/6]${NC} 连接到服务器并开始部署..."
echo ""

ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

GITHUB_REPO="https://github.com/NYCTEAM/eagle_chat.git"
DEPLOY_DIR="/opt/eagle_chat"
LARGE_DISK="/mnt/7tb-disk"

echo "=========================================="
echo "🚀 开始远程部署"
echo "=========================================="
echo ""

# 步骤3: 检查并克隆/更新代码
echo -e "${YELLOW}[步骤 3/6]${NC} 检查代码仓库..."

if [ -d "$DEPLOY_DIR" ]; then
    echo -e "${BLUE}→${NC} 检测到现有项目，更新代码..."
    cd $DEPLOY_DIR
    
    # 保存当前更改（如果有）
    git stash save "Auto-stash before pull $(date)" 2>/dev/null || true
    
    # 拉取最新代码
    git pull origin main
    
    echo -e "${GREEN}✓${NC} 代码已更新到最新版本"
else
    echo -e "${BLUE}→${NC} 首次部署，克隆代码仓库..."
    cd /opt
    git clone $GITHUB_REPO
    cd $DEPLOY_DIR
    echo -e "${GREEN}✓${NC} 代码克隆完成"
fi
echo ""

# 步骤4: 检查大硬盘
echo -e "${YELLOW}[步骤 4/6]${NC} 检查大硬盘..."
if [ -d "$LARGE_DISK" ]; then
    DISK_USAGE=$(df -h $LARGE_DISK | awk 'NR==2 {print $5}' | sed 's/%//')
    DISK_AVAIL=$(df -h $LARGE_DISK | awk 'NR==2 {print $4}')
    echo -e "${GREEN}✓${NC} 大硬盘可用: $DISK_AVAIL (使用率: ${DISK_USAGE}%)"
else
    echo -e "${RED}✗${NC} 大硬盘 $LARGE_DISK 不存在"
    exit 1
fi
echo ""

# 步骤5: 运行部署脚本
echo -e "${YELLOW}[步骤 5/6]${NC} 执行部署脚本..."
if [ -f "deploy-to-large-disk.sh" ]; then
    chmod +x deploy-to-large-disk.sh
    echo -e "${BLUE}→${NC} 开始部署到大硬盘..."
    echo ""
    ./deploy-to-large-disk.sh
    echo ""
    echo -e "${GREEN}✓${NC} 部署脚本执行完成"
else
    echo -e "${RED}✗${NC} 部署脚本不存在"
    exit 1
fi
echo ""

# 步骤6: 验证部署
echo -e "${YELLOW}[步骤 6/6]${NC} 验证部署状态..."

# 检查PM2服务
if command -v pm2 &> /dev/null; then
    PM2_STATUS=$(pm2 list | grep -c "eagle-chat-server.*online" || echo "0")
    if [ "$PM2_STATUS" -gt 0 ]; then
        echo -e "${GREEN}✓${NC} 后端服务运行正常"
    else
        echo -e "${YELLOW}⚠${NC} 后端服务未运行"
    fi
else
    echo -e "${YELLOW}⚠${NC} PM2未安装"
fi

# 检查Web前端
if [ -f "$DEPLOY_DIR/web/dist/index.html" ]; then
    echo -e "${GREEN}✓${NC} Web前端构建成功"
else
    echo -e "${YELLOW}⚠${NC} Web前端未构建"
fi

# 检查Nginx
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓${NC} Nginx运行正常"
else
    echo -e "${YELLOW}⚠${NC} Nginx未运行"
fi

# 检查MongoDB
if systemctl is-active --quiet mongod; then
    echo -e "${GREEN}✓${NC} MongoDB运行正常"
else
    echo -e "${YELLOW}⚠${NC} MongoDB未运行"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ 部署完成！${NC}"
echo "=========================================="
echo ""
echo "📊 部署信息："
echo "  - 项目目录: $DEPLOY_DIR"
echo "  - MongoDB数据: $LARGE_DISK/mongodb/eagle-chat"
echo "  - 上传文件: $LARGE_DISK/eagle-chat-uploads"
echo "  - 备份目录: $LARGE_DISK/eagle-chat-backups"
echo "  - 日志目录: $LARGE_DISK/eagle-chat-logs"
echo ""
echo "🌐 访问地址："
echo "  - Web界面: https://chat.eagleswaps.com"
echo "  - API接口: https://chat.eagleswaps.com/api"
echo "  - 健康检查: https://chat.eagleswaps.com/health"
echo ""
echo "🔧 管理命令："
echo "  - 查看状态: pm2 status"
echo "  - 查看日志: pm2 logs eagle-chat-server"
echo "  - 重启服务: pm2 restart eagle-chat-server"
echo "  - 监控磁盘: cd $DEPLOY_DIR && ./monitor-disk.sh"
echo ""
echo "💾 备份命令："
echo "  - 手动备份: cd $DEPLOY_DIR && ./backup-database.sh"
echo "  - 设置自动备份: cd $DEPLOY_DIR && ./setup-auto-backup.sh"
echo ""

ENDSSH

# 本地完成提示
echo ""
echo "=========================================="
echo -e "${GREEN}🎉 一键部署完成！${NC}"
echo "=========================================="
echo ""
echo "✅ 已完成的操作："
echo "  1. SSH连接到服务器"
echo "  2. 拉取/更新GitHub代码"
echo "  3. 检查大硬盘状态"
echo "  4. 执行部署脚本"
echo "  5. 验证服务状态"
echo ""
echo "🌐 现在可以访问："
echo "  https://chat.eagleswaps.com"
echo ""
echo "📝 查看服务器日志："
echo "  ssh $SERVER_USER@$SERVER_IP 'pm2 logs eagle-chat-server'"
echo ""
echo "🔄 如需重新部署，再次运行此脚本即可"
echo ""
