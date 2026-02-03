import { useState, useRef } from 'react';
import { X, Camera, Save, Copy, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export default function ProfileSettings({ onClose }) {
  const { t } = useTranslation();
  const { user, setUser } = useAuthStore();
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await api.updateProfile({ nickname, bio });
      if (response.success) {
        setUser(response.user);
        alert(t('common.success'));
        onClose();
      }
    } catch (error) {
      console.error('Update profile error:', error);
      alert(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const response = await api.uploadAvatar(file);
      if (response.success) {
        // Update user state with new avatar
        const updatedUser = { ...user, avatar: response.avatar };
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Upload avatar error:', error);
      alert(t('common.error'));
    } finally {
      setUploading(false);
    }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(user.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{t('settings.profile')}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative cursor-pointer group" onClick={handleAvatarClick}>
              <img
                src={user?.avatar || '/eagle-icon.svg'}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white" />
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-white bg-opacity-70 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <p className="mt-2 text-sm text-gray-500">{t('settings.changeAvatar')}</p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('user.nickname')}</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('user.nicknamePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('user.bio')}</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="3"
                placeholder={t('user.bioPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('user.address')}</label>
              <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg">
                <span className="text-sm text-gray-600 truncate flex-1 font-mono">{user.address}</span>
                <button
                  onClick={handleCopyAddress}
                  className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                  title={t('common.copy')}
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
                </button>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center pt-4 border-t border-gray-100">
              <label className="text-sm font-medium text-gray-700 mb-3">{t('user.myQRCode')}</label>
              <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                <QRCodeSVG
                  value={JSON.stringify({ type: 'user', address: user.address })}
                  size={120}
                  level="M"
                  includeMargin={true}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">{t('user.scanToAdd')}</p>
            </div>
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
            onClick={handleSave}
            disabled={loading || uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
