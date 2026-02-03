# Eagle Chat 大硬盘部署指南

## 📊 服务器信息

根据您的服务器配置：
- **IP**: 72.80.150.12
- **大硬盘**: /mnt/7tb-disk (1.5T/1.6T 可用)
- **内存**: 27.6G/503.5G
- **运行时间**: 31天

## 🎯 部署策略

所有数据存储在大硬盘 `/mnt/7tb-disk`：
- MongoDB数据库
- 用户上传文件
- 数据库备份
- 应用日志

## 🚀 快速部署

### 1. SSH登录服务器

```bash
ssh root@72.80.150.12
```

### 2. 克隆项目

```bash
cd /opt
git clone https://github.com/NYCTEAM/eagle_chat.git
cd eagle_chat
```

### 3. 运行大硬盘部署脚本

```bash
chmod +x deploy-to-large-disk.sh
sudo ./deploy-to-large-disk.sh
```

部署脚本会自动：
- ✅ 安装Node.js 18.x
- ✅ 安装MongoDB 6.0
- ✅ 配置MongoDB使用 `/mnt/7tb-disk/mongodb/eagle-chat`
- ✅ 创建上传目录 `/mnt/7tb-disk/eagle-chat-uploads`
- ✅ 创建日志目录 `/mnt/7tb-disk/eagle-chat-logs`
- ✅ 创建备份目录 `/mnt/7tb-disk/eagle-chat-backups`
- ✅ 配置Nginx反向代理
- ✅ 使用PM2启动服务

## 📁 目录结构

```
/mnt/7tb-disk/
├── mongodb/
│   └── eagle-chat/          # MongoDB数据库文件
│       ├── collection/
│       ├── index/
│       └── journal/
├── eagle-chat-uploads/      # 用户上传的文件
│   ├── avatars/
│   ├── images/
│   ├── videos/
│   ├── voices/
│   └── files/
├── eagle-chat-backups/      # 数据库备份
│   ├── eagle_chat_backup_20260202_030000.tar.gz
│   └── ...
└── eagle-chat-logs/         # 应用日志
    ├── mongodb.log
    ├── pm2-error.log
    ├── pm2-out.log
    ├── nginx-access.log
    └── nginx-error.log
```

## 🔐 数据库信息

部署后的数据库配置：

```
数据库名: eagle_chat
数据库用户: eagle_user
数据库密码: EagleUser2026!@#
管理员用户: eaglechat_admin
管理员密码: EagleChat2026!@#

连接URI: mongodb://eagle_user:EagleUser2026!@#@localhost:27017/eagle_chat?authSource=eagle_chat
```

## 🌐 访问地址

部署完成后：

- **Web界面**: https://chat.eagleswaps.com
- **API接口**: https://chat.eagleswaps.com/api
- **Socket.IO**: wss://chat.eagleswaps.com/socket.io
- **健康检查**: https://chat.eagleswaps.com/health

## 💾 数据备份

### 设置自动备份

```bash
cd /opt/eagle_chat
chmod +x setup-auto-backup.sh
sudo ./setup-auto-backup.sh
```

这会设置每天凌晨3点自动备份数据库。

### 手动备份

```bash
cd /opt/eagle_chat
chmod +x backup-database.sh
sudo ./backup-database.sh
```

### 恢复备份

```bash
# 1. 解压备份文件
tar -xzf /mnt/7tb-disk/eagle-chat-backups/eagle_chat_backup_YYYYMMDD_HHMMSS.tar.gz -C /tmp

# 2. 恢复数据库
mongorestore --uri='mongodb://eagle_user:EagleUser2026!@#@localhost:27017/eagle_chat?authSource=eagle_chat' /tmp/eagle_chat_backup_YYYYMMDD_HHMMSS/eagle_chat
```

## 📊 监控磁盘使用

```bash
cd /opt/eagle_chat
chmod +x monitor-disk.sh
./monitor-disk.sh
```

