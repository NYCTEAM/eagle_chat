# 🚀 Eagle Chat 部署方法大全

## 📋 四种部署方式

### 方式1: 本地一键部署（最简单）⭐

**适合**: 所有用户，从本地电脑直接部署

```bash
# Linux/Mac
chmod +x deploy-via-ssh.sh
./deploy-via-ssh.sh

# Windows
one-click-deploy.bat
```

**特点**:
- ✅ 本地执行，自动SSH连接
- ✅ 使用EOF heredoc传输命令
- ✅ 自动拉取代码并部署
- ✅ 完整的状态验证

---

### 方式2: SSH登录后执行（推荐）⭐

**适合**: 已经SSH登录到服务器的用户

```bash
# 1. SSH登录服务器
ssh root@72.80.150.12

# 2. 下载并执行部署脚本
curl -O https://raw.githubusercontent.com/NYCTEAM/eagle_chat/main/deploy-remote.sh
chmod +x deploy-remote.sh
./deploy-remote.sh
```

**或者直接执行**:

```bash
ssh root@72.80.150.12
bash <(curl -s https://raw.githubusercontent.com/NYCTEAM/eagle_chat/main/deploy-remote.sh)
```

**特点**:
- ✅ 在服务器上直接执行
- ✅ 无需本地配置
- ✅ 适合已登录SSH的场景

---

### 方式3: 快速部署（高级用户）

**适合**: 已配置SSH密钥的用户

```bash
chmod +x quick-deploy.sh
./quick-deploy.sh
```

**特点**:
- ✅ 极简命令
- ✅ 无需密码
- ✅ 快速更新

---

### 方式4: 完整一键部署（详细版）

**适合**: 需要详细日志和验证的用户

```bash
chmod +x one-click-deploy.sh
./one-click-deploy.sh
```

**特点**:
- ✅ 详细的步骤说明
- ✅ 完整的错误检查
- ✅ 服务状态验证
- ✅ 磁盘空间检查

---

## 🔧 脚本对比

| 脚本 | 执行位置 | SSH方式 | 详细程度 | 适合人群 |
|------|---------|---------|----------|----------|
| `deploy-via-ssh.sh` | 本地 | EOF heredoc | 中等 | 所有用户 ⭐ |
| `deploy-remote.sh` | 服务器 | 已登录 | 中等 | 已SSH登录 ⭐ |
| `quick-deploy.sh` | 本地 | SSH密钥 | 简洁 | 高级用户 |
| `one-click-deploy.sh` | 本地 | 密码/密钥 | 详细 | 新手用户 |

---

## 📝 使用场景

### 场景1: 首次部署

```bash
# 推荐使用 deploy-via-ssh.sh
chmod +x deploy-via-ssh.sh
./deploy-via-ssh.sh
```

### 场景2: 已经SSH登录

```bash
# 在服务器上执行
curl -O https://raw.githubusercontent.com/NYCTEAM/eagle_chat/main/deploy-remote.sh
chmod +x deploy-remote.sh
./deploy-remote.sh
```

### 场景3: 快速更新

```bash
# 使用快速部署
./quick-deploy.sh
```

### 场景4: 需要详细日志

```bash
# 使用完整版
./one-click-deploy.sh 2>&1 | tee deploy.log
```

---

## 🔍 EOF Heredoc 方式详解

### 什么是 EOF Heredoc？

EOF (End Of File) heredoc 是一种在脚本中嵌入多行文本的方式，常用于SSH远程执行。

### 基本语法

```bash
ssh user@server << 'EOF'
# 这里的命令会在远程服务器执行
command1
command2
EOF
```

### 优势

1. **无需上传文件** - 直接传输命令
2. **一次性执行** - 所有命令打包执行
3. **变量隔离** - 使用 `'EOF'` 避免本地变量替换

### 示例：deploy-via-ssh.sh

```bash
#!/bin/bash

SERVER="root@72.80.150.12"

ssh $SERVER << 'EOF'
# 以下命令在服务器上执行

cd /opt/eagle_chat
git pull origin main
./deploy-to-large-disk.sh

echo "部署完成！"
EOF

echo "本地脚本执行完成"
```

---

## 🚀 快速开始指南

### 最简单的方式（3步）

```bash
# 1. 克隆项目
git clone https://github.com/NYCTEAM/eagle_chat.git
cd eagle_chat

# 2. 选择一个脚本
chmod +x deploy-via-ssh.sh

# 3. 执行部署
./deploy-via-ssh.sh
```

### 已SSH登录的方式（1步）

```bash
# 在服务器上直接执行
bash <(curl -s https://raw.githubusercontent.com/NYCTEAM/eagle_chat/main/deploy-remote.sh)
```

---

## 📊 部署流程

所有脚本的基本流程：

```
1. 检查/克隆代码
   ├─ 已存在: git pull
   └─ 不存在: git clone
   
2. 检查大硬盘
   └─ 显示可用空间
   
3. 执行部署脚本
   ├─ 安装依赖
   ├─ 配置MongoDB
   ├─ 构建Web前端
   ├─ 配置PM2
   └─ 配置Nginx
   
4. 验证部署
   ├─ PM2服务
   ├─ Web前端
   ├─ Nginx
   └─ MongoDB
```

---

## 🔐 SSH配置建议

### 配置SSH密钥（推荐）

```bash
# 1. 生成密钥
ssh-keygen -t rsa -b 4096

# 2. 复制到服务器
ssh-copy-id root@72.80.150.12

# 3. 测试连接
ssh root@72.80.150.12
```

配置后可使用快速部署脚本。

---

## 🛠️ 自定义部署

### 修改服务器地址

编辑脚本中的 `SERVER` 变量：

```bash
# deploy-via-ssh.sh
SERVER="your-user@your-server-ip"
```

### 修改部署目录

编辑脚本中的 `DEPLOY_DIR` 变量：

```bash
DEPLOY_DIR="/your/custom/path"
```

---

## 📞 获取帮助

### 查看脚本内容

```bash
cat deploy-via-ssh.sh
cat deploy-remote.sh
```

### 调试模式

```bash
# 添加 -x 参数查看详细执行过程
bash -x deploy-via-ssh.sh
```

---

## 🎉 总结

**推荐使用**:

1. **本地部署**: `deploy-via-ssh.sh` (EOF方式)
2. **服务器部署**: `deploy-remote.sh` (已登录SSH)
3. **快速更新**: `quick-deploy.sh` (有SSH密钥)

选择最适合您的方式！🚀
