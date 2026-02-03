const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { uploadAvatar, handleUploadError } = require('../middleware/upload');

/**
 * @route   POST /api/auth/login
 * @desc    钱包地址登录
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   GET /api/auth/profile
 * @desc    获取当前用户信息
 * @access  Private
 */
router.get('/profile', auth, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    更新用户信息
 * @access  Private
 */
router.put('/profile', auth, authController.updateProfile);

/**
 * @route   POST /api/auth/avatar
 * @desc    上传头像
 * @access  Private
 */
router.post('/avatar', auth, uploadAvatar, handleUploadError, authController.uploadAvatar);

/**
 * @route   POST /api/auth/refresh
 * @desc    刷新token
 * @access  Public
 */
router.post('/refresh', authController.refreshToken);

module.exports = router;
