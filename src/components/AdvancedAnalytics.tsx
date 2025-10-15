'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Zap,
  Clock,
  DollarSign,
  Activity,
  Globe,
  Cpu,
  Database,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { ModernCard, ModernButton, ModernBadge } from './ui/ModernUI';

// Analytics Data Types
interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  format: 'number' | 'currency' | 'percentage' | 'duration';
  trend: number[];
  target?: number;
}

interface UsageData {
  timestamp: string;
  totalExecutions: number;
  uniqueUsers: number;
  creditsUsed: number;
  avgResponseTime: number;
  errorRate: number;
  successRate: number;
}

interface ModelPerformance {
  modelId: string;
  name: string;
  usage: number;
  avgResponseTime: number;
  successRate: number;
  cost: number;
  trend: 'up' | 'down' | 'stable';
}

interface UserSegment {
  segment: string;
  count: number;
  revenue: number;
  engagement: number;
  growth: number;
}

// Mock Data Generator (replace with real API calls)
const generateMockData = (): {
  metrics: AnalyticsMetric[];
  usageData: UsageData[];
  modelPerformance: ModelPerformance[];
  userSegments: UserSegment[];
} => {
  const now = new Date();
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  return {
    metrics: [
      {
        id: 'total_users',
        name: 'Total Users',
        value: 15420,
        previousValue: 14230,
        change: 8.4,
        changeType: 'increase',
        format: 'number',
        trend: [12000, 12500, 13000, 13800, 14230, 15420],
        target: 20000
      },
      {
        id: 'monthly_revenue',
        name: 'Monthly Revenue',
        value: 284750,
        previousValue: 245200,
        change: 16.1,
        changeType: 'increase',
        format: 'currency',
        trend: [180000, 200000, 220000, 235000, 245200, 284750],
        target: 300000
      },
      {
        id: 'workflow_executions',
        name: 'Workflow Executions',
        value: 89432,
        previousValue: 76890,
        change: 16.3,
        changeType: 'increase',
        format: 'number',
        trend: [65000, 68000, 72000, 74500, 76890, 89432]
      },
      {
        id: 'avg_response_time',
        name: 'Avg Response Time',
        value: 1.2,
        previousValue: 1.8,
        change: -33.3,
        changeType: 'increase',
        format: 'duration',
        trend: [2.1, 1.9, 1.7, 1.6, 1.8, 1.2]
      },
      {
        id: 'success_rate',
        name: 'Success Rate',
        value: 99.2,
        previousValue: 98.7,
        change: 0.5,
        changeType: 'increase',
        format: 'percentage',
        trend: [98.1, 98.3, 98.5, 98.8, 98.7, 99.2],
        target: 99.5
      },
      {
        id: 'customer_satisfaction',
        name: 'Customer Satisfaction',
        value: 4.8,
        previousValue: 4.6,
        change: 4.3,
        changeType: 'increase',
        format: 'number',
        trend: [4.3, 4.4, 4.5, 4.6, 4.6, 4.8],
        target: 4.9
      }
    ],
    usageData: last30Days.map((date, index) => ({
      timestamp: date,
      totalExecutions: Math.floor(2800 + Math.random() * 600 + index * 15),
      uniqueUsers: Math.floor(450 + Math.random() * 100 + index * 5),
      creditsUsed: Math.floor(8500 + Math.random() * 2000 + index * 50),
      avgResponseTime: 1.0 + Math.random() * 1.5,
      errorRate: Math.random() * 2,
      successRate: 97 + Math.random() * 3
    })),
    modelPerformance: [
      {
        modelId: 'gpt-4o',
        name: 'GPT-4o',
        usage: 45.2,
        avgResponseTime: 2.3,
        successRate: 99.8,
        cost: 125.40,
        trend: 'up'
      },
      {
        modelId: 'gemini-2.0-flash-exp',
        name: 'Gemini 2.0 Flash',
        usage: 28.7,
        avgResponseTime: 1.8,
        successRate: 99.5,
        cost: 67.20,
        trend: 'up'
      },
      {
        modelId: 'o1-preview',
        name: 'o1-preview',
        usage: 15.3,
        avgResponseTime: 15.2,
        successRate: 99.9,
        cost: 89.30,
        trend: 'stable'
      },
      {
        modelId: 'llama-3.1-8b-instant',
        name: 'Llama 3.1 8B',
        usage: 10.8,
        avgResponseTime: 0.8,
        successRate: 99.2,
        cost: 23.10,
        trend: 'down'
      }
    ],
    userSegments: [
      { segment: 'Free', count: 12840, revenue: 0, engagement: 3.2, growth: 12.5 },
      { segment: 'Pro', count: 2180, revenue: 189750, engagement: 8.7, growth: 18.3 },
      { segment: 'Enterprise', count: 400, revenue: 95000, engagement: 15.2, growth: 22.1 }
    ]
  };
};

