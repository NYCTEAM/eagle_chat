const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

/**
 * 初始化Socket.IO
 */
function initializeSocket(io) {
  // Socket.IO认证中间件
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication error'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByAddress(decoded.address);
      
      if (!user || !user.isActive || user.isBanned) {
        return next(new Error('Authentication error'));
      }
      
      socket.user = user;
      socket.address = decoded.address;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });
  
  // 连接事件
  io.on('connection', async (socket) => {
    const address = socket.address;
    logger.info(`User connected: ${address}`);
    
    // 更新用户在线状态
    await User.findOneAndUpdate(
      { address },
      { online: true, socketId: socket.id, lastSeen: new Date() }
    );
    
    // 通知好友用户上线
    const user = await User.findByAddress(address);
    if (user && user.friends.length > 0) {
      for (const friendAddress of user.friends) {
        const friend = await User.findByAddress(friendAddress);
        if (friend?.socketId) {
          io.to(friend.socketId).emit('user_online', {
            address,
            online: true
          });
        }
      }
    }
    
    // 发送消息
    socket.on('send_message', async (data) => {
      try {
        const { to, groupId, type, content } = data;
        
        // 这里应该调用messageController的逻辑
        // 简化版本：直接转发消息
        if (groupId) {
          // 群消息
          socket.to(`group_${groupId}`).emit('new_message', {
            from: address,
            groupId,
            type,
            content,
            createdAt: new Date()
          });
        } else if (to) {
          // 一对一消息
          const recipient = await User.findByAddress(to);
          if (recipient?.socketId) {
            io.to(recipient.socketId).emit('new_message', {
              from: address,
              to,
              type,
              content,
              createdAt: new Date()
            });
          }
        }
      } catch (error) {
        logger.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    
    // 加入群聊房间
    socket.on('join_group', async (data) => {
      const { groupId } = data;
      socket.join(`group_${groupId}`);
      logger.info(`User ${address} joined group ${groupId}`);
    });
    
    // 离开群聊房间
    socket.on('leave_group', async (data) => {
      const { groupId } = data;
      socket.leave(`group_${groupId}`);
      logger.info(`User ${address} left group ${groupId}`);
    });
    
    // 正在输入
    socket.on('typing', async (data) => {
      const { to, groupId } = data;
      
      if (groupId) {
        socket.to(`group_${groupId}`).emit('user_typing', {
          from: address,
          groupId
        });
      } else if (to) {
        const recipient = await User.findByAddress(to);
        if (recipient?.socketId) {
          io.to(recipient.socketId).emit('user_typing', {
            from: address
          });
        }
      }
    });
    
    // 停止输入
    socket.on('stop_typing', async (data) => {
      const { to, groupId } = data;
      
      if (groupId) {
        socket.to(`group_${groupId}`).emit('user_stop_typing', {
          from: address,
          groupId
        });
      } else if (to) {
        const recipient = await User.findByAddress(to);
        if (recipient?.socketId) {
          io.to(recipient.socketId).emit('user_stop_typing', {
            from: address
          });
        }
      }
    });
    
    // 断开连接
    socket.on('disconnect', async () => {
      logger.info(`User disconnected: ${address}`);
      
      // 更新用户离线状态
      await User.findOneAndUpdate(
        { address },
        { online: false, socketId: '', lastSeen: new Date() }
      );
      
      // 通知好友用户离线
      const user = await User.findByAddress(address);
      if (user && user.friends.length > 0) {
        for (const friendAddress of user.friends) {
          const friend = await User.findByAddress(friendAddress);
          if (friend?.socketId) {
            io.to(friend.socketId).emit('user_online', {
              address,
              online: false
            });
          }
        }
      }
    });
  });
  
  return io;
}

module.exports = { initializeSocket };
