const Message = require('../models/Message');
const User = require('../models/User');
const Group = require('../models/Group');
const { isValidAddress, isValidMessageLength } = require('../utils/validation');
const logger = require('../config/logger');

/**
 * 发送消息
 */
exports.sendMessage = async (req, res) => {
  try {
    const { to, groupId, type, content, fileUrl, fileName, fileSize, fileMimeType, duration, replyTo } = req.body;
    const from = req.address;
    
    // 验证消息类型
    const validTypes = ['text', 'voice', 'image', 'video', 'file', 'location', 'contact'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message type'
      });
    }
    
    // 验证接收者或群组
    if (!to && !groupId) {
      return res.status(400).json({
        success: false,
        message: 'Recipient or group is required'
      });
    }
    
    // 如果是一对一消息，验证接收者
    if (to) {
      if (!isValidAddress(to)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid recipient address'
        });
      }
      
      const recipient = await User.findByAddress(to);
      if (!recipient) {
        return res.status(404).json({
          success: false,
          message: 'Recipient not found'
        });
      }
      
      // 检查是否被拉黑
      if (recipient.isBlocked(from)) {
        return res.status(403).json({
          success: false,
          message: 'You are blocked by this user'
        });
      }
    }
    
    // 如果是群消息，验证群组和权限
    if (groupId) {
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Group not found'
        });
      }
      
      if (!group.isMember(from)) {
        return res.status(403).json({
          success: false,
          message: 'You are not a member of this group'
        });
      }
      
      // 检查是否被禁言
      if (group.settings.muteAll && !group.isAdmin(from)) {
        return res.status(403).json({
          success: false,
          message: 'Group is muted'
        });
      }
      
      if (group.isMuted(from)) {
        return res.status(403).json({
          success: false,
          message: 'You are muted in this group'
        });
      }
    }
    
    // 验证文本消息内容
    if (type === 'text' && !isValidMessageLength(content)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message content'
      });
    }
    
    // 创建消息
    const message = new Message({
      from,
      to: to?.toLowerCase(),
      groupId,
      type,
      content,
      fileUrl,
      fileName,
      fileSize,
      fileMimeType,
      duration,
      replyTo,
      status: 'sent'
    });
    
    await message.save();
    
    // 更新用户统计
    await User.findOneAndUpdate(
      { address: from },
      { $inc: { 'stats.totalMessages': 1 } }
    );
    
    // 如果是群消息，更新群统计
    if (groupId) {
      await Group.findByIdAndUpdate(
        groupId,
        { $inc: { 'stats.totalMessages': 1 } }
      );
    }
    
    logger.info(`Message sent from ${from} to ${to || groupId}`);
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    logger.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

/**
 * 获取聊天记录
 */
exports.getChatHistory = async (req, res) => {
  try {
    const { address } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const currentUser = req.address;
    
    if (!isValidAddress(address)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid address'
      });
    }
    
    const messages = await Message.getChatHistory(
      currentUser,
      address,
      parseInt(limit),
      parseInt(offset)
    );
    
    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    logger.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat history',
      error: error.message
    });
  }
};

/**
 * 获取群聊记录
 */
exports.getGroupHistory = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const currentUser = req.address;
    
    // 验证群组权限
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    if (!group.isMember(currentUser)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this group'
      });
    }
    
    const messages = await Message.getGroupHistory(
      groupId,
      parseInt(limit),
      parseInt(offset)
    );
    
    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    logger.error('Get group history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get group history',
      error: error.message
    });
  }
};

/**
 * 标记消息为已读
 */
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUser = req.address;
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    await message.markAsRead(currentUser);
    
    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    logger.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read',
      error: error.message
    });
  }
};

/**
 * 删除消息
 */
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUser = req.address;
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    await message.softDelete(currentUser);
    
    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    logger.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
};

/**
 * 上传文件
 */
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const folder = req.file.destination.split('/').pop();
    const fileUrl = `/uploads/${folder}/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        url: fileUrl,
        name: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (error) {
    logger.error('Upload file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
};

/**
 * 获取未读消息数量
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const currentUser = req.address;
    
    const count = await Message.getUnreadCount(currentUser);
    
    res.json({
      success: true,
      count
    });
  } catch (error) {
    logger.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
};

module.exports = exports;
