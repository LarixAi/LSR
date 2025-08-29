
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useProfile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [updating, setUpdating] = useState(false);

  const updateProfile = async (updates: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    avatar_url?: string;
  }) => {
    if (!user || !profile) {
      toast.error('You must be logged in to update your profile');
      return { error: new Error('Not authenticated') };
    }

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      await refreshProfile();
      toast.success('Profile updated successfully');
      return { error: null };
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile: ' + error.message);
      return { error };
    } finally {
      setUpdating(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    if (!user) {
      toast.error('You must be logged in to update your password');
      return { error: new Error('Not authenticated') };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      toast.success('Password updated successfully');
      return { error: null };
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password: ' + error.message);
      return { error };
    }
  };

  return {
    updating,
    updateProfile,
    updatePassword
  };
};
