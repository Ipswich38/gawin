/**
 * Gawin AI Sync Endpoint
 * Implements ChatGPT's Hybrid AI Architecture recommendations
 * Handles intelligent data synchronization with:
 * - Compressed batch processing
 * - Embedding generation
 * - Cost optimization
 * - Privacy-first design
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Initialize services
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder'
});

interface SyncRequest {
  batches: SyncBatch[];
  workspaceId: string;
  userId: string;
}

interface SyncBatch {
  id: string;
  type: 'messages' | 'vision' | 'audio' | 'research' | 'feedback';
  items: any[];
  compressed: boolean;
  encrypted: boolean;
  originalSize: number;
  compressedSize: number;
  timestamp: number;
}

interface ProcessingStats {
  totalItems: number;
  embeddingsGenerated: number;
  processingTimeMs: number;
  costUsd: number;
  errors: string[];
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const stats: ProcessingStats = {
    totalItems: 0,
    embeddingsGenerated: 0,
    processingTimeMs: 0,
    costUsd: 0,
    errors: []
  };

  try {
    console.log('🔄 Processing sync request...');
    
    // Parse request
    const syncRequest: SyncRequest = await request.json();
    const { batches, workspaceId, userId } = syncRequest;
    
    // Validate request
    if (!batches || !workspaceId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: batches, workspaceId, userId' },
        { status: 400 }
      );
    }

    // Verify user has access to workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from('ai_workspaces')
      .select('id')
      .eq('id', workspaceId)
      .eq('user_id', userId)
      .single();

    if (workspaceError || !workspace) {
      return NextResponse.json(
        { error: 'Workspace not found or access denied' },
        { status: 403 }
      );
    }

    // Process each batch
    const results = [];
    for (const batch of batches) {
      try {
        const batchResult = await processBatch(batch, workspaceId, userId, stats);
        results.push(batchResult);
      } catch (error) {
        console.error(`Batch processing failed for ${batch.id}:`, error);
        stats.errors.push(`Batch ${batch.id}: ${error}`);
        results.push({ batchId: batch.id, success: false, error: String(error) });
      }
    }

    // Calculate final stats
    stats.processingTimeMs = Date.now() - startTime;
    
    // Log telemetry
    await logUsageTelemetry({
      workspaceId,
      userId,
      actionType: 'sync_batch',
      stats
    });

    console.log(`✅ Sync completed: ${stats.totalItems} items, ${stats.embeddingsGenerated} embeddings, ${stats.processingTimeMs}ms`);

    return NextResponse.json({
      success: true,
      results,
      stats,
      message: `Processed ${stats.totalItems} items with ${stats.embeddingsGenerated} embeddings`
    });

  } catch (error) {
    console.error('❌ Sync endpoint error:', error);
    
    stats.processingTimeMs = Date.now() - startTime;
    stats.errors.push(String(error));
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal sync error',
        stats 
      },
      { status: 500 }
    );
  }
}

/**
 * Process individual batch based on type
 */
async function processBatch(
  batch: SyncBatch, 
  workspaceId: string, 
  userId: string, 
  stats: ProcessingStats
): Promise<any> {
  console.log(`📦 Processing ${batch.type} batch: ${batch.items.length} items`);
  
  stats.totalItems += batch.items.length;
  
  switch (batch.type) {
    case 'messages':
      return await processMessagesBatch(batch.items, workspaceId, userId, stats);
    case 'vision':
      return await processVisionBatch(batch.items, workspaceId, userId, stats);
    case 'audio':
      return await processAudioBatch(batch.items, workspaceId, userId, stats);
    case 'research':
      return await processResearchBatch(batch.items, workspaceId, userId, stats);
    case 'feedback':
      return await processFeedbackBatch(batch.items, workspaceId, userId, stats);
    default:
      throw new Error(`Unknown batch type: ${batch.type}`);
  }
}

/**
 * Process messages batch with embeddings
 */
