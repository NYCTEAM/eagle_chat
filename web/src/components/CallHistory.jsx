import { useState, useEffect } from 'react';
import { Phone, Video, PhoneMissed, PhoneIncoming, PhoneOutgoing, Clock, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

export default function CallHistory({ onStartCall }) {
  const { t } = useTranslation();
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'missed', 'incoming', 'outgoing'

  useEffect(() => {
    loadCallHistory();
  }, []);

  const loadCallHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/calls/history');
      if (response.data.success) {
        setCalls(response.data.calls);
      }
    } catch (error) {
      console.error('Load call history error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCallIcon = (call) => {
    if (call.status === 'missed') {
      return <PhoneMissed className="w-5 h-5 text-red-500" />;
    }
    if (call.direction === 'incoming') {
      return <PhoneIncoming className="w-5 h-5 text-green-500" />;
    }
    return <PhoneOutgoing className="w-5 h-5 text-blue-500" />;
  };

  const getCallTypeIcon = (type) => {
    return type === 'video' ? (
      <Video className="w-4 h-4" />
    ) : (
      <Phone className="w-4 h-4" />
    );
  };

  const formatDuration = (seconds) => {
    if (!seconds) return t('call.noAnswer');
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const filteredCalls = calls.filter(call => {
    if (filter === 'all') return true;
    if (filter === 'missed') return call.status === 'missed';
    return call.direction === filter;
  });

  return (
    <div className="flex flex-col h-full">
      {/* 筛选标签 */}
      <div className="flex border-b border-gray-200 px-4">
        {[
          { key: 'all', label: t('call.all') },
          { key: 'missed', label: t('call.missed') },
          { key: 'incoming', label: t('call.incoming') },
          { key: 'outgoing', label: t('call.outgoing') }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-3 font-medium transition-colors ${
              filter === key
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 通话列表 */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            {t('common.loading')}...
          </div>
        ) : filteredCalls.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Phone className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>{t('call.noHistory')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredCalls.map((call) => (
              <div
                key={call._id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onStartCall && onStartCall(call)}
              >
                <div className="flex items-center space-x-4">
                  {/* 通话图标 */}
                  <div className="flex-shrink-0">
                    {getCallIcon(call)}
                  </div>

                  {/* 联系人信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {call.isGroup ? (
                          <>
                            <Users className="w-4 h-4 inline mr-1" />
                            {call.groupName}
                          </>
                        ) : (
                          call.participantName
                        )}
                      </h4>
                      {getCallTypeIcon(call.type)}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(call.startedAt)}</span>
                      {call.duration && (
                        <>
                          <span>•</span>
                          <span>{formatDuration(call.duration)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 快速操作 */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartCall && onStartCall({ ...call, type: 'video' });
                      }}
                      className="p-2 hover:bg-blue-100 rounded-full text-blue-600 transition-colors"
                      title={t('call.videoCall')}
                    >
                      <Video className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartCall && onStartCall({ ...call, type: 'audio' });
                      }}
                      className="p-2 hover:bg-green-100 rounded-full text-green-600 transition-colors"
                      title={t('call.audioCall')}
                    >
                      <Phone className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
