# Eagle Chat 聊天功能更新

## 📋 更新内容

### 🎯 新增功能

#### 1. 后端 API
- ✅ **好友系统** (`/api/friends`)
  - 获取好友列表
  - 搜索用户
  - 发送/接受/拒绝好友请求
  - 删除好友
  
- ✅ **用户管理** (`/api/users`)
  - 获取/更新用户信息
  - 上传头像
  - 拉黑/取消拉黑用户
  
- ✅ **群组功能** (`/api/groups`)
  - 创建/更新/删除群组
  - 添加/移除成员
  - 离开群组
  
- ✅ **会议功能** (`/api/meetings`)
  - 创建/开始/结束会议
  - 加入会议（集成 Jitsi Meet）
  
- ✅ **二维码** (`/api/qrcode`)
  - 生成用户/群组/会议二维码

#### 2. Socket.IO 实时通信
- ✅ 用户上线/离线通知
- ✅ 实时消息收发
- ✅ 正在输入提示
- ✅ 群聊房间管理

#### 3. 前端组件
- ✅ **FriendList** - 好友列表组件
  - 搜索好友
  - 添加好友弹窗
  - 在线状态显示
  
- ✅ **ChatWindow** - 聊天窗口组件
  - 消息列表
  - 实时消息收发
  - 正在输入提示
  - 消息时间戳

---

## 🚀 部署步骤

### 方法 1: 使用自动更新脚本（推荐）

```bash
# 在本地 Windows 上执行
cd G:\WALLET\EAGLE_CHAT

# 设置服务器信息（如果需要）
set SERVER_USER=root
set SERVER_HOST=eagleswapweb

# 运行更新脚本
bash update-server.sh
```

### 方法 2: 手动部署

#### 2.1 提交代码到 Git

```bash
cd G:\WALLET\EAGLE_CHAT
git add .
git commit -m "Add chat features: friends, messages, real-time communication"
git push origin main
```

#### 2.2 SSH 登录服务器

```bash
ssh root@eagleswapweb
```

#### 2.3 更新后端

```bash
cd /opt/eagle-chat

# 拉取最新代码
git pull origin main

# 更新依赖
cd server
npm install --production

# 重启服务
pm2 restart eagle-chat-server --update-env
pm2 save
```

#### 2.4 更新前端

```bash
cd /opt/eagle-chat/web

# 安装依赖
npm install

# 构建
npm run build

# 复制到 web root
rm -rf /www/wwwroot/chat.eagleswap.io/*
cp -r dist/* /www/wwwroot/chat.eagleswap.io/
chown -R www:www /www/wwwroot/chat.eagleswap.io
```

#### 2.5 重启 Nginx

```bash
/www/server/nginx/sbin/nginx -t
/www/server/nginx/sbin/nginx -s reload
```

---

## 🧪 测试功能

### 1. 测试后端 API

```bash
# 健康检查
curl http://localhost:4000/health

# 测试好友 API（需要 JWT token）
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/friends
```

### 2. 测试前端

访问 https://chat.eagleswap.io

1. **登录**
   - 使用 MetaMask 连接钱包
   - 签名认证

2. **添加好友**
   - 点击"添加好友"按钮
   - 搜索用户地址或昵称
   - 发送好友请求

3. **发送消息**
   - 选择一个好友
   - 输入消息并发送
   - 查看实时消息更新

4. **测试实时功能**
   - 打开两个浏览器窗口
   - 用不同账户登录
   - 互相发送消息
   - 观察在线状态和正在输入提示

---

## 📊 验证部署

### 检查后端服务

```bash
# 查看 PM2 状态
pm2 status

# 查看日志
pm2 logs eagle-chat-server --lines 50

# 检查端口
netstat -tulpn | grep :4000
```

### 检查前端文件

```bash
# 检查文件是否存在
ls -lh /www/wwwroot/chat.eagleswap.io/

# 检查权限
ls -la /www/wwwroot/chat.eagleswap.io/
```

### 检查 Nginx

```bash
# 测试配置
/www/server/nginx/sbin/nginx -t

# 查看日志
tail -f /www/server/nginx/logs/chat.eagleswap.io.access.log
```

---

## 🐛 故障排查

### 后端问题

**问题**: PM2 显示服务 "errored"
```bash
# 查看详细错误
pm2 logs eagle-chat-server --err --lines 100

# 常见原因：
# 1. MongoDB 连接失败 -> 检查 .env 中的 MONGODB_URI
# 2. 端口被占用 -> netstat -tulpn | grep :4000
# 3. 依赖缺失 -> cd /opt/eagle-chat/server && npm install
```

**问题**: Socket.IO 连接失败
```bash
# 检查 CORS 配置
cat /opt/eagle-chat/server/.env | grep CORS

# 应该包含：
# CORS_ORIGIN=https://chat.eagleswap.io
# SOCKET_CORS_ORIGIN=https://chat.eagleswap.io
```

### 前端问题

**问题**: 页面样式丢失
```bash
# 重新构建前端
cd /opt/eagle-chat/web
npm run build
cp -r dist/* /www/wwwroot/chat.eagleswap.io/
chown -R www:www /www/wwwroot/chat.eagleswap.io
```

**问题**: API 请求 502 错误
```bash
# 检查后端是否运行
pm2 status
curl http://localhost:4000/health

# 检查 Nginx 代理配置
cat /www/server/panel/vhost/nginx/chat.eagleswap.io.conf
```

---

## 📝 环境变量

确保服务器上的 `/opt/eagle-chat/server/.env` 包含：

```env
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb://localhost:27017/eagle-chat
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
UPLOAD_DIR=/mnt/7tb-disk/eagle-chat-uploads
MAX_FILE_SIZE=52428800
LOG_DIR=/mnt/7tb-disk/eagle-chat-logs
CORS_ORIGIN=https://chat.eagleswap.io
SOCKET_CORS_ORIGIN=https://chat.eagleswap.io
```

---

## 🎉 功能清单

- [x] 用户认证（MetaMask 钱包登录）
- [x] 好友系统（添加、删除、搜索）
- [x] 一对一聊天
- [x] 实时消息
- [x] 在线状态
- [x] 正在输入提示
- [x] 消息历史
- [ ] 群聊功能（UI 待完善）
- [ ] 视频会议（待集成 Jitsi）
- [ ] 文件传输
- [ ] 消息加密

---

## 📞 获取帮助

如果遇到问题：

1. 查看日志：`pm2 logs eagle-chat-server`
2. 检查服务状态：`pm2 status`
3. 测试 API：`curl http://localhost:4000/health`
4. 查看 Nginx 日志：`tail -f /www/server/nginx/logs/error.log`

---

**更新时间**: 2026-02-03
**版本**: v1.1.0