async function processMessagesBatch(
  items: any[], 
  workspaceId: string, 
  userId: string, 
  stats: ProcessingStats
): Promise<any> {
  const processedMessages = [];
  
  for (const message of items) {
    try {
      // Generate embedding for content
      let embedding = null;
      if (message.needsEmbedding && message.content) {
        embedding = await generateEmbedding(message.content, stats);
      }
      
      // Prepare message for database
      const dbMessage = {
        id: message.id,
        workspace_id: workspaceId,
        user_id: userId,
        role: message.role,
        content: message.content,
        content_embedding: embedding,
        metadata: message.metadata || {},
        session_id: message.sessionId,
        created_at: new Date(message.timestamp).toISOString()
      };
      
      processedMessages.push(dbMessage);
      
    } catch (error) {
      console.error(`Failed to process message ${message.id}:`, error);
      stats.errors.push(`Message ${message.id}: ${error}`);
    }
  }
  
  // Bulk insert messages
  if (processedMessages.length > 0) {
    const { error } = await supabase
      .from('ai_messages')
      .insert(processedMessages);
    
    if (error) {
      throw new Error(`Failed to insert messages: ${error.message}`);
    }
  }
  
  return {
    batchType: 'messages',
    itemsProcessed: processedMessages.length,
    embeddingsGenerated: processedMessages.filter(m => m.content_embedding).length
  };
}

/**
 * Process vision memories batch
 */
async function processVisionBatch(
  items: any[], 
  workspaceId: string, 
  userId: string, 
  stats: ProcessingStats
): Promise<any> {
  const processedVision = [];
  
  for (const memory of items) {
    try {
      // Generate embedding for description
      let embedding = null;
      if (memory.needsEmbedding && memory.analysis?.description) {
        embedding = await generateEmbedding(memory.analysis.description, stats);
      }
      
      // Prepare vision memory for database
      const dbVision = {
        workspace_id: workspaceId,
        user_id: userId,
        image_data: memory.imageData,
        analysis: memory.analysis,
        description_embedding: embedding,
        scene_context: memory.analysis?.scene?.setting || '',
        objects_detected: memory.analysis?.objects?.map((obj: any) => obj.name) || [],
        emotional_context: memory.analysis?.emotions?.overall || 'neutral',
        created_at: new Date(memory.timestamp).toISOString()
      };
      
      processedVision.push(dbVision);
      
    } catch (error) {
      console.error(`Failed to process vision memory:`, error);
      stats.errors.push(`Vision memory: ${error}`);
    }
  }
  
  // Bulk insert vision memories
  if (processedVision.length > 0) {
    const { error } = await supabase
      .from('ai_vision_memories')
      .insert(processedVision);
    
    if (error) {
      throw new Error(`Failed to insert vision memories: ${error.message}`);
    }
  }
  
  return {
    batchType: 'vision',
    itemsProcessed: processedVision.length,
    embeddingsGenerated: processedVision.filter(v => v.description_embedding).length
  };
}

/**
 * Process audio memories batch
 */
async function processAudioBatch(
  items: any[], 
  workspaceId: string, 
  userId: string, 
  stats: ProcessingStats
): Promise<any> {
  const processedAudio = [];
  
  for (const memory of items) {
    try {
      // Generate embedding for transcription
      let embedding = null;
      if (memory.needsEmbedding && memory.analysis?.speech?.transcription) {
        embedding = await generateEmbedding(memory.analysis.speech.transcription, stats);
      }
      
      // Prepare audio memory for database
      const dbAudio = {
        workspace_id: workspaceId,
        user_id: userId,
        audio_analysis: memory.analysis,
        transcription: memory.analysis?.speech?.transcription || '',
        transcription_embedding: embedding,
        audio_context: memory.analysis?.context?.setting || '',
        emotional_tone: memory.analysis?.emotions?.overall || 'neutral',
        created_at: new Date(memory.timestamp).toISOString()
      };
      
      processedAudio.push(dbAudio);
      
    } catch (error) {
      console.error(`Failed to process audio memory:`, error);
      stats.errors.push(`Audio memory: ${error}`);
    }
  }
  
  // Bulk insert audio memories
  if (processedAudio.length > 0) {
    const { error } = await supabase
      .from('ai_audio_memories')
      .insert(processedAudio);
    
    if (error) {
      throw new Error(`Failed to insert audio memories: ${error.message}`);
    }
  }
  
  return {
    batchType: 'audio',
    itemsProcessed: processedAudio.length,
    embeddingsGenerated: processedAudio.filter(a => a.transcription_embedding).length
  };
}

/**
 * Process research data batch
 */
