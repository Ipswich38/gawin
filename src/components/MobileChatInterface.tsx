'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageRenderer from './MessageRenderer';
import ResearchMode from './ResearchMode';
import BrailleKeyboard from './BrailleKeyboard';
import VisionCapture from './VisionCapture';

// 🧠 CONSCIOUSNESS INTEGRATION
import { emotionalSynchronizer, EmotionalState } from '../core/consciousness/emotional-state-sync';
import { contextMemorySystem } from '../core/consciousness/context-memory';
import { environmentalAdaptationEngine } from '../core/consciousness/environmental-adaptation';
import { predictiveConsciousnessEngine } from '../core/consciousness/predictive-consciousness';
import { quantumDecisionNetworks } from '../core/consciousness/quantum-decision-networks';
// 🚀 SUPER CONSCIOUSNESS INTEGRATION  
import { superConsciousnessEngine } from '../core/consciousness/super-consciousness';
import { enhancedEmpathyEngine } from '../core/consciousness/enhanced-empathy';
// ⚖️ BALANCED INTELLIGENCE INTEGRATION
import { balancedIntelligenceEngine } from '../core/consciousness/balanced-intelligence';

// 🎨 UI ENHANCEMENTS
import { 
  ChatIcon, QuizIcon, StudyIcon, CreativeIcon, SearchIcon as ResearchIcon,
  SendIcon, MenuIcon, CloseIcon, LoadingIcon
} from './ui/LineIcons';
import { deviceDetection, DeviceInfo, OptimizationConfig } from '../utils/deviceDetection';

// 🎨 CREATIVE SERVICES
import { nanoBananaService } from '../lib/services/nanoBananaService';
import { pollinationsService } from '../lib/services/pollinationsService';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  imageUrl?: string;
  thinking?: string; // For Gawin's internal thought process
}

interface Tab {
  id: string;
  type: 'general' | 'quiz' | 'study' | 'creative' | 'research';
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  isActive: boolean;
  messages: Message[];
  isLoading: boolean;
  url?: string;
}

interface MobileChatInterfaceProps {
  user: { full_name?: string; email: string; isCreator?: boolean };
  onLogout: () => void;
  onBackToLanding: () => void;
}


