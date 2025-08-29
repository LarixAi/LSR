
-- Create a table for driver-parent communications
CREATE TABLE public.route_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL CHECK (message_type IN ('delay', 'incident', 'pickup_alert', 'route_started')),
  message TEXT NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'read')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create a table for student-parent relationships and pickup locations
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  pickup_location TEXT NOT NULL,
  pickup_time TIME,
  route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.route_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- RLS policies for route_communications
CREATE POLICY "Drivers can view their route communications" 
  ON public.route_communications 
  FOR SELECT 
  USING (auth.uid() = driver_id);

CREATE POLICY "Parents can view their communications" 
  ON public.route_communications 
  FOR SELECT 
  USING (auth.uid() = parent_id);

CREATE POLICY "Drivers can insert communications" 
  ON public.route_communications 
  FOR INSERT 
  WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Parents can update read status" 
  ON public.route_communications 
  FOR UPDATE 
  USING (auth.uid() = parent_id);

-- RLS policies for students
CREATE POLICY "Parents can view their students" 
  ON public.students 
  FOR SELECT 
  USING (auth.uid() = parent_id);

CREATE POLICY "Drivers can view students on their routes" 
  ON public.students 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.driver_assignments da 
      WHERE da.driver_id = auth.uid() 
      AND da.route_id = students.route_id 
      AND da.is_active = true
    )
  );

-- Enable realtime for notifications
ALTER TABLE public.route_communications REPLICA IDENTITY FULL;
ALTER TABLE public.students REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.route_communications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.students;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
