@echo off
chcp 65001 >nul
echo ========================================
echo 🦅 Eagle Chat - 推送到GitHub
echo ========================================
echo.

cd /d G:\WALLET\EAGLE_CHAT

echo [1/6] 初始化Git仓库...
git init
if errorlevel 1 (
    echo ❌ Git初始化失败
    pause
    exit /b 1
)

echo.
echo [2/6] 添加所有文件...
git add .
if errorlevel 1 (
    echo ❌ 添加文件失败
    pause
    exit /b 1
)

echo.
echo [3/6] 提交更改...
git commit -m "Initial commit: Eagle Chat v0.4 - Core Features

✅ Implemented Features:
- Wallet address authentication (MetaMask signature verification)
- Message system (text, voice, image, video, file)
- Real-time communication (Socket.IO)
- User management and profiles
- File upload system
- Complete database models (User, Message, Group, Meeting, Friend)
- Middleware (auth, upload, error handling)
- Utilities (crypto, qrcode, validation)
- One-click deployment script

📋 Pending Features:
- Group management controllers
- Friend system controllers
- Meeting controllers
- QR code controllers
- Web frontend (React)
- Complete API documentation

🏗️ Tech Stack:
- Backend: Node.js, Express, Socket.IO, MongoDB
- Authentication: JWT, ethers.js
- Real-time: Socket.IO
- Database: MongoDB + Mongoose
- Deployment: PM2, Nginx

📊 Progress: 40%% complete
🚀 Ready for deployment and testing"

if errorlevel 1 (
    echo ❌ 提交失败
    pause
    exit /b 1
)

echo.
echo [4/6] 添加远程仓库...
git remote add origin https://github.com/NYCTEAM/eagle_chat.git
if errorlevel 1 (
    echo ⚠️  远程仓库可能已存在，尝试更新...
    git remote set-url origin https://github.com/NYCTEAM/eagle_chat.git
)

echo.
echo [5/6] 设置主分支...
git branch -M main

echo.
echo [6/6] 推送到GitHub...
echo ⚠️  如果提示输入用户名和密码，请使用GitHub Personal Access Token
echo.
git push -u origin main

if errorlevel 1 (
    echo.
    echo ❌ 推送失败！
    echo.
    echo 💡 可能的原因：
    echo   1. 仓库已存在内容 - 使用: git pull origin main --allow-unrelated-histories
    echo   2. 需要认证 - 使用GitHub Personal Access Token
    echo   3. 网络问题 - 检查网络连接
    echo.
    echo 🔧 手动推送命令：
    echo   git pull origin main --allow-unrelated-histories
    echo   git push -u origin main
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ 推送成功！
echo ========================================
echo.
echo 🌐 仓库地址: https://github.com/NYCTEAM/eagle_chat
echo.
echo 📋 下一步：
echo   1. 访问 https://github.com/NYCTEAM/eagle_chat 验证
echo   2. 在服务器上克隆: git clone https://github.com/NYCTEAM/eagle_chat.git
echo   3. 运行部署脚本: ./deploy-eagle-chat.sh
echo.
echo 🎉 完成！
echo.
pause
