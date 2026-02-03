const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Friend = require('../models/Friend');

// 获取好友列表
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findByAddress(req.user.address);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 获取好友详细信息
    const friends = await User.find({
      address: { $in: user.friends }
    }).select('address nickname avatar online lastSeen bio');

    res.json({
      success: true,
      friends: friends.map(friend => ({
        address: friend.address,
        nickname: friend.nickname,
        avatar: friend.avatar,
        online: friend.online,
        lastSeen: friend.lastSeen,
        bio: friend.bio
      }))
    });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 搜索用户
router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 3) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query must be at least 3 characters' 
      });
    }

    const users = await User.searchUsers(query, 20);
    
    // 排除当前用户
    const results = users
      .filter(u => u.address !== req.user.address)
      .map(user => ({
        address: user.address,
        nickname: user.nickname,
        avatar: user.avatar,
        online: user.online,
        bio: user.bio
      }));

    res.json({ success: true, users: results });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 发送好友请求
router.post('/request', auth, async (req, res) => {
  try {
    const { friendAddress } = req.body;
    
    if (!friendAddress) {
      return res.status(400).json({ success: false, message: 'Friend address is required' });
    }

    const user = await User.findByAddress(req.user.address);
    const friend = await User.findByAddress(friendAddress);

    if (!friend) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isFriend(friendAddress)) {
      return res.status(400).json({ success: false, message: 'Already friends' });
    }

    // 检查是否已有好友请求
    let friendRequest = await Friend.findOne({
      $or: [
        { requester: user.address, recipient: friend.address },
        { requester: friend.address, recipient: user.address }
      ]
    });

    if (friendRequest) {
      if (friendRequest.status === 'pending') {
        return res.status(400).json({ success: false, message: 'Friend request already sent' });
      }
      if (friendRequest.status === 'accepted') {
        return res.status(400).json({ success: false, message: 'Already friends' });
      }
    }

    // 创建好友请求
    friendRequest = new Friend({
      requester: user.address,
      recipient: friend.address,
      status: 'pending'
    });

    await friendRequest.save();

    res.json({ 
      success: true, 
      message: 'Friend request sent',
      request: friendRequest
    });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 获取好友请求列表
router.get('/requests', auth, async (req, res) => {
  try {
    const requests = await Friend.find({
      recipient: req.user.address,
      status: 'pending'
    }).populate('requester', 'address nickname avatar online');

    res.json({ success: true, requests });
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 接受好友请求
router.post('/accept/:requestId', auth, async (req, res) => {
  try {
    const friendRequest = await Friend.findById(req.params.requestId);

    if (!friendRequest) {
      return res.status(404).json({ success: false, message: 'Friend request not found' });
    }

    if (friendRequest.recipient !== req.user.address) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }

    // 更新请求状态
    friendRequest.status = 'accepted';
    await friendRequest.save();

    // 互相添加为好友
    const user = await User.findByAddress(req.user.address);
    const friend = await User.findByAddress(friendRequest.requester);

    await user.addFriend(friend.address);
    await friend.addFriend(user.address);

    res.json({ 
      success: true, 
      message: 'Friend request accepted',
      friend: {
        address: friend.address,
        nickname: friend.nickname,
        avatar: friend.avatar,
        online: friend.online
      }
    });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 拒绝好友请求
router.post('/reject/:requestId', auth, async (req, res) => {
  try {
    const friendRequest = await Friend.findById(req.params.requestId);

    if (!friendRequest) {
      return res.status(404).json({ success: false, message: 'Friend request not found' });
    }

    if (friendRequest.recipient !== req.user.address) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    friendRequest.status = 'rejected';
    await friendRequest.save();

    res.json({ success: true, message: 'Friend request rejected' });
  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 删除好友
router.delete('/:friendAddress', auth, async (req, res) => {
  try {
    const { friendAddress } = req.params;
    
    const user = await User.findByAddress(req.user.address);
    const friend = await User.findByAddress(friendAddress);

    if (!friend) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.removeFriend(friendAddress);
    await friend.removeFriend(req.user.address);

    // 删除好友请求记录
    await Friend.deleteMany({
      $or: [
        { requester: user.address, recipient: friend.address },
        { requester: friend.address, recipient: user.address }
      ]
    });

    res.json({ success: true, message: 'Friend removed' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
