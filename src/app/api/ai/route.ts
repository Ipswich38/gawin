import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ModelRouter } from '@/lib/ai/ModelRouter';
import { UserService } from '@/lib/api/users';
import { UsageService } from '@/lib/api/usage';
import { EnterpriseAuth } from '@/lib/security/EnterpriseAuth';
import { CacheManager } from '@/lib/performance/CacheManager';

export async function POST(request: NextRequest) {
  try {
    // Authentication & Authorization
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Security check
    const auth = EnterpriseAuth.getInstance();
    const securityContext = await auth.verifyToken(
      request.headers.get('authorization')?.replace('Bearer ', '') || ''
    );

    if (!securityContext) {
      return NextResponse.json({ error: 'Invalid security context' }, { status: 401 });
    }

    // Parse request
    const {
      prompt,
      taskType = 'chat',
      complexity = 'medium',
      modelId,
      systemPrompt,
      temperature = 0.7,
      maxTokens,
      requiresVision = false,
      imageUrl,
      requiresSpeed = false,
      useCache = true
    } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Rate limiting check
    const hasPermission = await auth.checkPermission(
      securityContext,
      'ai_model',
      'execute'
    );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Check user credits
    const user = await UserService.getUser(session.user.id);
    if (!user || user.credits_remaining < 1) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
    }

    // Cache management
    const cache = CacheManager.getInstance();
    const cacheKey = `ai_response:${Buffer.from(JSON.stringify({
      prompt: prompt.substring(0, 100), // Truncate for key
      taskType,
      complexity,
      modelId,
      systemPrompt,
      temperature,
      maxTokens
    })).toString('base64')}`;

    // Try to get cached response first
    if (useCache) {
      const cachedResponse = await cache.get(cacheKey);
      if (cachedResponse) {
        await auth.logAuditEvent({
          userId: session.user.id,
          action: 'ai_request_cached',
          resource: 'ai_model',
          metadata: { taskType, complexity, cached: true },
          riskLevel: 'low'
        });

        return NextResponse.json({
          ...cachedResponse,
          cached: true,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Execute AI request
    const modelRouter = ModelRouter.getInstance();

    const result = await modelRouter.executeRequest(prompt, {
      taskType: taskType as any,
      complexity: complexity as any,
      modelId,
      systemPrompt,
      temperature,
      maxTokens,
      requiresVision,
      imageUrl,
      requiresSpeed,
      userId: session.user.id
    });

    // Calculate credits used (simplified pricing)
    const creditsUsed = Math.ceil(result.cost * 100); // Convert to credits

    // Update user credits
    await UserService.updateCredits(session.user.id, creditsUsed);

    // Record usage
    await UsageService.recordUsage({
      user_id: session.user.id,
      organization_id: securityContext.organizationId,
      resource_type: 'ai_model_execution',
      resource_id: result.model,
      quantity: 1,
      credits_cost: creditsUsed,
      metadata: {
        model: result.model,
        task_type: taskType,
        complexity,
        tokens_used: result.tokensUsed,
        duration: result.duration,
        prompt_length: prompt.length,
        response_length: result.response.length
      }
    });

    // Cache successful response
    if (useCache && result.response) {
      await cache.set(cacheKey, {
        response: result.response,
        model: result.model,
        tokensUsed: result.tokensUsed,
        cost: result.cost,
        duration: result.duration,
        creditsUsed
      }, {
        ttl: 3600, // 1 hour
        tags: [`user:${session.user.id}`, `model:${result.model}`, `task:${taskType}`]
      });
    }

    // Security audit
    await auth.logAuditEvent({
      userId: session.user.id,
      organizationId: securityContext.organizationId,
      action: 'ai_request_executed',
      resource: 'ai_model',
      resourceId: result.model,
      metadata: {
        task_type: taskType,
        complexity,
        tokens_used: result.tokensUsed,
        credits_used: creditsUsed,
        duration: result.duration,
        model: result.model
      },
      riskLevel: securityContext.riskScore > 70 ? 'medium' : 'low'
    });

    // Return response
    return NextResponse.json({
      response: result.response,
      model: result.model,
      tokensUsed: result.tokensUsed,
      cost: result.cost,
      duration: result.duration,
      creditsUsed,
      cached: false,
      timestamp: new Date().toISOString(),
      remainingCredits: user.credits_remaining - creditsUsed
    });

  } catch (error) {
    console.error('AI API error:', error);

    // Enhanced error logging
    const auth = EnterpriseAuth.getInstance();
    await auth.logAuditEvent({
      userId: 'system',
      action: 'ai_request_error',
      resource: 'ai_model',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      riskLevel: 'medium'
    });

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      },
      { status: 500 }
    );
  }
}

// Get available models and their capabilities
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const modelRouter = ModelRouter.getInstance();
    const { searchParams } = new URL(request.url);
    const useCase = searchParams.get('useCase');

    let models;
    if (useCase) {
      models = modelRouter.getModelRecommendations(useCase);
    } else {
      models = Object.values(require('@/lib/ai/ModelRouter').AI_MODELS);
    }

    // Get real-time performance metrics
    const metrics = await modelRouter.getModelMetrics();

    return NextResponse.json({
      models: models.map(model => ({
        ...model,
        metrics: metrics[model.id] || null
      })),
      recommendations: useCase ? {
        useCase,
        topModels: models.slice(0, 3).map(m => m.id)
      } : null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Models API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}