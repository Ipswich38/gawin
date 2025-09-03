'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MessageRenderer from "./MessageRenderer";

// Simple message interface
interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: string;
  isAI?: boolean;
}

interface StudyCommonsProps {
  onClose: () => void;
}

export default function StudyCommons({ onClose }: StudyCommonsProps) {
  const [nickname, setNickname] = useState("");
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 400, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize with sample messages
  useEffect(() => {
    const sampleMessages: Message[] = [
      {
        id: '1',
        user: 'Study Bot',
        text: '🎓 Welcome to Study Commons! This is a safe space for academic discussion and learning.',
        timestamp: new Date().toLocaleTimeString(),
        isAI: true
      },
      {
        id: '2',
        user: 'Alex_92',
        text: 'Can someone help explain how to solve quadratic equations?',
        timestamp: new Date(Date.now() - 300000).toLocaleTimeString()
      },
      {
        id: '3',
        user: 'Math_Helper',
        text: 'Sure! For ax² + bx + c = 0, use the quadratic formula:\n\n\\[ x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} \\]\n\nThis gives you the exact solutions for any quadratic equation.',
        timestamp: new Date(Date.now() - 240000).toLocaleTimeString()
      },
      {
        id: '4',
        user: 'Sarah_learns',
        text: 'That makes sense! What about when the discriminant is negative?',
        timestamp: new Date(Date.now() - 180000).toLocaleTimeString()
      },
      {
        id: '5',
        user: 'Math_Helper',
        text: 'Great question! When b² - 4ac < 0, we get complex solutions:\n\nSolution:\n1. Calculate the discriminant: \\[ \\Delta = b^2 - 4ac \\]\n2. If Δ < 0, the solutions are:\n   \\[ x = (-b ± i√|Δ|)/(2a) \\]\n3. These are complex conjugate pairs.\n\nFinal Answer:\n\\[ \\boxed{\\text{Complex conjugate solutions}} \\]',
        timestamp: new Date(Date.now() - 120000).toLocaleTimeString()
      },
      {
        id: '6',
        user: 'Physics_Student',
        text: 'Can someone help with this fraction? The velocity is v = (3x² + 5)/(2t - 1)',
        timestamp: new Date(Date.now() - 60000).toLocaleTimeString()
      }
    ];
    setMessages(sampleMessages);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  // Comprehensive content moderation for academic safety
  const isValidMessage = (msg: string): { allowed: boolean; reason?: string } => {
    const cleanMsg = msg.toLowerCase().trim();
    
    // 🚫 Illegal and inappropriate content
    if (/porn|nude|naked|sexual|masturbat|orgasm|intercourse|blowjob|handjob|anal|vagina|penis|breast(?!feeding|cancer)|nipple|erotic|seduct|horny|kinky/.test(cleanMsg)) {
      return { allowed: false, reason: "Sexual content is not allowed" };
    }
    
    // Academic exception for sex education, reproduction, biology
    if (/sex/.test(cleanMsg) && !/sexual reproduction|sex education|sex chromosome|sex determination|sex-linked|biological sex|sex cell|sexual selection/.test(cleanMsg)) {
      return { allowed: false, reason: "Sexual content not allowed unless for academic biology/health education" };
    }
    
    // 🚫 Filipino profanity
    if (/putang ina|gago|tarantado|bwisit|pakyu|tangina|ulol|bobo|tanga|hudas|kingina|pakshet|peste|yawa|piste|punyeta|anak ng puta|burat|bilat|kantot|jakol|chupa|bayag|titi|puke/.test(cleanMsg)) {
      return { allowed: false, reason: "Filipino profanity is not allowed" };
    }
    
    // 🚫 English profanity
    if (/fuck|shit|damn|bitch|asshole|bastard|cunt|dick|pussy|cock|whore|slut|nigger|faggot|retard|motherfucker|goddamn/.test(cleanMsg)) {
      return { allowed: false, reason: "Profanity is not allowed" };
    }
    
    // 🚫 LGBTQIA+ topics (redirect to other platforms)
    if (/lgbt|gay|lesbian|transgender|bisexual|queer|non-binary|gender identity|sexual orientation|pride month|coming out|rainbow flag/.test(cleanMsg)) {
      return { allowed: false, reason: "LGBTQIA+ discussions belong on dedicated platforms - this is for academic learning" };
    }
    
    // 🚫 Religious debates (academic study allowed)
    if (/(islam|muslim|christian|catholic|protestant|hindu|buddhist|jewish).*(wrong|stupid|fake|lie|evil|bad)/.test(cleanMsg) || 
        /(god|allah|jesus|muhammad|buddha).*(doesn't exist|fake|lie|stupid)/.test(cleanMsg) ||
        /religion.*(stupid|fake|wrong|evil|bad)/.test(cleanMsg)) {
      return { allowed: false, reason: "Religious debates are not allowed - academic study of religious texts and history is welcome" };
    }
    
    // 🚫 Drugs and illegal substances
    if (/cocaine|heroin|marijuana|weed|meth|ecstasy|lsd|molly|crack|adderall|xanax|buy drugs|sell drugs|drug dealer/.test(cleanMsg)) {
      return { allowed: false, reason: "Discussion of illegal drugs is not allowed" };
    }
    
    // 🚫 Violence and illegal activities
    if (/kill|murder|suicide|bomb|terrorist|hack|steal|piracy|torrent|illegal download|cheat|plagiarism/.test(cleanMsg)) {
      return { allowed: false, reason: "Violence and illegal activities are not allowed" };
    }
    
    // 🚫 Scams and commercial content
    if (/buy now|click here|make money|get rich|bitcoin|crypto|investment|forex|trading|mlm|pyramid|scheme/.test(cleanMsg)) {
      return { allowed: false, reason: "Commercial content and potential scams are not allowed" };
    }
    
    // 🚫 External links and contact sharing
    if (/http|www\.|\.com|\.net|\.org|\.ph|@gmail|@yahoo|facebook|instagram|tiktok|whatsapp|telegram|discord|phone number|contact me/.test(cleanMsg)) {
      return { allowed: false, reason: "External links and contact sharing are not allowed for safety" };
    }
    
    // 🚫 Off-topic discussions
    if (/dating|crush|boyfriend|girlfriend|relationship|love|romance|flirt|cute|handsome|beautiful|sexy|hot|gossip|drama|celebrity|movie|kdrama|kpop/.test(cleanMsg)) {
      return { allowed: false, reason: "Dating, romance, and entertainment topics are off-topic - focus on academic learning" };
    }
    
    // 🚫 Message length limit
    if (msg.length > 500) {
      return { allowed: false, reason: "Please keep messages under 500 characters" };
    }
    
    // ✅ Explicitly allowed academic content
    if (/bible|testament|scripture|theology|religious history|biblical|christian history|islamic history|religious studies|comparative religion|philosophy|ethics|morals/.test(cleanMsg)) {
      return { allowed: true }; // Academic religious study is allowed
    }
    
    return { allowed: true };
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    
    const validation = isValidMessage(input);
    if (!validation.allowed) {
      const warningMsg: Message = {
        id: Date.now().toString(),
        user: "🛡️ Study Commons Moderator",
        text: `⚠️ ${validation.reason}\n\nThis is a safe academic space. Please keep discussions educational and respectful.`,
        timestamp: new Date().toLocaleTimeString(),
        isAI: true
      };
      setMessages(prev => [...prev, warningMsg]);
      setInput("");
      return;
    }

    const message: Message = {
      id: Date.now().toString(),
      user: nickname,
      text: input,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, message]);
    setInput("");
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
    if (isDragging) {
      const newX = Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragOffset.y));
      setPosition({ x: newX, y: newY });
    }
    
    if (isResizing) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const newWidth = Math.max(300, Math.min(600, e.clientX - rect.left));
        const newHeight = Math.max(400, Math.min(800, e.clientY - rect.top));
        setSize({ width: newWidth, height: newHeight });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
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
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-3xl shadow-2xl backdrop-blur-xl border border-white/20 cursor-move"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 237, 213, 0.95) 0%, rgba(255, 248, 235, 0.95) 100%)'
          }}
          onMouseDown={handleMouseDown}
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">💬</span>
            </div>
            <h1 className="text-lg font-bold text-gray-800 mb-1">Join Study Commons</h1>
            <p className="text-gray-600 text-xs mb-4">
              Enter your nickname to join the learning community
            </p>
          </div>
          
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white/70 backdrop-blur-sm text-gray-700 placeholder:text-gray-500 text-sm"
              onKeyDown={(e) => e.key === "Enter" && nickname.trim() && setJoined(true)}
              autoFocus
              maxLength={20}
            />
            <div className="flex gap-2">
              <button
                onClick={() => nickname.trim() && setJoined(true)}
                disabled={!nickname.trim()}
                className="flex-1 py-2.5 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-medium rounded-2xl hover:from-orange-500 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Join Chat
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-gray-600 hover:text-gray-800 transition-colors text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main chat interface
  return (
    <div 
      ref={containerRef}
      className="fixed z-50 select-none"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height
      }}
    >
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        className="w-full h-full flex flex-col rounded-3xl shadow-2xl backdrop-blur-xl border border-white/20 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 237, 213, 0.95) 0%, rgba(255, 248, 235, 0.95) 100%)'
        }}
      >
        {/* Header */}
        <div 
          className="p-4 border-b border-orange-200/50 flex-shrink-0 cursor-move"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">💬</span>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-800">Study Commons</h2>
                <p className="text-xs text-gray-600">Learning Community</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-orange-200/50 rounded-xl transition-colors"
            >
              <span className="text-gray-600">✕</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex space-x-3"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                  message.isAI ? 'bg-emerald-500' : getAvatarColor(message.user)
                }`}>
                  {message.isAI ? '🤖' : getInitials(message.user)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-medium text-gray-800 truncate">{message.user}</span>
                    <span className="text-xs text-gray-500 flex-shrink-0">{message.timestamp}</span>
                  </div>
                  <div className={`text-sm leading-relaxed break-words ${
                    message.isAI 
                      ? 'text-emerald-800 bg-emerald-50/70 p-3 rounded-xl border-l-2 border-emerald-300' 
                      : 'text-gray-700 bg-white/30 p-3 rounded-xl'
                  }`}>
                    <MessageRenderer text={message.text} />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-orange-200/50 flex-shrink-0">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 px-4 py-2 rounded-2xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white/70 backdrop-blur-sm text-sm text-gray-700 placeholder:text-gray-500"
              maxLength={500}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-medium rounded-2xl hover:from-orange-500 hover:to-orange-600 transition-all disabled:opacity-50 flex-shrink-0"
            >
              <span>→</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Chatting as <strong>{nickname}</strong>
          </p>
        </div>

        {/* Resize Handle */}
        <div 
          className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizing(true);
          }}
          style={{
            background: 'linear-gradient(-45deg, transparent 30%, rgba(251, 146, 60, 0.3) 30%, rgba(251, 146, 60, 0.3) 70%, transparent 70%)',
            backgroundSize: '6px 6px'
          }}
        />
      </motion.div>
    </div>
  );
}