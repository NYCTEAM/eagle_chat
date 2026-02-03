# 🌐 Eagle Chat Web前端部署指南

## 📋 部署位置

Web前端将部署在**同一台服务器**上，与后端API一起运行。

### 架构说明

```
服务器 (72.80.150.12)
├── 后端API (Node.js + Express)
│   └── 端口: 4000 (内部)
│
├── Web前端 (React + Vite)
│   └── 构建后的静态文件
│
└── Nginx (反向代理)
    ├── https://chat.eagleswaps.com/api → 后端API (4000端口)
    ├── https://chat.eagleswaps.com/socket.io → Socket.IO
    └── https://chat.eagleswaps.com/* → Web前端静态文件
```

## 🚀 部署步骤

### 方法1：自动部署（推荐）

已经集成在大硬盘部署脚本中：

```bash
# SSH登录服务器
ssh root@72.80.150.12

# 克隆项目（如果还没有）
cd /opt
git clone https://github.com/NYCTEAM/eagle_chat.git
cd eagle_chat

# 运行部署脚本（会自动部署Web前端）
chmod +x deploy-to-large-disk.sh
sudo ./deploy-to-large-disk.sh
```

### 方法2：手动部署Web前端

如果只需要更新Web前端：

```bash
# 1. 进入Web目录
cd /opt/eagle_chat/web

# 2. 安装依赖
npm install

# 3. 构建生产版本
npm run build

# 4. 构建完成后，dist目录包含所有静态文件
# Nginx会自动serve这些文件
```

## 📁 文件结构

```
/opt/eagle_chat/
├── server/                    # 后端API
│   ├── src/
│   ├── package.json
│   └── .env
│
└── web/                       # Web前端
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx      # 登录页（MetaMask）
    │   │   └── Chat.jsx       # 聊天主页
    │   ├── services/
    │   │   ├── wallet.js      # MetaMask集成
    │   │   ├── api.js         # API调用
    │   │   └── socket.js      # Socket.IO
    │   ├── store/
    │   │   └── authStore.js   # 状态管理
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    ├── vite.config.js
    └── dist/                  # 构建输出（生产环境）
        ├── index.html
        ├── assets/
        └── ...
```

## 🔧 Nginx配置

Nginx会自动配置为：

```nginx
server {
    listen 443 ssl http2;
    server_name chat.eagleswaps.com;
    
    # SSL证书
    ssl_certificate /etc/letsencrypt/live/eagleswaps.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/eagleswaps.com/privkey.pem;
    
    # API路由
    location /api/ {
        proxy_pass http://localhost:4000;
        # ... proxy设置
    }
    
    # Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        # ... WebSocket设置
    }
    
    # 上传文件
    location /uploads/ {
        alias /mnt/7tb-disk/eagle-chat-uploads/;
        expires 30d;
    }
    
    # Web前端（所有其他请求）
    location / {
        root /opt/eagle_chat/web/dist;
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
    }
}
```

## 🌐 访问地址

部署完成后：

- **Web界面**: https://chat.eagleswaps.com
- **API接口**: https://chat.eagleswaps.com/api
- **Socket.IO**: wss://chat.eagleswaps.com/socket.io

## 🔑 功能特性

### 已实现
- ✅ MetaMask钱包登录
- ✅ 钱包签名验证
- ✅ 用户认证和状态管理
- ✅ Socket.IO实时连接
- ✅ 响应式UI设计
- ✅ Tailwind CSS样式

### 待完善（后续开发）
- ⏳ 聊天消息收发
- ⏳ 群聊管理
- ⏳ 好友系统
- ⏳ 视频会议集成
- ⏳ 文件上传
- ⏳ 二维码功能

## 🛠️ 开发模式

在本地开发时：

```bash
# 1. 进入web目录
cd web

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 访问 http://localhost:3000
```

开发模式会自动代理API请求到后端（配置在vite.config.js）。

## 📦 更新Web前端

```bash
# 1. SSH登录服务器
ssh root@72.80.150.12

# 2. 进入项目目录
cd /opt/eagle_chat

# 3. 拉取最新代码
git pull origin main

# 4. 重新构建Web前端
cd web
npm install
npm run build

# 5. 重启Nginx（如果需要）
systemctl reload nginx
```

## 🔍 故障排查

### Web页面无法访问

```bash
# 检查Nginx状态
systemctl status nginx

# 检查Nginx配置
nginx -t

# 查看Nginx日志
tail -f /mnt/7tb-disk/eagle-chat-logs/nginx-error.log
```

### MetaMask连接失败

1. 确保使用HTTPS访问
2. 检查浏览器是否安装MetaMask
3. 检查MetaMask网络设置

### API请求失败

```bash
# 检查后端服务
pm2 status

# 查看后端日志
pm2 logs eagle-chat-server

# 测试API
curl https://chat.eagleswaps.com/health
```

### Socket.IO连接失败

1. 检查Nginx WebSocket配置
2. 查看浏览器控制台错误
3. 确认后端Socket.IO服务运行正常

## 📊 性能优化

### 已配置
- ✅ Vite构建优化
- ✅ 代码分割（React、Web3、Socket.IO分离）
- ✅ Gzip压缩
- ✅ 静态资源缓存

### 建议
- 使用CDN加速静态资源
- 启用HTTP/2
- 配置浏览器缓存策略

## 🔒 安全配置

### HTTPS
- 使用Let's Encrypt SSL证书
- 强制HTTPS重定向
- 安全的Cookie设置

### CORS
- 配置允许的源
- 限制API访问

### CSP（内容安全策略）
可在Nginx中添加：

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";
```

## 🎉 完成！

Web前端部署完成后，用户可以：

1. 访问 https://chat.eagleswaps.com
2. 点击"使用MetaMask登录"
3. 在MetaMask中签名
4. 进入聊天界面

---

**注意**: Web前端和后端API部署在同一台服务器上，通过Nginx统一管理。
