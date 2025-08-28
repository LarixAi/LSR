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
  forceRefreshProfile: () => Promise<void>;
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
      const { data: existing, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking profile existence:', checkError);
        // Don't return on error, continue with profile creation attempt
        // This allows the app to work even if there are temporary network issues
      }

      if (!existing) {
        const meta: any = userObj.user_metadata || {};
        // Removed role assignment from metadata - now handled securely by database trigger
        const { error: upsertError } = await supabase.from('profiles').upsert(
          {
            id: userId,
            email: userObj.email ?? '',
            first_name: meta.first_name ?? '',
            last_name: meta.last_name ?? '',
            // Role is now set by secure database trigger - defaults to 'parent'
            organization_id: meta.organization_id ?? null
          },
          { onConflict: 'id' }
        );

        if (upsertError) {
          console.error('Error creating profile:', upsertError);
        }
      }
    } catch (e) {
      console.error('Error in ensureProfileExists:', e);
      // Silent fail; we'll attempt fetching again later
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      // First, check for emergency profile in localStorage
      const emergencyProfile = localStorage.getItem('emergency_user_profile');
      if (emergencyProfile) {
        console.log('🚨 Using emergency profile from localStorage');
        const profile = JSON.parse(emergencyProfile);
        setProfile(profile);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Profile fetch error:', error);
        
        // If we get an access control error, try to use emergency profile
        if (error.message.includes('Load failed') || error.message.includes('access control') || error.message.includes('CORS') || error.message.includes('TypeError')) {
          console.log('🚨 Access control/CORS error detected, checking for emergency profile');
          const emergencyProfile = sessionStorage.getItem('user_profile');
          if (emergencyProfile) {
            console.log('✅ Using emergency profile from sessionStorage');
            const profile = JSON.parse(emergencyProfile);
            setProfile(profile);
            return;
          }
        }
        
        // Don't throw error, just log it and continue
        setProfile(null);
        return;
      }

      if (data) {
        setProfile(data);
        // Store profile in sessionStorage as backup
        sessionStorage.setItem('user_profile', JSON.stringify(data));
      } else {
        // If no profile data, create a minimal profile to unblock the user
        console.log('No profile found, user can proceed with limited access');
        setProfile(null);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setProfile(null);
      // Don't throw error, just log it and continue
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      // Clear any cached profile data first
      localStorage.removeItem('emergency_user_profile');
      sessionStorage.removeItem('user_profile');
      await fetchProfile(user.id);
    }
  };

  const forceRefreshProfile = async () => {
    if (user?.id) {
      // Clear all cached data
      localStorage.removeItem('emergency_user_profile');
      sessionStorage.removeItem('user_profile');
      // Force a fresh fetch
      await fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear all state
      setUser(null);
      setProfile(null);
      setSession(null);
      
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });

    } catch (error) {
      toast({
        title: "Sign out failed",
        description: "There was an error signing out. Please try again.",
        variant: "destructive",
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
          // Only log if user actually changed to reduce noise
          if (user?.email !== session.user.email) {
            console.log('Auth state change - session found for user:', session.user.email);
          }
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
                    console.log('Profile timeout reached - allowing user through with limited profile');
                    setLoading(false);
                  }
                }, 3000); // Reduced timeout to 3 seconds
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
        console.error('Error getting initial session:', error);
        if (mounted) setLoading(false);
        return;
      }

      if (session?.user) {
        console.log('Initial session found, user:', session.user.email);
        // Don't set loading to false here - let the auth state change handler do it
      } else {
        console.log('No initial session found');
        if (mounted) setLoading(false);
      }
    }).catch((error) => {
      console.error('Failed to get initial session:', error);
      if (mounted) setLoading(false);
    });
    
    // Fallback timeout - only set loading to false if no session exists
    initTimeout = setTimeout(() => {
      if (mounted && !session?.user) {
        console.log('Auth initialization timeout - no session found, setting loading to false');
        setLoading(false);
      }
    }, 3000); // Reduced to 3 seconds for faster loading

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
      refreshProfile,
      forceRefreshProfile
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
