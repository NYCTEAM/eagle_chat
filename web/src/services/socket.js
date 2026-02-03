import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin

class SocketService {
  constructor() {
    this.socket = null
    this.connected = false
  }

  connect(token) {
    if (this.socket) {
      this.disconnect()
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    })

    this.socket.on('connect', () => {
      console.log('Socket connected')
      this.connected = true
    })

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected')
      this.connected = false
    })

    this.socket.on('error', (error) => {
      console.error('Socket error:', error)
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.connected = false
    }
  }

  // 发送消息
  sendMessage(data) {
    if (this.socket && this.connected) {
      this.socket.emit('send_message', data)
    }
  }

  // 加入群聊
  joinGroup(groupId) {
    if (this.socket && this.connected) {
      this.socket.emit('join_group', { groupId })
    }
  }

  // 离开群聊
  leaveGroup(groupId) {
    if (this.socket && this.connected) {
      this.socket.emit('leave_group', { groupId })
    }
  }

  // 正在输入
  typing(to, groupId) {
    if (this.socket && this.connected) {
      this.socket.emit('typing', { to, groupId })
    }
  }

  // 停止输入
  stopTyping(to, groupId) {
    if (this.socket && this.connected) {
      this.socket.emit('stop_typing', { to, groupId })
    }
  }

  // 监听新消息
  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new_message', callback)
    }
  }

  // 监听用户在线状态
  onUserOnline(callback) {
    if (this.socket) {
      this.socket.on('user_online', callback)
    }
  }

  // 监听用户输入状态
  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user_typing', callback)
    }
  }

  onUserStopTyping(callback) {
    if (this.socket) {
      this.socket.on('user_stop_typing', callback)
    }
  }

  // 移除所有监听器
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners()
    }
  }
}

export default new SocketService()
