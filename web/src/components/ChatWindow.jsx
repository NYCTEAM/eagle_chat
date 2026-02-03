import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Mic, Users, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import EmojiPicker from 'emoji-picker-react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import socketService from '../services/socket';
import VoiceRecorder from './VoiceRecorder';
import FileUploader from './FileUploader';
import VideoCall from './VideoCall';

export default function ChatWindow({ target, type = 'direct' }) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [callType, setCallType] = useState('video');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (target) {
      loadMessages();
      
      socketService.on('new_message', handleNewMessage);
      socketService.on('user_typing', handleUserTyping);
      socketService.on('user_stop_typing', handleStopTyping);

      return () => {
        socketService.off('new_message', handleNewMessage);
        socketService.off('user_typing', handleUserTyping);
        socketService.off('user_stop_typing', handleStopTyping);
      };
    }
  }, [target, type]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      let data;
      if (type === 'group') {
        data = await api.getGroupHistory(target.id);
      } else {
        data = await api.getChatHistory(target.address);
      }
      
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error('Load messages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (message) => {
    if (type === 'group') {
      if (message.groupId === target.id) {
        setMessages(prev => [...prev, message]);
      }
    } else {
      if (message.from === target.address || message.to === target.address) {
        setMessages(prev => [...prev, message]);
      }
    }
  };

  const handleUserTyping = (data) => {
    const isRelevant = type === 'group' 
      ? data.groupId === target.id 
      : data.from === target.address;

    if (isRelevant) {
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
    const isRelevant = type === 'group' 
      ? data.groupId === target.id 
      : data.from === target.address;

    if (isRelevant) {
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
      const payload = {
        type: 'text',
        content: newMessage
      };

      if (type === 'group') {
        payload.groupId = target.id;
      } else {
        payload.to = target.address;
      }

      const data = await api.sendMessage(payload);

      if (data.success) {
        setMessages(prev => [...prev, data.data]);
        setNewMessage('');
        setShowEmojiPicker(false);
        
        socketService.emit('send_message', {
          ...payload,
          content: newMessage
        });
      }
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  const handleTyping = () => {
    const payload = type === 'group' ? { groupId: target.id } : { to: target.address };
    socketService.emit('typing', payload);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      socketService.emit('stop_typing', payload);
    }, 1000);
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
  };

  const handleSendVoice = async (audioBlob, duration) => {
    try {
      const uploadData = await api.uploadFile(audioBlob, 'voice.webm');
      
      if (uploadData.success) {
        const fileUrl = uploadData.file.url;
        
        const payload = {
          type: 'voice',
          content: 'Voice Message',
          fileUrl: fileUrl,
          fileMimeType: 'audio/webm',
          duration: duration
        };

        if (type === 'group') {
          payload.groupId = target.id;
        } else {
          payload.to = target.address;
        }

        const messageData = await api.sendMessage(payload);

        if (messageData.success) {
          setMessages(prev => [...prev, messageData.data]);
          
          socketService.emit('send_message', {
            ...payload,
            content: fileUrl
          });
        }
      }
    } catch (error) {
      console.error('Send voice error:', error);
      alert(t('chat.voice.sendError'));
    }
  };

  const handleUploadFiles = async (files) => {
    try {
      for (const file of files) {
        const uploadData = await api.uploadFile(file);
        
        if (uploadData.success) {
          const fileInfo = uploadData.file;
          const msgType = fileInfo.mimeType.startsWith('image/') ? 'image' : 
                          fileInfo.mimeType.startsWith('video/') ? 'video' : 'file';
          
          const payload = {
            type: msgType,
            content: fileInfo.name,
            fileUrl: fileInfo.url,
            fileName: fileInfo.name,
            fileSize: fileInfo.size,
            fileMimeType: fileInfo.mimeType
          };

          if (type === 'group') {
            payload.groupId = target.id;
          } else {
            payload.to = target.address;
          }

          const messageData = await api.sendMessage(payload);

          if (messageData.success) {
            setMessages(prev => [...prev, messageData.data]);
            
            socketService.emit('send_message', {
              ...payload,
              content: fileInfo.url
            });
          }
        }
      }
    } catch (error) {
      console.error('Upload files error:', error);
      alert(t('chat.file.uploadError'));
    }
  };

  const handleStartCall = (callType) => {
    setCallType(callType);
    setShowVideoCall(true);
    
    // 通知对方来电
    if (type === 'direct') {
      socketService.emit('call_request', {
        to: target.address,
        type: callType
      });
    }
  };

  if (!target) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <p>{t('chat.selectFriend')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full relative">
      {/* 聊天头部 */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={target.avatar}
                alt={target.nickname || target.name}
                className={`w-10 h-10 ${type === 'group' ? 'rounded-lg' : 'rounded-full'}`}
              />
              {type === 'direct' && target.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{target.nickname || target.name}</h3>
              {type === 'direct' ? (
                <p className="text-xs text-gray-500">
                  {target.online ? t('chat.status.online') : t('chat.status.offline')}
                </p>
              ) : (
                <p className="text-xs text-gray-500">
                  {target.members?.length || 0} {t('group.members')}
                </p>
              )}
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
              {type === 'group' ? <Users className="w-5 h-5 text-gray-600" /> : <MoreVertical className="w-5 h-5 text-gray-600" />}
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
                      {message.type === 'text' && <p className="break-words">{message.content}</p>}
                      {message.type === 'image' && (
                        <img src={message.fileUrl} alt="Image" className="max-w-full rounded-lg" />
                      )}
                      {message.type === 'voice' && (
                        <audio controls src={message.fileUrl} className="w-full" />
                      )}
                      {message.type === 'file' && (
                        <a href={message.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center underline">
                          <Paperclip className="w-4 h-4 mr-1" />
                          {message.fileName || 'File'}
                        </a>
                      )}
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
            <span>{type === 'group' ? t('chat.someoneIsTyping') : target.nickname + ' ' + t('chat.isTyping')}</span>
          </div>
        )}
      </div>

      {/* 输入框 */}
      <div className="px-6 py-4 bg-white border-t border-gray-200 relative">
        {showEmojiPicker && (
          <div className="absolute bottom-full mb-2 left-6 z-10">
            <EmojiPicker onEmojiClick={onEmojiClick} />
          </div>
        )}
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
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
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
          friend={target} // VideoCall component needs update for groups, currently only direct support
          callType={callType}
          onEnd={() => setShowVideoCall(false)}
        />
      )}
    </div>
  );
}
