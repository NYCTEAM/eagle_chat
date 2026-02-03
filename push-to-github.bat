@echo off
chcp 65001 >nul
echo ========================================
echo Eagle Chat - Push to GitHub
echo ========================================
echo.

cd /d G:\WALLET\EAGLE_CHAT

echo [1/6] Initializing Git repository...
git init

echo.
echo [2/6] Adding all files...
git add .

echo.
echo [3/6] Committing changes...
git commit -m "Initial commit: Eagle Chat v0.4 - Core Features" -m "Implemented: Wallet authentication, Message system, Real-time communication, User management, File upload, Database models, Middleware, Utilities, Deployment script" -m "Pending: Group management, Friend system, Meeting features, QR code, Web frontend" -m "Tech Stack: Node.js, Express, Socket.IO, MongoDB, JWT, ethers.js"

echo.
echo [4/6] Adding remote repository...
git remote add origin https://github.com/NYCTEAM/eagle_chat.git 2>nul
if errorlevel 1 (
    git remote set-url origin https://github.com/NYCTEAM/eagle_chat.git
)

echo.
echo [5/6] Setting main branch...
git branch -M main

echo.
echo [6/6] Pushing to GitHub...
git push -u origin main

if errorlevel 1 (
    echo.
    echo Push failed! Trying to pull first...
    git pull origin main --allow-unrelated-histories
    git push -u origin main
)

echo.
echo ========================================
echo Push completed!
echo ========================================
echo.
echo Repository: https://github.com/NYCTEAM/eagle_chat
echo.
pause
