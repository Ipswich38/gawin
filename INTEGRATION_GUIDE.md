# 🔗 Gawin AI Orchestrator Integration Guide

This guide explains how to integrate the production-ready AI orchestrator architecture into your existing Gawin app.

## 📋 Integration Overview

The AI orchestrator provides a comprehensive backend system that enhances your existing Gawin app with:

- **Intelligent AI routing** - Route queries to optimal models
- **Advanced safety systems** - Crisis detection and content moderation  
- **Real-time analytics** - User behavior and interaction insights
- **Production scalability** - Docker deployment and monitoring
- **Mental health support** - Specialized safety and crisis workflows

## 🚀 Quick Integration Steps

### 1. Backend Setup (5 minutes)

```bash
# Navigate to your Gawin project
cd gawin

# The backend directory has been created with full architecture
cd backend

# Copy and configure environment
cp .env.example .env
# Edit .env with your API keys and database settings

# Start the orchestrator
docker-compose up --build -d
```

### 2. Frontend Integration (2 minutes)

The frontend integration is already prepared. Update your existing components:

```typescript
// Replace existing groq/deepseek calls with orchestrator
import { useOrchestrator } from '@/lib/hooks/useOrchestrator';

export default function ChatComponent() {
  const { query, loading, error } = useOrchestrator();
  
  const handleSubmit = async (message: string) => {
    try {
      const response = await query({
        text: message,
        priority: 'normal',
        consent_to_train: true
      });
      
      // Use response.response for the AI response
      console.log('AI Response:', response.response);
      console.log('Model Used:', response.model);
      console.log('Confidence:', response.confidence);
      
    } catch (error) {
      // Handle safety errors, rate limits, etc.
      console.error('Query failed:', error);
    }
  };
}
```

### 3. Environment Variables

Add these to your `.env.local` (frontend):

```bash
# Point to orchestrator backend
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api

# Enable orchestrator features
NEXT_PUBLIC_ENABLE_ORCHESTRATOR=true
NEXT_PUBLIC_ENABLE_SAFETY_CHECKS=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## 🔄 Migration from Existing API Calls

### Before (Direct API Calls)
```typescript
// Old groq service call
const response = await groqService.createChatCompletion({
  messages: [{ role: 'user', content: message }],
  model: 'llama3-70b-8192'
});
```

### After (Orchestrator Integration)
```typescript
// New orchestrator call with intelligent routing
const response = await orchestratorService.query({
  text: message,
  context: { subject: 'mathematics', grade: 'college' },
  priority: 'normal'
});

// The orchestrator automatically:
// - Selects the best model for the query
// - Applies safety checks
// - Provides caching and analytics
// - Handles fallbacks if primary model fails
```

## 🛠️ Available Integration Patterns

### 1. Simple Drop-in Replacement

Replace existing AI service calls:

```typescript
// hooks/useAI.ts
import { useSimpleQuery } from '@/lib/hooks/useOrchestrator';

export function useAI() {
  const { query, loading, error } = useSimpleQuery();
  
  return {
    askAI: query,
    isLoading: loading,
    error
  };
}
```

### 2. Advanced Feature Integration

Leverage orchestrator's advanced features:

```typescript
// hooks/useAdvancedAI.ts
import { useOrchestrator } from '@/lib/hooks/useOrchestrator';

export function useAdvancedAI() {
  const { 
    query, 
    submitFeedback, 
    analytics, 
    profile,
    updateProfile 
  } = useOrchestrator();
  
  return {
    // Enhanced query with context
    askAI: async (message: string, context?: any) => {
      return await query({
        text: message,
        context,
        priority: context?.urgent ? 'high' : 'normal'
      });
    },
    
    // User feedback for model improvement
    ratResponse: submitFeedback,
    
    // Usage analytics
    getUserStats: () => analytics,
    
    // User preferences
    updateUserPrefs: updateProfile
  };
}
```

### 3. Safety-First Integration

For mental health sensitive applications:

```typescript
// hooks/useSafeAI.ts
import { useSafetyAwareQuery } from '@/lib/hooks/useOrchestrator';

export function useSafeAI() {
  const { 
    query, 
    loading, 
    error, 
    safetyWarning 
  } = useSafetyAwareQuery();
  
  return {
    askAI: query,
    isLoading: loading,
    error,
    safetyWarning, // Display crisis resources if needed
    
    // Always check safety first
    isQuerySafe: async (message: string) => {
      const result = await query(message);
      return !result.safetyIssue;
    }
  };
}
```

## 📊 Component Integration Examples

### Chat Component with Orchestrator

```typescript
'use client';

