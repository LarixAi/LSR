-- Phase 2: Real-time Infrastructure & Background Processing (Fixed)
-- Enable realtime for critical tables
ALTER TABLE public.driver_locations REPLICA IDENTITY FULL;
ALTER TABLE public.enhanced_notifications REPLICA IDENTITY FULL;
ALTER TABLE public.jobs REPLICA IDENTITY FULL;
ALTER TABLE public.incidents REPLICA IDENTITY FULL;

-- Add tables to realtime publication (skip messages as it's already added)
ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.enhanced_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;

-- Background task infrastructure already created above
-- Create WebSocket session management table
CREATE TABLE IF NOT EXISTS public.websocket_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id),
  session_token TEXT NOT NULL UNIQUE,
  channel_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  last_ping TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Add indexes for websocket sessions
CREATE INDEX IF NOT EXISTS idx_websocket_sessions_user_active 
ON public.websocket_sessions (user_id, status) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_websocket_sessions_expires 
ON public.websocket_sessions (expires_at);

-- Enable RLS on websocket sessions
ALTER TABLE public.websocket_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for websocket sessions
CREATE POLICY "Users can manage their own websocket sessions" 
ON public.websocket_sessions 
FOR ALL 
USING (user_id = auth.uid());

-- Create function to create websocket session
CREATE OR REPLACE FUNCTION public.create_websocket_session(
  p_channel_name TEXT
)
RETURNS TABLE(session_token TEXT, expires_at TIMESTAMP WITH TIME ZONE) AS $$
DECLARE
  new_token TEXT;
  user_org_id UUID;
  expires_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO user_org_id
  FROM public.profiles WHERE id = auth.uid();
  
  -- Generate secure session token
  new_token := encode(gen_random_bytes(32), 'base64');
  expires_time := NOW() + INTERVAL '24 hours';
  
  -- Clean up old sessions for this user
  DELETE FROM public.websocket_sessions 
  WHERE user_id = auth.uid() AND (status = 'inactive' OR expires_at < NOW());
  
  -- Create new session
  INSERT INTO public.websocket_sessions (
    user_id, organization_id, session_token, channel_name, expires_at
  ) VALUES (
    auth.uid(), user_org_id, new_token, p_channel_name, expires_time
  );
  
  RETURN QUERY SELECT new_token, expires_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to validate websocket session
CREATE OR REPLACE FUNCTION public.validate_websocket_session(
  p_session_token TEXT
)
RETURNS TABLE(
  user_id UUID,
  organization_id UUID,
  channel_name TEXT
) AS $$
BEGIN
  -- Update last ping and return session info if valid
  RETURN QUERY
  UPDATE public.websocket_sessions 
  SET last_ping = NOW()
  WHERE session_token = p_session_token 
    AND status = 'active' 
    AND expires_at > NOW()
  RETURNING websocket_sessions.user_id, websocket_sessions.organization_id, websocket_sessions.channel_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create event log table for real-time analytics
CREATE TABLE IF NOT EXISTS public.realtime_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  user_id UUID REFERENCES public.profiles(id),
  organization_id UUID REFERENCES public.organizations(id),
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add index for realtime events
CREATE INDEX IF NOT EXISTS idx_realtime_events_org_type 
ON public.realtime_events (organization_id, event_type, created_at DESC);

-- Enable RLS on realtime events
ALTER TABLE public.realtime_events ENABLE ROW LEVEL SECURITY;

-- Create policy for realtime events
CREATE POLICY "Users can view organization realtime events" 
ON public.realtime_events 
FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- Create function to log realtime events
CREATE OR REPLACE FUNCTION public.log_realtime_event(
  p_event_type TEXT,
  p_table_name TEXT DEFAULT NULL,
  p_record_id UUID DEFAULT NULL,
  p_payload JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
  user_org_id UUID;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO user_org_id
  FROM public.profiles WHERE id = auth.uid();
  
  INSERT INTO public.realtime_events (
    event_type, table_name, record_id, user_id, organization_id, payload
  ) VALUES (
    p_event_type, p_table_name, p_record_id, auth.uid(), user_org_id, p_payload
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;