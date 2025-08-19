// Fix Access Denied Utility
// This utility helps resolve access denied issues by ensuring proper role assignment

import { supabase } from '@/integrations/supabase/client';

export interface AccessFixResult {
  success: boolean;
  message: string;
  profile?: any;
  error?: string;
}

/**
 * Fix access denied issues by ensuring the user has proper role and permissions
 */
export const fixAccessDenied = async (userEmail: string): Promise<AccessFixResult> => {
  try {
    console.log('🔧 Attempting to fix access denied for:', userEmail);

    // First, check if the user exists in profiles
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', userEmail)
      .maybeSingle();

    if (profileError) {
      console.error('Error checking profile:', profileError);
      return {
        success: false,
        message: 'Failed to check existing profile',
        error: profileError.message
      };
    }

    if (existingProfile) {
      console.log('✅ Profile exists:', existingProfile);
      
      // Check if the user has admin role
      if (existingProfile.role === 'admin' || existingProfile.role === 'council') {
        return {
          success: true,
          message: 'User already has admin privileges',
          profile: existingProfile
        };
      }

      // Update the user to admin role
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
          role: 'admin',
          employment_status: 'active',
          onboarding_status: 'completed',
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('email', userEmail)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating profile:', updateError);
        return {
          success: false,
          message: 'Failed to update profile role',
          error: updateError.message
        };
      }

      console.log('✅ Profile updated to admin:', updatedProfile);
      return {
        success: true,
        message: 'Profile updated to admin role successfully',
        profile: updatedProfile
      };
    } else {
      console.log('⚠️ Profile does not exist, creating new admin profile');
      
      // Get the current user from auth
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          message: 'No authenticated user found',
          error: 'User not authenticated'
        };
      }

      // Create a new profile with admin role
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: userEmail,
          first_name: 'Larone',
          last_name: 'Laing',
          role: 'admin',
          employment_status: 'active',
          onboarding_status: 'completed',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        return {
          success: false,
          message: 'Failed to create admin profile',
          error: createError.message
        };
      }

      console.log('✅ New admin profile created:', newProfile);
      return {
        success: true,
        message: 'New admin profile created successfully',
        profile: newProfile
      };
    }
  } catch (error) {
    console.error('❌ Error in fixAccessDenied:', error);
    return {
      success: false,
      message: 'Unexpected error occurred',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Check if the current user has admin access
 */
export const checkAdminAccess = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    return profile?.role === 'admin' || profile?.role === 'council';
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
};

/**
 * Force refresh the user's profile data
 */
export const forceRefreshProfile = async (): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return;
    }

    // Force a profile refresh by updating the updated_at timestamp
    await supabase
      .from('profiles')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', user.id);

    console.log('✅ Profile refresh triggered');
  } catch (error) {
    console.error('Error refreshing profile:', error);
  }
};

