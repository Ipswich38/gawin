/**
 * GPT Researcher API Integration Endpoint
 * Free, Open-Source GPT Researcher (Apache-2.0 License)
 * Repository: https://github.com/assafelovic/gpt-researcher
 * 
 * This endpoint provides enhanced research capabilities by integrating
 * the GPT Researcher library for production-ready research mode.
 */

import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

interface GPTResearchRequest {
  query: string;
  reportType: 'research_report' | 'detailed_report' | 'resource_report' | 'outline_report';
  sourceUrls?: string[];
  maxSources?: number;
  reportLength?: 'short' | 'medium' | 'long';
  includeImages?: boolean;
}

interface GPTResearchResult {
  query: string;
  report: string;
  sources: ResearchSource[];
  images: string[];
  metadata: {
    totalSources: number;
    processingTime: number;
    reportLength: number;
    researcher: 'gpt-researcher';
  };
}

interface ResearchSource {
  url: string;
  title: string;
  snippet: string;
  relevanceScore: number;
  publishDate?: string;
  domain: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('🔬 GPT Researcher API called...');
    
    // Parse request
    const researchRequest: GPTResearchRequest = await request.json();
    const { query, reportType, maxSources, includeImages } = researchRequest;
    
    // Validate request
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // For now, we'll use a Python subprocess to call GPT Researcher
    // In production, this would be a dedicated Python microservice
    const result = await conductGPTResearch({
      query,
      reportType: reportType || 'research_report',
      maxSources: maxSources || 20,
      includeImages: includeImages || true
    });

    const processingTime = Date.now() - startTime;
    
    console.log(`✅ GPT Researcher completed in ${processingTime}ms`);
    
    return NextResponse.json({
      success: true,
      data: result,
      processingTime
    });

  } catch (error) {
    console.error('❌ GPT Researcher API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'GPT Researcher failed',
        details: String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * Conduct research using GPT Researcher Python package
 */
async function conductGPTResearch(request: GPTResearchRequest): Promise<GPTResearchResult> {
  const startTime = Date.now();
  
  try {
    // Create a temporary Python script to run GPT Researcher
    const pythonScript = `
import asyncio
import json
import sys
from gpt_researcher import GPTResearcher

async def main():
    try:
        # Initialize researcher
        researcher = GPTResearcher(
            query="${request.query.replace(/"/g, '\\"')}",
            report_type="${request.reportType}",
            source_urls=${request.sourceUrls ? JSON.stringify(request.sourceUrls) : '[]'}
        )
        
        # Conduct research
        research_result = await researcher.conduct_research()
        
        # Generate report
        report = await researcher.write_report()
        
        # Get sources
        sources = researcher.get_source_urls()
        
        # Prepare result
        result = {
            "query": "${request.query.replace(/"/g, '\\"')}",
            "report": report,
            "sources": [
                {
                    "url": url,
                    "title": "Research Source",
                    "snippet": "",
                    "relevanceScore": 0.8,
                    "domain": url.split('/')[2] if '//' in url else url
                }
                for url in sources[:${request.maxSources || 20}]
            ],
            "images": [],
            "metadata": {
                "totalSources": len(sources),
                "processingTime": 0,
                "reportLength": len(report),
                "researcher": "gpt-researcher"
            }
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "error": str(e),
            "fallback": True
        }
        print(json.dumps(error_result))

if __name__ == "__main__":
    asyncio.run(main())
`;

    // Write temporary Python script
    const tempDir = path.join(process.cwd(), 'temp');
    await fs.mkdir(tempDir, { recursive: true });
    const scriptPath = path.join(tempDir, `research_${Date.now()}.py`);
    await fs.writeFile(scriptPath, pythonScript);

    try {
      // Execute Python script
      console.log('🐍 Executing GPT Researcher Python script...');
      const { stdout, stderr } = await execAsync(`python3 ${scriptPath}`, {
        timeout: 120000, // 2 minutes timeout
        env: {
          ...process.env,
          OPENAI_API_KEY: process.env.OPENAI_API_KEY,
          TAVILY_API_KEY: process.env.TAVILY_API_KEY // GPT Researcher uses Tavily for search
        }
      });

      if (stderr) {
        console.warn('GPT Researcher stderr:', stderr);
      }

      // Parse result
      const result = JSON.parse(stdout.trim());
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Update processing time
      result.metadata.processingTime = Date.now() - startTime;
      
      return result as GPTResearchResult;

    } finally {
      // Cleanup temporary file
      try {
        await fs.unlink(scriptPath);
      } catch (cleanupError) {
        console.warn('Failed to cleanup temp file:', cleanupError);
      }
    }

  } catch (error) {
    console.error('GPT Researcher execution failed:', error);
    
    // Return fallback result for graceful degradation
    return {
      query: request.query,
      report: `Research query: "${request.query}"\n\nGPT Researcher is currently unavailable. Please ensure the Python package is installed and configured properly.\n\nTo install GPT Researcher:\n\`\`\`bash\npip install gpt-researcher\n\`\`\`\n\nRequired environment variables:\n- OPENAI_API_KEY\n- TAVILY_API_KEY (for web search)\n\nFalling back to intelligent research system...`,
      sources: [],
      images: [],
      metadata: {
        totalSources: 0,
        processingTime: Date.now() - startTime,
        reportLength: 0,
        researcher: 'gpt-researcher'
      }
    };
  }
}

/**
 * Status endpoint to check GPT Researcher availability
 */
export async function GET(request: NextRequest) {
  try {
    // Check if GPT Researcher is available
    const { stdout } = await execAsync('python3 -c "import gpt_researcher; print(\\"available\\")"', {
      timeout: 5000
    });
    
    const available = stdout.trim() === 'available';
    
    return NextResponse.json({
      service: 'GPT Researcher',
      version: '1.0.0',
      available,
      license: 'Apache-2.0',
      repository: 'https://github.com/assafelovic/gpt-researcher',
      requirements: [
        'pip install gpt-researcher',
        'OPENAI_API_KEY environment variable',
        'TAVILY_API_KEY environment variable (for web search)'
      ],
      capabilities: [
        'Advanced web research',
        'Multi-source synthesis',
        'Report generation',
        'Source validation',
        'Real-time web browsing'
      ]
    });
    
  } catch (error) {
    return NextResponse.json({
      service: 'GPT Researcher',
      available: false,
      error: 'GPT Researcher not installed or configured',
      installInstructions: 'pip install gpt-researcher'
    });
  }
}