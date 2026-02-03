# 🤖 Eagle Chat 机器人开发指南

## 📋 目录

1. [简介](#简介)
2. [快速开始](#快速开始)
3. [创建机器人](#创建机器人)
4. [Bot API](#bot-api)
5. [命令系统](#命令系统)
6. [Webhook](#webhook)
7. [示例机器人](#示例机器人)
8. [最佳实践](#最佳实践)

---

## 📖 简介

Eagle Chat 机器人系统允许开发者创建自定义机器人，为群组和用户提供自动化服务。

### 机器人能做什么？

- ✅ 发送消息到群组或用户
- ✅ 响应用户命令
- ✅ 接收 Webhook 通知
- ✅ 获取群组信息
- ✅ 自动化任务
- ✅ 集成第三方服务

### 机器人类型

- **服务机器人** - 提供实用工具（天气、翻译等）
- **交易机器人** - 加密货币价格、交易提醒
- **通知机器人** - 推送通知、提醒
- **游戏机器人** - 互动游戏
- **工具机器人** - 自定义功能

---

## 🚀 快速开始

### 1. 创建机器人

```bash
# 通过 API 创建机器人
curl -X POST http://localhost:4000/api/bots \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SWAP Price Bot",
    "username": "swap_price_bot",
    "description": "实时加密货币价格查询",
    "type": "trading"
  }'
```

**响应**：
```json
{
  "success": true,
  "bot": {
    "id": "bot_123456",
    "name": "SWAP Price Bot",
    "username": "swap_price_bot",
    "token": "abc123def456...",
    "type": "trading"
  }
}
```

⚠️ **重要**: 保存好 `token`，这是机器人的 API 密钥！

### 2. 发送第一条消息

```javascript
const axios = require('axios');

const BOT_TOKEN = 'your-bot-token';
const API_URL = 'http://localhost:4000';

async function sendMessage(groupId, content) {
  const response = await axios.post(
    `${API_URL}/api/bots/api/send-message`,
    {
      groupId: groupId,
      content: content,
      type: 'text'
    },
    {
      headers: {
        'X-Bot-Token': BOT_TOKEN
      }
    }
  );
  
  return response.data;
}

// 使用
sendMessage('group_id_here', 'Hello from bot! 🤖');
```

### 3. 添加机器人到群组

```bash
# 群管理员可以添加机器人
curl -X POST http://localhost:4000/api/bots/bot_123456/groups/group_789 \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 🔧 创建机器人

### 通过 Web 界面创建

1. 登录 Eagle Chat
2. 进入"设置" -> "机器人"
3. 点击"创建新机器人"
4. 填写机器人信息
5. 保存并获取 Token

### 通过 API 创建

```http
POST /api/bots
Authorization: Bearer {user_token}
Content-Type: application/json

{
  "name": "My Bot",
  "username": "my_bot",
  "description": "My awesome bot",
  "type": "custom",
  "commands": [
    {
      "command": "/start",
      "description": "开始使用机器人",
      "example": "/start"
    }
  ],
  "webhook": {
    "url": "https://your-server.com/webhook",
    "secret": "your-webhook-secret",
    "enabled": true
  }
}
```

### 机器人配置

```javascript
{
  name: string,              // 机器人名称
  username: string,          // 唯一用户名（小写字母、数字、下划线）
  avatar: string,            // 头像 URL
  description: string,       // 描述
  type: string,              // 类型：service, trading, notification, game, utility, custom
  commands: Array,           // 支持的命令列表
  webhook: {
    url: string,             // Webhook URL
    secret: string,          // Webhook 密钥
    enabled: boolean         // 是否启用
  },
  permissions: {
    canSendMessages: boolean,      // 可以发送消息
    canReadMessages: boolean,      // 可以读取消息
    canManageGroups: boolean,      // 可以管理群组
    canAccessUserInfo: boolean     // 可以访问用户信息
  }
}
```

---

## 📡 Bot API

### 认证

所有 Bot API 请求都需要在 Header 中包含 Bot Token：

```
X-Bot-Token: your-bot-token
```

或

```
Authorization: Bearer your-bot-token
```

### 发送消息

```http
POST /api/bots/api/send-message
X-Bot-Token: {bot_token}
Content-Type: application/json

{
  "groupId": "group_id",     // 群组 ID（群消息）
  "to": "user_address",      // 用户地址（私聊）
  "content": "Hello!",       // 消息内容
  "type": "text"             // 消息类型：text, image, file, etc.
}
```

**消息类型**：
- `text` - 文本消息
- `image` - 图片
- `file` - 文件
- `video` - 视频
- `audio` - 音频
- `card` - 卡片消息（富文本）

### 获取群组信息

```http
GET /api/bots/api/groups/{groupId}
X-Bot-Token: {bot_token}
```

**响应**：
```json
{
  "success": true,
  "group": {
    "id": "group_123",
    "name": "Crypto Traders",
    "description": "...",
    "memberCount": 128
  }
}
```

### 发送卡片消息

```javascript
const card = {
  title: "ETH 价格",
  description: "以太坊实时价格",
  fields: [
    { label: "当前价格", value: "$3,245.67" },
    { label: "24h 涨跌", value: "+5.23%" },
    { label: "市值", value: "$389.2B" }
  ],
  image: "https://example.com/eth-chart.png",
  buttons: [
    { text: "查看详情", url: "https://..." },
    { text: "设置提醒", callback: "/alert ETH 3000" }
  ]
};

await sendMessage(groupId, JSON.stringify(card), 'card');
```

---

## 🎮 命令系统

### 注册命令

```javascript
const commands = [
  {
    command: '/price',
    description: '查询代币价格',
    parameters: [
      {
        name: 'token',
        type: 'string',
        required: true,
        description: '代币符号'
      }
    ],
    example: '/price ETH'
  },
  {
    command: '/swap',
    description: '计算兑换',
    parameters: [
      { name: 'amount', type: 'number', required: true },
      { name: 'from', type: 'string', required: true },
      { name: 'to', type: 'string', required: true }
    ],
    example: '/swap 1 ETH USDT'
  }
];

// 更新机器人命令
await axios.put(
  `${API_URL}/api/bots/${botId}`,
  { commands },
  { headers: { 'Authorization': `Bearer ${userToken}` } }
);
```

### 处理命令

```javascript
function parseCommand(message) {
  const parts = message.trim().split(/\s+/);
  const command = parts[0];
  const args = parts.slice(1);
  
  return { command, args };
}

async function handleCommand(groupId, userId, message) {
  const { command, args } = parseCommand(message);
  
  switch (command) {
    case '/price':
      if (args.length > 0) {
        await handlePriceCommand(groupId, args[0]);
      } else {
        await sendMessage(groupId, '❌ 用法: /price <代币符号>');
      }
      break;
      
    case '/help':
      await sendHelpMessage(groupId);
      break;
      
    default:
      await sendMessage(groupId, `❓ 未知命令: ${command}`);
  }
}
```

### 命令参数验证

```javascript
function validateCommand(command, args) {
  const commandDef = commands.find(c => c.command === command);
  
  if (!commandDef) {
    return { valid: false, error: '未知命令' };
  }
  
  const requiredParams = commandDef.parameters.filter(p => p.required);
  
  if (args.length < requiredParams.length) {
    return {
      valid: false,
      error: `缺少参数。用法: ${commandDef.example}`
    };
  }
  
  return { valid: true };
}
```

---

## 🔗 Webhook

### 配置 Webhook

```javascript
const webhookConfig = {
  url: 'https://your-server.com/webhook',
  secret: 'your-secret-key',
  enabled: true
};

await axios.put(
  `${API_URL}/api/bots/${botId}`,
  { webhook: webhookConfig },
  { headers: { 'Authorization': `Bearer ${userToken}` } }
);
```

### 接收 Webhook

```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// 验证 Webhook 签名
function verifyWebhookSignature(payload, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return hash === signature;
}

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = req.body;
  
  // 验证签名
  if (!verifyWebhookSignature(payload, signature, WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // 处理事件
  handleWebhookEvent(payload);
  
  res.json({ success: true });
});

function handleWebhookEvent(event) {
  switch (event.type) {
    case 'message':
      handleMessage(event.data);
      break;
      
    case 'command':
      handleCommand(event.data.groupId, event.data.userId, event.data.message);
      break;
      
    case 'bot_added':
      console.log('Bot added to group:', event.data.groupId);
      break;
      
    case 'bot_removed':
      console.log('Bot removed from group:', event.data.groupId);
      break;
  }
}

app.listen(3001, () => {
  console.log('Webhook server listening on port 3001');
});
```

### Webhook 事件类型

```javascript
// 新消息
{
  type: 'message',
  data: {
    messageId: 'msg_123',
    groupId: 'group_456',
    userId: '0x...',
    content: 'Hello',
    timestamp: 1234567890
  }
}

// 命令
{
  type: 'command',
  data: {
    command: '/price',
    args: ['ETH'],
    groupId: 'group_456',
    userId: '0x...'
  }
}

// 机器人被添加到群组
{
  type: 'bot_added',
  data: {
    groupId: 'group_456',
    addedBy: '0x...'
  }
}

// 机器人被移除
{
  type: 'bot_removed',
  data: {
    groupId: 'group_456',
    removedBy: '0x...'
  }
}
```

---

## 💡 示例机器人

### 1. SWAP 报价机器人

**功能**：
- 实时代币价格查询
- 兑换计算
- 价格提醒
- 价格图表

**使用**：
```bash
cd bots
npm install axios
node swap-price-bot.js
```

**命令**：
- `/price ETH` - 查询 ETH 价格
- `/swap 1 ETH USDT` - 计算兑换
- `/alert BTC 50000` - 设置价格提醒
- `/chart ETH 24h` - 查看价格图表

### 2. 欢迎机器人

```javascript
class WelcomeBot {
  async onMemberJoined(groupId, newMember) {
    const message = `
🎉 欢迎 @${newMember.nickname} 加入群组！

请阅读群规则并介绍自己。
输入 /help 查看可用命令。
    `.trim();
    
    await this.sendMessage(groupId, message);
  }
}
```

### 3. 投票机器人

```javascript
class PollBot {
  async createPoll(groupId, question, options) {
    const poll = {
      question,
      options: options.map(opt => ({ text: opt, votes: 0 })),
      voters: new Set()
    };
    
    const message = this.formatPollMessage(poll);
    await this.sendMessage(groupId, message, 'card');
  }
  
  async vote(groupId, userId, optionIndex) {
    // 处理投票逻辑
  }
}
```

### 4. 提醒机器人

```javascript
class ReminderBot {
  async setReminder(groupId, userId, time, message) {
    const reminder = {
      groupId,
      userId,
      time: new Date(time),
      message
    };
    
    this.scheduleReminder(reminder);
    
    await this.sendMessage(
      groupId,
      `✅ 提醒已设置！我会在 ${time} 提醒你。`
    );
  }
  
  scheduleReminder(reminder) {
    const delay = reminder.time - Date.now();
    setTimeout(() => {
      this.sendReminder(reminder);
    }, delay);
  }
}
```

---

## 🎯 最佳实践

### 1. 错误处理

```javascript
async function sendMessage(groupId, content) {
  try {
    const response = await axios.post(/* ... */);
    return response.data;
  } catch (error) {
    if (error.response?.status === 429) {
      // 速率限制
      console.log('Rate limited, retrying...');
      await sleep(1000);
      return sendMessage(groupId, content);
    }
    
    console.error('Send message error:', error);
    throw error;
  }
}
```

### 2. 速率限制

```javascript
class RateLimiter {
  constructor(maxRequests, timeWindow) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
  }
  
  async checkLimit() {
    const now = Date.now();
    this.requests = this.requests.filter(
      time => now - time < this.timeWindow
    );
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.timeWindow - (now - oldestRequest);
      await sleep(waitTime);
    }
    
    this.requests.push(now);
  }
}

const limiter = new RateLimiter(30, 60000); // 30 请求/分钟

async function sendMessage(groupId, content) {
  await limiter.checkLimit();
  // 发送消息...
}
```

### 3. 日志记录

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

logger.info('Bot started', { botId: bot.id });
logger.error('Command failed', { command, error: error.message });
```

### 4. 配置管理

```javascript
// config.js
module.exports = {
  botToken: process.env.BOT_TOKEN,
  apiUrl: process.env.API_URL || 'http://localhost:4000',
  webhookPort: process.env.WEBHOOK_PORT || 3001,
  webhookSecret: process.env.WEBHOOK_SECRET,
  
  // 功能开关
  features: {
    priceAlerts: true,
    autoReply: false,
    analytics: true
  },
  
  // 速率限制
  rateLimit: {
    maxRequests: 30,
    timeWindow: 60000
  }
};
```

### 5. 测试

```javascript
// test/bot.test.js
const assert = require('assert');
const SwapPriceBot = require('../bots/swap-price-bot');

describe('SwapPriceBot', () => {
  let bot;
  
  before(() => {
    bot = new SwapPriceBot({ botToken: 'test-token' });
  });
  
  it('should get token price', async () => {
    const price = await bot.getTokenPrice('ETH');
    assert(price.price > 0);
  });
  
  it('should calculate swap', async () => {
    const result = await bot.calculateSwap(1, 'ETH', 'USDT');
    assert(result > 0);
  });
});
```

---

## 📊 监控和分析

### 统计数据

```javascript
class BotAnalytics {
  async trackCommand(command, groupId, userId) {
    await this.incrementStat('totalCommands');
    await this.incrementStat(`command:${command}`);
    
    // 记录到数据库或分析服务
  }
  
  async getStats() {
    return {
      totalMessages: this.bot.stats.totalMessages,
      totalCommands: this.bot.stats.totalCommands,
      totalGroups: this.bot.stats.totalGroups,
      activeUsers: this.getActiveUsers(),
      popularCommands: this.getPopularCommands()
    };
  }
}
```

### 性能监控

```javascript
const performanceMonitor = {
  async measureTime(fn, label) {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      logger.info(`${label} completed in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error(`${label} failed after ${duration}ms`, { error });
      throw error;
    }
  }
};

// 使用
await performanceMonitor.measureTime(
  () => getTokenPrice('ETH'),
  'Get ETH price'
);
```

---

## 🔒 安全建议

1. **保护 Token**
   - 不要在代码中硬编码 Token
   - 使用环境变量
   - 定期轮换 Token

2. **验证输入**
   - 验证所有用户输入
   - 防止注入攻击
   - 限制参数长度

3. **速率限制**
   - 实施请求速率限制
   - 防止滥用

4. **Webhook 安全**
   - 验证 Webhook 签名
   - 使用 HTTPS
   - 限制来源 IP

5. **权限控制**
   - 只请求必要的权限
   - 遵循最小权限原则

---

## 📚 资源

- [API 文档](./API_DOCUMENTATION.md)
- [示例代码](./bots/)
- [常见问题](./FAQ.md)
- [社区论坛](https://forum.eagleswap.io)

---

## 🆘 获取帮助

遇到问题？

1. 查看[常见问题](./FAQ.md)
2. 加入开发者群组
3. 提交 Issue
4. 联系技术支持

---

**版本**: v1.0.0  
**更新时间**: 2026-02-03  
**作者**: Eagle Swaps Team
