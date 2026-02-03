# 🎥 Eagle Chat - 完整的视频/语音通话系统

## 📋 功能概览

### ✅ 已实现功能

#### 1. 一对一通话
- ✅ 视频通话
- ✅ 语音通话
- ✅ 实时音视频传输
- ✅ 通话控制（静音、关闭摄像头）
- ✅ 屏幕共享
- ✅ 通话时长显示

#### 2. 群组通话
- ✅ 群视频通话
- ✅ 群语音通话
- ✅ 多人同时在线
- ✅ 参与者列表
- ✅ 实时参与者计数

#### 3. 通话控制
- ✅ 静音/取消静音
- ✅ 开关摄像头
- ✅ 屏幕共享
- ✅ 全屏模式
- ✅ 挂断通话

#### 4. 通话历史
- ✅ 通话记录
- ✅ 通话时长
- ✅ 未接来电标记
- ✅ 快速回拨

---

## 🏗️ 技术架构

### 核心技术栈

```
┌─────────────────────────────────────┐
│         前端 (React)                │
│  ┌─────────────────────────────┐   │
│  │   JitsiMeeting 组件         │   │
│  │   - Jitsi Meet External API │   │
│  │   - WebRTC                  │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│      Jitsi Meet 服务器              │
│  - meet.jit.si (公共服务器)         │
│  - 或自建 Jitsi 服务器              │
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│         后端 (Node.js)              │
│  - 会议创建 API                     │
│  - 通话历史记录                     │
│  - Socket.IO 通知                   │
└─────────────────────────────────────┘
```

### 为什么选择 Jitsi Meet？

✅ **开源免费** - 完全开源，无需付费
✅ **功能完整** - 支持视频、音频、屏幕共享
✅ **易于集成** - 提供 External API
✅ **高质量** - 企业级音视频质量
✅ **可自建** - 可部署自己的服务器
✅ **无需账号** - 用户无需注册

---

## 🎯 组件说明

### 1. JitsiMeeting 组件

**路径**: `web/src/components/JitsiMeeting.jsx`

**功能**：
- 集成 Jitsi Meet 视频会议
- 支持音频/视频模式切换
- 参与者管理
- 通话控制

**使用方法**：
```jsx
import JitsiMeeting from './components/JitsiMeeting';

<JitsiMeeting
  roomName="unique-room-id"
  displayName="User Name"
  isAudioOnly={false}
  participants={[]}
  onClose={() => console.log('Meeting closed')}
  onParticipantJoined={(p) => console.log('Joined:', p)}
  onParticipantLeft={(p) => console.log('Left:', p)}
/>
```

**Props**：
- `roomName` - 房间 ID（唯一）
- `displayName` - 显示名称
- `isAudioOnly` - 是否仅音频
- `participants` - 参与者列表
- `onClose` - 关闭回调
- `onParticipantJoined` - 参与者加入回调
- `onParticipantLeft` - 参与者离开回调

### 2. GroupCall 组件

**路径**: `web/src/components/GroupCall.jsx`

**功能**：
- 发起群组通话
- 选择通话类型（视频/语音）
- 通知群成员
- 创建会议记录

**使用方法**：
```jsx
import GroupCall from './components/GroupCall';

<GroupCall
  group={selectedGroup}
  onClose={() => setShowCall(false)}
/>
```

### 3. CallHistory 组件

**路径**: `web/src/components/CallHistory.jsx`

**功能**：
- 显示通话历史
- 筛选通话记录
- 快速回拨
- 通话详情

**使用方法**：
```jsx
import CallHistory from './components/CallHistory';

<CallHistory
  onStartCall={(call) => {
    // 发起新通话
  }}
/>
```

---

## 📱 使用场景

### 场景 1: 一对一视频通话

```
用户 A                        用户 B
  │                             │
  │  点击视频图标                │
  ├──────────────────────────>  │
  │                             │
  │  发送通话请求                │
  │  (Socket.IO)                │
  ├──────────────────────────>  │
  │                             │
  │                             │  收到来电提示
  │                             │  点击接听
  │  <──────────────────────────┤
  │                             │
  │  建立 WebRTC 连接            │
  │  <──────────────────────────>
  │                             │
  │  开始视频通话                │
  │  <══════════════════════════>
```

### 场景 2: 群组视频会议

```
群主                  成员 A              成员 B
  │                     │                   │
  │  发起群视频通话      │                   │
  ├─────────────────>   │                   │
  │                     │                   │
  │  发送通知            │                   │
  ├─────────────────────┼─────────────────> │
  │                     │                   │
  │                     │  收到通知          │
  │                     │  点击加入          │
  │  <─────────────────┤                   │
  │                     │                   │
  │                     │                   │  收到通知
  │                     │                   │  点击加入
  │  <─────────────────────────────────────┤
  │                     │                   │
  │  多人视频会议        │                   │
  │  <═════════════════════════════════════>
```

