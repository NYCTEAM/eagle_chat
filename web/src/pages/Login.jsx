import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Wallet, MessageCircle } from 'lucide-react'
import walletService from '../services/wallet'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const handleMetaMaskLogin = async () => {
    if (!walletService.isMetaMaskInstalled()) {
      toast.error('请先安装MetaMask钱包')
      window.open('https://metamask.io/download/', '_blank')
      return
    }

    setLoading(true)
    try {
      // 1. 连接MetaMask
      toast.loading('连接MetaMask...', { id: 'connect' })
      const address = await walletService.connectMetaMask()
      toast.success('钱包已连接', { id: 'connect' })

      // 2. 生成签名消息
      const message = `欢迎登录 Eagle Chat!\n\n地址: ${address}\n时间: ${new Date().toISOString()}\n\n点击签名即可登录，此操作不会产生任何费用。`

      // 3. 请求签名
      toast.loading('请在MetaMask中签名...', { id: 'sign' })
      const signature = await walletService.signMessage(message)
      toast.success('签名成功', { id: 'sign' })

      // 4. 发送到后端验证
      toast.loading('验证签名...', { id: 'verify' })
      const response = await api.login(address, signature, message)
      
      if (response.success) {
        setAuth(response.user, response.token)
        toast.success('登录成功！', { id: 'verify' })
        navigate('/chat')
      } else {
        throw new Error(response.message || '登录失败')
      }
    } catch (error) {
      console.error('登录失败:', error)
      toast.error(error.message || '登录失败，请重试', { id: 'verify' })
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
              Eagle Chat
            </h1>
            <p className="text-gray-600">
              基于钱包地址的去中心化聊天
            </p>
          </div>

          {/* 功能介绍 */}
          <div className="mb-8 space-y-3">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <p className="ml-3 text-sm text-gray-700">
                无需注册，使用钱包地址直接登录
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <p className="ml-3 text-sm text-gray-700">
                端到端加密，保护您的隐私
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <p className="ml-3 text-sm text-gray-700">
                支持群聊、视频会议、文件分享
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
            <span>{loading ? '连接中...' : '使用 MetaMask 登录'}</span>
          </button>

          {/* 提示信息 */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              没有MetaMask？
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 ml-1"
              >
                点击安装
              </a>
            </p>
          </div>

          {/* 底部信息 */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              登录即表示您同意我们的服务条款和隐私政策
            </p>
          </div>
        </div>

        {/* 版本信息 */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Eagle Chat v1.0 - Powered by Web3
          </p>
        </div>
      </div>
    </div>
  )
}
