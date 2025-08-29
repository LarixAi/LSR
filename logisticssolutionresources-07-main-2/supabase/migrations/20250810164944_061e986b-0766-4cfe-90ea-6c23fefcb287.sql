-- Migration: Fix missing AI tables and align schema with app usage
-- 1) Add missing columns to profiles (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='profiles' AND column_name='avatar_url'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='profiles' AND column_name='employment_status'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN employment_status text DEFAULT 'active';
  END IF;
END $$;

-- 2) Helper function to safely fetch current user's organization (avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_organization()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- 3) ai_context table aligned with code (trackInteraction writes here)
CREATE TABLE IF NOT EXISTS public.ai_context (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  page_context text NOT NULL,
  interaction_type text NOT NULL,
  interaction_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  session_id text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_context ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies for idempotency
DROP POLICY IF EXISTS "AI context: org members can select" ON public.ai_context;
DROP POLICY IF EXISTS "AI context: users can insert in their org" ON public.ai_context;

CREATE POLICY "AI context: org members can select"
ON public.ai_context
FOR SELECT
USING (organization_id = public.get_current_user_organization());

CREATE POLICY "AI context: users can insert in their org"
ON public.ai_context
FOR INSERT
WITH CHECK (
  organization_id = public.get_current_user_organization() AND user_id = auth.uid()
);

CREATE INDEX IF NOT EXISTS idx_ai_context_org_page ON public.ai_context(organization_id, page_context);

-- updated_at trigger
DROP TRIGGER IF EXISTS update_ai_context_updated_at ON public.ai_context;
CREATE TRIGGER update_ai_context_updated_at
BEFORE UPDATE ON public.ai_context
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 4) ai_tasks table aligned with code (useAIAssistant relies on these columns)
CREATE TABLE IF NOT EXISTS public.ai_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  task_type text NOT NULL DEFAULT 'general',
  status text NOT NULL DEFAULT 'pending',
  priority text NOT NULL DEFAULT 'medium',
  due_date timestamptz,
  estimated_hours numeric,
  actual_hours numeric,
  parent_task_id uuid,
  task_order integer,
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  ai_generated boolean DEFAULT false,
  ai_confidence numeric,
  auto_created_by text,
  linked_vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE SET NULL,
  linked_driver_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  linked_route_id uuid REFERENCES public.routes(id) ON DELETE SET NULL,
  linked_job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
  tags text[] DEFAULT '{}',
  custom_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "AI tasks: org members can select" ON public.ai_tasks;
DROP POLICY IF EXISTS "AI tasks: users can insert" ON public.ai_tasks;
DROP POLICY IF EXISTS "AI tasks: creators/assignees can update" ON public.ai_tasks;

CREATE POLICY "AI tasks: org members can select"
ON public.ai_tasks
FOR SELECT
USING (organization_id = public.get_current_user_organization());

CREATE POLICY "AI tasks: users can insert"
ON public.ai_tasks
FOR INSERT
WITH CHECK (
  organization_id = public.get_current_user_organization() AND created_by = auth.uid()
);

CREATE POLICY "AI tasks: creators/assignees can update"
ON public.ai_tasks
FOR UPDATE
USING (
  organization_id = public.get_current_user_organization() AND (
    created_by = auth.uid() OR assigned_to = auth.uid() OR public.is_admin_user(auth.uid())
  )
)
WITH CHECK (
  organization_id = public.get_current_user_organization()
);

CREATE INDEX IF NOT EXISTS idx_ai_tasks_org_status ON public.ai_tasks(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_org_priority ON public.ai_tasks(organization_id, priority);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_org_created_at ON public.ai_tasks(organization_id, created_at DESC);

DROP TRIGGER IF EXISTS update_ai_tasks_updated_at ON public.ai_tasks;
CREATE TRIGGER update_ai_tasks_updated_at
BEFORE UPDATE ON public.ai_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 5) ai_insights table aligned with code
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  insight_type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  confidence_score numeric,
  context_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  related_entity_type text,
  related_entity_id uuid,
  suggested_actions jsonb DEFAULT '[]'::jsonb,
  action_taken boolean DEFAULT false,
  action_taken_at timestamptz,
  action_taken_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active',
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "AI insights: org members can select" ON public.ai_insights;
DROP POLICY IF EXISTS "AI insights: org members can insert" ON public.ai_insights;
DROP POLICY IF EXISTS "AI insights: org members can update" ON public.ai_insights;

CREATE POLICY "AI insights: org members can select"
ON public.ai_insights
FOR SELECT
USING (organization_id = public.get_current_user_organization());

CREATE POLICY "AI insights: org members can insert"
ON public.ai_insights
FOR INSERT
WITH CHECK (organization_id = public.get_current_user_organization());

CREATE POLICY "AI insights: org members can update"
ON public.ai_insights
FOR UPDATE
USING (organization_id = public.get_current_user_organization())
WITH CHECK (organization_id = public.get_current_user_organization());

CREATE INDEX IF NOT EXISTS idx_ai_insights_org_type ON public.ai_insights(organization_id, insight_type);
CREATE INDEX IF NOT EXISTS idx_ai_insights_org_status ON public.ai_insights(organization_id, status);

DROP TRIGGER IF EXISTS update_ai_insights_updated_at ON public.ai_insights;
CREATE TRIGGER update_ai_insights_updated_at
BEFORE UPDATE ON public.ai_insights
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 6) subscription_usage table used by useSubscription hooks
CREATE TABLE IF NOT EXISTS public.subscription_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  feature_name text NOT NULL,
  usage_count integer NOT NULL DEFAULT 0,
  usage_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, feature_name, usage_date)
);
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Subscription usage: org members can select" ON public.subscription_usage;
DROP POLICY IF EXISTS "Subscription usage: org members can insert" ON public.subscription_usage;
DROP POLICY IF EXISTS "Subscription usage: org members can update" ON public.subscription_usage;

CREATE POLICY "Subscription usage: org members can select"
ON public.subscription_usage
FOR SELECT
USING (organization_id = public.get_current_user_organization());

CREATE POLICY "Subscription usage: org members can insert"
ON public.subscription_usage
FOR INSERT
WITH CHECK (organization_id = public.get_current_user_organization());

CREATE POLICY "Subscription usage: org members can update"
ON public.subscription_usage
FOR UPDATE
USING (organization_id = public.get_current_user_organization())
WITH CHECK (organization_id = public.get_current_user_organization());

CREATE INDEX IF NOT EXISTS idx_subscription_usage_org_date ON public.subscription_usage(organization_id, usage_date);

DROP TRIGGER IF EXISTS update_subscription_usage_updated_at ON public.subscription_usage;
CREATE TRIGGER update_subscription_usage_updated_at
BEFORE UPDATE ON public.subscription_usage
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 7) Profiles: allow org members to select org profiles (fix 400 on profiles join)
DROP POLICY IF EXISTS "Org members can view org profiles" ON public.profiles;
CREATE POLICY "Org members can view org profiles"
ON public.profiles
FOR SELECT
USING (organization_id = public.get_current_user_organization());