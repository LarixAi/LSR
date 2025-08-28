-- Fix Security Issues for New Tables

-- 1. Enable RLS on new tables
ALTER TABLE public.query_performance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.query_cache ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS policies for query_performance_logs
CREATE POLICY "Users can view their organization's performance logs" ON public.query_performance_logs
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can create performance logs" ON public.query_performance_logs
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- 3. Create RLS policies for query_cache
CREATE POLICY "Users can view their organization's cache" ON public.query_cache
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can manage their organization's cache" ON public.query_cache
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));