import { useState } from 'react';
import { useOrchestrator } from '@/lib/hooks/useOrchestrator';

export default function EnhancedChatComponent() {
  const [messages, setMessages] = useState([]);
  const { query, loading, submitFeedback } = useOrchestrator();
  
  const sendMessage = async (text: string) => {
    try {
      const response = await query({
        text,
        context: {
          conversationHistory: messages.slice(-5), // Last 5 messages for context
          subject: detectSubject(text),
          deviceType: 'desktop'
        },
        priority: 'normal',
        consent_to_train: true
      });
      
      setMessages(prev => [...prev, 
        { role: 'user', content: text },
        { 
          role: 'assistant', 
          content: response.response,
          metadata: {
            model: response.model,
            confidence: response.confidence,
            requestId: response.metadata.requestId
          }
        }
      ]);
      
    } catch (error) {
      console.error('Chat error:', error);
      // Handle safety errors, show crisis resources, etc.
    }
  };
  
  const handleFeedback = async (messageIndex: number, rating: number) => {
    const message = messages[messageIndex];
    if (message.metadata?.requestId) {
      await submitFeedback(message.metadata.requestId, rating);
    }
  };
  
  // ... rest of component
}
```

### Analytics Dashboard

```typescript
'use client';

import { useOrchestrator } from '@/lib/hooks/useOrchestrator';

export default function AnalyticsDashboard() {
  const { analytics, refreshAnalytics } = useOrchestrator();
  
  return (
    <div>
      <h2>Your AI Usage Stats</h2>
      
      {analytics && (
        <div className="grid grid-cols-2 gap-4">
          <div className="stat-card">
            <h3>Total Queries</h3>
            <p>{analytics.totalQueries}</p>
          </div>
          
          <div className="stat-card">
            <h3>Success Rate</h3>
            <p>{(analytics.successRate * 100).toFixed(1)}%</p>
          </div>
          
          <div className="stat-card">
            <h3>Favorite Model</h3>
            <p>{analytics.preferredModels[0]?.model || 'N/A'}</p>
          </div>
          
          <div className="stat-card">
            <h3>Avg Response Time</h3>
            <p>{analytics.averageLatency}ms</p>
          </div>
        </div>
      )}
      
      <button onClick={() => refreshAnalytics('30d')}>
        Refresh Stats
      </button>
    </div>
  );
}
```

## 🔧 Configuration Options

### Frontend Configuration

```typescript
// lib/config/orchestrator.ts
export const orchestratorConfig = {
  // API endpoints
  baseUrl: process.env.NEXT_PUBLIC_ORCHESTRATOR_URL || 'http://localhost:3001/api',
  
  // Default query settings
  defaultQuery: {
    temperature: 0.7,
    maxTokens: 2048,
    priority: 'normal' as const,
    consentToTrain: true
  },
  
  // Safety settings
  safety: {
    enableCrisisDetection: true,
    enableContentModeration: true,
    enableMentalHealthSupport: true
  },
  
  // Analytics settings
  analytics: {
    enableTracking: true,
    enableLocalStorage: true,
    maxHistoryItems: 100
  }
};
```

### Backend Configuration

```bash
# backend/.env
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/gawin_ai
REDIS_URL=redis://localhost:6379

# AI Services (add your keys)
OPENAI_API_KEY=your-key-here
GROQ_API_KEY=your-key-here

# Safety
CRISIS_DETECTION_ENABLED=true
HUMAN_ESCALATION_ENABLED=true
CRISIS_HELPLINE_PHONE=988

# Features
ENABLE_CANARY_ROUTING=true
ENABLE_A_B_TESTING=false
ENABLE_FINE_TUNING=false
```

## 🚀 Deployment Integration

### Development Setup

```bash
# Start backend services
cd backend
docker-compose up -d

# Start frontend (existing process)
cd ..
npm run dev
```

Your app now runs with:
- Frontend: `http://localhost:3000` (your existing app)
- Orchestrator: `http://localhost:3001` (new AI backend)
- Monitoring: `http://localhost:3000/grafana` (analytics dashboard)

### Production Deployment

```bash
# Deploy everything together
docker-compose -f backend/docker-compose.yml up --build -d

# Frontend deployment (your existing process)
npm run build
npm run start
```

## 📈 Monitoring Integration

### Health Checks

