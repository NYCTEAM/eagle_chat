const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  // 群名称
  name: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true
  },
  
  // 群头像
  avatar: {
    type: String,
    default: 'https://api.dicebear.com/7.x/shapes/svg?seed=group'
  },
  
  // 群简介
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },
  
  // 群主
  owner: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  
  // 管理员列表
  admins: [{
    type: String,
    lowercase: true
  }],
  
  // 成员列表
  members: [{
    address: {
      type: String,
      required: true,
      lowercase: true
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    mutedUntil: {
      type: Date,
      default: null
    },
    nickname: {
      type: String,
      default: ''
    }
  }],
  
  // 群设置
  settings: {
    // 全员禁言
    muteAll: {
      type: Boolean,
      default: false
    },
    
    // 入群审核
    requireApproval: {
      type: Boolean,
      default: false
    },
    
    // 允许成员邀请
    allowInvite: {
      type: Boolean,
      default: true
    },
    
    // 允许成员修改群名片
    allowMemberEditNickname: {
      type: Boolean,
      default: true
    },
    
    // 显示成员昵称
    showMemberNickname: {
      type: Boolean,
      default: true
    },
    
    // 最大成员数
    maxMembers: {
      type: Number,
      default: 500
    }
  },
  
  // 群公告
  announcement: {
    content: {
      type: String,
      maxlength: 1000,
      default: ''
    },
    updatedBy: {
      type: String
    },
    updatedAt: {
      type: Date
    }
  },
  
  // 置顶消息
  pinnedMessages: [{
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    pinnedBy: {
      type: String
    },
    pinnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // 入群申请列表
  pendingRequests: [{
    address: {
      type: String,
      lowercase: true
    },
    message: {
      type: String,
      maxlength: 200
    },
    requestedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // 邀请码
  inviteCode: {
    type: String,
    unique: true,
    sparse: true
  },
  
  inviteCodeExpires: {
    type: Date
  },
  
  // 群标签
  tags: [{
    type: String
  }],
  
  // 群统计
  stats: {
    totalMessages: {
      type: Number,
      default: 0
    },
    totalMembers: {
      type: Number,
      default: 0
    },
    activeMembers: {
      type: Number,
      default: 0
    }
  },
  
  // 群状态
  isActive: {
    type: Boolean,
    default: true
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
  }
}, {
  timestamps: true
});

// 索引
groupSchema.index({ 'members.address': 1 });
groupSchema.index({ createdAt: -1 });

// 虚拟字段：成员数量
groupSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// 方法：检查是否为成员
groupSchema.methods.isMember = function(address) {
  return this.members.some(m => m.address === address.toLowerCase());
};

// 方法：检查是否为管理员
groupSchema.methods.isAdmin = function(address) {
  const lowerAddress = address.toLowerCase();
  return this.owner === lowerAddress || this.admins.includes(lowerAddress);
};

// 方法：检查是否为群主
groupSchema.methods.isOwner = function(address) {
  return this.owner === address.toLowerCase();
};

// 方法：获取成员信息
groupSchema.methods.getMember = function(address) {
  return this.members.find(m => m.address === address.toLowerCase());
};

// 方法：添加成员
groupSchema.methods.addMember = async function(address, role = 'member') {
  if (!this.isMember(address)) {
    this.members.push({
      address: address.toLowerCase(),
      role: role,
      joinedAt: new Date()
    });
    this.stats.totalMembers = this.members.length;
    await this.save();
  }
};

// 方法：移除成员
groupSchema.methods.removeMember = async function(address) {
  this.members = this.members.filter(m => m.address !== address.toLowerCase());
  this.admins = this.admins.filter(a => a !== address.toLowerCase());
  this.stats.totalMembers = this.members.length;
  await this.save();
};

// 方法：设置管理员
groupSchema.methods.setAdmin = async function(address, isAdmin = true) {
  const lowerAddress = address.toLowerCase();
  const member = this.getMember(lowerAddress);
  
  if (member) {
    if (isAdmin) {
      if (!this.admins.includes(lowerAddress)) {
        this.admins.push(lowerAddress);
        member.role = 'admin';
      }
    } else {
      this.admins = this.admins.filter(a => a !== lowerAddress);
      member.role = 'member';
    }
    await this.save();
  }
};

// 方法：禁言成员
groupSchema.methods.muteMember = async function(address, duration) {
  const member = this.getMember(address);
  if (member) {
    member.mutedUntil = new Date(Date.now() + duration * 1000);
    await this.save();
  }
};

// 方法：解除禁言
groupSchema.methods.unmuteMember = async function(address) {
  const member = this.getMember(address);
  if (member) {
    member.mutedUntil = null;
    await this.save();
  }
};

// 方法：检查成员是否被禁言
groupSchema.methods.isMuted = function(address) {
  const member = this.getMember(address);
  if (!member || !member.mutedUntil) return false;
  return member.mutedUntil > new Date();
};

// 方法：转让群主
groupSchema.methods.transferOwnership = async function(newOwnerAddress) {
  const lowerAddress = newOwnerAddress.toLowerCase();
  const member = this.getMember(lowerAddress);
  
  if (member) {
    // 旧群主变为管理员
    if (!this.admins.includes(this.owner)) {
      this.admins.push(this.owner);
    }
    
    // 设置新群主
    this.owner = lowerAddress;
    member.role = 'owner';
    
    // 从管理员列表移除新群主
    this.admins = this.admins.filter(a => a !== lowerAddress);
    
    await this.save();
  }
};

// 方法：生成邀请码
groupSchema.methods.generateInviteCode = async function(expiresInDays = 7) {
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  this.inviteCode = code;
  this.inviteCodeExpires = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
  await this.save();
  return code;
};

// 方法：验证邀请码
groupSchema.methods.validateInviteCode = function(code) {
  if (!this.inviteCode || !this.inviteCodeExpires) return false;
  if (this.inviteCode !== code) return false;
  if (this.inviteCodeExpires < new Date()) return false;
  return true;
};

// 静态方法：搜索群组
groupSchema.statics.searchGroups = function(query, limit = 20) {
  return this.find({
    $or: [
      { name: new RegExp(query, 'i') },
      { description: new RegExp(query, 'i') },
      { tags: new RegExp(query, 'i') }
    ],
    isActive: true
  }).limit(limit);
};

// 静态方法：通过邀请码查找
groupSchema.statics.findByInviteCode = function(code) {
  return this.findOne({
    inviteCode: code,
    inviteCodeExpires: { $gt: new Date() },
    isActive: true
  });
};

// 中间件：更新时间戳
groupSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.stats.totalMembers = this.members.length;
  next();
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