// Main Analytics Dashboard Component
const AdvancedAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Generate data (replace with real API calls)
  const data = useMemo(() => generateMockData(), []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const formatValue = (value: number, format: string): string => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'duration':
        return `${value.toFixed(1)}s`;
      default:
        return new Intl.NumberFormat('en-US').format(value);
    }
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'decrease':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getMetricIcon = (metricId: string) => {
    switch (metricId) {
      case 'total_users':
        return <Users className="w-6 h-6 text-blue-600" />;
      case 'monthly_revenue':
        return <DollarSign className="w-6 h-6 text-green-600" />;
      case 'workflow_executions':
        return <Zap className="w-6 h-6 text-purple-600" />;
      case 'avg_response_time':
        return <Clock className="w-6 h-6 text-orange-600" />;
      case 'success_rate':
        return <CheckCircle className="w-6 h-6 text-emerald-600" />;
      case 'customer_satisfaction':
        return <Activity className="w-6 h-6 text-pink-600" />;
      default:
        return <BarChart3 className="w-6 h-6 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time insights into your AI agent platform performance
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <ModernButton
                key={range}
                variant={timeRange === range ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range}
              </ModernButton>
            ))}
          </div>

          {/* Actions */}
          <ModernButton
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            loading={isRefreshing}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </ModernButton>

          <ModernButton
            variant="outline"
            size="sm"
            icon={<Download className="w-4 h-4" />}
          >
            Export
          </ModernButton>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.metrics.map((metric) => (
          <motion.div
            key={metric.id}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <ModernCard
              variant="elevated"
              className="cursor-pointer"
              onClick={() => setSelectedMetric(metric.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getMetricIcon(metric.id)}
                  <div>
                    <h3 className="font-semibold text-gray-900">{metric.name}</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatValue(metric.value, metric.format)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Change Indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getChangeIcon(metric.changeType)}
                  <span className={`text-sm font-medium ${
                    metric.changeType === 'increase' ? 'text-green-600' :
                    metric.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                  </span>
                </div>

                {/* Progress to Target */}
                {metric.target && (
                  <ModernBadge
                    variant={metric.value >= metric.target ? 'success' : 'warning'}
                    size="sm"
                  >
                    {((metric.value / metric.target) * 100).toFixed(0)}% of target
                  </ModernBadge>
                )}
              </div>

              {/* Mini Trend Chart */}
              <div className="mt-4">
                <svg width="100%" height="40" className="overflow-visible">
                  <polyline
                    points={metric.trend.map((value, index) =>
                      `${(index / (metric.trend.length - 1)) * 100},${40 - (value / Math.max(...metric.trend)) * 30}`
                    ).join(' ')}
                    fill="none"
                    stroke={metric.changeType === 'increase' ? '#10b981' : '#ef4444'}
                    strokeWidth="2"
                    className="drop-shadow-sm"
                  />
                </svg>
              </div>
            </ModernCard>
          </motion.div>
        ))}
      </div>

      {/* Model Performance */}
      <ModernCard variant="elevated">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            AI Model Performance
          </h2>
          <p className="text-gray-600">
            Usage statistics and performance metrics for deployed models
          </p>
        </div>

        <div className="space-y-4">
          {data.modelPerformance.map((model) => (
            <div
              key={model.modelId}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{model.name}</h3>
                  <p className="text-sm text-gray-600">
                    {model.usage}% usage • {model.avgResponseTime}s avg response
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {model.successRate}% success rate
                  </p>
                  <p className="text-sm text-gray-600">
                    ${model.cost.toFixed(2)} cost
                  </p>
                </div>

                <ModernBadge
                  variant={
                    model.trend === 'up' ? 'success' :
                    model.trend === 'down' ? 'warning' : 'default'
                  }
                  size="sm"
                >
                  {model.trend === 'up' ? '↗' : model.trend === 'down' ? '↘' : '→'} {model.trend}
                </ModernBadge>
              </div>
            </div>
          ))}
        </div>
      </ModernCard>

      {/* User Segments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ModernCard variant="elevated">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              User Segments
            </h2>
            <p className="text-gray-600">
              Breakdown by subscription tier and engagement
            </p>
          </div>

          <div className="space-y-4">
            {data.userSegments.map((segment) => (
              <div key={segment.segment} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full ${
                    segment.segment === 'Free' ? 'bg-gray-400' :
                    segment.segment === 'Pro' ? 'bg-blue-500' : 'bg-purple-600'
                  }`} />
                  <div>
                    <h3 className="font-medium text-gray-900">{segment.segment}</h3>
                    <p className="text-sm text-gray-600">
                      {segment.count.toLocaleString()} users
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatValue(segment.revenue, 'currency')}
                  </p>
                  <p className="text-sm text-green-600">
                    +{segment.growth}% growth
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ModernCard>

        {/* System Health */}
        <ModernCard variant="elevated">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              System Health
            </h2>
            <p className="text-gray-600">
              Real-time platform status and alerts
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">API Services</span>
              </div>
              <ModernBadge variant="success" size="sm">Healthy</ModernBadge>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Database</span>
              </div>
              <ModernBadge variant="success" size="sm">Healthy</ModernBadge>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-900">AI Models</span>
              </div>
              <ModernBadge variant="warning" size="sm">Degraded</ModernBadge>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">File Storage</span>
              </div>
              <ModernBadge variant="success" size="sm">Healthy</ModernBadge>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Real-time Activity Feed */}
      <ModernCard variant="elevated">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Real-time Activity
          </h2>
          <p className="text-gray-600">
            Live feed of platform events and user activities
          </p>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  User executed workflow "Content Generation Pipeline"
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(Date.now() - i * 60000).toLocaleTimeString()}
                </p>
              </div>
              <ModernBadge variant="default" size="sm">Workflow</ModernBadge>
            </div>
          ))}
        </div>
      </ModernCard>
    </div>
  );
};

export default AdvancedAnalytics;