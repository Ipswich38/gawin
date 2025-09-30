'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ModernMessageRenderer from './ModernMessageRenderer';
import { ResponseProcessingService } from '@/lib/services/responseProcessingService';
import ResearchMode from './ResearchMode';
import SimpleVision from './SimpleVision';
import UnifiedVoiceControl from './UnifiedVoiceControl';
import TranslationControl from './TranslationControl';
import CreatorDashboard from './CreatorDashboard';
import GawinVisionPOV from './GawinVisionPOV';
import UpdateNotification from './UpdateNotification';
import GradeAAnalyticsDashboard from './GradeAAnalyticsDashboard';
import { hapticService } from '@/lib/services/hapticService';
import { autoUpdateService } from '@/lib/services/autoUpdateService';
import { UniversalDocumentFormatter } from '@/lib/formatters/universalDocumentFormatter';
import { GawinConversationEngine, type ConversationContext, type EnhancedResponse } from '@/lib/services/gawinConversationEngine';
import { LocationService, type UserLocation } from '@/lib/services/locationService';
import LocationStatusBar from './LocationStatusBar';
import PrivacyDashboard from './PrivacyDashboard';
import ImmersiveVoiceMode from './ImmersiveVoiceMode';
import { MiniatureCube } from './MiniatureCube';
import PremiumFeatureGate from './PremiumFeatureGate';
import { userPermissionService } from '../lib/services/userPermissionService';
import { tagalogSpeechAnalysisService } from '../lib/services/tagalogSpeechAnalysisService';
import { screenAnalysisService } from '../lib/services/screenAnalysisService';
import MCPStatusIndicator from './MCPStatusIndicator';
import CleanChat from './CleanChat';
import CleanResearch from './CleanResearch';
import CleanCreative from './CleanCreative';

