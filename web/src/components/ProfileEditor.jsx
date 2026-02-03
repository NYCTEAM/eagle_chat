import { useState, useRef } from 'react';
import { Camera, Save, X, Upload, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export default function ProfileEditor({ onClose, onUpdate }) {
  const { t } = useTranslation();
  const { user, setUser } = useAuthStore();
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert(t('profile.invalidImageType'));
      return;
    }

    // 检查文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert(t('profile.imageTooLarge'));
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setAvatar(response.data.avatar);
        alert(t('profile.avatarUpdated'));
      }
    } catch (error) {
      console.error('Upload avatar error:', error);
      alert(error.response?.data?.message || t('common.error'));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await api.put('/users/me', {
        nickname,
        bio
      });

      if (response.data.success) {
        setUser(response.data.user);
        alert(t('profile.updateSuccess'));
        onUpdate(response.data.user);
        onClose();
      }
    } catch (error) {
      console.error('Update profile error:', error);
      alert(error.response?.data?.message || t('common.error'));
    }
  };

  const handleUseNFTAvatar = async () => {
    // TODO: 集成 NFT 选择器
    alert(t('profile.nftAvatarComingSoon'));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{t('profile.edit')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* 头像 */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={avatar}
                alt={nickname}
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 shadow-lg"
              >
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <button
              onClick={handleUseNFTAvatar}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              <Wallet className="w-4 h-4 inline mr-2" />
              {t('profile.useNFTAvatar')}
            </button>
          </div>

          {/* 钱包地址 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('profile.walletAddress')}
            </label>
            <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-600 font-mono text-sm">
              {user?.address}
            </div>
          </div>

          {/* 昵称 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('profile.nickname')}
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={50}
              placeholder={t('profile.nicknamePlaceholder')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {nickname.length}/50
            </p>
          </div>

          {/* 个性签名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('profile.bio')}
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
              rows={4}
              placeholder={t('profile.bioPlaceholder')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {bio.length}/200
            </p>
          </div>

          {/* 按钮 */}
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="w-4 h-4 inline mr-2" />
              {t('common.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
