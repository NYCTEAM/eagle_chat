const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { generateQRCode } = require('../utils/qrcode');

// 生成用户二维码（用于添加好友）
router.get('/user', auth, async (req, res) => {
  try {
    const data = {
      type: 'user',
      address: req.user.address,
      timestamp: Date.now()
    };

    const qrCodeDataUrl = await generateQRCode(JSON.stringify(data));

    res.json({
      success: true,
      qrCode: qrCodeDataUrl,
      data
    });
  } catch (error) {
    console.error('Generate user QR code error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 生成群组二维码（用于加入群组）
router.get('/group/:groupId', auth, async (req, res) => {
  try {
    const data = {
      type: 'group',
      groupId: req.params.groupId,
      inviter: req.user.address,
      timestamp: Date.now()
    };

    const qrCodeDataUrl = await generateQRCode(JSON.stringify(data));

    res.json({
      success: true,
      qrCode: qrCodeDataUrl,
      data
    });
  } catch (error) {
    console.error('Generate group QR code error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 生成会议二维码（用于加入会议）
router.get('/meeting/:meetingId', auth, async (req, res) => {
  try {
    const data = {
      type: 'meeting',
      meetingId: req.params.meetingId,
      host: req.user.address,
      timestamp: Date.now()
    };

    const qrCodeDataUrl = await generateQRCode(JSON.stringify(data));

    res.json({
      success: true,
      qrCode: qrCodeDataUrl,
      data
    });
  } catch (error) {
    console.error('Generate meeting QR code error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
