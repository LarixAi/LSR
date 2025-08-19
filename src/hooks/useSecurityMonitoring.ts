import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SecurityEvent {
  type: 'login_attempt' | 'password_change' | 'suspicious_activity' | 'data_access';
  details: Record<string, any>;
  timestamp: string;
  user_agent?: string;
  ip_address?: string;
}

export const useSecurityMonitoring = () => {
  const { user } = useAuth();

  const logSecurityEvent = useCallback(async (event: SecurityEvent) => {
    if (!user) return;

    try {
      await supabase.from('security_logs' as any).insert({
        user_id: user.id,
        event_type: event.type,
        event_details: event.details,
        timestamp: event.timestamp,
        user_agent: navigator.userAgent,
        ip_address: event.ip_address
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, [user]);

  const detectSuspiciousActivity = useCallback(async () => {
    if (!user) return;

    try {
      const { data: recentLogs } = await supabase
        .from('security_logs' as any)
        .select('*')
        .eq('user_id', user.id)
        .gte('timestamp', new Date(Date.now() - 60000).toISOString()) // Last minute
        .order('timestamp', { ascending: false });

      if (recentLogs && recentLogs.length > 10) {
        toast({
          title: "Security Alert",
          description: "Unusual activity detected on your account.",
          variant: "destructive"
        });

        await logSecurityEvent({
          type: 'suspicious_activity',
          details: { reason: 'high_frequency_requests', count: recentLogs.length },
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Security monitoring error:', error);
    }
  }, [user, logSecurityEvent]);

  const monitorDataAccess = useCallback(async (table: string, action: string) => {
    await logSecurityEvent({
      type: 'data_access',
      details: { table, action },
      timestamp: new Date().toISOString()
    });
  }, [logSecurityEvent]);

  useEffect(() => {
    if (!user) return;

    // Monitor for suspicious activity every 30 seconds
    const interval = setInterval(detectSuspiciousActivity, 30000);
    return () => clearInterval(interval);
  }, [user, detectSuspiciousActivity]);

  return {
    logSecurityEvent,
    detectSuspiciousActivity,
    monitorDataAccess
  };
};