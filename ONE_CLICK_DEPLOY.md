# 🚀 Eagle Chat 一键部署指南

## 📋 三种部署方式

### 方式1: 完整一键部署（推荐）

适合所有用户，包含详细的状态检查和验证。

#### Linux/Mac用户

```bash
# 1. 赋予执行权限
chmod +x one-click-deploy.sh

# 2. 运行部署脚本
./one-click-deploy.sh
```

#### Windows用户

```batch
# 双击运行或在命令行执行
one-click-deploy.bat
```

### 方式2: 快速部署

适合已配置SSH密钥的高级用户。

```bash
chmod +x quick-deploy.sh
./quick-deploy.sh
```

### 方式3: 手动部署

适合需要自定义配置的用户。

```bash
# 1. SSH登录服务器
ssh root@72.80.150.12

# 2. 克隆或更新代码
cd /opt
git clone https://github.com/NYCTEAM/eagle_chat.git
# 或更新: cd /opt/eagle_chat && git pull origin main

# 3. 运行部署脚本
cd /opt/eagle_chat
chmod +x deploy-to-large-disk.sh
./deploy-to-large-disk.sh
```

## 🔧 部署脚本功能对比

| 功能 | one-click-deploy.sh | quick-deploy.sh | 手动部署 |
|------|---------------------|-----------------|----------|
| SSH连接检查 | ✅ | ❌ | 手动 |
| 自动拉取代码 | ✅ | ✅ | 手动 |
| 磁盘空间检查 | ✅ | ❌ | 手动 |
| 自动部署 | ✅ | ✅ | 手动 |
| 服务验证 | ✅ | ❌ | 手动 |
| 详细日志 | ✅ | ❌ | 手动 |
| 适合新手 | ✅ | ❌ | ❌ |

## 📦 部署流程详解

### one-click-deploy.sh 执行步骤

```
[步骤 1/6] 检查SSH连接
    ↓
[步骤 2/6] 连接到服务器
    ↓
[步骤 3/6] 克隆/更新代码
    ├─ 首次部署: git clone
    └─ 已有代码: git pull
    ↓
[步骤 4/6] 检查大硬盘
    ├─ 检查 /mnt/7tb-disk 是否存在
    └─ 显示可用空间
    ↓
[步骤 5/6] 执行部署脚本
    ├─ 安装依赖
    ├─ 配置MongoDB
    ├─ 构建Web前端
    ├─ 配置PM2
    └─ 配置Nginx
    ↓
[步骤 6/6] 验证部署
    ├─ 检查PM2服务
    ├─ 检查Web前端
    ├─ 检查Nginx
    └─ 检查MongoDB
```

## 🔐 SSH配置

### 首次使用（需要密码）

第一次运行时，脚本会提示输入SSH密码：

```bash
./one-click-deploy.sh
# 输入服务器密码
```

### 配置SSH密钥（推荐）

配置后无需每次输入密码：

```bash
# 1. 生成SSH密钥（如果还没有）
ssh-keygen -t rsa -b 4096

# 2. 复制公钥到服务器
ssh-copy-id root@72.80.150.12

# 3. 测试连接
ssh root@72.80.150.12
```

配置完成后，可以使用快速部署脚本：

```bash
./quick-deploy.sh
```

## 📊 部署后的目录结构

```
服务器: 72.80.150.12

/opt/eagle_chat/                    # 项目目录
├── server/                         # 后端
│   ├── src/
│   ├── package.json
│   └── .env
├── web/                            # Web前端
│   ├── src/
│   ├── dist/                       # 构建输出
│   └── package.json
├── deploy-to-large-disk.sh         # 部署脚本
├── backup-database.sh              # 备份脚本
├── monitor-disk.sh                 # 监控脚本
└── ecosystem.config.js             # PM2配置

/mnt/7tb-disk/                      # 大硬盘
├── mongodb/eagle-chat/             # 数据库
├── eagle-chat-uploads/             # 上传文件
├── eagle-chat-backups/             # 备份
└── eagle-chat-logs/                # 日志
```

## 🌐 部署后访问

### Web界面
```
https://chat.eagleswaps.com
```

### API接口
```
https://chat.eagleswaps.com/api
```

### 健康检查
```
https://chat.eagleswaps.com/health
```

## 🔍 验证部署

### 方法1: 通过脚本输出

部署脚本会自动验证：

```
✓ 后端服务运行正常
✓ Web前端构建成功
✓ Nginx运行正常
✓ MongoDB运行正常
```

### 方法2: SSH登录检查

```bash
# 登录服务器
ssh root@72.80.150.12

# 查看PM2状态
pm2 status

# 查看日志
pm2 logs eagle-chat-server

# 检查Web文件
ls -lh /opt/eagle_chat/web/dist/

# 测试API
curl https://chat.eagleswaps.com/health
```

### 方法3: 浏览器访问

直接访问 https://chat.eagleswaps.com

