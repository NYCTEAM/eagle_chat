const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Group = require('../models/Group');
const User = require('../models/User');
const Message = require('../models/Message');

// 创建群组
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, members } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Group name is required' });
    }

    const group = new Group({
      name,
      description: description || '',
      owner: req.user.address, // Set owner field
      members: [
        { 
          address: req.user.address, 
          role: 'owner',
          joinedAt: new Date()
        }, 
        ...(members || []).map(m => ({ 
          address: m, 
          role: 'member', 
          joinedAt: new Date()
        }))
      ],
      admins: [req.user.address]
    });

    await group.save();

    // 更新用户统计
    const user = await User.findByAddress(req.user.address);
    user.stats.totalGroups += 1;
    await user.save();

    res.json({
      success: true,
      message: 'Group created',
      group: {
        id: group._id,
        name: group.name,
        description: group.description,
        avatar: group.avatar,
        members: group.members,
        createdAt: group.createdAt
      }
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 获取用户的群组列表
router.get('/', auth, async (req, res) => {
  try {
    const groups = await Group.find({
      'members.address': req.user.address,
      isActive: true
    }).sort({ updatedAt: -1 });

    res.json({ success: true, groups });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 获取群组详情
router.get('/:groupId', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Check membership
    const isMember = group.members.some(m => m.address === req.user.address);
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Not a member of this group' });
    }

    // 获取成员信息
    const memberAddresses = group.members.map(m => m.address);
    const members = await User.find({
      address: { $in: memberAddresses }
    }).select('address nickname avatar online');

    res.json({
      success: true,
      group: {
        ...group.toObject(),
        memberDetails: members
      }
    });
  } catch (error) {
    console.error('Get group details error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 更新群组信息
router.put('/:groupId', auth, async (req, res) => {
  try {
    const { name, description, avatar } = req.body;
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (!group.admins.includes(req.user.address)) {
      return res.status(403).json({ success: false, message: 'Only admins can update group' });
    }

    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (avatar) group.avatar = avatar;

    await group.save();

    res.json({ success: true, message: 'Group updated', group });
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 添加成员
router.post('/:groupId/members', auth, async (req, res) => {
  try {
    const { members } = req.body;
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (!group.admins.includes(req.user.address)) {
      return res.status(403).json({ success: false, message: 'Only admins can add members' });
    }

    // 添加新成员
    const currentMemberAddresses = group.members.map(m => m.address);
    const newMembers = members.filter(m => !currentMemberAddresses.includes(m));
    
    for (const address of newMembers) {
      group.members.push({
        address,
        role: 'member',
        joinedAt: new Date()
      });
    }
    
    await group.save();

    res.json({ success: true, message: 'Members added', group });
  } catch (error) {
    console.error('Add members error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 移除成员
router.delete('/:groupId/members/:memberAddress', auth, async (req, res) => {
  try {
    const { memberAddress } = req.params;
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (!group.admins.includes(req.user.address)) {
      return res.status(403).json({ success: false, message: 'Only admins can remove members' });
    }

    group.members = group.members.filter(m => m.address !== memberAddress);
    group.admins = group.admins.filter(a => a !== memberAddress);
    await group.save();

    res.json({ success: true, message: 'Member removed' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 离开群组
router.post('/:groupId/leave', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const isMember = group.members.some(m => m.address === req.user.address);
    if (!isMember) {
      return res.status(400).json({ success: false, message: 'Not a member of this group' });
    }

    // 如果是创建者，不能离开
    if (group.owner === req.user.address) {
      return res.status(400).json({ 
        success: false, 
        message: 'Owner cannot leave. Transfer ownership first.' 
      });
    }

    group.members = group.members.filter(m => m.address !== req.user.address);
    group.admins = group.admins.filter(a => a !== req.user.address);
    await group.save();

    res.json({ success: true, message: 'Left group' });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 删除群组
router.delete('/:groupId', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (group.owner !== req.user.address) {
      return res.status(403).json({ success: false, message: 'Only owner can delete group' });
    }

    group.isActive = false;
    await group.save();

    res.json({ success: true, message: 'Group deleted' });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 设置管理员
router.post('/:groupId/admins', auth, async (req, res) => {
  try {
    const { address } = req.body;
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (group.owner !== req.user.address) {
      return res.status(403).json({ success: false, message: 'Only owner can set admins' });
    }

    const isMember = group.members.some(m => m.address === address);
    if (!isMember) {
      return res.status(400).json({ success: false, message: 'User is not a member' });
    }

    if (!group.admins.includes(address)) {
      group.admins.push(address);
      await group.save();
    }

    res.json({ success: true, message: 'Admin set', group });
  } catch (error) {
    console.error('Set admin error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 移除管理员
router.delete('/:groupId/admins/:address', auth, async (req, res) => {
  try {
    const { address } = req.params;
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (group.owner !== req.user.address) {
      return res.status(403).json({ success: false, message: 'Only owner can remove admins' });
    }

    group.admins = group.admins.filter(a => a !== address);
    await group.save();

    res.json({ success: true, message: 'Admin removed' });
  } catch (error) {
    console.error('Remove admin error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 禁言用户
router.post('/:groupId/mute', auth, async (req, res) => {
  try {
    const { address, duration } = req.body; // duration in minutes
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (!group.admins.includes(req.user.address) && group.owner !== req.user.address) {
      return res.status(403).json({ success: false, message: 'Only admins can mute users' });
    }

    const muteUntil = new Date(Date.now() + duration * 60 * 1000);
    
    if (!group.mutedUsers) {
      group.mutedUsers = [];
    }

    const existingMute = group.mutedUsers.find(m => m.address === address);
    if (existingMute) {
      existingMute.until = muteUntil;
    } else {
      group.mutedUsers.push({ address, until: muteUntil });
    }

    await group.save();

    res.json({ success: true, message: 'User muted', until: muteUntil });
  } catch (error) {
    console.error('Mute user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 取消禁言
router.delete('/:groupId/mute/:address', auth, async (req, res) => {
  try {
    const { address } = req.params;
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (!group.admins.includes(req.user.address) && group.owner !== req.user.address) {
      return res.status(403).json({ success: false, message: 'Only admins can unmute users' });
    }

    if (group.mutedUsers) {
      group.mutedUsers = group.mutedUsers.filter(m => m.address !== address);
      await group.save();
    }

    res.json({ success: true, message: 'User unmuted' });
  } catch (error) {
    console.error('Unmute user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 更新群公告
router.put('/:groupId/announcement', auth, async (req, res) => {
  try {
    const { announcement } = req.body;
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (!group.admins.includes(req.user.address) && group.owner !== req.user.address) {
      return res.status(403).json({ success: false, message: 'Only admins can update announcement' });
    }

    group.announcement = announcement;
    group.announcementUpdatedAt = Date.now();
    group.announcementUpdatedBy = req.user.address;
    await group.save();

    res.json({ success: true, message: 'Announcement updated', group });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 转让群主
router.post('/:groupId/transfer', auth, async (req, res) => {
  try {
    const { newCreator } = req.body;
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (group.owner !== req.user.address) {
      return res.status(403).json({ success: false, message: 'Only owner can transfer ownership' });
    }

    const isNewCreatorMember = group.members.some(m => m.address === newCreator);
    if (!isNewCreatorMember) {
      return res.status(400).json({ success: false, message: 'New owner must be a member' });
    }

    group.owner = newCreator;
    
    // Update roles
    const oldOwnerMember = group.members.find(m => m.address === req.user.address);
    if (oldOwnerMember) oldOwnerMember.role = 'admin';
    
    const newOwnerMember = group.members.find(m => m.address === newCreator);
    if (newOwnerMember) newOwnerMember.role = 'owner';

    if (!group.admins.includes(newCreator)) {
      group.admins.push(newCreator);
    }
    await group.save();

    res.json({ success: true, message: 'Ownership transferred', group });
  } catch (error) {
    console.error('Transfer ownership error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 通过邀请链接加入群组
router.post('/join/:groupId', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (!group.isActive) {
      return res.status(400).json({ success: false, message: 'Group is not active' });
    }

    const isMember = group.members.some(m => m.address === req.user.address);
    if (isMember) {
      return res.status(400).json({ success: false, message: 'Already a member' });
    }

    // 检查是否需要审核
    if (group.requireApproval) {
      // TODO: 创建加群申请
      return res.json({ success: true, message: 'Join request sent', pending: true });
    }

    // 直接加入
    group.members.push({
      address: req.user.address,
      role: 'member',
      joinedAt: new Date()
    });
    await group.save();

    res.json({ success: true, message: 'Joined group', group });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
