const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Bot = require('../models/Bot');
const Group = require('../models/Group');
const Message = require('../models/Message');
const crypto = require('crypto');

// 创建机器人
router.post('/', auth, async (req, res) => {
  try {
    const { name, username, description, type, commands, webhook } = req.body;
    
    if (!name || !username) {
      return res.status(400).json({ success: false, message: 'Name and username are required' });
    }

    // 检查用户名是否已存在
    const existingBot = await Bot.findByUsername(username);
    if (existingBot) {
      return res.status(400).json({ success: false, message: 'Username already taken' });
    }

    // 生成 API Token
    const token = crypto.randomBytes(32).toString('hex');

    const bot = new Bot({
      name,
      username: username.toLowerCase(),
      description: description || '',
      type: type || 'custom',
      creator: req.user.address,
      token,
      commands: commands || [],
      webhook: webhook || {}
    });

    await bot.save();

    res.json({
      success: true,
      message: 'Bot created successfully',
      bot: {
        id: bot._id,
        name: bot.name,
        username: bot.username,
        token: bot.token,
        description: bot.description,
        type: bot.type
      }
    });
  } catch (error) {
    console.error('Create bot error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 获取用户的机器人列表
router.get('/my', auth, async (req, res) => {
  try {
    const bots = await Bot.find({ creator: req.user.address, isActive: true })
      .select('-token')
      .sort({ createdAt: -1 });

    res.json({ success: true, bots });
  } catch (error) {
    console.error('Get bots error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 搜索机器人
router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query must be at least 2 characters' 
      });
    }

    const bots = await Bot.searchBots(query, 20);

    res.json({
      success: true,
      bots: bots.map(bot => ({
        id: bot._id,
        name: bot.name,
        username: bot.username,
        avatar: bot.avatar,
        description: bot.description,
        type: bot.type,
        isVerified: bot.isVerified,
        stats: bot.stats
      }))
    });
  } catch (error) {
    console.error('Search bots error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 获取机器人详情
router.get('/:botId', auth, async (req, res) => {
  try {
    const bot = await Bot.findById(req.params.botId);

    if (!bot) {
      return res.status(404).json({ success: false, message: 'Bot not found' });
    }

    res.json({
      success: true,
      bot: {
        id: bot._id,
        name: bot.name,
        username: bot.username,
        avatar: bot.avatar,
        description: bot.description,
        type: bot.type,
        commands: bot.commands,
        stats: bot.stats,
        isVerified: bot.isVerified,
        createdAt: bot.createdAt
      }
    });
  } catch (error) {
    console.error('Get bot details error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 更新机器人信息
router.put('/:botId', auth, async (req, res) => {
  try {
    const { name, description, avatar, commands, webhook } = req.body;
    const bot = await Bot.findById(req.params.botId);

    if (!bot) {
      return res.status(404).json({ success: false, message: 'Bot not found' });
    }

    if (bot.creator !== req.user.address) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (name) bot.name = name;
    if (description !== undefined) bot.description = description;
    if (avatar) bot.avatar = avatar;
    if (commands) bot.commands = commands;
    if (webhook) bot.webhook = { ...bot.webhook, ...webhook };

    await bot.save();

    res.json({ success: true, message: 'Bot updated', bot });
  } catch (error) {
    console.error('Update bot error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 删除机器人
router.delete('/:botId', auth, async (req, res) => {
  try {
    const bot = await Bot.findById(req.params.botId);

    if (!bot) {
      return res.status(404).json({ success: false, message: 'Bot not found' });
    }

    if (bot.creator !== req.user.address) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    bot.isActive = false;
    await bot.save();

    res.json({ success: true, message: 'Bot deleted' });
  } catch (error) {
    console.error('Delete bot error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 重置 Token
router.post('/:botId/reset-token', auth, async (req, res) => {
  try {
    const bot = await Bot.findById(req.params.botId);

    if (!bot) {
      return res.status(404).json({ success: false, message: 'Bot not found' });
    }

    if (bot.creator !== req.user.address) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const newToken = bot.generateToken();
    await bot.save();

    res.json({ success: true, message: 'Token reset', token: newToken });
  } catch (error) {
    console.error('Reset token error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 添加机器人到群组
router.post('/:botId/groups/:groupId', auth, async (req, res) => {
  try {
    const bot = await Bot.findById(req.params.botId);
    const group = await Group.findById(req.params.groupId);

    if (!bot) {
      return res.status(404).json({ success: false, message: 'Bot not found' });
    }

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // 检查用户是否为群管理员
    if (!group.admins.includes(req.user.address) && group.creator !== req.user.address) {
      return res.status(403).json({ success: false, message: 'Only admins can add bots' });
    }

    // 添加机器人到群组
    if (!bot.groups.includes(group._id)) {
      bot.groups.push(group._id);
      bot.stats.totalGroups += 1;
      await bot.save();
    }

    res.json({ success: true, message: 'Bot added to group' });
  } catch (error) {
    console.error('Add bot to group error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 从群组移除机器人
router.delete('/:botId/groups/:groupId', auth, async (req, res) => {
  try {
    const bot = await Bot.findById(req.params.botId);
    const group = await Group.findById(req.params.groupId);

    if (!bot) {
      return res.status(404).json({ success: false, message: 'Bot not found' });
    }

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // 检查用户是否为群管理员
    if (!group.admins.includes(req.user.address) && group.creator !== req.user.address) {
      return res.status(403).json({ success: false, message: 'Only admins can remove bots' });
    }

    bot.groups = bot.groups.filter(g => g.toString() !== group._id.toString());
    bot.stats.totalGroups = bot.groups.length;
    await bot.save();

    res.json({ success: true, message: 'Bot removed from group' });
  } catch (error) {
    console.error('Remove bot from group error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ Bot API（供机器人调用）============

// Bot 认证中间件
const botAuth = async (req, res, next) => {
  try {
    const token = req.headers['x-bot-token'] || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Bot token required' });
    }

    const bot = await Bot.findByToken(token);
    
    if (!bot) {
      return res.status(401).json({ success: false, message: 'Invalid bot token' });
    }

    req.bot = bot;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Authentication error' });
  }
};

// 发送消息（Bot API）
router.post('/api/send-message', botAuth, async (req, res) => {
  try {
    const { groupId, to, content, type = 'text' } = req.body;

    if (!req.bot.permissions.canSendMessages) {
      return res.status(403).json({ success: false, message: 'Bot does not have permission to send messages' });
    }

    const message = new Message({
      from: req.bot.username,
      to: to || null,
      groupId: groupId || null,
      type,
      content,
      isBot: true,
      botId: req.bot._id
    });

    await message.save();

    // 更新统计
    req.bot.incrementStats('totalMessages');

    // TODO: 通过 Socket.IO 发送消息通知

    res.json({ success: true, message: 'Message sent', messageId: message._id });
  } catch (error) {
    console.error('Bot send message error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 获取群组信息（Bot API）
router.get('/api/groups/:groupId', botAuth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // 检查机器人是否在该群组
    if (!req.bot.groups.includes(group._id)) {
      return res.status(403).json({ success: false, message: 'Bot is not in this group' });
    }

    res.json({
      success: true,
      group: {
        id: group._id,
        name: group.name,
        description: group.description,
        memberCount: group.members.length
      }
    });
  } catch (error) {
    console.error('Bot get group error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
