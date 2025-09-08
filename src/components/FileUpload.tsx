'use client';

// FileUpload component has been disabled
// OCR and file processing functionality is no longer available

interface FileUploadProps {
  onFilesReady?: (files: any[]) => void;
  maxFiles?: number;
  maxFileSize?: number;
  allowedTypes?: string[];
}

const FileUpload = (props: FileUploadProps) => {
  return (
    <div className="w-full">
      <div className="relative border-2 border-dashed rounded-xl p-6 text-center cursor-not-allowed opacity-50 bg-gray-100">
        <div className="flex flex-col items-center space-y-2">
          <div className="text-2xl">🚫</div>
          <div className="text-sm font-medium text-gray-600">
            File upload is currently disabled
          </div>
          <div className="text-xs text-gray-500">
            OCR and file processing features are not available
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;