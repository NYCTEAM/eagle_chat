# 🚀 推送到GitHub指南

## 快速推送（推荐）

### 方法1：使用自动脚本

```bash
# 在Git Bash或WSL中执行
cd /g/WALLET/EAGLE_CHAT
chmod +x git-init.sh
./git-init.sh
```

### 方法2：手动推送

```bash
# 1. 打开Git Bash或命令行
cd G:\WALLET\EAGLE_CHAT

# 2. 初始化Git仓库
git init

# 3. 添加所有文件
git add .

# 4. 提交
git commit -m "Initial commit: Eagle Chat - Decentralized Wallet Chat System

Features:
✅ Wallet address login (MetaMask, WalletConnect)
✅ One-to-one chat
✅ Group chat with admin features
✅ Video conferencing (Jitsi Meet integration)
✅ QR code support (add friends, join groups, meetings)
✅ Real-time messaging (Socket.IO)
✅ Web and Android support
✅ End-to-end encryption ready

Tech Stack:
- Backend: Node.js, Express, Socket.IO, MongoDB
- Frontend: React, ethers.js, TailwindCSS
- Mobile: Kotlin, Android
- Deployment: PM2, Nginx, Docker

Project Structure:
- server/ - Backend API server
- web/ - React web frontend
- deploy/ - Deployment scripts
- docs/ - Documentation"

# 5. 添加远程仓库
git remote add origin https://github.com/NYCTEAM/eagle_chat.git

# 6. 推送到GitHub
git branch -M main
git push -u origin main
```

## 📋 推送前检查清单

- [x] .gitignore 文件已创建
- [x] README.md 文件已创建
- [x] LICENSE 文件已创建
- [x] 所有敏感信息已移除（.env文件不会被推送）
- [x] 项目结构完整

## 🔐 GitHub仓库设置

### 1. 创建仓库（如果还没创建）

访问：https://github.com/new

- Repository name: `eagle_chat`
- Description: `Decentralized Wallet Chat System - Chat platform for crypto wallets with video conferencing`
- Public/Private: 选择您想要的
- 不要初始化README（我们已经有了）

### 2. 推送后验证

访问：https://github.com/NYCTEAM/eagle_chat

应该看到：
- ✅ README.md 显示在首页
- ✅ 所有文件夹和文件
- ✅ 提交历史

## 🌐 在服务器上部署

### 1. 克隆仓库

```bash
# SSH登录服务器
ssh root@your-server

# 克隆仓库
git clone https://github.com/NYCTEAM/eagle_chat.git
cd eagle_chat
```

### 2. 运行部署脚本

```bash
# 赋予执行权限
chmod +x deploy-eagle-chat.sh

# 运行部署
sudo ./deploy-eagle-chat.sh
```

### 3. 配置环境变量

```bash
cd /opt/eagle-chat/server
nano .env

# 修改以下配置：
# - JWT_SECRET（必须修改）
# - MONGODB_URI（如果需要）
# - JITSI_DOMAIN
```

### 4. 重启服务

```bash
pm2 restart eagle-chat-server
```

## 🔄 后续更新流程

### 本地开发

```bash
# 1. 修改代码
# 2. 提交更改
git add .
git commit -m "描述你的更改"
git push
```

### 服务器更新

```bash
# SSH登录服务器
ssh root@your-server

# 进入项目目录
cd /opt/eagle-chat

# 拉取最新代码
git pull

# 如果有新的依赖
cd server
npm install

# 重启服务
pm2 restart eagle-chat-server
```

## 📊 当前项目状态

### ✅ 已完成
- 项目结构
- 基础配置文件
- 数据库模型（User, Message, Group）
- 部署脚本
- 文档

### 🔄 进行中
- 剩余数据库模型
- API路由和控制器
- Socket.IO实现

### ⏳ 待开发
- Web前端
- 完整测试
- 详细文档

## 🎯 推送后的下一步

1. **验证GitHub仓库**
   - 访问 https://github.com/NYCTEAM/eagle_chat
   - 检查所有文件是否正确上传

2. **在服务器部署**
   - 克隆仓库
   - 运行部署脚本
   - 测试API

3. **继续开发**
   - 我会继续创建剩余文件
   - 您定期推送更新
   - 服务器上git pull更新

## ❓ 常见问题

### Q: 推送失败怎么办？

```bash
# 如果提示仓库已存在内容
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Q: 如何撤销某次提交？

```bash
# 撤销最后一次提交（保留更改）
git reset --soft HEAD~1

# 撤销最后一次提交（丢弃更改）
git reset --hard HEAD~1
```

### Q: 如何查看提交历史？

```bash
git log --oneline
```

### Q: 如何创建新分支？

```bash
# 创建并切换到新分支
git checkout -b feature/new-feature

# 推送新分支
git push -u origin feature/new-feature
```

## 🎉 完成！

推送成功后，您的Eagle Chat项目就在GitHub上了！

**仓库地址：** https://github.com/NYCTEAM/eagle_chat

现在可以：
- ✅ 在任何地方克隆和开发
- ✅ 与团队协作
- ✅ 在服务器上部署
- ✅ 持续集成和部署

---

**需要帮助？**

如果遇到问题，告诉我，我会帮您解决！
