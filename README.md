# 🦅 Eagle Chat - 去中心化钱包聊天系统

## 📖 项目简介

Eagle Chat是一个专为加密钱包设计的去中心化聊天平台，支持用户使用钱包地址直接登录，无需注册。

### ✨ 核心特性

- 🔐 **钱包地址登录** - 支持MetaMask、WalletConnect等所有Web3钱包
- 💬 **完整聊天功能** - 文字、语音、图片、视频、文件分享
- 👥 **群聊管理** - 创建群聊、管理员权限、成员管理
- 📹 **视频会议** - 集成Jitsi Meet，支持多人音视频通话
- 📱 **二维码功能** - 添加好友、加入群聊、会议邀请
- 🔔 **实时通知** - Socket.IO实时推送
- 🌐 **跨平台** - Android APP + Web版本
- 🔒 **端到端加密** - 消息加密保护隐私

## 🚀 快速开始

### 方法1：一键SSH部署（最简单）⭐

从本地电脑直接部署到服务器，只需3步：

```bash
# 1. 克隆项目到本地
git clone https://github.com/NYCTEAM/eagle_chat.git
cd eagle_chat

# 2. 赋予执行权限
chmod +x one-click-deploy.sh

# 3. 运行一键部署（自动SSH登录、拉取代码、部署）
./one-click-deploy.sh
```

**Windows用户**：双击运行 `one-click-deploy.bat`

**高级用户**（已配置SSH密钥）：
```bash
chmod +x quick-deploy.sh
./quick-deploy.sh
```

详细说明请查看：[ONE_CLICK_DEPLOY.md](ONE_CLICK_DEPLOY.md)

### 方法2：服务器上直接部署

```bash
# 1. SSH登录服务器
ssh root@72.80.150.12

# 2. 克隆项目
cd /opt
git clone https://github.com/NYCTEAM/eagle_chat.git
cd eagle_chat

# 3. 运行部署脚本
chmod +x deploy-to-large-disk.sh
./deploy-to-large-disk.sh
```

### 方法3：手动部署

#### 前置要求

- Ubuntu 20.04+ / Debian 11+
- Node.js 18+
- MongoDB 6.0+
- Nginx
- PM2

#### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/your-repo/eagle-chat.git
cd eagle-chat

# 2. 安装服务器依赖
cd server
npm install

# 3. 配置环境变量
cp .env.example .env
nano .env  # 修改配置

# 4. 启动服务
pm2 start src/app.js --name eagle-chat-server

# 5. 配置Nginx
sudo cp deploy/nginx.conf /etc/nginx/sites-available/chat.eagleswaps.com
sudo ln -s /etc/nginx/sites-available/chat.eagleswaps.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 📁 项目结构

```
eagle-chat/
├── server/                 # 后端服务器
│   ├── src/
│   │   ├── app.js         # 应用入口
│   │   ├── config/        # 配置文件
│   │   ├── models/        # 数据库模型
│   │   ├── routes/        # API路由
│   │   ├── controllers/   # 控制器
│   │   ├── middleware/    # 中间件
│   │   ├── socket/        # Socket.IO处理
│   │   └── utils/         # 工具函数
│   ├── uploads/           # 上传文件
│   └── logs/              # 日志文件
│
├── web/                   # Web前端
│   ├── public/
│   ├── src/
│   │   ├── components/    # React组件
│   │   ├── pages/         # 页面
│   │   ├── services/      # API服务
│   │   └── utils/         # 工具函数
│   └── package.json
│
└── deploy/                # 部署脚本
    ├── deploy.sh          # 自动部署
    ├── nginx.conf         # Nginx配置
    └── pm2.config.js      # PM2配置
```

## 🔧 配置说明

### 环境变量

在 `server/.env` 文件中配置：

```env
# 服务器配置
PORT=4000
NODE_ENV=production

# 数据库
MONGODB_URI=mongodb://localhost:27017/eagle-chat

# JWT密钥（必须修改）
JWT_SECRET=your-secret-key-here

# Jitsi Meet
JITSI_DOMAIN=meet.eagleswaps.com

# CORS
CORS_ORIGIN=*
```

### Nginx配置

```nginx
server {
    listen 443 ssl http2;
    server_name chat.eagleswaps.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 📡 API文档

### 认证API

#### 登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "address": "0x1234...",
  "signature": "0xabcd...",
  "message": "Login to Eagle Chat"
}
```

#### 更新个人信息
```http
PUT /api/auth/profile
Authorization: Bearer {token}

{
  "nickname": "Eagle User",
  "bio": "Hello World"
}
```

### 消息API

