-- Phase 2: Real-time Infrastructure & Background Processing
-- Enable realtime for critical tables
ALTER TABLE public.driver_locations REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.enhanced_notifications REPLICA IDENTITY FULL;
ALTER TABLE public.jobs REPLICA IDENTITY FULL;
ALTER TABLE public.incidents REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.enhanced_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;

-- Create background task queue table
CREATE TABLE IF NOT EXISTS public.background_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  priority INTEGER NOT NULL DEFAULT 5,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  organization_id UUID REFERENCES public.organizations(id),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add indexes for background tasks
CREATE INDEX IF NOT EXISTS idx_background_tasks_status_priority 
ON public.background_tasks (status, priority, scheduled_at);

CREATE INDEX IF NOT EXISTS idx_background_tasks_organization 
ON public.background_tasks (organization_id, status);

-- Enable RLS on background tasks
ALTER TABLE public.background_tasks ENABLE ROW LEVEL SECURITY;

-- Create policy for background tasks
CREATE POLICY "Users can manage organization background tasks" 
ON public.background_tasks 
FOR ALL 
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- Create function to queue background tasks
CREATE OR REPLACE FUNCTION public.queue_background_task(
  p_task_type TEXT,
  p_payload JSONB DEFAULT '{}',
  p_priority INTEGER DEFAULT 5,
  p_scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS UUID AS $$
DECLARE
  task_id UUID;
  user_org_id UUID;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO user_org_id
  FROM public.profiles WHERE id = auth.uid();
  
  INSERT INTO public.background_tasks (
    task_type, payload, priority, scheduled_at, organization_id, created_by
  ) VALUES (
    p_task_type, p_payload, p_priority, p_scheduled_at, user_org_id, auth.uid()
  ) RETURNING id INTO task_id;
  
  RETURN task_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to process next background task
CREATE OR REPLACE FUNCTION public.get_next_background_task()
RETURNS TABLE(
  id UUID,
  task_type TEXT,
  payload JSONB,
  organization_id UUID
) AS $$
BEGIN
  -- Update and return the next task
  RETURN QUERY
  UPDATE public.background_tasks 
  SET 
    status = 'processing',
    started_at = NOW(),
    updated_at = NOW()
  WHERE id = (
    SELECT t.id FROM public.background_tasks t
    WHERE t.status = 'pending' 
    AND t.scheduled_at <= NOW()
    AND t.retry_count < t.max_retries
    ORDER BY t.priority ASC, t.scheduled_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  )
  RETURNING 
    background_tasks.id,
    background_tasks.task_type,
    background_tasks.payload,
    background_tasks.organization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to complete background task
CREATE OR REPLACE FUNCTION public.complete_background_task(
  p_task_id UUID,
  p_status TEXT DEFAULT 'completed',
  p_error_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.background_tasks 
  SET 
    status = p_status,
    completed_at = CASE WHEN p_status = 'completed' THEN NOW() ELSE NULL END,
    error_message = p_error_message,
    retry_count = CASE WHEN p_status = 'failed' THEN retry_count + 1 ELSE retry_count END,
    updated_at = NOW()
  WHERE id = p_task_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create real-time notification trigger
CREATE OR REPLACE FUNCTION public.notify_realtime_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Send notification for real-time updates
  PERFORM pg_notify(
    'realtime_update',
    json_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'record_id', COALESCE(NEW.id, OLD.id),
      'organization_id', COALESCE(NEW.organization_id, OLD.organization_id)
    )::text
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Add triggers for real-time notifications
DROP TRIGGER IF EXISTS trigger_driver_locations_realtime ON public.driver_locations;
CREATE TRIGGER trigger_driver_locations_realtime
  AFTER INSERT OR UPDATE OR DELETE ON public.driver_locations
  FOR EACH ROW EXECUTE FUNCTION public.notify_realtime_changes();

DROP TRIGGER IF EXISTS trigger_jobs_realtime ON public.jobs;
CREATE TRIGGER trigger_jobs_realtime
  AFTER INSERT OR UPDATE OR DELETE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.notify_realtime_changes();