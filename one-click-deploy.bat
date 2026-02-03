@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ==========================================
echo Eagle Chat 一键部署脚本 (Windows)
echo ==========================================
echo.

REM 服务器配置
set SERVER_IP=72.80.150.12
set SERVER_USER=root
set GITHUB_REPO=https://github.com/NYCTEAM/eagle_chat.git
set DEPLOY_DIR=/opt/eagle_chat

echo [配置信息]
echo   服务器: %SERVER_USER%@%SERVER_IP%
echo   GitHub仓库: %GITHUB_REPO%
echo   部署目录: %DEPLOY_DIR%
echo.

REM 检查SSH客户端
where ssh >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到SSH客户端
    echo 请确保已安装OpenSSH或使用Git Bash运行 one-click-deploy.sh
    pause
    exit /b 1
)

echo [步骤 1/2] 连接到服务器...
echo.

REM 创建临时部署脚本
set TEMP_SCRIPT=%TEMP%\eagle_deploy_%RANDOM%.sh
(
echo #!/bin/bash
echo set -e
echo.
echo # 颜色定义
echo RED='\033[0;31m'
echo GREEN='\033[0;32m'
echo YELLOW='\033[1;33m'
echo BLUE='\033[0;34m'
echo NC='\033[0m'
echo.
echo GITHUB_REPO="%GITHUB_REPO%"
echo DEPLOY_DIR="%DEPLOY_DIR%"
echo LARGE_DISK="/mnt/7tb-disk"
echo.
echo echo "=========================================="
echo echo "开始远程部署"
echo echo "=========================================="
echo echo ""
echo.
echo # 检查并克隆/更新代码
echo echo "[步骤 2/5] 检查代码仓库..."
echo if [ -d "$DEPLOY_DIR" ]; then
echo     echo "检测到现有项目，更新代码..."
echo     cd $DEPLOY_DIR
echo     git stash save "Auto-stash before pull $(date)" 2^>^/dev/null ^|^| true
echo     git pull origin main
echo     echo "代码已更新"
echo else
echo     echo "首次部署，克隆代码..."
echo     cd /opt
echo     git clone $GITHUB_REPO
echo     cd $DEPLOY_DIR
echo     echo "代码克隆完成"
echo fi
echo echo ""
echo.
echo # 检查大硬盘
echo echo "[步骤 3/5] 检查大硬盘..."
echo if [ -d "$LARGE_DISK" ]; then
echo     DISK_AVAIL=$(df -h $LARGE_DISK ^| awk 'NR==2 {print $4}'^)
echo     echo "大硬盘可用: $DISK_AVAIL"
echo else
echo     echo "错误: 大硬盘不存在"
echo     exit 1
echo fi
echo echo ""
echo.
echo # 运行部署脚本
echo echo "[步骤 4/5] 执行部署脚本..."
echo if [ -f "deploy-to-large-disk.sh" ]; then
echo     chmod +x deploy-to-large-disk.sh
echo     ./deploy-to-large-disk.sh
echo     echo "部署完成"
echo else
echo     echo "错误: 部署脚本不存在"
echo     exit 1
echo fi
echo echo ""
echo.
echo # 验证部署
echo echo "[步骤 5/5] 验证部署..."
echo pm2 list ^| grep -q "eagle-chat-server.*online" ^&^& echo "后端服务: 运行中" ^|^| echo "后端服务: 未运行"
echo [ -f "$DEPLOY_DIR/web/dist/index.html" ] ^&^& echo "Web前端: 已构建" ^|^| echo "Web前端: 未构建"
echo systemctl is-active --quiet nginx ^&^& echo "Nginx: 运行中" ^|^| echo "Nginx: 未运行"
echo systemctl is-active --quiet mongod ^&^& echo "MongoDB: 运行中" ^|^| echo "MongoDB: 未运行"
echo echo ""
echo.
echo echo "=========================================="
echo echo "部署完成！"
echo echo "=========================================="
echo echo ""
echo echo "访问地址: https://chat.eagleswaps.com"
echo echo ""
) > "%TEMP_SCRIPT%"

REM 执行SSH部署
echo 正在连接服务器并部署...
echo.
ssh %SERVER_USER%@%SERVER_IP% "bash -s" < "%TEMP_SCRIPT%"

REM 清理临时文件
del "%TEMP_SCRIPT%" >nul 2>&1

echo.
echo ==========================================
echo 一键部署完成！
echo ==========================================
echo.
echo 现在可以访问: https://chat.eagleswaps.com
echo.
echo 查看日志: ssh %SERVER_USER%@%SERVER_IP% "pm2 logs eagle-chat-server"
echo.
pause
