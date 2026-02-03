const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // 发送者
  from: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  
  // 接收者（一对一聊天）
  to: {
    type: String,
    lowercase: true,
    index: true
  },
  
  // 群组ID（群聊）
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    index: true
  },
  
  // 消息类型
  type: {
    type: String,
    required: true,
    enum: ['text', 'voice', 'image', 'video', 'file', 'location', 'contact', 'system'],
    default: 'text'
  },
  
  // 消息内容
  content: {
    type: String,
    maxlength: 5000
  },
  
  // 文件信息
  fileUrl: {
    type: String
  },
  
  fileName: {
    type: String
  },
  
  fileSize: {
    type: Number
  },
  
  fileMimeType: {
    type: String
  },
  
  // 语音/视频时长（秒）
  duration: {
    type: Number
  },
  
  // 缩略图（图片/视频）
  thumbnail: {
    type: String
  },
  
  // 位置信息
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  
  // 联系人信息
  contact: {
    address: String,
    nickname: String
  },
  
  // 加密信息
  encrypted: {
    type: Boolean,
    default: false
  },
  
  encryptionKey: {
    type: String
  },
  
  // 消息状态
  status: {
    type: String,
    enum: ['sending', 'sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  
  // 已读状态
  read: {
    type: Boolean,
    default: false
  },
  
  readAt: {
    type: Date
  },
  
  // 已读用户列表（群聊）
  readBy: [{
    address: String,
    readAt: Date
  }],
  
  // 删除状态
  deleted: {
    type: Boolean,
    default: false
  },
  
  deletedBy: [{
    type: String
  }],
  
  // 回复消息
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  
  // 转发消息
  forwardedFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  
  // @提醒用户（群聊）
  mentions: [{
    type: String
  }],
  
  // 是否置顶
  pinned: {
    type: Boolean,
    default: false
  },
  
  pinnedAt: {
    type: Date
  },
  
  pinnedBy: {
    type: String
  },
  
  // 编辑历史
  edited: {
    type: Boolean,
    default: false
  },
  
  editedAt: {
    type: Date
  },
  
  editHistory: [{
    content: String,
    editedAt: Date
  }],
  
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

// 复合索引
messageSchema.index({ from: 1, to: 1, createdAt: -1 });
messageSchema.index({ groupId: 1, createdAt: -1 });
messageSchema.index({ from: 1, createdAt: -1 });
messageSchema.index({ to: 1, createdAt: -1 });

// 虚拟字段：是否为群聊消息
messageSchema.virtual('isGroupMessage').get(function() {
  return !!this.groupId;
});

// 方法：标记为已读
messageSchema.methods.markAsRead = async function(address) {
  if (this.isGroupMessage) {
    // 群聊消息
    const existingRead = this.readBy.find(r => r.address === address);
    if (!existingRead) {
      this.readBy.push({
        address: address,
        readAt: new Date()
      });
    }
  } else {
    // 一对一消息
    this.read = true;
    this.readAt = new Date();
    this.status = 'read';
  }
  await this.save();
};

// 方法：软删除
messageSchema.methods.softDelete = async function(address) {
  if (!this.deletedBy.includes(address)) {
    this.deletedBy.push(address);
  }
  
  // 如果所有相关用户都删除了，标记为已删除
  if (this.isGroupMessage) {
    // 群聊消息需要所有成员都删除
    // 这里简化处理，只标记deletedBy
  } else {
    // 一对一消息，双方都删除才真正删除
    if (this.deletedBy.includes(this.from) && this.deletedBy.includes(this.to)) {
      this.deleted = true;
    }
  }
  
  await this.save();
};

// 方法：编辑消息
messageSchema.methods.edit = async function(newContent) {
  // 保存编辑历史
  this.editHistory.push({
    content: this.content,
    editedAt: new Date()
  });
  
  this.content = newContent;
  this.edited = true;
  this.editedAt = new Date();
  
  await this.save();
};

// 静态方法：获取聊天记录
messageSchema.statics.getChatHistory = function(user1, user2, limit = 50, offset = 0) {
  return this.find({
    $or: [
      { from: user1, to: user2 },
      { from: user2, to: user1 }
    ],
    deleted: false,
    deletedBy: { $nin: [user1] }
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(offset)
  .populate('replyTo', 'content from type');
};

// 静态方法：获取群聊记录
messageSchema.statics.getGroupHistory = function(groupId, limit = 50, offset = 0) {
  return this.find({
    groupId: groupId,
    deleted: false
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(offset)
  .populate('replyTo', 'content from type');
};

// 静态方法：获取未读消息数量
messageSchema.statics.getUnreadCount = async function(address) {
  return this.countDocuments({
    to: address,
    read: false,
    deleted: false
  });
};

// 静态方法：搜索消息
messageSchema.statics.searchMessages = function(address, query, limit = 20) {
  return this.find({
    $or: [
      { from: address },
      { to: address }
    ],
    content: new RegExp(query, 'i'),
    deleted: false,
    type: 'text'
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

// 中间件：更新时间戳
messageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
