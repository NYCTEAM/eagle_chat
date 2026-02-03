const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const upload = require('../middleware/upload');

// 获取当前用户信息
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findByAddress(req.user.address);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        address: user.address,
        nickname: user.nickname,
        avatar: user.avatar,
        bio: user.bio,
        online: user.online,
        lastSeen: user.lastSeen,
        settings: user.settings,
        stats: user.stats,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 更新用户信息
router.put('/me', auth, async (req, res) => {
  try {
    const { nickname, bio, settings } = req.body;
    
    const user = await User.findByAddress(req.user.address);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (nickname) user.nickname = nickname;
    if (bio !== undefined) user.bio = bio;
    if (settings) user.settings = { ...user.settings, ...settings };

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated',
      user: {
        address: user.address,
        nickname: user.nickname,
        avatar: user.avatar,
        bio: user.bio,
        settings: user.settings
      }
    });
  } catch (error) {
    console.error('Update user info error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 上传头像
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const user = await User.findByAddress(req.user.address);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 构建头像 URL
    const avatarUrl = `/uploads/${req.file.filename}`;
    user.avatar = avatarUrl;
    await user.save();

    res.json({
      success: true,
      message: 'Avatar updated',
      avatar: avatarUrl
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 获取用户信息（通过地址）
router.get('/:address', auth, async (req, res) => {
  try {
    const user = await User.findByAddress(req.params.address);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        address: user.address,
        nickname: user.nickname,
        avatar: user.avatar,
        bio: user.bio,
        online: user.online,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user by address error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 拉黑用户
router.post('/block/:address', auth, async (req, res) => {
  try {
    const { address } = req.params;
    
    const user = await User.findByAddress(req.user.address);
    const targetUser = await User.findByAddress(address);

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.blockUser(address);

    res.json({ success: true, message: 'User blocked' });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 取消拉黑
router.post('/unblock/:address', auth, async (req, res) => {
  try {
    const { address } = req.params;
    
    const user = await User.findByAddress(req.user.address);
    await user.unblockUser(address);

    res.json({ success: true, message: 'User unblocked' });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 获取黑名单
router.get('/blocked/list', auth, async (req, res) => {
  try {
    const user = await User.findByAddress(req.user.address);
    
    const blockedUsers = await User.find({
      address: { $in: user.blockedUsers }
    }).select('address nickname avatar');

    res.json({ success: true, blockedUsers });
  } catch (error) {
    console.error('Get blocked users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
