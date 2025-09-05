'use client';

import React, { useState, useEffect, useRef } from "react";
import MessageRenderer from "./MessageRenderer";
import { databaseService, StudyCommonsMessage, StudyCommonsUser } from "../lib/services/databaseService";

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: string;
  isAI?: boolean;
}

interface StudyCommonsProps {
  onMinimize: () => void;
}

export default function StudyCommons({ onMinimize }: StudyCommonsProps) {
  const [nickname, setNickname] = useState("");
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeUsers, setActiveUsers] = useState<StudyCommonsUser[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [localActiveUsers, setLocalActiveUsers] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 400, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [preFullScreenState, setPreFullScreenState] = useState({ position: { x: 0, y: 0 }, size: { width: 400, height: 600 } });
  const [lastUserMessages, setLastUserMessages] = useState<string[]>([]);
  const [aiCooldown, setAiCooldown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check for persisted nickname on component mount
  useEffect(() => {
    const storedNickname = localStorage.getItem('studyCommons_nickname');
    if (storedNickname) {
      setNickname(storedNickname);
      setJoined(true);
    }
  }, []);

  // Initialize position (top-right corner)
  useEffect(() => {
    const updatePosition = () => {
      const padding = 16;
      setPosition({
        x: window.innerWidth - size.width - padding,
        y: padding
      });
    };
    
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [size.width]);

  // Immediate local user tracking
  useEffect(() => {
    if (!joined || !nickname) return;

    const addUserToLocalList = () => {
      const activeUsersList = JSON.parse(localStorage.getItem('studyCommons_activeUsers') || '[]');
      const userEntry = {
        nickname: nickname,
        joinTime: Date.now(),
        lastSeen: Date.now(),
        sessionId: Date.now() + '-' + Math.random().toString(36).substr(2, 9)
      };
      
      const updatedList = activeUsersList.filter((user: any) => user.nickname !== nickname || user.sessionId === userEntry.sessionId);
      updatedList.push(userEntry);
      
      const threeMinutesAgo = Date.now() - (3 * 60 * 1000);
      const recentUsers = updatedList.filter((user: any) => user.lastSeen > threeMinutesAgo);
      
      const storageData = {
        users: recentUsers,
        lastUpdated: Date.now()
      };
      
      localStorage.setItem('studyCommons_activeUsers', JSON.stringify(recentUsers));
      localStorage.setItem('studyCommons_sync', JSON.stringify(storageData));
      
      setLocalActiveUsers(recentUsers.map((user: any) => user.nickname));
      
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'studyCommons_activeUsers',
        newValue: JSON.stringify(recentUsers)
      }));
    };

    addUserToLocalList();

    const localPresenceInterval = setInterval(() => {
      addUserToLocalList();
    }, 5000);

    return () => clearInterval(localPresenceInterval);
  }, [joined, nickname]);

  // Listen for localStorage changes from other tabs/users
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'studyCommons_activeUsers' || e.key === 'studyCommons_sync') {
        const activeUsersList = JSON.parse(localStorage.getItem('studyCommons_activeUsers') || '[]');
        const threeMinutesAgo = Date.now() - (3 * 60 * 1000);
        const recentUsers = activeUsersList.filter((user: any) => user.lastSeen > threeMinutesAgo);
        setLocalActiveUsers(recentUsers.map((user: any) => user.nickname));
      }
    };

    const pollForChanges = () => {
      const activeUsersList = JSON.parse(localStorage.getItem('studyCommons_activeUsers') || '[]');
      const threeMinutesAgo = Date.now() - (3 * 60 * 1000);
      const recentUsers = activeUsersList.filter((user: any) => user.lastSeen > threeMinutesAgo);
      setLocalActiveUsers(recentUsers.map((user: any) => user.nickname));
    };

    window.addEventListener('storage', handleStorageChange);
    const pollInterval = setInterval(pollForChanges, 3000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, []);

  // Load messages and setup real-time subscription when user joins
  useEffect(() => {
    if (!joined) return;

    const initializeChat = async () => {
      try {
        await databaseService.updateUserPresence(nickname);
        
        const existingMessages = await databaseService.getStudyCommonsMessages();
        const convertedMessages: Message[] = existingMessages.map((msg: StudyCommonsMessage) => ({
          id: msg.id,
          user: msg.is_ai ? 'Gawin AI' : msg.user_nickname,
          text: msg.message_text,
          timestamp: new Date(msg.created_at).toLocaleTimeString(),
          isAI: msg.is_ai
        }));

        if (convertedMessages.length === 0) {
          const welcomeMessage: Message = {
            id: 'welcome-' + Date.now(),
            user: 'Gawin AI',
            text: '👋 Hey everyone! Welcome to Study Commons! I\'m Gawin - think of me as your friendly study buddy who\'s been around the academic block a few times! 😄\n\nI love:\n• Helping with tricky concepts across all subjects\n• Cheering on good collaboration between learners\n• Sharing study tips and keeping things positive\n• Being your study motivation when things get tough\n\nJust chat naturally - I\'ll jump in when I can help! Let\'s make learning fun together! 🌟📚',
            timestamp: new Date().toLocaleTimeString(),
            isAI: true
          };
        
          await databaseService.addStudyCommonsMessage({
            user_nickname: 'Gawin AI',
            message_text: welcomeMessage.text,
            is_ai: true
          });
        
          setMessages([welcomeMessage]);
        } else {
          setMessages(convertedMessages);
        }

        const channel = databaseService.subscribeToStudyCommonsMessages((newMessage: StudyCommonsMessage) => {
          const convertedMessage: Message = {
            id: newMessage.id,
            user: newMessage.is_ai ? 'Gawin AI' : newMessage.user_nickname,
            text: newMessage.message_text,
            timestamp: new Date(newMessage.created_at).toLocaleTimeString(),
            isAI: newMessage.is_ai
          };
          
          setMessages(prev => [...prev, convertedMessage]);
        });
        
        setSubscription(channel);

        const users = await databaseService.getActiveUsers();
        setActiveUsers(users);
      } catch (error) {
        console.error('Database error, falling back to local mode:', error);
        
        const welcomeMessage: Message = {
          id: 'welcome-' + Date.now(),
          user: 'Gawin AI',
          text: '👋 Hey everyone! Welcome to Study Commons! I\'m Gawin - think of me as your friendly study buddy who\'s been around the academic block a few times! 😄\n\n⚠️ Note: Currently running in offline mode. Messages won\'t sync between users until database is connected.\n\nI love:\n• Helping with tricky concepts across all subjects\n• Cheering on good collaboration between learners\n• Sharing study tips and keeping things positive\n• Being your study motivation when things get tough\n\nJust chat naturally - I\'ll jump in when I can help! Let\'s make learning fun together! 🌟📚',
          timestamp: new Date().toLocaleTimeString(),
          isAI: true
        };
        
        setMessages([welcomeMessage]);
        setActiveUsers([]);
      }
    };

    initializeChat();

    const presenceInterval = setInterval(() => {
      if (joined) {
        databaseService.updateUserPresence(nickname);
        databaseService.getActiveUsers().then(setActiveUsers);
      }
    }, 30000);

    return () => {
      clearInterval(presenceInterval);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [joined, nickname]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Comprehensive content moderation
  const isValidMessage = (msg: string): { allowed: boolean; reason?: string } => {
    const cleanMsg = msg.toLowerCase().trim();
    
    if (/porn|nude|naked|sexual|masturbat|orgasm|intercourse|blowjob|handjob|anal|vagina|penis|breast(?!feeding|cancer)|nipple|erotic|seduct|horny|kinky/.test(cleanMsg)) {
      return { allowed: false, reason: "Sexual content is not allowed" };
    }
    
    if (/sex/.test(cleanMsg) && !/sexual reproduction|sex education|sex chromosome|sex determination|sex-linked|biological sex|sex cell|sexual selection/.test(cleanMsg)) {
      return { allowed: false, reason: "Sexual content not allowed unless for academic biology/health education" };
    }
    
    if (msg.length > 500) {
      return { allowed: false, reason: "Please keep messages under 500 characters" };
    }
    
    return { allowed: true };
  };

  // Context-aware AI assistant functionality
  const analyzeConversationContext = (recentMessages: Message[]): { shouldRespond: boolean; responseType: string; topic: string } => {
    if (aiCooldown) return { shouldRespond: false, responseType: '', topic: '' };
    
    const lastFewMessages = recentMessages.slice(-6);
    const userMessages = lastFewMessages.filter(m => !m.isAI).map(m => m.text.toLowerCase());
    const lastUserMessage = userMessages[userMessages.length - 1] || '';
    
    if (userMessages.length < 1) return { shouldRespond: false, responseType: '', topic: '' };
    
    const combinedText = userMessages.join(' ');
    
    if (/^(hi|hello|hey|gawin|anyone|question|can someone|does anyone know)/.test(lastUserMessage)) {
      return { shouldRespond: true, responseType: 'friendly_response', topic: 'general' };
    }
    
    if (/help|confused|don't understand|what.*mean|explain|how.*work|stuck|lost|difficult|hard/.test(combinedText)) {
      return { shouldRespond: true, responseType: 'help', topic: 'general' };
    }
    
    if (/tired|bored|give up|quit|can't do|too hard|frustrated|stressed/.test(combinedText)) {
      return { shouldRespond: true, responseType: 'motivation', topic: 'study_support' };
    }
    
    if (/math|equation|algebra|calculus|geometry|trigonometry|statistics|solve|calculate|formula|number/.test(combinedText)) {
      return { shouldRespond: true, responseType: 'subject_help', topic: 'mathematics' };
    }
    
    if (/thanks|thank you|got it|understand now|makes sense|helpful/.test(combinedText)) {
      return { shouldRespond: true, responseType: 'positive_reinforcement', topic: 'learning' };
    }
    
    return { shouldRespond: false, responseType: '', topic: '' };
  };

  const generateAIResponse = (responseType: string, topic: string): string => {
    const responses: Record<string, string[]> = {
      friendly_response: [
        "Hey there! 👋 What's on your mind? I'm here if you need help with anything!",
        "Hi! Great to see you here! Are you working on something interesting? 😊",
        "Hello! I'm around if you need a study buddy or want to bounce ideas off someone! ✨"
      ],
      help: [
        "No worries, we've all been there! What specific part is tricky? I can help break it down. 🤔",
        "Totally understand the confusion! Let's work through this together - what exactly is stumping you? 📚"
      ],
      motivation: [
        "I get it, studying can be draining sometimes! 😅 Want to try a different approach or take a quick breather?",
        "Totally normal to feel that way! Remember, even small progress counts. What if we break this into tiny steps? 💪"
      ],
      positive_reinforcement: [
        "Nice! Love seeing the lightbulb moments! 💡 You're getting it!",
        "That's the spirit! Great job working through that! 🎉"
      ]
    };

    const responseArray = responses[responseType] || responses.help;
    return responseArray[Math.floor(Math.random() * responseArray.length)];
  };

  // Monitor conversation and provide AI assistance
  useEffect(() => {
    if (messages.length < 2) return;

    const context = analyzeConversationContext(messages);
    
    if (context.shouldRespond && !aiCooldown) {
      setAiCooldown(true);
      setTimeout(() => setAiCooldown(false), 15000);

      const isGreeting = context.responseType === 'friendly_response';
      const baseDelay = isGreeting ? 1000 : 2000;
      const randomDelay = Math.random() * (isGreeting ? 1000 : 2000);
      
      setTimeout(async () => {
        const aiResponseText = generateAIResponse(context.responseType, context.topic);
        
        await databaseService.addStudyCommonsMessage({
          user_nickname: 'Gawin AI',
          message_text: aiResponseText,
          is_ai: true
        });
      }, baseDelay + randomDelay);
    }
  }, [messages, aiCooldown]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const validation = isValidMessage(input);
    if (!validation.allowed) {
      const warningText = `Hey there! 😅 ${validation.reason}\n\nI know I'm being a bit protective here, but I want to keep this space awesome for learning! Think of me as that older friend who looks out for everyone. Let's keep things educational and fun! Thanks! 💙📚`;
      
      const warningMsg: Message = {
        id: Date.now().toString(),
        user: "🛡️ Gawin AI",
        text: warningText,
        timestamp: new Date().toLocaleTimeString(),
        isAI: true
      };
      setMessages(prev => [...prev, warningMsg]);
      
      try {
        await databaseService.addStudyCommonsMessage({
          user_nickname: "🛡️ Gawin AI",
          message_text: warningText,
          is_ai: true
        });
      } catch (error) {
        console.log('Database unavailable, using local mode');
      }
      setInput("");
      return;
    }

    const localMessage: Message = {
      id: Date.now().toString(),
      user: nickname,
      text: input,
      timestamp: new Date().toLocaleTimeString(),
      isAI: false
    };
    setMessages(prev => [...prev, localMessage]);
    
    setInput("");

    try {
      await databaseService.addStudyCommonsMessage({
        user_nickname: nickname,
        message_text: input,
        is_ai: false
      });
    } catch (error) {
      console.log('Database unavailable, message stored locally only');
    }
  };

  // Mouse event handlers for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.resize-handle')) return;
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && !isFullScreen) {
      const newX = Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragOffset.y));
      setPosition({ x: newX, y: newY });
    }
    
    if (isResizing && !isFullScreen) {
      let newSize = { ...size };
      let newPosition = { ...position };
      
      if (resizeDirection.includes('right')) {
        newSize.width = Math.max(300, Math.min(800, e.clientX - position.x));
      }
      if (resizeDirection.includes('left')) {
        const newWidth = Math.max(300, Math.min(800, position.x + size.width - e.clientX));
        newPosition.x = Math.max(0, e.clientX);
        newSize.width = newWidth;
      }
      if (resizeDirection.includes('bottom')) {
        newSize.height = Math.max(400, Math.min(900, e.clientY - position.y));
      }
      if (resizeDirection.includes('top')) {
        const newHeight = Math.max(400, Math.min(900, position.y + size.height - e.clientY));
        newPosition.y = Math.max(0, e.clientY);
        newSize.height = newHeight;
      }
      
      setSize(newSize);
      setPosition(newPosition);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection('');
  };

  const toggleFullScreen = () => {
    if (isFullScreen) {
      setPosition(preFullScreenState.position);
      setSize(preFullScreenState.size);
      setIsFullScreen(false);
    } else {
      setPreFullScreenState({ position, size });
      setPosition({ x: 20, y: 20 });
      setSize({ width: window.innerWidth - 40, height: window.innerHeight - 40 });
      setIsFullScreen(true);
    }
  };

  // Global mouse events
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, size]);

  const getInitials = (name: string): string => {
    return name.charAt(0).toUpperCase();
  };

  const getAvatarColor = (name: string): string => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-pink-500', 'bg-indigo-500', 'bg-yellow-500'];
    const index = name.length % colors.length;
    return colors[index];
  };

  // Nickname entry form
  if (!joined) {
    return (
      <div 
        className="fixed z-50"
        style={{
          left: position.x,
          top: position.y,
          width: 320,
          height: 'auto'
        }}
      >
        <div
          className="p-4 bg-white border border-gray-200 rounded-lg cursor-move"
          onMouseDown={handleMouseDown}
        >
          <div className="text-center">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-sm">💬</span>
            </div>
            <h1 className="text-sm font-medium text-gray-800 mb-1">Join Study Commons</h1>
            <p className="text-gray-500 text-xs mb-3">
              Enter your nickname to join
            </p>
          </div>
          
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:outline-none focus:ring-1 focus:ring-green-500 text-sm"
              onKeyDown={(e) => e.key === "Enter" && nickname.trim() && setJoined(true)}
              autoFocus
              maxLength={20}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (nickname.trim()) {
                    localStorage.setItem('studyCommons_nickname', nickname.trim());
                    setJoined(true);
                  }
                }}
                disabled={!nickname.trim()}
                className="flex-1 py-2 bg-green-500 text-white text-sm rounded-2xl disabled:opacity-50"
              >
                Join Chat
              </button>
              <button
                onClick={onMinimize}
                className="px-3 py-2 text-red-500 hover:text-red-700 text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main chat interface
  return (
    <div 
      ref={containerRef}
      className={`fixed z-50 select-none ${isMobile ? 'inset-4' : ''}`}
      style={isMobile ? {
        left: '1rem',
        top: '1rem',
        right: '1rem',
        bottom: '1rem',
        width: 'auto',
        height: 'auto'
      } : {
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height
      }}
    >
      <div className={`w-full h-full flex flex-col border border-gray-200 rounded-3xl overflow-hidden ${isMobile ? '' : 'cursor-move'}`}
        style={{ backgroundColor: '#435b67' }}
        onMouseDown={isMobile ? undefined : handleMouseDown}>
        
        {/* Header */}
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">👥</span>
              </div>
              <div>
                <div className="font-medium text-white text-sm">Study Commons</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              {!isMobile && (
                <button
                  onClick={toggleFullScreen}
                  className="w-6 h-6 text-gray-300 hover:text-white"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                  </svg>
                </button>
              )}
              
              <button
                onClick={onMinimize}
                className="w-6 h-6 text-gray-300 hover:text-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* Active Users */}
          <div className="flex space-x-1 mt-2">
            <div className="flex items-center space-x-1 bg-green-50 rounded-2xl px-2 py-1">
              <span className="text-xs text-green-600 font-medium">Gawin AI</span>
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            </div>
            {localActiveUsers.map((username) => (
              <div key={username} className="flex items-center space-x-1 bg-gray-600 rounded-2xl px-2 py-1">
                <span className="text-xs text-gray-200 font-medium">
                  {username === nickname ? 'You' : username}
                </span>
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide">
          {messages.map((message) => (
            <div key={message.id} className="flex space-x-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                message.isAI ? 'bg-green-500' : getAvatarColor(message.user)
              }`}>
                {message.isAI ? '🤖' : getInitials(message.user)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-medium text-gray-200">{message.user}</span>
                  <span className="text-xs text-gray-400">{message.timestamp}</span>
                </div>
                <div className={`text-sm p-2 rounded-2xl ${
                  message.isAI 
                    ? 'text-white bg-gray-600' 
                    : 'text-gray-200 bg-gray-600'
                }`}>
                  <MessageRenderer text={message.text} />
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 px-3 py-2 border border-gray-400 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-green-500 bg-gray-700 text-white placeholder-gray-300"
              maxLength={500}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="px-3 py-2 bg-green-500 text-white rounded-2xl text-sm disabled:opacity-50"
            >
              →
            </button>
          </div>
          <p className="text-xs text-gray-300 mt-2 text-center">
            Chatting as <strong>{nickname}</strong>
          </p>
        </div>

        {/* Resize Handles */}
        {!isMobile && !isFullScreen && (
          <>
            <div 
              className="resize-handle absolute bottom-0 right-0 w-3 h-3 cursor-se-resize"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsResizing(true);
                setResizeDirection('bottom-right');
              }}
            />
            <div 
              className="resize-handle absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsResizing(true);
                setResizeDirection('bottom-left');
              }}
            />
            <div 
              className="resize-handle absolute top-0 right-0 w-3 h-3 cursor-ne-resize"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsResizing(true);
                setResizeDirection('top-right');
              }}
            />
            <div 
              className="resize-handle absolute top-0 left-0 w-3 h-3 cursor-nw-resize"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsResizing(true);
                setResizeDirection('top-left');
              }}
            />
            <div 
              className="resize-handle absolute top-0 left-3 right-3 h-1 cursor-n-resize"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsResizing(true);
                setResizeDirection('top');
              }}
            />
            <div 
              className="resize-handle absolute bottom-0 left-3 right-3 h-1 cursor-s-resize"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsResizing(true);
                setResizeDirection('bottom');
              }}
            />
            <div 
              className="resize-handle absolute left-0 top-3 bottom-3 w-1 cursor-w-resize"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsResizing(true);
                setResizeDirection('left');
              }}
            />
            <div 
              className="resize-handle absolute right-0 top-3 bottom-3 w-1 cursor-e-resize"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsResizing(true);
                setResizeDirection('right');
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}