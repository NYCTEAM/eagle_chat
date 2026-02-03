# 🚀 Eagle Chat 快速部署指南

## 📋 部署到大硬盘 (推荐)

您的服务器有1.5T大硬盘空间，所有数据将存储在 `/mnt/7tb-disk`

### 一键部署命令

```bash
# 1. SSH登录服务器
ssh root@72.80.150.12

# 2. 克隆项目
cd /opt
git clone https://github.com/NYCTEAM/eagle_chat.git
cd eagle_chat

# 3. 运行大硬盘部署脚本
chmod +x deploy-to-large-disk.sh
sudo ./deploy-to-large-disk.sh

# 4. 设置自动备份（可选）
chmod +x setup-auto-backup.sh
sudo ./setup-auto-backup.sh

# 5. 检查磁盘使用
chmod +x monitor-disk.sh
./monitor-disk.sh
```

### 部署完成后

访问：**https://chat.eagleswaps.com**

## 📊 存储分配

```
/mnt/7tb-disk/ (1.5T可用)
├── mongodb/eagle-chat/          # 数据库（预计10-50GB）
├── eagle-chat-uploads/          # 用户文件（可增长）
├── eagle-chat-backups/          # 每日备份（每个约2-5GB）
└── eagle-chat-logs/             # 日志文件（定期清理）
```

## 🔐 默认配置

**数据库**
- 用户名: `eagle_user`
- 密码: `EagleUser2026!@#`
- 数据库: `eagle_chat`

**访问地址**
- Web: https://chat.eagleswaps.com
- API: https://chat.eagleswaps.com/api
- Socket.IO: wss://chat.eagleswaps.com/socket.io

## 🛠️ 常用命令

```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs eagle-chat-server

# 重启服务
pm2 restart eagle-chat-server

# 监控磁盘
./monitor-disk.sh

# 手动备份
./backup-database.sh
```

## 📝 部署后检查

```bash
# 1. 检查服务运行
pm2 status

# 2. 测试API
curl https://chat.eagleswaps.com/health

# 3. 检查MongoDB
systemctl status mongod

# 4. 查看磁盘使用
./monitor-disk.sh
```

## 🎉 完成！

部署成功后，您的Eagle Chat将：
- ✅ 运行在大硬盘上，充足的存储空间
- ✅ 每天自动备份数据库
- ✅ 使用PM2集群模式，高可用
- ✅ 通过Nginx提供HTTPS访问
- ✅ 完整的日志和监控

---

**详细文档**: 查看 `DEPLOY_LARGE_DISK.md`
