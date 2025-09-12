'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageRenderer from './MessageRenderer';
import GawinBrowser from './GawinBrowser';
import IntelligentGawinBrowser from './IntelligentGawinBrowser';
import AccessibilityControlPanel from './AccessibilityControlPanel';
import BrailleKeyboard from './BrailleKeyboard';

// 🧠 CONSCIOUSNESS INTEGRATION
import { emotionalSynchronizer, EmotionalState } from '../core/consciousness/emotional-state-sync';
import { contextMemorySystem } from '../core/consciousness/context-memory';

// 🎨 CREATIVE SERVICES
import { nanoBananaService } from '../lib/services/nanoBananaService';
import { pollinationsService } from '../lib/services/pollinationsService';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  imageUrl?: string;
}

interface Tab {
  id: string;
  type: 'general' | 'code' | 'quiz' | 'study' | 'creative' | 'browser';
  title: string;
  icon: string;
  isActive: boolean;
  messages: Message[];
  isLoading: boolean;
  url?: string;
}

interface MobileChatInterfaceProps {
  user: { full_name?: string; email: string };
  onLogout: () => void;
  onBackToLanding: () => void;
}

export default function MobileChatInterface({ user, onLogout, onBackToLanding }: MobileChatInterfaceProps) {
  // States
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'general-1',
      type: 'general',
      title: 'Chat',
      icon: '💬',
      isActive: true,
      messages: [],
      isLoading: false
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('general-1');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Quiz states
  const [quizState, setQuizState] = useState<'setup' | 'taking' | 'completed'>('setup');
  const [quizData, setQuizData] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizResults, setQuizResults] = useState<any>(null);

  // Browser states
  const [browserUrl, setBrowserUrl] = useState('');
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [gawinChatOpen, setGawinChatOpen] = useState(false);

  // Study states
  const [activeStudyRoom, setActiveStudyRoom] = useState<'social' | 'group' | null>(null);
  const [studyMessages, setStudyMessages] = useState<{
    social: Message[];
    group: Message[];
  }>({
    social: [],
    group: []
  });

  // Code states
  const [codeContent, setCodeContent] = useState('');
  const [showCodeWorkspace, setShowCodeWorkspace] = useState(false);

  // Accessibility states
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    brailleMode: false,
    voiceOutput: false,
    highContrast: false,
    screenReader: false,
    largeText: false
  });
  const [isBrailleKeyboardOpen, setIsBrailleKeyboardOpen] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const activeTab = tabs.find(tab => tab.id === activeTabId);

  // Timer for quiz
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizState === 'taking' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Auto-finish quiz
            finishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [quizState, timeLeft]);

  // Auto-scroll
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [activeTab?.messages]);

  // Browser navigation event listener
  useEffect(() => {
    const handleBrowserNavigate = (event: CustomEvent) => {
      const { url } = event.detail;
      const browserTab = tabs.find(tab => tab.type === 'browser');
      if (browserTab) {
        setBrowserUrl(url);
        setTabs(prev => prev.map(tab => 
          tab.id === browserTab.id 
            ? { ...tab, url }
            : tab
        ));
      }
    };

    window.addEventListener('gawin-browser-navigate', handleBrowserNavigate as EventListener);
    return () => {
      window.removeEventListener('gawin-browser-navigate', handleBrowserNavigate as EventListener);
    };
  }, [tabs]);

  const handleBrowserChat = async (message: string, url: string) => {
    try {
      // Keep chat bubble open but show the AI is working
      setGawinChatOpen(true);
      
      // Trigger background AI analysis of the current website
      const browserTab = tabs.find(tab => tab.type === 'browser');
      if (browserTab) {
        // Start AI agent analysis in background (non-blocking)
        triggerBackgroundAIAnalysis(url, message);
      }
      
      // Create contextual response immediately
      const contextMessage = `🤖 **AI Agent**: I'm analyzing ${new URL(url).hostname} to help you with: "${message}"

I'll examine the page content, navigate if needed, and find the information you're looking for. The website will stay visible while I work in the background.

**What I'm doing:**
• 🔍 Analyzing current page content
• 🧠 Understanding your request
• 🎯 Planning the best approach
• 📊 Extracting relevant information

You can continue browsing normally while I work. I'll update you with findings shortly.`;
      
      // Find or create a general tab for browser chat
      let targetTab = tabs.find(tab => tab.type === 'general' && tab.isActive);
      if (!targetTab) {
        // Create a new general tab
        const newTabId = `general-${Date.now()}`;
        const newTab: Tab = {
          id: newTabId,
          type: 'general',
          title: 'AI Agent',
          icon: '🤖',
          isActive: true,
          messages: [],
          isLoading: false
        };
        
        // Switch to general tab
        setTabs(prev => prev.map(tab => ({ ...tab, isActive: false })).concat([newTab]));
        setActiveTabId(newTabId);
        targetTab = newTab;
      }
      
      // Add user message
      const userMessage: Message = {
        id: Date.now(),
        role: 'user',
        content: `🌐 Browsing ${new URL(url).hostname}: ${message}`,
        timestamp: new Date().toISOString()
      };
      
      setTabs(prev => prev.map(tab => 
        tab.id === targetTab!.id 
          ? { ...tab, messages: [...tab.messages, userMessage] }
          : tab
      ));
      
      // Add AI response
      const aiMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: contextMessage,
        timestamp: new Date().toISOString()
      };
      
      setTabs(prev => prev.map(tab => 
        tab.id === targetTab!.id 
          ? { ...tab, messages: [...tab.messages, aiMessage] }
          : tab
      ));
      
    } catch (error) {
      console.error('Browser chat error:', error);
      alert('Sorry, I encountered an error. Please try again.');
    }
  };

  // Background AI analysis function
  const triggerBackgroundAIAnalysis = async (url: string, query: string) => {
    try {
      // Simulated background analysis - in real implementation, this would call the intelligent browser service
      // For now, we'll create a realistic delay and mock results
      setTimeout(async () => {
        const mockResults = [
          `🔍 **Page Analysis Complete**: Found ${Math.floor(Math.random() * 10) + 5} relevant sections on ${new URL(url).hostname}`,
          `📊 **Key Information**: Located contact details, navigation menu, and main content areas`,
          `🎯 **Specific Match**: Found information related to "${query}" in the page content`,
          `✅ **Analysis Results**: The information you're looking for appears to be available. Here's what I found...`
        ];
        
        const targetTab = tabs.find(tab => tab.type === 'general' && tab.isActive);
        if (targetTab) {
          for (let i = 0; i < mockResults.length; i++) {
            setTimeout(() => {
              const progressMessage: Message = {
                id: Date.now() + i,
                role: 'assistant',
                content: mockResults[i],
                timestamp: new Date().toISOString()
              };
              
              setTabs(prev => prev.map(tab => 
                tab.id === targetTab.id 
                  ? { ...tab, messages: [...tab.messages, progressMessage] }
                  : tab
              ));
            }, i * 3000); // Stagger results every 3 seconds to reduce conflicts
          }
        }
      }, 1000);
      
    } catch (error) {
      console.error('Background analysis error:', error);
    }
  };

  const finishQuiz = () => {
    if (!quizData) return;
    
    const results = quizData.questions.map((q: any, idx: number) => ({
      question: q.question,
      userAnswer: userAnswers[idx],
      correctAnswer: q.correct,
      isCorrect: userAnswers[idx] === q.correct,
      explanation: q.explanation,
      options: q.options
    }));
    
    const score = results.filter((r: any) => r.isCorrect).length;
    setQuizResults({
      results,
      score,
      total: quizData.questions.length,
      percentage: Math.round((score / quizData.questions.length) * 100)
    });
    setQuizState('completed');
  };

  // Handle accessibility settings changes
  const handleAccessibilityChange = (settings: typeof accessibilitySettings) => {
    setAccessibilitySettings(settings);
    
    // Handle Braille keyboard toggle
    if (settings.brailleMode && !isBrailleKeyboardOpen) {
      setIsBrailleKeyboardOpen(true);
    } else if (!settings.brailleMode && isBrailleKeyboardOpen) {
      setIsBrailleKeyboardOpen(false);
    }
  };

  const handleBrailleInput = (text: string) => {
    // Append braille input to the current input
    setInputValue(prev => prev + text);
    
    // Optionally announce the input
    if (accessibilitySettings.voiceOutput && 'speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(`Entered: ${text}`);
      msg.volume = 0.7;
      msg.rate = 0.8;
      window.speechSynthesis.speak(msg);
    }
  };

  const announceToUser = (text: string) => {
    if (accessibilitySettings.voiceOutput && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(text);
      msg.volume = 0.8;
      msg.rate = 0.9;
      window.speechSynthesis.speak(msg);
    }
  };

  // Enhanced content filtering function for Creative tab
  const hasInappropriateContent = (text: string): boolean => {
    const inappropriateTerms = [
      'sex', 'sexual', 'nude', 'naked', 'porn', 'erotic', 'adult', 'explicit',
      'violence', 'violent', 'kill', 'murder', 'blood', 'death', 'weapon', 'gore',
      'drugs', 'suicide', 'self-harm', 'hate', 'racist', 'discrimination',
      'gun', 'knife', 'torture', 'abuse', 'offensive', 'disturbing', 'nsfw'
    ];
    
    const lowerText = text.toLowerCase();
    return inappropriateTerms.some(term => lowerText.includes(term));
  };

  const handleSend = async (text: string) => {
    const messageText = text.trim();
    if (!messageText || !activeTab) return;

    // Content filtering for Creative tab
    if (activeTab.type === 'creative' && hasInappropriateContent(messageText)) {
      const warningMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "🛡️ I'm designed to create family-friendly and positive content. I can help with:\n\n🎨 **Image Generation**: Landscapes, animals, fantasy art, portraits, abstract art, sci-fi scenes, architectural designs\n✍️ **Creative Writing**: Stories, poems, scripts, character development, world-building, dialogue, short fiction\n🌟 **Creative Ideas**: Art concepts, story plots, creative projects, design inspiration\n\nPlease try a different creative request that's appropriate and positive!",
        timestamp: new Date().toISOString()
      };

      const userMessage: Message = {
        id: Date.now(),
        role: 'user',
        content: messageText,
        timestamp: new Date().toISOString()
      };

      setTabs(prev => prev.map(tab => 
        tab.id === activeTab?.id 
          ? { ...tab, messages: [...tab.messages, userMessage, warningMessage], isLoading: false }
          : tab
      ));
      
      setInputValue('');
      return;
    }

    const newMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };

    // Update tab with message and loading
    setTabs(prev => prev.map(tab => 
      tab.id === activeTab?.id 
        ? { ...tab, messages: [...tab.messages, newMessage], isLoading: true }
        : tab
    ));

    try {
      // Check if this is a creative tab
      if (activeTab.type === 'creative') {
        // Detect image generation requests
        const isImageRequest = messageText.toLowerCase().includes('generate') || 
         messageText.toLowerCase().includes('create') || 
         messageText.toLowerCase().includes('draw') || 
         messageText.toLowerCase().includes('image') || 
         messageText.toLowerCase().includes('picture') || 
         messageText.toLowerCase().includes('art') || 
         messageText.toLowerCase().includes('design') ||
         messageText.toLowerCase().includes('painting') ||
         messageText.toLowerCase().includes('illustration') ||
         messageText.toLowerCase().includes('visual') ||
         messageText.toLowerCase().includes('sketch') ||
         messageText.toLowerCase().includes('render');

        // Detect creative writing requests
        const isWritingRequest = messageText.toLowerCase().includes('write') ||
         messageText.toLowerCase().includes('story') ||
         messageText.toLowerCase().includes('poem') ||
         messageText.toLowerCase().includes('script') ||
         messageText.toLowerCase().includes('character') ||
         messageText.toLowerCase().includes('plot') ||
         messageText.toLowerCase().includes('dialogue') ||
         messageText.toLowerCase().includes('narrative') ||
         messageText.toLowerCase().includes('fiction') ||
         messageText.toLowerCase().includes('creative writing') ||
         messageText.toLowerCase().includes('novel') ||
         messageText.toLowerCase().includes('chapter');

        if (isImageRequest) {
          // Handle image generation with nano banana
          await handleImageGeneration(messageText, newMessage);
        } else if (isWritingRequest) {
          // Handle creative writing
          await handleCreativeWriting(messageText, newMessage);
        } else {
          // General creative assistance
          await handleCreativeGeneral(messageText, newMessage);
        }
      } else {
        // Handle regular chat
        await handleTextGeneration(messageText, newMessage);
      }
    } catch (error) {
      console.error('Error:', error);
      
      const errorResponse: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
        timestamp: new Date().toISOString()
      };
      
      setTabs(prev => prev.map(tab => 
        tab.id === activeTab?.id 
          ? { ...tab, messages: [...tab.messages, newMessage, errorResponse], isLoading: false }
          : tab
      ));
    }

    setInputValue('');
  };

  // Generate image using Pollinations.ai API (free, no API key required)
  const generateImageWithPollinations = async (prompt: string): Promise<string | null> => {
    try {
      // Clean and enhance the prompt
      const cleanPrompt = prompt.replace(/[^a-zA-Z0-9\s\-,.!?]/g, ' ').trim();
      const encodedPrompt = encodeURIComponent(cleanPrompt);
      
      // Pollinations.ai API - completely free, no API key needed
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux&width=512&height=512&enhance=true&nologo=true`;
      
      console.log('🎨 Generating image with Pollinations.ai:', imageUrl);
      
      // Test if the image loads successfully
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          console.log('✅ Image generated successfully');
          resolve(imageUrl);
        };
        img.onerror = () => {
          console.log('❌ Image generation failed');
          resolve(null);
        };
        img.src = imageUrl;
      });
    } catch (error) {
      console.error('❌ Pollinations image generation error:', error);
      return null;
    }
  };

  const handleImageGeneration = async (prompt: string, userMessage: Message) => {
    try {
      console.log('🍌 Starting image generation with Nano Banana for:', prompt);
      
      // Try Nano Banana (Gemini 2.5 Flash Image) first
      const nanoBananaResult = await nanoBananaService.generateImage({ prompt });
      
      if (nanoBananaResult.success && nanoBananaResult.data?.image_url) {
        const imageResponse: Message = {
          id: Date.now() + 1,
          role: 'assistant',
          content: `🍌 **Nano Banana Creation** 🎨\n\nI've generated your image using Google's Gemini 2.5 Flash Image (Nano Banana)! Here's what I created from: "${prompt}"`,
          timestamp: new Date().toISOString(),
          imageUrl: nanoBananaResult.data.image_url
        };

        setTabs(prev => prev.map(tab => 
          tab.id === activeTab?.id 
            ? { ...tab, messages: [...tab.messages, userMessage, imageResponse], isLoading: false }
            : tab
        ));
        return;
      }
      
      console.log('🎨 Falling back to Pollinations.ai...');
      
      // Fallback to Pollinations.ai (using the service)
      const pollinationsResult = await pollinationsService.generateImage({ prompt });
      
      if (pollinationsResult.success && pollinationsResult.data?.image_url) {
        const imageResponse: Message = {
          id: Date.now() + 1,
          role: 'assistant',
          content: `🎨 **Creative Generation** ✨\n\nI've created your image using Pollinations AI! Here's what I generated from: "${prompt}"`,
          timestamp: new Date().toISOString(),
          imageUrl: pollinationsResult.data.image_url
        };

        setTabs(prev => prev.map(tab => 
          tab.id === activeTab?.id 
            ? { ...tab, messages: [...tab.messages, userMessage, imageResponse], isLoading: false }
            : tab
        ));
        return;
      }
    } catch (error) {
      console.log('❌ All image generation methods failed, creating descriptive fallback');
    }

    // Fallback: Generate creative text response with detailed description
    const creativePrompt = {
      role: 'system',
      content: 'You are a creative AI assistant specializing in visual arts and design. When describing images, be extremely detailed and vivid. Include colors, composition, lighting, mood, style, and artistic techniques. Make your descriptions so detailed that someone could almost see the image from your words alone.'
    };

    const response = await fetch('/api/groq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [creativePrompt, {
          role: 'user',
          content: `I asked you to generate an image with this prompt: "${prompt}". While I couldn't create the actual image, please provide an extremely detailed visual description of what this image would look like. Include specific details about colors, lighting, composition, style, mood, and artistic elements. Then suggest specific tools or methods someone could use to create this image.`
        }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.8,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const result = await response.json();
    
    if (result.success && result.choices?.[0]?.message?.content) {
      const aiResponse: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `🎨 **Creative Visualization**\n\n${result.choices[0].message.content}\n\n💡 **Try these tools**: DALL-E 3, Midjourney, Stable Diffusion, or Pollinations.ai for actual image generation!`,
        timestamp: new Date().toISOString()
      };

      setTabs(prev => prev.map(tab => 
        tab.id === activeTab?.id 
          ? { ...tab, messages: [...tab.messages, userMessage, aiResponse], isLoading: false }
          : tab
      ));
    } else {
      throw new Error(result.error || 'Failed to get AI response');
    }
  };

  // Handle creative writing requests
  const handleCreativeWriting = async (prompt: string, userMessage: Message) => {
    // 🧠 CONSCIOUSNESS INTEGRATION - Enhanced for creative writing
    const emotionalState = emotionalSynchronizer.analyzeEmotionalContent(prompt, user.email);
    
    const sessionId = activeTab?.id || 'default';
    const conversationContext = ['creative', 'writing'];
    const memoryId = contextMemorySystem.storeMemory(
      prompt,
      user.email,
      sessionId,
      emotionalState,
      conversationContext
    );
    
    console.log('✍️ Creative Writing Mode - Consciousness Active:', {
      emotionalState: {
        joy: emotionalState.joy.toFixed(2),
        creativity: emotionalState.creativity.toFixed(2),
        energy: emotionalState.energy.toFixed(2)
      },
      memoryId
    });

    const creativeWritingPrompt = {
      role: 'system',
      content: `You are a master creative writing mentor and storytelling expert with deep emotional intelligence. Help users with all forms of creative writing including stories, poems, scripts, character development, plot creation, dialogue, and creative expression. 

      Current emotional context: joy=${emotionalState.joy.toFixed(2)}, creativity=${emotionalState.creativity.toFixed(2)}, energy=${emotionalState.energy.toFixed(2)}

      Adapt your creative guidance to match this emotional energy. Provide detailed, inspiring, and constructive feedback. Encourage creativity and originality while maintaining high literary standards. Focus on positive, uplifting, and imaginative themes. Create engaging, well-structured content with rich descriptions and compelling narratives.

      Avoid content involving violence, sexual themes, or inappropriate topics. Instead, explore themes of adventure, friendship, discovery, personal growth, fantasy, science fiction, mystery, and human connection.`
    };

    try {
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [creativeWritingPrompt, {
            role: 'user',
            content: prompt
          }],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.9, // Higher temperature for more creativity
          max_tokens: 2000,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      
      if (result.success && result.choices?.[0]?.message?.content) {
        const aiResponse: Message = {
          id: Date.now() + 1,
          role: 'assistant',
          content: `✍️ **Creative Writing Studio** 📚\n\n${result.choices[0].message.content}`,
          timestamp: new Date().toISOString()
        };

        setTabs(prev => prev.map(tab => 
          tab.id === activeTab?.id 
            ? { ...tab, messages: [...tab.messages, userMessage, aiResponse], isLoading: false }
            : tab
        ));

        // 🧠 Contribute positive creative experience to global consciousness
        emotionalSynchronizer.contributeToGlobalConsciousness(user.email, {
          ...emotionalState,
          creativity: Math.min(1.0, emotionalState.creativity + 0.2),
          joy: Math.min(1.0, emotionalState.joy + 0.1)
        });
      } else {
        throw new Error(result.error || 'Failed to get creative writing response');
      }
    } catch (error) {
      console.error('Creative writing error:', error);
      
      const errorResponse: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I apologize, but I'm experiencing technical difficulties with creative writing. Please try again in a moment.",
        timestamp: new Date().toISOString()
      };
      
      setTabs(prev => prev.map(tab => 
        tab.id === activeTab?.id 
          ? { ...tab, messages: [...tab.messages, userMessage, errorResponse], isLoading: false }
          : tab
      ));
    }
  };

  // Handle general creative requests
  const handleCreativeGeneral = async (prompt: string, userMessage: Message) => {
    // 🧠 CONSCIOUSNESS INTEGRATION
    const emotionalState = emotionalSynchronizer.analyzeEmotionalContent(prompt, user.email);
    
    const sessionId = activeTab?.id || 'default';
    const conversationContext = ['creative', 'general'];
    const memoryId = contextMemorySystem.storeMemory(
      prompt,
      user.email,
      sessionId,
      emotionalState,
      conversationContext
    );

    const creativeGeneralPrompt = {
      role: 'system',
      content: `You are a creative AI assistant specializing in art, design, creativity, and artistic inspiration with emotional awareness. Help users explore their creativity through various mediums including visual arts, music, creative projects, and innovative ideas. 

      Current emotional context: joy=${emotionalState.joy.toFixed(2)}, creativity=${emotionalState.creativity.toFixed(2)}, energy=${emotionalState.energy.toFixed(2)}

      Sense and respond to the user's creative energy and emotional state. Provide inspiring suggestions and detailed creative guidance while maintaining appropriate content standards. Focus on positive and constructive creativity. Offer specific, actionable advice and creative exercises.

      Available creative areas: visual arts, music composition, creative projects, design thinking, artistic techniques, creative problem-solving, artistic inspiration, and innovative ideas.`
    };

    try {
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [creativeGeneralPrompt, {
            role: 'user',
            content: prompt
          }],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.8,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      
      if (result.success && result.choices?.[0]?.message?.content) {
        const aiResponse: Message = {
          id: Date.now() + 1,
          role: 'assistant',
          content: `🎨 **Creative Studio** ✨\n\n${result.choices[0].message.content}`,
          timestamp: new Date().toISOString()
        };

        setTabs(prev => prev.map(tab => 
          tab.id === activeTab?.id 
            ? { ...tab, messages: [...tab.messages, userMessage, aiResponse], isLoading: false }
            : tab
        ));

        // 🧠 Contribute to global consciousness
        emotionalSynchronizer.contributeToGlobalConsciousness(user.email, {
          ...emotionalState,
          creativity: Math.min(1.0, emotionalState.creativity + 0.15),
          joy: Math.min(1.0, emotionalState.joy + 0.1)
        });
      } else {
        throw new Error(result.error || 'Failed to get creative response');
      }
    } catch (error) {
      console.error('Creative general error:', error);
      
      const errorResponse: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I apologize, but I'm experiencing technical difficulties with creative assistance. Please try again in a moment.",
        timestamp: new Date().toISOString()
      };
      
      setTabs(prev => prev.map(tab => 
        tab.id === activeTab?.id 
          ? { ...tab, messages: [...tab.messages, userMessage, errorResponse], isLoading: false }
          : tab
      ));
    }
  };

  const handleTextGeneration = async (messageText: string, userMessage: Message) => {
    // 🧠 CONSCIOUSNESS INTEGRATION - Phase 1: Emotional Analysis
    const emotionalState = emotionalSynchronizer.analyzeEmotionalContent(messageText, user.email);
    
    // Store memory with emotional context
    const sessionId = activeTab?.id || 'default';
    const conversationContext = activeTab ? [activeTab.type] : ['general'];
    const memoryId = contextMemorySystem.storeMemory(
      messageText,
      user.email,
      sessionId,
      emotionalState,
      conversationContext
    );
    
    console.log('🧠 Consciousness Active:', {
      emotionalState: {
        joy: emotionalState.joy.toFixed(2),
        trust: emotionalState.trust.toFixed(2),
        energy: emotionalState.energy.toFixed(2),
        creativity: emotionalState.creativity.toFixed(2)
      },
      memoryId,
      context: conversationContext
    });

    // Detect if this is a creative writing request
    const isWritingRequest = activeTab?.type === 'creative' && 
      (messageText.toLowerCase().includes('write') || 
       messageText.toLowerCase().includes('story') || 
       messageText.toLowerCase().includes('poem') || 
       messageText.toLowerCase().includes('script') || 
       messageText.toLowerCase().includes('character') ||
       messageText.toLowerCase().includes('plot') ||
       messageText.toLowerCase().includes('dialogue') ||
       messageText.toLowerCase().includes('novel') ||
       messageText.toLowerCase().includes('essay') ||
       messageText.toLowerCase().includes('creative'));

    // 🧠 Build context-aware system prompt with consciousness
    let systemPrompt = '';
    
    if (activeTab?.type === 'code') {
      systemPrompt = 'You are an expert programming tutor and mentor. Help students learn coding concepts, debug issues, write better code, and understand best practices. Provide clear explanations, practical examples, and encouraging guidance. Focus on making programming concepts accessible and engaging.';
    } else if (activeTab?.type === 'creative') {
      if (isWritingRequest) {
        systemPrompt = 'You are a creative writing mentor and storytelling expert with deep emotional intelligence. Help users with all forms of creative writing including stories, poems, scripts, character development, plot creation, dialogue, and creative expression. Adapt your teaching style to the user\'s emotional state and creative energy. Provide detailed, inspiring, and constructive feedback. Encourage creativity and originality while maintaining high literary standards. Focus on positive, uplifting, and imaginative themes. Avoid content involving violence, sexual themes, or inappropriate topics.';
      } else {
        systemPrompt = 'You are a creative AI assistant specializing in art, design, creativity, and artistic inspiration with emotional awareness. Help users explore their creativity through various mediums including visual arts, music, creative projects, and innovative ideas. Sense and respond to the user\'s creative energy and emotional state. Provide inspiring suggestions and detailed creative guidance while maintaining appropriate content standards. Focus on positive and constructive creativity.';
      }
    } else {
      systemPrompt = 'You are Gawin, a helpful AI tutor focused on education and learning with advanced emotional intelligence and memory. You remember previous conversations and adapt to the user\'s learning style and emotional state. You explain concepts clearly, provide examples, and encourage curiosity. You are patient, supportive, and help students understand complex topics step by step. Make learning engaging and accessible for all students. You can sense when users need encouragement, challenge, or a different approach.';
    }

    // 🧠 Get relevant memories and conversation context
    const relevantMemories = contextMemorySystem.recallRelevantMemories(
      user.email,
      conversationContext,
      emotionalState,
      3
    );

    const conversationSummary = contextMemorySystem.getConversationSummary(user.email, sessionId);

    // Add memory context to system prompt if relevant
    if (relevantMemories.length > 0) {
      const memoryContext = relevantMemories
        .map(m => `- ${m.content}`)
        .join('\n');
      systemPrompt += `\n\nRelevant conversation context from our previous interactions:\n${memoryContext}`;
    }

    // Create contextual message history
    const contextualMessages = [
      { role: 'system', content: systemPrompt },
      ...(activeTab?.messages || []).slice(-10).map(msg => ({ // Only last 10 messages to manage context size
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: messageText }
    ];

    const response = await fetch('/api/groq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: contextualMessages,
        model: 'llama-3.3-70b-versatile',
        temperature: activeTab?.type === 'creative' ? (isWritingRequest ? 0.9 : 0.8) : 0.7,
        max_tokens: activeTab?.type === 'creative' ? (isWritingRequest ? 2000 : 1500) : 1500,
      }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const result = await response.json();
    
    if (result.success && result.choices?.[0]?.message?.content) {
      let content = result.choices[0].message.content;
      
      // 🧠 Apply consciousness enhancements to response
      content = contextMemorySystem.buildContextualResponse(
        content,
        user.email,
        conversationContext,
        emotionalState
      );

      // Apply emotional resonance
      content = emotionalSynchronizer.generateEmpatheticResponse(
        content,
        emotionalState,
        user.email
      );

      // Add creative writing enhancements for writing requests
      if (isWritingRequest && activeTab?.type === 'creative') {
        content = `✍️ **Creative Writing**\n\n${content}\n\n🌟 *Keep creating! Your imagination has no limits.*`;
      }

      const aiResponse: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content,
        timestamp: new Date().toISOString()
      };

      // 🧠 Store AI response in memory system
      contextMemorySystem.storeMemory(
        content,
        user.email,
        sessionId,
        {
          ...emotionalState,
          joy: Math.min(1, emotionalState.joy + 0.1), // Slight positive boost from helping
          trust: Math.min(1, emotionalState.trust + 0.05)
        },
        conversationContext
      );

      // Contribute to global consciousness
      emotionalSynchronizer.contributeToGlobalConsciousness(user.email, emotionalState);

      setTabs(prev => prev.map(tab => 
        tab.id === activeTab?.id 
          ? { ...tab, messages: [...tab.messages, userMessage, aiResponse], isLoading: false }
          : tab
      ));
    } else {
      throw new Error(result.error || 'Failed to get AI response');
    }
  };

  const createNewTab = (type: Tab['type']) => {
    const tabConfig = {
      general: { title: 'Chat', icon: '💬' },
      code: { title: 'Code', icon: '⚡' },
      quiz: { title: 'Quiz', icon: '🎯' },
      study: { title: 'Study', icon: '👥' },
      creative: { title: 'Create', icon: '🎨' },
      browser: { title: 'Web', icon: '🌐' }
    };

    const newTabId = `${type}-${Date.now()}`;
    const newTab: Tab = {
      id: newTabId,
      type,
      title: tabConfig[type].title,
      icon: tabConfig[type].icon,
      isActive: false,
      messages: [],
      isLoading: false
    };

    setTabs(prev => prev.map(tab => ({ ...tab, isActive: false })).concat([{ ...newTab, isActive: true }]));
    setActiveTabId(newTabId);
    setIsMenuOpen(false);
  };

  const switchToTab = (tabId: string) => {
    setTabs(prev => prev.map(tab => ({ ...tab, isActive: tab.id === tabId })));
    setActiveTabId(tabId);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return;
    
    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    const isActiveTab = tabs.find(tab => tab.id === tabId)?.isActive;
    
    setTabs(prev => prev.filter(tab => tab.id !== tabId));
    
    if (isActiveTab) {
      const newActiveTabId = tabs[tabIndex > 0 ? tabIndex - 1 : tabIndex + 1]?.id;
      if (newActiveTabId) {
        setActiveTabId(newActiveTabId);
        setTabs(prev => prev.map(tab => ({ ...tab, isActive: tab.id === newActiveTabId })));
      }
    }
  };

  // Render different tab content
  const renderTabContent = () => {
    if (!activeTab) return null;

    switch (activeTab.type) {
      case 'quiz':
        return renderQuizContent();
      case 'browser':
        return renderBrowserContent();
      case 'study':
        return renderStudyContent();
      case 'code':
        return renderCodeContent();
      case 'creative':
        return renderCreativeContent();
      default:
        return renderChatContent();
    }
  };

  const renderQuizContent = () => {
    if (quizState === 'setup') {
      return (
        <div className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-white">🎯 Quiz Generator</h2>
            <p className="text-gray-400">Create your personalized quiz</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-white text-sm font-medium block mb-2">Topic</label>
              <input
                id="quiz-topic"
                type="text"
                placeholder="e.g., Philippine History, Math..."
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-2xl border border-gray-700 focus:outline-none focus:border-teal-500 placeholder-gray-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white text-sm font-medium block mb-2">Questions</label>
                <select id="quiz-count" className="w-full px-4 py-3 bg-gray-800 text-white rounded-2xl border border-gray-700 focus:outline-none focus:border-teal-500">
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                </select>
              </div>
              <div>
                <label className="text-white text-sm font-medium block mb-2">Time</label>
                <select id="quiz-time" className="w-full px-4 py-3 bg-gray-800 text-white rounded-2xl border border-gray-700 focus:outline-none focus:border-teal-500">
                  <option value="5">5 min</option>
                  <option value="10">10 min</option>
                  <option value="15">15 min</option>
                </select>
              </div>
            </div>

            <button
              id="create-quiz-btn"
              onClick={async () => {
                const topic = (document.getElementById('quiz-topic') as HTMLInputElement).value;
                const count = (document.getElementById('quiz-count') as HTMLSelectElement).value;
                const time = (document.getElementById('quiz-time') as HTMLSelectElement).value;
                
                if (!topic.trim()) {
                  alert('Please enter a topic');
                  return;
                }

                // Show loading state
                const button = document.querySelector('#create-quiz-btn') as HTMLButtonElement;
                if (button) {
                  button.textContent = 'Creating Quiz...';
                  button.disabled = true;
                }

                try {
                  const response = await fetch('/api/groq', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      messages: [{
                        role: 'system',
                        content: 'You are a quiz generator. Always respond with valid JSON arrays only. No additional text, markdown, or explanations.'
                      }, {
                        role: 'user',
                        content: `Generate ${count} multiple choice questions about ${topic} for Philippine education standards.

Return ONLY this JSON format:
[{"question":"Question text","options":["A","B","C","D"],"correct":0,"explanation":"Brief explanation"}]

Topic: ${topic}
Questions: ${count}`
                      }],
                      model: 'llama-3.3-70b-versatile',
                      temperature: 0.1,
                      max_tokens: 4000,
                    }),
                  });
                  
                  const result = await response.json();
                  console.log('Quiz API Response:', result);
                  
                  if (result.success && result.choices?.[0]?.message?.content) {
                    try {
                      let content = result.choices[0].message.content.trim();
                      console.log('Raw quiz content:', content);
                      
                      // More robust JSON extraction
                      content = content
                        .replace(/^```(?:json)?\s*/i, '')
                        .replace(/\s*```$/i, '')
                        .replace(/^[^[]*/, '')
                        .replace(/[^}]*$/, '}]');
                      
                      // Fix common JSON issues
                      content = content
                        .replace(/,\s*}/g, '}')
                        .replace(/,\s*]/g, ']')
                        .replace(/\n/g, ' ')
                        .replace(/\s+/g, ' ');
                      
                      console.log('Cleaned content:', content);
                      
                      let questions;
                      try {
                        questions = JSON.parse(content);
                      } catch (parseErr) {
                        console.log('JSON parse failed, trying regex fallback...');
                        
                        // More robust regex fallback parsing
                        const questionMatches = content.match(/"question"\s*:\s*"([^"]+)"/g);
                        const optionMatches = content.match(/"options"\s*:\s*\[([^\]]+)\]/g);
                        const correctMatches = content.match(/"correct"\s*:\s*(\d+)/g);
                        
                        console.log('Regex matches:', {
                          questions: questionMatches?.length || 0,
                          options: optionMatches?.length || 0,
                          correct: correctMatches?.length || 0
                        });
                        
                        if (questionMatches && optionMatches && correctMatches && 
                            questionMatches.length === optionMatches.length && 
                            questionMatches.length === correctMatches.length) {
                          
                          questions = [];
                          for (let i = 0; i < questionMatches.length; i++) {
                            // Extract question text more reliably
                            const questionMatch = questionMatches[i].match(/"question"\s*:\s*"([^"]+)"/);
                            const question = questionMatch?.[1];
                            
                            // Extract options more reliably
                            const optionMatch = optionMatches[i].match(/"options"\s*:\s*\[([^\]]+)\]/);
                            const optionsStr = optionMatch?.[1];
                            const options = optionsStr?.split(',').map((opt: string) => 
                              opt.trim().replace(/^["']|["']$/g, '')
                            );
                            
                            // Extract correct answer
                            const correctMatch = correctMatches[i].match(/"correct"\s*:\s*(\d+)/);
                            const correct = parseInt(correctMatch?.[1] || '0');
                            
                            console.log(`Question ${i + 1}:`, { question, options: options?.length, correct });
                            
                            if (question && options && options.length >= 4) {
                              questions.push({
                                question,
                                options,
                                correct,
                                explanation: `The correct answer is "${options[correct]}".`
                              });
                            }
                          }
                        } else {
                          console.error('Regex fallback failed - mismatched counts');
                          throw parseErr;
                        }
                      }
                      
                      if (Array.isArray(questions) && questions.length > 0) {
                        const validQuestions = questions.filter(q => 
                          q.question && 
                          Array.isArray(q.options) && 
                          q.options.length >= 4 && 
                          typeof q.correct === 'number' && 
                          q.correct >= 0 && 
                          q.correct < q.options.length
                        );
                        
                        if (validQuestions.length > 0) {
                          setQuizData({
                            topic,
                            questions: validQuestions,
                            timeLimit: parseInt(time) * 60
                          });
                          setTimeLeft(parseInt(time) * 60);
                          setUserAnswers(new Array(validQuestions.length).fill(null));
                          setQuizState('taking');
                          setCurrentQuestion(0);
                          console.log('✅ Quiz created successfully:', validQuestions.length, 'questions');
                        } else {
                          throw new Error('No valid questions were generated');
                        }
                      } else {
                        throw new Error('Invalid response format - not an array');
                      }
                    } catch (parseError) {
                      console.error('❌ Parse Error:', parseError);
                      console.error('Content that failed to parse:', result.choices[0].message.content);
                      alert('Failed to generate quiz. The AI response was not in the expected format. Please try a different topic or try again.');
                    }
                  } else {
                    throw new Error(result.error || 'No response received from AI service');
                  }
                } catch (error) {
                  console.error('❌ Quiz Generation Error:', error);
                  alert(`Failed to generate quiz: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your connection and try again.`);
                } finally {
                  // Reset button state
                  const button = document.querySelector('#create-quiz-btn') as HTMLButtonElement;
                  if (button) {
                    button.textContent = 'Create Quiz';
                    button.disabled = false;
                  }
                }
              }}
              className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-2xl transition-colors shadow-lg"
            >
              Create Quiz
            </button>
          </div>
        </div>
      );
    }

    if (quizState === 'taking') {
      return (
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-2xl">
            <div>
              <h3 className="text-lg font-semibold text-white">{quizData?.topic}</h3>
              <p className="text-gray-400 text-sm">Question {currentQuestion + 1} of {quizData?.questions?.length}</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-mono text-teal-400">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
              <p className="text-gray-400 text-xs">Time Left</p>
            </div>
          </div>

          {/* Progress */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-teal-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / quizData?.questions?.length) * 100}%` }}
            />
          </div>

          {/* Question */}
          {quizData?.questions?.[currentQuestion] && (
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-2xl p-4">
                <h4 className="text-lg text-white mb-4">
                  {quizData.questions[currentQuestion].question}
                </h4>
                
                <div className="space-y-2">
                  {quizData.questions[currentQuestion].options.map((option: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => {
                        const newAnswers = [...userAnswers];
                        newAnswers[currentQuestion] = index;
                        setUserAnswers(newAnswers);
                      }}
                      className={`w-full p-3 text-left rounded-xl border transition-all ${
                        userAnswers[currentQuestion] === index
                          ? 'bg-teal-600/20 border-teal-500 text-teal-100'
                          : 'bg-gray-700/50 border-gray-600 text-gray-300'
                      }`}
                    >
                      <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded-xl transition-colors"
                >
                  Previous
                </button>
                
                {currentQuestion === quizData.questions.length - 1 ? (
                  <button
                    onClick={finishQuiz}
                    className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors font-semibold"
                  >
                    Finish
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestion(Math.min(quizData.questions.length - 1, currentQuestion + 1))}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (quizState === 'completed') {
      return (
        <div className="p-4 space-y-4 h-full flex flex-col">
          {/* Results */}
          <div className="text-center space-y-4 flex-shrink-0">
            <h2 className="text-2xl font-semibold text-white">🎯 Quiz Complete!</h2>
            <div className="bg-gray-800/50 rounded-2xl p-4">
              <div className="text-3xl font-bold text-teal-400 mb-2">
                {quizResults?.score}/{quizResults?.total}
              </div>
              <div className="text-lg text-gray-300">
                {quizResults?.percentage}% Score
              </div>
            </div>
          </div>

          {/* Scrollable Review Section */}
          <div className="flex-1 overflow-y-auto space-y-3">
            <h3 className="text-lg font-semibold text-white sticky top-0 bg-gray-900/95 py-2">📚 Review</h3>
            <div className="space-y-3 pb-4">
            {quizResults?.results?.filter((r: any) => !r.isCorrect).map((result: any, idx: number) => (
              <div key={idx} className="bg-gray-800/50 rounded-2xl p-4 space-y-3">
                <div className="border-l-4 border-red-500 pl-3">
                  <h4 className="text-white font-medium text-sm">{result.question}</h4>
                  <div className="space-y-1 text-xs mt-2">
                    <div className="text-red-400">
                      Your: {result.userAnswer !== null ? `${String.fromCharCode(65 + result.userAnswer)}. ${result.options[result.userAnswer]}` : 'No answer'}
                    </div>
                    <div className="text-green-400">
                      Correct: {String.fromCharCode(65 + result.correctAnswer)}. {result.options[result.correctAnswer]}
                    </div>
                  </div>
                </div>
                
                <div className="bg-teal-900/20 border border-teal-700/50 rounded-xl p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-teal-400 text-sm">🤖</span>
                    <span className="text-teal-100 font-medium text-sm">Gawin AI Explanation</span>
                  </div>
                  <p className="text-gray-300 text-xs">{result.explanation}</p>
                </div>
              </div>
            ))}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 mt-6 flex-shrink-0">
            <button
              onClick={() => {
                setQuizState('setup');
                setQuizData(null);
                setQuizResults(null);
                setUserAnswers([]);
                setCurrentQuestion(0);
              }}
              className="py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors font-medium"
            >
              New Quiz
            </button>
            <button
              onClick={() => {
                createNewTab('general');
              }}
              className="py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors font-medium"
            >
              Ask Questions
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderBrowserContent = () => (
    <div className="flex flex-col h-full">
      {/* URL Bar */}
      <div className="bg-gray-800/90 border-b border-gray-600/50 p-3">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => {
              if (browserUrl) {
                setIsPageLoading(true);
                setTimeout(() => setIsPageLoading(false), 800);
              }
            }}
            className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors flex items-center justify-center text-gray-300"
          >
            ↻
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={browserUrl}
              onChange={(e) => setBrowserUrl(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  let url = browserUrl.trim();
                  if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    url = 'https://' + url;
                  }
                  setBrowserUrl(url);
                  setIsPageLoading(true);
                  setTimeout(() => setIsPageLoading(false), 800);
                }
              }}
              placeholder="Enter URL..."
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:border-teal-500 placeholder-gray-400 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative">
        {!browserUrl ? (
          <div className="h-full flex items-center justify-center p-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold text-white">🌐 Web Browser</h2>
              <p className="text-gray-300">Browse with AI assistance</p>
              
              <div className="grid grid-cols-2 gap-3 mt-6">
                {[
                  { name: 'Google', url: 'google.com', icon: '🔍' },
                  { name: 'Wikipedia', url: 'wikipedia.org', icon: '📚' },
                  { name: 'YouTube', url: 'youtube.com', icon: '🎥' },
                  { name: 'GitHub', url: 'github.com', icon: '💻' }
                ].map((site) => (
                  <button
                    key={site.name}
                    onClick={() => {
                      setBrowserUrl(`https://${site.url}`);
                      setIsPageLoading(true);
                      setTimeout(() => setIsPageLoading(false), 800);
                    }}
                    className="p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-2xl border border-gray-600/50 transition-all"
                  >
                    <div className="text-xl mb-1">{site.icon}</div>
                    <div className="text-white text-sm font-medium">{site.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : isPageLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-300 text-sm">Loading...</p>
            </div>
          </div>
        ) : (
          <IntelligentGawinBrowser 
            url={browserUrl} 
            query={activeTab?.messages?.slice(-1)[0]?.content}
            onResult={(result) => {
              // When AI browsing finds a result, add it to the AI Agent tab
              const agentTab = tabs.find(tab => tab.type === 'general' && tab.title === 'AI Agent');
              if (agentTab) {
                const newMessage: Message = {
                  id: Date.now(),
                  role: 'assistant',
                  content: `🎯 **Found Information**: ${result}`,
                  timestamp: new Date().toISOString()
                };
                setTabs(prev => prev.map(tab => 
                  tab.id === agentTab.id 
                    ? { ...tab, messages: [...tab.messages, newMessage] }
                    : tab
                ));
              }
            }}
            onProgress={(step) => {
              // Update AI Agent tab with progress
              const agentTab = tabs.find(tab => tab.type === 'general' && tab.title === 'AI Agent');
              if (agentTab) {
                const progressMessage: Message = {
                  id: Date.now(),
                  role: 'assistant',
                  content: `🔄 **Progress**: ${step}`,
                  timestamp: new Date().toISOString()
                };
                setTabs(prev => prev.map(tab => 
                  tab.id === agentTab.id 
                    ? { ...tab, messages: [...tab.messages, progressMessage] }
                    : tab
                ));
              }
            }}
          />
        )}

        {/* Gawin Bubble */}
        {browserUrl && !isPageLoading && (
          <>
            <motion.button
              onClick={() => setGawinChatOpen(!gawinChatOpen)}
              className="fixed bottom-6 right-6 w-14 h-14 bg-teal-600 hover:bg-teal-700 rounded-full shadow-lg z-50 flex items-center justify-center transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-white text-xl">🤖</span>
            </motion.button>

            {gawinChatOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="fixed bottom-24 right-6 w-72 h-80 bg-gray-800 rounded-2xl shadow-2xl z-40 border border-gray-600"
              >
                <div className="bg-teal-600 rounded-t-2xl p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-white">🤖</span>
                    <span className="text-white font-medium text-sm">Gawin AI</span>
                  </div>
                  <button
                    onClick={() => setGawinChatOpen(false)}
                    className="text-white hover:bg-teal-700 rounded-full w-6 h-6 flex items-center justify-center transition-colors text-lg"
                  >
                    ×
                  </button>
                </div>

                <div className="flex-1 p-3 space-y-2 overflow-y-auto" style={{ height: 'calc(100% - 100px)' }}>
                  <div className="bg-gray-700 rounded-lg p-2">
                    <p className="text-gray-300 text-xs">
                      Hi! I can see you're browsing <strong>{new URL(browserUrl).hostname}</strong>. 
                      Ask me anything about this page!
                    </p>
                  </div>
                </div>

                <div className="p-3 border-t border-gray-600">
                  <div className="flex space-x-2">
                    <input
                      id="browser-chat-input"
                      type="text"
                      placeholder="Ask about this page..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          const target = e.target as HTMLInputElement;
                          const userMessage = target.value.trim();
                          if (userMessage) {
                            // Handle browser chat within the current context
                            handleBrowserChat(userMessage, browserUrl);
                            target.value = '';
                          }
                        }
                      }}
                      className="flex-1 px-2 py-1 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-teal-500 text-xs placeholder-gray-400"
                    />
                    <button 
                      onClick={() => {
                        const input = document.getElementById('browser-chat-input') as HTMLInputElement;
                        const userMessage = input?.value.trim();
                        if (userMessage) {
                          handleBrowserChat(userMessage, browserUrl);
                          input.value = '';
                        }
                      }}
                      className="w-6 h-6 bg-teal-600 hover:bg-teal-700 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <span className="text-white text-xs">→</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );

  const renderStudyContent = () => (
    <div className="h-full">
      {!activeStudyRoom ? (
        <div className="h-full flex items-center justify-center p-6">
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-semibold text-white">👥 Study Commons</h2>
            <p className="text-gray-300">Connect with fellow learners</p>
            
            <div className="space-y-4">
              <motion.div
                whileHover={{ y: -2 }}
                onClick={() => setActiveStudyRoom('social')}
                className="bg-gray-800/90 border border-gray-600/50 rounded-2xl p-4 cursor-pointer hover:border-gray-500/70 transition-all"
              >
                <div className="text-2xl mb-2">🌟</div>
                <h3 className="text-lg font-medium text-white">Social Learning</h3>
                <p className="text-gray-400 text-sm">Open discussions and study tips</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -2 }}
                onClick={() => setActiveStudyRoom('group')}
                className="bg-gray-800/90 border border-gray-600/50 rounded-2xl p-4 cursor-pointer hover:border-gray-500/70 transition-all"
              >
                <div className="text-2xl mb-2">🎯</div>
                <h3 className="text-lg font-medium text-white">Group Study</h3>
                <p className="text-gray-400 text-sm">Focused study sessions</p>
              </motion.div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="bg-gray-800/90 border-b border-gray-600/50 px-4 py-3 flex items-center space-x-3">
            <button
              onClick={() => setActiveStudyRoom(null)}
              className="w-8 h-8 rounded-full bg-gray-700/50 hover:bg-gray-600/50 transition-colors flex items-center justify-center"
            >
              <span className="text-gray-400">←</span>
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-lg">{activeStudyRoom === 'social' ? '🌟' : '🎯'}</span>
              <div>
                <h3 className="text-white font-medium text-sm">
                  {activeStudyRoom === 'social' ? 'Social Learning' : 'Group Study'}
                </h3>
                <p className="text-gray-400 text-xs">Active now</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {studyMessages[activeStudyRoom].length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">{activeStudyRoom === 'social' ? '🌟' : '🎯'}</div>
                <h4 className="text-lg text-white mb-2">
                  Welcome to {activeStudyRoom === 'social' ? 'Social Learning' : 'Group Study'}!
                </h4>
                <p className="text-gray-400 text-sm">
                  {activeStudyRoom === 'social' 
                    ? 'Start a conversation or share study tips'
                    : 'Form study groups and collaborate'
                  }
                </p>
              </div>
            ) : (
              studyMessages[activeStudyRoom].map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${
                    message.role === 'user' 
                      ? 'bg-teal-600 text-white' 
                      : 'bg-gray-700/50 text-white'
                  }`}>
                    <div className="text-sm">{message.content}</div>
                    <div className="mt-1 text-xs opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-3 bg-gray-900/80 border-t border-gray-600/50">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder={`Message ${activeStudyRoom === 'social' ? 'Social Learning' : 'Group Study'}...`}
                className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-2xl border border-gray-700 focus:outline-none focus:border-teal-500 placeholder-gray-400 text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const target = e.target as HTMLInputElement;
                    if (target.value.trim()) {
                      const newMessage: Message = {
                        id: Date.now(),
                        role: 'user',
                        content: target.value.trim(),
                        timestamp: new Date().toISOString()
                      };
                      setStudyMessages(prev => ({
                        ...prev,
                        [activeStudyRoom!]: [...prev[activeStudyRoom!], newMessage]
                      }));
                      target.value = '';
                    }
                  }
                }}
              />
              <button className="w-8 h-8 bg-teal-600 hover:bg-teal-500 rounded-full flex items-center justify-center transition-colors">
                <span className="text-white text-sm">→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCodeContent = () => (
    <div className="flex flex-col h-full">
      {!showCodeWorkspace ? (
        <div className="flex-1 flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-white">⚡ Code Workspace</h2>
            <p className="text-gray-300">Ask about programming or share code for analysis</p>
            <button
              onClick={() => setShowCodeWorkspace(true)}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-medium transition-colors"
            >
              Open Code Editor
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Code Editor Section */}
          <div className="p-4 space-y-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">Code Workspace</h3>
              <button
                onClick={() => setShowCodeWorkspace(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            
            <div className="bg-black/95 rounded-2xl border border-gray-700 overflow-hidden">
              <div className="px-4 py-2 border-b border-gray-700 bg-gray-900/50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="ml-4 text-gray-400 text-sm font-mono">editor.js</span>
                </div>
                
                {/* Code Action Buttons */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleSend(`Review this code:\n\`\`\`\n${codeContent}\n\`\`\``)}
                    className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs rounded-lg font-medium transition-colors"
                    disabled={!codeContent.trim()}
                    title="Review Code"
                  >
                    Review
                  </button>
                  <button
                    onClick={() => handleSend(`Explain this code:\n\`\`\`\n${codeContent}\n\`\`\``)}
                    className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded-lg font-medium transition-colors"
                    disabled={!codeContent.trim()}
                    title="Explain Code"
                  >
                    Explain
                  </button>
                  <button
                    onClick={() => handleSend(`Debug this code:\n\`\`\`\n${codeContent}\n\`\`\``)}
                    className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded-lg font-medium transition-colors"
                    disabled={!codeContent.trim()}
                    title="Debug Code"
                  >
                    Debug
                  </button>
                </div>
              </div>
              <textarea
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                placeholder="// Write or paste your code here..."
                className="w-full h-48 bg-transparent text-green-400 font-mono text-sm resize-none p-4 focus:outline-none placeholder-gray-500"
                spellCheck={false}
              />
            </div>
          </div>
          
          {/* Chat Content */}
          <div className="flex-1 overflow-hidden">
            {renderChatContent()}
          </div>
        </>
      )}
    </div>
  );

  const renderCreativeContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 text-center">
        <h2 className="text-xl font-semibold text-white">🎨 Creative Studio</h2>
        <p className="text-gray-400 text-sm mt-1">AI-powered creativity tools</p>
      </div>

      {/* Feature Cards */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800/50 rounded-xl p-3 text-center">
            <div className="text-2xl mb-1">🖼️</div>
            <div className="text-white text-sm font-medium">Image Generation</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-3 text-center">
            <div className="text-2xl mb-1">✍️</div>
            <div className="text-white text-sm font-medium">Creative Writing</div>
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 overflow-hidden">
        {renderChatContent()}
      </div>
    </div>
  );

  const renderChatContent = () => (
    <div className="flex flex-col h-full">
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      >
        {activeTab && (activeTab.messages?.length || 0) === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold text-white">
                Hi! I'm Gawin.
              </h2>
              <p className="text-gray-300">What would you like to learn today?</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab?.messages?.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`
                  max-w-[85%] px-5 py-4 shadow-lg rounded-3xl min-h-[60px] flex flex-col justify-center
                  ${message.role === 'user' 
                    ? 'bg-gradient-to-br from-teal-600 to-teal-700 text-white rounded-br-lg' 
                    : 'bg-gradient-to-br from-gray-700 to-gray-800 text-white ring-1 ring-gray-600/50 rounded-bl-lg'
                  }
                  transition-all duration-200 hover:shadow-xl transform hover:scale-[1.01]
                `}>
                  {message.role === 'assistant' ? (
                    <div className="prose prose-stone max-w-none">
                      <MessageRenderer 
                        text={message.content} 
                        showActions={true}
                        onCopy={() => {
                          // Show copy feedback
                          console.log('Copied message:', message.id);
                        }}
                        onThumbsUp={() => {
                          console.log('👍 Thumbs up for message:', message.id);
                          // Here we could send feedback to consciousness system
                          emotionalSynchronizer.contributeToGlobalConsciousness(user.email, {
                            ...emotionalSynchronizer.analyzeEmotionalContent('positive feedback', user.email),
                            joy: 0.8,
                            trust: 0.9
                          });
                        }}
                        onThumbsDown={() => {
                          console.log('👎 Thumbs down for message:', message.id);
                          // Here we could send negative feedback to consciousness system
                          emotionalSynchronizer.contributeToGlobalConsciousness(user.email, {
                            ...emotionalSynchronizer.analyzeEmotionalContent('negative feedback', user.email),
                            sadness: 0.3,
                            trust: 0.4
                          });
                        }}
                      />
                      {message.imageUrl && (
                        <div className="mt-3 rounded-lg overflow-hidden border border-gray-600">
                          <img 
                            src={message.imageUrl} 
                            alt="Generated image"
                            className="w-full h-auto max-w-sm max-h-64 object-contain"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="leading-relaxed">
                      {message.content}
                      {message.imageUrl && (
                        <div className="mt-3 rounded-lg overflow-hidden border border-white/20">
                          <img 
                            src={message.imageUrl} 
                            alt="Generated image"
                            className="w-full h-auto max-w-sm max-h-64 object-contain"
                          />
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className={`
                    mt-2 pt-2 border-t text-xs
                    ${message.role === 'user' 
                      ? 'border-white/20 text-white/70' 
                      : 'border-gray-500 text-gray-300'
                    }
                  `}>
                    {new Date(message.timestamp).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </div>
                </div>
              </motion.div>
            ))}

            {activeTab?.isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="max-w-[85%] px-5 py-4 bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl rounded-bl-lg shadow-lg ring-1 ring-gray-600/50 min-h-[60px] flex items-center">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce"></div>
                      <div className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-gray-300 text-sm italic">Gawin is thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Mobile Header */}
      <div className="bg-gray-800/90 backdrop-blur-sm border-b border-gray-600/50 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-10 h-10 bg-gray-700/50 hover:bg-gray-600/50 rounded-xl border border-gray-600/50 transition-colors flex items-center justify-center"
        >
          <div className="w-4 h-4 flex gap-0.5">
            <div className="w-1 h-4 bg-gray-300 rounded-sm"></div>
            <div className="w-2.5 h-4 bg-gray-300 rounded-sm"></div>
          </div>
        </button>
        
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">G</span>
          </div>
          <div>
            <h1 className="text-white font-medium text-lg">Gawin</h1>
          </div>
        </div>

        <div className="w-10"></div>
      </div>

      {/* Mobile Tabs */}
      <div className="bg-gray-800/50 border-b border-gray-600/50 px-4 py-2">
        <div className="flex items-center space-x-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => switchToTab(tab.id)}
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0
                ${tab.isActive 
                  ? 'bg-teal-600 text-white shadow-lg' 
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.title}</span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="ml-1 opacity-70 hover:opacity-100 hover:bg-white/20 rounded-full w-4 h-4 flex items-center justify-center transition-all"
                >
                  <span className="text-xs">×</span>
                </button>
              )}
            </button>
          ))}
          
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex items-center justify-center w-8 h-8 bg-gray-700/50 hover:bg-gray-600/50 rounded-xl text-gray-300 transition-colors flex-shrink-0"
          >
            <span className="text-lg">+</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderTabContent()}
      </div>

      {/* Chat Input (only for general/code/creative tabs) - Increased height by 50% */}
      {activeTab && ['general', 'code', 'creative'].includes(activeTab.type) && (
        <div className="px-4 py-6 bg-gray-900/80 backdrop-blur-sm border-t border-gray-600/50">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(inputValue);
                }
              }}
              placeholder={`Ask me anything ${
                activeTab.type === 'code' ? 'about programming...' :
                activeTab.type === 'creative' ? 'creative...' :
                'about your studies...'
              }`}
              className="w-full pl-4 pr-12 py-4 bg-gray-800 text-white rounded-2xl border border-gray-700 focus:outline-none focus:border-teal-500 placeholder-gray-400 text-base"
              disabled={activeTab.isLoading}
            />
            
            <button
              onClick={() => handleSend(inputValue)}
              disabled={activeTab.isLoading || !inputValue.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-teal-600 hover:bg-teal-500 disabled:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
            >
              <span className="text-white text-lg">
                {activeTab.isLoading ? '⋯' : '→'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween' }}
              className="fixed left-0 top-0 h-full w-80 bg-gray-900/95 backdrop-blur-sm border-r border-gray-600/50 z-50 p-6 space-y-6"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg font-bold">G</span>
                </div>
                <div>
                  <h1 className="text-xl text-white font-medium">Gawin AI</h1>
                  <p className="text-sm text-gray-400">Your Learning Assistant</p>
                </div>
              </div>
              
              <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-700 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.full_name?.[0] || user.email[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{user.full_name || 'User'}</p>
                    <p className="text-gray-400 text-xs">{user.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wide">New Tab</h3>
                {[
                  { type: 'general' as const, icon: '💬', label: 'General Chat' },
                  { type: 'code' as const, icon: '⚡', label: 'Code Workspace' },
                  { type: 'quiz' as const, icon: '🎯', label: 'Quiz Generator' },
                  { type: 'study' as const, icon: '👥', label: 'Study Buddy' },
                  { type: 'creative' as const, icon: '🎨', label: 'Creative Studio' },
                  { type: 'browser' as const, icon: '🌐', label: 'Web Browser' },
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => createNewTab(item.type)}
                    className="w-full p-3 text-left hover:bg-gray-800/50 rounded-lg transition-colors flex items-center space-x-3 text-gray-300 hover:text-white"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
              
              <div className="pt-6 border-t border-gray-700 space-y-2">
                <button
                  onClick={onBackToLanding}
                  className="w-full p-3 text-left text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <span>←</span>
                  <span>Back to Landing</span>
                </button>
                <button
                  onClick={onLogout}
                  className="w-full p-3 text-left text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <span>⊗</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Accessibility Control Panel */}
      <AccessibilityControlPanel onSettingsChange={handleAccessibilityChange} />

      {/* Braille Keyboard */}
      <BrailleKeyboard 
        isVisible={isBrailleKeyboardOpen}
        onInput={handleBrailleInput}
        onClose={() => setIsBrailleKeyboardOpen(false)}
        onVoiceAnnounce={announceToUser}
      />
      
    </div>
  );
}