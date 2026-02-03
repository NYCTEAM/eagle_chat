# 🔧 Eagle Chat 故障排查指南

## 当前问题及解决方案

### 1. ✅ 翻译键显示问题（已修复）

**问题**: 界面显示 `chat.friends.addFriend` 等翻译键而不是中文文本

**原因**: 缺少部分翻译键定义

**解决方案**: 
- 已添加完整的中文翻译
- 修复了重复的翻译键
- 添加了所有新功能的翻译

**提交**: `99b135e` - Fix Chinese translations

---

### 2. ⚠️ WebSocket 连接失败

**错误信息**:
```
WebSocket connection to 'wss://chat.eagleswap.io/socket.io/?EIO=4&transport=websocket' failed
```

**原因**: 后端服务器未运行或 Nginx 配置问题

**解决方案**:

#### A. 检查后端服务

```bash
# SSH 到服务器
ssh root@eagleswapweb

# 检查 PM2 状态
pm2 status

# 如果服务未运行，启动它
pm2 start /opt/eagle-chat/server/src/app.js --name eagle-chat-server

# 查看日志
pm2 logs eagle-chat-server
```

#### B. 检查 Nginx 配置

```bash
# 检查 Nginx 配置
cat /www/server/panel/vhost/nginx/chat.eagleswap.io.conf

# 确保包含 Socket.IO 代理配置
```

需要的 Nginx 配置：
```nginx
# Socket.IO WebSocket 代理
location /socket.io/ {
    proxy_pass http://localhost:4000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

#### C. 检查防火墙

```bash
# 确保端口 4000 开放
sudo ufw status
sudo ufw allow 4000/tcp
```

---

### 3. ⚠️ API 错误: fr.get is not a function

**错误信息**:
```
Load friends error: TypeError: fr.get is not a function
```

**原因**: 后端 API 返回数据格式不正确或后端未运行

**解决方案**:

#### A. 确保后端运行

```bash
# 检查后端服务
curl http://localhost:4000/health

# 应该返回
{"status":"ok","timestamp":"..."}
```

#### B. 检查 API 响应格式

后端应该返回：
```json
{
  "success": true,
  "friends": [
    {
      "address": "0x...",
      "nickname": "...",
      "avatar": "...",
      "online": true
    }
  ]
}
```

#### C. 修复后端路由

确保 `/api/friends` 路由已正确配置：

```javascript
// server/src/routes/friends.js
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findByAddress(req.user.address);
    const friends = await User.find({
      address: { $in: user.friends }
    }).select('address nickname avatar online lastSeen');
    
    res.json({ success: true, friends });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
```

---

### 4. ⚠️ 图标 404 错误

**错误信息**:
```
GET https://chat.eagleswap.io/eagle-icon.svg 404 (Not Found)
```

**原因**: 缺少 eagle-icon.svg 文件

**解决方案**:

#### A. 创建图标文件

```bash
# 在本地创建
cd G:\WALLET\EAGLE_CHAT\web\public

# 复制或创建 eagle-icon.svg
# 或者使用 Logo 生成器
```

#### B. 或者修改引用

如果不需要这个图标，可以在代码中移除引用：

```javascript
// 搜索 eagle-icon.svg 的引用并移除或替换
```

---

## 完整部署检查清单

### 1. 后端部署

```bash
# SSH 到服务器
ssh root@eagleswapweb

# 拉取最新代码
cd /opt/eagle-chat
git pull origin main

# 安装依赖
cd server
npm install --production

# 检查环境变量
cat .env

# 确保包含：
# NODE_ENV=production
# PORT=4000
# MONGODB_URI=mongodb://localhost:27017/eagle-chat
# JWT_SECRET=...
# CORS_ORIGIN=https://chat.eagleswap.io

# 启动/重启服务
pm2 restart eagle-chat-server --update-env
pm2 save

