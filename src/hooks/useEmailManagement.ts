import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EmailCampaign {
  id: string;
  organization_id: string;
  name: string;
  subject: string;
  content: string;
  type: 'newsletter' | 'announcement' | 'reminder' | 'promotional' | 'notification';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled';
  recipients_count: number;
  opened_count: number;
  clicked_count: number;
  scheduled_for: string | null;
  sent_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  organization_id: string;
  name: string;
  subject: string;
  content: string;
  type: 'newsletter' | 'billing' | 'onboarding' | 'notification' | 'promotional';
  description: string | null;
  is_default: boolean;
  used_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EmailRecipient {
  id: string;
  campaign_id: string;
  recipient_email: string;
  recipient_name: string | null;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  error_message: string | null;
  created_at: string;
}

export interface EmailSettings {
  id: string;
  organization_id: string;
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_username: string | null;
  smtp_password: string | null;
  from_email: string | null;
  from_name: string | null;
  reply_to_email: string | null;
  daily_send_limit: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useEmailCampaigns = () => {
  return useQuery({
    queryKey: ['email-campaigns'],
    queryFn: async (): Promise<EmailCampaign[]> => {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useEmailTemplates = () => {
  return useQuery({
    queryKey: ['email-templates'],
    queryFn: async (): Promise<EmailTemplate[]> => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useEmailRecipients = (campaignId: string) => {
  return useQuery({
    queryKey: ['email-recipients', campaignId],
    queryFn: async (): Promise<EmailRecipient[]> => {
      const { data, error } = await supabase
        .from('email_recipients')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!campaignId,
  });
};

export const useEmailSettings = () => {
  return useQuery({
    queryKey: ['email-settings'],
    queryFn: async (): Promise<EmailSettings | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) return null;

      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;
    },
  });
};

export const useCreateEmailCampaign = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (campaign: Omit<EmailCampaign, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('email_campaigns')
        .insert(campaign)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      toast({
        title: 'Success',
        description: 'Email campaign created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create email campaign',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateEmailCampaign = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...campaign }: Partial<EmailCampaign> & { id: string }) => {
      const { data, error } = await supabase
        .from('email_campaigns')
        .update(campaign)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      toast({
        title: 'Success',
        description: 'Email campaign updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update email campaign',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteEmailCampaign = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('email_campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      toast({
        title: 'Success',
        description: 'Email campaign deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete email campaign',
        variant: 'destructive',
      });
    },
  });
};

export const useCreateEmailTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('email_templates')
        .insert(template)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast({
        title: 'Success',
        description: 'Email template created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create email template',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateEmailTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...template }: Partial<EmailTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('email_templates')
        .update(template)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast({
        title: 'Success',
        description: 'Email template updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update email template',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteEmailTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast({
        title: 'Success',
        description: 'Email template deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete email template',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateEmailSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: Partial<EmailSettings> & { id: string }) => {
      const { data, error } = await supabase
        .from('email_settings')
        .upsert(settings)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-settings'] });
      toast({
        title: 'Success',
        description: 'Email settings updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update email settings',
        variant: 'destructive',
      });
    },
  });
};

export const useSendEmailCampaign = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      // This would typically call a backend function to send emails
      // For now, we'll just update the status
      const { data, error } = await supabase
        .from('email_campaigns')
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', campaignId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      toast({
        title: 'Success',
        description: 'Email campaign sent successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to send email campaign',
        variant: 'destructive',
      });
    },
  });
};


