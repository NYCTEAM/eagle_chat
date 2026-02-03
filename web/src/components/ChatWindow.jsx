import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Mic } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import socketService from '../services/socket';
import VoiceRecorder from './VoiceRecorder';
import FileUploader from './FileUploader';
import VideoCall from './VideoCall';

export default function ChatWindow({ friend }) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [callType, setCallType] = useState('video');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (friend) {
      loadMessages();
      
      // 监听新消息
      socketService.on('new_message', handleNewMessage);
      socketService.on('user_typing', handleUserTyping);
      socketService.on('user_stop_typing', handleStopTyping);

      return () => {
        socketService.off('new_message', handleNewMessage);
        socketService.off('user_typing', handleUserTyping);
        socketService.off('user_stop_typing', handleStopTyping);
      };
    }
  }, [friend]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/messages/${friend.address}`);
      if (response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Load messages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (message) => {
    if (message.from === friend.address || message.to === friend.address) {
      setMessages(prev => [...prev, message]);
    }
  };

  const handleUserTyping = (data) => {
    if (data.from === friend.address) {
      setIsTyping(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    }
  };

  const handleStopTyping = (data) => {
    if (data.from === friend.address) {
      setIsTyping(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    try {
      const response = await api.post('/messages', {
        to: friend.address,
        type: 'text',
        content: newMessage
      });

      if (response.data.success) {
        setMessages(prev => [...prev, response.data.message]);
        setNewMessage('');
        
        // 通过 Socket.IO 发送
        socketService.emit('send_message', {
          to: friend.address,
          type: 'text',
          content: newMessage
        });
      }
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  const handleTyping = () => {
    socketService.emit('typing', { to: friend.address });
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      socketService.emit('stop_typing', { to: friend.address });
    }, 1000);
  };

  const handleSendVoice = async (audioBlob, duration) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice.webm');
      formData.append('to', friend.address);
      formData.append('type', 'voice');
      formData.append('duration', duration);

      const response = await api.post('/messages/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setMessages(prev => [...prev, response.data.message]);
        socketService.emit('send_message', {
          to: friend.address,
          type: 'voice',
          content: response.data.message.content,
          duration
        });
      }
    } catch (error) {
      console.error('Send voice error:', error);
      alert(t('chat.voice.sendError'));
    }
  };

  const handleUploadFiles = async (files) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('to', friend.address);

      const response = await api.post('/messages/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        response.data.messages.forEach(msg => {
          setMessages(prev => [...prev, msg]);
          socketService.emit('send_message', {
            to: friend.address,
            type: msg.type,
            content: msg.content
          });
        });
      }
    } catch (error) {
      console.error('Upload files error:', error);
      throw error;
    }
  };

  const handleStartCall = (type) => {
    setCallType(type);
    setShowVideoCall(true);
    
    // 通知对方来电
    socketService.emit('call_request', {
      to: friend.address,
      type
    });
  };

  if (!friend) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <p>{t('chat.selectFriend')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* 聊天头部 */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={friend.avatar}
                alt={friend.nickname}
                className="w-10 h-10 rounded-full"
              />
              {friend.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{friend.nickname}</h3>
              <p className="text-xs text-gray-500">
                {friend.online ? t('chat.status.online') : t('chat.status.offline')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => handleStartCall('audio')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={t('chat.call.audio')}
            >
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <button 
              onClick={() => handleStartCall('video')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={t('chat.call.video')}
            >
              <Video className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {loading ? (
          <div className="text-center text-gray-500">{t('common.loading')}...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500">
            <p>{t('chat.noMessages')}</p>
            <p className="text-sm mt-1">{t('chat.startConversation')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isOwn = message.from === user?.address;
              return (
                <div
                  key={message._id || index}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        isOwn
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      <p className="break-words">{message.content}</p>
                    </div>
                    <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
        
        {isTyping && (
          <div className="flex items-center space-x-2 text-gray-500 text-sm mt-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>{friend.nickname} {t('chat.isTyping')}</span>
          </div>
        )}
      </div>

      {/* 输入框 */}
      <div className="px-6 py-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowVoiceRecorder(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={t('chat.voice.record')}
          >
            <Mic className="w-5 h-5 text-gray-600" />
          </button>
          <button
            type="button"
            onClick={() => setShowFileUploader(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={t('chat.file.upload')}
          >
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>
          <button
            type="button"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={t('chat.emoji.title')}
          >
            <Smile className="w-5 h-5 text-gray-600" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder={t('chat.typeMessage')}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* 语音录制弹窗 */}
      {showVoiceRecorder && (
        <VoiceRecorder
          onSend={handleSendVoice}
          onCancel={() => setShowVoiceRecorder(false)}
        />
      )}

      {/* 文件上传弹窗 */}
      {showFileUploader && (
        <FileUploader
          onUpload={handleUploadFiles}
          onCancel={() => setShowFileUploader(false)}
        />
      )}

      {/* 视频/语音通话 */}
      {showVideoCall && (
        <VideoCall
          friend={friend}
          callType={callType}
          onEnd={() => setShowVideoCall(false)}
        />
      )}
    </div>
  );
}
