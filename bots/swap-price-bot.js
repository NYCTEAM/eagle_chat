/**
 * Eagle Chat SWAP 报价机器人示例
 * 
 * 功能：
 * - 实时获取代币价格
 * - 响应 /price 命令
 * - 自动推送价格提醒
 * - 显示交易对信息
 */

const axios = require('axios');

class SwapPriceBot {
  constructor(config) {
    this.botToken = config.botToken;
    this.apiUrl = config.apiUrl || 'http://localhost:4000';
    this.priceApiUrl = config.priceApiUrl || 'https://api.coingecko.com/api/v3';
    this.updateInterval = config.updateInterval || 60000; // 1 分钟
    this.priceAlerts = new Map(); // 价格提醒
  }

  /**
   * 启动机器人
   */
  async start() {
    console.log('🤖 SWAP Price Bot starting...');
    
    // 注册命令
    await this.registerCommands();
    
    // 启动价格监控
    this.startPriceMonitoring();
    
    // 启动 Webhook 服务器（如果配置了）
    if (this.config.webhookPort) {
      this.startWebhookServer();
    }
    
    console.log('✅ SWAP Price Bot started successfully!');
  }

  /**
   * 注册机器人命令
   */
  async registerCommands() {
    const commands = [
      {
        command: '/price',
        description: '获取代币价格',
        parameters: [
          { name: 'token', type: 'string', required: true, description: '代币符号（如 ETH, BTC）' }
        ],
        example: '/price ETH'
      },
      {
        command: '/swap',
        description: '计算兑换价格',
        parameters: [
          { name: 'amount', type: 'number', required: true, description: '数量' },
          { name: 'from', type: 'string', required: true, description: '源代币' },
          { name: 'to', type: 'string', required: true, description: '目标代币' }
        ],
        example: '/swap 1 ETH USDT'
      },
      {
        command: '/alert',
        description: '设置价格提醒',
        parameters: [
          { name: 'token', type: 'string', required: true, description: '代币符号' },
          { name: 'price', type: 'number', required: true, description: '目标价格' }
        ],
        example: '/alert ETH 3000'
      },
      {
        command: '/chart',
        description: '查看价格图表',
        parameters: [
          { name: 'token', type: 'string', required: true, description: '代币符号' },
          { name: 'period', type: 'string', required: false, description: '时间周期（1h, 24h, 7d）' }
        ],
        example: '/chart ETH 24h'
      }
    ];

    // 这里应该调用 API 注册命令
    console.log('📝 Commands registered:', commands.map(c => c.command).join(', '));
  }

  /**
   * 启动价格监控
   */
  startPriceMonitoring() {
    setInterval(async () => {
      try {
        await this.checkPriceAlerts();
      } catch (error) {
        console.error('Price monitoring error:', error);
      }
    }, this.updateInterval);
  }

  /**
   * 检查价格提醒
   */
  async checkPriceAlerts() {
    for (const [token, alerts] of this.priceAlerts.entries()) {
      const price = await this.getTokenPrice(token);
      
      for (const alert of alerts) {
        if (this.shouldTriggerAlert(price, alert)) {
          await this.sendPriceAlert(alert.groupId, token, price, alert);
          // 移除已触发的提醒
          alerts.delete(alert);
        }
      }
    }
  }

  /**
   * 获取代币价格
   */
  async getTokenPrice(token) {
    try {
      const response = await axios.get(
        `${this.priceApiUrl}/simple/price`,
        {
          params: {
            ids: this.getTokenId(token),
            vs_currencies: 'usd',
            include_24hr_change: true,
            include_market_cap: true
          }
        }
      );

      const tokenId = this.getTokenId(token);
      const data = response.data[tokenId];

      return {
        price: data.usd,
        change24h: data.usd_24h_change,
        marketCap: data.usd_market_cap
      };
    } catch (error) {
      console.error('Get token price error:', error);
      throw error;
    }
  }

