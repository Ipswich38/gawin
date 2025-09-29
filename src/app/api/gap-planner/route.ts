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

    console.log('🚀 Starting GAP planning process for:', objective);

    // GAP planning prompt
    const planningPrompt = `You are a professional strategic planner and project manager. Your task is to create a comprehensive, actionable plan for the following objective.

Objective: "${objective}"

Please create a detailed strategic plan following this methodology:

1. **Analysis** - Break down the objective into key components
2. **Strategy** - Determine the best approach and methodology
3. **Planning** - Create specific, actionable steps with realistic timelines
4. **Dependencies** - Identify relationships between steps
5. **Execution** - Provide clear implementation guidance

Respond in this exact JSON format:
{
  "title": "Clear, concise plan title (max 50 chars)",
  "priority": "low|medium|high|critical",
  "timeline": "Estimated total completion time",
  "steps": [
    {
      "id": "step_1",
      "title": "Step title",
      "description": "Detailed description of what needs to be done",
      "status": "pending",
      "estimatedTime": "2 hours",
      "dependencies": []
    },
    {
      "id": "step_2",
      "title": "Step title",
      "description": "Detailed description of what needs to be done",
      "status": "pending",
      "estimatedTime": "1 day",
      "dependencies": ["step_1"]
    }
  ]
}

Important guidelines:
- Create 3-8 logical, sequential steps
- Be specific and actionable in descriptions
- Provide realistic time estimates
- Include dependencies where steps must be completed in order
- Consider resources, tools, and skills needed
- Focus on practical implementation
- Assign appropriate priority (critical=urgent, high=important, medium=standard, low=when convenient)

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
            content: planningPrompt
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
    let planData;
    try {
      planData = JSON.parse(content);
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError);
      // Fallback to a structured plan if JSON parsing fails
      planData = {
        title: "Strategic Plan",
        priority: "medium",
        timeline: "Estimated 1-2 weeks",
        steps: [
          {
            id: "step_1",
            title: "Initial Analysis",
            description: "Analyze the objective and gather requirements",
            status: "pending",
            estimatedTime: "2-4 hours",
            dependencies: []
          },
          {
            id: "step_2",
            title: "Planning & Strategy",
            description: "Develop detailed strategy and approach",
            status: "pending",
            estimatedTime: "1-2 days",
            dependencies: ["step_1"]
          },
          {
            id: "step_3",
            title: "Implementation",
            description: "Execute the planned approach",
            status: "pending",
            estimatedTime: "1-2 weeks",
            dependencies: ["step_2"]
          }
        ]
      };
    }

    console.log('🏆 GAP planning completed successfully');

    return NextResponse.json({
      success: true,
      title: planData.title,
      priority: planData.priority,
      timeline: planData.timeline,
      steps: planData.steps
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