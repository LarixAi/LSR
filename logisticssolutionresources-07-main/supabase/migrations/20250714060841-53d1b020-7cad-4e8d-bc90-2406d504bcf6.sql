-- Create AI-powered task management system inspired by ClickUp
-- Core task management tables
CREATE TABLE public.ai_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL DEFAULT 'general', -- transport, maintenance, compliance, route, driver
  status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, blocked
  priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
  due_date TIMESTAMP WITH TIME ZONE,
  estimated_hours NUMERIC,
  actual_hours NUMERIC DEFAULT 0,
  
  -- Hierarchy support
  parent_task_id UUID REFERENCES public.ai_tasks(id),
  task_order INTEGER DEFAULT 0,
  
  -- Assignments
  assigned_to UUID REFERENCES public.profiles(id),
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  
  -- AI features
  ai_generated BOOLEAN DEFAULT false,
  ai_confidence NUMERIC CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
  auto_created_by TEXT, -- rule that created this task
  
  -- Context linking
  linked_vehicle_id UUID REFERENCES public.vehicles(id),
  linked_driver_id UUID REFERENCES public.profiles(id),
  linked_route_id UUID REFERENCES public.routes(id),
  linked_job_id UUID REFERENCES public.jobs(id),
  
  -- Metadata
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Task dependencies
CREATE TABLE public.ai_task_dependencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.ai_tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES public.ai_tasks(id) ON DELETE CASCADE,
  dependency_type TEXT NOT NULL DEFAULT 'finish_to_start', -- finish_to_start, start_to_start, finish_to_finish
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, depends_on_task_id)
);

-- AI context and learning
CREATE TABLE public.ai_context (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  page_context TEXT NOT NULL, -- dashboard, vehicles, drivers, routes, compliance, etc.
  interaction_type TEXT NOT NULL, -- view, click, create, update, search, etc.
  interaction_data JSONB DEFAULT '{}',
  session_id TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI automation rules (ClickUp-style automations)
CREATE TABLE public.ai_automation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  
  -- Trigger conditions
  trigger_type TEXT NOT NULL, -- time_based, event_based, condition_based
  trigger_conditions JSONB NOT NULL, -- when vehicle maintenance due, when driver compliance expires, etc.
  
  -- Actions to perform
  actions JSONB NOT NULL, -- create task, send notification, assign to user, etc.
  
  -- Status and metrics
  is_active BOOLEAN DEFAULT true,
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI insights and recommendations
CREATE TABLE public.ai_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  insight_type TEXT NOT NULL, -- maintenance_prediction, route_optimization, compliance_alert, performance_insight
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
  
  -- Context
  context_data JSONB DEFAULT '{}',
  related_entity_type TEXT, -- vehicle, driver, route, job
  related_entity_id UUID,
  
  -- Actions
  suggested_actions JSONB DEFAULT '[]',
  action_taken BOOLEAN DEFAULT false,
  action_taken_at TIMESTAMP WITH TIME ZONE,
  action_taken_by UUID REFERENCES public.profiles(id),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active', -- active, dismissed, resolved
  expires_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Time tracking for tasks
CREATE TABLE public.ai_task_time_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.ai_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  description TEXT,
  billable BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_ai_tasks_organization_id ON public.ai_tasks(organization_id);
CREATE INDEX idx_ai_tasks_assigned_to ON public.ai_tasks(assigned_to);
CREATE INDEX idx_ai_tasks_status ON public.ai_tasks(status);
CREATE INDEX idx_ai_tasks_due_date ON public.ai_tasks(due_date);
CREATE INDEX idx_ai_tasks_parent_task_id ON public.ai_tasks(parent_task_id);
CREATE INDEX idx_ai_tasks_task_type ON public.ai_tasks(task_type);

CREATE INDEX idx_ai_context_user_id ON public.ai_context(user_id);
CREATE INDEX idx_ai_context_page_context ON public.ai_context(page_context);
CREATE INDEX idx_ai_context_created_at ON public.ai_context(created_at);

CREATE INDEX idx_ai_insights_organization_id ON public.ai_insights(organization_id);
CREATE INDEX idx_ai_insights_status ON public.ai_insights(status);
CREATE INDEX idx_ai_insights_insight_type ON public.ai_insights(insight_type);

CREATE INDEX idx_ai_task_time_entries_task_id ON public.ai_task_time_entries(task_id);
CREATE INDEX idx_ai_task_time_entries_user_id ON public.ai_task_time_entries(user_id);

-- Enable RLS
ALTER TABLE public.ai_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_task_time_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_tasks
CREATE POLICY "Users can view tasks in their organization" ON public.ai_tasks
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create tasks in their organization" ON public.ai_tasks
  FOR INSERT WITH CHECK (organization_id = get_user_organization_id() AND created_by = auth.uid());

CREATE POLICY "Users can update tasks in their organization" ON public.ai_tasks
  FOR UPDATE USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can delete tasks" ON public.ai_tasks
  FOR DELETE USING (organization_id = get_user_organization_id() AND is_organization_admin());

-- RLS Policies for ai_task_dependencies
CREATE POLICY "Users can view task dependencies in their organization" ON public.ai_task_dependencies
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.ai_tasks 
    WHERE id = ai_task_dependencies.task_id 
    AND organization_id = get_user_organization_id()
  ));

CREATE POLICY "Users can manage task dependencies in their organization" ON public.ai_task_dependencies
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.ai_tasks 
    WHERE id = ai_task_dependencies.task_id 
    AND organization_id = get_user_organization_id()
  ));

-- RLS Policies for ai_context
CREATE POLICY "Users can view their own context" ON public.ai_context
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own context" ON public.ai_context
  FOR INSERT WITH CHECK (user_id = auth.uid() AND organization_id = get_user_organization_id());

-- RLS Policies for ai_automation_rules
CREATE POLICY "Users can view automation rules in their organization" ON public.ai_automation_rules
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage automation rules" ON public.ai_automation_rules
  FOR ALL USING (organization_id = get_user_organization_id() AND is_organization_admin());

-- RLS Policies for ai_insights
CREATE POLICY "Users can view insights in their organization" ON public.ai_insights
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can update insights in their organization" ON public.ai_insights
  FOR UPDATE USING (organization_id = get_user_organization_id());

-- RLS Policies for ai_task_time_entries
CREATE POLICY "Users can view time entries for their organization's tasks" ON public.ai_task_time_entries
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.ai_tasks 
    WHERE id = ai_task_time_entries.task_id 
    AND organization_id = get_user_organization_id()
  ));

CREATE POLICY "Users can manage their own time entries" ON public.ai_task_time_entries
  FOR ALL USING (user_id = auth.uid());

-- Updated at triggers
CREATE TRIGGER update_ai_tasks_updated_at
  BEFORE UPDATE ON public.ai_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_automation_rules_updated_at
  BEFORE UPDATE ON public.ai_automation_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_insights_updated_at
  BEFORE UPDATE ON public.ai_insights
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();