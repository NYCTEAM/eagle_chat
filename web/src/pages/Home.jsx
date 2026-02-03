import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MessageCircle, Shield, Users, Video, Zap, Globe } from 'lucide-react'
import LanguageSwitcher from '../components/LanguageSwitcher'

export default function Home() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const features = [
    {
      icon: Shield,
      title: t('login.features.noRegistration'),
      description: '使用Web3钱包直接登录，无需注册账号'
    },
    {
      icon: MessageCircle,
      title: '实时聊天',
      description: '支持文字、图片、视频、文件等多种消息类型'
    },
    {
      icon: Users,
      title: '群聊管理',
      description: '创建群聊、管理成员、设置管理员权限'
    },
    {
      icon: Video,
      title: '视频会议',
      description: '集成Jitsi Meet，支持多人音视频通话'
    },
    {
      icon: Zap,
      title: '端到端加密',
      description: '消息加密传输，保护您的隐私安全'
    },
    {
      icon: Globe,
      title: '多语言支持',
      description: '支持10种语言，覆盖全球用户'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* 导航栏 */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">{t('app.name')}</span>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {t('login.connectWallet')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            {t('app.tagline')}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            基于Web3技术的去中心化聊天平台，使用钱包地址登录，保护您的隐私，享受安全的通信体验
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              🚀 立即开始
            </button>
            <button
              onClick={() => window.open('https://github.com/NYCTEAM/eagle_chat', '_blank')}
              className="px-8 py-4 bg-white text-gray-700 border-2 border-gray-300 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              📚 查看文档
            </button>
          </div>
        </div>

        {/* 特性展示 */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            ✨ 核心特性
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 统计数据 */}
        <div className="mt-24 bg-white rounded-3xl shadow-xl p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10+</div>
              <div className="text-gray-600">支持的语言</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-gray-600">开源免费</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">在线服务</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">
            准备好开始了吗？
          </h2>
          <p className="text-xl mb-8 opacity-90">
            只需连接您的Web3钱包，即可立即开始使用
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            连接钱包开始使用 →
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">{t('app.name')}</span>
              </div>
              <p className="text-gray-400">
                {t('app.tagline')}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">快速链接</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">关于我们</a></li>
                <li><a href="#" className="hover:text-white transition-colors">使用文档</a></li>
                <li><a href="https://github.com/NYCTEAM/eagle_chat" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">联系我们</h3>
              <ul className="space-y-2 text-gray-400">
                <li>网站: eagleswaps.com</li>
                <li>Email: support@eagleswaps.com</li>
                <li>Telegram: @eagleswaps</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>{t('app.name')} {t('app.version')} - {t('app.poweredBy')}</p>
            <p className="mt-2">Made with ❤️ by Eagle Swaps Team</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
