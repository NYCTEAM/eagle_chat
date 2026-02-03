import { ethers } from 'ethers'

class WalletService {
  constructor() {
    this.provider = null
    this.signer = null
  }

  // 检查MetaMask是否安装
  isMetaMaskInstalled() {
    return typeof window.ethereum !== 'undefined'
  }

  // 连接MetaMask
  async connectMetaMask() {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('请安装MetaMask钱包')
    }

    try {
      // 请求账户访问
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      
      // 创建provider和signer
      this.provider = new ethers.BrowserProvider(window.ethereum)
      this.signer = await this.provider.getSigner()
      
      // 获取地址
      const address = await this.signer.getAddress()
      
      return address
    } catch (error) {
      console.error('连接MetaMask失败:', error)
      throw error
    }
  }

  // 签名消息
  async signMessage(message) {
    if (!this.signer) {
      throw new Error('请先连接钱包')
    }

    try {
      const signature = await this.signer.signMessage(message)
      return signature
    } catch (error) {
      console.error('签名失败:', error)
      throw error
    }
  }

  // 获取当前地址
  async getAddress() {
    if (!this.signer) {
      throw new Error('请先连接钱包')
    }
    return await this.signer.getAddress()
  }

  // 监听账户变化
  onAccountsChanged(callback) {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', callback)
    }
  }

  // 监听网络变化
  onChainChanged(callback) {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', callback)
    }
  }

  // 断开连接
  disconnect() {
    this.provider = null
    this.signer = null
  }
}

export default new WalletService()
