import { useState, useEffect } from 'react';
import { X, Search, Check, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

export default function CreateGroupModal({ onClose, onSuccess }) {
  const { t } = useTranslation();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const data = await api.getFriends();
      if (data.success) {
        setFriends(data.friends);
      }
    } catch (error) {
      console.error('Load friends error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFriend = (address) => {
    if (selectedFriends.includes(address)) {
      setSelectedFriends(selectedFriends.filter(id => id !== address));
    } else {
      setSelectedFriends([...selectedFriends, address]);
    }
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      alert(t('group.nameRequired'));
      return;
    }
    if (selectedFriends.length === 0) {
      alert(t('group.membersRequired'));
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.createGroup({
        name: groupName,
        members: selectedFriends
      });

      if (response.success) {
        alert(t('common.success'));
        onSuccess(response.group);
        onClose();
      }
    } catch (error) {
      console.error('Create group error:', error);
      alert(t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 overflow-hidden shadow-xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{t('group.create')}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col p-4">
          {/* Group Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('group.name')}</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('group.namePlaceholder')}
            />
          </div>

          {/* Friends Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('common.search')}
            />
          </div>

          {/* Friends List */}
          <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
            {loading ? (
              <div className="p-4 text-center text-gray-500">{t('common.loading')}...</div>
            ) : filteredFriends.length === 0 ? (
              <div className="p-4 text-center text-gray-500">{t('chat.friends.noFriends')}</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredFriends.map(friend => (
                  <div
                    key={friend.address}
                    onClick={() => handleSelectFriend(friend.address)}
                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className={`w-5 h-5 border rounded mr-3 flex items-center justify-center ${
                      selectedFriends.includes(friend.address)
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300'
                    }`}>
                      {selectedFriends.includes(friend.address) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <img
                      src={friend.avatar}
                      alt={friend.nickname}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{friend.nickname}</h4>
                      <p className="text-xs text-gray-500 truncate">{friend.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-2 text-sm text-gray-500 text-right">
            {t('group.selectedMembers', { count: selectedFriends.length })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg mr-2 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleCreate}
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : (
              <Users className="w-4 h-4 mr-2" />
            )}
            {t('common.create')}
          </button>
        </div>
      </div>
    </div>
  );
}
