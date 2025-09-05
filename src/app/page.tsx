'use client';

// import { Button } from "@/components/ui/Button"; // Unused import
import { useEffect, useState } from "react";
import StudyCommons from "@/components/StudyCommons";
import CodingMentor from "@/components/AICodeEditor";
import QuizGenerator from "@/components/QuizGenerator";
import MessageRenderer from "@/components/MessageRenderer";
import { databaseService } from "@/lib/services/databaseService";

// ChatInterface Component - Fixed syntax error
function ChatInterface({ user, onLogout }: { user: { full_name?: string; email: string }; onLogout: () => void }) {
  const [input, setInput] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{id: number, role: 'user' | 'assistant', content: string, timestamp: string}>>([]);
  const [chatHistory, setChatHistory] = useState<Array<{id: number, title: string, timestamp: string, preview: string}>>([]);
  const [cognitiveProcess, setCognitiveProcess] = useState<string>('');
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const [showStudyCommons, setShowStudyCommons] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [showQuizGenerator, setShowQuizGenerator] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0); // Real online user count
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showSpacesDropdown, setShowSpacesDropdown] = useState(false);

  // Update active users count periodically
  useEffect(() => {
    const updateActiveUsersCount = () => {
      try {
        // First try local storage (immediate detection)
        const activeUsersList = JSON.parse(localStorage.getItem('studyCommons_activeUsers') || '[]');
        const twoMinutesAgo = Date.now() - (2 * 60 * 1000);
        const recentUsers = activeUsersList.filter((user: any) => user.lastSeen > twoMinutesAgo);
        setOnlineUsers(recentUsers.length);
        
        // Also try database (for cross-device sync)
        databaseService.getActiveUsers().then(dbUsers => {
          if (dbUsers.length > recentUsers.length) {
            setOnlineUsers(dbUsers.length);
          }
        }).catch(() => {
          // Database failed, keep using local count
          console.log('Using local user count:', recentUsers.length);
        });
        
      } catch (error) {
        console.error('Error fetching active users:', error);
        setOnlineUsers(0);
      }
    };

    // Initial load
    updateActiveUsersCount();

    // Update every 15 seconds for faster detection
    const interval = setInterval(updateActiveUsersCount, 15000);

    // Listen for localStorage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'studyCommons_activeUsers') {
        updateActiveUsersCount();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSpacesDropdown) {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-spaces-dropdown]')) {
          setShowSpacesDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSpacesDropdown]);

  // File handling functions
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'text/csv',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (file.size > maxSize) {
      return { isValid: false, error: 'File too large (max 10MB)' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Unsupported file type' };
    }

    return { isValid: true };
  };

  const processFiles = async (files: File[]) => {
    const validFiles: any[] = [];
    
    for (const file of files.slice(0, 5 - uploadedFiles.length)) {
      const validation = validateFile(file);
      if (!validation.isValid) {
        console.warn(`File ${file.name}: ${validation.error}`);
        continue;
      }

      // Create preview for images
      let preview = '';
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
      }

      validFiles.push({
        id: Date.now() + Math.random(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview
      });
    }

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (id: number) => {
    setUploadedFiles(prev => {
      const updated = prev.filter(f => f.id !== id);
      // Revoke object URLs to prevent memory leaks
      prev.filter(f => f.id === id).forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
      return updated;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData?.items || []);
    const imageItems = items.filter(item => item.type.startsWith('image/'));
    
    if (imageItems.length > 0) {
      e.preventDefault();
      const pastedFiles = imageItems
        .map(item => item.getAsFile())
        .filter(Boolean) as File[];
      processFiles(pastedFiles);
    }
  };

  const handleFileClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*,.pdf,.txt,.csv,.docx,.xlsx';
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0) {
        processFiles(files);
      }
    };
    input.click();
  };

  // Helper function to process AI response and extract cognitive indicators
  const processAIResponse = (rawResponse: string) => {
    // Look for thinking patterns and extract cognitive process hints
    const thinkingPatterns = [
      /thinking about|considering|analyzing|evaluating/gi,
      /let me think|let me consider|I need to/gi,
      /this seems like|this appears to be|this looks like/gi,
      /first|second|third|next|then|finally/gi,
      /math|calculation|compute|solve/gi,
      /code|programming|algorithm|function/gi,
      /creative|story|write|compose/gi,
      /grammar|language|translate/gi
    ];

    let cognitiveHint = '';
    
    // Extract subtle cognitive indicators
    if (thinkingPatterns[0].test(rawResponse)) cognitiveHint = 'analyzing...';
    else if (thinkingPatterns[1].test(rawResponse)) cognitiveHint = 'processing...';
    else if (thinkingPatterns[2].test(rawResponse)) cognitiveHint = 'evaluating...';
    else if (thinkingPatterns[3].test(rawResponse)) cognitiveHint = 'structuring...';
    else if (thinkingPatterns[4].test(rawResponse)) cognitiveHint = 'computing...';
    else if (thinkingPatterns[5].test(rawResponse)) cognitiveHint = 'coding...';
    else if (thinkingPatterns[6].test(rawResponse)) cognitiveHint = 'creating...';
    else if (thinkingPatterns[7].test(rawResponse)) cognitiveHint = 'understanding...';
    else cognitiveHint = 'thinking...';

    // Remove explicit thinking blocks and verbose reasoning
    const cleanResponse = rawResponse
      .replace(/<think>[\s\S]*?<\/think>/gi, '') // Remove <think> tags
      .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '') // Remove <thinking> tags
      .replace(/\*\*Thinking:\*\*[\s\S]*?(?=\n\n|$)/gi, '') // Remove **Thinking:** blocks
      .replace(/Let me think about this[\s\S]*?(?=\n\n|$)/gi, '') // Remove verbose thinking
      .replace(/I need to consider[\s\S]*?(?=\n\n|$)/gi, '') // Remove consideration blocks
      .replace(/First, let me analyze[\s\S]*?(?=\n\n|$)/gi, '') // Remove analysis blocks
      .replace(/I'm DeepSeek-R1/gi, 'I\'m Gawin AI') // Replace DeepSeek identity
      .replace(/DeepSeek-R1/gi, 'Gawin AI') // Replace any DeepSeek references
      .replace(/DeepSeek/gi, 'Gawin AI') // Replace DeepSeek mentions
      .replace(/Mixtral/gi, 'Gawin AI') // Replace Mixtral mentions
      .replace(/Llama/gi, 'Gawin AI') // Replace Llama mentions
      .replace(/Qwen/gi, 'Gawin AI') // Replace Qwen mentions
      .replace(/Groq/gi, 'Gawin AI') // Replace Groq mentions
      // Clean up formatting for better readability
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold asterisks but keep content
      .replace(/\*(.*?)\*/g, '$1') // Remove italic asterisks but keep content
      .replace(/###\s*/g, '') // Remove ### markdown headers
      .replace(/##\s*/g, '') // Remove ## markdown headers
      .replace(/#\s*/g, '') // Remove # markdown headers
      .replace(/^\d+\.\s+\*\*(.*?)\*\*:/gm, '$1:') // Clean numbered bold items
      .replace(/^\s*-\s+\*\*(.*?)\*\*:/gm, '• $1:') // Clean bullet points with bold
      .replace(/^\s*-\s+/gm, '• ') // Convert - to bullets
      .replace(/^\s*\n+/gm, '') // Remove extra newlines
      .trim();

    return { cleanResponse, cognitiveHint };
  };

  const promptSuggestions = [
    "Explain quantum computing in simple terms",
    "Help me debug this Python code",
    "What's the difference between React and Vue?",
    "Solve this calculus problem step by step", 
    "Write a creative story about robots",
    "How do neural networks work?",
    "Create a study plan for machine learning",
    "Translate this text to Spanish",
    "Check my grammar and improve this essay",
    "Generate a business plan for a startup"
  ];

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const typePrompt = () => {
      const suggestion = promptSuggestions[Math.floor(Math.random() * promptSuggestions.length)];
      setCurrentPrompt('');
      setIsTyping(true);
      
      let charIndex = 0;
      const typeChar = () => {
        if (charIndex < suggestion.length) {
          setCurrentPrompt(suggestion.slice(0, charIndex + 1));
          charIndex++;
          timeoutId = setTimeout(typeChar, 50 + Math.random() * 30);
        } else {
          setIsTyping(false);
          timeoutId = setTimeout(() => {
            // Clear and start new suggestion after 3 seconds
            setCurrentPrompt('');
            setTimeout(typePrompt, 500);
          }, 3000);
        }
      };
      
      typeChar();
    };

    typePrompt();
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if we have content (text or files)
    const hasText = input.trim().length > 0;
    const hasFiles = uploadedFiles.length > 0;
    
    if ((!hasText && !hasFiles) || isLoading || isProcessingFiles) {
      return;
    }

    // Create user message with file context if present
    let userContent = input.trim();
    if (hasFiles && !hasText) {
      userContent = "Please analyze the uploaded files.";
    } else if (hasFiles && hasText) {
      userContent = `${input.trim()}\n\n📎 ${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''} attached`;
    }

    const userMessage = {
      id: Date.now(),
      role: 'user' as const,
      content: userContent,
      timestamp: new Date().toLocaleTimeString()
    };
    
    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    const currentInput = input.trim();
    const currentFiles = [...uploadedFiles];
    setInput('');
    setUploadedFiles([]);
      
      try {
        // Handle file upload and OCR processing
        if (hasFiles) {
          setIsProcessingFiles(true);
          setCognitiveProcess('🔍 Gawin AI • scanning and analyzing your documents...');
          
          try {
            const formData = new FormData();
            currentFiles.forEach(uploadedFile => {
              formData.append('files', uploadedFile.file);
            });
            formData.append('query', currentInput || 'Please analyze these files');

            const ocrResponse = await fetch('/api/ocr', {
              method: 'POST',
              body: formData
            });

            const ocrData = await ocrResponse.json();
            
            setIsProcessingFiles(false);
            
            if (ocrData.success && ocrData.data) {
              // Show AI analysis if available
              if (ocrData.data.aiAnalysis) {
                setTimeout(() => {
                  const assistantMessage = {
                    id: Date.now() + 1,
                    role: 'assistant' as const,
                    content: ocrData.data.aiAnalysis,
                    timestamp: new Date().toLocaleTimeString()
                  };
                  
                  setMessages(prev => [...prev, assistantMessage]);
                  setCognitiveProcess('');
                }, 1000);
              } else if (ocrData.data.extractedText) {
                // Show extracted text if no AI analysis
                setTimeout(() => {
                  const assistantMessage = {
                    id: Date.now() + 1,
                    role: 'assistant' as const,
                    content: `I've successfully extracted text from your ${ocrData.data.filesProcessed} file${ocrData.data.filesProcessed > 1 ? 's' : ''}:\n\n${ocrData.data.extractedText}\n\n*Would you like me to analyze this content or answer any questions about it?*`,
                    timestamp: new Date().toLocaleTimeString()
                  };
                  
                  setMessages(prev => [...prev, assistantMessage]);
                  setCognitiveProcess('');
                }, 1000);
              } else {
                // Show processing results
                const results = ocrData.data.analysisResults.map((result: any) => {
                  if (result.status === 'success') {
                    return `✅ ${result.filename}: Text extracted successfully`;
                  } else if (result.status === 'error') {
                    return `❌ ${result.filename}: ${result.error}`;
                  } else {
                    return `ℹ️ ${result.filename}: ${result.message}`;
                  }
                }).join('\n');
                
                setTimeout(() => {
                  const assistantMessage = {
                    id: Date.now() + 1,
                    role: 'assistant' as const,
                    content: `File Processing Results:\n\n${results}`,
                    timestamp: new Date().toLocaleTimeString()
                  };
                  
                  setMessages(prev => [...prev, assistantMessage]);
                  setCognitiveProcess('');
                }, 1000);
              }
            } else {
              throw new Error(ocrData.error || 'File processing failed');
            }
            
            return; // Exit early for file processing
            
          } catch (fileError) {
            console.error('File processing error:', fileError);
            setIsProcessingFiles(false);
            
            const errorMessage = {
              id: Date.now() + 1,
              role: 'assistant' as const,
              content: `I encountered an issue processing your files: ${fileError instanceof Error ? fileError.message : 'Unknown error'}\n\nPlease try:\n• Checking file formats (Images: JPG, PNG, WebP; Documents: PDF)\n• Reducing file size (max 10MB each)\n• Uploading fewer files at once`,
              timestamp: new Date().toLocaleTimeString()
            };
            
            setMessages(prev => [...prev, errorMessage]);
            setCognitiveProcess('');
            return;
          }
        }
        
        // Regular text processing (no files)
        const isSTEM = /math|physics|chemistry|biology|calculus|algebra|equation|formula|scientific|theorem/.test(currentInput.toLowerCase());
        const isCoding = /code|program|function|class|variable|debug|algorithm|javascript|python|react|typescript|css|html/.test(currentInput.toLowerCase());
        const isWriting = /write|essay|story|letter|email|article|blog|creative|compose|grammar|spelling/.test(currentInput.toLowerCase());
        const isImageGeneration = /draw|create.*image|generate.*image|make.*image|paint|sketch|illustrate|picture|photo|artwork|visual/.test(currentInput.toLowerCase());
        
        // Handle image generation requests
        if (isImageGeneration && !hasFiles) {
          setCognitiveProcess('🎨 Gawin AI • creating your image...');
          
          const imageResponse = await fetch('/api/images', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt: currentInput.replace(/draw|create.*image|generate.*image|make.*image|paint|sketch|illustrate/gi, '').trim(),
              width: 1024,
              height: 1024,
              model: 'flux'
            }),
          });

          const imageData = await imageResponse.json();
          
          if (imageData.success && imageData.data?.image_url) {
            setTimeout(() => {
              const assistantMessage = {
                id: Date.now() + 1,
                role: 'assistant' as const,
                content: `I've created an image for you! Here it is:

![Generated Image](${imageData.data.image_url})

*Generated using Gawin AI with advanced image processing*`,
                timestamp: new Date().toLocaleTimeString()
              };
              
              setMessages(prev => [...prev, assistantMessage]);
              setCognitiveProcess('');
            }, 1000);
          } else {
            const errorMessage = {
              id: Date.now() + 1,
              role: 'assistant' as const,
              content: `I apologize, but I'm having trouble generating images right now. ${imageData.error || 'The image generation service may be temporarily overloaded.'}

You can try:
• Using simpler, shorter descriptions
• Trying again in a few minutes
• Using different keywords like "create" or "make" instead of "draw"

Gawin AI image generation sometimes experiences high demand, but usually works better after a brief wait.`,
              timestamp: new Date().toLocaleTimeString()
            };
            setMessages(prev => [...prev, errorMessage]);
            setCognitiveProcess('');
          }
          return;
        }
        
        // Use Groq API with intelligent fallback system (Groq -> HuggingFace -> DeepSeek -> Educational)
        const response = await fetch('/api/groq', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              { role: 'user', content: currentInput }
            ],
            action: isCoding ? 'code' : isWriting ? 'writing' : isSTEM ? 'analysis' : 'chat',
            module: 'general'
          }),
        });

        const data = await response.json();
        
        console.log('API Response:', data); // Debug logging
        
        if (data.success && data.data && data.data.response) {
          // Process the AI response to extract cognitive indicators and clean content
          const { cleanResponse, cognitiveHint } = processAIResponse(data.data.response);
          
          // Show model info and cognitive process briefly
          const modelUsed = data.data.model_used || 'Gawin AI';
          const taskType = data.data.task_type || 'general';
          const modelHint = '🤖 Gawin AI';
          
          setCognitiveProcess(`${modelHint} • ${cognitiveHint}`);
          
          setTimeout(() => {
            const assistantMessage = {
              id: Date.now() + 1,
              role: 'assistant' as const,
              content: cleanResponse,
              timestamp: new Date().toLocaleTimeString()
            };
            
            setMessages(prev => [...prev, assistantMessage]);
            setCognitiveProcess(''); // Clear cognitive indicator
          }, 1000); // Show cognitive process for 1 second
          
          // Add to chat history
          const newChat = {
            id: Date.now(),
            title: currentInput.length > 30 ? currentInput.substring(0, 30) + '...' : currentInput,
            timestamp: 'Just now',
            preview: currentInput
          };
          setChatHistory(prev => [newChat, ...prev]);
        } else {
          // Handle error or unexpected response format
          console.warn('Unexpected response format:', data);
          
          let errorContent;
          if (data.error) {
            errorContent = `I encountered an issue: ${data.error}. Please try again.`;
          } else if (!data.success) {
            errorContent = "I'm having trouble processing your request right now. Please try again in a moment.";
          } else {
            errorContent = "I received an unexpected response format. Please try rephrasing your question.";
          }
          
          const errorMessage = {
            id: Date.now() + 1,
            role: 'assistant' as const,
            content: errorContent,
            timestamp: new Date().toLocaleTimeString()
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      } catch (error) {
        console.error('Chat error:', error);
        const errorMessage = {
          id: Date.now() + 1,
          role: 'assistant' as const,
          content: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.',
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        setIsProcessingFiles(false);
        setCognitiveProcess('');
      }
  };

  // Copy function for AI responses
  const copyToClipboard = async (text: string, messageId: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000); // Clear after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#fffbeb' }}>
      {/* Premium Header with Glassmorphism */}
      <header className="border-b border-white/20 bg-white/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {/* Hamburger Menu Button */}
              <button
                onClick={() => setShowSidePanel(!showSidePanel)}
                className="p-2.5 rounded-full hover:bg-white/40 transition-all backdrop-blur-sm shadow-lg"
                style={{ color: '#051a1c' }}
                title="Menu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M3 12h18M3 18h18"/>
                </svg>
              </button>
              <button 
                onClick={() => {
                  // Reset to landing page state
                  setMessages([]);
                  setInput('');
                  setCurrentPrompt('');
                  setIsLoading(false);
                  setCognitiveProcess('');
                  setShowHistory(false);
                  setShowStudyCommons(false);
                }}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <div className="w-8 h-8 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm" style={{ backgroundColor: '#051a1c' }}>
                  <span className="text-white font-semibold text-sm">G</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-medium leading-tight" style={{ color: '#051a1c' }}>Gawin</span>
                  <span className="text-xs opacity-50 leading-tight" style={{ color: '#051a1c' }}>Community Learning</span>
                </div>
              </button>
            </div>
            <div className="flex items-center space-x-3">
              {/* New Chat Button */}
              <button
                onClick={() => {
                  // Start a new chat
                  setMessages([]);
                  setInput('');
                  setCurrentPrompt('');
                  setIsLoading(false);
                  setCognitiveProcess('');
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-200/60 to-teal-300/60 backdrop-blur-sm rounded-full hover:from-emerald-300/70 hover:to-teal-400/70 transition-all shadow-lg"
                style={{ color: '#051a1c' }}
                title="Start New Chat"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                <span className="text-sm font-medium">New Chat</span>
              </button>
              
              {/* Spaces Dropdown */}
              <div className="relative" data-spaces-dropdown>
                <button
                  onClick={() => setShowSpacesDropdown(!showSpacesDropdown)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white/95 transition-all shadow-lg border border-gray-200/50"
                  style={{ color: '#051a1c' }}
                  title="Open Spaces"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                  </svg>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">Spaces</span>
                    <span className="text-xs opacity-60">Learning tools</span>
                  </div>
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    className={`transition-transform ${showSpacesDropdown ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6,9 12,15 18,9"/>
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showSpacesDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden z-50">
                    {/* Study Commons */}
                    <button
                      onClick={() => {
                        setShowStudyCommons(!showStudyCommons);
                        setShowSpacesDropdown(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 rounded-2xl"
                      style={{ backgroundColor: '#435b67' }}
                    >
                      <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-600">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white">Study Commons</div>
                        <div className="text-xs text-gray-300">{onlineUsers} learners online</div>
                      </div>
                    </button>

                    {/* Coding Mentor */}
                    <button
                      onClick={() => {
                        setShowCodeEditor(true);
                        setShowSpacesDropdown(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 rounded-2xl"
                      style={{ backgroundColor: '#435b67' }}
                    >
                      <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600">
                          <polyline points="16,18 22,12 16,6"/>
                          <polyline points="8,6 2,12 8,18"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white">Coding Mentor</div>
                        <div className="text-xs text-gray-300">AI-powered coding tutor</div>
                      </div>
                    </button>

                    {/* Quiz Generator */}
                    <button
                      onClick={() => {
                        setShowQuizGenerator(true);
                        setShowSpacesDropdown(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left rounded-2xl"
                      style={{ backgroundColor: '#435b67' }}
                    >
                      <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                          <circle cx="12" cy="12" r="3"/>
                          <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white">Quiz Generator</div>
                        <div className="text-xs text-gray-300">STEM practice tests</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Side Panel Overlay */}
      {showSidePanel && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowSidePanel(false)}
          />
          
          {/* Side Panel */}
          <div className="relative w-96 h-full bg-gradient-to-b from-white/95 to-white/90 backdrop-blur-xl border-r border-gray-200/50 shadow-2xl overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">G</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Gawin Menu</h2>
                    <p className="text-xs text-gray-500">Dashboard & Settings</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSidePanel(false)}
                  className="p-2 hover:bg-gray-200/70 rounded-full transition-all group"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:rotate-90 transition-transform">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              {/* User Profile Card */}
              <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 p-5 rounded-2xl mb-6 border border-blue-100/50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">
                      {(user.full_name || user.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-lg">{user.full_name || 'Gawin User'}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-xs text-green-600 font-medium">Online</span>
                    </div>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/50">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{messages.length}</div>
                    <div className="text-xs text-gray-500">Messages Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">{onlineUsers}</div>
                    <div className="text-xs text-gray-500">Online Learners</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
                  </svg>
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setMessages([]);
                      setInput('');
                      setCurrentPrompt('');
                      setIsLoading(false);
                      setCognitiveProcess('');
                      setShowSidePanel(false);
                    }}
                    className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 rounded-2xl transition-all border border-emerald-200/50 group"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto mb-2 text-emerald-600 group-hover:scale-110 transition-transform">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                    <div className="text-xs font-medium text-emerald-700">New Chat</div>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowCodeEditor(true);
                      setShowSidePanel(false);
                    }}
                    className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 rounded-2xl transition-all border border-purple-200/50 group"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto mb-2 text-purple-600 group-hover:scale-110 transition-transform">
                      <polyline points="16,18 22,12 16,6"/>
                      <polyline points="8,6 2,12 8,18"/>
                    </svg>
                    <div className="text-xs font-medium text-purple-700">Coding Mentor</div>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowQuizGenerator(true);
                      setShowSidePanel(false);
                    }}
                    className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-2xl transition-all border border-green-200/50 group"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto mb-2 text-green-600 group-hover:scale-110 transition-transform">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
                    </svg>
                    <div className="text-xs font-medium text-green-700">Take Quiz</div>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowStudyCommons(true);
                      setShowSidePanel(false);
                    }}
                    className="p-3 bg-gradient-to-r from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 rounded-2xl transition-all border border-orange-200/50 group"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto mb-2 text-orange-600 group-hover:scale-110 transition-transform">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <div className="text-xs font-medium text-orange-700">Study Commons</div>
                  </button>
                </div>
              </div>

              {/* Navigation Menu */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9,22 9,12 15,12 15,22"/>
                  </svg>
                  Navigation
                </h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => setShowHistory(!showHistory)}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-blue-50 rounded-2xl transition-all text-left border border-transparent hover:border-blue-200"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                        <path d="M3 3h18v18H3V3z"/>
                        <path d="M8 7h8"/>
                        <path d="M8 11h8"/>
                        <path d="M8 15h5"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-700">Chat History</div>
                      <div className="text-xs text-gray-500">View previous conversations</div>
                    </div>
                  </button>
                  
                  <button 
                    className="w-full flex items-center space-x-3 p-3 hover:bg-purple-50 rounded-2xl transition-all text-left border border-transparent hover:border-purple-200"
                  >
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2 2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-700">Settings</div>
                      <div className="text-xs text-gray-500">Preferences & configuration</div>
                    </div>
                  </button>
                  
                  <button 
                    className="w-full flex items-center space-x-3 p-3 hover:bg-green-50 rounded-2xl transition-all text-left border border-transparent hover:border-green-200"
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                        <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4"/>
                        <polyline points="9,11 12,14 15,11"/>
                        <path d="M12 2v12"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-700">Export Data</div>
                      <div className="text-xs text-gray-500">Download your conversations</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                  Recent Activity
                </h3>
                <div className="space-y-2">
                  {messages.slice(-3).map((message, index) => (
                    <div key={index} className="p-3 bg-gray-50/80 rounded-lg border border-gray-200/50">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${message.role === 'user' ? 'bg-blue-400' : 'bg-green-400'}`}></div>
                        <span className="text-xs text-gray-500 capitalize">{message.role}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400">{message.timestamp}</span>
                      </div>
                      <div className="text-sm text-gray-700 truncate">{message.content.substring(0, 60)}...</div>
                    </div>
                  )).reverse()}
                  {messages.length === 0 && (
                    <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-200/50 text-center">
                      <div className="text-xs text-gray-500">No recent activity</div>
                    </div>
                  )}
                </div>
              </div>

              {/* System Status */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                  System Status
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-green-50/80 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-gray-700">AI Services</span>
                    </div>
                    <span className="text-xs text-green-600 font-medium">Online</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-50/80 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-sm text-gray-700">Database</span>
                    </div>
                    <span className="text-xs text-blue-600 font-medium">Connected</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-purple-50/80 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-sm text-gray-700">Study Commons</span>
                    </div>
                    <span className="text-xs text-purple-600 font-medium">{onlineUsers} Active</span>
                  </div>
                </div>
              </div>

              {/* Sign Out Button */}
              <div className="border-t border-gray-200/60 pt-6">
                <button 
                  onClick={() => {
                    onLogout();
                    setShowSidePanel(false);
                  }}
                  className="w-full flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-600 rounded-2xl transition-all border border-red-200/50 group"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16,17 21,12 16,7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  <span className="font-semibold">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating History Panel Overlay */}
      {showHistory && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setShowHistory(false)}
          />
          
          {/* Floating History Panel */}
          <aside className="fixed top-0 left-0 h-full w-80 bg-white/30 backdrop-blur-xl border-r border-white/20 z-50 px-4 py-4 shadow-2xl">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium opacity-70" style={{ color: '#051a1c' }}>Chat History</h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-1.5 rounded-full hover:bg-white/40 transition-all"
                  style={{ color: '#051a1c' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <button
                onClick={() => {
                  // Start a new chat
                  setMessages([]);
                  setInput('');
                  setCurrentPrompt('');
                  setIsLoading(false);
                  setCognitiveProcess('');
                  setShowHistory(false); // Close history panel
                }}
                className="w-full px-3 py-2.5 rounded-full hover:opacity-90 transition-all text-xs font-medium shadow-md backdrop-blur-sm hover:scale-105 active:scale-95"
                style={{ backgroundColor: '#051a1c', color: 'white' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#00FFEF';
                  e.currentTarget.style.color = 'black';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#051a1c';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.backgroundColor = '#00FFEF';
                  e.currentTarget.style.color = 'black';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.backgroundColor = '#00FFEF';
                  e.currentTarget.style.color = 'black';
                }}
              >
                + New Chat
              </button>
            </div>
            
            <div className="space-y-2 max-h-[calc(100vh-120px)] overflow-y-auto">
              {chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  className="group p-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-2xl hover:bg-white/60 transition-all cursor-pointer shadow-sm relative"
                >
                  <div className="font-medium text-xs mb-1" style={{ color: '#051a1c' }}>
                    {chat.title}
                  </div>
                  <div className="text-xs opacity-50 mb-1" style={{ color: '#051a1c' }}>
                    {chat.timestamp}
                  </div>
                  <div className="text-xs opacity-40 truncate pr-6" style={{ color: '#051a1c' }}>
                    {chat.preview}
                  </div>
                  
                  {/* Delete button - shows on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setChatHistory(prev => prev.filter(c => c.id !== chat.id));
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-50 hover:opacity-80 transition-opacity p-1 rounded-md hover:bg-white/40"
                    style={{ color: '#051a1c' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              ))}
              
              {chatHistory.length === 0 && (
                <div className="text-center py-6">
                  <div className="text-2xl mb-2 opacity-50">💬</div>
                  <div className="text-xs opacity-50" style={{ color: '#051a1c' }}>
                    No chat history yet
                  </div>
                  <div className="text-xs opacity-30 mt-1" style={{ color: '#051a1c' }}>
                    Start a conversation to see it here
                  </div>
                </div>
              )}
            </div>
          </aside>
        </>
      )}


      {/* Study Commons */}
      {showStudyCommons && (
        <StudyCommons
          onMinimize={() => setShowStudyCommons(false)}
        />
      )}

      {/* Coding Mentor */}
      {showCodeEditor && (
        <CodingMentor
          onMinimize={() => setShowCodeEditor(false)}
        />
      )}

      {/* Quiz Generator */}
      {showQuizGenerator && (
        <QuizGenerator
          onMinimize={() => setShowQuizGenerator(false)}
        />
      )}

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6">
        {messages.length === 0 ? (
          /* Welcome Section */
          <div className="flex-1 flex flex-col justify-center py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-normal mb-3" style={{ color: '#051a1c' }}>
              Hello! I'm <span className="font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Gawin AI</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Your intelligent AI companion for learning. Ask me anything, or join our community to learn with fellow students!
            </p>
          </div>

          {/* Tool Chips - Enhanced with Model Indicators */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <span className="inline-flex items-center px-3 py-2 text-xs bg-white/50 backdrop-blur-md rounded-full hover:bg-white/70 hover:scale-105 transition-all cursor-pointer shadow-md border border-white/40 hover:shadow-lg" style={{ color: '#051a1c' }} onClick={() => setInput("Explain artificial intelligence concepts")}>
              🤖 AI Concepts
            </span>
            <span className="inline-flex items-center px-3 py-2 text-xs bg-gradient-to-r from-purple-100/70 to-purple-200/70 backdrop-blur-md rounded-full hover:from-purple-200/80 hover:to-purple-300/80 hover:scale-105 transition-all cursor-pointer shadow-md border border-purple-300/40 hover:shadow-lg" style={{ color: '#051a1c' }} onClick={() => setInput("Help me write Python code")}>
              💻 Coding Help
            </span>
            <span className="inline-flex items-center px-3 py-2 text-xs bg-gradient-to-r from-blue-100/70 to-blue-200/70 backdrop-blur-md rounded-full hover:from-blue-200/80 hover:to-blue-300/80 hover:scale-105 transition-all cursor-pointer shadow-md border border-blue-300/40 hover:shadow-lg" style={{ color: '#051a1c' }} onClick={() => setInput("Solve this calculus problem")}>
              🔢 Math Problems
            </span>
            <span className="inline-flex items-center px-3 py-2 text-xs bg-gradient-to-r from-green-100/70 to-green-200/70 backdrop-blur-md rounded-full hover:from-green-200/80 hover:to-green-300/80 hover:scale-105 transition-all cursor-pointer shadow-md border border-green-300/40 hover:shadow-lg" style={{ color: '#051a1c' }} onClick={() => setInput("Write a creative story")}>
              🎨 Creative Writing
            </span>
            <span className="inline-flex items-center px-3 py-2 text-xs bg-gradient-to-r from-green-100/70 to-green-200/70 backdrop-blur-md rounded-full hover:from-green-200/80 hover:to-green-300/80 hover:scale-105 transition-all cursor-pointer shadow-md border border-green-300/40 hover:shadow-lg" style={{ color: '#051a1c' }} onClick={() => setInput("Check my grammar and improve this essay")}>
              📝 Grammar & Writing
            </span>
            <span className="inline-flex items-center px-3 py-2 text-xs bg-white/50 backdrop-blur-md rounded-full hover:bg-white/70 hover:scale-105 transition-all cursor-pointer shadow-md border border-white/40 hover:shadow-lg" style={{ color: '#051a1c' }} onClick={() => setInput("Translate text to another language")}>
              🌍 Translation
            </span>
            <span className="inline-flex items-center px-3 py-2 text-xs bg-gradient-to-r from-blue-100/70 to-blue-200/70 backdrop-blur-md rounded-full hover:from-blue-200/80 hover:to-blue-300/80 hover:scale-105 transition-all cursor-pointer shadow-md border border-blue-300/40 hover:shadow-lg" style={{ color: '#051a1c' }} onClick={() => setInput("Explain quantum physics concepts")}>
              🔬 Science
            </span>
            <span className="inline-flex items-center px-3 py-2 text-xs bg-gradient-to-r from-pink-100/70 to-pink-200/70 backdrop-blur-md rounded-full hover:from-pink-200/80 hover:to-pink-300/80 hover:scale-105 transition-all cursor-pointer shadow-md border border-pink-300/40 hover:shadow-lg" style={{ color: '#051a1c' }} onClick={() => setInput("Draw a beautiful sunset over mountains")}>
              🎨 Image Generation
            </span>
            <span className="inline-flex items-center px-3 py-2 text-xs bg-white/50 backdrop-blur-md rounded-full hover:bg-white/70 hover:scale-105 transition-all cursor-pointer shadow-md border border-white/40 hover:shadow-lg" style={{ color: '#051a1c' }} onClick={() => setInput("Help me learn a new topic")}>
              📚 Learning
            </span>
          </div>


          {/* Typing Prompt Display */}
          <div className="text-center mb-8 h-8">
            <p className="text-base opacity-50 italic" style={{ color: '#051a1c' }}>
              {currentPrompt && (
                <>
                  "{currentPrompt}"
                  {isTyping && <span className="animate-pulse">|</span>}
                </>
              )}
            </p>
          </div>
        </div>
        ) : (
          /* Chat Messages */
          <div className="flex-1 flex flex-col py-8">
            <div className="flex-1 overflow-y-auto space-y-4 mb-8">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-2xl px-6 py-4 rounded-3xl relative ${
                      message.role === 'user'
                        ? 'bg-[#051a1c] text-white shadow-xl'
                        : 'bg-white/60 backdrop-blur-md text-[#051a1c] border border-white/40 shadow-lg'
                    }`}
                  >
                    <div className="text-base leading-relaxed">
                      {message.role === 'user' ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <MessageRenderer text={message.content} />
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className={`text-xs opacity-60 ${
                        message.role === 'user' ? 'text-white/70' : 'text-[#051a1c]/70'
                      }`}>
                        {message.timestamp}
                      </p>
                      {message.role === 'assistant' && (
                        <button
                          onClick={() => copyToClipboard(message.content, message.id)}
                          className="p-1.5 rounded-lg hover:bg-black/10 transition-colors opacity-60 hover:opacity-100"
                          title="Copy response"
                        >
                          {copiedMessageId === message.id ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 6L9 17l-5-5"/>
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {(isLoading || cognitiveProcess) && (
                <div className="flex justify-start">
                  <div className="bg-white/60 backdrop-blur-md text-[#051a1c] border border-white/40 shadow-lg px-6 py-4 rounded-3xl">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-[#051a1c] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-[#051a1c] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-[#051a1c] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-sm opacity-60 italic">
                        {cognitiveProcess || 'Gawin is thinking...'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Input Area with File Upload */}
        <div className="pb-8">
          <div className="max-w-3xl mx-auto">
            {/* File Previews */}
            {uploadedFiles.length > 0 && (
              <div className="mb-4 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl">
                <div className="flex flex-wrap gap-2">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-2 text-sm"
                    >
                      {file.preview ? (
                        <img src={file.preview} alt={file.name} className="w-6 h-6 rounded object-cover" />
                      ) : (
                        <div className="w-6 h-6 bg-gray-400 rounded flex items-center justify-center text-xs text-white">
                          📄
                        </div>
                      )}
                      <span className="text-white/90 truncate max-w-32">{file.name}</span>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="text-white/60 hover:text-white ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-white/60">
                  💡 Ask questions about your files or request analysis in your message
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="relative">
              <div 
                className={`relative ${isDragOver ? 'ring-2 ring-emerald-400 ring-opacity-50' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {/* File Upload Button */}
                <button
                  type="button"
                  onClick={handleFileClick}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 backdrop-blur-sm rounded-full flex items-center justify-center transition-all shadow-md hover:scale-105 z-10 ${
                    uploadedFiles.length > 0 
                      ? 'bg-emerald-400 text-black' 
                      : 'bg-white/20 text-white/70 hover:bg-white/30 hover:text-white'
                  }`}
                  title="upload file"
                >
                  {uploadedFiles.length > 0 ? (
                    <span className="text-xs font-bold">{uploadedFiles.length}</span>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                  )}
                </button>

                {/* Enhanced Input Field */}
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onPaste={handlePaste}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e as any);
                    }
                  }}
                  placeholder={isDragOver 
                    ? "Drop files here..." 
                    : uploadedFiles.length > 0 
                    ? "Ask questions about your files..." 
                    : "Message Gawin... (Paste images, drag & drop files, or click + to upload)"
                  }
                  className={`w-full pl-16 pr-16 py-5 text-white placeholder-white/70 transition-all resize-none text-lg focus:outline-none focus:ring-2 focus:ring-white/40 shadow-2xl backdrop-blur-md hover:shadow-3xl min-h-[60px] max-h-[200px] ${
                    isDragOver ? 'border-emerald-400 border-2' : ''
                  }`}
                  style={{ 
                    backgroundColor: isDragOver ? 'rgba(5, 26, 28, 0.95)' : '#051a1c',
                    borderRadius: '32px',
                    border: isDragOver ? '2px dashed #10b981' : '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)'
                  }}
                  rows={1}
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={(!input.trim() && uploadedFiles.length === 0) || isLoading || isProcessingFiles}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 backdrop-blur-sm text-black rounded-full flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 transition-all shadow-lg"
                  style={{
                    backgroundColor: ((input.trim() || uploadedFiles.length > 0) && !isLoading && !isProcessingFiles) 
                      ? '#00FFEF' 
                      : 'rgba(255,255,255,0.9)'
                  }}
                >
                  {isLoading || isProcessingFiles ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="m22 2-7 20-4-9-9-4Z"/>
                      <path d="M22 2 11 13"/>
                    </svg>
                  )}
                </button>
              </div>
            </form>

            {/* File Processing Status */}
            {isProcessingFiles && (
              <div className="mt-4 p-4 bg-blue-50/10 border border-blue-200/20 rounded-3xl">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm text-white/80">
                    🔍 Gawin is scanning and analyzing your documents...
                  </span>
                </div>
                <div className="text-xs text-white/60 mt-2">
                  This may take a moment for complex documents or images
                </div>
              </div>
            )}
          </div>
        </div>
        </main>
    </div>
  );
}

// AccessCodeModal Component
function AccessCodeModal({ onClose }: { onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [accessCode, setAccessCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Check access code
    if (accessCode.trim().toLowerCase() === 'gawinapp2025') {
      setSuccess('Access granted! Welcome to Gawin AI.');
      
      // Create a guest session
      const guestUser = {
        id: 'guest_' + Date.now(),
        email: 'guest@gawin.ai',
        full_name: 'Gawin User',
        subscription_tier: 'free',
        credits_remaining: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_verified: true,
        preferences: {
          theme: 'auto',
          language: 'en',
          notifications_enabled: true,
          ai_model_preference: 'gawin-ai',
          tutor_mode_default: false
        }
      };

      const guestSession = {
        access_token: 'guest_access_' + Date.now(),
        refresh_token: 'guest_refresh_' + Date.now(),
        expires_at: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        user: guestUser
      };

      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(guestUser));
      localStorage.setItem('session', JSON.stringify(guestSession));

      // Close modal and refresh to show authenticated state
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1000);
    } else {
      setError('Invalid access code. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-6">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/40">
          <div className="text-center mb-6">
            <div className="text-3xl mb-4">🔐</div>
            <h3 className="text-xl font-medium mb-2" style={{ color: '#051a1c' }}>
              Access Gawin AI
            </h3>
            <p className="text-sm opacity-70" style={{ color: '#051a1c' }}>
              Enter your access code to continue
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                name="accessCode"
                placeholder="Enter Access Code"
                value={accessCode}
                onChange={(e) => {
                  setAccessCode(e.target.value);
                  setError('');
                }}
                required
                className="w-full p-3 rounded-2xl border border-gray-300 focus:border-[#00A3A3] focus:outline-none transition-colors text-center font-mono tracking-wider"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white py-3 rounded-2xl transition-all font-medium shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: isLoading ? '#666' : '#00A3A3' }}
              onMouseEnter={(e) => {
                if (!isLoading) e.currentTarget.style.backgroundColor = '#051a1c';
              }}
              onMouseLeave={(e) => {
                if (!isLoading) e.currentTarget.style.backgroundColor = '#00A3A3';
              }}
            >
              {isLoading ? 'Verifying...' : 'Access App'}
            </button>
          </form>

          <div className="text-center mt-6">
            <div className="text-xs opacity-50" style={{ color: '#051a1c' }}>
              Need an access code? Contact support
            </div>
          </div>

          <button 
            onClick={onClose}
            className="mt-4 w-full text-xs opacity-50 hover:opacity-70 transition-opacity"
            style={{ color: '#051a1c' }}
          >
            Continue browsing
          </button>
        </div>
      </div>
    </>
  );
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [heroText, setHeroText] = useState('');
  const [isHeroTyping, setIsHeroTyping] = useState(true);

  const fullHeroText = "Your pocket AI companion, tutor and chat buddy... built for learners and dreamers";

  useEffect(() => {
    // Check for authenticated user in localStorage
    const storedUser = localStorage.getItem('user');
    const storedSession = localStorage.getItem('session');
    
    if (storedUser && storedSession) {
      try {
        const userData = JSON.parse(storedUser);
        const sessionData = JSON.parse(storedSession);
        
        // Check if session is still valid
        if (sessionData.expires_at > Date.now()) {
          setUser(userData);
        } else {
          // Session expired, clear localStorage
          localStorage.removeItem('user');
          localStorage.removeItem('session');
        }
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('session');
      }
    }
    
    setLoading(false);
  }, []);

  // Hero text typing effect
  useEffect(() => {
    if (!user) { // Only run for non-authenticated users (landing page)
      let charIndex = 0;
      setHeroText('');
      setIsHeroTyping(true);
      
      const typeChar = () => {
        if (charIndex < fullHeroText.length) {
          setHeroText(fullHeroText.slice(0, charIndex + 1));
          charIndex++;
          setTimeout(typeChar, 40 + Math.random() * 20); // Vary speed slightly
        } else {
          setIsHeroTyping(false);
        }
      };
      
      // Start typing after a short delay
      const startTimeout = setTimeout(typeChar, 800);
      
      return () => {
        clearTimeout(startTimeout);
      };
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('session');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Show dashboard for authenticated users
  if (user) {
    return (
      <ChatInterface user={user} onLogout={handleLogout} />
    );
  }

  // Show landing page for non-authenticated users
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fffbeb' }}>
      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          10%, 30% { transform: rotate(14deg); }
          20% { transform: rotate(-8deg); }
          40%, 60% { transform: rotate(14deg); }
          50% { transform: rotate(-8deg); }
          70%, 90% { transform: rotate(0deg); }
        }
      `}</style>
      {/* Clean Navigation Header */}
      <header className="border-b border-gray-200/30">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#051a1c' }}>
                <span className="text-white font-semibold text-sm">G</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-base font-medium leading-tight" style={{ color: '#051a1c' }}>
                  Gawin
                </h1>
                <span className="text-xs opacity-50 leading-tight" style={{ color: '#051a1c' }}>by kreativloops AI</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowAuthModal(true)}
                className="text-white text-sm px-5 py-2.5 rounded-full hover:opacity-90 transition-all shadow-sm" 
                style={{ backgroundColor: '#00A3A3' }}
              >
                Enter Access Code
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Dynamic Bento Box */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-normal mb-4 tracking-tight" style={{ color: '#051a1c' }}>
            <span 
              className="inline-block" 
              style={{ 
                animation: 'wave 1.5s ease-in-out infinite',
                transformOrigin: '70% 70%'
              }}
            >👋</span> <span className="text-3xl md:text-4xl">I'm</span> <span style={{ color: '#00A3A3' }}>Gawin</span>
          </h1>
          <p className="text-lg opacity-60 max-w-2xl mx-auto leading-relaxed italic" style={{ color: '#051a1c' }}>
            {heroText}
            {isHeroTyping && <span className="animate-pulse">|</span>}
          </p>
        </div>


        {/* Get Started CTA */}
        <div className="text-center mt-12">
          <button 
            onClick={() => setShowAuthModal(true)}
            className="text-white text-lg px-8 py-4 rounded-full hover:scale-105 transition-all font-medium shadow-lg mb-6"
            style={{ backgroundColor: '#00A3A3' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#051a1c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#00A3A3';
            }}
          >
            Enter Access Code
          </button>
          
          
          <div className="text-center">
            <div className="text-sm opacity-60" style={{ color: '#051a1c' }}>
              Your AI-powered study companion for learning and creativity
            </div>
          </div>
        </div>
      </main>

      {/* Access Code Modal */}
      {showAuthModal && <AccessCodeModal onClose={() => setShowAuthModal(false)} />}

      {/* Minimal Footer */}
      <footer className="mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <p className="text-xs opacity-40" style={{ color: '#051a1c' }}>
            © 2024 Gawin by KreativLoops AI
          </p>
        </div>
      </footer>
    </div>
  );
}
