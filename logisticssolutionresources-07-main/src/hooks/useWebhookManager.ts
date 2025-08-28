import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface WebhookEvent {
  id: string;
  event_type: string;
  payload: Record<string, any>;
  source: string;
  timestamp: string;
  processed: boolean;
}

interface WebhookConfig {
  url: string;
  events: string[];
  headers?: Record<string, string>;
  secret?: string;
}

export const useWebhookManager = () => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const registerWebhook = useCallback(async (config: WebhookConfig) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to register webhooks",
        variant: "destructive"
      });
      return { success: false };
    }

    try {
      const { data, error } = await supabase
        .from('webhook_configs' as any)
        .insert({
          user_id: user.id,
          url: config.url,
          events: config.events,
          headers: config.headers || {},
          secret: config.secret,
          active: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Webhook registered",
        description: "Your webhook has been successfully registered"
      });

      return { success: true, data };
    } catch (error: any) {
      console.error('Error registering webhook:', error);
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error };
    }
  }, [user]);

  const processWebhookEvent = useCallback(async (event: WebhookEvent) => {
    setIsProcessing(true);
    
    try {
      // Process the webhook event based on type
      switch (event.event_type) {
        case 'job.created':
          await handleJobCreated(event.payload);
          break;
        case 'driver.assigned':
          await handleDriverAssigned(event.payload);
          break;
        case 'route.completed':
          await handleRouteCompleted(event.payload);
          break;
        case 'vehicle.maintenance_due':
          await handleMaintenanceDue(event.payload);
          break;
        default:
          console.log('Unknown webhook event type:', event.event_type);
      }

      // Mark event as processed
      await supabase
        .from('webhook_events' as any)
        .update({ processed: true, processed_at: new Date().toISOString() })
        .eq('id', event.id);

      return { success: true };
    } catch (error: any) {
      console.error('Error processing webhook event:', error);
      return { success: false, error };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleJobCreated = async (payload: any) => {
    // Send notifications to relevant drivers
    const { data: drivers } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .eq('role', 'driver')
      .eq('organization_id', payload.organization_id);

    if (drivers) {
      for (const driver of drivers) {
        await supabase
          .from('notifications' as any)
          .insert({
            user_id: driver.id,
            type: 'info',
            title: 'New Job Available',
            message: `A new job "${payload.title}" is available for bidding`,
            created_at: new Date().toISOString(),
            read: false
          });
      }
    }
  };

  const handleDriverAssigned = async (payload: any) => {
    // Notify the assigned driver
    await supabase
      .from('notifications' as any)
      .insert({
        user_id: payload.driver_id,
        type: 'success',
        title: 'Job Assignment',
        message: `You have been assigned to job "${payload.job_title}"`,
        created_at: new Date().toISOString(),
        read: false
      });
  };

  const handleRouteCompleted = async (payload: any) => {
    // Update route status and notify relevant parties
    console.log('Route completed:', payload);
  };

  const handleMaintenanceDue = async (payload: any) => {
    // Create maintenance reminder
    console.log('Maintenance due:', payload);
  };

  const sendWebhook = useCallback(async (
    url: string, 
    eventType: string, 
    payload: any,
    headers?: Record<string, string>
  ) => {
    try {
      const webhookPayload = {
        event_type: eventType,
        payload,
        timestamp: new Date().toISOString(),
        source: 'logistics_app'
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(webhookPayload)
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
      }

      return { success: true };
    } catch (error: any) {
      console.error('Webhook delivery failed:', error);
      return { success: false, error };
    }
  }, []);

  return {
    registerWebhook,
    processWebhookEvent,
    sendWebhook,
    isProcessing
  };
};