import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedSecurity } from '@/hooks/useEnhancedSecurity';
import { toast } from '@/hooks/use-toast';

interface AuthResult {
  success: boolean;
  error?: string;
  requiresEmailVerification?: boolean;
}

export const useSecureAuthentication = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { checkRateLimit, createSecurityAlert, validateInput } = useEnhancedSecurity();

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true);
    
    try {
      // Check rate limiting for login attempts
      const rateLimitOk = await checkRateLimit('login_attempt', 5, 15);
      if (!rateLimitOk) {
        await createSecurityAlert('rate_limit_exceeded', 'medium', {
          operation: 'login_attempt',
          email: email
        });
        return { 
          success: false, 
          error: 'Too many login attempts. Please try again in 15 minutes.' 
        };
      }

      // Sanitize email input
      const sanitizedEmail = await validateInput(email.trim().toLowerCase());

      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: password,
      });

      if (error) {
        // Log failed login attempt
        await createSecurityAlert('login_failed', 'low', {
          email: sanitizedEmail,
          error_message: error.message,
          timestamp: Date.now()
        });

        return { 
          success: false, 
          error: error.message === 'Invalid login credentials' 
            ? 'Invalid email or password. Please check your credentials and try again.'
            : error.message
        };
      }

      // Log successful login
      await createSecurityAlert('login_success', 'low', {
        email: sanitizedEmail,
        user_id: data.user?.id,
        timestamp: Date.now()
      });

      return { success: true };

    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'An unexpected error occurred. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  }, [checkRateLimit, createSecurityAlert, validateInput]);

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    metadata?: Record<string, any>
  ): Promise<AuthResult> => {
    setIsLoading(true);
    
    try {
      // Check rate limiting for signup attempts
      const rateLimitOk = await checkRateLimit('signup_attempt', 3, 60);
      if (!rateLimitOk) {
        await createSecurityAlert('rate_limit_exceeded', 'medium', {
          operation: 'signup_attempt',
          email: email
        });
        return { 
          success: false, 
          error: 'Too many signup attempts. Please try again in 1 hour.' 
        };
      }

      // Sanitize inputs
      const sanitizedEmail = await validateInput(email.trim().toLowerCase());
      const sanitizedMetadata: Record<string, any> = {};
      
      if (metadata) {
        for (const [key, value] of Object.entries(metadata)) {
          if (typeof value === 'string') {
            sanitizedMetadata[key] = await validateInput(value);
          } else {
            sanitizedMetadata[key] = value;
          }
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: sanitizedMetadata
        }
      });

      if (error) {
        // Log failed signup attempt
        await createSecurityAlert('signup_failed', 'low', {
          email: sanitizedEmail,
          error_message: error.message,
          timestamp: Date.now()
        });

        return { 
          success: false, 
          error: error.message 
        };
      }

      // Log successful signup
      await createSecurityAlert('signup_success', 'low', {
        email: sanitizedEmail,
        user_id: data.user?.id,
        confirmation_sent: !data.user?.email_confirmed_at,
        timestamp: Date.now()
      });

      return { 
        success: true, 
        requiresEmailVerification: !data.user?.email_confirmed_at 
      };

    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        error: 'An unexpected error occurred. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  }, [checkRateLimit, createSecurityAlert, validateInput]);

  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    setIsLoading(true);
    
    try {
      // Check rate limiting for password reset requests
      const rateLimitOk = await checkRateLimit('password_reset_request', 3, 30);
      if (!rateLimitOk) {
        await createSecurityAlert('rate_limit_exceeded', 'medium', {
          operation: 'password_reset_request',
          email: email
        });
        return { 
          success: false, 
          error: 'Too many password reset requests. Please try again in 30 minutes.' 
        };
      }

      // Sanitize email input
      const sanitizedEmail = await validateInput(email.trim().toLowerCase());

      const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        await createSecurityAlert('password_reset_failed', 'low', {
          email: sanitizedEmail,
          error_message: error.message,
          timestamp: Date.now()
        });

        return { 
          success: false, 
          error: error.message 
        };
      }

      // Log successful password reset request
      await createSecurityAlert('password_reset_requested', 'low', {
        email: sanitizedEmail,
        timestamp: Date.now()
      });

      return { success: true };

    } catch (error) {
      console.error('Password reset error:', error);
      return { 
        success: false, 
        error: 'An unexpected error occurred. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  }, [checkRateLimit, createSecurityAlert, validateInput]);

  const signOut = useCallback(async (): Promise<AuthResult> => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return { 
          success: false, 
          error: error.message 
        };
      }

      // Log successful logout
      await createSecurityAlert('logout_success', 'low', {
        timestamp: Date.now()
      });

      return { success: true };

    } catch (error) {
      console.error('Logout error:', error);
      return { 
        success: false, 
        error: 'An unexpected error occurred during logout.' 
      };
    } finally {
      setIsLoading(false);
    }
  }, [createSecurityAlert]);

  return {
    signIn,
    signUp,
    resetPassword,
    signOut,
    isLoading
  };
};