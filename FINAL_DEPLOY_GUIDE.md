# 🚀 Eagle Chat 完整部署指南

## ✅ 已完成的工作

### 📦 项目文件（已推送到GitHub）

1. **后端服务器** (Node.js + Express + Socket.IO)
   - ✅ 5个数据库模型
   - ✅ 认证系统（钱包签名验证）
   - ✅ 消息系统
   - ✅ Socket.IO实时通信
   - ✅ 文件上传
   - ✅ 完整的中间件和工具

2. **Web前端** (React + Vite + Tailwind CSS)
   - ✅ MetaMask钱包登录
   - ✅ 响应式UI设计
   - ✅ Socket.IO客户端
   - ✅ 状态管理（Zustand）
   - ✅ API服务封装

3. **部署脚本**
   - ✅ 大硬盘部署脚本（包含Web构建）
   - ✅ 数据库备份脚本
   - ✅ 自动备份设置
   - ✅ 磁盘监控脚本

4. **文档**
   - ✅ 部署指南
   - ✅ Web部署说明
   - ✅ 快速开始指南

## 🌐 部署架构

```
服务器: 72.80.150.12
域名: chat.eagleswaps.com

┌─────────────────────────────────────────┐
│         Nginx (443端口)                  │
│  SSL证书: eagleswaps.com                │
└─────────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌──────────────┐    ┌──────────────┐
│  Web前端      │    │  后端API      │
│  (静态文件)   │    │  (4000端口)   │
│  /web/dist/  │    │  Socket.IO   │
└──────────────┘    └──────────────┘
                           │
                           ▼
                  ┌──────────────┐
                  │   MongoDB     │
                  │ /mnt/7tb-disk │
                  └──────────────┘
```

## 🚀 一键部署命令

### 在服务器上执行

```bash
# 1. SSH登录服务器
ssh root@72.80.150.12

# 2. 克隆项目
cd /opt
git clone https://github.com/NYCTEAM/eagle_chat.git
cd eagle_chat

# 3. 运行部署脚本（自动部署后端+Web前端）
chmod +x deploy-to-large-disk.sh
sudo ./deploy-to-large-disk.sh

# 等待10-15分钟完成部署...
```

### 部署脚本会自动完成：

1. ✅ 安装Node.js 18.x
2. ✅ 安装MongoDB 6.0
3. ✅ 配置MongoDB使用大硬盘 `/mnt/7tb-disk`
4. ✅ 创建数据库和用户
5. ✅ 安装PM2进程管理器
6. ✅ 创建项目目录和环境变量
7. ✅ 安装后端依赖
8. ✅ **构建Web前端**
9. ✅ 配置PM2启动后端
10. ✅ 配置Nginx（API + Web前端）
11. ✅ 启动所有服务
12. ✅ 验证部署

## 📁 部署后的目录结构

```
/opt/eagle_chat/
├── server/                    # 后端
│   ├── src/
│   ├── package.json
│   └── .env                   # 环境变量
│
├── web/                       # Web前端
│   ├── src/
│   ├── dist/                  # 构建输出 ⭐
│   │   ├── index.html
│   │   └── assets/
│   ├── package.json
│   └── vite.config.js
│
└── ecosystem.config.js        # PM2配置

/mnt/7tb-disk/                 # 大硬盘
├── mongodb/eagle-chat/        # 数据库
├── eagle-chat-uploads/        # 上传文件
├── eagle-chat-backups/        # 备份
└── eagle-chat-logs/           # 日志
```

## 🌐 访问地址

部署完成后：

### 用户访问
- **Web界面**: https://chat.eagleswaps.com
  - 登录页面（MetaMask）
  - 聊天界面

### API接口
- **API**: https://chat.eagleswaps.com/api
- **Socket.IO**: wss://chat.eagleswaps.com/socket.io
- **健康检查**: https://chat.eagleswaps.com/health
- **上传文件**: https://chat.eagleswaps.com/uploads/

## 🔐 默认配置

### 数据库
```
数据库名: eagle_chat
用户名: eagle_user
密码: EagleUser2026!@#
管理员: eaglechat_admin / EagleChat2026!@#
```

### 存储位置
```
MongoDB数据: /mnt/7tb-disk/mongodb/eagle-chat
上传文件: /mnt/7tb-disk/eagle-chat-uploads
备份文件: /mnt/7tb-disk/eagle-chat-backups
日志文件: /mnt/7tb-disk/eagle-chat-logs
```

## 📋 部署后检查

