import { useEffect, useRef, useState } from 'react';
import { X, Mic, MicOff, Video, VideoOff, Monitor, Users, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';

export default function JitsiMeeting({ 
  roomName, 
  displayName, 
  isAudioOnly = false,
  participants = [],
  onClose,
  onParticipantJoined,
  onParticipantLeft
}) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [participantCount, setParticipantCount] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(isAudioOnly);

  useEffect(() => {
    // 加载 Jitsi Meet 外部 API
    const loadJitsiScript = () => {
      return new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    const initJitsi = async () => {
      try {
        await loadJitsiScript();
        
        const domain = 'meet.jit.si';
        const options = {
          roomName: roomName,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: displayName || user?.nickname || `User ${user?.address?.slice(0, 6)}`,
            email: `${user?.address}@eagle.chat`
          },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: isAudioOnly,
            enableWelcomePage: false,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            defaultLanguage: 'zh',
            toolbarButtons: [
              'microphone',
              'camera',
              'desktop',
              'fullscreen',
              'fodeviceselection',
              'hangup',
              'profile',
              'chat',
              'recording',
              'livestreaming',
              'etherpad',
              'sharedvideo',
              'settings',
              'raisehand',
              'videoquality',
              'filmstrip',
              'feedback',
              'stats',
              'shortcuts',
              'tileview',
              'videobackgroundblur',
              'download',
              'help',
              'mute-everyone',
              'security'
            ]
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            BRAND_WATERMARK_LINK: '',
            SHOW_POWERED_BY: false,
            DISPLAY_WELCOME_PAGE_CONTENT: false,
            DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
            APP_NAME: 'Eagle Chat',
            NATIVE_APP_NAME: 'Eagle Chat',
            PROVIDER_NAME: 'Eagle Swaps',
            MOBILE_APP_PROMO: false
          }
        };

        const api = new window.JitsiMeetExternalAPI(domain, options);
        jitsiApiRef.current = api;

        // 监听事件
        api.addEventListener('videoConferenceJoined', () => {
          setIsLoading(false);
          console.log('Joined conference');
        });

        api.addEventListener('participantJoined', (participant) => {
          setParticipantCount(prev => prev + 1);
          if (onParticipantJoined) {
            onParticipantJoined(participant);
          }
        });

        api.addEventListener('participantLeft', (participant) => {
          setParticipantCount(prev => Math.max(1, prev - 1));
          if (onParticipantLeft) {
            onParticipantLeft(participant);
          }
        });

        api.addEventListener('audioMuteStatusChanged', ({ muted }) => {
          setIsMuted(muted);
        });

        api.addEventListener('videoMuteStatusChanged', ({ muted }) => {
          setIsVideoMuted(muted);
        });

        api.addEventListener('readyToClose', () => {
          handleClose();
        });

      } catch (error) {
        console.error('Failed to load Jitsi Meet:', error);
        alert(t('call.loadError'));
        onClose();
      }
    };

    initJitsi();

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
    };
  }, [roomName, displayName, isAudioOnly]);

  const handleClose = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('hangup');
      jitsiApiRef.current.dispose();
    }
    onClose();
  };

  const toggleAudio = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('toggleAudio');
    }
  };

  const toggleVideo = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('toggleVideo');
    }
  };

  const toggleScreenShare = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('toggleShareScreen');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* 顶部信息栏 */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent z-10">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold">
              {isAudioOnly ? t('call.audioCall') : t('call.videoCall')}
            </h3>
            <div className="flex items-center space-x-2 text-sm">
              <Users className="w-4 h-4" />
              <span>{participantCount} {t('call.participants')}</span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Jitsi Meet 容器 */}
      <div ref={jitsiContainerRef} className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center text-white">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p>{t('call.connecting')}</p>
            </div>
          </div>
        )}
      </div>

      {/* 底部控制栏（简化版，Jitsi 自带完整控制栏） */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-colors ${
              isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
          </button>

          {!isAudioOnly && (
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition-colors ${
                isVideoMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {isVideoMuted ? <VideoOff className="w-6 h-6 text-white" /> : <Video className="w-6 h-6 text-white" />}
            </button>
          )}

          <button
            onClick={toggleScreenShare}
            className="p-4 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            <Monitor className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={handleClose}
            className="p-6 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
          >
            <Phone className="w-6 h-6 text-white transform rotate-135" />
          </button>
        </div>
      </div>
    </div>
  );
}