  /**
   * 获取代币 ID（CoinGecko）
   */
  getTokenId(symbol) {
    const tokenMap = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'USDT': 'tether',
      'BNB': 'binancecoin',
      'SOL': 'solana',
      'ADA': 'cardano',
      'DOGE': 'dogecoin',
      'MATIC': 'matic-network'
    };
    return tokenMap[symbol.toUpperCase()] || symbol.toLowerCase();
  }

  /**
   * 发送消息到群组
   */
  async sendMessage(groupId, content, type = 'text') {
    try {
      const response = await axios.post(
        `${this.apiUrl}/api/bots/api/send-message`,
        {
          groupId,
          content,
          type
        },
        {
          headers: {
            'X-Bot-Token': this.botToken
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  /**
   * 处理 /price 命令
   */
  async handlePriceCommand(groupId, token) {
    try {
      const priceData = await this.getTokenPrice(token);
      
      const changeEmoji = priceData.change24h >= 0 ? '📈' : '📉';
      const changeColor = priceData.change24h >= 0 ? '🟢' : '🔴';
      
      const message = `
${changeEmoji} **${token.toUpperCase()} 价格**

💰 当前价格: $${priceData.price.toLocaleString()}
${changeColor} 24h 涨跌: ${priceData.change24h.toFixed(2)}%
📊 市值: $${(priceData.marketCap / 1e9).toFixed(2)}B

⏰ 更新时间: ${new Date().toLocaleString()}
      `.trim();

      await this.sendMessage(groupId, message);
    } catch (error) {
      await this.sendMessage(groupId, `❌ 获取 ${token} 价格失败，请稍后重试`);
    }
  }

  /**
   * 处理 /swap 命令
   */
  async handleSwapCommand(groupId, amount, fromToken, toToken) {
    try {
      const fromPrice = await this.getTokenPrice(fromToken);
      const toPrice = await this.getTokenPrice(toToken);
      
      const result = (amount * fromPrice.price) / toPrice.price;
      
      const message = `
🔄 **兑换计算**

${amount} ${fromToken.toUpperCase()} ≈ ${result.toFixed(6)} ${toToken.toUpperCase()}

📊 汇率:
• ${fromToken.toUpperCase()}: $${fromPrice.price.toLocaleString()}
• ${toToken.toUpperCase()}: $${toPrice.price.toLocaleString()}

⚠️ 实际兑换价格可能因滑点而有所不同
      `.trim();

      await this.sendMessage(groupId, message);
    } catch (error) {
      await this.sendMessage(groupId, `❌ 计算兑换失败，请检查代币符号`);
    }
  }

  /**
   * 处理 /alert 命令
   */
  async handleAlertCommand(groupId, userId, token, targetPrice) {
    try {
      if (!this.priceAlerts.has(token)) {
        this.priceAlerts.set(token, new Set());
      }

      this.priceAlerts.get(token).add({
        groupId,
        userId,
        targetPrice,
        createdAt: Date.now()
      });

      const currentPrice = await this.getTokenPrice(token);

      const message = `
✅ **价格提醒已设置**

代币: ${token.toUpperCase()}
目标价格: $${targetPrice.toLocaleString()}
当前价格: $${currentPrice.price.toLocaleString()}

当价格达到目标时，我会通知你！
      `.trim();

      await this.sendMessage(groupId, message);
    } catch (error) {
      await this.sendMessage(groupId, `❌ 设置价格提醒失败`);
    }
  }

  /**
   * 发送价格提醒
   */
  async sendPriceAlert(groupId, token, priceData, alert) {
    const message = `
🔔 **价格提醒触发**

${token.toUpperCase()} 已达到目标价格！

💰 当前价格: $${priceData.price.toLocaleString()}
🎯 目标价格: $${alert.targetPrice.toLocaleString()}
📈 24h 涨跌: ${priceData.change24h.toFixed(2)}%

⏰ ${new Date().toLocaleString()}
    `.trim();

    await this.sendMessage(groupId, message);
  }

  /**
   * 判断是否触发提醒
   */
  shouldTriggerAlert(currentPrice, alert) {
    return currentPrice.price >= alert.targetPrice;
  }

  /**
   * 启动 Webhook 服务器
   */
  startWebhookServer() {
    const express = require('express');
    const app = express();
    
    app.use(express.json());

    // 接收消息 Webhook
    app.post('/webhook', async (req, res) => {
      const { message, groupId, userId } = req.body;

      // 处理命令
      if (message.startsWith('/')) {
        await this.handleCommand(groupId, userId, message);
      }

      res.json({ success: true });
    });

    app.listen(this.config.webhookPort, () => {
      console.log(`🌐 Webhook server listening on port ${this.config.webhookPort}`);
    });
  }

  /**
   * 处理命令
   */
  async handleCommand(groupId, userId, message) {
    const parts = message.split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    switch (command) {
      case '/price':
        if (args.length > 0) {
          await this.handlePriceCommand(groupId, args[0]);
        }
        break;

      case '/swap':
        if (args.length >= 3) {
          await this.handleSwapCommand(groupId, parseFloat(args[0]), args[1], args[2]);
        }
        break;

      case '/alert':
        if (args.length >= 2) {
          await this.handleAlertCommand(groupId, userId, args[0], parseFloat(args[1]));
        }
        break;

      case '/help':
        await this.sendHelpMessage(groupId);
        break;

      default:
        await this.sendMessage(groupId, `❓ 未知命令: ${command}\n输入 /help 查看可用命令`);
    }
  }

  /**
   * 发送帮助消息
   */
  async sendHelpMessage(groupId) {
    const message = `
🤖 **SWAP 报价机器人帮助**

📊 **可用命令:**

/price <代币> - 查询代币价格
例: /price ETH

/swap <数量> <源代币> <目标代币> - 计算兑换
例: /swap 1 ETH USDT

/alert <代币> <价格> - 设置价格提醒
例: /alert BTC 50000

/chart <代币> [周期] - 查看价格图表
例: /chart ETH 24h

/help - 显示此帮助信息

💡 提示: 所有代币符号不区分大小写
    `.trim();

    await this.sendMessage(groupId, message);
  }
}

// 导出
module.exports = SwapPriceBot;

// 如果直接运行
if (require.main === module) {
  const config = {
    botToken: process.env.BOT_TOKEN || 'your-bot-token-here',
    apiUrl: process.env.API_URL || 'http://localhost:4000',
    priceApiUrl: 'https://api.coingecko.com/api/v3',
    updateInterval: 60000,
    webhookPort: 3001
  };

  const bot = new SwapPriceBot(config);
  bot.start().catch(console.error);
}
