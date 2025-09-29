import { NextRequest, NextResponse } from 'next/server';

interface PlanStep {
  id: string;
  title: string;
  description: string;
  status: 'pending';
  estimatedTime: string;
  dependencies?: string[];
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 GAP Planner request received');

    const body = await request.json();
    const { objective } = body;

    console.log('📝 Planning objective:', objective);

    if (!objective || typeof objective !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Objective is required'
      }, { status: 400 });
    }

    // Check for Groq API key
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json({
        success: false,
        error: 'Planning service configuration missing'
      }, { status: 500 });
    }

    console.log('🚀 Starting GAP comprehensive analysis for:', objective);

    // GAP comprehensive execution prompt
    const gapPrompt = `You are GAP (Gawin Agent Planner), an advanced strategic AI that delivers comprehensive, actionable results using a structured methodology. Instead of creating plans, you execute the planning process and deliver complete solutions.

Request: "${objective}"

Execute the following GAP methodology and provide comprehensive results:

**GAP METHODOLOGY:**
1. **ANALYSIS** - Deeply analyze the request and break it into components
2. **STRATEGY** - Determine the optimal approach and methodology
3. **EXECUTION** - Deliver comprehensive, detailed content that fully addresses the request

**EXECUTION INSTRUCTIONS:**
- Provide thorough, detailed content that completely fulfills the request
- Include specific examples, actionable steps, and practical guidance
- Structure your response with clear sections and subsections
- Make it comprehensive enough that someone could immediately use your response
- Focus on delivering value, not just planning to deliver value
- Be specific, detailed, and actionable in every section

**RESPONSE FORMAT:**
Respond in this exact JSON format:
{
  "title": "Descriptive title of what you've delivered",
  "methodology": "Brief description of your approach",
  "content": "Comprehensive, detailed response that fully addresses the request with proper formatting, examples, and actionable guidance",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "actionItems": ["Immediate action 1", "Immediate action 2", "Immediate action 3"],
  "timeline": "Time to implement/use this content",
  "priority": "low|medium|high|critical"
}

**CRITICAL:** Deliver complete, comprehensive content in the "content" field that fully satisfies the request. Don't create plans - execute and deliver results immediately.

Respond ONLY with valid JSON, no additional text.`;

    // Make request to Groq API
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a strategic planning expert who creates detailed, actionable plans. Always respond in valid JSON format.'
          },
          {
            role: 'user',
            content: gapPrompt
          }
        ],
        temperature: 0.3, // Lower temperature for focused, strategic planning
        max_tokens: 4000,
        top_p: 0.9
      }),
    });

    if (!groqResponse.ok) {
      console.error('❌ Groq API error:', groqResponse.status, groqResponse.statusText);
      throw new Error(`Groq API error: ${groqResponse.status}`);
    }

    const groqData = await groqResponse.json();
    console.log('✅ Groq API response received');

    if (!groqData.choices || !groqData.choices[0] || !groqData.choices[0].message) {
      throw new Error('Invalid response from Groq API');
    }

    const content = groqData.choices[0].message.content;
    console.log('📄 Plan content generated');

    // Parse the JSON response
    let gapResult;
    try {
      gapResult = JSON.parse(content);
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError);
      // Fallback comprehensive response if JSON parsing fails
      gapResult = {
        title: "Comprehensive Analysis",
        methodology: "Structured analytical approach with detailed research and strategic recommendations",
        content: `I've analyzed your request: "${objective}"\n\nWhile I encountered a technical issue processing the detailed response, I can provide the following immediate guidance:\n\n1. **Immediate Analysis**: Breaking down your request into key components and identifying primary objectives.\n\n2. **Strategic Approach**: Developing a systematic methodology to address your specific needs with actionable steps.\n\n3. **Implementation Guidance**: Providing practical recommendations you can implement immediately.\n\nFor a complete comprehensive analysis, please try your request again. GAP Mode is designed to deliver thorough, actionable content rather than just planning steps.`,
        keyPoints: [
          "Request analyzed for key components and objectives",
          "Strategic approach identified for systematic implementation",
          "Ready to provide detailed, actionable guidance"
        ],
        actionItems: [
          "Resubmit request for complete comprehensive analysis",
          "Review specific areas where detailed guidance is needed",
          "Implement any immediate recommendations provided"
        ],
        timeline: "Immediate implementation possible",
        priority: "medium"
      };
    }

    console.log('🏆 GAP comprehensive analysis completed successfully');

    return NextResponse.json({
      success: true,
      title: gapResult.title,
      methodology: gapResult.methodology,
      content: gapResult.content,
      keyPoints: gapResult.keyPoints,
      actionItems: gapResult.actionItems,
      timeline: gapResult.timeline,
      priority: gapResult.priority
    });

  } catch (error) {
    console.error('❌ GAP Planner API error:', error);

    return NextResponse.json({
      success: false,
      error: 'Planning service temporarily unavailable'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'GAP Planner API is running',
    description: 'Gawin Agent Planner - Strategic planning service'
  });
}