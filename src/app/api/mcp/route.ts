import { NextRequest, NextResponse } from 'next/server';
import { mcpClientService } from '@/lib/services/mcpClientService';
import { groqService, GroqRequest } from '@/lib/services/groqService';
import { contentFilterService } from '@/lib/services/contentFilterService';
import { responseFilterService } from '@/lib/services/responseFilterService';

/**
 * MCP-Enhanced API Route for Gawin
 * Primary: MCP Protocol for AI and tools
 * Fallback: Direct API calls (existing groq route logic)
 */

export async function POST(request: NextRequest) {
  try {
    const body: GroqRequest = await request.json();

    // Validate request
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request: messages array is required'
      }, { status: 400 });
    }

    const lastMessage = body.messages[body.messages.length - 1];
    const messageContent = typeof lastMessage.content === 'string'
      ? lastMessage.content
      : Array.isArray(lastMessage.content)
      ? lastMessage.content.find(item => item.type === 'text')?.text || ''
      : String(lastMessage.content);

    console.log('🔌 MCP API Request:', messageContent.substring(0, 100) + '...');

    // Content filtering (same as before)
    const contentFilter = contentFilterService.filterContent(messageContent);
    if (contentFilter.wasFiltered && contentFilter.filterResult.isBlocked) {
      console.log(`🛡️ Content blocked: ${contentFilter.filterResult.category}`);
      return NextResponse.json({
        success: true,
        choices: [{
          message: {
            role: 'assistant',
            content: contentFilter.filtered
          }
        }]
      });
    }

    // Try MCP if available, but don't block on it
    let mcpResult = null;
    try {
      console.log('🔌 Attempting MCP initialization (non-blocking)...');
      await Promise.race([
        mcpClientService.initialize(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('MCP timeout')), 2000))
      ]);

      mcpResult = await Promise.race([
        mcpClientService.createChatCompletion(body.messages, {
          model: 'llama-3.3-70b-versatile',
          temperature: body.temperature || 0.7,
          max_tokens: body.max_tokens || 1500
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('MCP response timeout')), 3000))
      ]) as any;

      if (mcpResult && mcpResult.success && mcpResult.toolResults) {
        console.log('✅ MCP chat completion successful');

        // Extract content from MCP response
        let content = '';
        if (Array.isArray(mcpResult.toolResults)) {
          content = mcpResult.toolResults
            .map(result => result.type === 'text' ? result.text : '')
            .join('\n')
            .trim();
        }

        if (content) {
          // Apply response filtering
          const filteredResponse = responseFilterService.filterResponse(content);

          return NextResponse.json({
            success: true,
            choices: [{
              message: {
                role: 'assistant',
                content: filteredResponse.content
              }
            }],
            model: `MCP-${mcpResult.metadata?.server || 'unknown'}`,
            usage: {
              prompt_tokens: messageContent.length,
              completion_tokens: filteredResponse.content.length,
              total_tokens: messageContent.length + filteredResponse.content.length
            }
          });
        }
      }
    } catch (mcpError) {
      console.log('🔄 MCP not available or timed out, using direct API:', mcpError);
    }

    // Primary path: Use direct Groq API (more reliable)
    console.log('🚀 Using direct Groq API (primary method)...');

    const groqResult = await groqService.createChatCompletion(body);

    if (groqResult.success) {
      console.log('✅ Groq fallback successful');

      // Apply response filtering to Groq response
      if (groqResult.choices?.[0]?.message?.content) {
        const filteredResponse = responseFilterService.filterResponse(groqResult.choices[0].message.content);
        groqResult.choices[0].message.content = filteredResponse.content;
      }

      return NextResponse.json({
        ...groqResult,
        model: `Fallback-${groqResult.model || 'groq'}`
      });
    }

    // Both MCP and Groq failed, return error
    return NextResponse.json({
      success: false,
      error: 'All AI services unavailable',
      details: {
        mcp_error: mcpResult.error,
        groq_error: groqResult.error
      }
    }, { status: 503 });

  } catch (error) {
    console.error('MCP API route error:', error);

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Get MCP server status and available tools
 */
export async function GET() {
  try {
    await mcpClientService.initialize();

    const [healthCheck, availableTools, serverStatus] = await Promise.all([
      mcpClientService.healthCheck(),
      mcpClientService.getAvailableTools(),
      mcpClientService.getServerStatus()
    ]);

    return NextResponse.json({
      success: true,
      data: {
        health: healthCheck,
        available_tools: availableTools,
        server_status: serverStatus,
        mcp_enabled: healthCheck.healthy
      }
    });

  } catch (error) {
    console.error('MCP status check error:', error);

    return NextResponse.json({
      success: false,
      error: 'MCP status check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}