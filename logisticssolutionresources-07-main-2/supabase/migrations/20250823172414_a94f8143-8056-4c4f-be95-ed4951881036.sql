-- Create AI conversations table
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    model VARCHAR(50) NOT NULL DEFAULT 'gpt4',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_timestamp ON ai_conversations(timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_model ON ai_conversations(model);

-- Enable RLS
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own conversations" ON ai_conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations" ON ai_conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create AI agent configurations table
CREATE TABLE IF NOT EXISTS ai_agent_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    agent_type VARCHAR(50) NOT NULL,
    config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for AI agent configs
CREATE INDEX IF NOT EXISTS idx_ai_agent_configs_type ON ai_agent_configs(agent_type);
CREATE INDEX IF NOT EXISTS idx_ai_agent_configs_active ON ai_agent_configs(is_active);

-- Enable RLS for AI agent configs
ALTER TABLE ai_agent_configs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for AI agent configs
CREATE POLICY "Users can view active agent configs" ON ai_agent_configs
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage agent configs" ON ai_agent_configs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Create AI usage tracking table
CREATE TABLE IF NOT EXISTS ai_usage_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    model VARCHAR(50) NOT NULL,
    tokens_used INTEGER,
    cost DECIMAL(10,4),
    request_type VARCHAR(50) NOT NULL, -- 'chat', 'stream', 'agent'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Create indexes for usage tracking
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON ai_usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_timestamp ON ai_usage_tracking(timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_usage_model ON ai_usage_tracking(model);

-- Enable RLS for usage tracking
ALTER TABLE ai_usage_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for usage tracking
CREATE POLICY "Users can view their own usage" ON ai_usage_tracking
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage" ON ai_usage_tracking
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_ai_agent_configs_updated_at 
    BEFORE UPDATE ON ai_agent_configs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();