```bash
# 1. 检查后端服务
pm2 status
# 应该看到 eagle-chat-server 状态为 online

# 2. 检查Web文件
ls -lh /opt/eagle_chat/web/dist/
# 应该看到 index.html 和 assets 目录

# 3. 测试API
curl https://chat.eagleswaps.com/health
# 应该返回 {"status":"ok",...}

# 4. 测试Web访问
curl -I https://chat.eagleswaps.com
# 应该返回 200 OK

# 5. 查看日志
pm2 logs eagle-chat-server --lines 50

# 6. 检查磁盘使用
./monitor-disk.sh
```

## 🎯 用户使用流程

1. **访问网站**
   - 打开浏览器访问 https://chat.eagleswaps.com

2. **连接钱包**
   - 点击"使用MetaMask登录"
   - MetaMask弹出连接请求
   - 确认连接

3. **签名登录**
   - MetaMask弹出签名请求
   - 确认签名（免费，无gas费）
   - 自动登录

4. **开始聊天**
   - 进入聊天界面
   - 添加好友或创建群聊
   - 开始对话

## 🛠️ 管理命令

### 服务管理
```bash
# 查看状态
pm2 status

# 重启服务
pm2 restart eagle-chat-server

# 查看日志
pm2 logs eagle-chat-server

# 停止服务
pm2 stop eagle-chat-server
```

### 更新代码
```bash
cd /opt/eagle_chat
git pull origin main

# 更新后端
cd server
npm install
pm2 restart eagle-chat-server

# 更新Web前端
cd ../web
npm install
npm run build
systemctl reload nginx
```

### 数据库管理
```bash
# 连接数据库
mongosh -u eagle_user -p 'EagleUser2026!@#' --authenticationDatabase eagle_chat eagle_chat

# 手动备份
./backup-database.sh

# 设置自动备份
./setup-auto-backup.sh
```

### 监控
```bash
# 磁盘使用
./monitor-disk.sh

# 查看Nginx日志
tail -f /mnt/7tb-disk/eagle-chat-logs/nginx-access.log
tail -f /mnt/7tb-disk/eagle-chat-logs/nginx-error.log

# 查看MongoDB日志
tail -f /mnt/7tb-disk/eagle-chat-logs/mongodb.log
```

## 🔧 故障排查

### Web页面无法访问
```bash
# 检查Nginx
systemctl status nginx
nginx -t

# 检查Web文件
ls /opt/eagle_chat/web/dist/

# 重新构建
cd /opt/eagle_chat/web
npm run build
systemctl reload nginx
```

### API请求失败
```bash
# 检查后端服务
pm2 status
pm2 logs eagle-chat-server

# 重启服务
pm2 restart eagle-chat-server
```

### MetaMask连接失败
1. 确保使用HTTPS访问
2. 检查浏览器是否安装MetaMask
3. 清除浏览器缓存
4. 检查MetaMask网络设置

## 📊 性能优化

### 已配置
- ✅ PM2集群模式（2个实例）
- ✅ Nginx Gzip压缩
- ✅ 静态文件缓存
- ✅ MongoDB索引优化
- ✅ Vite代码分割

### 建议
- 增加PM2实例数（根据CPU核心）
- 配置CDN加速静态资源
- 启用Redis缓存
- 数据库读写分离

## 🔒 安全建议

1. **修改默认密码**
   ```bash
   mongosh -u eaglechat_admin -p 'EagleChat2026!@#' --authenticationDatabase admin
   > use admin
   > db.changeUserPassword("eagle_user", "新密码")
   ```

2. **配置防火墙**
   ```bash
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw enable
   ```

3. **定期更新**
   ```bash
   apt update && apt upgrade -y
   npm update -g pm2
   ```

4. **备份验证**
   ```bash
   # 定期检查备份
   ls -lh /mnt/7tb-disk/eagle-chat-backups/
   ```

## 🎉 部署完成！

### 验证清单

- [ ] 后端服务运行正常（pm2 status）
- [ ] Web前端可以访问（https://chat.eagleswaps.com）
- [ ] MetaMask登录功能正常
- [ ] API健康检查通过
- [ ] MongoDB数据库连接正常
- [ ] 文件上传目录可访问
- [ ] 日志正常记录
- [ ] 自动备份已设置

### 下一步

1. **测试功能**
   - 使用MetaMask登录
   - 测试消息发送
   - 测试文件上传

2. **监控运行**
   - 查看日志
   - 监控磁盘使用
   - 检查服务状态

3. **继续开发**
   - 完善聊天功能
   - 添加群聊管理
   - 集成视频会议

---

**GitHub仓库**: https://github.com/NYCTEAM/eagle_chat

**需要帮助？** 查看日志或运行监控脚本！