---

## 🔧 API 接口

### 会议管理

```http
# 创建会议
POST /api/meetings
Body: {
  title: string,
  groupId?: string,
  type: 'video' | 'audio',
  participants: string[],
  scheduledAt: Date
}

Response: {
  success: true,
  meeting: {
    _id: string,
    roomId: string,
    title: string,
    host: string,
    participants: string[],
    status: 'scheduled' | 'ongoing' | 'ended'
  }
}
```

```http
# 获取会议列表
GET /api/meetings

Response: {
  success: true,
  meetings: Meeting[]
}
```

```http
# 开始会议
POST /api/meetings/:meetingId/start

Response: {
  success: true,
  meeting: {
    roomId: string,
    jitsiUrl: string
  }
}
```

```http
# 结束会议
POST /api/meetings/:meetingId/end

Response: {
  success: true,
  message: 'Meeting ended'
}
```

### 通话历史

```http
# 获取通话历史
GET /api/calls/history

Response: {
  success: true,
  calls: [
    {
      _id: string,
      type: 'video' | 'audio',
      direction: 'incoming' | 'outgoing',
      status: 'completed' | 'missed' | 'rejected',
      participantName: string,
      participantAddress: string,
      isGroup: boolean,
      groupName?: string,
      startedAt: Date,
      endedAt?: Date,
      duration?: number
    }
  ]
}
```

```http
# 创建通话记录
POST /api/calls

Body: {
  type: 'video' | 'audio',
  to: string,
  groupId?: string
}
```

---

## 🎨 UI 设计

### 一对一通话界面

```
┌─────────────────────────────────────┐
│  [返回]  视频通话  [最小化]          │
├─────────────────────────────────────┤
│                                     │
│                                     │
│         [对方视频画面]               │
│                                     │
│                                     │
│                                     │
│         ┌─────────────┐             │
│         │  [本地视频]  │             │
│         └─────────────┘             │
│                                     │
├─────────────────────────────────────┤
│   [🎤]  [📹]  [🖥️]  [☎️挂断]        │
└─────────────────────────────────────┘
```

### 群组通话界面

```
┌─────────────────────────────────────┐
│  群视频通话  👥 5 人                 │
├─────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐      │
│  │ 用户1 │  │ 用户2 │  │ 用户3 │      │
│  └──────┘  └──────┘  └──────┘      │
│  ┌──────┐  ┌──────┐                │
│  │ 用户4 │  │ 用户5 │                │
│  └──────┘  └──────┘                │
│                                     │
├─────────────────────────────────────┤
│   [🎤]  [📹]  [🖥️]  [👥]  [☎️]      │
└─────────────────────────────────────┘
```

### 通话历史界面

```
┌─────────────────────────────────────┐
│  全部  未接  呼入  呼出              │
├─────────────────────────────────────┤
│  ↗️ 张三                   📹 ☎️     │
│     今天 14:30  •  5:23             │
├─────────────────────────────────────┤
│  ↙️ 李四                   📹 ☎️     │
│     今天 12:15  •  未接              │
├─────────────────────────────────────┤
│  👥 Crypto 群                📹 ☎️   │
│     昨天 20:00  •  1:15:30          │
└─────────────────────────────────────┘
```

---

## 🚀 部署配置

### 1. 使用公共 Jitsi 服务器（推荐快速开始）

**优点**：
- ✅ 无需配置
- ✅ 立即可用
- ✅ 免费使用

**缺点**：
- ⚠️ 依赖第三方服务
- ⚠️ 可能有使用限制

**配置**：
```javascript
// 已在 JitsiMeeting 组件中配置
const domain = 'meet.jit.si';
```

### 2. 自建 Jitsi 服务器（推荐生产环境）

**优点**：
- ✅ 完全控制
- ✅ 无使用限制
- ✅ 数据隐私
- ✅ 自定义品牌

**部署步骤**：

```bash
# 1. 准备服务器（Ubuntu 20.04+）
# 需要：2 核 CPU, 4GB RAM, 公网 IP

# 2. 安装 Jitsi Meet
sudo apt update
sudo apt install -y apt-transport-https
sudo curl https://download.jitsi.org/jitsi-key.gpg.key | sudo sh -c 'gpg --dearmor > /usr/share/keyrings/jitsi-keyring.gpg'
echo 'deb [signed-by=/usr/share/keyrings/jitsi-keyring.gpg] https://download.jitsi.org stable/' | sudo tee /etc/apt/sources.list.d/jitsi-stable.list > /dev/null
sudo apt update
sudo apt install -y jitsi-meet

# 3. 配置域名
# 在安装过程中输入您的域名，如：meet.eagleswap.io

# 4. 配置 SSL 证书
sudo /usr/share/jitsi-meet/scripts/install-letsencrypt-cert.sh

# 5. 配置防火墙
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 10000/udp
sudo ufw allow 22/tcp
sudo ufw enable
```

