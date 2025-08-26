import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import EmailService from '@/services/emailService';

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'agreement_update' | 'reminder' | 'welcome';
  is_active: boolean;
  created_at: string;
}

export interface NotificationLog {
  id: string;
  user_id: string;
  agreement_id: string;
  notification_type: string;
  sent_at: string;
  status: 'sent' | 'failed' | 'pending';
  error_message?: string;
  user_email: string;
  agreement_title: string;
}

export interface SendNotificationData {
  agreement_id: string;
  notification_type: 'agreement_update' | 'reminder';
  template_id?: string;
  custom_subject?: string;
  custom_body?: string;
  user_ids?: string[];
  send_to_all?: boolean;
}

export const useAgreementNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get notification templates
  const {
    data: templates,
    isLoading: isLoadingTemplates,
    error: templatesError
  } = useQuery({
    queryKey: ['notification-templates'],
    queryFn: async (): Promise<NotificationTemplate[]> => {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Get notification logs
  const {
    data: notificationLogs,
    isLoading: isLoadingLogs,
    error: logsError
  } = useQuery({
    queryKey: ['notification-logs'],
    queryFn: async (): Promise<NotificationLog[]> => {
      const { data, error } = await supabase
        .from('notification_logs')
        .select(`
          *,
          user_agreements!inner(title),
          profiles!inner(email)
        `)
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    }
  });

  // Send notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: async (data: SendNotificationData) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Get the agreement details
      const { data: agreement, error: agreementError } = await supabase
        .from('user_agreements')
        .select('*')
        .eq('id', data.agreement_id)
        .single();

      if (agreementError || !agreement) {
        throw new Error('Agreement not found');
      }

      // Get users to notify
      let usersToNotify: any[] = [];
      
      if (data.send_to_all) {
        // Get all users who haven't accepted this agreement version
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email, first_name, last_name')
          .or(`terms_version.neq.${agreement.version},privacy_policy_version.neq.${agreement.version}`);

        usersToNotify = profiles || [];
      } else if (data.user_ids && data.user_ids.length > 0) {
        // Get specific users
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email, first_name, last_name')
          .in('id', data.user_ids);

        usersToNotify = profiles || [];
      }

      // Get notification template
      let template: NotificationTemplate | null = null;
      if (data.template_id) {
        const { data: templateData } = await supabase
          .from('notification_templates')
          .select('*')
          .eq('id', data.template_id)
          .single();
        template = templateData;
      }

      // Prepare notification content
      const subject = data.custom_subject || template?.subject || `Updated ${agreement.title}`;
      const body = data.custom_body || template?.body || `Please review and accept the updated ${agreement.title}.`;

      // Send notifications to each user
      const notificationPromises = usersToNotify.map(async (userProfile) => {
        try {
          // Log the notification
          const { error: logError } = await supabase
            .from('notification_logs')
            .insert({
              user_id: userProfile.id,
              agreement_id: data.agreement_id,
              notification_type: data.notification_type,
              status: 'pending',
              user_email: userProfile.email,
              agreement_title: agreement.title
            });

          if (logError) throw logError;

          // Send actual email using Resend
          let emailSuccess = false;
                                if (data.notification_type === 'agreement_update') {
                        emailSuccess = await EmailService.sendAgreementNotification({
                          to: userProfile.email,
                          firstName: userProfile.first_name || 'User',
                          lastName: userProfile.last_name,
                          email: userProfile.email,
                          agreementTitle: agreement.title,
                          agreementType: agreement.agreement_type.replace('_', ' '),
                          loginUrl: `${window.location.origin}/auth`
                        });
                      } else if (data.notification_type === 'reminder') {
                        emailSuccess = await EmailService.sendReminderEmail({
                          to: userProfile.email,
                          firstName: userProfile.first_name || 'User',
                          lastName: userProfile.last_name,
                          email: userProfile.email,
                          agreementTitle: agreement.title,
                          agreementType: agreement.agreement_type.replace('_', ' '),
                          loginUrl: `${window.location.origin}/auth`
                        });
                      }

          // Update log status based on email result
          await supabase
            .from('notification_logs')
            .update({ 
              status: emailSuccess ? 'sent' : 'failed', 
              sent_at: new Date().toISOString(),
              error_message: emailSuccess ? null : 'Email delivery failed'
            })
            .eq('user_id', userProfile.id)
            .eq('agreement_id', data.agreement_id);

          return { success: emailSuccess, user: userProfile.email };
        } catch (error) {
          // Update log status to failed
          await supabase
            .from('notification_logs')
            .update({ 
              status: 'failed', 
              error_message: error instanceof Error ? error.message : 'Unknown error',
              sent_at: new Date().toISOString()
            })
            .eq('user_id', userProfile.id)
            .eq('agreement_id', data.agreement_id);

          return { success: false, user: userProfile.email, error };
        }
      });

      const results = await Promise.all(notificationPromises);
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      return {
        total: results.length,
        successful,
        failed,
        results
      };
    },
    onSuccess: (data) => {
      toast({
        title: "Notifications Sent",
        description: `Successfully sent ${data.successful} notifications. ${data.failed} failed.`,
      });
      
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['notification-logs'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send notifications",
        variant: "destructive",
      });
    }
  });

  // Create notification template
  const createTemplateMutation = useMutation({
    mutationFn: async (template: Omit<NotificationTemplate, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('notification_templates')
        .insert({
          ...template,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Template Created",
        description: "Notification template created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create template",
        variant: "destructive",
      });
    }
  });

  // Get users who need to accept agreements
  const {
    data: usersNeedingAcceptance,
    isLoading: isLoadingUsers
  } = useQuery({
    queryKey: ['users-needing-acceptance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          terms_accepted,
          terms_version,
          privacy_policy_accepted,
          privacy_policy_version
        `);

      if (error) throw error;

      // Get latest agreement versions
      const { data: latestTerms } = await supabase
        .rpc('get_latest_agreement_version', { agreement_type_param: 'terms_of_service' });
      
      const { data: latestPrivacy } = await supabase
        .rpc('get_latest_agreement_version', { agreement_type_param: 'privacy_policy' });

      // Filter users who need to accept agreements
      return data?.filter(user => 
        !user.terms_accepted || 
        user.terms_version !== latestTerms ||
        !user.privacy_policy_accepted ||
        user.privacy_policy_version !== latestPrivacy
      ) || [];
    }
  });

  // Send reminder notifications
  const sendReminderNotifications = async (userIds?: string[]) => {
    const targetUsers = userIds || usersNeedingAcceptance?.map(u => u.id) || [];
    
    if (targetUsers.length === 0) {
      toast({
        title: "No Users",
        description: "No users need to accept agreements",
      });
      return;
    }

    // Get the latest agreements
    const { data: agreements } = await supabase
      .from('user_agreements')
      .select('*')
      .eq('is_active', true)
      .order('effective_date', { ascending: false })
      .limit(2);

    if (!agreements || agreements.length === 0) {
      toast({
        title: "No Agreements",
        description: "No active agreements found",
        variant: "destructive",
      });
      return;
    }

    // Send reminder for each agreement type
    for (const agreement of agreements) {
      await sendNotificationMutation.mutateAsync({
        agreement_id: agreement.id,
        notification_type: 'reminder',
        user_ids: targetUsers,
        custom_subject: `Reminder: Please Accept ${agreement.title}`,
        custom_body: `This is a friendly reminder to please review and accept the updated ${agreement.title}. You can do this by logging into your account.`
      });
    }
  };

  return {
    // Data
    templates,
    notificationLogs,
    usersNeedingAcceptance,
    
    // Loading states
    isLoadingTemplates,
    isLoadingLogs,
    isLoadingUsers,
    isSending: sendNotificationMutation.isPending,
    isCreatingTemplate: createTemplateMutation.isPending,
    
    // Errors
    templatesError,
    logsError,
    
    // Actions
    sendNotification: sendNotificationMutation.mutate,
    sendNotificationAsync: sendNotificationMutation.mutateAsync,
    createTemplate: createTemplateMutation.mutate,
    sendReminderNotifications,
    
    // Utilities
    getTemplateById: (id: string) => templates?.find(t => t.id === id),
    getLogsByStatus: (status: string) => notificationLogs?.filter(l => l.status === status) || []
  };
};
