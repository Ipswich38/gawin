# DeepSeek R1 Integration Setup Guide

## Overview

This guide covers the integration of DeepSeek R1 AI model with Supabase authentication and database for the Gawin AI application. DeepSeek R1 is now used for:

- 🧮 **Calculator**: Mathematical reasoning and step-by-step problem solving
- 💻 **Coding Academy**: Code generation, explanations, and reviews  
- 🧠 **AI Academy**: AI concept explanations and interactive demonstrations

## Prerequisites

1. Node.js 18+ installed
2. Supabase project created
3. DeepSeek API key (get from [DeepSeek Platform](https://platform.deepseek.com))

## 1. Environment Variables Setup

Create or update your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://eqwpflmxgfsizvrwmame.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxd3BmbG14Z2ZzaXp2cndtYW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MzUyMjgsImV4cCI6MjA3MTIxMTIyOH0.AuP334DqWZvHHHCluBj54fJu5KDAFUc5Zs1T1PbGWuQ

# DeepSeek API Configuration
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

## 2. Database Schema Setup

Run the SQL script in your Supabase SQL Editor:

```sql
-- Execute the content of supabase-schema.sql
-- This creates all necessary tables, policies, and triggers
```

The schema includes:
- `profiles` - User profiles and preferences
- `conversations` - Chat history for all modules
- `usage_records` - API usage tracking
- `calculator_history` - Calculator-specific history
- `coding_projects` - Coding academy projects
- `ai_learning_progress` - AI academy progress tracking

## 3. Key Features Implemented

### DeepSeek R1 Service
- **Location**: `src/lib/services/deepseekService.ts`
- **Features**: 
  - Mathematical problem solving with step-by-step explanations
  - Code generation for multiple programming languages
  - AI concept explanations with examples and resources
  - General chat functionality for all modules

### API Integration
- **Endpoint**: `/api/deepseek`
- **Methods**: POST (chat), GET (health check)
- **Actions**: `solve_math`, `generate_code`, `explain_ai`, `chat`

### Updated Components

#### Calculator (`src/app/tutor/calculator/page.tsx`)
- Replaced Groq API with DeepSeek R1
- Enhanced mathematical analysis and step-by-step solutions
- Better integration with structured responses

#### Coding Academy (`src/components/CodingBootcamp.tsx`)
- DeepSeek R1 for code challenge generation
- Code review functionality
- Support for multiple programming languages

#### AI Academy (`src/components/AIAcademy.tsx`)
- AI concept explanations using DeepSeek R1
- Interactive demonstrations and examples
- Structured learning paths

## 4. Usage Examples

### Calculator API Call
```javascript
const response = await fetch('/api/deepseek', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'system', content: 'You are a mathematical reasoning AI...' },
      { role: 'user', content: 'Solve: 2x + 5 = 13' }
    ],
    module: 'calculator',
    action: 'solve_math',
    metadata: { expression: '2x + 5 = 13' }
  })
});
```

### Coding Academy API Call
```javascript
const response = await fetch('/api/deepseek', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'system', content: 'You are an expert coding instructor...' },
      { role: 'user', content: 'Create a Python function to sort a list' }
    ],
    module: 'coding_academy',
    action: 'generate_code',
    metadata: { problem: 'List sorting', language: 'python', difficulty: 'beginner' }
  })
});
```

### AI Academy API Call
```javascript
const response = await fetch('/api/deepseek', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'system', content: 'You are an AI education specialist...' },
      { role: 'user', content: 'Explain machine learning' }
    ],
    module: 'ai_academy',
    action: 'explain_ai',
    metadata: { concept: 'machine learning', level: 'beginner' }
  })
});
```

## 5. Database Operations

### User Authentication
```javascript
// Sign up
const { user, error } = await databaseService.signUp(email, password, fullName);

// Sign in
const { user, error } = await databaseService.signIn(email, password);

// Get current user
const user = await databaseService.getCurrentUser();
```

### Usage Tracking
```javascript
// Record usage
await databaseService.recordUsage(
  userId, 
  'chat', 
  1, // credits used
  { module: 'calculator', tokens_used: 150 }
);
```

### Conversation History
```javascript
// Save conversation
const { id, error } = await databaseService.saveConversation({
  user_id: userId,
  title: 'Math Problem Solving',
  messages: conversationMessages,
  is_archived: false,
  tags: ['math', 'algebra']
});
```

## 6. Security Features

- Input validation and sanitization
- Row Level Security (RLS) policies in Supabase
- Content validation for AI responses
- Secure API key management
- XSS protection with SafeHTML component

## 7. Performance Optimization

- DeepSeek R1 is 96% cheaper than competing models
- Efficient token usage with structured prompts
- Local storage fallback when database is unavailable
- Response caching where appropriate

## 8. Error Handling

- Graceful fallbacks for API failures
- User-friendly error messages
- Comprehensive logging for debugging
- Health check endpoints for monitoring

## 9. Testing the Implementation

1. Start the development server:
```bash
npm run dev
```

2. Navigate to `http://localhost:3000` (or the assigned port)

3. Test each module:
   - Calculator: Try mathematical expressions and AI analysis
   - Coding Academy: Generate code challenges and reviews
   - AI Academy: Explore AI concept explanations

## 10. Deployment Considerations

- Set environment variables in your hosting platform
- Ensure Supabase project is properly configured
- Verify DeepSeek API key is valid and has sufficient credits
- Test all endpoints in production environment

## 11. Monitoring and Maintenance

- Monitor DeepSeek API usage through their dashboard
- Track user engagement through Supabase analytics
- Regular database maintenance and backups
- Keep dependencies updated for security

## Troubleshooting

### Common Issues

1. **DeepSeek API not responding**: Check API key and network connectivity
2. **Database connection issues**: Verify Supabase credentials and project status
3. **Component not loading**: Check console for JavaScript errors
4. **Authentication problems**: Verify Supabase RLS policies are correctly set

### Support Resources

- [DeepSeek Documentation](https://platform.deepseek.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Note**: Remember to never commit API keys to version control. Use environment variables for all sensitive configuration.