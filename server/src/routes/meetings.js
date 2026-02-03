const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Meeting = require('../models/Meeting');
const User = require('../models/User');

// 创建会议
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, participants, scheduledAt } = req.body;
    
    if (!title) {
      return res.status(400).json({ success: false, message: 'Meeting title is required' });
    }

    const meeting = new Meeting({
      title,
      description: description || '',
      host: req.user.address,
      participants: [req.user.address, ...(participants || [])],
      scheduledAt: scheduledAt || Date.now(),
      status: 'scheduled'
    });

    await meeting.save();

    // 更新用户统计
    const user = await User.findByAddress(req.user.address);
    user.stats.totalMeetings += 1;
    await user.save();

    res.json({
      success: true,
      message: 'Meeting created',
      meeting: {
        id: meeting._id,
        title: meeting.title,
        roomId: meeting.roomId,
        scheduledAt: meeting.scheduledAt,
        participants: meeting.participants
      }
    });
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 获取会议列表
router.get('/', auth, async (req, res) => {
  try {
    const meetings = await Meeting.find({
      participants: req.user.address,
      status: { $in: ['scheduled', 'ongoing'] }
    }).sort({ scheduledAt: 1 });

    res.json({ success: true, meetings });
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 获取会议详情
router.get('/:meetingId', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.meetingId);

    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    if (!meeting.participants.includes(req.user.address)) {
      return res.status(403).json({ success: false, message: 'Not a participant' });
    }

    // 获取参与者信息
    const participants = await User.find({
      address: { $in: meeting.participants }
    }).select('address nickname avatar online');

    res.json({
      success: true,
      meeting: {
        ...meeting.toObject(),
        participantDetails: participants
      }
    });
  } catch (error) {
    console.error('Get meeting details error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 开始会议
router.post('/:meetingId/start', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.meetingId);

    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    if (meeting.host !== req.user.address) {
      return res.status(403).json({ success: false, message: 'Only host can start meeting' });
    }

    meeting.status = 'ongoing';
    meeting.startedAt = Date.now();
    await meeting.save();

    res.json({
      success: true,
      message: 'Meeting started',
      meeting: {
        id: meeting._id,
        roomId: meeting.roomId,
        status: meeting.status
      }
    });
  } catch (error) {
    console.error('Start meeting error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 结束会议
router.post('/:meetingId/end', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.meetingId);

    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    if (meeting.host !== req.user.address) {
      return res.status(403).json({ success: false, message: 'Only host can end meeting' });
    }

    meeting.status = 'ended';
    meeting.endedAt = Date.now();
    await meeting.save();

    res.json({ success: true, message: 'Meeting ended' });
  } catch (error) {
    console.error('End meeting error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 加入会议
router.post('/:meetingId/join', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.meetingId);

    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    if (!meeting.participants.includes(req.user.address)) {
      return res.status(403).json({ success: false, message: 'Not invited to this meeting' });
    }

    res.json({
      success: true,
      meeting: {
        id: meeting._id,
        title: meeting.title,
        roomId: meeting.roomId,
        host: meeting.host,
        jitsiUrl: `${process.env.JITSI_URL || 'https://meet.jit.si'}/${meeting.roomId}`
      }
    });
  } catch (error) {
    console.error('Join meeting error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 删除会议
router.delete('/:meetingId', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.meetingId);

    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    if (meeting.host !== req.user.address) {
      return res.status(403).json({ success: false, message: 'Only host can delete meeting' });
    }

    await meeting.deleteOne();

    res.json({ success: true, message: 'Meeting deleted' });
  } catch (error) {
    console.error('Delete meeting error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
