import { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Phone, Maximize2, Minimize2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function VideoCall({ friend, onEnd, isIncoming = false, callType = 'video' }) {
  const { t } = useTranslation();
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callStatus, setCallStatus] = useState(isIncoming ? 'incoming' : 'calling');
  const [callDuration, setCallDuration] = useState(0);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (callStatus === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      cleanup();
    };
  }, [callStatus]);

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: true
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // 这里应该集成 WebRTC 或 Jitsi Meet
      // 简化版本：直接显示本地视频
      setCallStatus('connected');
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert(t('chat.call.mediaError'));
      onEnd();
    }
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
  };

  const handleAnswer = () => {
    setCallStatus('connecting');
    initializeMedia();
  };

  const handleReject = () => {
    onEnd();
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleEndCall = () => {
    cleanup();
    onEnd();
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`fixed inset-0 bg-gray-900 z-50 flex flex-col ${isFullscreen ? '' : 'rounded-lg m-4'}`}>
      {/* 顶部信息栏 */}
      <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/50 to-transparent z-10">
        <div className="flex items-center justify-between text-white">
          <div>
            <h3 className="text-xl font-semibold">{friend.nickname}</h3>
            <p className="text-sm opacity-75">
              {callStatus === 'calling' && t('chat.call.calling')}
              {callStatus === 'incoming' && t('chat.call.incoming')}
              {callStatus === 'connecting' && t('chat.call.connecting')}
              {callStatus === 'connected' && formatDuration(callDuration)}
            </p>
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 视频区域 */}
      <div className="flex-1 relative">
        {/* 远程视频（全屏） */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {/* 如果没有远程视频，显示头像 */}
        {callStatus !== 'connected' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <img
                src={friend.avatar}
                alt={friend.nickname}
                className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white/20"
              />
              {callStatus === 'calling' && (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 本地视频（小窗口） */}
        {isVideoEnabled && (
          <div className="absolute top-20 right-6 w-32 h-40 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* 底部控制栏 */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent">
        <div className="flex items-center justify-center space-x-6">
          {/* 来电时的接听/拒绝按钮 */}
          {callStatus === 'incoming' && (
            <>
              <button
                onClick={handleReject}
                className="p-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
              >
                <PhoneOff className="w-8 h-8" />
              </button>
              <button
                onClick={handleAnswer}
                className="p-6 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-lg"
              >
                <Phone className="w-8 h-8" />
              </button>
            </>
          )}

          {/* 通话中的控制按钮 */}
          {(callStatus === 'calling' || callStatus === 'connecting' || callStatus === 'connected') && (
            <>
              {/* 视频开关 */}
              {callType === 'video' && (
                <button
                  onClick={toggleVideo}
                  className={`p-4 rounded-full transition-colors shadow-lg ${
                    isVideoEnabled
                      ? 'bg-white/20 text-white hover:bg-white/30'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </button>
              )}

              {/* 麦克风开关 */}
              <button
                onClick={toggleAudio}
                className={`p-4 rounded-full transition-colors shadow-lg ${
                  isAudioEnabled
                    ? 'bg-white/20 text-white hover:bg-white/30'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </button>

              {/* 挂断 */}
              <button
                onClick={handleEndCall}
                className="p-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
              >
                <PhoneOff className="w-8 h-8" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
