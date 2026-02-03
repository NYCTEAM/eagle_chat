import { useState, useEffect } from 'react';
import { 
  Users, Settings, UserPlus, Shield, Bell, Link2, 
  Edit, Trash2, Crown, UserMinus, MessageSquareOff, 
  Copy, QrCode, Image as ImageIcon, X 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function GroupManager({ group, onClose, onUpdate }) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('info');
  const [groupData, setGroupData] = useState(group);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  // 群设置
  const [groupName, setGroupName] = useState(group.name);
  const [groupDescription, setGroupDescription] = useState(group.description || '');
  const [groupAvatar, setGroupAvatar] = useState(group.avatar || '');
  const [announcement, setAnnouncement] = useState(group.announcement || '');
  
  // 权限检查
  const isCreator = user?.address === group.creator;
  const isAdmin = group.admins?.includes(user?.address);
  const canManage = isCreator || isAdmin;

  useEffect(() => {
    loadGroupDetails();
  }, [group._id]);

  const loadGroupDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/groups/${group._id}`);
      if (response.data.success) {
        setGroupData(response.data.group);
        setMembers(response.data.group.memberDetails || []);
      }
    } catch (error) {
      console.error('Load group details error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGroup = async () => {
    try {
      const response = await api.put(`/groups/${group._id}`, {
        name: groupName,
        description: groupDescription,
        avatar: groupAvatar,
        announcement
      });

      if (response.data.success) {
        alert(t('group.updateSuccess'));
        onUpdate(response.data.group);
      }
    } catch (error) {
      console.error('Update group error:', error);
      alert(error.response?.data?.message || t('common.error'));
    }
  };

  const handleAddMember = async (address) => {
    try {
      const response = await api.post(`/groups/${group._id}/members`, {
        members: [address]
      });

      if (response.data.success) {
        alert(t('group.memberAdded'));
        loadGroupDetails();
      }
    } catch (error) {
      console.error('Add member error:', error);
      alert(error.response?.data?.message || t('common.error'));
    }
  };

  const handleRemoveMember = async (address) => {
    if (!confirm(t('group.confirmRemoveMember'))) return;

    try {
      const response = await api.delete(`/groups/${group._id}/members/${address}`);
      if (response.data.success) {
        alert(t('group.memberRemoved'));
        loadGroupDetails();
      }
    } catch (error) {
      console.error('Remove member error:', error);
      alert(error.response?.data?.message || t('common.error'));
    }
  };

  const handleSetAdmin = async (address) => {
    try {
      const response = await api.post(`/groups/${group._id}/admins`, {
        address
      });

      if (response.data.success) {
        alert(t('group.adminSet'));
        loadGroupDetails();
      }
    } catch (error) {
      console.error('Set admin error:', error);
      alert(error.response?.data?.message || t('common.error'));
    }
  };

  const handleMuteUser = async (address, duration) => {
    try {
      const response = await api.post(`/groups/${group._id}/mute`, {
        address,
        duration // 分钟
      });

      if (response.data.success) {
        alert(t('group.userMuted'));
        loadGroupDetails();
      }
    } catch (error) {
      console.error('Mute user error:', error);
      alert(error.response?.data?.message || t('common.error'));
    }
  };

  const handleCopyInviteLink = () => {
    const inviteLink = `${window.location.origin}/join/${group._id}`;
    navigator.clipboard.writeText(inviteLink);
    alert(t('group.linkCopied'));
  };

  const handleGenerateQRCode = async () => {
    try {
      const response = await api.get(`/qrcode/group/${group._id}`);
      if (response.data.success) {
        // 显示二维码
        const qrWindow = window.open('', '_blank');
        qrWindow.document.write(`
          <html>
            <head><title>${t('group.qrCode')}</title></head>
            <body style="display:flex;justify-content:center;align-items:center;height:100vh;margin:0;">
              <div style="text-align:center;">
                <h2>${groupName}</h2>
                <img src="${response.data.qrCode}" alt="QR Code" style="max-width:400px;"/>
                <p>${t('group.scanToJoin')}</p>
              </div>
            </body>
          </html>
        `);
      }
    } catch (error) {
      console.error('Generate QR code error:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t('group.management')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 标签页 */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'info'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            {t('group.info')}
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'members'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            {t('group.members')} ({members.length})
          </button>
          <button
            onClick={() => setActiveTab('announcement')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'announcement'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Bell className="w-4 h-4 inline mr-2" />
            {t('group.announcement')}
          </button>
          <button
            onClick={() => setActiveTab('invite')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'invite'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Link2 className="w-4 h-4 inline mr-2" />
            {t('group.invite')}
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 群信息 */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('group.avatar')}
                </label>
                <div className="flex items-center space-x-4">
                  <img
                    src={groupAvatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${group._id}`}
                    alt={groupName}
                    className="w-20 h-20 rounded-lg"
                  />
                  {canManage && (
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      <ImageIcon className="w-4 h-4 inline mr-2" />
                      {t('group.changeAvatar')}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('group.name')}
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  disabled={!canManage}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('group.description')}
                </label>
                <textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  disabled={!canManage}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('group.creator')}
                </label>
                <p className="text-gray-600">{group.creator}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('group.createdAt')}
                </label>
                <p className="text-gray-600">
                  {new Date(group.createdAt).toLocaleString()}
                </p>
              </div>

              {canManage && (
                <div className="flex space-x-4">
                  <button
                    onClick={handleUpdateGroup}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {t('common.save')}
                  </button>
                  {isCreator && (
                    <button
                      onClick={() => {
                        if (confirm(t('group.confirmDelete'))) {
                          // 删除群组逻辑
                        }
                      }}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4 inline mr-2" />
                      {t('group.delete')}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 成员管理 */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              {canManage && (
                <button
                  onClick={() => {
                    const address = prompt(t('group.enterMemberAddress'));
                    if (address) handleAddMember(address);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <UserPlus className="w-4 h-4 inline mr-2" />
                  {t('group.addMember')}
                </button>
              )}

              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.address}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={member.avatar}
                        alt={member.nickname}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">{member.nickname}</h4>
                          {group.creator === member.address && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                              <Crown className="w-3 h-3 inline mr-1" />
                              {t('group.creator')}
                            </span>
                          )}
                          {group.admins?.includes(member.address) && group.creator !== member.address && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                              <Shield className="w-3 h-3 inline mr-1" />
                              {t('group.admin')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {member.address.slice(0, 10)}...
                        </p>
                      </div>
                    </div>

                    {canManage && member.address !== user?.address && (
                      <div className="flex items-center space-x-2">
                        {isCreator && !group.admins?.includes(member.address) && (
                          <button
                            onClick={() => handleSetAdmin(member.address)}
                            className="p-2 hover:bg-blue-100 rounded text-blue-600"
                            title={t('group.setAdmin')}
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const duration = prompt(t('group.muteDuration'));
                            if (duration) handleMuteUser(member.address, parseInt(duration));
                          }}
                          className="p-2 hover:bg-yellow-100 rounded text-yellow-600"
                          title={t('group.mute')}
                        >
                          <MessageSquareOff className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveMember(member.address)}
                          className="p-2 hover:bg-red-100 rounded text-red-600"
                          title={t('group.remove')}
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 群公告 */}
          {activeTab === 'announcement' && (
            <div className="space-y-4">
              <textarea
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                disabled={!canManage}
                rows={10}
                placeholder={t('group.announcementPlaceholder')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              {canManage && (
                <button
                  onClick={handleUpdateGroup}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {t('common.save')}
                </button>
              )}
            </div>
          )}

          {/* 邀请链接 */}
          {activeTab === 'invite' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('group.inviteLink')}
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={`${window.location.origin}/join/${group._id}`}
                    readOnly
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                  <button
                    onClick={handleCopyInviteLink}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Copy className="w-4 h-4 inline mr-2" />
                    {t('common.copy')}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('group.qrCode')}
                </label>
                <button
                  onClick={handleGenerateQRCode}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <QrCode className="w-4 h-4 inline mr-2" />
                  {t('group.generateQRCode')}
                </button>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">
                  {t('group.shareTitle')}
                </h4>
                <p className="text-sm text-blue-700">
                  {t('group.shareDescription')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
