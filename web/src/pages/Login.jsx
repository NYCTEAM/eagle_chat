import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Wallet, MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import walletService from '../services/wallet'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const handleMetaMaskLogin = async () => {
    if (!walletService.isMetaMaskInstalled()) {
      toast.error(t('errors.walletNotInstalled'))
      window.open('https://metamask.io/download/', '_blank')
      return
    }

    setLoading(true)
    try {
      // 1. 连接MetaMask
      toast.loading(t('login.steps.connect'), { id: 'connect' })
      const address = await walletService.connectMetaMask()
      toast.success(t('common.success'), { id: 'connect' })

      // 2. 生成签名消息
      const message = `${t('login.title')}\n\n${t('user.address')}: ${address}\n${t('time.today')}: ${new Date().toISOString()}\n\n${t('login.terms')}`

      // 3. 请求签名
      toast.loading(t('login.steps.sign'), { id: 'sign' })
      const signature = await walletService.signMessage(message)
      toast.success(t('common.success'), { id: 'sign' })

      // 4. 发送到后端验证
      toast.loading(t('login.steps.verify'), { id: 'verify' })
      const response = await api.login(address, signature, message)
      
      if (response.success) {
        setAuth(response.user, response.token)
        toast.success(t('success.loginSuccess'), { id: 'verify' })
        navigate('/chat')
      } else {
        throw new Error(response.message || t('errors.loginFailed'))
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.message || t('errors.loginFailed'), { id: 'verify' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('app.name')}
            </h1>
            <p className="text-gray-600">
              {t('app.tagline')}
            </p>
          </div>

          {/* 功能介绍 */}
          <div className="mb-8 space-y-3">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <p className="ml-3 text-sm text-gray-700">
                {t('login.features.noRegistration')}
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <p className="ml-3 text-sm text-gray-700">
                {t('login.features.encrypted')}
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <p className="ml-3 text-sm text-gray-700">
                {t('login.features.features')}
              </p>
            </div>
          </div>

          {/* 登录按钮 */}
          <button
            onClick={handleMetaMaskLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <Wallet className="w-6 h-6" />
            <span>{loading ? t('common.connecting') : t('login.connectWallet')}</span>
          </button>

          {/* 提示信息 */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              {t('login.noMetaMask')}
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 ml-1"
              >
                {t('login.installMetaMask')}
              </a>
            </p>
          </div>

          {/* 底部信息 */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              {t('login.terms')}
            </p>
          </div>
        </div>

        {/* 版本信息 */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            {t('app.name')} {t('app.version')} - {t('app.poweredBy')}
          </p>
        </div>
      </div>
    </div>
  )
}
