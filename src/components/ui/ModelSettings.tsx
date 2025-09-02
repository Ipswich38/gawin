'use client';

import React, { useState, useEffect } from 'react';
import { X, Settings, Zap, DollarSign, Brain, Code, Palette, MessageSquare, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { aiModelManager } from '@/lib/services/aiModelManager';
import type { AIModel, FeatureModelMapping } from '@/lib/services/aiModelManager';

interface ModelSettingsProps {
  onClose: () => void;
}

export function ModelSettings({ onClose }: ModelSettingsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'models' | 'health'>('overview');
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [models, setModels] = useState<AIModel[]>([]);

  useEffect(() => {
    // Get system status and models
    const status = aiModelManager.getSystemStatus();
    setSystemStatus(status);

    // Get all models by category
    const allModels = [
      ...aiModelManager.getModelsByCategory('reasoning'),
      ...aiModelManager.getModelsByCategory('coding'),
      ...aiModelManager.getModelsByCategory('creative'),
      ...aiModelManager.getModelsByCategory('general'),
      ...aiModelManager.getModelsByCategory('translation')
    ];
    setModels(allModels);
  }, []);

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'calculator': return <Brain className="w-4 h-4" />;
      case 'coding_academy': return <Code className="w-4 h-4" />;
      case 'ai_academy': return <Zap className="w-4 h-4" />;
      case 'creative_studio': return <Palette className="w-4 h-4" />;
      case 'translator': return <MessageSquare className="w-4 h-4" />;
      case 'robotics': return <Settings className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'reasoning': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'coding': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'creative': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'general': return 'bg-green-100 text-green-800 border-green-200';
      case 'translation': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCost = (cost: number) => {
    if (cost < 1) return `$${(cost * 1000).toFixed(0)}/M tokens`;
    return `$${cost.toFixed(2)}/1K tokens`;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Models</p>
              <p className="text-2xl font-bold text-blue-800">{systemStatus?.totalModels || 0}</p>
            </div>
            <Settings className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Healthy Models</p>
              <p className="text-2xl font-bold text-green-800">{systemStatus?.healthyModels || 0}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600 font-medium">Issues</p>
              <p className="text-2xl font-bold text-amber-800">{systemStatus?.unhealthyModels || 0}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Provider Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Provider Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {systemStatus?.modelsByProvider && Object.entries(systemStatus.modelsByProvider).map(([provider, count]) => (
            <div key={provider} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">{provider}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{count as number} models</span>
                <span className="text-xs text-gray-500">
                  Avg: {systemStatus.avgCostPerProvider[provider]?.toFixed(3) || '0.000'}/1K
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Features */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🚀 Intelligent Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Auto-fallback when models fail</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Cost-optimized model selection</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Health monitoring & recovery</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Feature-specific optimization</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeatures = () => {
    const features = [
      { key: 'calculator', name: 'Smart Calculator', description: 'Mathematical reasoning and problem solving' },
      { key: 'coding_academy', name: 'Coding Academy', description: 'Code generation, debugging, and reviews' },
      { key: 'ai_academy', name: 'AI Academy', description: 'AI concepts and educational content' },
      { key: 'creative_studio', name: 'Creative Studio', description: 'Creative writing and content generation' },
      { key: 'translator', name: 'Universal Translator', description: 'Multi-language translation' },
      { key: 'robotics', name: 'Robotics Lab', description: 'Robotics and automation guidance' },
      { key: 'grammar_checker', name: 'Grammar Checker', description: 'Writing assistance and correction' },
      { key: 'general_chat', name: 'General Chat', description: 'General purpose conversations' }
    ];

    return (
      <div className="space-y-4">
        {features.map(feature => {
          const config = aiModelManager.getFeatureConfig(feature.key as keyof FeatureModelMapping);
          const primaryModel = aiModelManager.getModelInfo(config.primary);
          
          return (
            <div key={feature.key} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {getFeatureIcon(feature.key)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{feature.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Primary: {primaryModel?.name || 'Unknown'}</span>
                      <span>Fallbacks: {config.fallbacks.length}</span>
                      <span>Max Cost: {formatCost(config.costThreshold)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-600">Active</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderModels = () => (
    <div className="space-y-4">
      {['reasoning', 'coding', 'creative', 'general', 'translation'].map(category => {
        const categoryModels = models.filter(m => m.category === category);
        if (categoryModels.length === 0) return null;

        return (
          <div key={category} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h4 className="font-semibold text-gray-800 capitalize">
                {category} Models ({categoryModels.length})
              </h4>
            </div>
            <div className="divide-y divide-gray-100">
              {categoryModels.map(model => (
                <div key={model.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="font-medium text-gray-800">{model.name}</h5>
                        <span className={`px-2 py-1 text-xs rounded-full border ${getCategoryColor(model.category)}`}>
                          {model.category}
                        </span>
                        {model.active && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{model.provider}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {model.strengths.map(strength => (
                          <span key={strength} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="flex items-center gap-1 text-green-600 mb-1">
                        <DollarSign className="w-3 h-3" />
                        {formatCost(model.cost_per_1k_tokens)}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {(model.max_tokens / 1000).toFixed(0)}K tokens
                      </div>
                      <div className="text-gray-500 text-xs">
                        Priority: {model.fallback_priority}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderHealth = () => (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-700 mb-2">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">System Health: Excellent</span>
        </div>
        <p className="text-sm text-green-600">
          All systems are operational. Smart fallback mechanisms are active and monitoring model performance.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-700 mb-3">
          <Clock className="w-5 h-5" />
          <span className="font-medium">Automatic Recovery Features</span>
        </div>
        <div className="space-y-2 text-sm text-blue-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Failed models auto-recover after 10 minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Extended downtime triggers 30-minute recovery cycle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Real-time performance monitoring every 5 minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Instant fallback on consecutive failures (3+)</span>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-purple-700 mb-3">
          <Zap className="w-5 h-5" />
          <span className="font-medium">Smart Optimizations</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-purple-600">
          <div>• Cost-aware model selection</div>
          <div>• Response time optimization</div>
          <div>• Feature-specific model matching</div>
          <div>• Automatic load balancing</div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'features', label: 'Features', icon: <Zap className="w-4 h-4" /> },
    { id: 'models', label: 'Models', icon: <Brain className="w-4 h-4" /> },
    { id: 'health', label: 'Health', icon: <CheckCircle className="w-4 h-4" /> }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Settings className="w-6 h-6" />
              AI Model Management
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Intelligent model selection with automatic fallbacks
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'features' && renderFeatures()}
          {activeTab === 'models' && renderModels()}
          {activeTab === 'health' && renderHealth()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Powered by OpenRouter • 100+ AI models available
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}