'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Star,
  Download,
  Plus,
  Zap,
  Brain,
  Eye,
  Mic,
  Database,
  Globe,
  Code,
  Image,
  FileText,
  BarChart3,
  Shield,
  Clock,
  MessageSquare,
  TrendingUp,
  Users,
  Heart,
  BookOpen,
  Settings,
  Play
} from 'lucide-react';
import { NotionCard, NotionButton, NotionInput, NotionTag, NotionModal } from './ui/NotionUI';

interface MarketplaceAgent {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  category: string;
  rating: number;
  downloads: number;
  price: 'free' | 'premium';
  tags: string[];
  author: string;
  version: string;
  color: string;
  capabilities: string[];
  integrations: string[];
  screenshots?: string[];
  isInstalled: boolean;
  isPopular?: boolean;
  isNew?: boolean;
}

const MARKETPLACE_AGENTS: MarketplaceAgent[] = [
  {
    id: 'advanced-chat',
    name: 'Advanced Chat Agent',
    description: 'Enhanced conversational AI with memory and context awareness',
    longDescription: 'This advanced chat agent provides sophisticated conversation capabilities with long-term memory, context awareness, and personality customization. Perfect for customer service, personal assistants, and interactive applications.',
    icon: MessageSquare,
    category: 'Conversation',
    rating: 4.9,
    downloads: 25340,
    price: 'free',
    tags: ['conversation', 'memory', 'context', 'nlp'],
    author: 'Gawin Team',
    version: '2.1.0',
    color: 'blue',
    capabilities: ['Natural language understanding', 'Context retention', 'Personality customization', 'Multi-language support'],
    integrations: ['OpenAI GPT', 'Anthropic Claude', 'Google Gemini'],
    isInstalled: true,
    isPopular: true
  },
  {
    id: 'web-researcher',
    name: 'Web Research Agent',
    description: 'Comprehensive web research with source verification and citation',
    longDescription: 'Advanced research agent that searches the web, verifies sources, and provides comprehensive reports with proper citations. Ideal for academic research, market analysis, and fact-checking.',
    icon: Search,
    category: 'Research',
    rating: 4.8,
    downloads: 18750,
    price: 'free',
    tags: ['research', 'web-search', 'citations', 'analysis'],
    author: 'Research Labs',
    version: '1.5.2',
    color: 'green',
    capabilities: ['Multi-source search', 'Source verification', 'Citation generation', 'Report formatting'],
    integrations: ['Google Search', 'Bing API', 'Academic databases', 'News APIs'],
    isInstalled: false,
    isPopular: true
  },
  {
    id: 'vision-pro',
    name: 'Vision Pro Agent',
    description: 'Advanced computer vision for object detection and image analysis',
    longDescription: 'Professional-grade computer vision agent with advanced object detection, image classification, OCR, and visual content analysis capabilities.',
    icon: Eye,
    category: 'Vision',
    rating: 4.7,
    downloads: 12500,
    price: 'premium',
    tags: ['computer-vision', 'ocr', 'detection', 'analysis'],
    author: 'VisionAI Inc',
    version: '3.0.1',
    color: 'purple',
    capabilities: ['Object detection', 'OCR', 'Image classification', 'Facial recognition'],
    integrations: ['OpenAI Vision', 'Google Vision API', 'Azure Cognitive Services'],
    isInstalled: false,
    isNew: true
  },
  {
    id: 'voice-master',
    name: 'Voice Master Agent',
    description: 'Professional speech synthesis and recognition',
    longDescription: 'High-quality voice agent with natural speech synthesis, real-time transcription, and voice cloning capabilities.',
    icon: Mic,
    category: 'Voice',
    rating: 4.6,
    downloads: 9800,
    price: 'premium',
    tags: ['speech', 'synthesis', 'transcription', 'voice-cloning'],
    author: 'AudioTech',
    version: '2.3.0',
    color: 'orange',
    capabilities: ['Speech synthesis', 'Real-time transcription', 'Voice cloning', 'Multi-language support'],
    integrations: ['ElevenLabs', 'Azure Speech', 'Google Speech'],
    isInstalled: false
  },
  {
    id: 'data-wizard',
    name: 'Data Wizard Agent',
    description: 'Advanced data processing, analysis, and visualization',
    longDescription: 'Powerful data agent that can process, clean, analyze, and visualize complex datasets with machine learning capabilities.',
    icon: Database,
    category: 'Data',
    rating: 4.8,
    downloads: 15600,
    price: 'free',
    tags: ['data', 'analysis', 'visualization', 'ml'],
    author: 'DataScience Pro',
    version: '1.8.0',
    color: 'cyan',
    capabilities: ['Data cleaning', 'Statistical analysis', 'Visualization', 'ML modeling'],
    integrations: ['Pandas', 'NumPy', 'Plotly', 'Scikit-learn'],
    isInstalled: false,
    isPopular: true
  },
  {
    id: 'api-connector',
    name: 'API Connector Agent',
    description: 'Universal API integration and webhook management',
    longDescription: 'Connect to any REST API, GraphQL endpoint, or webhook with automatic authentication, rate limiting, and error handling.',
    icon: Globe,
    category: 'Integration',
    rating: 4.5,
    downloads: 22100,
    price: 'free',
    tags: ['api', 'webhooks', 'integration', 'automation'],
    author: 'ConnectAI',
    version: '1.2.5',
    color: 'indigo',
    capabilities: ['REST API calls', 'GraphQL queries', 'Webhook handling', 'Authentication'],
    integrations: ['OAuth 2.0', 'JWT', 'API Keys', 'Webhooks'],
    isInstalled: true
  },
  {
    id: 'code-genius',
    name: 'Code Genius Agent',
    description: 'AI-powered code generation, review, and optimization',
    longDescription: 'Advanced coding assistant that generates, reviews, and optimizes code across multiple programming languages with best practices.',
    icon: Code,
    category: 'Development',
    rating: 4.9,
    downloads: 31200,
    price: 'premium',
    tags: ['coding', 'generation', 'review', 'optimization'],
    author: 'CodeAI Labs',
    version: '2.7.1',
    color: 'red',
    capabilities: ['Code generation', 'Code review', 'Bug detection', 'Performance optimization'],
    integrations: ['GitHub Copilot', 'OpenAI Codex', 'CodeT5'],
    isInstalled: false,
    isPopular: true,
    isNew: true
  },
  {
    id: 'image-creator',
    name: 'Image Creator Agent',
    description: 'Advanced AI image generation and editing',
    longDescription: 'Professional image generation agent with style transfer, image editing, and custom model training capabilities.',
    icon: Image,
    category: 'Creative',
    rating: 4.7,
    downloads: 19800,
    price: 'premium',
    tags: ['image-generation', 'editing', 'art', 'creative'],
    author: 'Creative AI Studio',
    version: '1.9.3',
    color: 'pink',
    capabilities: ['Image generation', 'Style transfer', 'Image editing', 'Custom training'],
    integrations: ['DALL-E 3', 'Midjourney', 'Stable Diffusion'],
    isInstalled: false
  }
];

