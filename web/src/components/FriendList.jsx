import { useState, useEffect } from 'react';
import { UserPlus, Search, MoreVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

export default function FriendList({ onSelectFriend }) {
  const { t } = useTranslation();
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddFriend, setShowAddFriend] = useState(false);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const response = await api.get('/friends');
      if (response.data.success) {
        setFriends(response.data.friends);
      }
    } catch (error) {
      console.error('Load friends error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* 搜索栏 */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('chat.search.placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setShowAddFriend(true)}
          className="mt-2 w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          {t('chat.friends.addFriend')}
        </button>
      </div>

      {/* 好友列表 */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            {t('common.loading')}...
          </div>
        ) : filteredFriends.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>{t('chat.friends.noFriends')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredFriends.map((friend) => (
              <div
                key={friend.address}
                onClick={() => onSelectFriend(friend)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={friend.avatar}
                      alt={friend.nickname}
                      className="w-12 h-12 rounded-full"
                    />
                    {friend.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {friend.nickname}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {friend.online ? t('chat.status.online') : t('chat.status.offline')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {friend.bio || `${friend.address.slice(0, 6)}...${friend.address.slice(-4)}`}
                    </p>
                  </div>
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 添加好友弹窗 */}
      {showAddFriend && (
        <AddFriendModal
          onClose={() => setShowAddFriend(false)}
          onSuccess={loadFriends}
        />
      )}
    </div>
  );
}

function AddFriendModal({ onClose, onSuccess }) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (searchQuery.length < 3) return;

    try {
      setLoading(true);
      const response = await api.get(`/friends/search?query=${searchQuery}`);
      if (response.data.success) {
        setSearchResults(response.data.users);
      }
    } catch (error) {
      console.error('Search users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (address) => {
    try {
      const response = await api.post('/friends/request', { friendAddress: address });
      if (response.data.success) {
        alert(t('chat.friends.requestSent'));
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Add friend error:', error);
      alert(error.response?.data?.message || t('common.error'));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">{t('chat.friends.addFriend')}</h3>
        
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            placeholder={t('chat.friends.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={loading || searchQuery.length < 3}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('common.search')}
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto mb-4">
          {loading ? (
            <div className="text-center py-4 text-gray-500">{t('common.loading')}...</div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-4 text-gray-500">{t('chat.friends.noResults')}</div>
          ) : (
            <div className="space-y-2">
              {searchResults.map((user) => (
                <div key={user.address} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img src={user.avatar} alt={user.nickname} className="w-10 h-10 rounded-full" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{user.nickname}</h4>
                      <p className="text-xs text-gray-500">{user.address.slice(0, 10)}...</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddFriend(user.address)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    {t('common.add')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          {t('common.close')}
        </button>
      </div>
    </div>
  );
}
