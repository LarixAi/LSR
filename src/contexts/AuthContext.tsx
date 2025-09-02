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

  const validateProfileRole = (profile: any, userId: string): boolean => {
    // Validate that profile has expected structure and user ID matches
    if (!profile || typeof profile !== 'object') return false;
    if (profile.id !== userId) {
      console.warn('⚠️ Profile user ID mismatch - potential cached data from different user');
      return false;
    }
    if (!profile.role || typeof profile.role !== 'string') {
      console.warn('⚠️ Profile missing or invalid role');
      return false;
    }
    return true;
  };

  const fetchProfile = async (userId: string) => {
    try {
      console.log('🔍 Fetching fresh profile for user:', userId);
      
      // NEVER use cached data - always fetch fresh to prevent role mixing
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Profile fetch error:', error);
        setProfile(null);
        return;
      }

      if (data) {
        // Validate the profile data before using it
        if (!validateProfileRole(data, userId)) {
          console.error('❌ Invalid profile data received, clearing and retrying...');
          setProfile(null);
          return;
        }

        console.log('✅ Valid profile loaded:', { id: data.id, role: data.role, email: data.email });
        setProfile(data);
        
        // Only cache AFTER validation and only for current session
        sessionStorage.setItem('user_profile', JSON.stringify(data));
      } else {
        console.log('No profile found for user:', userId);
        setProfile(null);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      console.log('🔄 Refreshing profile for user:', user.email);
      // Clear any cached profile data first
      clearAllCachedData();
      await fetchProfile(user.id);
    }
  };

  const forceRefreshProfile = async () => {
    if (user?.id) {
      console.log('🔄 Force refreshing profile for user:', user.email);
      // Clear all cached data
      clearAllCachedData();
      // Force a fresh fetch
      await fetchProfile(user.id);
    }
  };

  const clearAllCachedData = () => {
    // Clear all possible cached profile data
    localStorage.removeItem('emergency_user_profile');
    sessionStorage.removeItem('user_profile');
    // Clear any other profile-related cache
    localStorage.removeItem('user_profile');
    sessionStorage.removeItem('emergency_user_profile');
    sessionStorage.removeItem('cached_profile_data');
    localStorage.removeItem('cached_profile_data');
    
    console.log('🧹 All cached profile data cleared');
  };

  const signOut = async () => {
    try {
      // Clear all cached data BEFORE signing out
      clearAllCachedData();
      
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
      // Even if sign out fails, clear cached data to prevent role mixing
      clearAllCachedData();
      setUser(null);
      setProfile(null);
      setSession(null);
      
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
      (authEvent, session) => {
        if (!mounted) return;

        // Clear any pending timeout since we got an auth event
        clearTimeout(initTimeout);
        clearTimeout(profileTimeout);

        // Log auth state changes for debugging
        console.log('🔐 Auth state change:', authEvent, session?.user?.email || 'No user');

        if (session?.user) {
          // Check if this is a different user than currently loaded
          const isDifferentUser = user?.email !== session.user.email;
          
          if (isDifferentUser) {
            console.log('👤 Different user detected, clearing all cached data');
            // Clear ALL cached data when switching users
            clearAllCachedData();
            // Clear current state immediately
            setProfile(null);
          }

          setSession(session);
          setUser(session.user);
          // Keep loading true until profile is fetched
          
          // Defer all Supabase calls to prevent deadlock
          setTimeout(() => {
            if (!mounted) return;
            
            const handleProfileSetup = async () => {
              try {
                // If different user, ensure we start fresh
                if (isDifferentUser) {
                  console.log('🆕 Setting up profile for new user:', session.user.email);
                }

                // First ensure profile exists
                await ensureProfileExists(session.user, session);
                
                // Then validate organization sync
                await validateOrganizationSync(session.user.id, session);
                
                // Finally fetch the profile (always fresh, never cached)
                await fetchProfile(session.user.id);
                
                if (mounted) {
                  setLoading(false);
                }
              } catch (error) {
                console.error('Profile setup failed:', error);
                
                // Clear any potentially bad cached data
                clearAllCachedData();
                setProfile(null);
                
                // Set timeout for profile loading - if it fails, still allow user through
                profileTimeout = setTimeout(() => {
                  if (mounted) {
                    console.log('Profile timeout reached - allowing user through with limited profile');
                    setLoading(false);
                  }
                }, 2000); // Reduced timeout to 2 seconds for faster response
              }
            };
            
            handleProfileSetup();
          }, 0);
        } else {
          // User logged out or no session
          console.log('🚪 User logged out or no session');
          clearAllCachedData();
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
