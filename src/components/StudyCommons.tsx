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
  const [lastUserMessages, setLastUserMessages] = useState<string[]>([]);
  const [aiCooldown, setAiCooldown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message from Gawin AI
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome-' + Date.now(),
      user: 'Gawin AI',
      text: '👋 Hey everyone! Welcome to Study Commons! I\'m Gawin - think of me as your friendly study buddy who\'s been around the academic block a few times! 😄\n\nI love:\n• Helping with tricky concepts across all subjects\n• Cheering on good collaboration between learners\n• Sharing study tips and keeping things positive\n• Being your study motivation when things get tough\n\nJust chat naturally - I\'ll jump in when I can help! Let\'s make learning fun together! 🌟📚',
      timestamp: new Date().toLocaleTimeString(),
      isAI: true
    };
    setMessages([welcomeMessage]);
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

  // Context-aware AI assistant functionality
  const analyzeConversationContext = (recentMessages: Message[]): { shouldRespond: boolean; responseType: string; topic: string } => {
    if (aiCooldown) return { shouldRespond: false, responseType: '', topic: '' };
    
    const lastFewMessages = recentMessages.slice(-6);
    const userMessages = lastFewMessages.filter(m => !m.isAI).map(m => m.text.toLowerCase());
    const lastUserMessage = userMessages[userMessages.length - 1] || '';
    
    // More responsive - only need 1 user message to potentially respond
    if (userMessages.length < 1) return { shouldRespond: false, responseType: '', topic: '' };
    
    const combinedText = userMessages.join(' ');
    
    // Detect direct questions or greetings (respond immediately)
    if (/^(hi|hello|hey|gawin|anyone|question|can someone|does anyone know)/.test(lastUserMessage)) {
      return { shouldRespond: true, responseType: 'friendly_response', topic: 'general' };
    }
    
    // Detect confusion or requests for help
    if (/help|confused|don't understand|what.*mean|explain|how.*work|stuck|lost|difficult|hard/.test(combinedText)) {
      return { shouldRespond: true, responseType: 'help', topic: 'general' };
    }
    
    // Detect study motivation needs
    if (/tired|bored|give up|quit|can't do|too hard|frustrated|stressed/.test(combinedText)) {
      return { shouldRespond: true, responseType: 'motivation', topic: 'study_support' };
    }
    
    // Detect specific subject areas with more keywords
    if (/math|equation|algebra|calculus|geometry|trigonometry|statistics|solve|calculate|formula|number/.test(combinedText)) {
      return { shouldRespond: true, responseType: 'subject_help', topic: 'mathematics' };
    }
    
    if (/physics|force|energy|momentum|velocity|acceleration|newton|einstein|motion|gravity|wave/.test(combinedText)) {
      return { shouldRespond: true, responseType: 'subject_help', topic: 'physics' };
    }
    
    if (/chemistry|molecule|atom|element|reaction|organic|periodic|chemical|compound|bond/.test(combinedText)) {
      return { shouldRespond: true, responseType: 'subject_help', topic: 'chemistry' };
    }
    
    if (/biology|cell|dna|evolution|genetics|organism|photosynthesis|life|living|species/.test(combinedText)) {
      return { shouldRespond: true, responseType: 'subject_help', topic: 'biology' };
    }
    
    if (/history|ancient|medieval|war|civilization|culture|empire|century|historical/.test(combinedText)) {
      return { shouldRespond: true, responseType: 'subject_help', topic: 'history' };
    }
    
    // Detect good study habits and collaboration
    if (/thanks|thank you|got it|understand now|makes sense|helpful/.test(combinedText)) {
      return { shouldRespond: true, responseType: 'positive_reinforcement', topic: 'learning' };
    }
    
    // Detect when students are sharing knowledge correctly
    if (/formula|definition|solution|answer|correct|exactly|precisely/.test(combinedText) && userMessages.length >= 2) {
      return { shouldRespond: true, responseType: 'encouragement', topic: 'learning' };
    }
    
    // Random friendly check-ins (10% chance after 4+ messages without AI)
    const nonAIMessages = lastFewMessages.filter(m => !m.isAI);
    if (nonAIMessages.length >= 4 && Math.random() < 0.1) {
      return { shouldRespond: true, responseType: 'study_buddy_checkin', topic: 'general' };
    }
    
    return { shouldRespond: false, responseType: '', topic: '' };
  };

  const generateAIResponse = (responseType: string, topic: string): string => {
    const responses: Record<string, string[]> = {
      friendly_response: [
        "Hey there! 👋 What's on your mind? I'm here if you need help with anything!",
        "Hi! Great to see you here! Are you working on something interesting? 😊",
        "Hello! I'm around if you need a study buddy or want to bounce ideas off someone! ✨",
        "Hey! What are you studying today? Always happy to help a fellow learner! 📚"
      ],
      help: [
        "No worries, we've all been there! What specific part is tricky? I can help break it down. 🤔",
        "Totally understand the confusion! Let's work through this together - what exactly is stumping you? 📚", 
        "Been there! Sometimes looking at problems from a different angle helps. What's the main thing you're stuck on? ✨",
        "Hey, learning is tough sometimes! What would help most - an example, explanation, or just talking through it? 🤓"
      ],
      motivation: [
        "I get it, studying can be draining sometimes! 😅 Want to try a different approach or take a quick breather?",
        "Totally normal to feel that way! Remember, even small progress counts. What if we break this into tiny steps? 💪",
        "Been there! Sometimes our brain just needs a reset. Maybe try explaining what you DO understand first? 🌟",
        "Oof, I feel you! Everyone hits walls. Want to tackle something easier first to build momentum? 🚀"
      ],
      positive_reinforcement: [
        "Nice! Love seeing the lightbulb moments! 💡 You're getting it!",
        "That's the spirit! Great job working through that! 🎉",
        "Awesome! You're really getting the hang of this! Keep it up! ⭐",
        "Yes! That feeling when things click is the best, right? You're doing great! 😊"
      ],
      study_buddy_checkin: [
        "How's everyone doing? Just checking in on my study buddies! 😄",
        "Hope the studying is going well! Anyone need a quick brain break? 🧠",
        "Just popping in - you all are doing great! Keep up the good work! 💪",
        "Friendly study buddy check! Remember to stay hydrated and stretch! 🌟"
      ],
      mathematics: [
        "Ooh, math time! 🧮 I actually enjoy working through these. What's the problem giving you trouble?",
        "Math can be fun once it clicks! Want me to show you a trick or walk through the steps? 📐",
        "Love a good math challenge! What part are you working on? I might know a shortcut! 🔢",
        "Math buddies unite! 😄 What concept can we tackle together?"
      ],
      physics: [
        "Physics is like solving puzzles about how the universe works! ⚛️ What's got you curious?",
        "Physics can be mind-bending but so cool! Want to work through the concept together? 🔬",
        "I love physics discussions! It's like detective work but with equations. What's the mystery today? 🌟",
        "Physics time! These concepts become so much clearer with examples. What are you exploring? 🚀"
      ],
      chemistry: [
        "Chemistry is like cooking but with molecules! 🧪 What reaction are we figuring out?",
        "Love chemistry - it's all about understanding how things bond and interact! What's puzzling you? ⚗️", 
        "Chemistry can seem complex but it's just atoms being social! 😄 What compound or reaction?",
        "Time for some molecular detective work! What chemical mystery are we solving? 🔬"
      ],
      biology: [
        "Biology is amazing - life is so intricate! 🧬 What living system are we exploring?",
        "Love biology discussions! Everything connects in such cool ways. What process interests you? 🌱",
        "Biology is like studying the world's best engineering! What biological concept? 🦋",
        "The complexity of life never stops fascinating me! What are you diving into? 🌿"
      ],
      history: [
        "History is like time travel through stories! 📜 What period or event caught your interest?",
        "I find history so fascinating - real people living amazing stories! What era are you exploring? 🏛️",
        "History helps us understand today so much better! What historical topic? 📚",
        "Love learning about how people lived and thought in different times! What's your focus? ⏳"
      ],
      encouragement: [
        "Yes! That's exactly how peer learning should work! You're both getting it! 🌟",
        "Love seeing students help each other like that! This is what good study groups are about! 👏",
        "Perfect explanation! You clearly understand it well if you can teach it! Keep sharing knowledge! 💫",
        "That collaborative spirit is awesome! You're creating such a positive learning environment! 🤝"
      ]
    };

    const responseArray = responses[responseType] || responses.help;
    return responseArray[Math.floor(Math.random() * responseArray.length)];
  };

  // Monitor conversation and provide AI assistance when appropriate
  useEffect(() => {
    if (messages.length < 2) return; // More responsive - only need 2 messages total

    const context = analyzeConversationContext(messages);
    
    if (context.shouldRespond && !aiCooldown) {
      // Set cooldown to prevent AI spam
      setAiCooldown(true);
      setTimeout(() => setAiCooldown(false), 15000); // Reduced to 15 second cooldown

      // Add AI response after a natural delay (faster for greetings)
      const isGreeting = context.responseType === 'friendly_response';
      const baseDelay = isGreeting ? 1000 : 2000;
      const randomDelay = Math.random() * (isGreeting ? 1000 : 2000);
      
      setTimeout(() => {
        const aiResponse: Message = {
          id: 'ai-' + Date.now(),
          user: 'Gawin AI',
          text: generateAIResponse(context.responseType, context.topic),
          timestamp: new Date().toLocaleTimeString(),
          isAI: true
        };
        setMessages(prev => [...prev, aiResponse]);
      }, baseDelay + randomDelay); // 1-2 seconds for greetings, 2-4 seconds for others
    }
  }, [messages, aiCooldown]);

  const sendMessage = () => {
    if (!input.trim()) return;
    
    const validation = isValidMessage(input);
    if (!validation.allowed) {
      const warningMsg: Message = {
        id: Date.now().toString(),
        user: "🛡️ Gawin AI",
        text: `Hey there! 😅 ${validation.reason}\n\nI know I'm being a bit protective here, but I want to keep this space awesome for learning! Think of me as that older friend who looks out for everyone. Let's keep things educational and fun! Thanks! 💙📚`,
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
          className="p-6 rounded-3xl shadow-2xl backdrop-blur-xl border border-white/30 cursor-move"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 237, 213, 0.85) 0%, rgba(255, 248, 235, 0.85) 100%)'
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
        className="w-full h-full flex flex-col rounded-3xl shadow-2xl backdrop-blur-xl border border-white/30 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 237, 213, 0.75) 0%, rgba(255, 248, 235, 0.75) 100%)'
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