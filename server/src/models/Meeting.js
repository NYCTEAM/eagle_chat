const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  // 会议标题
  title: {
    type: String,
    required: true,
    maxlength: 200,
    default: 'Eagle Meeting'
  },
  
  // 创建者
  creator: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  
  // 预约时间
  scheduledTime: {
    type: Date,
    required: true,
    index: true
  },
  
  // 预计时长（分钟）
  duration: {
    type: Number,
    default: 60
  },
  
  // 参会人员
  participants: [{
    address: {
      type: String,
      lowercase: true
    },
    role: {
      type: String,
      enum: ['host', 'moderator', 'participant'],
      default: 'participant'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    }
  }],
  
  // 关联群组（可选）
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  
  // 会议密码（可选）
  password: {
    type: String
  },
  
  // Jitsi房间ID
  jitsiRoomId: {
    type: String,
    unique: true
  },
  
  // 会议链接
  link: {
    type: String
  },
  
  // 二维码数据
  qrCode: {
    type: String
  },
  
  // 会议描述
  description: {
    type: String,
    maxlength: 1000
  },
  
  // 会议状态
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'ended', 'cancelled'],
    default: 'scheduled'
  },
  
  // 提醒设置
  reminders: {
    sent30min: { type: Boolean, default: false },
    sent10min: { type: Boolean, default: false },
    sent5min: { type: Boolean, default: false }
  },
  
  // 实际开始/结束时间
  startedAt: Date,
  endedAt: Date,
  
  // 录制链接
  recordingUrl: String,
  
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
meetingSchema.index({ scheduledTime: 1 });
meetingSchema.index({ status: 1 });
meetingSchema.index({ 'participants.address': 1 });

// 生成会议链接
meetingSchema.methods.generateLink = function(domain = process.env.JITSI_DOMAIN) {
  if (!this.jitsiRoomId) {
    const prefix = process.env.JITSI_ROOM_PREFIX || 'eagle-';
    this.jitsiRoomId = `${prefix}${Math.random().toString(36).substring(2, 12)}`;
  }
  this.link = `https://${domain}/${this.jitsiRoomId}`;
  return this.link;
};

// 检查用户是否有权加入
meetingSchema.methods.canJoin = function(address) {
  if (this.status === 'cancelled' || this.status === 'ended') return false;
  // 如果是公开会议或用户在参会列表中
  if (this.participants.length === 0) return true;
  return this.participants.some(p => p.address === address.toLowerCase());
};

const Meeting = mongoose.model('Meeting', meetingSchema);

module.exports = Meeting;
