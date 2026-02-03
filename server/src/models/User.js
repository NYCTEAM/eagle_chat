const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // 钱包地址（唯一标识）
  address: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  
  // 用户信息
  nickname: {
    type: String,
    default: function() {
      // 默认昵称：地址前6位+后4位
      return `${this.address.substring(0, 6)}...${this.address.substring(this.address.length - 4)}`;
    },
    maxlength: 50
  },
  
  avatar: {
    type: String,
    default: function() {
      // 默认头像使用地址生成
      return `https://api.dicebear.com/7.x/identicon/svg?seed=${this.address}`;
    }
  },
  
  bio: {
    type: String,
    maxlength: 200,
    default: ''
  },
  
  // 公钥（用于端到端加密）
  publicKey: {
    type: String,
    default: ''
  },
  
  // 在线状态
  online: {
    type: Boolean,
    default: false
  },
  
  lastSeen: {
    type: Date,
    default: Date.now
  },
  
  // Socket连接ID（用于实时通信）
  socketId: {
    type: String,
    default: ''
  },
  
  // 好友列表
  friends: [{
    type: String,  // 好友的钱包地址
    ref: 'User'
  }],
  
  // 黑名单
  blockedUsers: [{
    type: String,
    ref: 'User'
  }],
  
  // 设置
  settings: {
    notifications: {
      type: Boolean,
      default: true
    },
    soundEnabled: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'zh', 'es', 'fr', 'de', 'ja', 'ko']
    }
  },
  
  // 统计信息
  stats: {
    totalMessages: {
      type: Number,
      default: 0
    },
    totalGroups: {
      type: Number,
      default: 0
    },
    totalMeetings: {
      type: Number,
      default: 0
    }
  },
  
  // 账户状态
  isActive: {
    type: Boolean,
    default: true
  },
  
  isBanned: {
    type: Boolean,
    default: false
  },
  
  bannedUntil: {
    type: Date,
    default: null
  },
  
  // 时间戳
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 索引
userSchema.index({ online: 1 });
userSchema.index({ createdAt: -1 });

// 虚拟字段：好友数量
userSchema.virtual('friendsCount').get(function() {
  return this.friends.length;
});

// 方法：检查是否为好友
userSchema.methods.isFriend = function(address) {
  return this.friends.includes(address.toLowerCase());
};

// 方法：添加好友
userSchema.methods.addFriend = async function(address) {
  if (!this.isFriend(address)) {
    this.friends.push(address.toLowerCase());
    await this.save();
  }
};

// 方法：移除好友
userSchema.methods.removeFriend = async function(address) {
  this.friends = this.friends.filter(f => f !== address.toLowerCase());
  await this.save();
};

// 方法：检查是否被拉黑
userSchema.methods.isBlocked = function(address) {
  return this.blockedUsers.includes(address.toLowerCase());
};

// 方法：拉黑用户
userSchema.methods.blockUser = async function(address) {
  if (!this.isBlocked(address)) {
    this.blockedUsers.push(address.toLowerCase());
    // 同时移除好友关系
    await this.removeFriend(address);
  }
};

// 方法：取消拉黑
userSchema.methods.unblockUser = async function(address) {
  this.blockedUsers = this.blockedUsers.filter(u => u !== address.toLowerCase());
  await this.save();
};

// 静态方法：通过地址查找用户
userSchema.statics.findByAddress = function(address) {
  return this.findOne({ address: address.toLowerCase() });
};

// 静态方法：搜索用户
userSchema.statics.searchUsers = function(query, limit = 20) {
  return this.find({
    $or: [
      { address: new RegExp(query, 'i') },
      { nickname: new RegExp(query, 'i') }
    ],
    isActive: true,
    isBanned: false
  }).limit(limit);
};

// 中间件：更新时间戳
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
