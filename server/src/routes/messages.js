const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { auth } = require('../middleware/auth');
const { uploadSingle, handleUploadError } = require('../middleware/upload');

/**
 * @route   POST /api/messages/send
 * @desc    发送消息
 * @access  Private
 */
router.post('/send', auth, messageController.sendMessage);

/**
 * @route   GET /api/messages/chat/:address
 * @desc    获取与某人的聊天记录
 * @access  Private
 */
router.get('/chat/:address', auth, messageController.getChatHistory);

/**
 * @route   GET /api/messages/group/:groupId
 * @desc    获取群聊记录
 * @access  Private
 */
router.get('/group/:groupId', auth, messageController.getGroupHistory);

/**
 * @route   PUT /api/messages/:messageId/read
 * @desc    标记消息为已读
 * @access  Private
 */
router.put('/:messageId/read', auth, messageController.markAsRead);

/**
 * @route   DELETE /api/messages/:messageId
 * @desc    删除消息
 * @access  Private
 */
router.delete('/:messageId', auth, messageController.deleteMessage);

/**
 * @route   POST /api/messages/upload
 * @desc    上传文件
 * @access  Private
 */
router.post('/upload', auth, uploadSingle, handleUploadError, messageController.uploadFile);

/**
 * @route   GET /api/messages/unread
 * @desc    获取未读消息数量
 * @access  Private
 */
router.get('/unread', auth, messageController.getUnreadCount);

module.exports = router;