const CATEGORIES = [
  'All',
  'Conversation',
  'Research',
  'Vision',
  'Voice',
  'Data',
  'Integration',
  'Development',
  'Creative'
];

const AgentMarketplace: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAgent, setSelectedAgent] = useState<MarketplaceAgent | null>(null);
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest'>('popular');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAgents = MARKETPLACE_AGENTS
    .filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          agent.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'All' || agent.category === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.downloads - a.downloads;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return a.isNew ? -1 : b.isNew ? 1 : 0;
        default:
          return 0;
      }
    });

  const installAgent = (agent: MarketplaceAgent) => {
    // Simulate installation
    console.log(`Installing ${agent.name}...`);
    // In a real app, this would make an API call
    setTimeout(() => {
      console.log(`${agent.name} installed successfully!`);
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Agent Marketplace</h1>
            <p className="text-gray-600 mt-1">Discover and install powerful AI agents</p>
          </div>
          <div className="flex gap-2">
            <NotionButton
              variant="ghost"
              icon={<Filter className="w-4 h-4" />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </NotionButton>
            <NotionButton
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
            >
              Submit Agent
            </NotionButton>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <NotionInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search agents..."
              icon={<Search className="w-4 h-4" />}
              className="flex-1"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <NotionButton
                key={category}
                variant={selectedCategory === category ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </NotionButton>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredAgents.map((agent) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <NotionCard
                  className="h-full cursor-pointer hover:border-gray-400"
                  onClick={() => setSelectedAgent(agent)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-${agent.color}-100 flex items-center justify-center`}>
                      <agent.icon className={`w-6 h-6 text-${agent.color}-600`} />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {agent.isNew && <NotionTag color="green" className="text-xs">New</NotionTag>}
                      {agent.isPopular && <NotionTag color="blue" className="text-xs">Popular</NotionTag>}
                      {agent.price === 'premium' && <NotionTag color="purple" className="text-xs">Premium</NotionTag>}
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2">{agent.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{agent.description}</p>

                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{agent.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      <span>{agent.downloads.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {agent.tags.slice(0, 3).map((tag) => (
                      <NotionTag key={tag} color="gray" className="text-xs">
                        {tag}
                      </NotionTag>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    {agent.isInstalled ? (
                      <NotionButton variant="secondary" size="sm" fullWidth>
                        Installed
                      </NotionButton>
                    ) : (
                      <NotionButton
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          installAgent(agent);
                        }}
                      >
                        Install
                      </NotionButton>
                    )}
                  </div>
                </NotionCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredAgents.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          </div>
        )}
      </div>

      {/* Agent Detail Modal */}
      <NotionModal
        isOpen={selectedAgent !== null}
        onClose={() => setSelectedAgent(null)}
        title={selectedAgent?.name}
        size="xl"
      >
        {selectedAgent && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className={`w-16 h-16 rounded-xl bg-${selectedAgent.color}-100 flex items-center justify-center`}>
                <selectedAgent.icon className={`w-8 h-8 text-${selectedAgent.color}-600`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-bold text-gray-900">{selectedAgent.name}</h2>
                  {selectedAgent.isNew && <NotionTag color="green">New</NotionTag>}
                  {selectedAgent.isPopular && <NotionTag color="blue">Popular</NotionTag>}
                  {selectedAgent.price === 'premium' && <NotionTag color="purple">Premium</NotionTag>}
                </div>
                <p className="text-gray-600 mb-4">{selectedAgent.longDescription}</p>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span>{selectedAgent.rating} rating</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    <span>{selectedAgent.downloads.toLocaleString()} downloads</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>by {selectedAgent.author}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Capabilities</h3>
                <ul className="space-y-2">
                  {selectedAgent.capabilities.map((capability) => (
                    <li key={capability} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                      {capability}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Integrations</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedAgent.integrations.map((integration) => (
                    <NotionTag key={integration} color="gray" className="text-xs">
                      {integration}
                    </NotionTag>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              {selectedAgent.isInstalled ? (
                <>
                  <NotionButton variant="primary" icon={<Play className="w-4 h-4" />}>
                    Launch Agent
                  </NotionButton>
                  <NotionButton variant="secondary" icon={<Settings className="w-4 h-4" />}>
                    Configure
                  </NotionButton>
                </>
              ) : (
                <NotionButton
                  variant="primary"
                  icon={<Download className="w-4 h-4" />}
                  onClick={() => installAgent(selectedAgent)}
                >
                  Install Agent
                </NotionButton>
              )}
              <NotionButton variant="ghost" icon={<Heart className="w-4 h-4" />}>
                Add to Favorites
              </NotionButton>
            </div>
          </div>
        )}
      </NotionModal>
    </div>
  );
};

export default AgentMarketplace;