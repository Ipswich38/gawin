-- Initialize Gawin AI Orchestrator Database
-- Production-ready schema for mental health and education AI platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name VARCHAR(100),
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token TEXT,
    reset_token TEXT,
    reset_token_expires TIMESTAMP WITH TIME ZONE
);

-- User profiles for additional metadata
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    risk_level VARCHAR(10) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
    learning_level VARCHAR(20) DEFAULT 'intermediate' CHECK (learning_level IN ('beginner', 'intermediate', 'advanced')),
    preferred_subjects TEXT[],
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    consent_flags JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table for tracking user sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated'))
);

-- Interactions table for storing user-AI interactions
CREATE TABLE IF NOT EXISTS user_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
    request_id VARCHAR(255) UNIQUE NOT NULL,
    query TEXT NOT NULL,
    response TEXT NOT NULL,
    model_used VARCHAR(100) NOT NULL,
    model_version VARCHAR(50),
    topic VARCHAR(100),
    query_type VARCHAR(50),
    processing_time INTEGER, -- milliseconds
    tokens_used INTEGER,
    cost_cents INTEGER,
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    feedback_text TEXT,
    safety_flags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_start TIMESTAMP WITH TIME ZONE -- denormalized for easier queries
);

-- Safety incidents table for tracking and escalating safety issues
CREATE TABLE IF NOT EXISTS safety_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
    incident_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    content_hash VARCHAR(64), -- SHA-256 hash of content for privacy
    detected_keywords TEXT[],
    confidence DECIMAL(3,2),
    action_taken VARCHAR(100),
    escalated BOOLEAN DEFAULT FALSE,
    escalated_to VARCHAR(100),
    escalated_at TIMESTAMP WITH TIME ZONE,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_by VARCHAR(100),
    resolved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Model performance tracking
CREATE TABLE IF NOT EXISTS model_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id VARCHAR(100) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    requests_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    avg_latency DECIMAL(10,2),
    avg_satisfaction DECIMAL(3,2),
    tokens_processed BIGINT DEFAULT 0,
    cost_total DECIMAL(10,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(model_id, model_version, date)
);

-- Training jobs for MLOps pipeline
CREATE TABLE IF NOT EXISTS training_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id VARCHAR(255) UNIQUE NOT NULL,
    model_id VARCHAR(100) NOT NULL,
    base_model VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')),
    config JSONB NOT NULL,
    progress JSONB DEFAULT '{}',
    results JSONB,
    logs TEXT,
    started_by VARCHAR(100),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Model registry
CREATE TABLE IF NOT EXISTS model_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_model VARCHAR(100),
    model_type VARCHAR(50),
    domain TEXT[],
    created_by VARCHAR(100),
    status VARCHAR(20) DEFAULT 'development' CHECK (status IN ('development', 'testing', 'production', 'deprecated')),
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Model versions
CREATE TABLE IF NOT EXISTS model_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id VARCHAR(100) REFERENCES model_registry(model_id) ON DELETE CASCADE,
    version VARCHAR(50) NOT NULL,
    training_job_id UUID REFERENCES training_jobs(id),
    performance_metrics JSONB,
    safety_score DECIMAL(3,2),
    deployment_status VARCHAR(20) DEFAULT 'pending' CHECK (deployment_status IN ('pending', 'canary', 'shadow', 'production', 'retired')),
    approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    approved_by VARCHAR(100),
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    artifacts JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(model_id, version)
);

-- Vector documents for semantic search
CREATE TABLE IF NOT EXISTS vector_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    content_hash VARCHAR(64), -- SHA-256 hash
    embedding_vector DECIMAL(10,8)[], -- Stored as array for PostgreSQL
    metadata JSONB DEFAULT '{}',
    source VARCHAR(50) NOT NULL,
    topic TEXT[],
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics events for comprehensive tracking
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
    request_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_interactions_created_at ON user_interactions(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_interactions_model_used ON user_interactions(model_used);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_safety_incidents_user_id ON safety_incidents(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_safety_incidents_severity ON safety_incidents(severity);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_safety_incidents_escalated ON safety_incidents(escalated);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_model_performance_model_id ON model_performance(model_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_model_performance_date ON model_performance(date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_training_jobs_status ON training_jobs(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vector_documents_user_id ON vector_documents(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vector_documents_source ON vector_documents(source);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_model_registry_updated_at BEFORE UPDATE ON model_registry FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a function to anonymize user data for privacy compliance
CREATE OR REPLACE FUNCTION anonymize_user_data(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Update user record
    UPDATE users SET
        email = 'anonymized_' || id::text || '@privacy.local',
        name = 'Anonymized User',
        avatar_url = NULL,
        verification_token = NULL,
        reset_token = NULL
    WHERE id = user_uuid;
    
    -- Clear sensitive data from interactions but keep aggregated stats
    UPDATE user_interactions SET
        query = '[REDACTED]',
        response = '[REDACTED]',
        feedback_text = NULL
    WHERE user_id = user_uuid;
    
    -- Remove vector documents containing user content
    DELETE FROM vector_documents WHERE user_id = user_uuid;
    
    -- Clear safety incidents (keep statistical data)
    UPDATE safety_incidents SET
        content_hash = NULL,
        notes = '[REDACTED]'
    WHERE user_id = user_uuid;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Insert default admin user (change password in production!)
INSERT INTO users (email, password_hash, name, role, email_verified)
VALUES (
    'admin@gawin.ai',
    crypt('change_this_password_123', gen_salt('bf')),
    'System Administrator',
    'admin',
    true
) ON CONFLICT (email) DO NOTHING;

-- Insert sample educational content models
INSERT INTO model_registry (model_id, name, description, base_model, model_type, domain, created_by, status)
VALUES 
    ('gawin-education-v1', 'Gawin Education Assistant', 'Fine-tuned model for educational content and tutoring', 'llama-3-70b', 'instruction', ARRAY['education', 'tutoring'], 'system', 'production'),
    ('gawin-mental-health-v1', 'Gawin Mental Health Support', 'Specialized model for mental health conversations with safety guardrails', 'gpt-4', 'safety', ARRAY['mental-health', 'counseling'], 'system', 'production')
ON CONFLICT (model_id) DO NOTHING;

-- Create initial model versions
INSERT INTO model_versions (model_id, version, performance_metrics, safety_score, deployment_status, approval_status, approved_by, approved_at)
VALUES 
    ('gawin-education-v1', 'v1.0.0', '{"accuracy": 0.89, "helpfulness": 0.92}', 0.95, 'production', 'approved', 'system', NOW()),
    ('gawin-mental-health-v1', 'v1.0.0', '{"safety_score": 0.97, "empathy": 0.88}', 0.98, 'production', 'approved', 'system', NOW())
ON CONFLICT (model_id, version) DO NOTHING;

-- Grant permissions for application user
-- Note: In production, create a dedicated application user with minimal required permissions
-- GRANT CONNECT ON DATABASE gawin_ai TO gawin_app;
-- GRANT USAGE ON SCHEMA public TO gawin_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO gawin_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO gawin_app;