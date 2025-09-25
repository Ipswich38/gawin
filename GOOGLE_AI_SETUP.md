# Google AI Studio (Gemini) Integration Setup

## Overview
Gawin now supports Google AI Studio's Gemini models alongside existing providers like Groq, DeepSeek, and Perplexity. This integration provides access to Google's most advanced AI models with Filipino-aware conversation capabilities.

## Setup Instructions

### 1. Get Your Google AI API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click on "Get API key" in the left sidebar
4. Create a new API key or use an existing one
5. Copy your API key

### 2. Add API Key to Environment Variables

Add your Google AI API key to your `.env.local` file:

```bash
# Google AI Studio API Key
GOOGLE_AI_API_KEY=your_api_key_here
```

**Note**: Never commit your API key to version control. The `.env.local` file should already be in your `.gitignore`.

### 3. Available Models

The integration supports these Gemini models:

- **gemini-1.5-flash** (Default) - Fast, efficient model for conversations
- **gemini-1.5-pro** - Most capable model with advanced reasoning
- **gemini-1.0-pro** - Stable, reliable model

## Features

### Filipino-Aware AI
- Natural Taglish conversation support
- Cultural context understanding
- Filipino expressions and idioms
- Emotional intelligence tuned for Filipino communication patterns

### API Endpoints

#### GET /api/gemini
Returns service information and available models.

```bash
curl http://localhost:3000/api/gemini
```

#### POST /api/gemini
Send chat completion requests.

```bash
curl -X POST http://localhost:3000/api/gemini \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Kumusta ka?"}
    ],
    "model": "gemini-1.5-flash",
    "temperature": 0.7,
    "maxTokens": 2048
  }'
```

### Service Usage

```typescript
import { geminiService } from '@/lib/services/geminiService';

// Simple message
const response = await geminiService.sendMessage('Hello!');

// Filipino-contextual response
const filipinoResponse = await geminiService.generateFilipinoResponse(
  'Kumusta ang araw mo?',
  conversationHistory,
  'happy'
);

// Continue conversation
const reply = await geminiService.continueConversation(
  messages,
  'What do you think?',
  { model: 'gemini-1.5-pro' }
);
```

### AI Provider Selector

The chat interface now includes an AI provider selector that allows switching between:

- **Groq** ⚡ - Ultra-fast Llama models
- **Gemini** 🧠 - Google's most capable AI
- **DeepSeek** 🔬 - Advanced reasoning capabilities
- **Perplexity** 🔍 - AI with real-time web search

## Usage Tips

### For Best Results with Filipino Content:
1. Use `gemini-1.5-pro` for complex Filipino cultural discussions
2. Use `gemini-1.5-flash` for quick Taglish conversations
3. Higher temperature (0.8-0.9) for more natural Filipino expressions
4. Include cultural context in your conversations

### Cost Optimization:
- Start with `gemini-1.5-flash` for most conversations
- Use `gemini-1.5-pro` only when you need advanced reasoning
- Monitor your usage in Google AI Studio console

## Error Handling

The integration provides helpful error messages:

- **Missing API Key**: Instructions to add GOOGLE_AI_API_KEY
- **Quota Exceeded**: Guidance on usage limits
- **Content Filtered**: Information about safety settings

## Troubleshooting

### Common Issues:

1. **"Google AI API key not configured"**
   - Add GOOGLE_AI_API_KEY to your .env.local file
   - Restart your development server

2. **"Invalid API key"**
   - Verify your API key in Google AI Studio
   - Check for extra spaces or characters

3. **"Quota exceeded"**
   - Check your usage in Google AI Studio
   - Consider upgrading your plan or wait for quota reset

4. **Slow responses**
   - Try using `gemini-1.5-flash` instead of Pro
   - Reduce maxTokens for shorter responses

## Security Notes

- API keys are processed server-side only
- No API keys are sent to the client
- All requests are authenticated through your environment variables
- Follow Google AI's usage policies and guidelines

## Support

For issues specific to:
- **Gawin Integration**: Create an issue in this repository
- **Google AI API**: Check [Google AI Studio documentation](https://ai.google.dev/docs)
- **Usage Questions**: Refer to the Google AI pricing and usage guidelines