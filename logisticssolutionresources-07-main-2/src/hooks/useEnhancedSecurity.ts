import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useEnhancedSecurity = () => {
  const validateInput = useCallback(async (input: string): Promise<string> => {
    try {
      const { data: sanitized } = await supabase.rpc('sanitize_user_input', {
        input_text: input
      });
      return sanitized || input;
    } catch (error) {
      console.error('Input sanitization error:', error);
      return input;
    }
  }, []);

  const validatePassword = useCallback(async (password: string) => {
    try {
      const { data: validation } = await supabase.rpc('enhanced_password_validation', {
        password
      });
      
      return validation || {
        valid: false,
        score: 0,
        strength: 'weak',
        issues: ['Password validation failed']
      };
    } catch (error) {
      console.error('Password validation error:', error);
      return {
        valid: false,
        score: 0,
        strength: 'weak',
        issues: ['Password validation failed']
      };
    }
  }, []);

  const checkRateLimit = useCallback(async (operationType: string, maxAttempts = 10, windowMinutes = 15): Promise<boolean> => {
    try {
      const { data: allowed } = await supabase.rpc('check_organization_rate_limit', {
        operation_type: operationType,
        max_attempts: maxAttempts,
        window_minutes: windowMinutes
      });
      
      if (!allowed) {
        toast({
          title: "Rate Limit Exceeded",
          description: "Too many attempts. Please try again later.",
          variant: "destructive"
        });
      }
      
      return allowed || false;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return false;
    }
  }, []);

  const createSecurityAlert = useCallback(async (
    alertType: string, 
    severity: 'low' | 'medium' | 'high' = 'medium',
    details: Record<string, any> = {}
  ) => {
    try {
      await supabase.rpc('create_security_alert', {
        alert_type: alertType,
        severity,
        details: {
          ...details,
          timestamp: Date.now(),
          user_agent: navigator.userAgent
        }
      });
    } catch (error) {
      console.error('Failed to create security alert:', error);
    }
  }, []);

  const validateSession = useCallback(async (): Promise<boolean> => {
    try {
      const { data: isValid } = await supabase.rpc('validate_session_security');
      
      if (!isValid) {
        toast({
          title: "Session Security Issue",
          description: "Your session has been flagged for suspicious activity.",
          variant: "destructive"
        });
        
        await createSecurityAlert('session_validation_failed', 'high', {
          reason: 'suspicious_activity_detected'
        });
      }
      
      return isValid || false;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }, [createSecurityAlert]);

  return {
    validateInput,
    validatePassword,
    checkRateLimit,
    createSecurityAlert,
    validateSession
  };
};