## 🔄 更新部署

### 更新代码并重新部署

```bash
# 方式1: 使用一键部署脚本（推荐）
./one-click-deploy.sh

# 方式2: 使用快速部署脚本
./quick-deploy.sh

# 方式3: 手动更新
ssh root@72.80.150.12
cd /opt/eagle_chat
git pull origin main
./deploy-to-large-disk.sh
```

### 仅更新Web前端

```bash
ssh root@72.80.150.12 << 'EOF'
cd /opt/eagle_chat
git pull origin main
cd web
npm install
npm run build
systemctl reload nginx
EOF
```

### 仅更新后端

```bash
ssh root@72.80.150.12 << 'EOF'
cd /opt/eagle_chat
git pull origin main
cd server
npm install
pm2 restart eagle-chat-server
EOF
```

## 🛠️ 常用管理命令

### 通过SSH执行

```bash
# 查看服务状态
ssh root@72.80.150.12 "pm2 status"

# 查看日志（最近50行）
ssh root@72.80.150.12 "pm2 logs eagle-chat-server --lines 50"

# 重启服务
ssh root@72.80.150.12 "pm2 restart eagle-chat-server"

# 监控磁盘
ssh root@72.80.150.12 "cd /opt/eagle_chat && ./monitor-disk.sh"

# 手动备份
ssh root@72.80.150.12 "cd /opt/eagle_chat && ./backup-database.sh"
```

### 创建快捷命令（可选）

在本地 `~/.bashrc` 或 `~/.zshrc` 添加：

```bash
# Eagle Chat 管理命令
alias eagle-status='ssh root@72.80.150.12 "pm2 status"'
alias eagle-logs='ssh root@72.80.150.12 "pm2 logs eagle-chat-server"'
alias eagle-restart='ssh root@72.80.150.12 "pm2 restart eagle-chat-server"'
alias eagle-deploy='./one-click-deploy.sh'
alias eagle-ssh='ssh root@72.80.150.12'
```

使用：

```bash
source ~/.bashrc  # 或 source ~/.zshrc

eagle-status      # 查看状态
eagle-logs        # 查看日志
eagle-restart     # 重启服务
eagle-deploy      # 部署
eagle-ssh         # SSH登录
```

## 🐛 故障排查

### 问题1: SSH连接失败

```bash
# 检查网络连接
ping 72.80.150.12

# 检查SSH服务
ssh -v root@72.80.150.12

# 检查防火墙
# 确保22端口开放
```

### 问题2: Git拉取失败

```bash
# SSH登录服务器
ssh root@72.80.150.12

# 检查Git配置
cd /opt/eagle_chat
git remote -v
git status

# 重置并拉取
git reset --hard origin/main
git pull origin main
```

### 问题3: 部署脚本执行失败

```bash
# 查看详细错误
ssh root@72.80.150.12
cd /opt/eagle_chat
./deploy-to-large-disk.sh

# 检查日志
tail -f /mnt/7tb-disk/eagle-chat-logs/mongodb.log
pm2 logs eagle-chat-server
```

### 问题4: 服务无法启动

```bash
# 检查端口占用
ssh root@72.80.150.12 "netstat -tlnp | grep 4000"

# 检查PM2状态
ssh root@72.80.150.12 "pm2 status"

# 重启所有服务
ssh root@72.80.150.12 << 'EOF'
pm2 restart all
systemctl restart nginx
systemctl restart mongod
EOF
```

## 📝 部署日志

部署脚本会输出详细日志，包括：

- ✅ 成功的步骤（绿色）
- ⚠️ 警告信息（黄色）
- ❌ 错误信息（红色）
- ℹ️ 信息提示（蓝色）

保存日志：

```bash
./one-click-deploy.sh 2>&1 | tee deploy.log
```

## 🔒 安全建议

1. **使用SSH密钥** - 避免每次输入密码
2. **定期更新** - 保持系统和依赖最新
3. **备份数据** - 定期运行备份脚本
4. **监控日志** - 定期检查错误日志
5. **限制访问** - 配置防火墙规则

## 📞 获取帮助

### 查看脚本帮助

```bash
# 查看脚本内容
cat one-click-deploy.sh

# 查看部署脚本
cat deploy-to-large-disk.sh
```

### 联系支持

- GitHub Issues: https://github.com/NYCTEAM/eagle_chat/issues
- 查看文档: 项目根目录的 *.md 文件

## 🎉 快速开始

### 最简单的方式（3步）

```bash
# 1. 下载项目（本地）
git clone https://github.com/NYCTEAM/eagle_chat.git
cd eagle_chat

# 2. 运行一键部署
chmod +x one-click-deploy.sh
./one-click-deploy.sh

# 3. 访问应用
# 打开浏览器: https://chat.eagleswaps.com
```

就这么简单！🚀

---

**GitHub仓库**: https://github.com/NYCTEAM/eagle_chat