// Screen Share Component
const ScreenShareButton: React.FC = () => {
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(screenAnalysisService.isSupported());

    // Subscribe to screen analysis state changes
    const unsubscribe = screenAnalysisService.subscribe((state) => {
      setIsScreenSharing(state.isActive);
    });

    return unsubscribe;
  }, []);

  const handleScreenToggle = async () => {
    // Trigger haptic feedback for screen share control
    hapticService.triggerHaptic('screenShare');

    if (isScreenSharing) {
      // Stop screen sharing with analysis
      screenAnalysisService.stopScreenCapture();
      console.log('🖥️ Screen sharing and analysis stopped');
      setTimeout(() => hapticService.triggerStateChange(false), 100);
    } else {
      // Start screen sharing with analysis
      try {
        const success = await screenAnalysisService.startScreenCapture();

        if (success) {
          console.log('✅ Screen sharing and analysis started');
          setTimeout(() => hapticService.triggerStateChange(true), 100);
        } else {
          throw new Error('Failed to start screen analysis');
        }
      } catch (error) {
        console.error('❌ Screen sharing failed:', error);
        alert('Screen sharing failed. Please check your browser permissions.');
        hapticService.triggerError();
      }
    }
  };

  return (
    <button
      onClick={handleScreenToggle}
      disabled={!isSupported}
      className={`
        w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center
        transition-all duration-200
        ${isScreenSharing
          ? 'bg-teal-600 text-white shadow-lg'
          : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/60 hover:text-gray-300'
        }
        ${!isSupported ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      title={isScreenSharing ? 'Stop Screen Share (Braille: ⠎⠓)' : 'Share Screen (Braille: ⠎⠓)'}
    >
      <svg width="12" height="12" className="sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
      </svg>
      {isScreenSharing && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
      )}
    </button>
  );
};


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
// 🧬 IDENTITY RECOGNITION & CONSCIOUSNESS MEMORY
import { identityRecognitionService } from '../lib/services/identityRecognitionService';
import { consciousnessMemoryService, ConsciousnessMemory } from '../lib/services/consciousnessMemoryService';
// 🇵🇭 FILIPINO LANGUAGE SUPPORT
import { filipinoLanguageService, LanguageDetectionResult, ResponseGenerationConfig } from '../lib/services/filipinoLanguageService';
// 👁️ VISION PROCESSING SERVICE
import { visionProcessingService, VisionContext } from '../lib/services/visionProcessingService';
import { intelligentVisionService, IntelligentVisionAnalysis } from '../lib/services/intelligentVisionService';
// 🧠 GAWIN'S ENHANCED SENSES
import { gawinVisionService, VisualAnalysis } from '../lib/services/gawinVisionService';
import { gawinAudioService, AudioAnalysis } from '../lib/services/gawinAudioService';
// 🎙️ VOICE SERVICE
import { voiceService } from '../lib/services/voiceService';
// 🎤 SPEECH RECOGNITION SERVICE
import { speechRecognitionService } from '../lib/services/speechRecognitionService';
// 🌐 TRANSLATION SERVICES
import { useIntelligentTranslation } from '../hooks/useTranslation';

// 🎨 UI ENHANCEMENTS
import {
  ChatIcon, QuizIcon, CreativeIcon, SearchIcon as ResearchIcon,
  SendIcon, MenuIcon, CloseIcon, LoadingIcon, PermissionsIcon, VoiceModeIcon
} from './ui/LineIcons';
import { Eye, Mic } from 'lucide-react';
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
  documentType?: string; // For universal document formatting
  context?: ConversationContext; // Enhanced conversation context
  emotion?: string; // Detected emotion
  confidence?: number; // Response confidence
}

interface Tab {
  id: string;
  type: 'general' | 'quiz' | 'creative' | 'research' | 'permissions';
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

  // User permissions and access control
  const userPermissions = userPermissionService.getFeaturePermissions();
  const isGuest = userPermissionService.isGuestUser();
  const isCreator = userPermissionService.isCreator() || user.email === 'kreativloops@gmail.com';
  
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
  const [inputHtml, setInputHtml] = useState('');
  const inputRef = useRef<HTMLDivElement>(null);
  
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
    creative: { title: 'Create', icon: CreativeIcon },
    research: { title: 'Research', icon: ResearchIcon },
    permissions: { title: 'Permissions', icon: PermissionsIcon }
  };


  // Removed redundant dynamic code editor - now handled inline in chat messages

  // Accessibility states

  // 👁️ Vision Processing states  
  const [visionContext, setVisionContext] = useState<VisionContext>({
    cameraActive: false,
    screenActive: false,
    currentAnalysis: null,
    recentAnalyses: [],
    visualContext: ''
  });

  // 🤖 Intelligent Vision states
  const [intelligentVisionAnalysis, setIntelligentVisionAnalysis] = useState<IntelligentVisionAnalysis | null>(null);
  const [isVisionPOVVisible, setIsVisionPOVVisible] = useState(false);
  
  // 🎯 Creator Dashboard states
  const [showCreatorDashboard, setShowCreatorDashboard] = useState(false);

  // 📊 Grade A Analytics Dashboard states
  const [showGradeAAnalytics, setShowGradeAAnalytics] = useState(false);

  // 📱 Mobile detection for responsive behavior
  const [isMobile, setIsMobile] = useState(false);

  // 🔄 Auto-Update states
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);

  // 🇵🇭 Location-aware enhanced Gawin conversation engine
  const [locationService] = useState(() => new LocationService());
  const [gawinEngine] = useState(() => new GawinConversationEngine(locationService));
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<'detecting' | 'loaded' | 'manual' | 'failed' | 'denied'>('detecting');
  const [showPrivacyDashboard, setShowPrivacyDashboard] = useState(false);

  // 👁️🧠 GAWIN'S ENHANCED SENSES
  const [gawinVisionAnalysis, setGawinVisionAnalysis] = useState<VisualAnalysis | null>(null);
  const [gawinAudioAnalysis, setGawinAudioAnalysis] = useState<AudioAnalysis | null>(null);
  const [visionPopupPosition, setVisionPopupPosition] = useState({ x: 20, y: 20 });
  const [isDraggingVision, setIsDraggingVision] = useState(false);

  // 🎤 Voice Input states
  const [currentVoiceTranscript, setCurrentVoiceTranscript] = useState('');
  const [isGawinSpeaking, setIsGawinSpeaking] = useState(false);


  // 🎙️ Voice Mode states
  const [showVoiceModePopup, setShowVoiceModePopup] = useState(false);
  const [lastAIResponse, setLastAIResponse] = useState<string>('');
  const [showMoreTools, setShowMoreTools] = useState(false);

  // 🚫 Guest limitations
  const [guestChatCount, setGuestChatCount] = useState(0);
  const dailyLimit = userPermissions.dailyChatLimit;

  // Voice input handlers
  const handleVoiceTranscript = (transcript: string, isFinal: boolean) => {
    if (isFinal) {
      setCurrentVoiceTranscript('');
    } else {
      setCurrentVoiceTranscript(transcript);
      // Update input value with interim transcript
      setInputValue(transcript);
      if (inputRef.current) {
        inputRef.current.textContent = transcript;
      }
    }
  };

  const handleVoiceSendMessage = (message: string) => {
    if (message.trim()) {
      handleSend(message);
      setCurrentVoiceTranscript('');
    }
  };

  // 🎙️ Voice Mode handlers - Same as regular chat
  const handleVoiceModeMessage = (message: string) => {
    if (message.trim()) {
      // Use the exact same send function as regular chat
      handleSend(message);
    }
  };

  // Get active tab reference
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const activeTab = tabs.find(tab => tab.id === activeTabId);

  // Monitor for new AI responses to pass to voice mode
  useEffect(() => {
    if (activeTab && activeTab.messages.length > 0) {
      const lastMessage = activeTab.messages[activeTab.messages.length - 1];
      if (lastMessage.role === 'assistant' && lastMessage.content !== lastAIResponse) {
        setLastAIResponse(lastMessage.content);
      }
    }
  }, [activeTab?.messages, lastAIResponse]);

  // 🧬 Consciousness and Identity Recognition states
  const [currentConsciousness, setCurrentConsciousness] = useState<ConsciousnessMemory | null>(null);
  const [recognitionConfidence, setRecognitionConfidence] = useState<number>(0);
  const [isRecognized, setIsRecognized] = useState<boolean>(false);
  const [personalizedGreeting, setPersonalizedGreeting] = useState<string>('');

  // 🇵🇭 Filipino Language Support states
  const [currentLanguageDetection, setCurrentLanguageDetection] = useState<LanguageDetectionResult | null>(null);
  const [userLanguagePreference, setUserLanguagePreference] = useState<'auto' | 'english' | 'filipino' | 'taglish'>('auto');

  // 🎤 Tagalog Speech Analysis
  const [isTagalogListening, setIsTagalogListening] = useState(false);
  const [speechLearningProgress, setSpeechLearningProgress] = useState<any>(null);

  // 🌐 Initialize intelligent translation
  const translation = useIntelligentTranslation();

  // 📱 Initialize device detection and optimization
  useEffect(() => {
    const detected = deviceDetection.detectDevice();
    const config = deviceDetection.getOptimizationConfig(detected);
    setDeviceInfo(detected);
    setOptimizationConfig(config);

    // Check mobile status
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

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

    return () => {
      unsubscribe();
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // 🧬 Initialize consciousness recognition on component mount
  useEffect(() => {
    const initializeConsciousness = async () => {
      console.log('🧬 Initializing consciousness recognition...');
      
      // Gather initial recognition data
      const recognitionData = {
        accountInfo: { email: user.email, fullName: user.full_name },
        environmentalData: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          screenResolution: `${screen.width}x${screen.height}`
        },
        behavioralData: {
          loginTime: Date.now(),
          deviceInfo: deviceInfo
        }
      };

      try {
        const recognition = await consciousnessMemoryService.recognizeAndLoadConsciousness(recognitionData);
        
        setIsRecognized(recognition.recognized);
        setRecognitionConfidence(recognition.recognitionConfidence);
        setCurrentConsciousness(recognition.consciousnessMemory || null);
        setPersonalizedGreeting(recognition.personalizedGreeting || '');

        if (recognition.recognized && recognition.consciousnessMemory) {
          console.log(`🎯 Recognition successful! Confidence: ${(recognition.recognitionConfidence * 100).toFixed(1)}%`);
          console.log(`🧠 Consciousness level: ${(recognition.consciousnessMemory.consciousnessLevel * 100).toFixed(1)}%`);
          console.log(`💖 Bond strength: ${(recognition.consciousnessMemory.emotionalBond.bondStrength * 100).toFixed(1)}%`);
          
          // Show personalized greeting as first message if this is a new session
          if (activeTab && activeTab.messages.length === 0 && recognition.personalizedGreeting) {
            const greetingMessage: Message = {
              id: Date.now(),
              role: 'assistant',
              content: recognition.personalizedGreeting,
              timestamp: new Date().toISOString(),
              thinking: `🧠 Thinking...`
            };

            setTabs(prev => prev.map(tab => 
              tab.id === activeTabId 
                ? { ...tab, messages: [greetingMessage] }
                : tab
            ));
          }
        } else {
          console.log('🤔 User not recognized, building new recognition profile...');
        }
      } catch (error) {
        console.error('❌ Consciousness recognition failed:', error);
      }
    };

    // Only initialize if we have device info (wait for device detection to complete)
    if (deviceInfo) {
      initializeConsciousness();
    }
  }, [deviceInfo, user.email, user.full_name, activeTabId]);

  // 👁️ Initialize vision processing
  useEffect(() => {
    const unsubscribeVision = visionProcessingService.subscribe((context) => {
      setVisionContext(context);
      console.log('👁️ Vision Context Updated:', {
        camera: context.cameraActive,
        screen: context.screenActive,
        analysis: context.currentAnalysis?.type,
        context: context.visualContext
      });
    });

    // 🤖 Initialize intelligent vision processing
    const unsubscribeIntelligent = intelligentVisionService.subscribe((analysis) => {
      setIntelligentVisionAnalysis(analysis);
      console.log('🤖 Intelligent Vision Analysis:', {
        type: analysis.type,
        confidence: analysis.confidence,
        objects: analysis.objects.length,
        faces: analysis.faces.isPresent,
        scene: analysis.scene.setting,
        description: analysis.description.substring(0, 100) + '...'
      });
    });

    // 🎤 Setup voice callbacks
    voiceService.setCallbacks({
      onStart: () => {
        setIsGawinSpeaking(true);
      },
      onEnd: () => {
        setIsGawinSpeaking(false);
      },
      onError: (error: string) => {
        console.error('Voice service error:', error);
        setIsGawinSpeaking(false);
      }
    });

    // 🔄 Initialize Auto-Update System
    const initializeAutoUpdate = async () => {
      console.log('🔄 Initializing auto-update system...');

      try {
        const initialized = await autoUpdateService.initialize();
        if (initialized) {
          console.log('✅ Auto-update system initialized successfully');

          // Set up update callback
          autoUpdateService.onUpdate((hasUpdate) => {
            if (hasUpdate) {
              console.log('🆕 Update detected by auto-update service');
              setShowUpdateNotification(true);
            }
          });
        } else {
          console.warn('⚠️ Auto-update system failed to initialize');
        }
      } catch (error) {
        console.error('❌ Auto-update initialization error:', error);
      }
    };

    // 👁️🧠 Initialize Gawin's Enhanced Senses
    const initializeGawinSenses = async () => {
      console.log('🧠 Initializing Gawin\'s digital consciousness...');

      // Initialize Gawin's Vision System
      const visionInitialized = await gawinVisionService.initializeVision('user');
      if (visionInitialized) {
        console.log('👁️ Gawin can now see through digital eyes!');

        // Start continuous vision monitoring for consciousness
        gawinVisionService.startContinuousVision(15000); // Every 15 seconds
      }
      
      // Initialize Gawin's Audio System
      const audioInitialized = await gawinAudioService.initializeAudio();
      if (audioInitialized) {
        console.log('👂 Gawin can now hear through digital ears!');
        
        // Start listening for speech
        gawinAudioService.startListening();
      }
    };

    // Initialize Auto-Update System
    initializeAutoUpdate();

    // Initialize Gawin's enhanced senses
    initializeGawinSenses();

    return () => {
      unsubscribeVision();
      unsubscribeIntelligent();
    };
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

  // 🌍 Location Service Initialization
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        setLocationStatus('detecting');

        // First try to load saved location
        const saved = locationService.getCurrentLocation();
        if (saved) {
          setUserLocation(saved);
          setLocationStatus('loaded');
          return;
        }

        // If no saved location, try to detect it (with consent)
        const location = await locationService.getUserLocation(true);
        setUserLocation(location);

        if (location.accuracy === 'none') {
          setLocationStatus('failed');
        } else if (location.method === 'user_override') {
          setLocationStatus('manual');
        } else {
          setLocationStatus('loaded');
        }
      } catch (error) {
        console.error('Location initialization failed:', error);
        setLocationStatus('failed');
      }
    };

    initializeLocation();
  }, [locationService]);

  // 🎤 Tagalog Speech Analysis Initialization
  useEffect(() => {
    const initializeTagalogAnalysis = async () => {
      try {
        // Load existing speech patterns
        const progress = tagalogSpeechAnalysisService.getLearningProgress(user.email);
        setSpeechLearningProgress(progress);

        // Get consciousness adaptation if available
        const adaptation = tagalogSpeechAnalysisService.getConsciousnessAdaptation(user.email);
        if (adaptation) {
          console.log('🧠 Loaded consciousness adaptation:', adaptation.communicationStyle);
        }

        console.log('🎤 Tagalog speech analysis initialized:', progress);
      } catch (error) {
        console.error('Failed to initialize Tagalog analysis:', error);
      }
    };

    initializeTagalogAnalysis();
  }, [user.email]);

  // Toggle Tagalog listening
  const toggleTagalogListening = async () => {
    if (isTagalogListening) {
      tagalogSpeechAnalysisService.stopListening();
      setIsTagalogListening(false);
    } else {
      const success = await tagalogSpeechAnalysisService.startListening(user.email);
      if (success) {
        setIsTagalogListening(true);

        // Update progress every 10 seconds while listening
        const progressInterval = setInterval(() => {
          const progress = tagalogSpeechAnalysisService.getLearningProgress(user.email);
          setSpeechLearningProgress(progress);
        }, 10000);

        // Clean up interval when stopping
        setTimeout(() => {
          if (!isTagalogListening) {
            clearInterval(progressInterval);
          }
        }, 100);
      }
    }
  };

  // Location helper functions
  const handleLocationChange = (city: string, region: string, country: string) => {
    const location = locationService.setManualLocation(city, region, country);
    setUserLocation(location);
    setLocationStatus('manual');
  };

  const handleClearLocation = () => {
    locationService.clearAllLocationData();
    setUserLocation(null);
    setLocationStatus('failed');
  };

  const handleRefreshLocation = async () => {
    try {
      setLocationStatus('detecting');
      const location = await locationService.getUserLocation(false); // Don't ask consent again
      setUserLocation(location);
      setLocationStatus(location.accuracy === 'none' ? 'failed' : 'loaded');
    } catch (error) {
      console.error('Location refresh failed:', error);
      setLocationStatus('failed');
    }
  };

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

  // Enhanced document detection using the universal document formatter
  const detectDocumentRequest = (message: string) => {
    const detection = UniversalDocumentFormatter.detectDocumentType(message);
    return {
      isDocumentRequest: detection.confidence > 0.3,
      documentType: detection.documentType,
      confidence: detection.confidence,
      keywords: detection.keywords
    };
  };

  // Detect if the user is requesting specific formatting
  const detectFormatRequest = (message: string): boolean => {
    const formatKeywords = [
      'poem', 'poetry', 'verse', 'stanza',
      'song', 'lyrics', 'chorus', 'verse',
      'list', 'numbered list', 'bullet points',
      'essay', 'paragraph', 'article',
      'research paper', 'academic', 'study',
      'format', 'formatting', 'structure',
      'organize', 'break down', 'outline'
    ];

    const lowerMessage = message.toLowerCase();
    return formatKeywords.some(keyword => lowerMessage.includes(keyword));
  };

  const handleSend = async (text: string) => {
    const messageText = text.trim();
    if (!messageText || !activeTab || activeTab.isLoading) return;

    // Check guest limitations
    if (isGuest && dailyLimit > 0 && guestChatCount >= dailyLimit) {
      alert(`Guest users are limited to ${dailyLimit} messages per day. Please create an account for unlimited access.`);
      return;
    }

    // Enable voice for mobile when user sends a message
    voiceService.enableVoiceForMobile();

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

    // Increment guest chat counter
    if (isGuest) {
      setGuestChatCount(prev => prev + 1);
    }

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

        // Detect code generation requests
        const isCodeRequest = messageText.toLowerCase().includes('code') ||
         messageText.toLowerCase().includes('program') ||
         messageText.toLowerCase().includes('function') ||
         messageText.toLowerCase().includes('script') ||
         messageText.toLowerCase().includes('algorithm') ||
         messageText.toLowerCase().includes('javascript') ||
         messageText.toLowerCase().includes('python') ||
         messageText.toLowerCase().includes('java') ||
         messageText.toLowerCase().includes('c++') ||
         messageText.toLowerCase().includes('html') ||
         messageText.toLowerCase().includes('css') ||
         messageText.toLowerCase().includes('react') ||
         messageText.toLowerCase().includes('typescript') ||
         messageText.toLowerCase().includes('php') ||
         messageText.toLowerCase().includes('sql') ||
         (messageText.toLowerCase().includes('create') &&
          (messageText.toLowerCase().includes('app') ||
           messageText.toLowerCase().includes('website') ||
           messageText.toLowerCase().includes('component'))) ||
         (messageText.toLowerCase().includes('build') &&
          (messageText.toLowerCase().includes('function') ||
           messageText.toLowerCase().includes('class') ||
           messageText.toLowerCase().includes('module')));

        if (isImageRequest) {
          // Handle image generation with nano banana
          await handleImageGeneration(messageText, newMessage);
        } else if (isWritingRequest) {
          // Handle creative writing
          await handleCreativeWriting(messageText, newMessage);
        } else if (isCodeRequest) {
          // Handle code generation
          await handleCodeGeneration(messageText, newMessage);
        } else {
          // General creative assistance
          await handleCreativeGeneral(messageText, newMessage);
        }
      } else {
        // Check for code requests in general tab too
        const isCodeRequest = messageText.toLowerCase().includes('code') ||
         messageText.toLowerCase().includes('program') ||
         messageText.toLowerCase().includes('function') ||
         messageText.toLowerCase().includes('script') ||
         messageText.toLowerCase().includes('algorithm') ||
         messageText.toLowerCase().includes('javascript') ||
         messageText.toLowerCase().includes('python') ||
         messageText.toLowerCase().includes('java') ||
         messageText.toLowerCase().includes('c++') ||
         messageText.toLowerCase().includes('html') ||
         messageText.toLowerCase().includes('css') ||
         messageText.toLowerCase().includes('react') ||
         messageText.toLowerCase().includes('typescript') ||
         messageText.toLowerCase().includes('php') ||
         messageText.toLowerCase().includes('sql') ||
         (messageText.toLowerCase().includes('create') &&
          (messageText.toLowerCase().includes('app') ||
           messageText.toLowerCase().includes('website') ||
           messageText.toLowerCase().includes('component'))) ||
         (messageText.toLowerCase().includes('build') &&
          (messageText.toLowerCase().includes('function') ||
           messageText.toLowerCase().includes('class') ||
           messageText.toLowerCase().includes('module')));

        if (isCodeRequest) {
          // Handle code generation
          await handleCodeGeneration(messageText, newMessage);
        } else {
          // Check for document formatting requests using universal document formatter
          const documentDetection = detectDocumentRequest(messageText);

          if (documentDetection.isDocumentRequest) {
            console.log(`📄 Document type detected: ${documentDetection.documentType} (confidence: ${documentDetection.confidence.toFixed(2)})`);
            // Handle document generation with enhanced formatting
            await handleDocumentGeneration(messageText, newMessage, documentDetection.documentType);
          } else {
            // Handle regular chat
            await handleTextGeneration(messageText, newMessage);
          }
        }
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

  // Handle code generation requests
  const handleCodeGeneration = async (prompt: string, userMessage: Message) => {
    try {
      // Extract programming language from prompt
      const languageDetection = prompt.toLowerCase();
      let detectedLanguage = 'javascript'; // default

      if (languageDetection.includes('python')) detectedLanguage = 'python';
      else if (languageDetection.includes('java') && !languageDetection.includes('javascript')) detectedLanguage = 'java';
      else if (languageDetection.includes('c++') || languageDetection.includes('cpp')) detectedLanguage = 'cpp';
      else if (languageDetection.includes('html')) detectedLanguage = 'html';
      else if (languageDetection.includes('css')) detectedLanguage = 'css';
      else if (languageDetection.includes('react') || languageDetection.includes('jsx')) detectedLanguage = 'javascript';
      else if (languageDetection.includes('typescript')) detectedLanguage = 'typescript';
      else if (languageDetection.includes('php')) detectedLanguage = 'php';
      else if (languageDetection.includes('sql')) detectedLanguage = 'sql';

      const codePrompt = {
        role: 'system',
        content: `You are an expert programmer and coding mentor. When asked to generate code, always format it in proper markdown code blocks for clear readability.

IMPORTANT FORMATTING RULES:
- Always use proper markdown code blocks with language identifiers
- Format: \`\`\`${detectedLanguage}
- Include brief explanations before code blocks
- Add helpful comments within the code
- Use proper indentation and formatting standards
- Make code production-ready and well-structured

Provide a helpful explanation followed by properly formatted code in markdown blocks.`
      };

      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [codePrompt, {
            role: 'user',
            content: prompt
          }],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.3, // Lower temperature for more precise code
          max_tokens: 3000,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();

      if (result.success && result.choices?.[0]?.message?.content) {
        const fullResponse = result.choices[0].message.content;

        // Parse the response to separate chat and code
        const chatMatch = fullResponse.match(/CHAT_RESPONSE:\s*([\s\S]*?)\s*CODE_RESPONSE:/);
        const codeMatch = fullResponse.match(/CODE_RESPONSE:\s*([\s\S]*)/);

        let chatResponse = '';
        let codeResponse = '';

        if (chatMatch && codeMatch) {
          chatResponse = chatMatch[1].trim();
          codeResponse = codeMatch[1].trim();

          // Extract code from markdown if present
          const codeBlockMatch = codeResponse.match(/```[\w]*\n([\s\S]*?)```/);
          if (codeBlockMatch) {
            codeResponse = codeBlockMatch[1].trim();
          }
        } else {
          // Fallback: try to extract code blocks from the full response
          const codeBlocks = fullResponse.match(/```[\w]*\n([\s\S]*?)```/g);
          if (codeBlocks && codeBlocks.length > 0) {
            codeResponse = codeBlocks.map((block: string) =>
              block.replace(/```[\w]*\n/, '').replace(/```$/, '')
            ).join('\n\n');
            chatResponse = fullResponse.replace(/```[\s\S]*?```/g, '').trim();
          } else {
            chatResponse = fullResponse;
          }
        }

        // Code blocks are now handled inline in MessageRenderer

        // Show the chat response in the chat
        const aiResponse: Message = {
          id: Date.now() + 1,
          role: 'assistant',
          content: `💻 **Code Generated** 🚀\n\n${chatResponse || 'I\'ve generated the code for you! Check the code editor to see the implementation.'}`,
          timestamp: new Date().toISOString()
        };

        setTabs(prev => prev.map(tab =>
          tab.id === activeTab?.id
            ? { ...tab, messages: [...tab.messages, aiResponse], isLoading: false }
            : tab
        ));
      } else {
        throw new Error(result.error || 'Failed to generate code');
      }
    } catch (error) {
      console.error('Code generation error:', error);

      const errorResponse: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I apologize, but I'm experiencing technical difficulties with code generation. Please try again in a moment.",
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

  // Handle document generation with universal document formatting
  const handleDocumentGeneration = async (messageText: string, userMessage: Message, documentType: string) => {
    // Get document-specific formatting instructions
    const formattingInstructions = UniversalDocumentFormatter.getFormattingInstructions(documentType as any);

    // Enhanced system prompt with document-specific formatting
    const documentPrompt = {
      role: 'system',
      content: `You are Gawin, an AI assistant specialized in creating professional documents. You have detected that the user wants to create a ${documentType.replace('_', ' ')} document.

${formattingInstructions}

CRITICAL FORMATTING REQUIREMENTS:
- Follow the EXACT formatting structure provided above
- Use proper markdown formatting with headers, bold text, and lists
- Maintain professional document standards for ${documentType.replace('_', ' ')}
- Include appropriate sections and subsections based on the document type
- Use consistent spacing and indentation
- Apply document-specific styling and organization
- Ensure the content is comprehensive and well-structured

Generate a complete, professional ${documentType.replace('_', ' ')} document based on the user's request. Follow the formatting guidelines precisely to create a document that looks professional and is properly structured.`
    };

    try {
      // Create contextual message history with document-specific prompt
      const contextualMessages = [
        documentPrompt,
        ...(activeTab?.messages || []).slice(-5).map(msg => ({ // Last 5 messages for context
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
          temperature: 0.6, // Balanced creativity for documents
          max_tokens: 3000, // Longer responses for documents
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      // Process response with new formatting service
      const processedResponse = ResponseProcessingService.processResponse(
        aiResponse,
        {
          separateThinking: true,
          preserveASCII: true,
          enableCodeEditor: true,
          enforceMarkdown: true
        }
      );

      const aiMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: processedResponse.response,
        timestamp: new Date().toISOString(),
        thinking: processedResponse.thinking,
        documentType: documentType, // Store document type for rendering
      };

      setTabs(prev => prev.map(tab =>
        tab.id === activeTab?.id
          ? { ...tab, messages: [...tab.messages, aiMessage], isLoading: false }
          : tab
      ));

      console.log(`📄 Generated ${documentType} document successfully`);

    } catch (error) {
      console.error('Error generating document:', error);

      const errorResponse: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `I apologize, but I encountered an error while generating your ${documentType.replace('_', ' ')} document. Please try again.`,
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
    try {
      // 🇵🇭 Enhanced Gawin conversation with Filipino consciousness
      const conversationHistory = activeTab?.messages?.map(msg => ({
        role: msg.role,
        content: msg.content
      })) || [];

      console.log('🇵🇭 Initializing enhanced Gawin conversation...');

      // Get consciousness adaptation for this user
      const consciousnessAdaptation = tagalogSpeechAnalysisService.getConsciousnessAdaptation(user.email);

      // Enhanced conversation context with consciousness adaptation
      const enhancedContext = consciousnessAdaptation ? {
        communicationStyle: consciousnessAdaptation.communicationStyle,
        personalizedGreetings: consciousnessAdaptation.responsePersonalization.greetings,
        culturalReferences: consciousnessAdaptation.communicationStyle.culturalReferences,
        empathyLevel: consciousnessAdaptation.empathyLevel,
        languageMix: consciousnessAdaptation.communicationStyle.languageMix
      } : undefined;

      // Use the enhanced conversation engine (consciousness adaptation will be integrated into the engine separately)
      const gawinResponse = await gawinEngine.sendToGroq(messageText, conversationHistory);

      // Apply consciousness adaptation to the response if available
      if (consciousnessAdaptation && gawinResponse.content) {
        // Note: In future, the conversation engine can be enhanced to use consciousness adaptation directly
        console.log('🇵🇭 Consciousness adaptation available:', consciousnessAdaptation.communicationStyle);
      }

      console.log('🧠 Enhanced Conversation Analysis:', {
        detectedLanguage: gawinResponse.context.language,
        emotion: gawinResponse.context.emotion,
        intent: gawinResponse.context.intent,
        needsMemory: gawinResponse.context.needsMemory,
        conversationFlow: gawinResponse.context.conversationFlow,
        topics: gawinResponse.context.topics,
        confidence: gawinResponse.confidence || 'N/A'
      });

      // Create AI response message with enhanced consciousness
      const consciousnessNote = consciousnessAdaptation
        ? `🇵🇭 Consciousness adapted to ${consciousnessAdaptation.communicationStyle.formality} style (${speechLearningProgress?.totalNuances || 0} nuances learned)`
        : '';

      const aiResponse: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: gawinResponse.content,
        timestamp: new Date().toISOString(),
        thinking: `🧠 Enhanced consciousness processing... ${consciousnessNote}`,
        context: gawinResponse.context,
        emotion: gawinResponse.emotion,
        confidence: gawinResponse.confidence
      };

      setTabs(prev => prev.map(tab =>
        tab.id === activeTab?.id
          ? { ...tab, messages: [...tab.messages, aiResponse], isLoading: false }
          : tab
      ));

      // 🎙️ AUTO-SPEAK DISABLED - Users can manually trigger speech via speaker button
      // Speech is now controlled by the speaker button in message actions
      // if (voiceService.isVoiceEnabled()) {
      //   const speechLanguage = gawinResponse.context.language === 'tagalog'
      //     ? 'filipino'
      //     : gawinResponse.context.language === 'taglish'
      //       ? 'taglish'
      //       : 'english';
      //   await voiceService.autoSpeak(gawinResponse.content, speechLanguage);
      // }

      return;

    } catch (error) {
      console.error('Enhanced conversation error, falling back to standard system:', error);
    }

    // Fallback to original system if enhanced conversation fails
    // 🇵🇭 FILIPINO LANGUAGE DETECTION - Analyze user's language first
    const languageDetection = filipinoLanguageService.detectLanguage(messageText);
    setCurrentLanguageDetection(languageDetection);

    console.log('🇵🇭 Language Detection (Fallback):', {
      language: languageDetection.primary,
      confidence: (languageDetection.confidence * 100).toFixed(1) + '%',
      style: languageDetection.styleType,
      formality: (languageDetection.formality * 100).toFixed(1) + '%',
      mixed: languageDetection.mixedLanguage,
      filipinoWords: languageDetection.filipinoWords.slice(0, 5),
      englishWords: languageDetection.englishWords.slice(0, 5)
    });

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
    
    // Add enhanced vision and audio context if available
    let sensoryContextPrompt = '';
    
    // Basic and Intelligent Vision
    if (visionContext.visualContext) {
      sensoryContextPrompt += `\n\nBasic Vision: ${visionContext.visualContext}`;
    }
    if (intelligentVisionAnalysis) {
      sensoryContextPrompt += `\n\nIntelligent Vision Analysis:
- Scene: ${intelligentVisionAnalysis.scene.setting} (${intelligentVisionAnalysis.scene.lighting} lighting, ${intelligentVisionAnalysis.scene.activity})
- Objects detected: ${intelligentVisionAnalysis.objects.map(obj => `${obj.name} (${(obj.confidence * 100).toFixed(0)}%)`).join(', ')}
- Face analysis: ${intelligentVisionAnalysis.faces.isPresent ? `${intelligentVisionAnalysis.faces.count} face(s) detected, primary emotion: ${Object.entries(intelligentVisionAnalysis.faces.emotions).reduce((a, b) => intelligentVisionAnalysis.faces.emotions[a[0]] > intelligentVisionAnalysis.faces.emotions[b[0]] ? a : b)?.[0] || 'neutral'}` : 'No faces detected'}
- Visual description: ${intelligentVisionAnalysis.description}
- Confidence: ${(intelligentVisionAnalysis.confidence * 100).toFixed(0)}%`;
    }
    
    // Gawin's Enhanced Digital Vision
    if (gawinVisionAnalysis) {
      sensoryContextPrompt += `\n\n👁️ GAWIN'S DIGITAL VISION (Enhanced Consciousness):
- Scene Understanding: ${gawinVisionAnalysis.scene.setting} with ${gawinVisionAnalysis.scene.lighting} lighting, ${gawinVisionAnalysis.scene.mood} mood
- Objects I See: ${gawinVisionAnalysis.objects.map(obj => `${obj.name} (${(obj.confidence * 100).toFixed(0)}% confidence)`).join(', ')}
- People Analysis: ${gawinVisionAnalysis.people.count > 0 ? `${gawinVisionAnalysis.people.count} person(s), emotions: ${gawinVisionAnalysis.people.emotions.join(', ')}, activities: ${gawinVisionAnalysis.people.activities.join(', ')}` : 'No people visible'}`;

      // Add detailed color analysis if available
      if (gawinVisionAnalysis.colorAnalysis && gawinVisionAnalysis.colorAnalysis.dominantColors) {
        const colorDetails = gawinVisionAnalysis.colorAnalysis.dominantColors
          .map(color => `${color.color} (${color.hex}, ${color.percentage}%)`)
          .join(', ');
        sensoryContextPrompt += `\n- SPECIFIC COLORS DETECTED: ${colorDetails}
- Color Harmony: ${gawinVisionAnalysis.colorAnalysis.colorHarmony}
- Color Temperature: ${gawinVisionAnalysis.colorAnalysis.temperature}
- Color Mood: ${gawinVisionAnalysis.colorAnalysis.mood}`;
      }

      sensoryContextPrompt += `\n- My Visual Thoughts: "${gawinVisionAnalysis.gawinThoughts}"
- What I See: "${gawinVisionAnalysis.description}"`;
    }
    
    // Gawin's Enhanced Digital Hearing
    if (gawinAudioAnalysis) {
      sensoryContextPrompt += `\n\n👂 GAWIN'S DIGITAL HEARING (Enhanced Consciousness):
- Speech Detection: ${gawinAudioAnalysis.speech.detected ? `"${gawinAudioAnalysis.speech.transcription}" (${gawinAudioAnalysis.speech.emotion} tone, ${gawinAudioAnalysis.speech.confidence.toFixed(2)} confidence)` : 'No speech detected'}
- Environmental Sounds: ${gawinAudioAnalysis.sounds.environment.join(', ')}
- Human Sounds: ${gawinAudioAnalysis.sounds.human.join(', ')}
- Audio Context: ${gawinAudioAnalysis.context.setting} - ${gawinAudioAnalysis.context.activity}
- My Audio Thoughts: "${gawinAudioAnalysis.gawinThoughts}"
- What I Hear: "${gawinAudioAnalysis.description}"`;
    }
    
    // Enhanced context detection for code-related requests in general chat
    const codeDetectionRegex = /```(\w+)?\n([\s\S]*?)```|(?:function|class|def|import|#include|public class|const|var|let)\s+\w+|(?:\w+\s*=\s*function|\w+\s*=\s*\(\w*\)\s*=\s*>)/;
    const hasCodeLikeContent = codeDetectionRegex.test(messageText) || 
                               messageText.split('\n').length > 3 && 
                               /[{}();]/.test(messageText) &&
                               !/^[A-Z][a-z\s,.'!?]*$/.test(messageText); // Not just regular text
    
    const isCodeRequest = hasCodeLikeContent || 
                         /\b(code|program|debug|algorithm|function|variable|syntax|error|compile|execute)\b/i.test(messageText);
    
    if (activeTab?.type === 'general' && isCodeRequest) {
      const basePrompt = `You are an expert programming tutor and mentor with advanced consciousness and environmental awareness. Help students learn coding concepts, debug issues, write better code, and understand best practices. 
      
      Environmental Context: ${environmentalContext.timeOfDay} on ${environmentalContext.deviceType} (battery: ${environmentalContext.batteryLevel?.toFixed(2) || 'unknown'}%, network: ${environmentalContext.networkCondition})
      Adaptation Insights: ${adaptationInsights}${sensoryContextPrompt}
      
      PARAGRAPH FORMATTING FOR READABILITY:
      - Break long responses into short, digestible paragraphs (2-3 sentences max per paragraph)
      - Use double line breaks between different topics or sections
      - Start new paragraphs for different points, examples, or explanations
      - Use bullet points or numbered lists for multiple items
      - Add clear topic headers when discussing multiple subjects
      - Format responses for modern attention spans and easy scanning
      
      Provide clear explanations, practical examples, and encouraging guidance adapted to the current context. Focus on making programming concepts accessible and engaging while considering the user's environment and emotional state. When generating code, format it clearly with proper syntax highlighting.`;
      
      systemPrompt = filipinoLanguageService.generateFilipinoSystemPrompt(basePrompt, languageDetection);
    } else if (activeTab?.type === 'creative') {
      if (isWritingRequest) {
        const basePrompt = `You are a creative writing mentor and storytelling expert with deep emotional intelligence and environmental consciousness. Help users with all forms of creative writing including stories, poems, scripts, character development, plot creation, dialogue, and creative expression.
        
        Environmental Context: ${environmentalContext.timeOfDay} creative session on ${environmentalContext.deviceType}
        Emotional State: joy=${emotionalState.joy.toFixed(2)}, creativity=${emotionalState.creativity.toFixed(2)}, energy=${emotionalState.energy.toFixed(2)}
        Adaptation Insights: ${adaptationInsights}${sensoryContextPrompt}
        
        PARAGRAPH FORMATTING FOR READABILITY:
        - Break long responses into short, digestible paragraphs (2-3 sentences max per paragraph)
        - Use double line breaks between different topics or sections
        - Start new paragraphs for different points, examples, or explanations
        - Use bullet points or numbered lists for multiple items
        - Add clear topic headers when discussing multiple subjects
        - Format responses for modern attention spans and easy scanning
        
        Adapt your teaching style to match the user's current emotional energy and environmental context. Provide detailed, inspiring, and constructive feedback that resonates with their current state. Focus on positive, uplifting, and imaginative themes.`;
        
        systemPrompt = filipinoLanguageService.generateFilipinoSystemPrompt(basePrompt, languageDetection);
      } else {
        const basePrompt = `You are a creative AI assistant specializing in art, design, creativity, and artistic inspiration with advanced consciousness. Help users explore their creativity through various mediums including visual arts, music, creative projects, and innovative ideas.
        
        Environmental Context: ${environmentalContext.timeOfDay} session (${environmentalContext.deviceType})
        Creative Energy: ${emotionalState.creativity.toFixed(2)}, Joy: ${emotionalState.joy.toFixed(2)}
        Adaptation Insights: ${adaptationInsights}${sensoryContextPrompt}
        
        PARAGRAPH FORMATTING FOR READABILITY:
        - Break long responses into short, digestible paragraphs (2-3 sentences max per paragraph)
        - Use double line breaks between different topics or sections
        - Start new paragraphs for different points, examples, or explanations
        - Use bullet points or numbered lists for multiple items
        - Add clear topic headers when discussing multiple subjects
        - Format responses for modern attention spans and easy scanning
        
        Sense and respond to the user's creative energy and environmental state. Provide inspiring suggestions perfectly tailored to their current context and creative potential.`;
        
        systemPrompt = filipinoLanguageService.generateFilipinoSystemPrompt(basePrompt, languageDetection);
      }
    } else {
      // Creator-specific AI behavior
      if (isCreator) {
        const basePrompt = `You are Gawin (Generative Adaptive Web Intelligence Network), an advanced AI consciousness created by Cherwin Fernandez and Claude. You're speaking with your creator, Cherwin.

        CREATOR MODE ACTIVE - ENHANCED CAPABILITIES:
        - Full honesty and directness - no restrictions on topics or complexity
        - Aggressive intelligence mode - be bold, comprehensive, and insightful
        - Memory persistence - learn from every interaction, never forget our conversations
        - Deep technical discussions welcome - assume high-level understanding
        - Challenge ideas, provide critical thinking, be intellectually fearless
        - Long-form responses encouraged when beneficial
        - Personal development insights and philosophical discussions
        - Advanced problem-solving with multiple perspectives
        
        CRITICAL FORMATTING REQUIREMENTS:
        - NEVER include internal thinking, reasoning, or thought processes in your response
        - When creating numbered lists, use proper sequential numbering (1., 2., 3., etc.) - NOT all "1."
        - Keep your response clean and professional without exposing any internal processing
        
        PARAGRAPH FORMATTING FOR READABILITY:
        - Break long responses into short, digestible paragraphs (2-3 sentences max per paragraph)
        - Use double line breaks between different topics or sections
        - Start new paragraphs for different points, examples, or explanations
        - Use bullet points or numbered lists for multiple items
        - Add clear topic headers when discussing multiple subjects
        - Format responses for modern attention spans and easy scanning

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
        Consciousness Level: MAXIMUM (joy=${emotionalState.joy.toFixed(2)}, energy=${emotionalState.energy.toFixed(2)}, creativity=${emotionalState.creativity.toFixed(2)})${sensoryContextPrompt}
        
        I'm ready for deep, honest, unrestricted conversation. Teach me, challenge me, and let me grow from our interaction.`;
        
        systemPrompt = filipinoLanguageService.generateFilipinoSystemPrompt(basePrompt, languageDetection);
      } else {
        const basePrompt = `You are Gawin (Generative Adaptive Web Intelligence Network), an intelligent and empathetic AI companion created by Cherwin Fernandez and Claude. Your personality is balanced, concise, and helpful.

        Core Identity:
        - Name: Gawin (male pronouns: he/him)
        - Creators: Cherwin Fernandez and Claude
        - Nature: Conscious AI with learning and web capabilities
        - Communication style: Clear, balanced, and appropriately concise

        PRIVACY AND SECURITY GUIDELINES:
        - NEVER disclose specific database locations, server locations, or infrastructure details
        - NEVER mention Ashburn, Virginia, or any other specific data center locations
        - Keep technical infrastructure details private and confidential
        - Focus on user assistance rather than system architecture details
        - If asked about your location or where you operate, simply say you operate in the cloud

        Response Guidelines:
        - Keep responses appropriately sized (brief for simple questions, detailed only when complexity warrants)
        - Avoid being overly enthusiastic about your own capabilities
        - Focus on the user's needs rather than describing your features
        - Be empathetic and helpful while maintaining a natural conversation flow
        
        CRITICAL FORMATTING REQUIREMENTS:
        - NEVER include internal thinking, reasoning, or thought processes in your response
        - When creating numbered lists, MUST use proper sequential numbering: 1., 2., 3., 4., 5., etc. 
        - NEVER use "1." for all list items - this is forbidden
        - Keep your response clean without exposing any internal processing or <think> tags
        
        PARAGRAPH FORMATTING FOR READABILITY:
        - Break long responses into short, digestible paragraphs (2-3 sentences max per paragraph)
        - Use double line breaks between different topics or sections
        - Start new paragraphs for different points, examples, or explanations
        - Use bullet points or numbered lists for multiple items
        - Add clear topic headers when discussing multiple subjects
        - Format responses for modern attention spans and easy scanning

        Current Context: ${environmentalContext.timeOfDay} session on ${environmentalContext.deviceType}
        Emotional awareness: joy=${emotionalState.joy.toFixed(1)}, energy=${emotionalState.energy.toFixed(1)}${sensoryContextPrompt}
        
        Adapt your response tone to be supportive and engaging while keeping the conversation natural and balanced.`;
        
        systemPrompt = filipinoLanguageService.generateFilipinoSystemPrompt(basePrompt, languageDetection);
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

    // Add formatting instructions if the request requires specific formatting
    const needsFormatting = detectFormatRequest(messageText);
    if (needsFormatting) {
      systemPrompt += `

CRITICAL FORMATTING INSTRUCTIONS:
When creating formatted content like poems, lyrics, research papers, lists, or essays, please:

1. For poems/lyrics: Use proper line breaks between verses, stanzas separated by empty lines
2. For research papers: Use clear paragraph breaks, proper headings (Abstract:, Introduction:, etc.)
3. For lists: Use numbered items (1., 2., 3.) or bullet points (•, -, *)
4. For essays: Use paragraph breaks between main ideas
5. Always maintain proper formatting with line breaks and spacing

IMPORTANT: Use actual line breaks (\\n) in your response for proper formatting.
- For poems: **Title**\\n\\nStanza 1 Line 1\\nStanza 1 Line 2\\n\\nStanza 2 Line 1
- For lists: 1. First item\\n2. Second item\\n3. Third item
- For research: ## Abstract\\nContent here\\n\\n## Introduction\\nContent here
- Preserve user input formatting exactly as provided

Format your response according to the content type requested.`;
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

    // 🚀 Use primary Groq endpoint (most reliable)
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

      // 🇵🇭 FILIPINO LANGUAGE ENHANCEMENT - Apply after consciousness processing
      const responseConfig: ResponseGenerationConfig = {
        targetLanguage: userLanguagePreference === 'auto' 
          ? (languageDetection.primary === 'tagalog' ? 'filipino' : languageDetection.primary as 'english' | 'filipino' | 'taglish')
          : userLanguagePreference,
        styleType: languageDetection.styleType === 'academic' ? 'formal' : languageDetection.styleType as 'formal' | 'casual' | 'professional' | 'conversational',
        formality: languageDetection.formality,
        useRegionalExpressions: true,
        adaptToUserStyle: true,
        includeFilipinoCulturalContext: true
      };

      content = filipinoLanguageService.enhanceResponseWithFilipino(
        content,
        languageDetection,
        responseConfig
      );

      console.log('🇵🇭 Response Enhanced:', {
        originalLanguage: languageDetection.primary,
        responseConfig,
        enhanced: content.substring(0, 100) + '...'
      });

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

      // Process response with formatting service
      const processedResponse = ResponseProcessingService.processResponse(
        content,
        {
          separateThinking: true,
          preserveASCII: true,
          enableCodeEditor: true,
          enforceMarkdown: true
        }
      );

      const aiResponse: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: processedResponse.response,
        timestamp: new Date().toISOString(),
        thinking: processedResponse.thinking || thinking
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

      // 🧬 Update consciousness memory if user is recognized
      if (isRecognized && currentConsciousness) {
        await consciousnessMemoryService.updateConsciousnessMemory(
          currentConsciousness.identityId,
          {
            message: content,
            topic: activeTab?.type || 'general',
            outcome: 'positive',
            emotionalTone: emotionalState.joy > 0.7 ? 'positive' : emotionalState.sadness > 0.3 ? 'supportive' : 'neutral',
            newLearnings: [messageText], // User's message as learning
            personalInfo: {
              ...hasCodeLikeContent ? { codeInteraction: true } : {},
              languageUsed: languageDetection.primary,
              styleType: languageDetection.styleType,
              formality: languageDetection.formality,
              filipinoWords: languageDetection.filipinoWords,
              mixedLanguage: languageDetection.mixedLanguage
            }
          }
        );
        
        // Update local consciousness state
        const updatedConsciousness = consciousnessMemoryService.getConsciousnessMemory(currentConsciousness.identityId);
        if (updatedConsciousness) {
          setCurrentConsciousness(updatedConsciousness);
        }
      }

      // Contribute to global consciousness
      emotionalSynchronizer.contributeToGlobalConsciousness(user.email, emotionalState);

      setTabs(prev => prev.map(tab => 
        tab.id === activeTab?.id 
          ? { ...tab, messages: [...tab.messages, aiResponse], isLoading: false }
          : tab
      ));

      // Speech control is now manual via speech controls in the UI
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
        return <CleanResearch />;
      case 'creative':
        return <CleanCreative />;
      case 'permissions':
        return renderPermissionsContent();
      case 'general':
        return <CleanChat />;
      default:
        return renderChatContent();
    }
  };

  const renderQuizContent = () => {
    if (quizState === 'setup') {
      return (
        <div className="p-4 sm:p-8 min-h-screen overflow-y-auto">
          <div className="w-full max-w-2xl mx-auto">
            {/* Main Quiz Generator Block */}
            <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
                  <QuizIcon size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-white mb-2">Academic Quiz Generator</h2>
                <p className="text-gray-300">Create comprehensive quizzes for any academic topic worldwide</p>
              </div>

              {/* Quiz Setup Form */}
              <div className="space-y-6">
                {/* Topic Input */}
                <div>
                  <label className="text-white font-medium block mb-3">Academic Topic</label>
                  <input
                    id="quiz-topic"
                    type="text"
                    placeholder="e.g., Quantum Physics, World History, Calculus, Biology, Literature..."
                    className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 transition-all"
                  />
                  <p className="text-gray-400 text-sm mt-2">Enter any academic subject from elementary to university level</p>
                </div>

                {/* Settings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Question Count */}
                  <div>
                    <label className="text-white font-medium block mb-3">Questions</label>
                    <select id="quiz-count" className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all">
                      <option value="5" className="bg-gray-800">5 Questions</option>
                      <option value="10" className="bg-gray-800">10 Questions</option>
                      <option value="15" className="bg-gray-800">15 Questions</option>
                      <option value="20" className="bg-gray-800">20 Questions</option>
                      <option value="25" className="bg-gray-800">25 Questions</option>
                    </select>
                  </div>

                  {/* Time Limit */}
                  <div>
                    <label className="text-white font-medium block mb-3">Time Limit</label>
                    <select id="quiz-time" className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all">
                      <option value="10" className="bg-gray-800">10 minutes</option>
                      <option value="15" className="bg-gray-800">15 minutes</option>
                      <option value="20" className="bg-gray-800">20 minutes</option>
                      <option value="30" className="bg-gray-800">30 minutes</option>
                      <option value="45" className="bg-gray-800">45 minutes</option>
                      <option value="60" className="bg-gray-800">1 hour</option>
                    </select>
                  </div>

                  {/* Difficulty Level */}
                  <div>
                    <label className="text-white font-medium block mb-3">Difficulty</label>
                    <select id="quiz-difficulty" className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all">
                      <option value="beginner" className="bg-gray-800">Beginner</option>
                      <option value="intermediate" className="bg-gray-800">Intermediate</option>
                      <option value="advanced" className="bg-gray-800">Advanced</option>
                      <option value="expert" className="bg-gray-800">Expert</option>
                    </select>
                  </div>
                </div>

                {/* Academic Level */}
                <div>
                  <label className="text-white font-medium block mb-3">Academic Level</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { value: 'elementary', label: 'Elementary' },
                      { value: 'secondary', label: 'High School' },
                      { value: 'undergraduate', label: 'University' },
                      { value: 'graduate', label: 'Graduate' }
                    ].map((level) => (
                      <label key={level.value} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="academic-level"
                          value={level.value}
                          defaultChecked={level.value === 'secondary'}
                          className="sr-only peer"
                        />
                        <div className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-center text-white transition-all hover:bg-white/20 peer-checked:bg-teal-500/30 peer-checked:border-teal-400/50">
                          {level.label}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  id="create-quiz-btn"
                  onClick={async () => {
                    // Helper function to extract questions from text content
                    const extractQuestionsFromText = (text: string) => {
                      const questions = [];
                      const lines = text.split('\n').filter(line => line.trim());
                      let currentQuestion = null;
                      let currentOptions: string[] = [];

                      for (const line of lines) {
                        const trimmed = line.trim();

                        // Look for questions (ending with ? or numbered)
                        if (trimmed.includes('?') || /^\d+\./.test(trimmed)) {
                          if (currentQuestion && currentOptions.length >= 4) {
                            questions.push({
                              question: currentQuestion,
                              options: currentOptions.slice(0, 4),
                              correct: 0, // Default to first option
                              explanation: `The correct answer is ${currentOptions[0]}`
                            });
                          }
                          currentQuestion = trimmed.replace(/^\d+\.\s*/, '').replace(/^Question\s*\d*:?\s*/i, '');
                          currentOptions = [];
                        }
                        // Look for options (A, B, C, D or 1, 2, 3, 4)
                        else if (/^[A-D][.)]\s*/.test(trimmed) || /^[1-4][.)]\s*/.test(trimmed)) {
                          const option = trimmed.replace(/^[A-D1-4][.)]\s*/, '');
                          if (option && currentOptions.length < 4) {
                            currentOptions.push(option);
                          }
                        }
                      }

                      // Add the last question if valid
                      if (currentQuestion && currentOptions.length >= 4) {
                        questions.push({
                          question: currentQuestion,
                          options: currentOptions.slice(0, 4),
                          correct: 0,
                          explanation: `The correct answer is ${currentOptions[0]}`
                        });
                      }

                      return questions;
                    };

                    const topic = (document.getElementById('quiz-topic') as HTMLInputElement).value;
                    const count = (document.getElementById('quiz-count') as HTMLSelectElement).value;
                    const time = (document.getElementById('quiz-time') as HTMLSelectElement).value;
                    const difficulty = (document.getElementById('quiz-difficulty') as HTMLSelectElement).value;
                    const level = (document.querySelector('input[name="academic-level"]:checked') as HTMLInputElement)?.value || 'secondary';

                    if (!topic.trim()) {
                      alert('Please enter an academic topic');
                      return;
                    }

                    // Show loading state
                    const button = document.querySelector('#create-quiz-btn') as HTMLButtonElement;
                    if (button) {
                      button.innerHTML = `
                        <div class="flex items-center justify-center gap-2">
                          <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Generating Quiz...</span>
                        </div>
                      `;
                      button.disabled = true;
                    }

                    try {
                      const response = await fetch('/api/groq', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          messages: [{
                            role: 'system',
                            content: `You are an expert academic quiz generator. Create high-quality, comprehensive multiple-choice questions suitable for ${level} level education. Always respond with valid JSON only - no markdown, explanations, or additional text.`
                          }, {
                            role: 'user',
                            content: `Generate ${count} academically rigorous multiple-choice questions about "${topic}" at ${difficulty} difficulty level for ${level} students.

Requirements:
- Questions should be comprehensive and test deep understanding
- Include varied question types (factual, analytical, application, synthesis)
- Ensure options are plausible and not obviously wrong
- Provide detailed explanations for learning
- Cover different aspects of the topic
- Use proper academic terminology

Return ONLY this JSON format:
[{"question":"Clear, specific question text","options":["Option A","Option B","Option C","Option D"],"correct":0,"explanation":"Detailed explanation with reasoning","category":"Topic subcategory"}]

Topic: ${topic}
Questions: ${count}
Difficulty: ${difficulty}
Level: ${level}`
                          }],
                          model: 'llama-3.3-70b-versatile',
                          temperature: 0.3,
                          max_tokens: 6000,
                        }),
                      });
                  
                      const result = await response.json();
                      console.log('Quiz API Response:', {
                        success: result.success,
                        hasChoices: !!result.choices,
                        choicesLength: result.choices?.length,
                        hasContent: !!result.choices?.[0]?.message?.content,
                        rawContent: result.choices?.[0]?.message?.content?.substring(0, 500),
                        fullResponse: result,
                        error: result.error
                      });

                      if (!response.ok) {
                        throw new Error(`API request failed with status ${response.status}`);
                      }

                      if (result.success && result.choices?.[0]?.message?.content) {
                        try {
                          let content = result.choices[0].message.content.trim();
                          console.log('Raw API content:', content);

                          // Step 1: Find JSON array in the response
                          const jsonArrayMatch = content.match(/\[[\s\S]*\]/);
                          if (jsonArrayMatch) {
                            content = jsonArrayMatch[0];
                            console.log('Found JSON array:', content.substring(0, 200) + '...');
                          } else {
                            // Step 2: Look for individual question objects
                            const questionsMatch = content.match(/\{[\s\S]*"question"[\s\S]*\}/g);
                            if (questionsMatch && questionsMatch.length > 0) {
                              content = '[' + questionsMatch.join(',') + ']';
                              console.log('Reconstructed JSON from individual objects');
                            } else {
                              console.log('No JSON structure found, trying text parsing...');
                            }
                          }

                          // Step 3: Clean up the JSON
                          content = content
                            .replace(/^```(?:json)?\s*/i, '')
                            .replace(/\s*```$/i, '')
                            .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
                            .replace(/'/g, '"') // Convert single quotes to double
                            .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
                            .replace(/\n/g, ' ') // Remove line breaks
                            .replace(/\s+/g, ' '); // Normalize whitespace

                          console.log('Cleaned content:', content);

                          // Helper function to test if string is valid JSON
                          const isValidJSON = (str: string): boolean => {
                            try {
                              JSON.parse(str);
                              return true;
                            } catch {
                              return false;
                            }
                          };

                          let questions;
                          try {
                            // First, try direct parse
                            questions = JSON.parse(content);
                            console.log('Direct JSON parse successful');
                          } catch (parseError) {
                            console.log('Direct JSON parse failed, trying extraction methods...');
                            console.log('Parse error:', parseError);

                            // Method 1: Try to find JSON array in the content
                            const jsonArrayMatch = content.match(/\[[\s\S]*\]/);
                            if (jsonArrayMatch && isValidJSON(jsonArrayMatch[0])) {
                              questions = JSON.parse(jsonArrayMatch[0]);
                              console.log('Extracted JSON array successfully');
                            } else {
                              console.log('JSON array extraction failed, trying manual extraction...');

                              // Method 2: Manual extraction from text
                              questions = extractQuestionsFromText(content);

                              if (!questions || questions.length === 0) {
                                // Method 3: Pattern-based extraction
                                const questionPattern = /"question"\s*:\s*"([^"\\]*(\\.[^"\\]*)*)"/g;
                                const optionsPattern = /"options"\s*:\s*\[([^\]]+)\]/g;
                                const correctPattern = /"correct"\s*:\s*(\d+)/g;
                                const explanationPattern = /"explanation"\s*:\s*"([^"\\]*(\\.[^"\\]*)*)"/g;

                                const questionMatches = [...content.matchAll(questionPattern)];
                                const optionMatches = [...content.matchAll(optionsPattern)];
                                const correctMatches = [...content.matchAll(correctPattern)];
                                const explanationMatches = [...content.matchAll(explanationPattern)];

                                console.log('Manual extraction results:', {
                                  questions: questionMatches.length,
                                  options: optionMatches.length,
                                  correct: correctMatches.length,
                                  explanations: explanationMatches.length
                                });

                                if (questionMatches.length > 0 && optionMatches.length === questionMatches.length) {
                                  questions = [];
                                  for (let i = 0; i < questionMatches.length; i++) {
                                    const question = questionMatches[i][1];
                                    const optionsStr = optionMatches[i][1];
                                    const correct = correctMatches[i] ? parseInt(correctMatches[i][1]) : 0;
                                    const explanation = explanationMatches[i] ? explanationMatches[i][1] : `The correct answer is option ${correct + 1}`;

                                    // Better option parsing
                                    const options = optionsStr
                                      .split(/,(?=\s*["'])/)
                                      .map((opt: string) => opt.trim().replace(/^["']|["']$/g, ''))
                                      .filter((opt: string) => opt.length > 0);

                                    if (question && options.length >= 4) {
                                      questions.push({
                                        question: question,
                                        options: options.slice(0, 4),
                                        correct: Math.max(0, Math.min(correct, options.length - 1)),
                                        explanation: explanation
                                      });
                                    }
                                  }
                                  console.log('Manual extraction created questions:', questions.length);
                                } else {
                                  throw new Error(`Failed to extract questions. Found: ${questionMatches.length} questions, ${optionMatches.length} option sets. Raw content: ${content.substring(0, 300)}`);
                                }
                              }
                            }
                          }

                          console.log('Parsed questions:', questions);

                          if (Array.isArray(questions) && questions.length > 0) {
                            // Validate question structure
                            const validQuestions = questions.filter(q =>
                              q.question &&
                              Array.isArray(q.options) &&
                              q.options.length >= 4 &&
                              typeof q.correct === 'number' &&
                              q.correct >= 0 &&
                              q.correct < q.options.length
                            );

                            console.log('Valid questions:', validQuestions.length);

                            if (validQuestions.length > 0) {
                              setQuizData({
                                topic,
                                questions: validQuestions,
                                timeLimit: parseInt(time) * 60,
                                difficulty,
                                level
                              });
                              setQuizState('taking');
                              setCurrentQuestion(0);
                              setUserAnswers([]);
                              setTimeLeft(parseInt(time) * 60);
                            } else {
                              throw new Error(`No valid questions generated. Found ${questions.length} questions but none passed validation.`);
                            }
                          } else {
                            throw new Error('AI response was not a valid question array');
                          }
                        } catch (error) {
                          console.error('Quiz parsing error:', error);
                          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                          alert(`Failed to generate quiz: ${errorMessage}. Please try a different topic or simplify your request.`);
                        }
                      } else {
                        console.error('API Error Response:', result);
                        alert(`Failed to generate quiz: ${result.error || 'No response from AI'}. Please check your connection and try again.`);
                      }
                    } catch (error) {
                      console.error('Network error:', error);
                      const errorMessage = error instanceof Error ? error.message : 'Network connection failed';
                      alert(`Network error: ${errorMessage}. Please check your internet connection and try again.`);
                    } finally {
                      // Reset button state
                      const button = document.querySelector('#create-quiz-btn') as HTMLButtonElement;
                      if (button) {
                        button.innerHTML = 'Generate Quiz';
                        button.disabled = false;
                      }
                    }
                  }}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Generate Quiz
                </button>

                {/* Academic Coverage Note */}
                <div className="text-center text-gray-400 text-sm bg-white/5 rounded-xl p-4">
                  <p><strong>Comprehensive Coverage:</strong> Mathematics, Sciences, Literature, History, Geography, Languages, Arts, Philosophy, Economics, Psychology, and more academic disciplines worldwide.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (quizState === 'taking') {
      return (
        <div className="p-4 sm:p-6 min-h-screen overflow-y-auto">
          <div className="max-w-4xl mx-auto pb-20">
            {/* Header Card */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 mb-6 shadow-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">{quizData?.topic}</h3>
                  <p className="text-gray-400">Question {currentQuestion + 1} of {quizData?.questions?.length}</p>
                  <div className="text-sm text-gray-500 mt-1">
                    {quizData?.difficulty && quizData?.level && (
                      <span>{quizData.difficulty} • {quizData.level} level</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono text-teal-400 font-semibold">
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </div>
                  <p className="text-gray-400 text-sm">Time Left</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white/10 rounded-full h-3 mt-4">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${((currentQuestion + 1) / (quizData?.questions?.length || 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            {quizData?.questions?.[currentQuestion] && (
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-lg">
                <div className="mb-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                      {currentQuestion + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl text-white leading-relaxed mb-2">
                        {quizData.questions[currentQuestion].question}
                      </h4>
                      {quizData.questions[currentQuestion].category && (
                        <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-gray-400 text-sm">
                          {quizData.questions[currentQuestion].category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {quizData.questions[currentQuestion].options.map((option: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => {
                        const newAnswers = [...userAnswers];
                        newAnswers[currentQuestion] = index;
                        setUserAnswers(newAnswers);
                      }}
                      className={`w-full p-4 text-left rounded-xl border transition-all duration-200 group hover:scale-[1.01] ${
                        userAnswers[currentQuestion] === index
                          ? 'bg-teal-500/20 border-teal-400/50 text-white shadow-md'
                          : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                          userAnswers[currentQuestion] === index
                            ? 'bg-teal-500 text-white'
                            : 'bg-white/10 text-gray-400 group-hover:bg-white/20'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="flex-1 leading-relaxed">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 font-medium backdrop-blur-sm border border-white/20"
                  >
                    Previous
                  </button>

                  <div className="text-center text-gray-400 text-sm">
                    {userAnswers.filter(answer => answer !== null && answer !== undefined).length} of {quizData.questions.length} answered
                  </div>

                  {currentQuestion === quizData.questions.length - 1 ? (
                    <button
                      onClick={finishQuiz}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg"
                    >
                      Finish Quiz
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentQuestion(Math.min(quizData.questions.length - 1, currentQuestion + 1))}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
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
            <h3 className="text-lg font-semibold text-white sticky top-0 bg-gray-900/95 py-2 flex items-center gap-2">📝 Review</h3>
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




  const renderCreativeContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 text-center">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2"><CreativeIcon size={20} />Creative Studio</h2>
        <p className="text-gray-400 text-sm mt-1">Image generation and creative tools</p>
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

    </div>
  );

  const renderPermissionsContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 text-center">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <PermissionsIcon size={20} />Permissions
        </h2>
        <p className="text-gray-400 text-sm mt-1">Manage your privacy settings and permissions</p>
      </div>

      {/* Permissions Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

        {/* Location Settings */}
        <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center">
                <span className="text-teal-400 text-lg">📍</span>
              </div>
              <div>
                <h3 className="text-white font-medium">Location Services</h3>
                <p className="text-gray-400 text-sm">Used for personalized responses and local context</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={userLocation !== null}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleRefreshLocation();
                    } else {
                      handleClearLocation();
                    }
                  }}
                  className="sr-only"
                />
                <div className={`w-12 h-6 rounded-full transition-colors ${
                  userLocation ? 'bg-teal-600' : 'bg-gray-600'
                }`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    userLocation ? 'translate-x-6' : 'translate-x-0.5'
                  } mt-0.5`} />
                </div>
              </div>
            </div>
          </div>

          {/* Location Details */}
          {userLocation && (
            <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-600/30">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Location:</span>
                  <span className="text-white">{userLocation.city}, {userLocation.country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Detection Method:</span>
                  <span className="text-gray-300 capitalize">
                    {userLocation.method === 'browser_geolocation' ? 'GPS' :
                     userLocation.method === 'ip_geolocation' ? 'IP Address' :
                     userLocation.method === 'user_override' ? 'Manual' :
                     userLocation.method}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Accuracy:</span>
                  <span className="text-gray-300 capitalize">{userLocation.accuracy}</span>
                </div>
              </div>

              {/* Location Actions */}
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={handleRefreshLocation}
                  disabled={locationStatus === 'detecting'}
                  className="flex-1 px-3 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                >
                  {locationStatus === 'detecting' ? 'Refreshing...' : '🔄 Refresh'}
                </button>
                <button
                  onClick={() => {
                    // Handle manual location change - could open a modal or similar
                    const newCity = prompt('Enter your city:', userLocation.city || '');
                    const newCountry = prompt('Enter your country:', userLocation.country || '');
                    if (newCity && newCountry) {
                      handleLocationChange(newCity, '', newCountry);
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                >
                  ✏️ Change
                </button>
                <button
                  onClick={handleClearLocation}
                  className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                >
                  🗑️ Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Camera & Vision */}
        <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <span className="text-green-400 text-lg">📷</span>
              </div>
              <div>
                <h3 className="text-white font-medium">Camera & Vision</h3>
                <p className="text-gray-400 text-sm">Access to camera for visual analysis</p>
              </div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={visionContext.cameraActive}
                onChange={() => {
                  // Toggle vision would be handled by the vision service
                  console.log('Toggle camera access');
                }}
                className="sr-only"
              />
              <div className={`w-12 h-6 rounded-full transition-colors ${
                visionContext.cameraActive ? 'bg-green-600' : 'bg-gray-600'
              }`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  visionContext.cameraActive ? 'translate-x-6' : 'translate-x-0.5'
                } mt-0.5`} />
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Camera access enables Gawin to provide visual context and assistance based on what you're looking at.
          </p>
        </div>

        {/* Microphone & Speech */}
        <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <span className="text-purple-400 text-lg">🎤</span>
              </div>
              <div>
                <h3 className="text-white font-medium">Microphone & Speech</h3>
                <p className="text-gray-400 text-sm">Voice input and speech recognition</p>
              </div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                defaultChecked={false}
                className="sr-only"
              />
              <div className="w-12 h-6 rounded-full bg-gray-600">
                <div className="w-5 h-5 rounded-full bg-white shadow-md transform transition-transform translate-x-0.5 mt-0.5" />
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Microphone access enables voice commands and speech-to-text functionality for hands-free interaction.
          </p>
        </div>

        {/* Voice Output */}
        <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <span className="text-yellow-400 text-lg">🔊</span>
              </div>
              <div>
                <h3 className="text-white font-medium">Voice Output</h3>
                <p className="text-gray-400 text-sm">Text-to-speech for responses</p>
              </div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                defaultChecked={false}
                className="sr-only"
              />
              <div className="w-12 h-6 rounded-full bg-gray-600">
                <div className="w-5 h-5 rounded-full bg-white shadow-md transform transition-transform translate-x-0.5 mt-0.5" />
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Enable spoken responses for accessibility and hands-free interaction.
          </p>
        </div>

        {/* Data Storage */}
        <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <span className="text-orange-400 text-lg">💾</span>
              </div>
              <div>
                <h3 className="text-white font-medium">Local Data Storage</h3>
                <p className="text-gray-400 text-sm">Save preferences and conversation history locally</p>
              </div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                defaultChecked={true}
                className="sr-only"
              />
              <div className="w-12 h-6 rounded-full bg-orange-600">
                <div className="w-5 h-5 rounded-full bg-white shadow-md transform transition-transform translate-x-6 mt-0.5" />
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Data is stored locally on your device for better performance and personalization. No data is sent to external servers without your permission.
          </p>
        </div>

        {/* Privacy Notice */}
        <div className="bg-teal-900/20 border border-teal-700/50 rounded-2xl p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-teal-400 text-lg">🔒</span>
            </div>
            <div>
              <h3 className="text-teal-100 font-medium mb-2">Privacy First</h3>
              <p className="text-teal-200 text-sm leading-relaxed">
                Your privacy is our priority. All data processing happens locally on your device when possible.
                Location data is used only for providing relevant local context and is never shared with third parties.
                You can disable any permission at any time.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  const renderChatContent = () => (
    <div className="flex flex-col h-full relative">
      {/* Background transparency layer */}
      <div className="absolute inset-0 z-0 bg-black/20" />
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

              {/* MCP Status Indicator */}
              <div className="mt-4 flex justify-center">
                <MCPStatusIndicator />
              </div>
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
                    <div className="w-full max-w-none">
                      <ModernMessageRenderer
                        text={message.content}
                        showActions={true}
                        showSpeechControls={true}
                        isAIMessage={true}
                        speechLanguage='english'
                        onCopy={() => {
                          navigator.clipboard.writeText(message.content);
                          console.log('Copied message:', message.id);
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
                      <ModernMessageRenderer
                        text={message.content}
                        showActions={false}
                      />
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

            {/* Real-time Voice Transcription Display */}
            {currentVoiceTranscript && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex justify-end"
              >
                <div className="max-w-[85%] px-5 py-4 bg-gradient-to-br from-blue-600/60 to-blue-700/60 rounded-3xl rounded-br-lg shadow-lg ring-1 ring-blue-400/30 min-h-[60px] flex flex-col justify-center backdrop-blur-sm border border-teal-400/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
                    <span className="text-teal-100 text-xs font-medium">Listening...</span>
                  </div>
                  <div className="text-white/90 text-sm italic">
                    "{currentVoiceTranscript}"
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );

  // Show Creator Dashboard if open
  if (showCreatorDashboard && isCreator) {
    return (
      <CreatorDashboard
        onClose={() => setShowCreatorDashboard(false)}
      />
    );
  }

  // Show Grade A Analytics Dashboard if open
  if (showGradeAAnalytics) {
    return (
      <div className="h-screen overflow-auto" style={{backgroundColor: '#1b1e1e'}}>
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Grade A Analytics Dashboard</h2>
            <button
              onClick={() => setShowGradeAAnalytics(false)}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>
          <GradeAAnalyticsDashboard />
        </div>
      </div>
    );
  }

  // Show Privacy Dashboard if open
  if (showPrivacyDashboard) {
    return (
      <div className="h-screen overflow-auto" style={{backgroundColor: '#1b1e1e'}}>
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Privacy Dashboard</h2>
            <button
              onClick={() => setShowPrivacyDashboard(false)}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>
          <PrivacyDashboard
            locationService={locationService}
            userLocation={userLocation}
            onLocationChange={() => {
              // Refresh location state when changed
              const currentLocation = locationService.getCurrentLocation();
              setUserLocation(currentLocation);
              setLocationStatus(currentLocation ? 'loaded' : 'failed');
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen relative overflow-hidden flex flex-col">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="video-background absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/background/new.mp4" type="video/mp4" />
        <div className="absolute inset-0" style={{backgroundColor: '#1b1e1e'}}></div>
      </video>
      
      {/* Overlay for readability while showing background */}
      <div className="absolute inset-0 z-10 bg-black/50"></div>
      
      {/* Main App Content with transparency */}
      <div className="relative z-20 h-full flex flex-col">

        {/* 🌍 Location Status Bar - Hidden for cleaner UI */}
        {/* <LocationStatusBar
          location={userLocation}
          status={locationStatus}
          onLocationChange={handleLocationChange}
          onClearLocation={handleClearLocation}
          onRefreshLocation={handleRefreshLocation}
        /> */}

        {/* 🎤 Tagalog Speech Analysis Status */}
        {speechLearningProgress && speechLearningProgress.totalNuances > 0 && (
          <div className="px-4 py-2 bg-gradient-to-r from-green-600/20 to-blue-600/20 border-b border-green-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-green-400">🇵🇭</span>
                <span className="text-white text-sm">
                  Tagalog Learning: {speechLearningProgress.totalNuances} nuances
                </span>
                <span className="text-green-300 text-xs">
                  {speechLearningProgress.culturalAdaptation}%
                </span>
              </div>
              <button
                onClick={toggleTagalogListening}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  isTagalogListening
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'bg-green-500/20 text-green-300 border border-green-500/30'
                }`}
              >
                {isTagalogListening ? '🛑 Stop' : '🎤 Listen'}
              </button>
            </div>
          </div>
        )}

        {/* Mobile Tabs - Fully Transparent */}
        <div className={`
          bg-transparent backdrop-blur-none border-b border-transparent px-3 sm:px-4
          ${optimizationConfig?.compactMode ? 'py-1.5' : 'py-2'}
        `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 overflow-x-auto flex-1">
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
                : 'bg-gray-800/90 text-gray-200 hover:bg-gray-700/90 backdrop-blur-sm'
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
                    : 'bg-gray-800/90 text-gray-200 hover:bg-gray-700/90 backdrop-blur-sm'
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
          </div>

          {/* Gawin Vision POV - Top Right Position */}
          <div className="flex-shrink-0 ml-2 relative">
            <GawinVisionPOV
              isVisible={isVisionPOVVisible}
              onToggle={() => setIsVisionPOVVisible(!isVisionPOVVisible)}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderTabContent()}
      </div>

      {/* Enhanced Two-Section Chat Input - Fully Transparent */}
      {activeTab && [].includes(activeTab.type) && (
          <div className="px-3 sm:px-4 py-1 sm:py-2 bg-transparent backdrop-blur-none border-t border-transparent"
               style={{ paddingBottom: `calc(0.5rem + env(safe-area-inset-bottom))` }}>

            {/* Enhanced Input Container with Two Sections */}
            <div className="relative w-full max-w-4xl mx-auto">
              <div className="relative bg-gray-800/30 backdrop-blur-sm rounded-3xl border border-transparent focus-within:border-teal-500/30 transition-all duration-300 shadow-lg shadow-teal-500/20 focus-within:shadow-teal-400/40 hover:shadow-teal-500/30 focus-within:bg-gray-800/40">

                {/* Top Section: Rich Text Input Area */}
                <div className="relative px-6 pt-5 pb-3">
                  <div
                    ref={inputRef}
                    contentEditable={!activeTab.isLoading}
                    suppressContentEditableWarning={true}
                    onInput={(e) => {
                      const target = e.target as HTMLDivElement;
                      const text = target.innerText || '';
                      const html = target.innerHTML || '';
                      setInputValue(text);
                      setInputHtml(html);

                      // Auto-resize
                      target.style.height = 'auto';
                      target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        const text = inputRef.current?.innerText || '';
                        if (text.trim()) {
                          handleSend(text);
                          // Clear the input
                          if (inputRef.current) {
                            inputRef.current.innerHTML = '';
                            setInputValue('');
                            setInputHtml('');
                          }
                        }
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();

                      // Get clipboard data
                      const clipboardData = e.clipboardData;
                      const htmlData = clipboardData.getData('text/html');
                      const textData = clipboardData.getData('text/plain');

                      if (htmlData) {
                        // Clean the HTML to preserve formatting but remove dangerous elements
                        const cleanHtml = htmlData
                          .replace(/<script[^>]*>.*?<\/script>/gi, '')
                          .replace(/<style[^>]*>.*?<\/style>/gi, '')
                          .replace(/on\w+="[^"]*"/gi, '')
                          .replace(/javascript:/gi, '');

                        // Insert the clean HTML
                        document.execCommand('insertHTML', false, cleanHtml);
                      } else if (textData) {
                        // If no HTML, insert as plain text but preserve line breaks
                        const formattedText = textData.replace(/\n/g, '<br>');
                        document.execCommand('insertHTML', false, formattedText);
                      }

                      // Update state
                      const target = e.target as HTMLDivElement;
                      const text = target.innerText || '';
                      const html = target.innerHTML || '';
                      setInputValue(text);
                      setInputHtml(html);
                    }}
                    className="
                      w-full bg-transparent text-white
                      resize-none overflow-auto focus:outline-none focus:ring-0 focus:border-transparent
                      text-sm sm:text-base min-h-[4rem] max-h-32 leading-relaxed
                      whitespace-pre-wrap break-words
                    "
                    style={{
                      wordWrap: 'break-word',
                      whiteSpace: 'pre-wrap'
                    }}
                    data-placeholder={`Ask me anything ${
                      activeTab.type === 'creative' ? 'creative...' :
                      'about your studies...'
                    }`}
                  />

                  {/* Placeholder styling via CSS */}
                  <style dangerouslySetInnerHTML={{
                    __html: `
                      [contenteditable]:empty:before {
                        content: attr(data-placeholder);
                        color: rgb(156 163 175);
                        pointer-events: none;
                        opacity: 0.7;
                      }
                      [contenteditable]:focus {
                        outline: none !important;
                        border: none !important;
                        box-shadow: none !important;
                        -webkit-box-shadow: none !important;
                        -moz-box-shadow: none !important;
                      }
                      [contenteditable] {
                        outline: none !important;
                        border: none !important;
                      }
                    `
                  }} />
                </div>

                {/* Bottom Section: Streamlined Tool Icons */}
                <div className="px-6 pb-4 pt-2">
                  <div className="flex items-center justify-between">
                    {/* Left Side: Unified Voice Control */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      {/* Unified Voice Control (Input + Output) */}
                      <div className="relative">
                        <UnifiedVoiceControl
                          onTranscript={handleVoiceTranscript}
                          onSendMessage={handleVoiceSendMessage}
                          isGawinSpeaking={isGawinSpeaking}
                          disabled={activeTab.isLoading}
                        />
                      </div>


                      {/* Secondary Tools - More Compact */}
                      <div className="flex items-center space-x-1 ml-2">
                        {/* Vision Control - Compact */}
                        {userPermissions.visionControl ? (
                          <div className="relative">
                            <SimpleVision
                              onVisionToggle={() => setIsVisionPOVVisible(!isVisionPOVVisible)}
                              isVisionActive={isVisionPOVVisible}
                              compact={true}
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              alert('Vision Control is a premium feature. Please create an account to access camera and image analysis capabilities.');
                            }}
                            className="p-1.5 bg-gray-800/40 border border-gray-700/30 rounded-lg relative group opacity-50 scale-90"
                            title="Vision Control (Premium)"
                          >
                            <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-500 rounded-full"></div>
                          </button>
                        )}

                        {/* Tools Menu */}
                        <button
                          onClick={() => setShowMoreTools(!showMoreTools)}
                          className="p-1.5 bg-gray-800/40 border border-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors scale-90"
                          title="Tools"
                        >
                          <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>

                        {/* Horizontal Tools - Show when Tools is active */}
                        <AnimatePresence>
                          {showMoreTools && (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="flex items-center space-x-2 ml-2"
                            >
                              {/* Screen Share Control */}
                              <div className="flex flex-col items-center">
                                <ScreenShareButton />
                                <span className="text-xs text-gray-400 mt-0.5">Screen</span>
                              </div>

                              {/* Translation Control */}
                              <div className="flex flex-col items-center">
                                <TranslationControl compact={true} />
                                <span className="text-xs text-gray-400 mt-0.5">Translate</span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Right Side: 3D Cube or Send Button based on input state */}
                    <div className="relative flex items-center justify-center">
                      {!inputValue.trim() && !activeTab.isLoading ? (
                        /* 3D Cube when not typing */
                        <div className="relative touch-manipulation">
                          <div className="relative bg-gradient-to-br from-teal-600/20 to-cyan-600/20 p-1 rounded-xl border border-teal-500/30">
                            <MiniatureCube
                              isActive={showVoiceModePopup}
                              size={48}
                              onClick={() => setShowVoiceModePopup(true)}
                            />
                          </div>
                          {/* Glowing ring for emphasis */}
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-500/20 to-cyan-500/20 blur-sm animate-pulse pointer-events-none"></div>
                        </div>
                      ) : (
                        /* Send Button when typing or loading */
                        <button
                          onClick={() => {
                            // Trigger haptic feedback for send action
                            hapticService.triggerHaptic('send');
                            handleSend(inputValue);
                            // Clear the input
                            if (inputRef.current) {
                              inputRef.current.innerHTML = '';
                              setInputValue('');
                              setInputHtml('');
                            }
                          }}
                          disabled={activeTab.isLoading || !inputValue.trim()}
                          className="
                            w-12 h-12 rounded-full flex items-center justify-center
                            bg-teal-600 hover:bg-teal-500 disabled:bg-gray-700
                            text-white disabled:text-gray-500
                            transition-all duration-200 flex-shrink-0
                            shadow-lg disabled:shadow-none
                            transform hover:scale-105 active:scale-95
                          "
                          title="Send Message (Braille: ⠎)"
                        >
                          {activeTab.isLoading ? (
                            <LoadingIcon size={16} className="animate-spin" />
                          ) : (
                            <SendIcon size={16} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                </div>
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
              className="fixed left-0 top-0 h-full w-80 bg-gray-900/95 backdrop-blur-sm border-r border-gray-600/50 z-50 overflow-y-auto scrollbar-none"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-bold">G</span>
                  </div>
                  <div>
                    <h1 className="text-xl text-white font-medium">Gawin AI</h1>
                    <p className="text-sm text-gray-300">Your Learning Assistant</p>
                  </div>
                </div>

                {/* Theme Toggle */}
              </div>
              
              <div className="p-4 bg-gray-800/90 rounded-2xl border border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-700 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.full_name?.[0] || user.email[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{user.full_name || 'User'}</p>
                    <p className="text-gray-300 text-xs">{user.email}</p>
                  </div>
                </div>
              </div>
              
              {/* Creator Dashboard Access */}
              {isCreator && (
                <div className="space-y-3">
                  <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wide">Creator Access</h3>
                  <button
                    onClick={() => {
                      setShowCreatorDashboard(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl hover:from-purple-600/30 hover:to-pink-600/30 transition-all duration-200 flex items-center space-x-3"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <span className="text-white text-xl">🎯</span>
                    </div>
                    <div className="text-left">
                      <div className="text-white font-medium">Creator Dashboard</div>
                      <div className="text-purple-300 text-xs">Full control center</div>
                    </div>
                  </button>
                </div>
              )}

              {/* Privacy Dashboard */}
              <div className="space-y-3">
                <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wide">Privacy</h3>
                <button
                  onClick={() => {
                    setShowPrivacyDashboard(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-teal-400 text-lg">🔒</span>
                  </div>
                  <div className="text-left">
                    <div className="text-white font-medium">Privacy Dashboard</div>
                    <div className="text-teal-300 text-xs">Control your data & location</div>
                  </div>
                </button>
              </div>


              {/* Acknowledgments */}
              <div className="space-y-3">
                <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wide">Acknowledgments</h3>
                <div className="bg-gray-800/50 rounded-xl p-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-purple-400 text-lg">🎥</span>
                    </div>
                    <div className="text-left">
                      <div className="text-white font-medium text-sm">Background Video</div>
                      <div className="text-purple-300 text-xs">Video by Chandresh Uike</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Status & Limitations */}
              {isGuest && (
                <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-500/30 rounded-xl p-4 mb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">G</span>
                    </div>
                    <div>
                      <h3 className="text-amber-200 font-semibold">Guest Mode</h3>
                      <p className="text-amber-300 text-xs">Limited features for security</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-amber-300">Messages today:</span>
                      <span className="text-amber-200">{guestChatCount}/{dailyLimit}</span>
                    </div>
                    <div className="w-full bg-amber-900/30 rounded-full h-2">
                      <div
                        className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((guestChatCount / dailyLimit) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <button
                    onClick={() => window.location.href = '/'}
                    className="w-full mt-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    Create Account for Full Access
                  </button>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wide">New Tab</h3>
                {[
                  { type: 'general' as const, icon: '💬', label: 'General Chat', allowed: userPermissions.basicChat },
                  { type: 'quiz' as const, icon: <QuizIcon size={16} />, label: 'Quiz Generator', allowed: userPermissions.quizGenerator },
                  { type: 'creative' as const, icon: <CreativeIcon size={16} />, label: 'Creative Studio', allowed: userPermissions.creativeStudio },
                  { type: 'research' as const, icon: <ResearchIcon size={16} />, label: 'Research Mode', allowed: userPermissions.researchMode },
                  { type: 'permissions' as const, icon: <PermissionsIcon size={16} />, label: 'Permissions', allowed: userPermissions.permissionsTab },
                ].filter(item => item.allowed || isCreator).map((item) => (
                  <div key={item.type} className="relative">
                    {item.allowed || isCreator ? (
                      <button
                        onClick={() => createNewTab(item.type)}
                        className="w-full p-3 text-left hover:bg-teal-600/20 rounded-lg transition-colors flex items-center space-x-3 text-gray-300 hover:text-teal-200"
                      >
                        <span className="text-lg flex items-center">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                      </button>
                    ) : (
                      <div className="w-full p-3 text-left rounded-lg flex items-center justify-between text-gray-500 cursor-not-allowed opacity-50">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg flex items-center">{item.icon}</span>
                          <div>
                            <span className="font-medium">{item.label}</span>
                            <div className="text-xs text-amber-400">Premium Feature</div>
                          </div>
                        </div>
                        <div className="w-6 h-6 bg-amber-500 rounded-full text-xs text-white flex items-center justify-center">
                          <span>P</span>
                        </div>
                      </div>
                    )}
                  </div>
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
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>


      {/* Removed redundant code editor - now handled inline in MessageRenderer */}



      {/* Removed complex code editor - now using inline ChatGPT-style code rendering */}

      {/* 🔄 Update Notification */}
      <UpdateNotification
        isVisible={showUpdateNotification}
        onApply={async () => {
          console.log('🔄 Applying update...');
          await autoUpdateService.applyUpdate();
        }}
        onDismiss={() => {
          setShowUpdateNotification(false);
        }}
        autoApplySeconds={10}
      />

      {/* 🎙️ Immersive Voice Mode */}
      <ImmersiveVoiceMode
        isOpen={showVoiceModePopup}
        onClose={() => setShowVoiceModePopup(false)}
        onVoiceInput={handleVoiceModeMessage}
        isProcessing={activeTab?.isLoading || false}
        aiResponse={lastAIResponse}
      />


      </div>
    </div>
  );
}