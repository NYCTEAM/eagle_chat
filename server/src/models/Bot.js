const mongoose = require('mongoose');

const botSchema = new mongoose.Schema({
  // 机器人基本信息
  name: {
    type: String,
    required: true,
    maxlength: 50,
    trim: true
  },
  
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^[a-z0-9_]+$/,
    index: true
  },
  
  avatar: {
    type: String,
    default: 'https://api.dicebear.com/7.x/bottts/svg?seed=bot'
  },
  
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },
  
  // 机器人类型
  type: {
    type: String,
    enum: ['service', 'trading', 'notification', 'game', 'utility', 'custom'],
    default: 'custom'
  },
  
  // 创建者
  creator: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  
  // API Token（用于认证）
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Webhook 配置
  webhook: {
    url: {
      type: String,
      default: ''
    },
    secret: {
      type: String,
      default: ''
    },
    enabled: {
      type: Boolean,
      default: false
    }
  },
  
  // 支持的命令
  commands: [{
    command: {
      type: String,
      required: true
    },
    description: {
      type: String,
      maxlength: 200
    },
    parameters: [{
      name: String,
      type: String,
      required: Boolean,
      description: String
    }],
    example: String
  }],
  
  // 权限设置
  permissions: {
    canSendMessages: {
      type: Boolean,
      default: true
    },
    canReadMessages: {
      type: Boolean,
      default: false
    },
    canManageGroups: {
      type: Boolean,
      default: false
    },
    canAccessUserInfo: {
      type: Boolean,
      default: false
    }
  },
  
  // 使用统计
  stats: {
    totalMessages: {
      type: Number,
      default: 0
    },
    totalCommands: {
      type: Number,
      default: 0
    },
    totalGroups: {
      type: Number,
      default: 0
    },
    totalUsers: {
      type: Number,
      default: 0
    }
  },
  
  // 已添加的群组
  groups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  }],
  
  // 配置选项
  config: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // 状态
  isActive: {
    type: Boolean,
    default: true
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // 时间戳
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  lastActiveAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 索引
botSchema.index({ isActive: 1 });

// 方法：生成 API Token
botSchema.methods.generateToken = function() {
  const crypto = require('crypto');
  this.token = crypto.randomBytes(32).toString('hex');
  return this.token;
};

// 方法：验证 Token
botSchema.methods.verifyToken = function(token) {
  return this.token === token;
};

// 方法：添加命令
botSchema.methods.addCommand = function(command, description, parameters = [], example = '') {
  const existingCommand = this.commands.find(c => c.command === command);
  if (existingCommand) {
    existingCommand.description = description;
    existingCommand.parameters = parameters;
    existingCommand.example = example;
  } else {
    this.commands.push({ command, description, parameters, example });
  }
  return this.save();
};

// 方法：移除命令
botSchema.methods.removeCommand = function(command) {
  this.commands = this.commands.filter(c => c.command !== command);
  return this.save();
};

// 方法：更新统计
botSchema.methods.incrementStats = function(field) {
  if (this.stats[field] !== undefined) {
    this.stats[field] += 1;
  }
  this.lastActiveAt = Date.now();
  return this.save();
};

// 静态方法：通过 Token 查找
botSchema.statics.findByToken = function(token) {
  return this.findOne({ token, isActive: true });
};

// 静态方法：通过用户名查找
botSchema.statics.findByUsername = function(username) {
  return this.findOne({ username: username.toLowerCase(), isActive: true });
};

// 静态方法：搜索机器人
botSchema.statics.searchBots = function(query, limit = 20) {
  return this.find({
    $or: [
      { name: new RegExp(query, 'i') },
      { username: new RegExp(query, 'i') },
      { description: new RegExp(query, 'i') }
    ],
    isActive: true
  }).limit(limit);
};

// 中间件：更新时间戳
botSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Bot = mongoose.model('Bot', botSchema);

module.exports = Bot;
