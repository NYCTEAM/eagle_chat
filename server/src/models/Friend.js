const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
  // 发起者
  requester: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  
  // 接收者
  recipient: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  
  // 好友请求状态
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'blocked'],
    default: 'pending'
  },
  
  // 请求消息
  message: {
    type: String,
    maxlength: 200
  },
  
  // 备注名称
  requesterNickname: String,
  recipientNickname: String,
  
  // 时间戳
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  acceptedAt: Date,
  declinedAt: Date,
  blockedAt: Date
}, {
  timestamps: true
});

// 复合索引
friendSchema.index({ requester: 1, recipient: 1 }, { unique: true });
friendSchema.index({ status: 1 });

// 静态方法：检查好友关系
friendSchema.statics.areFriends = async function(address1, address2) {
  const friendship = await this.findOne({
    $or: [
      { requester: address1.toLowerCase(), recipient: address2.toLowerCase(), status: 'accepted' },
      { requester: address2.toLowerCase(), recipient: address1.toLowerCase(), status: 'accepted' }
    ]
  });
  return !!friendship;
};

// 静态方法：获取好友列表
friendSchema.statics.getFriends = async function(address) {
  const friendships = await this.find({
    $or: [
      { requester: address.toLowerCase(), status: 'accepted' },
      { recipient: address.toLowerCase(), status: 'accepted' }
    ]
  });
  
  return friendships.map(f => {
    if (f.requester === address.toLowerCase()) {
      return { address: f.recipient, nickname: f.recipientNickname };
    } else {
      return { address: f.requester, nickname: f.requesterNickname };
    }
  });
};

const Friend = mongoose.model('Friend', friendSchema);

module.exports = Friend;
