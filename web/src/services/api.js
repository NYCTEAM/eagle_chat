import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('eagle-chat-auth')
        if (token) {
          const auth = JSON.parse(token)
          if (auth.state?.token) {
            config.headers.Authorization = `Bearer ${auth.state.token}`
          }
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          // Token过期，清除本地存储
          localStorage.removeItem('eagle-chat-auth')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // 认证相关
  async login(address, signature, message) {
    return this.client.post('/auth/login', { address, signature, message })
  }

  async getProfile() {
    return this.client.get('/auth/profile')
  }

  async updateProfile(data) {
    return this.client.put('/auth/profile', data)
  }

  async uploadAvatar(file) {
    const formData = new FormData()
    formData.append('avatar', file)
    return this.client.post('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }

  // 消息相关
  async sendMessage(data) {
    return this.client.post('/messages/send', data)
  }

  async getChatHistory(address, limit = 50, offset = 0) {
    return this.client.get(`/messages/chat/${address}`, {
      params: { limit, offset }
    })
  }

  async getGroupHistory(groupId, limit = 50, offset = 0) {
    return this.client.get(`/messages/group/${groupId}`, {
      params: { limit, offset }
    })
  }

  async markAsRead(messageId) {
    return this.client.put(`/messages/${messageId}/read`)
  }

  async deleteMessage(messageId) {
    return this.client.delete(`/messages/${messageId}`)
  }

  async uploadFile(file, filename) {
    const formData = new FormData()
    if (filename) {
      formData.append('file', file, filename)
    } else {
      formData.append('file', file)
    }
    return this.client.post('/messages/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }

  async getUnreadCount() {
    return this.client.get('/messages/unread')
  }

  // 用户相关
  async searchUsers(query) {
    return this.client.get('/friends/search', { params: { query } })
  }

  async getUserByAddress(address) {
    return this.client.get(`/users/${address}`)
  }

  // 好友相关
  async getFriends() {
    return this.client.get('/friends')
  }

  async sendFriendRequest(address, message) {
    return this.client.post('/friends/request', { friendAddress: address, message })
  }

  async acceptFriendRequest(requestId) {
    return this.client.post(`/friends/accept/${requestId}`)
  }

  async declineFriendRequest(requestId) {
    return this.client.post(`/friends/reject/${requestId}`)
  }

  async removeFriend(address) {
    return this.client.delete(`/friends/${address}`)
  }

  // 群组相关
  async getGroups() {
    return this.client.get('/groups')
  }

  async createGroup(data) {
    return this.client.post('/groups', data)
  }

  async getGroup(groupId) {
    return this.client.get(`/groups/${groupId}`)
  }

  async updateGroup(groupId, data) {
    return this.client.put(`/groups/${groupId}`, data)
  }

  async addMember(groupId, address) {
    return this.client.post(`/groups/${groupId}/members`, { address })
  }

  async removeMember(groupId, address) {
    return this.client.delete(`/groups/${groupId}/members/${address}`)
  }

  async leaveGroup(groupId) {
    return this.client.post(`/groups/${groupId}/leave`)
  }

  // 会议相关
  async getMeetings() {
    return this.client.get('/meetings')
  }

  async createMeeting(data) {
    return this.client.post('/meetings', data)
  }

  async getMeeting(meetingId) {
    return this.client.get(`/meetings/${meetingId}`)
  }

  async joinMeeting(meetingId) {
    return this.client.post(`/meetings/${meetingId}/join`)
  }
}

export default new ApiService()