输出示例：
```
📊 总体磁盘使用：
  - 挂载点: /mnt/7tb-disk
  - 总容量: 1.6T
  - 已使用: 100G (6%)
  - 可用: 1.5T

📁 各目录使用情况：
  - MongoDB数据: 2.5G (1234 个文件)
  - 上传文件: 500M (567 个文件)
  - 数据库备份: 1.2G (30 个备份)
  - 日志文件: 100M (45 个文件)
```

## 🛠️ 管理命令

### PM2进程管理

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs eagle-chat-server

# 重启服务
pm2 restart eagle-chat-server

# 停止服务
pm2 stop eagle-chat-server

# 启动服务
pm2 start eagle-chat-server
```

### MongoDB管理

```bash
# 连接数据库
mongosh -u eagle_user -p 'EagleUser2026!@#' --authenticationDatabase eagle_chat eagle_chat

# 查看数据库状态
mongosh -u eaglechat_admin -p 'EagleChat2026!@#' --authenticationDatabase admin --eval "db.serverStatus()"

# 查看集合
mongosh -u eagle_user -p 'EagleUser2026!@#' --authenticationDatabase eagle_chat eagle_chat --eval "show collections"
```

### Nginx管理

```bash
# 测试配置
nginx -t

# 重载配置
systemctl reload nginx

# 重启Nginx
systemctl restart nginx

# 查看日志
tail -f /mnt/7tb-disk/eagle-chat-logs/nginx-access.log
tail -f /mnt/7tb-disk/eagle-chat-logs/nginx-error.log
```

## 🔧 故障排查

### 1. 服务无法启动

```bash
# 检查PM2日志
pm2 logs eagle-chat-server --lines 100

# 检查MongoDB状态
systemctl status mongod

# 检查端口占用
netstat -tlnp | grep 4000
```

### 2. 数据库连接失败

```bash
# 检查MongoDB是否运行
systemctl status mongod

# 检查MongoDB日志
tail -f /mnt/7tb-disk/eagle-chat-logs/mongodb.log

# 测试连接
mongosh -u eagle_user -p 'EagleUser2026!@#' --authenticationDatabase eagle_chat eagle_chat
```

### 3. 磁盘空间不足

```bash
# 运行监控脚本
./monitor-disk.sh

# 清理旧日志（30天前）
find /mnt/7tb-disk/eagle-chat-logs -name "*.log" -mtime +30 -delete

# 清理旧备份（30天前）
find /mnt/7tb-disk/eagle-chat-backups -name "*.tar.gz" -mtime +30 -delete
```

### 4. Nginx 502错误

```bash
# 检查后端服务是否运行
pm2 status

# 检查端口
curl http://localhost:4000/health

# 重启服务
pm2 restart eagle-chat-server
```

## 📈 性能优化

### MongoDB优化

编辑 `/etc/mongod.conf`：

```yaml
storage:
  wiredTiger:
    engineConfig:
      cacheSizeGB: 4  # 根据可用内存调整
```

### PM2集群模式

编辑 `ecosystem.config.js`：

```javascript
instances: 4,  // 根据CPU核心数调整
```

### Nginx缓存

添加到Nginx配置：

```nginx
# 静态文件缓存
location /uploads/ {
    alias /mnt/7tb-disk/eagle-chat-uploads/;
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

## 🔒 安全建议

1. **修改默认密码**
   ```bash
   # 修改MongoDB密码
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

## 📝 更新应用

```bash
cd /opt/eagle_chat
git pull origin main
cd server
npm install
pm2 restart eagle-chat-server
```

## 🎉 完成！

部署完成后，您的Eagle Chat服务器将：
- ✅ 运行在 https://chat.eagleswaps.com
- ✅ 所有数据存储在大硬盘 /mnt/7tb-disk
- ✅ 每天自动备份数据库
- ✅ 使用PM2集群模式运行
- ✅ 通过Nginx提供HTTPS访问

---

**需要帮助？** 查看日志或运行监控脚本！
