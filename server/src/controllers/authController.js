const User = require('../models/User');
const { verifySignature } = require('../utils/crypto');
const { generateToken, generateRefreshToken } = require('../middleware/auth');
const { isValidAddress, isValidNickname } = require('../utils/validation');
const logger = require('../config/logger');

/**
 * 钱包地址登录
 */
exports.login = async (req, res) => {
  try {
    const { address, signature, message } = req.body;
    
    // 验证必填字段
    if (!address || !signature || !message) {
      return res.status(400).json({
        success: false,
        message: 'Address, signature, and message are required'
      });
    }
    
    // 验证地址格式
    if (!isValidAddress(address)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Ethereum address'
      });
    }
    
    // 验证签名
    if (!verifySignature(message, signature, address)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid signature'
      });
    }
    
    // 查找或创建用户
    let user = await User.findByAddress(address);
    
    if (!user) {
      // 创建新用户
      user = new User({
        address: address.toLowerCase()
      });
      await user.save();
      logger.info(`New user registered: ${address}`);
    }
    
    // 检查用户状态
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }
    
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Account is banned'
      });
    }
    
    // 更新最后登录时间
    user.lastSeen = new Date();
    await user.save();
    
    // 生成token
    const token = generateToken(address);
    const refreshToken = generateRefreshToken(address);
    
    logger.info(`User logged in: ${address}`);
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      refreshToken,
      user: {
        address: user.address,
        nickname: user.nickname,
        avatar: user.avatar,
        bio: user.bio,
        online: user.online,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

/**
 * 获取当前用户信息
 */
exports.getProfile = async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      user: {
        address: user.address,
        nickname: user.nickname,
        avatar: user.avatar,
        bio: user.bio,
        publicKey: user.publicKey,
        online: user.online,
        lastSeen: user.lastSeen,
        friends: user.friends,
        settings: user.settings,
        stats: user.stats,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

/**
 * 更新用户信息
 */
exports.updateProfile = async (req, res) => {
  try {
    const { nickname, bio, publicKey, settings } = req.body;
    const user = req.user;
    
    // 验证昵称
    if (nickname !== undefined) {
      if (!isValidNickname(nickname)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid nickname format'
        });
      }
      user.nickname = nickname;
    }
    
    // 更新其他字段
    if (bio !== undefined) user.bio = bio;
    if (publicKey !== undefined) user.publicKey = publicKey;
    if (settings !== undefined) {
      user.settings = { ...user.settings, ...settings };
    }
    
    await user.save();
    
    logger.info(`User profile updated: ${user.address}`);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        address: user.address,
        nickname: user.nickname,
        avatar: user.avatar,
        bio: user.bio,
        publicKey: user.publicKey,
        settings: user.settings
      }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

/**
 * 上传头像
 */
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const user = req.user;
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    user.avatar = avatarUrl;
    await user.save();
    
    logger.info(`Avatar uploaded: ${user.address}`);
    
    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatar: avatarUrl
    });
  } catch (error) {
    logger.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar',
      error: error.message
    });
  }
};

/**
 * 刷新token
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }
    
    // 验证刷新token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
    
    // 生成新的访问token
    const newToken = generateToken(decoded.address);
    
    res.json({
      success: true,
      token: newToken
    });
  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
      error: error.message
    });
  }
};

module.exports = exports;
