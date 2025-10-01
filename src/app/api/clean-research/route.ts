import { NextRequest, NextResponse } from 'next/server';

interface ResearchStep {
  id: string;
  step: string;
  description: string;
  status: 'completed';
  result: string;
  sources?: string[];
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔬 Clean research request received');

    const body = await request.json();
    const { query } = body;

    console.log('📝 Research query:', query);

    if (!query || typeof query !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Research query is required'
      }, { status: 400 });
    }

    // Check for Groq API key
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json({
        success: false,
        error: 'Research service configuration missing'
      }, { status: 500 });
    }

    console.log('🚀 Starting research process for:', query);

    // Enhanced research methodology prompt for substantial quick research
    const researchPrompt = `You are a senior research analyst conducting high-quality, in-depth research. Your task is to provide a substantial and comprehensive research analysis that goes far beyond basic information gathering.

Research Query: "${query}"

RESEARCH METHODOLOGY - Conduct thorough analysis using this enhanced framework:

1. **Strategic Topic Analysis** - Deep breakdown of query components, context, and multi-dimensional research angles
2. **Comprehensive Information Architecture** - Systematic identification of all relevant data types, sources, and analytical frameworks needed
3. **Advanced Source Evaluation & Synthesis** - Critical assessment of authoritative sources with cross-referencing and validation
4. **Multi-Perspective Analysis** - Examine from multiple viewpoints, stakeholder perspectives, and disciplinary approaches
5. **Evidence-Based Synthesis & Strategic Insights** - Integrate findings into actionable intelligence with future implications

QUALITY STANDARDS FOR QUICK RESEARCH:
- Each step should contain 150-300 words of substantial analysis
- Provide specific details, examples, data points, and evidence
- Include multiple perspectives and comparative analysis
- Reference current trends, developments, and future implications
- Maintain academic rigor while being accessible
- Connect findings to broader contexts and implications
- Make it comprehensive enough to inform decision-making

Respond in this exact JSON format:
{
  "methodology": "Brief description of the research approach used",
  "steps": [
    {
      "id": "1",
      "step": "Topic Analysis",
      "description": "Brief description of this step",
      "status": "completed",
      "result": "Detailed result of this research step"
    },
    {
      "id": "2",
      "step": "Information Gathering",
      "description": "Brief description of this step",
      "status": "completed",
      "result": "Detailed result of this research step"
    },
    {
      "id": "3",
      "step": "Source Evaluation",
      "description": "Brief description of this step",
      "status": "completed",
      "result": "Detailed result of this research step"
    },
    {
      "id": "4",
      "step": "Analysis & Synthesis",
      "description": "Brief description of this step",
      "status": "completed",
      "result": "Detailed result of this research step"
    },
    {
      "id": "5",
      "step": "Conclusion & Insights",
      "description": "Brief description of this step",
      "status": "completed",
      "result": "Detailed result of this research step"
    }
  ],
  "conclusion": "Comprehensive conclusion based on the research conducted",
  "sources": [
    {
      "title": "Name of credible source",
      "url": "https://example.edu/source1",
      "type": "Academic journal/University/Government agency/etc"
    },
    {
      "title": "Another credible source name",
      "url": "https://example.org/source2",
      "type": "Research institution/Professional organization/etc"
    }
  ]
}

Important guidelines:
- Be thorough and systematic in your research approach
- Focus on credible, legitimate sources and logical reasoning
- Provide unbiased analysis based on evidence
- Quality is more important than speed
- Include diverse perspectives when relevant
- Be specific and detailed in your findings
- For sources, provide actual credible websites, academic institutions, government agencies, or professional organizations that would legitimately have information on this topic
- Use real URLs from established domains (.edu, .gov, .org, major institutions)
- Each source should be a specific, credible resource someone could actually visit to verify the information

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
            content: 'You are a professional researcher who conducts thorough, systematic research with logical reasoning and credible sources. Always respond in valid JSON format.'
          },
          {
            role: 'user',
            content: researchPrompt
          }
        ],
        temperature: 0.4, // Balanced for detailed analysis with insights
        max_tokens: 6000, // Increased for substantial quick research
        top_p: 0.92,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
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
    console.log('📄 Research content generated');

    // Parse the JSON response
    let researchData;
    try {
      researchData = JSON.parse(content);
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError);
      // Fallback to a structured response if JSON parsing fails
      researchData = {
        methodology: "Systematic research approach using multiple analytical frameworks",
        steps: [
          {
            id: "1",
            step: "Query Analysis",
            description: "Analysis of the research question",
            status: "completed",
            result: content.substring(0, 200) + "..."
          }
        ],
        conclusion: "Research analysis completed with available data.",
        sources: ["Academic sources", "Professional publications", "Credible databases"]
      };
    }

    console.log('🏆 Research completed successfully');

    return NextResponse.json({
      success: true,
      methodology: researchData.methodology,
      steps: researchData.steps,
      conclusion: researchData.conclusion,
      sources: researchData.sources || [
        { title: "Academic databases", url: "https://scholar.google.com", type: "Academic search engine" },
        { title: "Professional publications", url: "https://www.jstor.org", type: "Academic journal database" },
        { title: "Government research", url: "https://www.usa.gov", type: "Government information portal" }
      ]
    });

  } catch (error) {
    console.error('❌ Clean research API error:', error);

    return NextResponse.json({
      success: false,
      error: 'Research service temporarily unavailable'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Clean Research API is running',
    description: 'Professional research service with systematic methodology'
  });
}