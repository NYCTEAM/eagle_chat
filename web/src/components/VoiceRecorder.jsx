import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function VoiceRecorder({ onSend, onCancel }) {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // 开始计时
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert(t('chat.voice.microphoneError'));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const playAudio = () => {
    if (audioBlob && audioRef.current) {
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setIsPlaying(true);
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob, recordingTime);
      handleCancel();
    }
  };

  const handleCancel = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    setAudioBlob(null);
    setIsPlaying(false);
    onCancel();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">{t('chat.voice.title')}</h3>
        
        <div className="flex flex-col items-center space-y-4">
          {/* 录音时间显示 */}
          <div className="text-4xl font-mono text-gray-900">
            {formatTime(recordingTime)}
          </div>

          {/* 波形动画（录音中） */}
          {isRecording && !isPaused && (
            <div className="flex items-center space-x-1 h-16">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-blue-500 rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          )}

          {/* 录音控制按钮 */}
          <div className="flex space-x-4">
            {!isRecording && !audioBlob && (
              <button
                onClick={startRecording}
                className="p-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <Mic className="w-8 h-8" />
              </button>
            )}

            {isRecording && (
              <>
                {isPaused ? (
                  <button
                    onClick={resumeRecording}
                    className="p-4 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                  >
                    <Play className="w-6 h-6" />
                  </button>
                ) : (
                  <button
                    onClick={pauseRecording}
                    className="p-4 bg-yellow-500 text-white rounded-full hover:bg-yellow-600"
                  >
                    <Pause className="w-6 h-6" />
                  </button>
                )}
                
                <button
                  onClick={stopRecording}
                  className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <Square className="w-6 h-6" />
                </button>
              </>
            )}

            {audioBlob && !isRecording && (
              <button
                onClick={isPlaying ? pauseAudio : playAudio}
                className="p-6 bg-blue-500 text-white rounded-full hover:bg-blue-600"
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
              </button>
            )}
          </div>

          {/* 提示文字 */}
          <p className="text-sm text-gray-500 text-center">
            {!isRecording && !audioBlob && t('chat.voice.clickToStart')}
            {isRecording && !isPaused && t('chat.voice.recording')}
            {isRecording && isPaused && t('chat.voice.paused')}
            {audioBlob && !isRecording && t('chat.voice.preview')}
          </p>

          {/* 操作按钮 */}
          <div className="flex space-x-4 w-full">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {t('common.cancel')}
            </button>
            
            {audioBlob && (
              <button
                onClick={handleSend}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {t('common.send')}
              </button>
            )}
          </div>
        </div>

        {/* 隐藏的音频元素 */}
        <audio ref={audioRef} className="hidden" />
      </div>
    </div>
  );
}
