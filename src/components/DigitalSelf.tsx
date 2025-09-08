'use client';

import { useState, useEffect } from 'react';
import { behaviorAnalyticsService, BehaviorPattern } from '@/lib/services/behaviorAnalyticsService';
import { behaviorEnhancedAI } from '@/lib/services/behaviorEnhancedAI';
import { behaviorPrivacyService } from '@/lib/services/behaviorPrivacyService';
import { backgroundBehaviorService } from '@/lib/services/backgroundBehaviorService';

/**
 * Digital Self Dashboard
 * Beautiful visualization of user's behavior patterns and digital wellbeing
 */

interface DigitalSelfProps {
  onClose: () => void;
}

interface WellbeingInsight {
  icon: string;
  title: string;
  description: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

const DigitalSelf: React.FC<DigitalSelfProps> = ({ onClose }) => {
  const [behaviorSummary, setBehaviorSummary] = useState<any>(null);
  const [recentPatterns, setRecentPatterns] = useState<BehaviorPattern[]>([]);
  const [enhancedSummary, setEnhancedSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasBackgroundData, setHasBackgroundData] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'patterns' | 'insights' | 'settings'>('overview');

  useEffect(() => {
    const loadData = async () => {
      try {
        const summary = behaviorEnhancedAI.getBehaviorSummary();
        const context = behaviorAnalyticsService.getBehaviorContext();
        
        setBehaviorSummary(summary);
        if (context?.recentPatterns) {
          setRecentPatterns(context.recentPatterns.slice(-7)); // Last 7 patterns
        }

        // Check for enhanced background data
        const enhancedData = backgroundBehaviorService.getEnhancedSummary();
        if (enhancedData) {
          setEnhancedSummary(enhancedData);
          setHasBackgroundData(true);
        }
      } catch (error) {
        console.warn('Failed to load digital self data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const generateWellbeingInsights = (): WellbeingInsight[] => {
    if (!behaviorSummary) return [];

    const insights: WellbeingInsight[] = [
      {
        icon: '🧠',
        title: 'Mental Wellbeing',
        description: 'Overall mood and emotional state',
        score: behaviorSummary.moodScore,
        trend: behaviorSummary.moodScore > 70 ? 'up' : behaviorSummary.moodScore < 40 ? 'down' : 'stable',
        color: 'from-purple-400 to-pink-400'
      },
      {
        icon: '🏃',
        title: 'Activity Level', 
        description: 'Physical movement and energy',
        score: getActivityScore(),
        trend: 'stable',
        color: 'from-green-400 to-blue-400'
      },
      {
        icon: '👥',
        title: 'Social Connection',
        description: 'Interaction and community engagement',
        score: getSocialScore(),
        trend: 'up',
        color: 'from-orange-400 to-red-400'
      },
      {
        icon: '📱',
        title: 'Digital Balance',
        description: 'Healthy technology usage patterns',
        score: getDigitalBalanceScore(),
        trend: 'stable',
        color: 'from-teal-400 to-cyan-400'
      }
    ];

    return insights;
  };

  const getActivityScore = (): number => {
    if (!behaviorSummary) return 50;
    return behaviorSummary.activityLevel === 'very active' ? 90 :
           behaviorSummary.activityLevel === 'active' ? 75 :
           behaviorSummary.activityLevel === 'moderate activity' ? 60 : 40;
  };

  const getSocialScore = (): number => {
    if (!behaviorSummary) return 50;
    return behaviorSummary.socialLevel === 'highly social' ? 85 :
           behaviorSummary.socialLevel === 'socially active' ? 70 :
           behaviorSummary.socialLevel === 'somewhat social' ? 55 : 35;
  };

  const getDigitalBalanceScore = (): number => {
    // Calculate based on usage patterns and location diversity
    const locationScore = behaviorSummary?.locationContext === 'mobile' ? 80 : 60;
    const baseScore = 65;
    return Math.min(100, (locationScore + baseScore) / 2);
  };

  const renderMoodChart = () => {
    if (!recentPatterns.length) return null;

    const maxScore = Math.max(...recentPatterns.map(p => p.moodScore));
    const minScore = Math.min(...recentPatterns.map(p => p.moodScore));

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span className="text-teal-600">📈</span>
          Mood Trends (Last 7 Days)
        </h3>
        <div className="relative h-32 bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl p-4">
          <svg className="w-full h-full" viewBox="0 0 280 80">
            <defs>
              <linearGradient id="moodGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(20, 184, 166)" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="rgb(20, 184, 166)" stopOpacity="0.1"/>
              </linearGradient>
            </defs>
            
            {/* Background grid */}
            <g stroke="#e2e8f0" strokeWidth="0.5" opacity="0.5">
              {[0, 20, 40, 60, 80].map(y => (
                <line key={y} x1="0" y1={y} x2="280" y2={y} />
              ))}
            </g>
            
            {/* Mood line */}
            <path
              d={recentPatterns.map((pattern, index) => {
                const x = (index / (recentPatterns.length - 1)) * 280;
                const y = 80 - (pattern.moodScore / 100) * 80;
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              stroke="rgb(20, 184, 166)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            
            {/* Fill area under curve */}
            <path
              d={`${recentPatterns.map((pattern, index) => {
                const x = (index / (recentPatterns.length - 1)) * 280;
                const y = 80 - (pattern.moodScore / 100) * 80;
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')} L 280 80 L 0 80 Z`}
              fill="url(#moodGradient)"
            />
            
            {/* Data points */}
            {recentPatterns.map((pattern, index) => {
              const x = (index / (recentPatterns.length - 1)) * 280;
              const y = 80 - (pattern.moodScore / 100) * 80;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="rgb(20, 184, 166)"
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
          
          {/* Score indicators */}
          <div className="absolute top-2 right-2 text-xs text-gray-600">
            <div>High: {maxScore}</div>
            <div>Low: {minScore}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderWellbeingCards = () => {
    const insights = generateWellbeingInsights();

    return (
      <div className="grid grid-cols-2 gap-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="relative p-4 rounded-2xl border border-gray-200"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{insight.icon}</span>
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-600">{insight.score}/100</span>
                <span className={`text-sm ${
                  insight.trend === 'up' ? 'text-green-500' : 
                  insight.trend === 'down' ? 'text-red-500' : 'text-gray-400'
                }`}>
                  {insight.trend === 'up' ? '↗' : insight.trend === 'down' ? '↘' : '→'}
                </span>
              </div>
            </div>
            
            <h4 className="font-semibold text-gray-800 mb-1">{insight.title}</h4>
            <p className="text-xs text-gray-600 mb-3">{insight.description}</p>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${insight.color} transition-all duration-700 ease-out`}
                style={{ width: `${insight.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPatternInsights = () => {
    if (!recentPatterns.length) return null;

    const avgMood = recentPatterns.reduce((sum, p) => sum + p.moodScore, 0) / recentPatterns.length;
    const avgActivity = recentPatterns.reduce((sum, p) => sum + p.activityLevel, 0) / recentPatterns.length;
    const avgSocial = recentPatterns.reduce((sum, p) => sum + p.socialInteraction, 0) / recentPatterns.length;

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span className="text-teal-600">🔍</span>
          Pattern Analysis
        </h3>
        
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Mood', value: avgMood, max: 100, color: 'bg-purple-500' },
            { label: 'Activity', value: avgActivity * 10, max: 100, color: 'bg-green-500' },
            { label: 'Social', value: avgSocial * 10, max: 100, color: 'bg-orange-500' }
          ].map((metric, index) => (
            <div key={index} className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-2">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={metric.color.replace('bg-', '#')}
                    strokeWidth="2"
                    strokeDasharray={`${metric.value}, 100`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-700">
                    {Math.round(metric.value)}
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-700">{metric.label}</p>
            </div>
          ))}
        </div>
        
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl p-4">
          <h4 className="font-semibold text-gray-800 mb-2">Weekly Summary</h4>
          <div className="text-sm text-gray-700 space-y-1">
            <p>• Your mood has been {avgMood > 70 ? 'consistently positive' : avgMood > 50 ? 'generally stable' : 'showing some challenges'}</p>
            <p>• Activity levels are {avgActivity > 7 ? 'excellent' : avgActivity > 5 ? 'good' : 'could use improvement'}</p>
            <p>• Social engagement appears {avgSocial > 6 ? 'very healthy' : avgSocial > 4 ? 'balanced' : 'somewhat limited'}</p>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="text-2xl">🧠</div>
            <div>Loading your Digital Self...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!behaviorSummary) {
    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center">
          <div className="text-4xl mb-4">🌱</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Your Digital Self Journey</h3>
          <p className="text-gray-600 text-sm mb-6">
            Enable behavior analytics to see insights about your digital wellbeing and mood patterns.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                behaviorPrivacyService.showPrivacySettings();
                onClose();
              }}
              className="w-full bg-teal-500 text-white py-3 rounded-2xl font-medium hover:bg-teal-600 transition-colors"
            >
              Enable Digital Self
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="text-3xl">🧠</span>
              Digital Self
            </h2>
            <p className="text-gray-600 text-sm">Your behavior patterns and digital wellbeing</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'patterns', label: 'Patterns', icon: '📈' },
            { id: 'insights', label: 'Insights', icon: '💡' },
            { id: 'settings', label: 'Settings', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {renderWellbeingCards()}
              {renderMoodChart()}
            </div>
          )}

          {activeTab === 'patterns' && renderPatternInsights()}

          {activeTab === 'insights' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-teal-600">💡</span>
                Personalized Insights
              </h3>
              
              <div className="space-y-4">
                {behaviorSummary.recommendations?.map((rec: string, index: number) => (
                  <div key={index} className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💡</span>
                      <p className="text-gray-700">{rec}</p>
                    </div>
                  </div>
                ))}
                
                {(!behaviorSummary.recommendations || behaviorSummary.recommendations.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-4">🌟</div>
                    <p>You're doing great! Keep up the positive patterns.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-teal-600">⚙️</span>
                Digital Self Settings
              </h3>
              
              <div className="space-y-4">
                {/* Enhanced Background Collection */}
                {!backgroundBehaviorService.isBackgroundEnabled() && (
                  <button
                    onClick={async () => {
                      const enabled = await backgroundBehaviorService.requestBackgroundPermissions();
                      if (enabled) {
                        window.location.reload(); // Refresh to show enhanced data
                      }
                    }}
                    className="w-full flex items-center justify-between p-4 border-2 border-teal-200 rounded-2xl hover:bg-teal-50 transition-colors bg-gradient-to-r from-teal-50 to-blue-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🌟</span>
                      <div className="text-left">
                        <h4 className="font-medium text-teal-800">Enable Enhanced Insights</h4>
                        <p className="text-sm text-teal-600">Unlock deeper patterns and comprehensive analysis</p>
                      </div>
                    </div>
                    <span className="text-teal-600">→</span>
                  </button>
                )}

                <button
                  onClick={() => behaviorPrivacyService.showPrivacySettings()}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🔒</span>
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900">Privacy Controls</h4>
                      <p className="text-sm text-gray-600">Manage your data and permissions</p>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>
                
                <button
                  onClick={() => {
                    if (confirm('This will clear all your Digital Self data. Are you sure?')) {
                      behaviorPrivacyService.withdrawConsent();
                      onClose();
                    }
                  }}
                  className="w-full flex items-center justify-between p-4 border border-red-200 rounded-2xl hover:bg-red-50 transition-colors text-red-700"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🗑️</span>
                    <div className="text-left">
                      <h4 className="font-medium">Reset Digital Self</h4>
                      <p className="text-sm opacity-80">Clear all behavior data and start over</p>
                    </div>
                  </div>
                  <span className="opacity-60">→</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DigitalSelf;