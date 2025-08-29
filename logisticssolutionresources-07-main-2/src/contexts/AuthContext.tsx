import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  organization_id?: string;
  must_change_password?: boolean;
  onboarding_status?: string;
  avatar_url?: string;
  employment_status?: string;
  employee_id?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  cdl_number?: string;
  medical_card_expiry?: string;
  hire_date?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const validateOrganizationSync = async (userId: string, session: Session) => {
    try {
      const jwtOrgId = session?.user?.user_metadata?.organization_id;
      
      if (jwtOrgId) {
        // Check if profile organization_id matches JWT
        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', userId)
          .single();
          
        if (profile && profile.organization_id !== jwtOrgId) {
          // Update profile to match JWT
          await supabase
            .from('profiles')
            .update({ organization_id: jwtOrgId })
            .eq('id', userId);
        }
      }
    } catch (error) {
      // Silent fail - organization sync is not critical
    }
  };

  // Ensure a profile row exists for the authenticated user
  const ensureProfileExists = async (userObj: User, sessionObj: Session | null) => {
    try {
      const userId = userObj.id;
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (!existing) {
        const meta: any = userObj.user_metadata || {};
        
        // Use upsert with ignoreDuplicates to handle race conditions
        const { error: upsertError } = await supabase.from('profiles').upsert(
          {
            id: userId,
            email: userObj.email ?? '',
            first_name: meta.first_name ?? '',
            last_name: meta.last_name ?? '',
            // Role is now set by secure database trigger - defaults to 'driver'
            organization_id: meta.organization_id ?? null
          },
          { 
            onConflict: 'id',
            ignoreDuplicates: true  // Don't error on duplicates
          }
        );
        
        if (upsertError) {
          // Log but don't throw - profile might already exist from another session
          console.warn('Profile upsert warning (may be expected):', upsertError);
        }
      }
    } catch (e: any) {
      // Handle specific constraint violation gracefully
      if (e?.code === '23505' && e?.message?.includes('profiles_pkey')) {
        console.log('Profile already exists (race condition handled)');
      } else {
        console.warn('Profile creation error:', e);
      }
      // Don't throw - we'll attempt fetching profile anyway
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Profile fetch error:', error);
        // For RLS errors or similar, create a minimal profile structure
        if (error.message?.includes('RLS') || error.code === 'PGRST116') {
          console.log('RLS error - user may need profile creation');
          setProfile({
            id: userId,
            email: user?.email || '',
            role: 'driver', // Default role
            must_change_password: false
          });
          return;
        }
        throw error;
      }

      if (data) {
        // Validate essential profile fields for admin operations
        if ((data.role === 'admin' || data.role === 'council') && !data.organization_id) {
          console.warn('Admin user missing organization_id - this may cause issues');
        }
        setProfile(data);
      } else {
        // If no profile data, create a minimal profile to unblock the user
        console.log('No profile found, creating minimal profile structure');
        setProfile({
          id: userId,
          email: user?.email || '',
          role: 'driver', // Default role
          must_change_password: false
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      // Create minimal profile even on error to prevent complete app failure
      setProfile({
        id: userId,
        email: user?.email || '',
        role: 'driver',
        must_change_password: false
      });
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      // Always clear local state regardless of server response
      setUser(null);
      setProfile(null);
      setSession(null);
      
      // Only show error if it's not a session-related issue
      if (error && !error.message?.includes('session')) {
        throw error;
      }

      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });

    } catch (error: any) {
      // Clear state even on error to prevent being stuck
      setUser(null);
      setProfile(null);
      setSession(null);
      
      console.warn('Sign out error (state cleared anyway):', error);
      toast({
        title: "Signed out",
        description: "You have been logged out (with minor issues).",
      });
    }
  };

  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;
    let profileTimeout: NodeJS.Timeout;

    // Set up auth state listener FIRST to catch all events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        // Clear any pending timeout since we got an auth event
        clearTimeout(initTimeout);
        clearTimeout(profileTimeout);

        if (session?.user) {
          setSession(session);
          setUser(session.user);
          // Keep loading true until profile is fetched
          
          // Defer all Supabase calls to prevent deadlock
          setTimeout(() => {
            if (!mounted) return;
            
            const handleProfileSetup = async () => {
              try {
                // First ensure profile exists
                await ensureProfileExists(session.user, session);
                
                // Then validate organization sync
                await validateOrganizationSync(session.user.id, session);
                
                // Finally fetch the profile
                await fetchProfile(session.user.id);
                
                if (mounted) {
                  setLoading(false);
                }
              } catch (error) {
                console.error('Profile setup failed:', error);
                
                // Set timeout for profile loading - if it fails, still allow user through
                profileTimeout = setTimeout(() => {
                  if (mounted) {
                    console.log('Profile timeout reached - allowing user through');
                    setLoading(false);
                  }
                }, 2000);
              }
            };
            
            handleProfileSetup();
          }, 0);
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // THEN get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.log('No initial session found:', error.message);
        if (mounted) setLoading(false);
        return;
      }

      if (!session?.user) {
        console.log('No initial session found - no user');
        if (mounted) {
          setLoading(false);
        }
      } else {
        console.log('Initial session found for user:', session.user.email);
      }
    }).catch((error) => {
      console.log('Failed to get initial session:', error);
      if (mounted) setLoading(false);
    });
    
    // Shorter fallback timeout - force loading to false if stuck
    initTimeout = setTimeout(() => {
      if (mounted) {
        console.log('Auth initialization timeout - setting loading to false');
        setLoading(false);
      }
    }, 1000); // Reduced to 1 second for faster fallback

    return () => {
      mounted = false;
      clearTimeout(initTimeout);
      clearTimeout(profileTimeout);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      session, 
      loading, 
      signOut, 
      refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