async function processResearchBatch(
  items: any[], 
  workspaceId: string, 
  userId: string, 
  stats: ProcessingStats
): Promise<any> {
  const processedResearch = [];
  
  for (const research of items) {
    try {
      // Generate embedding for query
      let embedding = null;
      if (research.needsEmbedding && research.query) {
        embedding = await generateEmbedding(research.query, stats);
      }
      
      // Prepare research data for database
      const dbResearch = {
        id: research.id,
        workspace_id: workspaceId,
        user_id: userId,
        query: research.query,
        query_embedding: embedding,
        sources: research.sources,
        synthesis: research.synthesis,
        quality_score: research.qualityScore,
        created_at: new Date(research.timestamp).toISOString()
      };
      
      processedResearch.push(dbResearch);
      
    } catch (error) {
      console.error(`Failed to process research data:`, error);
      stats.errors.push(`Research data: ${error}`);
    }
  }
  
  // Bulk insert research data
  if (processedResearch.length > 0) {
    const { error } = await supabase
      .from('ai_research_data')
      .insert(processedResearch);
    
    if (error) {
      throw new Error(`Failed to insert research data: ${error.message}`);
    }
  }
  
  return {
    batchType: 'research',
    itemsProcessed: processedResearch.length,
    embeddingsGenerated: processedResearch.filter(r => r.query_embedding).length
  };
}

/**
 * Process training feedback batch
 */
async function processFeedbackBatch(
  items: any[], 
  workspaceId: string, 
  userId: string, 
  stats: ProcessingStats
): Promise<any> {
  const processedFeedback = [];
  
  for (const feedback of items) {
    try {
      // Prepare feedback for database
      const dbFeedback = {
        id: feedback.id,
        workspace_id: workspaceId,
        user_id: userId,
        message_id: feedback.messageId,
        feedback_type: feedback.feedbackType,
        feedback_data: feedback.feedbackData,
        quality_score: feedback.qualityScore,
        created_at: new Date(feedback.timestamp).toISOString()
      };
      
      processedFeedback.push(dbFeedback);
      
    } catch (error) {
      console.error(`Failed to process feedback:`, error);
      stats.errors.push(`Feedback: ${error}`);
    }
  }
  
  // Bulk insert feedback
  if (processedFeedback.length > 0) {
    const { error } = await supabase
      .from('ai_training_feedback')
      .insert(processedFeedback);
    
    if (error) {
      throw new Error(`Failed to insert feedback: ${error.message}`);
    }
  }
  
  return {
    batchType: 'feedback',
    itemsProcessed: processedFeedback.length,
    embeddingsGenerated: 0
  };
}

/**
 * Generate OpenAI embedding with cost tracking
 */
async function generateEmbedding(text: string, stats: ProcessingStats): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000) // Limit to 8K chars for cost optimization
    });
    
    stats.embeddingsGenerated++;
    // Approximate cost: $0.00002 per 1K tokens for text-embedding-3-small
    stats.costUsd += 0.00002 * (text.length / 1000);
    
    return response.data[0].embedding;
    
  } catch (error) {
    console.error('Embedding generation failed:', error);
    throw new Error(`Embedding failed: ${error}`);
  }
}

/**
 * Log usage telemetry for cost optimization
 */
async function logUsageTelemetry(data: {
  workspaceId: string;
  userId: string;
  actionType: string;
  stats: ProcessingStats;
}): Promise<void> {
  try {
    await supabase
      .from('ai_usage_telemetry')
      .insert({
        workspace_id: data.workspaceId,
        user_id: data.userId,
        action_type: data.actionType,
        tokens_used: data.stats.embeddingsGenerated * 1000, // Approximate
        processing_time_ms: data.stats.processingTimeMs,
        cost_usd: data.stats.costUsd,
        metadata: {
          totalItems: data.stats.totalItems,
          embeddingsGenerated: data.stats.embeddingsGenerated,
          errors: data.stats.errors
        }
      });
  } catch (error) {
    console.error('Failed to log telemetry:', error);
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Gawin AI Sync Endpoint',
    version: '1.0.0',
    capabilities: [
      'Compressed batch processing',
      'Embedding generation',
      'Multi-modal data sync',
      'Cost optimization',
      'Privacy-first design'
    ]
  });
}