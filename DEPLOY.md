# Eagle Chat 一键部署指南

## 🚀 快速部署

### 方法1：自动部署脚本（推荐）

在您的服务器上运行：

```bash
# 1. 下载部署脚本
curl -o deploy-eagle-chat.sh https://raw.githubusercontent.com/your-repo/eagle-chat/main/deploy.sh

# 2. 赋予执行权限
chmod +x deploy-eagle-chat.sh

# 3. 运行部署脚本
sudo ./deploy-eagle-chat.sh
```

### 方法2：手动部署

```bash
# 1. 创建项目目录
sudo mkdir -p /opt/eagle-chat
cd /opt/eagle-chat

# 2. 上传代码
# 将 EAGLE_CHAT 文件夹上传到服务器

# 3. 安装依赖
cd /opt/eagle-chat/server
npm install --production

# 4. 配置环境变量
cp .env.example .env
nano .env
# 修改配置

# 5. 创建上传目录
mkdir -p uploads/{avatars,voices,images,files,videos}

# 6. 启动服务
pm2 start src/app.js --name eagle-chat-server

# 7. 配置Nginx
sudo nano /etc/nginx/sites-available/chat.eagleswaps.com
# 粘贴Nginx配置

sudo ln -s /etc/nginx/sites-available/chat.eagleswaps.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 📋 完整文件列表

```
EAGLE_CHAT/
├── server/                          # 后端服务器
│   ├── src/
│   │   ├── app.js                   # ✅ 已创建
│   │   ├── config/
│   │   │   ├── database.js          # ✅ 已创建
│   │   │   └── logger.js            # ✅ 已创建
│   │   ├── models/
│   │   │   ├── User.js              # 待创建
│   │   │   ├── Message.js           # 待创建
│   │   │   ├── Group.js             # 待创建
│   │   │   ├── Meeting.js           # 待创建
│   │   │   └── Friend.js            # 待创建
│   │   ├── routes/
│   │   │   ├── auth.js              # 待创建
│   │   │   ├── messages.js          # 待创建
│   │   │   ├── groups.js            # 待创建
│   │   │   ├── friends.js           # 待创建
│   │   │   ├── meetings.js          # 待创建
│   │   │   ├── qrcode.js            # 待创建
│   │   │   └── users.js             # 待创建
│   │   ├── controllers/
│   │   │   ├── authController.js    # 待创建
│   │   │   ├── messageController.js # 待创建
│   │   │   ├── groupController.js   # 待创建
│   │   │   └── meetingController.js # 待创建
│   │   ├── middleware/
│   │   │   ├── auth.js              # 待创建
│   │   │   ├── upload.js            # 待创建
│   │   │   └── errorHandler.js      # 待创建
│   │   ├── socket/
│   │   │   ├── index.js             # 待创建
│   │   │   ├── chatHandler.js       # 待创建
│   │   │   └── groupHandler.js      # 待创建
│   │   └── utils/
│   │       ├── crypto.js            # 待创建
│   │       ├── qrcode.js            # 待创建
│   │       └── validation.js        # 待创建
│   ├── package.json                 # ✅ 已创建
│   └── .env.example                 # ✅ 已创建
│
├── web/                             # Web前端
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.jsx
│   ├── package.json
│   └── README.md
│
├── deploy/                          # 部署脚本
│   ├── deploy.sh                    # 自动部署脚本
│   ├── nginx.conf                   # Nginx配置
│   ├── pm2.config.js                # PM2配置
│   └── docker-compose.yml           # Docker配置
│
└── docs/                            # 文档
    ├── API.md                       # API文档
    ├── SOCKET.md                    # Socket.IO文档
    └── DEPLOYMENT.md                # 部署文档
```

## 🔄 下一步

由于文件数量很多（约50+个文件），我建议：

### 选项A：创建部署脚本
我创建一个shell脚本，在您的服务器上自动生成所有文件

### 选项B：分批创建
我逐步创建所有文件（需要多次操作）

### 选项C：提供GitHub仓库
我创建完整代码后，您可以直接git clone

**您想选择哪个选项？**

推荐：**选项A** - 最快最简单！
