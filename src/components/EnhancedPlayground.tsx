'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Mic, 
  Video, 
  Image, 
  FileText, 
  Database, 
  Brain, 
  Play,
  Pause,
  Settings,
  Download,
  Trash2,
  CheckCircle,
  AlertCircle,
  Activity,
  Zap
} from 'lucide-react';

interface TrainingFile {
  id: string;
  name: string;
  type: 'audio' | 'video' | 'image' | 'document' | 'dataset';
  size: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  insights?: string[];
}

interface TrainingSession {
  id: string;
  name: string;
  type: 'multi_modal' | 'voice_tuning' | 'visual_learning' | 'knowledge_base';
  files: TrainingFile[];
  status: 'active' | 'paused' | 'completed';
  progress: number;
  startTime: number;
  estimatedCompletion?: number;
}

export default function EnhancedPlayground() {
  const [activeSession, setActiveSession] = useState<TrainingSession | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<TrainingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');

  const handleFileUpload = useCallback(async (files: File[], type: TrainingFile['type']) => {
    const newFiles: TrainingFile[] = files.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      type,
      size: file.size,
      status: 'uploading',
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Simulate upload and processing
    newFiles.forEach(async (file, index) => {
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadedFiles(prev => 
          prev.map(f => f.id === file.id ? { ...f, progress } : f)
        );
      }

      // Set to processing
      setUploadedFiles(prev => 
        prev.map(f => f.id === file.id ? { ...f, status: 'processing', progress: 0 } : f)
      );

      // Simulate processing
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setUploadedFiles(prev => 
          prev.map(f => f.id === file.id ? { ...f, progress } : f)
        );
      }

      // Complete with insights
      const insights = generateTrainingInsights(file.type);
      setUploadedFiles(prev => 
        prev.map(f => f.id === file.id ? { 
          ...f, 
          status: 'completed', 
          progress: 100,
          insights 
        } : f)
      );
    });
  }, []);

  const generateTrainingInsights = (type: TrainingFile['type']): string[] => {
    const insights = {
      audio: [
        'Enhanced voice recognition patterns',
        'Improved emotional tone detection',
        'Better audio quality processing'
      ],
      video: [
        'Advanced motion tracking capabilities',
        'Enhanced object detection in motion',
        'Improved gesture recognition'
      ],
      image: [
        'Better object classification accuracy',
        'Enhanced color and texture recognition',
        'Improved scene understanding'
      ],
      document: [
        'Expanded knowledge base',
        'Enhanced text comprehension',
        'Better context understanding'
      ],
      dataset: [
        'Pattern recognition improvements',
        'Enhanced data correlation abilities',
        'Better predictive accuracy'
      ]
    };
    return insights[type] || ['Training completed successfully'];
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      // Determine file type based on extension
      const file = files[0];
      let type: TrainingFile['type'] = 'document';
      
      if (file.type.startsWith('audio/')) type = 'audio';
      else if (file.type.startsWith('video/')) type = 'video';
      else if (file.type.startsWith('image/')) type = 'image';
      else if (file.name.endsWith('.csv') || file.name.endsWith('.json')) type = 'dataset';
      
      handleFileUpload(files, type);
    }
  }, [handleFileUpload]);

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusIcon = (status: TrainingFile['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Activity className="animate-spin" size={16} />;
      case 'completed':
        return <CheckCircle className="text-green-400" size={16} />;
      case 'error':
        return <AlertCircle className="text-red-400" size={16} />;
    }
  };

  const getTypeIcon = (type: TrainingFile['type']) => {
    const icons = {
      audio: <Mic className="text-blue-400" size={20} />,
      video: <Video className="text-purple-400" size={20} />,
      image: <Image className="text-green-400" size={20} />,
      document: <FileText className="text-orange-400" size={20} />,
      dataset: <Database className="text-teal-400" size={20} />
    };
    return icons[type];
  };

  const renderUploadZone = () => (
    <div className="space-y-6">
      {/* Global Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all ${
          isDragging 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-gray-600 bg-gray-800/30'
        }`}
      >
        <motion.div
          animate={{ scale: isDragging ? 1.05 : 1 }}
          className="space-y-4"
        >
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
            <Upload className="text-blue-400" size={32} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Drop files anywhere to train Gawin
            </h3>
            <p className="text-gray-400">
              Support for audio, video, images, documents, and datasets
            </p>
          </div>
        </motion.div>
      </div>

      {/* Training Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { type: 'audio', title: 'Audio Training', color: 'blue', icon: Mic, accept: 'audio/*' },
          { type: 'video', title: 'Video Training', color: 'purple', icon: Video, accept: 'video/*' },
          { type: 'image', title: 'Image Training', color: 'green', icon: Image, accept: 'image/*' },
          { type: 'document', title: 'Document Training', color: 'orange', icon: FileText, accept: '.pdf,.doc,.docx,.txt' },
          { type: 'dataset', title: 'Dataset Training', color: 'teal', icon: Database, accept: '.csv,.json,.xlsx' }
        ].map((item) => {
          const IconComponent = item.icon;
          return (
            <motion.div
              key={item.type}
              whileHover={{ scale: 1.02 }}
              className={`bg-gradient-to-br from-${item.color}-500/10 to-${item.color}-600/10 border border-${item.color}-500/20 rounded-2xl p-4`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-10 h-10 bg-${item.color}-500/20 rounded-xl flex items-center justify-center`}>
                  <IconComponent className={`text-${item.color}-400`} size={20} />
                </div>
                <h4 className="text-white font-medium">{item.title}</h4>
              </div>
              <input
                type="file"
                accept={item.accept}
                multiple
                className="hidden"
                id={`${item.type}-upload`}
                onChange={(e) => handleFileUpload(Array.from(e.target.files || []), item.type as TrainingFile['type'])}
              />
              <label
                htmlFor={`${item.type}-upload`}
                className={`block w-full p-3 border border-${item.color}-500/30 rounded-xl text-center text-${item.color}-300 cursor-pointer hover:border-${item.color}-500/50 transition-colors text-sm`}
              >
                Upload {item.type} files
              </label>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const renderFileList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Training Files</h3>
        <div className="text-sm text-gray-400">
          {uploadedFiles.length} files • {uploadedFiles.filter(f => f.status === 'completed').length} processed
        </div>
      </div>

      {uploadedFiles.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Database size={48} className="mx-auto mb-4 opacity-50" />
          <p>No training files uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {uploadedFiles.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getTypeIcon(file.type)}
                  <div>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-gray-400 text-sm">
                      {formatFileSize(file.size)} • {file.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusIcon(file.status)}
                  <button
                    onClick={() => setUploadedFiles(prev => prev.filter(f => f.id !== file.id))}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {(file.status === 'uploading' || file.status === 'processing') && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-400">
                      {file.status === 'uploading' ? 'Uploading...' : 'Processing...'}
                    </span>
                    <span className="text-gray-400">{file.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${file.progress}%` }}
                      className="bg-blue-500 h-2 rounded-full"
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {/* Training Insights */}
              {file.status === 'completed' && file.insights && (
                <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <p className="text-green-400 text-sm font-medium mb-2">Training Insights:</p>
                  <ul className="space-y-1">
                    {file.insights.map((insight, index) => (
                      <li key={index} className="text-green-300 text-xs flex items-center space-x-2">
                        <CheckCircle size={12} />
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'upload', label: 'Upload & Train', icon: Upload },
    { id: 'files', label: 'Training Files', icon: Database },
    { id: 'sessions', label: 'Training Sessions', icon: Brain }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Training Playground
          </h2>
          <p className="text-gray-400">
            Multi-modal training environment for enhancing Gawin's capabilities
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm flex items-center space-x-1">
            <Zap size={12} />
            <span>Creator Access</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b border-gray-700/50">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <IconComponent size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {renderUploadZone()}
          </motion.div>
        )}

        {activeTab === 'files' && (
          <motion.div
            key="files"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {renderFileList()}
          </motion.div>
        )}

        {activeTab === 'sessions' && (
          <motion.div
            key="sessions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="text-center py-20">
              <Brain size={64} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Training Sessions</h3>
              <p className="text-gray-400">Advanced training session management coming soon...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}