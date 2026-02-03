import { useState } from 'react';
import { Video, Phone, Users, X, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import JitsiMeeting from './JitsiMeeting';
import api from '../services/api';

export default function GroupCall({ group, onClose }) {
  const { t } = useTranslation();
  const [showMeeting, setShowMeeting] = useState(false);
  const [callType, setCallType] = useState('video'); // 'video' or 'audio'
  const [isCreating, setIsCreating] = useState(false);

  const handleStartCall = async (type) => {
    try {
      setIsCreating(true);
      setCallType(type);

      // 创建会议记录
      const response = await api.post('/meetings', {
        title: `${group.name} - ${type === 'video' ? t('call.videoCall') : t('call.audioCall')}`,
        groupId: group._id,
        type: type,
        scheduledAt: Date.now()
      });

      if (response.data.success) {
        setShowMeeting(true);
        
        // 通知群成员
        // TODO: 通过 Socket.IO 发送通知
      }
    } catch (error) {
      console.error('Start call error:', error);
      alert(error.response?.data?.message || t('common.error'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleCloseMeeting = () => {
    setShowMeeting(false);
    onClose();
  };

  if (showMeeting) {
    return (
      <JitsiMeeting
        roomName={`eagle-chat-group-${group._id}`}
        displayName={group.name}
        isAudioOnly={callType === 'audio'}
        participants={group.members}
        onClose={handleCloseMeeting}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{t('call.startGroupCall')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 群信息 */}
        <div className="flex items-center space-x-4 mb-8 p-4 bg-gray-50 rounded-lg">
          <img
            src={group.avatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${group._id}`}
            alt={group.name}
            className="w-16 h-16 rounded-lg"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{group.name}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{group.members?.length || 0} {t('group.members')}</span>
            </div>
          </div>
        </div>

        {/* 通话类型选择 */}
        <div className="space-y-4 mb-6">
          <button
            onClick={() => handleStartCall('video')}
            disabled={isCreating}
            className="w-full flex items-center justify-between p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                <Video className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-lg">{t('call.videoCall')}</h4>
                <p className="text-sm text-gray-600">{t('call.videoCallDescription')}</p>
              </div>
            </div>
            <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
              →
            </div>
          </button>

          <button
            onClick={() => handleStartCall('audio')}
            disabled={isCreating}
            className="w-full flex items-center justify-between p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                <Phone className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-lg">{t('call.audioCall')}</h4>
                <p className="text-sm text-gray-600">{t('call.audioCallDescription')}</p>
              </div>
            </div>
            <div className="text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
              →
            </div>
          </button>
        </div>

        {/* 提示信息 */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">{t('call.notice')}</p>
              <ul className="list-disc list-inside space-y-1">
                <li>{t('call.noticeItem1')}</li>
                <li>{t('call.noticeItem2')}</li>
                <li>{t('call.noticeItem3')}</li>
              </ul>
            </div>
          </div>
        </div>

        {isCreating && (
          <div className="mt-4 text-center text-gray-600">
            <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
            {t('call.creating')}
          </div>
        )}
      </div>
    </div>
  );
}