# 查看日志
pm2 logs eagle-chat-server --lines 50
```

### 2. 前端部署

```bash
cd /opt/eagle-chat/web

# 安装依赖
npm install

# 构建
npm run build

# 部署到 web root
rm -rf /www/wwwroot/chat.eagleswap.io/*
cp -r dist/* /www/wwwroot/chat.eagleswap.io/

# 设置权限
chown -R www:www /www/wwwroot/chat.eagleswap.io
chmod -R 755 /www/wwwroot/chat.eagleswap.io
```

### 3. Nginx 配置

```bash
# 测试配置
/www/server/nginx/sbin/nginx -t

# 重新加载
/www/server/nginx/sbin/nginx -s reload

# 查看日志
tail -f /www/server/nginx/logs/chat.eagleswap.io.access.log
tail -f /www/server/nginx/logs/error.log
```

### 4. MongoDB 检查

```bash
# 连接 MongoDB
mongosh

# 切换数据库
use eagle-chat

# 检查集合
show collections

# 检查用户
db.users.find().limit(5).pretty()
```

---

## 常见问题解决

### 问题: 登录后立即断开连接

**解决方案**:
1. 检查 JWT Token 是否正确生成
2. 检查 Socket.IO 认证中间件
3. 查看浏览器控制台和服务器日志

### 问题: 消息发送失败

**解决方案**:
1. 检查 Socket.IO 连接状态
2. 检查后端 `/api/messages` 路由
3. 检查 MongoDB 连接

### 问题: 视频通话无法连接

**解决方案**:
1. 检查 Jitsi Meet 脚本是否加载
2. 检查浏览器权限（摄像头、麦克风）
3. 检查网络连接
4. 尝试使用自建 Jitsi 服务器

### 问题: 文件上传失败

**解决方案**:
1. 检查上传目录权限
2. 检查 Nginx 文件大小限制
3. 检查后端 multer 配置

---

## 监控命令

### 实时监控

```bash
# 查看系统资源
htop

# 查看磁盘使用
df -h

# 查看 PM2 进程
pm2 monit

# 查看实时日志
pm2 logs eagle-chat-server --lines 100 --raw

# 查看 Nginx 访问日志
tail -f /www/server/nginx/logs/chat.eagleswap.io.access.log

# 查看 MongoDB 日志
tail -f /var/log/mongodb/mongod.log
```

### 性能测试

```bash
# 测试 API 响应时间
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:4000/health

# 测试 WebSocket 连接
wscat -c ws://localhost:4000/socket.io/?EIO=4&transport=websocket

# 压力测试
ab -n 1000 -c 10 http://localhost:4000/health
```

---

## 紧急恢复

### 如果服务完全崩溃

```bash
# 1. 停止所有服务
pm2 stop all

# 2. 检查 MongoDB
sudo systemctl status mongod
sudo systemctl restart mongod

# 3. 清理日志
pm2 flush

# 4. 重启服务
pm2 restart all

# 5. 检查状态
pm2 status
pm2 logs --lines 50
```

### 如果数据库损坏

```bash
# 备份数据
mongodump --db eagle-chat --out /backup/eagle-chat-$(date +%Y%m%d)

# 修复数据库
mongod --repair

# 恢复数据
mongorestore --db eagle-chat /backup/eagle-chat-YYYYMMDD/eagle-chat
```

---

## 获取帮助

如果问题仍未解决：

1. **查看日志**
   - 后端: `pm2 logs eagle-chat-server`
   - Nginx: `/www/server/nginx/logs/error.log`
   - MongoDB: `/var/log/mongodb/mongod.log`

2. **检查配置**
   - 后端: `/opt/eagle-chat/server/.env`
   - Nginx: `/www/server/panel/vhost/nginx/chat.eagleswap.io.conf`

3. **联系支持**
   - GitHub Issues
   - Telegram: @eagleswap
   - Email: support@eagleswap.io

---

**最后更新**: 2026-02-03  
**版本**: v4.0.1
