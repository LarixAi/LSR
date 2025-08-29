import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SecurityEvent {
  type: 'login_attempt' | 'password_change' | 'suspicious_activity' | 'data_access' | 'rate_limit_exceeded' | 'session_security_failure';
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
      // Use the new enhanced security logging function
      await supabase.rpc('create_security_alert', {
        alert_type: event.type,
        severity: event.details.severity || 'medium',
        details: {
          ...event.details,
          user_agent: navigator.userAgent,
          timestamp: event.timestamp
        }
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, [user]);

  const detectSuspiciousActivity = useCallback(async () => {
    if (!user) return;

    try {
      // Check if rate limiting would block this organization
      const { data: rateLimitOk } = await supabase.rpc('check_organization_rate_limit', {
        operation_type: 'security_check',
        max_attempts: 10,
        window_minutes: 15
      });

      if (!rateLimitOk) {
        toast({
          title: "Security Alert",
          description: "Rate limit exceeded. Unusual activity detected.",
          variant: "destructive"
        });

        await logSecurityEvent({
          type: 'rate_limit_exceeded',
          details: { 
            reason: 'high_frequency_security_checks', 
            severity: 'high',
            timestamp: Date.now()
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Validate session security
      const { data: sessionValid } = await supabase.rpc('validate_session_security');
      
      if (!sessionValid) {
        toast({
          title: "Security Alert",
          description: "Session security validation failed.",
          variant: "destructive"
        });

        await logSecurityEvent({
          type: 'session_security_failure',
          details: { 
            reason: 'suspicious_session_activity',
            severity: 'high'
          },
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Security monitoring error:', error);
    }
  }, [user, logSecurityEvent]);

  const monitorDataAccess = useCallback(async (table: string, action: string, recordId?: string) => {
    try {
      // Log data access event
      await logSecurityEvent({
        type: 'data_access',
        details: { 
          table, 
          action, 
          recordId,
          timestamp: Date.now()
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log data access:', error);
    }
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