#### 发送消息
```http
POST /api/messages/send
Authorization: Bearer {token}

{
  "to": "0xabcd...",
  "type": "text",
  "content": "Hello!"
}
```

#### 获取聊天记录
```http
GET /api/messages/chat/:address?limit=50&offset=0
Authorization: Bearer {token}
```

### 群聊API

#### 创建群聊
```http
POST /api/groups/create
Authorization: Bearer {token}

{
  "name": "Eagle Group",
  "members": ["0xabcd...", "0x1234..."]
}
```

完整API文档请查看：[API.md](docs/API.md)

## 🔌 Socket.IO事件

### 客户端发送

```javascript
// 认证
socket.emit('authenticate', { token: 'jwt_token' });

// 发送消息
socket.emit('send_message', {
  to: '0xabcd...',
  type: 'text',
  content: 'Hello!'
});

// 加入群聊
socket.emit('join_group', { groupId: 'group123' });
```

### 服务器推送

```javascript
// 新消息
socket.on('new_message', (message) => {
  console.log('New message:', message);
});

// 用户在线状态
socket.on('user_online', ({ address, online }) => {
  console.log(`${address} is ${online ? 'online' : 'offline'}`);
});
```

完整Socket.IO文档请查看：[SOCKET.md](docs/SOCKET.md)

## 📱 客户端集成

### Android集成

```kotlin
// 1. 添加依赖
dependencies {
    implementation 'io.socket:socket.io-client:2.1.0'
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
}

// 2. 配置API
object ApiConfig {
    const val CHAT_BASE_URL = "https://chat.eagleswaps.com"
    const val SOCKET_URL = "https://chat.eagleswaps.com"
}

// 3. 连接Socket.IO
val socket = IO.socket(ApiConfig.SOCKET_URL)
socket.connect()
```

### Web集成

```javascript
// 1. 安装依赖
npm install socket.io-client ethers

// 2. 连接钱包
import { ethers } from 'ethers';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const address = await signer.getAddress();

// 3. 签名登录
const message = "Login to Eagle Chat";
const signature = await signer.signMessage(message);

// 4. 发送到服务器
const response = await fetch('https://chat.eagleswaps.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ address, signature, message })
});
```

## 🧪 测试

```bash
# 运行测试
npm test

# 测试覆盖率
npm run test:coverage

# API测试
curl https://chat.eagleswaps.com/health
```

## 📊 监控

```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs eagle-chat-server

# 查看资源使用
pm2 monit

# 重启服务
pm2 restart eagle-chat-server
```

## 🔒 安全建议

1. **修改默认密钥**
   - 更改 `.env` 中的 `JWT_SECRET`
   - 使用强随机密钥

2. **启用HTTPS**
   - 使用Let's Encrypt证书
   - 强制HTTPS重定向

3. **限制文件上传**
   - 设置文件大小限制
   - 验证文件类型

4. **数据库安全**
   - 启用MongoDB认证
   - 定期备份数据

5. **防火墙配置**
   - 只开放必要端口
   - 使用fail2ban

## 🆘 故障排查

### 服务无法启动

```bash
# 检查端口占用
sudo lsof -i :4000

# 查看日志
pm2 logs eagle-chat-server --lines 100

# 检查MongoDB
sudo systemctl status mongod
```

### Socket.IO连接失败

```bash
# 检查Nginx配置
sudo nginx -t

# 测试WebSocket
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" https://chat.eagleswaps.com/socket.io/
```

### 文件上传失败

```bash
# 检查上传目录权限
ls -la server/uploads/

# 修改权限
chmod -R 755 server/uploads/
```

## 📚 文档

- [一键部署指南](ONE_CLICK_DEPLOY.md) ⭐ 推荐
- [大硬盘部署指南](DEPLOY_LARGE_DISK.md)
- [快速部署指南](QUICK_DEPLOY.md)
- [最终部署指南](FINAL_DEPLOY_GUIDE.md)
- [Web部署说明](WEB_DEPLOYMENT.md)
- [多语言支持指南](web/I18N_GUIDE.md)
- [多语言总结](I18N_SUMMARY.md)
- [API文档](docs/API.md)
- [Socket.IO文档](docs/SOCKET.md)

## 🤝 贡献

欢迎贡献代码！请查看 [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件

## 📞 联系我们

- 网站: https://eagleswaps.com
- Email: support@eagleswaps.com
- Telegram: @eagleswaps

## 🎉 致谢

- [Socket.IO](https://socket.io/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Jitsi Meet](https://jitsi.org/)
- [ethers.js](https://docs.ethers.io/)

---

Made with ❤️ by Eagle Swaps Team
