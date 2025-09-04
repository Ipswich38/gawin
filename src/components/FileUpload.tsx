'use client';

import { useState, useRef, useCallback } from 'react';

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  extractedText?: string;
}

interface FileUploadProps {
  onFilesReady: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number;
  allowedTypes?: string[];
}

const FileUpload = ({ 
  onFilesReady, 
  maxFiles = 5, 
  maxFileSize = 10 * 1024 * 1024,
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
}: FileUploadProps) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [processingCount, setProcessingCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateFileId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type not supported. Allowed: ${allowedTypes.map(type => type.split('/')[1]).join(', ')}`
      };
    }

    if (file.size > maxFileSize) {
      return {
        isValid: false,
        error: `File too large. Maximum size: ${Math.round(maxFileSize / (1024 * 1024))}MB`
      };
    }

    return { isValid: true };
  };

  const createFilePreview = async (file: File): Promise<string | undefined> => {
    if (file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      });
    }
    return undefined;
  };

  const processFiles = useCallback(async (fileList: File[]) => {
    if (files.length + fileList.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed. Currently have ${files.length} files.`);
      return;
    }

    const newFiles: UploadedFile[] = [];

    for (const file of fileList) {
      const validation = validateFile(file);
      const preview = await createFilePreview(file);

      const uploadedFile: UploadedFile = {
        id: generateFileId(),
        file,
        preview,
        status: validation.isValid ? 'pending' : 'error',
        error: validation.error
      };

      newFiles.push(uploadedFile);
    }

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    onFilesReady(updatedFiles);
  }, [files, maxFiles, onFilesReady]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    processFiles(selectedFiles);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFiles]);

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    onFilesReady(updatedFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    return '📎';
  };

  // Handle paste events
  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = Array.from(e.clipboardData?.items || []);
    const imageItems = items.filter(item => item.type.startsWith('image/'));
    
    if (imageItems.length > 0) {
      e.preventDefault();
      const pastedFiles = imageItems.map(item => item.getAsFile()).filter(Boolean) as File[];
      processFiles(pastedFiles);
    }
  }, [processFiles]);

  // Attach global paste handler
  useState(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  });

  return (
    <div className="w-full">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={allowedTypes.join(',')}
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
          ${isDragActive 
            ? 'border-emerald-400 bg-emerald-50/50' 
            : 'border-white/30 bg-white/10 hover:bg-white/20'
          }
        `}
      >
        <div className="flex flex-col items-center space-y-2">
          <div className="text-2xl">
            {isDragActive ? '📥' : '📎'}
          </div>
          <div className="text-sm font-medium text-white">
            {isDragActive ? 'Drop files here' : 'Click to upload or drag files'}
          </div>
          <div className="text-xs text-white/70">
            Images, PDFs • Max {maxFiles} files • {Math.round(maxFileSize / (1024 * 1024))}MB each
          </div>
          <div className="text-xs text-white/50">
            💡 Tip: You can also paste screenshots with Ctrl+V
          </div>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((uploadedFile) => (
            <div
              key={uploadedFile.id}
              className="flex items-center space-x-3 p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg"
            >
              {/* File preview/icon */}
              <div className="flex-shrink-0">
                {uploadedFile.preview ? (
                  <img
                    src={uploadedFile.preview}
                    alt={uploadedFile.file.name}
                    className="w-10 h-10 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-lg">
                    {getFileIcon(uploadedFile.file.type)}
                  </div>
                )}
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {uploadedFile.file.name}
                </div>
                <div className="text-xs text-white/70">
                  {formatFileSize(uploadedFile.file.size)}
                  {uploadedFile.status === 'error' && uploadedFile.error && (
                    <span className="text-red-400 ml-2">• {uploadedFile.error}</span>
                  )}
                </div>
              </div>

              {/* Status indicator */}
              <div className="flex-shrink-0">
                {uploadedFile.status === 'pending' && (
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                )}
                {uploadedFile.status === 'success' && (
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                )}
                {uploadedFile.status === 'error' && (
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                )}
                {uploadedFile.status === 'uploading' && (
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                )}
              </div>

              {/* Remove button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(uploadedFile.id);
                }}
                className="flex-shrink-0 p-1 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          ))}

          {/* Processing status */}
          {processingCount > 0 && (
            <div className="text-center p-3 bg-blue-50/10 border border-blue-200/20 rounded-lg">
              <div className="text-sm text-white/80">
                Processing {processingCount} file{processingCount > 1 ? 's' : ''}...
              </div>
              <div className="flex justify-center mt-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;