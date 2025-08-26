import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SupportTicket {
  id: string;
  organization_id: string;
  ticket_id: string;
  type: 'technical' | 'billing' | 'service' | 'complaint' | 'feature_request' | 'general' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  subject: string;
  description: string;
  user_email?: string;
  user_name?: string;
  user_phone?: string;
  user_id?: string;
  app_version?: string;
  device_info?: string;
  browser_info?: string;
  operating_system?: string;
  status: 'open' | 'in_progress' | 'waiting_for_customer' | 'waiting_for_third_party' | 'resolved' | 'closed';
  assigned_to?: string;
  assigned_date?: string;
  resolution?: string;
  resolution_date?: string;
  customer_satisfaction_rating?: number;
  customer_feedback?: string;
  internal_notes?: string;
  tags?: string[];
  attachments?: string[];
  related_tickets?: string[];
  escalation_level?: number;
  escalation_date?: string;
  escalated_to?: string;
  sla_target_hours?: number;
  sla_breach_hours?: number;
  first_response_time?: string;
  resolution_time?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  assigned_to_profile?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  user_profile?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  created_by_profile?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface CreateSupportTicketData {
  ticket_id: string;
  type: 'technical' | 'billing' | 'service' | 'complaint' | 'feature_request' | 'general' | 'emergency';
  priority?: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  subject: string;
  description: string;
  user_email?: string;
  user_name?: string;
  user_phone?: string;
  user_id?: string;
  app_version?: string;
  device_info?: string;
  browser_info?: string;
  operating_system?: string;
  tags?: string[];
  attachments?: string[];
}

export interface UpdateSupportTicketData {
  type?: 'technical' | 'billing' | 'service' | 'complaint' | 'feature_request' | 'general' | 'emergency';
  priority?: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  subject?: string;
  description?: string;
  status?: 'open' | 'in_progress' | 'waiting_for_customer' | 'waiting_for_third_party' | 'resolved' | 'closed';
  assigned_to?: string;
  resolution?: string;
  customer_satisfaction_rating?: number;
  customer_feedback?: string;
  internal_notes?: string;
  tags?: string[];
  attachments?: string[];
  related_tickets?: string[];
  escalation_level?: number;
  escalated_to?: string;
}

export const useSupportTickets = (organizationId?: string, status?: string, priority?: string, type?: string) => {
  const { profile } = useAuth();

  // Fetch support tickets with related data
  const { data: supportTickets = [], isLoading, error } = useQuery({
    queryKey: ['support-tickets', organizationId, status, priority, type],
    queryFn: async () => {
      if (!organizationId) return [];

      try {
        let query = supabase
          .from('support_tickets')
          .select(`
            *,
            assigned_to_profile:profiles!support_tickets_assigned_to_fkey(id, first_name, last_name, email),
            user_profile:profiles!support_tickets_user_id_fkey(id, first_name, last_name, email),
            created_by_profile:profiles!support_tickets_created_by_fkey(id, first_name, last_name)
          `)
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: false });

        // Filter by status if specified
        if (status && status !== 'all') {
          query = query.eq('status', status);
        }

        // Filter by priority if specified
        if (priority && priority !== 'all') {
          query = query.eq('priority', priority);
        }

        // Filter by type if specified
        if (type && type !== 'all') {
          query = query.eq('type', type);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          console.error('Error fetching support tickets:', fetchError);
          return [];
        }

        return data || [];
      } catch (error) {
        console.error('Error in support tickets query:', error);
        return [];
      }
    },
    enabled: !!organizationId,
  });

  // Calculate statistics
  const calculateStats = () => {
    if (!supportTickets || supportTickets.length === 0) {
      return {
        total: 0,
        byStatus: {
          open: 0,
          in_progress: 0,
          waiting_for_customer: 0,
          waiting_for_third_party: 0,
          resolved: 0,
          closed: 0,
        },
        byPriority: {
          low: 0,
          medium: 0,
          high: 0,
          urgent: 0,
          critical: 0,
        },
        byType: {
          technical: 0,
          billing: 0,
          service: 0,
          complaint: 0,
          feature_request: 0,
          general: 0,
          emergency: 0,
        },
        averageResolutionTime: 0,
        averageSatisfaction: 0,
        escalated: 0,
        slaBreaches: 0,
      };
    }

    const stats = {
      total: supportTickets.length,
      byStatus: {
        open: 0,
        in_progress: 0,
        waiting_for_customer: 0,
        waiting_for_third_party: 0,
        resolved: 0,
        closed: 0,
      },
      byPriority: {
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0,
        critical: 0,
      },
      byType: {
        technical: 0,
        billing: 0,
        service: 0,
        complaint: 0,
        feature_request: 0,
        general: 0,
        emergency: 0,
      },
      averageResolutionTime: 0,
      averageSatisfaction: 0,
      escalated: 0,
      slaBreaches: 0,
    };

    let totalResolutionTime = 0;
    let resolvedCount = 0;
    let totalSatisfaction = 0;
    let satisfactionCount = 0;

    supportTickets.forEach(ticket => {
      // Count by status
      if (ticket.status) {
        stats.byStatus[ticket.status as keyof typeof stats.byStatus]++;
      }

      // Count by priority
      if (ticket.priority) {
        stats.byPriority[ticket.priority as keyof typeof stats.byPriority]++;
      }

      // Count by type
      if (ticket.type) {
        stats.byType[ticket.type as keyof typeof stats.byType]++;
      }

      // Calculate resolution time
      if (ticket.resolution_date && ticket.created_at) {
        const created = new Date(ticket.created_at);
        const resolved = new Date(ticket.resolution_date);
        const resolutionTime = (resolved.getTime() - created.getTime()) / (1000 * 60 * 60); // hours
        totalResolutionTime += resolutionTime;
        resolvedCount++;
      }

      // Calculate satisfaction
      if (ticket.customer_satisfaction_rating) {
        totalSatisfaction += ticket.customer_satisfaction_rating;
        satisfactionCount++;
      }

      // Count escalated tickets
      if (ticket.escalation_level && ticket.escalation_level > 1) {
        stats.escalated++;
      }

      // Count SLA breaches
      if (ticket.sla_breach_hours && ticket.sla_breach_hours > 0) {
        stats.slaBreaches++;
      }
    });

    stats.averageResolutionTime = resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0;
    stats.averageSatisfaction = satisfactionCount > 0 ? totalSatisfaction / satisfactionCount : 0;

    return stats;
  };

  const stats = calculateStats();

  return {
    supportTickets,
    isLoading,
    error,
    stats,
    hasData: supportTickets.length > 0,
  };
};

export const useCreateSupportTicket = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (supportTicket: CreateSupportTicketData) => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID is required');
      }

      const { data, error } = await supabase
        .from('support_tickets')
        .insert([{
          ...supportTicket,
          organization_id: profile.organization_id,
          created_by: profile.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    },
  });
};

export const useUpdateSupportTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateSupportTicketData & { id: string }) => {
      const { data, error } = await supabase
        .from('support_tickets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    },
  });
};

export const useDeleteSupportTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('support_tickets')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    },
  });
};
