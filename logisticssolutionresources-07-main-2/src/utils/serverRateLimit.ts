
import { supabase } from '@/integrations/supabase/client';

interface RateLimitOptions {
  identifier: string;
  maxAttempts: number;
  windowMs: number;
  action: string;
}

export const checkServerRateLimit = async (options: RateLimitOptions): Promise<{
  allowed: boolean;
  remaining?: number;
  resetTime?: string;
  message?: string;
}> => {
  try {
    const { data, error } = await supabase.functions.invoke('secure-rate-limiter', {
      body: options
    });

    if (error) {
      console.error('Server rate limit check failed:', error);
      // Fail open - allow the request if the rate limiter is down
      return { allowed: true };
    }

    return data;
  } catch (error) {
    console.error('Server rate limit error:', error);
    // Fail open - allow the request if there's an error
    return { allowed: true };
  }
};

// Helper functions for common rate limiting scenarios
export const checkLoginRateLimit = async (email: string) => {
  return checkServerRateLimit({
    identifier: `login_${email}`,
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    action: 'login'
  });
};

export const checkSignupRateLimit = async (email: string) => {
  return checkServerRateLimit({
    identifier: `signup_${email}`,
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    action: 'signup'
  });
};

export const checkFormSubmissionRateLimit = async (userId: string, formType: string) => {
  return checkServerRateLimit({
    identifier: `form_${userId}_${formType}`,
    maxAttempts: 10,
    windowMs: 60 * 1000, // 1 minute
    action: 'form_submission'
  });
};