**更新前端配置**：
```javascript
// 修改 JitsiMeeting.jsx
const domain = 'meet.eagleswap.io'; // 您的域名
```

### 3. Nginx 配置（如果使用自建服务器）

```nginx
# /etc/nginx/sites-available/meet.eagleswap.io
server {
    listen 80;
    listen [::]:80;
    server_name meet.eagleswap.io;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /xmpp-websocket {
        proxy_pass http://localhost:5280/xmpp-websocket;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## 📊 性能优化

### 1. 带宽优化

```javascript
// 配置视频质量
configOverwrite: {
  resolution: 720,
  constraints: {
    video: {
      height: { ideal: 720, max: 1080, min: 360 }
    }
  }
}
```

### 2. 服务器优化

```bash
# 增加 Jitsi 服务器性能
sudo nano /etc/jitsi/videobridge/sip-communicator.properties

# 添加配置
org.jitsi.videobridge.ENABLE_STATISTICS=true
org.jitsi.videobridge.STATISTICS_INTERVAL=5000
```

### 3. 网络优化

- 使用 CDN 加速
- 启用 TURN 服务器
- 配置 STUN 服务器

---

## 🔒 安全配置

### 1. 启用房间密码

```javascript
// 在创建会议时设置密码
const options = {
  roomName: roomName,
  configOverwrite: {
    requireDisplayName: true,
    enableLobbyChat: false
  }
};
```

### 2. 限制参与者

```javascript
// 只允许认证用户加入
configOverwrite: {
  enableUserRolesBasedOnToken: true
}
```

### 3. 端到端加密

```javascript
configOverwrite: {
  e2eping: {
    enabled: true
  }
}
```

---

## 🧪 测试清单

### 一对一通话测试
- [ ] 发起视频通话
- [ ] 发起语音通话
- [ ] 接听来电
- [ ] 拒绝来电
- [ ] 静音/取消静音
- [ ] 开关摄像头
- [ ] 屏幕共享
- [ ] 挂断通话
- [ ] 通话时长显示

### 群组通话测试
- [ ] 发起群视频通话
- [ ] 发起群语音通话
- [ ] 多人同时加入
- [ ] 参与者列表显示
- [ ] 参与者加入/离开通知
- [ ] 群通话控制

### 通话历史测试
- [ ] 查看通话记录
- [ ] 筛选通话类型
- [ ] 快速回拨
- [ ] 通话详情显示

---

## 📝 使用教程

### 发起一对一视频通话

1. 打开好友聊天窗口
2. 点击右上角的 📹 视频图标
3. 等待对方接听
4. 开始视频通话

### 发起群组视频会议

1. 进入群聊
2. 点击右上角的 📹 视频图标
3. 选择"视频通话"或"语音通话"
4. 群成员会收到通知
5. 点击通知加入会议

### 查看通话历史

1. 在聊天页面点击"通话"标签
2. 查看所有通话记录
3. 点击记录可快速回拨

---

## 🔮 未来计划

### 短期（1个月）
- [ ] 通话录制
- [ ] 虚拟背景
- [ ] 美颜滤镜
- [ ] 通话质量统计

### 中期（3个月）
- [ ] AI 降噪
- [ ] 实时字幕
- [ ] 多语言翻译
- [ ] 表情反应

### 长期（6个月）
- [ ] AR 特效
- [ ] 虚拟形象
- [ ] 空间音频
- [ ] 元宇宙会议室

---

## 💡 常见问题

### Q: 为什么看不到对方视频？
A: 检查以下几点：
1. 确保浏览器允许摄像头权限
2. 检查网络连接
3. 尝试刷新页面
4. 检查防火墙设置

### Q: 音频有回音怎么办？
A: 
1. 使用耳机
2. 降低扬声器音量
3. 启用回音消除

### Q: 如何提高视频质量？
A:
1. 使用有线网络
2. 关闭其他占用带宽的应用
3. 降低视频分辨率

### Q: 群通话最多支持多少人？
A:
- 使用公共服务器：约 75 人
- 自建服务器：取决于服务器配置

---

## 📞 技术支持

遇到问题？

1. 查看浏览器控制台错误
2. 检查麦克风/摄像头权限
3. 测试网络连接：https://test.webrtc.org/
4. 查看 Jitsi 日志：`/var/log/jitsi/`

---

**版本**: v3.0.0 - Video/Audio Calls Edition  
**更新时间**: 2026-02-03  
**技术栈**: React + Jitsi Meet + WebRTC
