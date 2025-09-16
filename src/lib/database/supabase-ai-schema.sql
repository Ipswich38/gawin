-- Gawin AI Training & Memory Schema
-- Based on ChatGPT's Hybrid AI Architecture recommendations
-- Optimized for intelligent training, embeddings, and cost efficiency

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- User workspaces for data partitioning
CREATE TABLE IF NOT EXISTS ai_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation messages with embeddings for RAG
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES ai_workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  content_embedding vector(1536), -- OpenAI embedding dimension
  metadata JSONB DEFAULT '{}',
  session_id UUID,
  parent_message_id UUID REFERENCES ai_messages(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for efficient retrieval
  INDEX (workspace_id, created_at DESC),
  INDEX (user_id, created_at DESC),
  INDEX (session_id)
);

-- Vector similarity search index
CREATE INDEX IF NOT EXISTS ai_messages_embedding_idx 
ON ai_messages USING ivfflat (content_embedding vector_cosine_ops) 
WITH (lists = 100);

-- Vision memories with embeddings
CREATE TABLE IF NOT EXISTS ai_vision_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES ai_workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_data TEXT, -- Base64 encoded image
  analysis JSONB NOT NULL, -- Full VisualAnalysis from gawinVisionService
  description_embedding vector(1536),
  scene_context TEXT,
  objects_detected TEXT[],
  emotional_context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  
  INDEX (workspace_id, created_at DESC),
  INDEX (user_id, created_at DESC)
);

-- Audio memories with embeddings
CREATE TABLE IF NOT EXISTS ai_audio_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES ai_workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  audio_analysis JSONB NOT NULL, -- Full AudioAnalysis from gawinAudioService
  transcription TEXT,
  transcription_embedding vector(1536),
  audio_context TEXT,
  emotional_tone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  
  INDEX (workspace_id, created_at DESC),
  INDEX (user_id, created_at DESC)
);

-- Research data with embeddings
CREATE TABLE IF NOT EXISTS ai_research_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES ai_workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  query_embedding vector(1536),
  sources JSONB NOT NULL, -- IntelligentSource[] from research
  synthesis JSONB, -- Research synthesis results
  quality_score REAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '90 days'),
  
  INDEX (workspace_id, created_at DESC),
  INDEX (quality_score DESC)
);

-- Training feedback for LoRA adaptation
CREATE TABLE IF NOT EXISTS ai_training_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES ai_workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id UUID REFERENCES ai_messages(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('positive', 'negative', 'correction', 'preference')),
  feedback_data JSONB NOT NULL,
  quality_score REAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  
  INDEX (workspace_id, feedback_type),
  INDEX (created_at DESC),
  INDEX (processed_at) WHERE processed_at IS NULL
);

-- Compressed sync batches for bandwidth optimization
CREATE TABLE IF NOT EXISTS ai_sync_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES ai_workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  batch_type TEXT NOT NULL CHECK (batch_type IN ('messages', 'vision', 'audio', 'research', 'feedback')),
  compressed_data BYTEA NOT NULL, -- Gzipped JSON data
  encryption_key_hash TEXT, -- For client-side encryption
  item_count INTEGER NOT NULL,
  original_size INTEGER NOT NULL,
  compressed_size INTEGER NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  
  INDEX (workspace_id, processed, created_at),
  INDEX (user_id, batch_type, processed)
);

-- Model adapter blobs for LoRA weights
CREATE TABLE IF NOT EXISTS ai_model_adapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES ai_workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  adapter_name TEXT NOT NULL,
  base_model TEXT NOT NULL,
  adapter_weights BYTEA, -- Compressed LoRA weights
  metadata JSONB DEFAULT '{}',
  version INTEGER DEFAULT 1,
  quality_score REAL,
  training_samples INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  
  UNIQUE (workspace_id, adapter_name, version),
  INDEX (workspace_id, is_active, quality_score DESC)
);

-- Usage telemetry for cost optimization
CREATE TABLE IF NOT EXISTS ai_usage_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES ai_workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  cost_usd DECIMAL(10,6),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX (workspace_id, created_at DESC),
  INDEX (action_type, created_at DESC)
);

-- Retention policies for cost management
CREATE TABLE IF NOT EXISTS ai_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES ai_workspaces(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  retention_days INTEGER NOT NULL,
  compression_enabled BOOLEAN DEFAULT TRUE,
  auto_archive BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE (workspace_id, table_name)
);

-- Row Level Security Policies
ALTER TABLE ai_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_vision_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_audio_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_research_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_training_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_sync_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_adapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_retention_policies ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own data
CREATE POLICY "Users can access their own workspaces" ON ai_workspaces
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own messages" ON ai_messages
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own vision memories" ON ai_vision_memories
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own audio memories" ON ai_audio_memories
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own research data" ON ai_research_data
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own training feedback" ON ai_training_feedback
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own sync batches" ON ai_sync_batches
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own model adapters" ON ai_model_adapters
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own usage telemetry" ON ai_usage_telemetry
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their own retention policies" ON ai_retention_policies
  FOR ALL USING (auth.uid() = user_id);

-- Functions for embeddings and search
CREATE OR REPLACE FUNCTION search_messages_by_embedding(
  query_embedding vector(1536),
  workspace_uuid UUID,
  match_threshold FLOAT DEFAULT 0.8,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  similarity FLOAT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
AS $$
  SELECT 
    ai_messages.id,
    ai_messages.content,
    1 - (ai_messages.content_embedding <=> query_embedding) AS similarity,
    ai_messages.metadata,
    ai_messages.created_at
  FROM ai_messages
  WHERE 
    ai_messages.workspace_id = workspace_uuid
    AND 1 - (ai_messages.content_embedding <=> query_embedding) > match_threshold
  ORDER BY ai_messages.content_embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Cleanup function for expired data
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Clean up expired vision memories
  DELETE FROM ai_vision_memories WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Clean up expired audio memories
  DELETE FROM ai_audio_memories WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
  
  -- Clean up expired research data
  DELETE FROM ai_research_data WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
  
  -- Clean up processed sync batches older than 7 days
  DELETE FROM ai_sync_batches 
  WHERE processed = TRUE AND processed_at < NOW() - INTERVAL '7 days';
  GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- Schedule cleanup to run daily
SELECT cron.schedule('cleanup-expired-ai-data', '0 2 * * *', 'SELECT cleanup_expired_data();');

-- Indexes for performance optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS ai_messages_workspace_created_idx 
ON ai_messages (workspace_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS ai_vision_memories_workspace_created_idx 
ON ai_vision_memories (workspace_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS ai_audio_memories_workspace_created_idx 
ON ai_audio_memories (workspace_id, created_at DESC);

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;