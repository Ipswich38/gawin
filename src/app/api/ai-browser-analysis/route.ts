import { NextRequest, NextResponse } from 'next/server';
import { groqService } from '@/lib/services/groqService';

export async function POST(request: NextRequest) {
  try {
    const { screenshot, query, pageData, previousActions, goal } = await request.json();
    
    if (!screenshot) {
      return NextResponse.json({ error: 'Screenshot is required' }, { status: 400 });
    }
    
    // Analyze the screenshot and determine next actions
    const analysis = await analyzeScreenshotForBrowsing({
      screenshot,
      query,
      pageData,
      previousActions: previousActions || [],
      goal: goal || 'browse and find information'
    });
    
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('AI Browser Analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}

interface BrowsingContext {
  screenshot: string; // base64 image
  query?: string;
  pageData?: any;
  previousActions: BrowserAction[];
  goal: string;
}

interface BrowserAction {
  type: 'navigate' | 'scroll' | 'click' | 'type' | 'search' | 'analyze';
  target?: string;
  coordinates?: { x: number; y: number };
  text?: string;
  result?: string;
  timestamp: number;
}

interface AnalysisResult {
  understanding: string;
  nextActions: BrowserAction[];
  confidence: number;
  reasoning: string;
  foundAnswer?: boolean;
  extractedInfo?: string;
  shouldStop: boolean;
}

async function analyzeScreenshotForBrowsing(context: BrowsingContext): Promise<AnalysisResult> {
  const { screenshot, query, pageData, previousActions, goal } = context;
  
  // Create a comprehensive prompt for AI analysis
  const analysisPrompt = `You are an expert web browsing AI assistant. Analyze the provided screenshot and determine the best next actions to help the user achieve their browsing goal.

CONTEXT:
- User Goal: ${goal}
- Specific Query: ${query || 'General browsing'}
- Previous Actions: ${previousActions.map(a => `${a.type}${a.text ? ': ' + a.text : ''}`).join(' → ')}

CURRENT PAGE INFO:
${pageData ? `
- URL: ${pageData.url || 'Unknown'}
- Title: ${pageData.title || 'Unknown'}
- Main Headings: ${pageData.headings?.map((h: any) => h.text).join(', ') || 'None detected'}
- Available Links: ${pageData.links?.map((l: any) => l.text).slice(0, 10).join(', ') || 'None detected'}
- Forms Present: ${pageData.forms?.length > 0 ? 'Yes' : 'No'}
` : 'Page data not available'}

INSTRUCTIONS:
1. Analyze the screenshot to understand what's currently visible
2. Determine if the current page contains the answer to the user's query
3. If answer found, extract it. If not, plan the next logical browsing steps
4. Consider scrolling to see more content, clicking relevant links, or using search functionality
5. Prioritize efficiency - don't take unnecessary actions

Respond with a JSON object containing:
{
  "understanding": "Brief description of what you see on the page",
  "nextActions": [
    {
      "type": "scroll|click|type|search|navigate|analyze",
      "reasoning": "Why this action is needed",
      "target": "CSS selector or description of target element",
      "coordinates": {"x": 100, "y": 200}, // if clicking by coordinates
      "text": "text to type", // if typing
      "priority": 1-3 // 1 = highest priority
    }
  ],
  "confidence": 0.85, // 0-1 scale
  "reasoning": "Detailed explanation of analysis and action plan",
  "foundAnswer": false, // true if query is answered on current page
  "extractedInfo": "relevant information found", // if foundAnswer is true
  "shouldStop": false // true if goal is achieved or no more actions needed
}

Be concise but thorough. Focus on actions that move toward the goal efficiently.`;

  try {
    // Send screenshot and prompt to AI for analysis
    const response = await groqService.createChatCompletion({
      messages: [
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      action: 'analysis',
      temperature: 0.1,
      max_tokens: 2000
    });

    // Parse AI response
    let analysisResult: AnalysisResult;
    try {
      const responseContent = response.choices?.[0]?.message?.content || '';
      const cleanedResponse = responseContent.replace(/```json\s*|\s*```/g, '').trim();
      analysisResult = JSON.parse(cleanedResponse);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      analysisResult = {
        understanding: "Could not parse AI response properly",
        nextActions: [{
          type: 'analyze',
          target: 'page',
          timestamp: Date.now()
        }],
        confidence: 0.3,
        reasoning: "AI response parsing failed, using fallback actions",
        foundAnswer: false,
        shouldStop: false
      };
    }

    // Add timestamps to actions
    analysisResult.nextActions = analysisResult.nextActions.map(action => ({
      ...action,
      timestamp: Date.now()
    }));

    // Validate and sanitize the result
    return validateAnalysisResult(analysisResult);
    
  } catch (error) {
    console.error('AI analysis error:', error);
    
    // Return fallback analysis
    return {
      understanding: "Analysis failed, providing fallback actions",
      nextActions: [{
        type: 'scroll',
        target: 'page',
        coordinates: { x: 640, y: 360 },
        timestamp: Date.now()
      }],
      confidence: 0.2,
      reasoning: "AI analysis failed, using basic fallback strategy",
      foundAnswer: false,
      shouldStop: false
    };
  }
}

function validateAnalysisResult(result: any): AnalysisResult {
  // Ensure required fields exist with defaults
  return {
    understanding: result.understanding || "Page analysis completed",
    nextActions: Array.isArray(result.nextActions) ? result.nextActions.slice(0, 3) : [], // Limit to 3 actions
    confidence: Math.min(Math.max(result.confidence || 0.5, 0), 1), // Clamp between 0-1
    reasoning: result.reasoning || "Standard browsing analysis",
    foundAnswer: Boolean(result.foundAnswer),
    extractedInfo: result.extractedInfo || undefined,
    shouldStop: Boolean(result.shouldStop)
  };
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    message: 'AI Browser Analysis API',
    status: 'active',
    capabilities: [
      'Screenshot analysis',
      'Action planning',
      'Information extraction',
      'Goal-oriented browsing'
    ],
    supportedActions: [
      'navigate', 'scroll', 'click', 'type', 'search', 'analyze'
    ]
  });
}