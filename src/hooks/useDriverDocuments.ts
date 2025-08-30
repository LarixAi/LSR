import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface DriverDocument {
  id: string;
  name: string;
  category: string;
  description?: string;
  file_name?: string;
  file_path?: string;
  file_url?: string;
  file_type?: string;
  file_size?: number;
  status: 'required' | 'uploaded' | 'pending_review' | 'approved' | 'expired' | 'rejected';
  expiry_date?: string;
  due_date?: string;
  requested_at: string;
  requested_by?: string;
  uploaded_at?: string;
  uploaded_by?: string;
  driver_id: string;
  organization_id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  is_urgent: boolean;
  admin_notes?: string;
  driver_notes?: string;
  review_date?: string;
  reviewed_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentNotification {
  id: string;
  document_id?: string;
  driver_id: string;
  admin_id?: string;
  organization_id: string;
  type: 'document_requested' | 'document_uploaded' | 'document_approved' | 'document_rejected' | 'document_expired' | 'document_due_soon';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

// Hook to fetch driver documents
export const useDriverDocuments = (driverId?: string) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['driver-documents', driverId || profile?.id, profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      const targetDriverId = driverId || profile?.id;
      if (!targetDriverId) {
        throw new Error('Driver ID is required');
      }

      console.log('Fetching driver documents for driver:', targetDriverId);
      
      const { data, error } = await supabase
        .from('driver_documents')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('driver_id', targetDriverId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching driver documents:', error);
        throw error;
      }

      console.log('Fetched driver documents:', data);
      return (data || []) as DriverDocument[];
    },
    enabled: !!profile?.organization_id && !!(driverId || profile?.id),
  });
};

// Hook to fetch all driver documents (for admin view)
export const useAllDriverDocuments = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['all-driver-documents', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      console.log('Fetching all driver documents for organization:', profile.organization_id);
      
      const { data, error } = await supabase
        .from('driver_documents')
        .select(`
          *,
          driver:driver_id(first_name, last_name, email),
          requester:requested_by(first_name, last_name),
          uploader:uploaded_by(first_name, last_name),
          reviewer:reviewed_by(first_name, last_name)
        `)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all driver documents:', error);
        throw error;
      }

      console.log('Fetched all driver documents:', data);
      return (data || []) as (DriverDocument & {
        driver: { first_name: string; last_name: string; email: string };
        requester: { first_name: string; last_name: string };
        uploader: { first_name: string; last_name: string };
        reviewer: { first_name: string; last_name: string };
      })[];
    },
    enabled: !!profile?.organization_id && (profile?.role === 'admin' || profile?.role === 'council'),
  });
};

// Hook to create a driver document request (admin only)
export const useCreateDriverDocumentRequest = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentData: {
      name: string;
      category: string;
      description?: string;
      driver_id: string;
      due_date?: string;
      priority?: 'low' | 'medium' | 'high' | 'critical';
      is_urgent?: boolean;
    }) => {
      if (!profile?.organization_id || !profile?.id) {
        throw new Error('Organization and user information required');
      }

      const { data, error } = await supabase
        .from('driver_documents')
        .insert({
          ...documentData,
          organization_id: profile.organization_id,
          requested_by: profile.id,
          status: 'required',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-documents'] });
      queryClient.invalidateQueries({ queryKey: ['all-driver-documents'] });
      queryClient.invalidateQueries({ queryKey: ['document-notifications'] });
      toast.success('Document request created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating document request:', error);
      toast.error('Failed to create document request: ' + error.message);
    }
  });
};

// Hook to upload a driver document (driver only)
export const useUploadDriverDocument = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      documentId, 
      file, 
      notes 
    }: { 
      documentId: string; 
      file: File; 
      notes?: string;
    }) => {
      if (!profile?.organization_id || !profile?.id) {
        throw new Error('Organization and user information required');
      }

      // Upload file to storage
      const fileName = `${documentId}_${Date.now()}_${file.name}`;
      const filePath = `driver-documents/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Update document record
      const { data, error } = await supabase
        .from('driver_documents')
        .update({
          file_name: file.name,
          file_path: filePath,
          file_url: urlData.publicUrl,
          file_type: file.type,
          file_size: file.size,
          status: 'uploaded',
          uploaded_at: new Date().toISOString(),
          uploaded_by: profile.id,
          driver_notes: notes,
        })
        .eq('id', documentId)
        .eq('driver_id', profile.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-documents'] });
      queryClient.invalidateQueries({ queryKey: ['all-driver-documents'] });
      queryClient.invalidateQueries({ queryKey: ['document-notifications'] });
      toast.success('Document uploaded successfully');
    },
    onError: (error: any) => {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document: ' + error.message);
    }
  });
};

// Hook to review a driver document (admin only)
export const useReviewDriverDocument = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      documentId, 
      status, 
      notes 
    }: { 
      documentId: string; 
      status: 'approved' | 'rejected'; 
      notes?: string;
    }) => {
      if (!profile?.organization_id || !profile?.id) {
        throw new Error('Organization and user information required');
      }

      const { data, error } = await supabase
        .from('driver_documents')
        .update({
          status,
          admin_notes: notes,
          review_date: new Date().toISOString(),
          reviewed_by: profile.id,
        })
        .eq('id', documentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-documents'] });
      queryClient.invalidateQueries({ queryKey: ['all-driver-documents'] });
      queryClient.invalidateQueries({ queryKey: ['document-notifications'] });
      toast.success('Document review completed');
    },
    onError: (error: any) => {
      console.error('Error reviewing document:', error);
      toast.error('Failed to review document: ' + error.message);
    }
  });
};

// Hook to fetch document notifications
export const useDocumentNotifications = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['document-notifications', profile?.id, profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id || !profile?.id) {
        throw new Error('User information required');
      }

      console.log('Fetching document notifications for user:', profile.id);
      
      const { data, error } = await supabase
        .from('document_notifications')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .or(`driver_id.eq.${profile.id},admin_id.eq.${profile.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching document notifications:', error);
        throw error;
      }

      console.log('Fetched document notifications:', data);
      return (data || []) as DocumentNotification[];
    },
    enabled: !!profile?.organization_id && !!profile?.id,
  });
};

// Hook to mark notification as read
export const useMarkNotificationRead = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data, error } = await supabase
        .from('document_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-notifications'] });
    },
    onError: (error: any) => {
      console.error('Error marking notification as read:', error);
    }
  });
};

// Hook to get driver document statistics
export const useDriverDocumentStats = (driverId?: string) => {
  const { data: documents = [] } = useDriverDocuments(driverId);

  const stats = {
    total: documents.length,
    required: documents.filter(doc => doc.status === 'required').length,
    uploaded: documents.filter(doc => doc.status === 'uploaded').length,
    pending_review: documents.filter(doc => doc.status === 'pending_review').length,
    approved: documents.filter(doc => doc.status === 'approved').length,
    rejected: documents.filter(doc => doc.status === 'rejected').length,
    expired: documents.filter(doc => doc.status === 'expired').length,
    urgent: documents.filter(doc => doc.is_urgent).length,
    by_category: documents.reduce((acc, doc) => {
      const category = doc.category || 'other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    by_priority: documents.reduce((acc, doc) => {
      const priority = doc.priority || 'medium';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return stats;
};



