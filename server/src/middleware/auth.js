const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * JWT认证中间件
 */
const auth = async (req, res, next) => {
  try {
    // 从header获取token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }
    
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查找用户
    const user = await User.findByAddress(decoded.address);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
    }
    
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'User account is banned'
      });
    }
    
    // 将用户信息附加到请求对象
    req.user = user;
    req.token = token;
    req.address = decoded.address;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

/**
 * 可选认证中间件（不强制要求登录）
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByAddress(decoded.address);
      
      if (user && user.isActive && !user.isBanned) {
        req.user = user;
        req.address = decoded.address;
      }
    }
    
    next();
  } catch (error) {
    // 忽略错误，继续执行
    next();
  }
};

/**
 * 生成JWT token
 * @param {string} address - 钱包地址
 * @returns {string} - JWT token
 */
const generateToken = (address) => {
  return jwt.sign(
    { address: address.toLowerCase() },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * 生成刷新token
 * @param {string} address - 钱包地址
 * @returns {string} - 刷新token
 */
const generateRefreshToken = (address) => {
  return jwt.sign(
    { address: address.toLowerCase(), type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
};

module.exports = {
  auth,
  optionalAuth,
  generateToken,
  generateRefreshToken
};
