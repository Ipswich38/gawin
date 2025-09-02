export interface AIModel {
  id: string;
  name: string;
  provider: 'openrouter';
  type: 'text' | 'vision' | 'audio' | 'reasoning';
  description: string;
  maxTokens: number;
  supportsFunctionCalling: boolean;
  isActive: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  modelUsed?: string;
  tokens?: number;
  responseTime?: number;
  // Perplexity features
  sources?: SearchSource[];
  citations?: Citation[];
  searchPerformed?: boolean;
  reasoning?: string;
  // Additional properties used in the app
  imageUrl?: string;
  audioUrl?: string;
  isImageGeneration?: boolean;
  isAudioGeneration?: boolean;
  intentAnalysis?: any;
  showReasoning?: boolean;
  isLoading?: boolean;
}

export interface SearchSource {
  title: string;
  url: string;
  snippet: string;
  relevanceScore?: number;
}

export interface Citation {
  id: number;
  title: string;
  url: string;
  snippet: string;
  position: number;
}

// Removed GroqResponse - now using OpenRouter