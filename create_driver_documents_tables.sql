-- Create driver_documents table for driver-specific document management
CREATE TABLE IF NOT EXISTS public.driver_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  file_name TEXT,
  file_path TEXT,
  file_url TEXT,
  file_type TEXT,
  file_size INTEGER,
  status TEXT DEFAULT 'required' CHECK (status IN ('required', 'uploaded', 'pending_review', 'approved', 'expired', 'rejected')),
  expiry_date DATE,
  due_date DATE,
  requested_at TIMESTAMPTZ DEFAULT now(),
  requested_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  is_urgent BOOLEAN DEFAULT false,
  admin_notes TEXT,
  driver_notes TEXT,
  review_date TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_driver_documents_organization_id ON public.driver_documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_driver_documents_driver_id ON public.driver_documents(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_documents_category ON public.driver_documents(category);
CREATE INDEX IF NOT EXISTS idx_driver_documents_status ON public.driver_documents(status);
CREATE INDEX IF NOT EXISTS idx_driver_documents_requested_by ON public.driver_documents(requested_by);
CREATE INDEX IF NOT EXISTS idx_driver_documents_uploaded_by ON public.driver_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_driver_documents_created_at ON public.driver_documents(created_at);
CREATE INDEX IF NOT EXISTS idx_driver_documents_due_date ON public.driver_documents(due_date);

-- Enable Row Level Security
ALTER TABLE public.driver_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for driver documents
CREATE POLICY "driver_documents_org_isolation" ON public.driver_documents
FOR ALL USING (
  organization_id = (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- Allow drivers to see their own documents
CREATE POLICY "driver_documents_driver_access" ON public.driver_documents
FOR SELECT USING (
  driver_id = auth.uid() OR
  requested_by = auth.uid() OR
  uploaded_by = auth.uid()
);

-- Allow drivers to update their own uploaded documents
CREATE POLICY "driver_documents_driver_update" ON public.driver_documents
FOR UPDATE USING (
  driver_id = auth.uid() OR
  uploaded_by = auth.uid()
);

-- Allow admins to manage all driver documents in their organization
CREATE POLICY "driver_documents_admin_access" ON public.driver_documents
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND organization_id = driver_documents.organization_id
    AND role IN ('admin', 'council')
  )
);

-- Create notifications table for admin-driver communication
CREATE TABLE IF NOT EXISTS public.document_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.driver_documents(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('document_requested', 'document_uploaded', 'document_approved', 'document_rejected', 'document_expired', 'document_due_soon')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  read_at TIMESTAMPTZ
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_document_notifications_driver_id ON public.document_notifications(driver_id);
CREATE INDEX IF NOT EXISTS idx_document_notifications_admin_id ON public.document_notifications(admin_id);
CREATE INDEX IF NOT EXISTS idx_document_notifications_organization_id ON public.document_notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_document_notifications_is_read ON public.document_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_document_notifications_created_at ON public.document_notifications(created_at);

-- Enable RLS for notifications
ALTER TABLE public.document_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notifications
CREATE POLICY "document_notifications_org_isolation" ON public.document_notifications
FOR ALL USING (
  organization_id = (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- Allow users to see their own notifications
CREATE POLICY "document_notifications_user_access" ON public.document_notifications
FOR SELECT USING (
  driver_id = auth.uid() OR
  admin_id = auth.uid()
);

-- Allow users to update their own notifications (mark as read)
CREATE POLICY "document_notifications_user_update" ON public.document_notifications
FOR UPDATE USING (
  driver_id = auth.uid() OR
  admin_id = auth.uid()
);

-- Create function to automatically create notifications
CREATE OR REPLACE FUNCTION create_document_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- When a driver document is created
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.document_notifications (
      document_id,
      driver_id,
      admin_id,
      organization_id,
      type,
      title,
      message
    ) VALUES (
      NEW.id,
      NEW.driver_id,
      NEW.requested_by,
      NEW.organization_id,
      'document_requested',
      'Document Requested',
      'A new document has been requested: ' || NEW.name
    );
  END IF;
  
  -- When a driver uploads a document
  IF TG_OP = 'UPDATE' AND OLD.status = 'required' AND NEW.status = 'uploaded' THEN
    INSERT INTO public.document_notifications (
      document_id,
      driver_id,
      admin_id,
      organization_id,
      type,
      title,
      message
    ) VALUES (
      NEW.id,
      NEW.driver_id,
      NEW.requested_by,
      NEW.organization_id,
      'document_uploaded',
      'Document Uploaded',
      'Document uploaded for review: ' || NEW.name
    );
  END IF;
  
  -- When admin approves/rejects a document
  IF TG_OP = 'UPDATE' AND OLD.status = 'uploaded' AND (NEW.status = 'approved' OR NEW.status = 'rejected') THEN
    INSERT INTO public.document_notifications (
      document_id,
      driver_id,
      admin_id,
      organization_id,
      type,
      title,
      message
    ) VALUES (
      NEW.id,
      NEW.driver_id,
      NEW.reviewed_by,
      NEW.organization_id,
      CASE 
        WHEN NEW.status = 'approved' THEN 'document_approved'
        ELSE 'document_rejected'
      END,
      CASE 
        WHEN NEW.status = 'approved' THEN 'Document Approved'
        ELSE 'Document Rejected'
      END,
      CASE 
        WHEN NEW.status = 'approved' THEN 'Your document has been approved: ' || NEW.name
        ELSE 'Your document has been rejected: ' || NEW.name || COALESCE(' - ' || NEW.admin_notes, '')
      END
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for document notifications
CREATE TRIGGER trigger_document_notifications
  AFTER INSERT OR UPDATE ON public.driver_documents
  FOR EACH ROW
  EXECUTE FUNCTION create_document_notification();

