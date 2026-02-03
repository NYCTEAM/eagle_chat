import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, MessageCircle, Users, Video } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../store/authStore'
import socketService from '../services/socket'
import LanguageSwitcher from '../components/LanguageSwitcher'

export default function Chat() {
  const { t } = useTranslation()
  const { user, token, logout } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('chats')

  useEffect(() => {
    // 连接Socket.IO
    if (token) {
      socketService.connect(token)
    }

    return () => {
      socketService.disconnect()
    }
  }, [token])

  const handleLogout = () => {
    socketService.disconnect()
    logout()
    navigate('/login')
  }

  return (
    <div className="h-screen flex bg-gray-100">
      {/* 侧边栏 */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* 用户信息 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.nickname?.[0] || user?.address?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {user?.nickname || t('user.nickname')}
                </h3>
                <p className="text-xs text-gray-500">
                  {user?.address?.slice(0, 6)}...{user?.address?.slice(-4)}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={t('common.logout')}
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          {/* 语言切换器 */}
          <LanguageSwitcher />
        </div>

        {/* 标签页 */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'chats'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MessageCircle className="w-4 h-4 inline mr-2" />
            {t('chat.tabs.chats')}
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'groups'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            {t('chat.tabs.groups')}
          </button>
          <button
            onClick={() => setActiveTab('meetings')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'meetings'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Video className="w-4 h-4 inline mr-2" />
            {t('chat.tabs.meetings')}
          </button>
        </div>

        {/* 列表区域 */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'chats' && (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>{t('chat.empty.chats')}</p>
              <p className="text-sm mt-1">{t('chat.empty.chatsHint')}</p>
            </div>
          )}
          {activeTab === 'groups' && (
            <div className="p-4 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>{t('chat.empty.groups')}</p>
              <p className="text-sm mt-1">{t('chat.empty.groupsHint')}</p>
            </div>
          )}
          {activeTab === 'meetings' && (
            <div className="p-4 text-center text-gray-500">
              <Video className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>{t('chat.empty.meetings')}</p>
              <p className="text-sm mt-1">{t('chat.empty.meetingsHint')}</p>
            </div>
          )}
        </div>
      </div>

      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col">
        {/* 欢迎界面 */}
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-6">
              <MessageCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('chat.welcome.title')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('chat.welcome.subtitle')}
            </p>
            <div className="flex justify-center space-x-4">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                {t('chat.welcome.addFriend')}
              </button>
              <button className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                {t('chat.welcome.createGroup')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
