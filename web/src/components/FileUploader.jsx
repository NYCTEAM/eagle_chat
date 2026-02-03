import { useState, useRef } from 'react';
import { Upload, X, File, Image as ImageIcon, FileText, Music, Video as VideoIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function FileUploader({ onUpload, onCancel, maxSize = 50 * 1024 * 1024 }) {
  const { t } = useTranslation();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="w-8 h-8" />;
    if (fileType.startsWith('video/')) return <VideoIcon className="w-8 h-8" />;
    if (fileType.startsWith('audio/')) return <Music className="w-8 h-8" />;
    if (fileType.includes('pdf') || fileType.includes('document')) return <FileText className="w-8 h-8" />;
    return <File className="w-8 h-8" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // 检查文件大小
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      alert(t('chat.file.sizeError', { max: formatFileSize(maxSize) }));
      return;
    }

    setSelectedFiles(files);

    // 生成预览
    const newPreviews = files.map(file => {
      if (file.type.startsWith('image/')) {
        return {
          type: 'image',
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size
        };
      } else {
        return {
          type: 'file',
          name: file.name,
          size: file.size,
          fileType: file.type
        };
      }
    });

    setPreviews(newPreviews);
  };

  const handleRemoveFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    // 清理预览 URL
    if (previews[index].url) {
      URL.revokeObjectURL(previews[index].url);
    }
    
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      await onUpload(selectedFiles);
      handleCancel();
    } catch (error) {
      console.error('Upload error:', error);
      alert(t('chat.file.uploadError'));
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    // 清理所有预览 URL
    previews.forEach(preview => {
      if (preview.url) {
        URL.revokeObjectURL(preview.url);
      }
    });
    
    setSelectedFiles([]);
    setPreviews([]);
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">{t('chat.file.upload')}</h3>
          <button onClick={handleCancel} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 文件选择区域 */}
        {selectedFiles.length === 0 ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg text-gray-700 mb-2">{t('chat.file.clickToUpload')}</p>
            <p className="text-sm text-gray-500">
              {t('chat.file.supportedFormats')}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {t('chat.file.maxSize', { max: formatFileSize(maxSize) })}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {previews.map((preview, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                {/* 预览/图标 */}
                <div className="flex-shrink-0">
                  {preview.type === 'image' ? (
                    <img
                      src={preview.url}
                      alt={preview.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-600">
                      {getFileIcon(preview.fileType)}
                    </div>
                  )}
                </div>

                {/* 文件信息 */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{preview.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(preview.size)}</p>
                </div>

                {/* 删除按钮 */}
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            ))}

            {/* 添加更多文件 */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
              + {t('chat.file.addMore')}
            </button>
          </div>
        )}

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
        />

        {/* 操作按钮 */}
        {selectedFiles.length > 0 && (
          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleCancel}
              disabled={uploading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? t('chat.file.uploading') : t('common.send')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