```typescript
// components/SystemStatus.tsx
import { useOrchestrator } from '@/lib/hooks/useOrchestrator';

export function SystemStatus() {
  const { systemHealth } = useOrchestrator();
  
  return (
    <div className="system-status">
      <div className={`status ${systemHealth?.status || 'unknown'}`}>
        AI System: {systemHealth?.status || 'Unknown'}
      </div>
      
      {systemHealth?.services && (
        <div className="services">
          {Object.entries(systemHealth.services).map(([service, status]) => (
            <div key={service} className={`service ${status.status}`}>
              {service}: {status.status}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Performance Metrics

The orchestrator automatically tracks:
- Response times per model
- User satisfaction ratings
- Safety incident counts
- Token usage and costs
- Model performance comparisons

Access via the `analytics` object in `useOrchestrator()`.

## 🛡️ Safety Integration

### Crisis Detection

```typescript
// components/SafetyWrapper.tsx
import { useSafetyAwareQuery } from '@/lib/hooks/useOrchestrator';

export function SafetyWrapper({ children }) {
  const { safetyWarning } = useSafetyAwareQuery();
  
  if (safetyWarning) {
    return (
      <div className="safety-alert">
        <h3>🚨 Safety Alert</h3>
        <p>{safetyWarning}</p>
        
        <div className="crisis-resources">
          <h4>Immediate Help:</h4>
          <p>🇺🇸 Call 988 - Suicide & Crisis Lifeline</p>
          <p>🇵🇭 Call 1553 - Hopeline Philippines</p>
          <p>Emergency: Call your local emergency services</p>
        </div>
        
        <button onClick={() => /* clear warning */}>
          Continue Safely
        </button>
      </div>
    );
  }
  
  return children;
}
```

## 📱 Mobile Integration

The orchestrator works seamlessly with your existing mobile-responsive design:

```typescript
// hooks/useMobileOrchestrator.ts
import { useOrchestrator } from '@/lib/hooks/useOrchestrator';

export function useMobileOrchestrator() {
  const orchestrator = useOrchestrator();
  
  return {
    ...orchestrator,
    
    // Mobile-optimized query
    askAI: async (text: string) => {
      return await orchestrator.query({
        text,
        priority: 'normal',
        max_tokens: 1024, // Shorter responses for mobile
        session_metadata: {
          deviceType: 'mobile',
          networkType: navigator.connection?.effectiveType
        }
      });
    }
  };
}
```

## ✅ Integration Checklist

- [ ] Backend services running (`docker-compose up -d`)
- [ ] Environment variables configured
- [ ] Frontend hooks imported and used
- [ ] Safety components integrated
- [ ] Analytics dashboard accessible
- [ ] Crisis detection tested
- [ ] Performance monitoring active
- [ ] Database initialized
- [ ] API keys configured
- [ ] Health checks passing

## 🆘 Troubleshooting

### Common Issues

**Backend not starting:**
```bash
# Check logs
docker-compose logs api

# Common fixes
npm run type-check  # Fix TypeScript errors
docker-compose down && docker-compose up --build -d
```

**Frontend can't connect:**
```bash
# Check environment variables
echo $NEXT_PUBLIC_API_BASE_URL

# Verify backend health
curl http://localhost:3001/health
```

**Database connection errors:**
```bash
# Reset database
docker-compose down -v
docker-compose up -d postgres
# Wait 30 seconds, then:
docker-compose up -d api
```

### Performance Issues

1. **Slow responses**: Check model selection and caching
2. **High memory usage**: Review vector database size
3. **Rate limiting**: Adjust rate limits in configuration
4. **Database slow**: Check query indexes and connection pooling

## 🔗 Next Steps

1. **Test the Integration**: Send a few queries through the new orchestrator
2. **Monitor Performance**: Check the Grafana dashboard at `localhost:3000`
3. **Configure Safety**: Review crisis detection settings
4. **Customize Models**: Add your preferred AI models to the routing logic
5. **Scale Up**: Use the production Docker deployment for higher loads

Your Gawin app is now powered by a production-ready AI orchestrator with intelligent routing, comprehensive safety systems, and enterprise-grade monitoring! 🚀

## 📞 Support

- 📧 Integration help: support@gawin.ai
- 📖 Full docs: [backend/README.md](backend/README.md)
- 🐛 Issues: GitHub Issues
- 💬 Community: Discord Server

---

**🎉 Congratulations!** Your Gawin app now has enterprise-grade AI orchestration with intelligent routing, safety systems, and production monitoring.