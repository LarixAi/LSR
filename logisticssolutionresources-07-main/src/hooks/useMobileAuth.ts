import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { getAppType, isPlatform } from '@/utils/platform';

interface MobileAuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

interface MobileAuthActions {
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  verifyDevice: () => Promise<boolean>;
  createMobileSession: () => Promise<void>;
}

interface MobileAuthHook extends MobileAuthState, MobileAuthActions {}

export const useMobileAuth = (): MobileAuthHook => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getDeviceInfo = () => {
    const appType = getAppType();
    const deviceType = isPlatform.ios() ? 'ios' : isPlatform.android() ? 'android' : 'web';
    const deviceId = localStorage.getItem('device_id') || crypto.randomUUID();
    
    // Store device ID for persistence
    localStorage.setItem('device_id', deviceId);
    
    return {
      deviceId,
      deviceType: deviceType as 'ios' | 'android',
      appType: (appType === 'driver' || appType === 'parent') ? appType : 'parent' as 'driver' | 'parent'
    };
  };

  const callMobileAuthFunction = async (action: string, data: any = {}) => {
    try {
      const deviceInfo = getDeviceInfo();
      const { data: result, error } = await supabase.functions.invoke('mobile-auth', {
        body: {
          action,
          ...data,
          ...deviceInfo
        }
      });

      if (error) {
        console.error(`Mobile auth ${action} error:`, error);
        return { error: error.message };
      }

      return result;
    } catch (err) {
      console.error(`Mobile auth ${action} error:`, err);
      return { error: 'Network error occurred' };
    }
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await callMobileAuthFunction('register', {
        email,
        password,
        firstName,
        lastName
      });

      if (result.error) {
        setError(result.error);
        return { error: result.error };
      }

      if (result.session) {
        setSession(result.session);
        setUser(result.user);
      }

      return {};
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await callMobileAuthFunction('login', {
        email,
        password
      });

      if (result.error) {
        setError(result.error);
        return { error: result.error };
      }

      if (result.session) {
        setSession(result.session);
        setUser(result.user);
      }

      return {};
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);

    try {
      await callMobileAuthFunction('logout');
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  const verifyDevice = async (): Promise<boolean> => {
    try {
      const result = await callMobileAuthFunction('verify_device');
      return result.verified || false;
    } catch {
      return false;
    }
  };

  const createMobileSession = async () => {
    if (!user) return;
    
    try {
      const deviceInfo = getDeviceInfo();
      await supabase.rpc('handle_mobile_session', {
        p_device_id: deviceInfo.deviceId,
        p_device_type: deviceInfo.deviceType,
        p_app_type: deviceInfo.appType
      });
    } catch (err) {
      console.error('Mobile session creation error:', err);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Create mobile session on auth state change for mobile platforms
        if (session?.user && isPlatform.mobile()) {
          setTimeout(() => {
            createMobileSession();
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Create mobile session if user exists and on mobile
      if (session?.user && isPlatform.mobile()) {
        createMobileSession();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    verifyDevice,
    createMobileSession
  };
};