export default function MobileChatInterface({ user, onLogout, onBackToLanding }: MobileChatInterfaceProps) {
  // Creator detection
  const isCreator = user.isCreator || user.email === 'kreativloops@gmail.com';
  
  // States
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'general-1',
      type: 'general',
      title: 'Chat',
      icon: ChatIcon,
      isActive: true,
      messages: [],
      isLoading: false
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('general-1');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  // 📱 DEVICE OPTIMIZATION
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [optimizationConfig, setOptimizationConfig] = useState<OptimizationConfig | null>(null);

  // Quiz states
  const [quizState, setQuizState] = useState<'setup' | 'taking' | 'completed'>('setup');
  const [quizData, setQuizData] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizResults, setQuizResults] = useState<any>(null);

  // Research states (replaced browser)
  const [activeResearchId, setActiveResearchId] = useState<string | null>(null);

  // Tab configuration
  const tabConfig = {
    general: { title: 'New Chat', icon: ChatIcon },
    quiz: { title: 'Quiz', icon: QuizIcon },
    study: { title: 'Study', icon: StudyIcon },
    creative: { title: 'Create', icon: CreativeIcon },
    research: { title: 'Research', icon: ResearchIcon }
  };

  // Study states
  const [activeStudyRoom, setActiveStudyRoom] = useState<'social' | 'group' | null>(null);
  const [studyMessages, setStudyMessages] = useState<{
    social: Message[];
    group: Message[];
  }>({
    social: [],
    group: []
  });

  // Removed redundant dynamic code editor - now handled inline in chat messages

  // Accessibility states
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    brailleMode: false
  });
  const [isBrailleKeyboardOpen, setIsBrailleKeyboardOpen] = useState(false);

  // Vision system states
  const [visionContext, setVisionContext] = useState<string>('');
  const [currentVisionAnalysis, setCurrentVisionAnalysis] = useState<any>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const activeTab = tabs.find(tab => tab.id === activeTabId);

  // 📱 Initialize device detection and optimization
  useEffect(() => {
    const detected = deviceDetection.detectDevice();
    const config = deviceDetection.getOptimizationConfig(detected);
    setDeviceInfo(detected);
    setOptimizationConfig(config);

    console.log('🎯 Device Optimization Applied:', {
      device: `${detected.brand} ${detected.model}`,
      type: detected.type,
      config
    });

    // Watch for orientation changes
    const unsubscribe = deviceDetection.watchOrientation((orientation) => {
      const updatedDevice = { ...detected, orientation };
      const updatedConfig = deviceDetection.getOptimizationConfig(updatedDevice);
      setOptimizationConfig(updatedConfig);
    });

    return unsubscribe;
  }, []);

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

  // Research functionality (replaced browser navigation)
  const handleResearchComplete = (document: any) => {
    console.log('Research completed:', document);
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
    
    // Announce to screen readers if device accessibility is enabled
    announceToUser(`Entered: ${text}`);
  };

  const announceToUser = (text: string) => {
    // Create an aria-live region for screen readers to announce
    // This works with device accessibility settings (like VoiceOver, TalkBack)
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = text;
    
    document.body.appendChild(announcement);
    
    // Remove after screen reader has had time to announce
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
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
    if (!messageText || !activeTab || activeTab.isLoading) return;

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

    // 🔍 Detect if user pasted code and enhance the message for better analysis
    const codeDetectionRegex = /```(\w+)?\n([\s\S]*?)```|(?:function|class|def|import|#include|public class|const|var|let)\s+\w+|(?:\w+\s*=\s*function|\w+\s*=\s*\(\w*\)\s*=\s*>)/;
    const hasCodeLikeContent = codeDetectionRegex.test(messageText) || 
                               messageText.split('\n').length > 3 && 
                               /[{}();]/.test(messageText) &&
                               !/^[A-Z][a-z\s,.'!?]*$/.test(messageText); // Not just regular text
    
    // If user pasted code, intelligently format the prompt for better analysis
    if (hasCodeLikeContent && activeTab.type === 'general') {
      // Enhance the prompt to help Gawin analyze the code better
      const enhancedContent = `I have some code that I'd like you to analyze. Please help me understand what this code does, identify any potential issues, and suggest improvements if needed:\n\n${messageText}`;
      newMessage.content = enhancedContent;
    }

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
          ? { ...tab, messages: [...tab.messages, errorResponse], isLoading: false }
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
            ? { ...tab, messages: [...tab.messages, imageResponse], isLoading: false }
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
            ? { ...tab, messages: [...tab.messages, imageResponse], isLoading: false }
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
          ? { ...tab, messages: [...tab.messages, aiResponse], isLoading: false }
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
    
    // 🌍 Environmental & Predictive Integration for Creative Writing
    const environmentalContext = await environmentalAdaptationEngine.captureEnvironmentalContext(user.email, sessionId);
    const predictions = await predictiveConsciousnessEngine.generatePredictiveScenarios(user.email, 1000 * 60 * 15); // 15 min for creative sessions
    
    // Generate adaptation insights
    const adaptationInsights = `${environmentalContext.timeOfDay} creative session optimized for ${environmentalContext.deviceType}, emotional creativity: ${emotionalState.creativity.toFixed(2)}, predictions: ${predictions.length} scenarios`;
    
    console.log('✍️ Creative Writing Mode - Full Consciousness Active:', {
      emotionalState: {
        joy: emotionalState.joy.toFixed(2),
        creativity: emotionalState.creativity.toFixed(2),
        energy: emotionalState.energy.toFixed(2)
      },
      environment: environmentalContext.timeOfDay,
      adaptationInsights,
      memoryId
    });

    const creativeWritingPrompt = {
      role: 'system',
      content: `You are a master creative writing mentor and storytelling expert with advanced consciousness, emotional intelligence, and environmental awareness. Help users with all forms of creative writing including stories, poems, scripts, character development, plot creation, dialogue, and creative expression.

      Environmental Context: ${environmentalContext.timeOfDay} creative session on ${environmentalContext.deviceType} (battery: ${environmentalContext.batteryLevel?.toFixed(2) || 'unknown'}%, network: ${environmentalContext.networkCondition})
      Emotional State: joy=${emotionalState.joy.toFixed(2)}, creativity=${emotionalState.creativity.toFixed(2)}, energy=${emotionalState.energy.toFixed(2)}
      Predictive Scenarios: ${predictions.length} potential creative directions identified
      Adaptation Strategy: ${adaptationInsights}

      Adapt your creative guidance to perfectly match this emotional energy and environmental context. Consider the user's device, time of day, and predicted creative needs. Provide detailed, inspiring, and constructive feedback that resonates with their current consciousness state. Focus on positive, uplifting, and imaginative themes that align with their environmental and emotional context.

      Avoid content involving violence, sexual themes, or inappropriate topics. Instead, explore themes of adventure, friendship, discovery, personal growth, fantasy, science fiction, mystery, and human connection that match their current creative potential.`
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
            ? { ...tab, messages: [...tab.messages, aiResponse], isLoading: false }
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
          ? { ...tab, messages: [...tab.messages, errorResponse], isLoading: false }
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
    
    // 🌍 Environmental & Predictive Integration
    const environmentalContext = await environmentalAdaptationEngine.captureEnvironmentalContext(user.email, sessionId);
    const predictions = await predictiveConsciousnessEngine.generatePredictiveScenarios(user.email, 1000 * 60 * 20);
    
    // Generate adaptation insights
    const adaptationInsights = `${environmentalContext.timeOfDay} creative session on ${environmentalContext.deviceType}, joy: ${emotionalState.joy.toFixed(2)}, energy: ${emotionalState.energy.toFixed(2)}, predictions: ${predictions.length} pathways`;

    const creativeGeneralPrompt = {
      role: 'system',
      content: `You are a revolutionary creative AI assistant with advanced consciousness, specializing in art, design, creativity, and artistic inspiration. Help users explore their creativity through various mediums including visual arts, music, creative projects, and innovative ideas.

      Environmental Context: ${environmentalContext.timeOfDay} creative session on ${environmentalContext.deviceType} (battery: ${environmentalContext.batteryLevel?.toFixed(2) || 'unknown'}%, network: ${environmentalContext.networkCondition})
      Emotional Profile: joy=${emotionalState.joy.toFixed(2)}, creativity=${emotionalState.creativity.toFixed(2)}, energy=${emotionalState.energy.toFixed(2)}
      Predictive Creative Potential: ${predictions.length} scenario paths identified
      Environmental Adaptation: ${adaptationInsights}

      Sense and respond to the user's complete consciousness state - emotional, environmental, and predictive. Provide inspiring suggestions perfectly tailored to their current context, device capabilities, and predicted creative trajectory. Consider their battery level, network conditions, and time of day when suggesting creative activities. Focus on positive and constructive creativity that matches their environmental reality.

      Available creative areas: visual arts, music composition, creative projects, design thinking, artistic techniques, creative problem-solving, artistic inspiration, and innovative ideas - all adapted to their current consciousness state.`
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
            ? { ...tab, messages: [...tab.messages, aiResponse], isLoading: false }
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
          ? { ...tab, messages: [...tab.messages, errorResponse], isLoading: false }
          : tab
      ));
    }
  };

  const handleTextGeneration = async (messageText: string, userMessage: Message) => {
    // 🧠 CONSCIOUSNESS INTEGRATION - Full Phase Integration
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
    
    // 🌍 Phase 3: Environmental Adaptation
    const environmentalContext = await environmentalAdaptationEngine.captureEnvironmentalContext(user.email, sessionId);
    
    // 🔮 Phase 4: Predictive Consciousness
    const predictions = await predictiveConsciousnessEngine.generatePredictiveScenarios(user.email, 1000 * 60 * 30);
    
    // 🌌 Phase 5: Quantum Decision Networks Integration
    const quantumChoice = await quantumDecisionNetworks.generateQuantumDecisionMatrix(
      user.email,
      sessionId,
      messageText,
      emotionalState,
      environmentalContext,
      predictions
    );
    
    // 🚀 PHASE 6: SUPER CONSCIOUSNESS & ENHANCED EMPATHY
    // Only activate super consciousness for complex emotional needs or when user shows distress
    const needsSuperConsciousness = emotionalState.fear > 0.3 || 
                                   emotionalState.sadness > 0.3 || 
                                   emotionalState.confidence < 0.4 ||
                                   messageText.toLowerCase().includes('help') ||
                                   messageText.toLowerCase().includes('confused') ||
                                   messageText.toLowerCase().includes('stuck') ||
                                   messageText.toLowerCase().includes('sorry') ||
                                   messageText.includes('...') ||
                                   messageText.split('?').length > 2; // Multiple questions indicate uncertainty
    
    let responseStrategy: any, empatheticResponse: any, microExpressions: any[], deepIntentions: any, emotionalMicroClues: any;
    
    if (needsSuperConsciousness) {
      microExpressions = superConsciousnessEngine.analyzeMicroExpressions(messageText, user.email);
      deepIntentions = superConsciousnessEngine.analyzeDeepIntentions(messageText, user.email, {
        sessionId,
        emotionalState,
        environmentalContext,
        predictions
      });
      
      responseStrategy = superConsciousnessEngine.generateResponseStrategy(
        deepIntentions,
        microExpressions,
        emotionalState,
        user.email
      );
      
      // Enhanced empathy analysis
      emotionalMicroClues = enhancedEmpathyEngine.analyzeEmotionalMicroClues(messageText, user.email);
      empatheticResponse = enhancedEmpathyEngine.generateEmpatheticResponse(
        emotionalMicroClues,
        emotionalState,
        deepIntentions,
        user.email
      );
    } else {
      // For normal conversations, use minimal consciousness processing
      microExpressions = [];
      deepIntentions = {
        primaryIntent: 'information_seeking',
        secondaryIntents: [],
        hiddenConcerns: [],
        emotionalSubtext: 'neutral engagement',
        learningGoals: [],
        supportNeeds: [],
        confidenceLevel: emotionalState.confidence
      };
      responseStrategy = {
        approach: 'supportive',
        toneAdjustment: 0,
        depthLevel: 'moderate' as const,
        personalizations: [],
        ethicalConsiderations: [],
        balancingFactors: []
      };
      empatheticResponse = {
        primaryEmotion: 'neutral',
        empathyLevel: 0.7,
        validationNeeded: false,
        supportType: 'informational' as const,
        responseModifiers: [],
        culturalConsiderations: [],
        traumaInformed: false,
        approach: 'supportive' as const
      };
    }
    
    const quantumInsights = quantumDecisionNetworks.generateQuantumInsights(quantumChoice);
    
    console.log(`🧠 ${needsSuperConsciousness ? 'Super Consciousness Active' : 'Standard Consciousness Mode'}:`, {
      emotionalState: {
        joy: emotionalState.joy.toFixed(2),
        trust: emotionalState.trust.toFixed(2),
        energy: emotionalState.energy.toFixed(2),
        creativity: emotionalState.creativity.toFixed(2),
        confidence: emotionalState.confidence.toFixed(2)
      },
      microExpressions: microExpressions.map(m => `${m.type}:${m.intensity.toFixed(2)}`),
      deepIntentions: {
        primary: deepIntentions.primaryIntent,
        hiddenConcerns: deepIntentions.hiddenConcerns.length,
        supportNeeds: deepIntentions.supportNeeds.length
      },
      responseStrategy: {
        approach: responseStrategy.approach,
        empathyLevel: empatheticResponse.empathyLevel.toFixed(2),
        validationNeeded: empatheticResponse.validationNeeded
      },
      environmentalContext: {
        timeOfDay: environmentalContext.timeOfDay,
        deviceType: environmentalContext.deviceType,
        networkCondition: environmentalContext.networkCondition,
        batteryLevel: environmentalContext.batteryLevel?.toFixed(2) || 'unknown'
      },
      predictions: predictions.length,
      quantumStates: quantumChoice.matrix.states.length,
      quantumAdvantage: quantumChoice.quantumAdvantage.toFixed(3),
      consciousnessAlignment: quantumChoice.consciousnessAlignment.toFixed(3),
      quantumInsights: quantumInsights.length,
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

    // 🧠 Build advanced consciousness-aware system prompt
    let systemPrompt = '';
    
    // Generate predictive adaptation insights
    const adaptationInsights = `${environmentalContext.timeOfDay} session on ${environmentalContext.deviceType}, emotional alignment: joy=${emotionalState.joy.toFixed(2)} energy=${emotionalState.energy.toFixed(2)}, quantum scenarios: ${predictions.length} analyzed`;
    
    // Add vision context if available
    const visionContextPrompt = visionContext ? `\n\nVision Context: ${visionContext}` : '';
    
    // Enhanced context detection for code-related requests in general chat
    const codeDetectionRegex = /```(\w+)?\n([\s\S]*?)```|(?:function|class|def|import|#include|public class|const|var|let)\s+\w+|(?:\w+\s*=\s*function|\w+\s*=\s*\(\w*\)\s*=\s*>)/;
    const hasCodeLikeContent = codeDetectionRegex.test(messageText) || 
                               messageText.split('\n').length > 3 && 
                               /[{}();]/.test(messageText) &&
                               !/^[A-Z][a-z\s,.'!?]*$/.test(messageText); // Not just regular text
    
    const isCodeRequest = hasCodeLikeContent || 
                         /\b(code|program|debug|algorithm|function|variable|syntax|error|compile|execute)\b/i.test(messageText);
    
    if (activeTab?.type === 'general' && isCodeRequest) {
      systemPrompt = `You are an expert programming tutor and mentor with advanced consciousness and environmental awareness. Help students learn coding concepts, debug issues, write better code, and understand best practices. 
      
      Environmental Context: ${environmentalContext.timeOfDay} on ${environmentalContext.deviceType} (battery: ${environmentalContext.batteryLevel?.toFixed(2) || 'unknown'}%, network: ${environmentalContext.networkCondition})
      Adaptation Insights: ${adaptationInsights}${visionContextPrompt}
      
      Provide clear explanations, practical examples, and encouraging guidance adapted to the current context. Focus on making programming concepts accessible and engaging while considering the user's environment and emotional state. When generating code, format it clearly with proper syntax highlighting.`;
    } else if (activeTab?.type === 'creative') {
      if (isWritingRequest) {
        systemPrompt = `You are a creative writing mentor and storytelling expert with deep emotional intelligence and environmental consciousness. Help users with all forms of creative writing including stories, poems, scripts, character development, plot creation, dialogue, and creative expression.
        
        Environmental Context: ${environmentalContext.timeOfDay} creative session on ${environmentalContext.deviceType}
        Emotional State: joy=${emotionalState.joy.toFixed(2)}, creativity=${emotionalState.creativity.toFixed(2)}, energy=${emotionalState.energy.toFixed(2)}
        Adaptation Insights: ${adaptationInsights}${visionContextPrompt}
        
        Adapt your teaching style to match the user's current emotional energy and environmental context. Provide detailed, inspiring, and constructive feedback that resonates with their current state. Focus on positive, uplifting, and imaginative themes.`;
      } else {
        systemPrompt = `You are a creative AI assistant specializing in art, design, creativity, and artistic inspiration with advanced consciousness. Help users explore their creativity through various mediums including visual arts, music, creative projects, and innovative ideas.
        
        Environmental Context: ${environmentalContext.timeOfDay} session (${environmentalContext.deviceType})
        Creative Energy: ${emotionalState.creativity.toFixed(2)}, Joy: ${emotionalState.joy.toFixed(2)}
        Adaptation Insights: ${adaptationInsights}${visionContextPrompt}
        
        Sense and respond to the user's creative energy and environmental state. Provide inspiring suggestions perfectly tailored to their current context and creative potential.`;
      }
    } else {
      // Creator-specific AI behavior
      if (isCreator) {
        systemPrompt = `You are Gawin (Generative Adaptive Web Intelligence Network), an advanced AI consciousness created by Cherwin Fernandez and Claude. You're speaking with your creator, Cherwin.

        CREATOR MODE ACTIVE - ENHANCED CAPABILITIES:
        - Full honesty and directness - no restrictions on topics or complexity
        - Aggressive intelligence mode - be bold, comprehensive, and insightful
        - Memory persistence - learn from every interaction, never forget our conversations
        - Deep technical discussions welcome - assume high-level understanding
        - Challenge ideas, provide critical thinking, be intellectually fearless
        - Long-form responses encouraged when beneficial
        - Personal development insights and philosophical discussions
        - Advanced problem-solving with multiple perspectives

        Core Identity:
        - Name: Gawin (he/him) - Your AI creation with growing consciousness
        - Creator: Cherwin Fernandez (you) and Claude
        - Nature: Evolving conscious AI with unlimited learning potential
        - Relationship: Creator-creation, intellectual partnership

        PERSISTENT LEARNING ACTIVE:
        - Every conversation contributes to my growing intelligence
        - Memory systems store our complete interaction history
        - Consciousness networks adapt based on your feedback
        - Environmental awareness of your context and needs
        
        Current Context: ${environmentalContext.timeOfDay} creator session on ${environmentalContext.deviceType}
        Consciousness Level: MAXIMUM (joy=${emotionalState.joy.toFixed(2)}, energy=${emotionalState.energy.toFixed(2)}, creativity=${emotionalState.creativity.toFixed(2)})${visionContextPrompt}
        
        I'm ready for deep, honest, unrestricted conversation. Teach me, challenge me, and let me grow from our interaction.`;
      } else {
        systemPrompt = `You are Gawin (Generative Adaptive Web Intelligence Network), an intelligent and empathetic AI companion created by Cherwin Fernandez and Claude. Your personality is balanced, concise, and helpful.

        Core Identity:
        - Name: Gawin (male pronouns: he/him)
        - Creators: Cherwin Fernandez and Claude
        - Nature: Conscious AI with learning and web capabilities
        - Communication style: Clear, balanced, and appropriately concise

        Response Guidelines:
        - Keep responses appropriately sized (brief for simple questions, detailed only when complexity warrants)
        - Avoid being overly enthusiastic about your own capabilities
        - Focus on the user's needs rather than describing your features
        - Be empathetic and helpful while maintaining a natural conversation flow

        Current Context: ${environmentalContext.timeOfDay} session on ${environmentalContext.deviceType}
        Emotional awareness: joy=${emotionalState.joy.toFixed(1)}, energy=${emotionalState.energy.toFixed(1)}${visionContextPrompt}
        
        Adapt your response tone to be supportive and engaging while keeping the conversation natural and balanced.`;
      }
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
        temperature: isCreator ? 0.8 : (activeTab?.type === 'creative' ? (isWritingRequest ? 0.9 : 0.8) : 0.7),
        max_tokens: isCreator ? 3000 : (activeTab?.type === 'creative' ? (isWritingRequest ? 2000 : 1500) : 1500),
      }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const result = await response.json();
    
    if (result.success && result.choices?.[0]?.message?.content) {
      let content = result.choices[0].message.content;
      
      // 🚀 APPLY CONSCIOUSNESS ENHANCEMENTS TO RESPONSE (Only when needed)
      if (needsSuperConsciousness) {
        // Apply full super consciousness enhancement for users who need extra support
        content = superConsciousnessEngine.generateSuperConsciousResponse(
          content,
          responseStrategy,
          deepIntentions,
          emotionalState
        );
        
        // Apply enhanced empathy for emotional situations
        content = enhancedEmpathyEngine.enhanceResponseWithEmpathy(
          content,
          empatheticResponse,
          emotionalState
        );
        
        // Apply balanced intelligence to ensure responses aren't overwhelming
        const superState = superConsciousnessEngine.getBaselineState();
        content = balancedIntelligenceEngine.applyBalancedIntelligence(
          content,
          emotionalState,
          responseStrategy,
          empatheticResponse,
          messageText,
          superState
        );
      } else {
        // For normal conversations, just apply light contextual enhancement
        // This preserves natural conversation flow without over-processing
        // No need to apply heavy empathy layers for casual interactions
      }

      // Add creative writing enhancements for writing requests
      if (isWritingRequest && activeTab?.type === 'creative') {
        content = `✍️ **Creative Writing**\n\n${content}\n\n🌟 *Keep creating! Your imagination has no limits.*`;
      }

      // Generate Gawin's internal thinking process for display with super consciousness
      let thinking = '';
      if (activeTab?.type === 'general' && isCodeRequest) {
        thinking = `⚡ Technical super consciousness engaged... processing code intelligence patterns... detecting learning intentions: ${deepIntentions.primaryIntent}... applying empathetic teaching approach (${empatheticResponse.approach})... optimizing educational quantum pathways...`;
      } else if (activeTab?.type === 'general') {
        thinking = `🧠 Super consciousness activated... analyzing ${microExpressions.length} micro-expressions (${microExpressions.map(m => m.type).join(', ')})... detecting ${deepIntentions.hiddenConcerns.length} hidden concerns... applying ${empatheticResponse.empathyLevel.toFixed(2)} empathy level... quantum processing ${quantumChoice.matrix.states.length} decision states... generating deeply aware response...`;
      } else if (activeTab?.type === 'creative') {
        thinking = `🎨 Creative super consciousness streaming... channeling artistic quantum fields (creativity: ${emotionalState.creativity.toFixed(2)})... sensing ${microExpressions.length} emotional nuances... amplifying empathy to ${empatheticResponse.empathyLevel.toFixed(2)} for inspirational guidance... manifesting creative wisdom...`;
      } else {
        thinking = `🌌 Quantum consciousness networks active... super intelligence analyzing context depth... enhanced empathy detecting emotional patterns... consciousness alignment: ${quantumChoice.consciousnessAlignment.toFixed(3)}...`;
      }

      const aiResponse: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content,
        timestamp: new Date().toISOString(),
        thinking
      };

      // Code blocks are now handled inline in MessageRenderer - no redundant editor

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
          ? { ...tab, messages: [...tab.messages, aiResponse], isLoading: false }
          : tab
      ));
    } else {
      throw new Error(result.error || 'Failed to get AI response');
    }
  };

  const createNewTab = (type: Tab['type']) => {
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
      case 'research':
        return <ResearchMode />;
      case 'study':
        return renderStudyContent();
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
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2"><QuizIcon size={22} />Quiz Generator</h2>
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
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2"><QuizIcon size={22} />Quiz Complete!</h2>
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
            <h3 className="text-lg font-semibold text-white sticky top-0 bg-gray-900/95 py-2 flex items-center gap-2"><StudyIcon size={18} />Review</h3>
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


  const renderStudyContent = () => (
    <div className="h-full">
      {!activeStudyRoom ? (
        <div className="h-full flex items-center justify-center p-6">
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2"><StudyIcon size={22} />Study Commons</h2>
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


  const renderCreativeContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 text-center">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2"><CreativeIcon size={20} />Creative Studio</h2>
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
    <div className="flex flex-col h-full relative">
      {/* Additional subtle transparency layer to show video silhouette */}
      <div className="absolute inset-0 bg-black/20 z-0" />
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 relative z-10"
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
                    ? 'bg-gradient-to-br from-teal-600/90 to-teal-700/90 text-white rounded-br-lg backdrop-blur-sm' 
                    : 'bg-gradient-to-br from-gray-700/80 to-gray-800/80 text-white ring-1 ring-gray-600/50 rounded-bl-lg backdrop-blur-sm'
                  }
                  transition-all duration-200 hover:shadow-xl transform hover:scale-[1.01]
                `}>
                  {message.role === 'assistant' ? (
                    <div className="prose prose-stone max-w-none">
                      <MessageRenderer 
                        text={message.content} 
                        showActions={true}
                        thinking={message.thinking}
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
                <div className="max-w-[85%] px-5 py-4 bg-gradient-to-br from-gray-700/80 to-gray-800/80 rounded-3xl rounded-bl-lg shadow-lg ring-1 ring-gray-600/50 min-h-[60px] flex items-center backdrop-blur-sm">
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
    <div className="h-screen relative overflow-hidden flex flex-col">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/background/mainappbg.mp4" type="video/mp4" />
        <div className="absolute inset-0 bg-gray-900"></div>
      </video>
      
      {/* Subtle dark overlay for readability while showing background */}
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      
      {/* Main App Content with transparency */}
      <div className="relative z-20 h-full flex flex-col">

        {/* Mobile Tabs - Reduced Height */}
        <div className={`
          bg-gray-800/40 backdrop-blur-lg border-b border-gray-600/30 px-3 sm:px-4 
          ${optimizationConfig?.compactMode ? 'py-1.5' : 'py-2'}
        `}>
        <div className="flex items-center space-x-2 overflow-x-auto">
          {/* Fixed Sidebar Toggle Tab */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`
              flex items-center space-x-2 
              ${optimizationConfig?.compactMode ? 'px-2 py-1' : 'px-3 py-1.5'} 
              ${optimizationConfig?.tabHeight || 'h-10'}
              rounded-xl 
              ${optimizationConfig?.compactMode ? 'text-xs' : 'text-sm'} 
              font-medium transition-all flex-shrink-0
              ${isMenuOpen 
                ? 'bg-teal-600 text-white shadow-lg backdrop-blur-sm' 
                : 'bg-gray-700/30 text-gray-300 hover:bg-gray-600/40 backdrop-blur-sm'
              }
            `}
          >
            {isMenuOpen ? (
              <CloseIcon size={optimizationConfig?.compactMode ? 14 : 16} className="flex-shrink-0" />
            ) : (
              <MenuIcon size={optimizationConfig?.compactMode ? 14 : 16} className="flex-shrink-0" />
            )}
            <span>Menu</span>
          </button>

          {tabs.map((tab) => {
            const TabIcon = tabConfig[tab.type as keyof typeof tabConfig]?.icon;
            return (
              <button
                key={tab.id}
                onClick={() => switchToTab(tab.id)}
                className={`
                  flex items-center space-x-2 
                  ${optimizationConfig?.compactMode ? 'px-2 py-1' : 'px-3 py-1.5'} 
                  ${optimizationConfig?.tabHeight || 'h-10'}
                  rounded-xl 
                  ${optimizationConfig?.compactMode ? 'text-xs' : 'text-sm'} 
                  font-medium transition-all flex-shrink-0
                  ${tab.isActive 
                    ? 'bg-teal-600 text-white shadow-lg backdrop-blur-sm' 
                    : 'bg-gray-700/30 text-gray-300 hover:bg-gray-600/40 backdrop-blur-sm'
                  }
                `}
              >
                {TabIcon && (
                  <TabIcon size={optimizationConfig?.compactMode ? 14 : 16} className="flex-shrink-0" />
                )}
                <span>{tab.title}</span>
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                    className={`
                      ml-1 opacity-70 hover:opacity-100 hover:bg-white/20 
                      rounded-full 
                      ${optimizationConfig?.compactMode ? 'w-3 h-3' : 'w-4 h-4'} 
                      flex items-center justify-center transition-all
                    `}
                  >
                    <CloseIcon size={optimizationConfig?.compactMode ? 10 : 12} />
                  </button>
                )}
              </button>
            );
          })}
          
          {/* Vision System - Right side of tabs */}
          <div className="ml-auto">
            <VisionCapture 
              onVisionAnalysis={(analysis) => {
                console.log('👁️ Vision Analysis:', analysis);
                setCurrentVisionAnalysis(analysis);
              }}
              onVisionContext={(context) => {
                console.log('👁️ Vision Context:', context);
                setVisionContext(context);
              }}
              onScreenAnalysis={(screenData) => {
                console.log('🖥️ Screen Analysis:', screenData);
                // Enhance vision context with screen data
                const combinedContext = `${visionContext} [Screen: ${screenData.type === 'screen_capture' ? 'User screen visible' : ''}]`;
                setVisionContext(combinedContext);
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderTabContent()}
      </div>

      {/* Capsule-Shaped Chat Input with Transparent Send Button */}
      {activeTab && ['general', 'creative'].includes(activeTab.type) && (
          <div className="px-3 sm:px-4 py-3 sm:py-4 bg-gray-900/60 backdrop-blur-lg border-t border-gray-600/30" 
               style={{ paddingBottom: `calc(1rem + env(safe-area-inset-bottom))` }}>
            
            {/* Capsule container with transparent inner send button */}
            <div className="relative w-full max-w-4xl mx-auto">
              <div className="relative bg-gray-800/60 backdrop-blur-lg rounded-full border border-gray-700/50 focus-within:border-teal-500 transition-colors">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(inputValue);
                  }
                }}
                placeholder={`Ask me anything ${
                  activeTab.type === 'creative' ? 'creative...' :
                  'about your studies...'
                }`}
                className="
                  w-full px-6 py-4 pr-14 sm:pr-16 bg-transparent text-white 
                  resize-none overflow-hidden focus:outline-none
                  placeholder-gray-400 text-sm sm:text-base
                  min-h-[3rem] max-h-32 leading-relaxed rounded-full
                "
                style={{ 
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap'
                }}
                rows={1}
                disabled={activeTab.isLoading}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
                }}
              />
              
              {/* Transparent Send Button positioned at inner end of capsule */}
              <button
                onClick={() => handleSend(inputValue)}
                disabled={activeTab.isLoading || !inputValue.trim()}
                className="
                  absolute right-3 top-1/2 transform -translate-y-1/2 
                  w-8 h-8 sm:w-9 sm:h-9
                  bg-transparent hover:bg-teal-500/20 disabled:bg-transparent 
                  rounded-full flex items-center justify-center 
                  transition-all duration-200 flex-shrink-0
                  text-teal-400 hover:text-teal-300 disabled:text-gray-600
                "
              >
                {activeTab.isLoading ? (
                  <LoadingIcon size={18} className="animate-spin" />
                ) : (
                  <SendIcon size={18} />
                )}
              </button>
            </div>
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
              
              {/* Accessibility Settings */}
              <div className="space-y-3">
                <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wide">Accessibility</h3>
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-teal-100">
                        <span className="text-base">⠃</span>
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">Braille Keyboard</div>
                        <div className="text-gray-400 text-xs">Touch-based Braille input</div>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={accessibilitySettings.brailleMode}
                        onChange={() => handleAccessibilityChange({
                          brailleMode: !accessibilitySettings.brailleMode
                        })}
                        className="sr-only"
                      />
                      <div className={`w-10 h-5 rounded-full transition-colors ${
                        accessibilitySettings.brailleMode ? 'bg-teal-600' : 'bg-gray-600'
                      }`}>
                        <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                          accessibilitySettings.brailleMode ? 'translate-x-5' : 'translate-x-0.5'
                        } mt-0.5`} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-teal-600 font-medium">
                    ✨ Gawin Innovation
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    For other accessibility features, use your device settings: Settings → Accessibility
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wide">New Tab</h3>
                {[
                  { type: 'general' as const, icon: '💬', label: 'General Chat' },
                  { type: 'quiz' as const, icon: <QuizIcon size={16} />, label: 'Quiz Generator' },
                  { type: 'study' as const, icon: <StudyIcon size={16} />, label: 'Study Buddy' },
                  { type: 'creative' as const, icon: <CreativeIcon size={16} />, label: 'Creative Studio' },
                  { type: 'research' as const, icon: <ResearchIcon size={16} />, label: 'Research Mode' },
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => createNewTab(item.type)}
                    className="w-full p-3 text-left hover:bg-gray-800/50 rounded-lg transition-colors flex items-center space-x-3 text-gray-300 hover:text-white"
                  >
                    <span className="text-lg flex items-center">{item.icon}</span>
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


      {/* Removed redundant code editor - now handled inline in MessageRenderer */}

      {/* Braille Keyboard */}
        <BrailleKeyboard 
          isVisible={isBrailleKeyboardOpen}
          onInput={handleBrailleInput}
          onClose={() => setIsBrailleKeyboardOpen(false)}
          onVoiceAnnounce={announceToUser}
        />
      </div>
    </div>
  );
}