import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAccess } from '@/utils/adminAccess';
import { useToast } from '@/hooks/use-toast';

interface AdminUserOperation {
  loading: boolean;
  error: string | null;
  success: boolean;
}

interface CreateUserParams {
  email: string;
  password?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
}

interface ResetPasswordParams {
  targetUserId: string;
  targetEmail?: string;
  newPassword?: string;
  forceMustChange?: boolean;
}

export const useAdminUserManagement = () => {
  const { user } = useAuth();
  const { isAdmin, canManage, getDiagnostics } = useAdminAccess();
  const { toast } = useToast();
  
  const [createUserState, setCreateUserState] = useState<AdminUserOperation>({
    loading: false,
    error: null,
    success: false
  });
  
  const [resetPasswordState, setResetPasswordState] = useState<AdminUserOperation>({
    loading: false,
    error: null,
    success: false
  });

  /**
   * Create a new user with proper auth/profile synchronization
   */
  const createUser = async (params: CreateUserParams) => {
    if (!canManage('users')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to create users.",
        variant: "destructive"
      });
      return false;
    }

    setCreateUserState({ loading: true, error: null, success: false });

    try {
      console.log('[AdminUserManagement] Creating user with params:', { 
        ...params, 
        password: params.password ? '[REDACTED]' : undefined 
      });

      // Generate UUID for the profile
      const profileId = crypto.randomUUID();
      
      // First, create the profile record
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: profileId,
          email: params.email,
          first_name: params.firstName || '',
          last_name: params.lastName || '',
          role: params.role as any || 'driver',
          organization_id: user?.user_metadata?.organization_id || null,
          must_change_password: true
        })
        .select()
        .single();

      if (profileError) {
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }

      // Then, create the auth user via edge function
      const { data: authResult, error: authError } = await supabase.functions.invoke(
        'create-missing-auth-user',
        {
          body: {
            email: params.email,
            password: params.password,
            profileId: profile.id
          }
        }
      );

      if (authError) {
        // Clean up profile if auth creation failed
        await supabase.from('profiles').delete().eq('id', profile.id);
        throw new Error(`Failed to create auth user: ${authError.message}`);
      }

      if (!authResult?.success) {
        // Clean up profile if auth creation failed
        await supabase.from('profiles').delete().eq('id', profile.id);
        throw new Error(authResult?.error || 'Failed to create auth user');
      }

      setCreateUserState({ loading: false, error: null, success: true });
      
      toast({
        title: "User Created Successfully",
        description: `User ${params.email} has been created and will receive login instructions.`
      });

      return {
        success: true,
        profileId: profile.id,
        authUserId: authResult.userId,
        temporaryPassword: authResult.temporaryPassword
      };

    } catch (error: any) {
      console.error('[AdminUserManagement] Create user error:', error);
      const errorMessage = error.message || 'Failed to create user';
      
      setCreateUserState({ loading: false, error: errorMessage, success: false });
      
      toast({
        title: "User Creation Failed",
        description: errorMessage,
        variant: "destructive"
      });

      return false;
    }
  };

  /**
   * Reset user password with proper error handling
   */
  const resetPassword = async (params: ResetPasswordParams) => {
    if (!canManage('users')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to reset passwords.",
        variant: "destructive"
      });
      return false;
    }

    setResetPasswordState({ loading: true, error: null, success: false });

    try {
      console.log('[AdminUserManagement] Resetting password for user:', params.targetUserId);

      // First, prepare the password change request using the database function
      const { data: prepResult, error: prepError } = await supabase.rpc(
        'safe_password_change_request',
        {
          p_target_user_id: params.targetUserId,
          p_admin_user_id: user?.id,
          p_new_password: params.newPassword
        }
      );

      const prepResultData = prepResult as any;
      if (prepError || !prepResultData?.success) {
        throw new Error(prepResultData?.error || prepError?.message || 'Permission verification failed');
      }

      // Then, execute the password change via edge function
      const { data: resetResult, error: resetError } = await supabase.functions.invoke(
        'change-user-password',
        {
          body: {
            targetUserId: params.targetUserId,
            targetEmail: params.targetEmail,
            newPassword: params.newPassword,
            forceMustChange: params.forceMustChange !== false
          }
        }
      );

      if (resetError) {
        throw new Error(`Password reset failed: ${resetError.message}`);
      }

      if (!resetResult?.success) {
        throw new Error(resetResult?.error || 'Password reset failed');
      }

      setResetPasswordState({ loading: false, error: null, success: true });
      
      toast({
        title: "Password Reset Successfully",
        description: `Password has been reset for ${resetResult.targetEmail || 'the user'}.`
      });

      return {
        success: true,
        temporaryPassword: resetResult.temporaryPassword,
        targetEmail: resetResult.targetEmail
      };

    } catch (error: any) {
      console.error('[AdminUserManagement] Reset password error:', error);
      const errorMessage = error.message || 'Failed to reset password';
      setResetPasswordState({ loading: false, error: errorMessage, success: false });
      toast({
        title: "Password Reset Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Audit auth/profile synchronization issues
   */
  const auditUserSync = async () => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can run user audits.",
        variant: "destructive"
      });
      return null;
    }

    try {
      const { data: auditResults, error } = await supabase.rpc('audit_auth_profile_sync');
      
      if (error) {
        throw new Error(`Audit failed: ${error.message}`);
      }

      return auditResults;
    } catch (error: any) {
      console.error('[AdminUserManagement] Audit error:', error);
      toast({
        title: "Audit Failed",
        description: error.message || 'Failed to run user sync audit',
        variant: "destructive"
      });
      return null;
    }
  };

  /**
   * Get admin operation logs
   */
  const getOperationLogs = async (limit: number = 50) => {
    if (!isAdmin) {
      return null;
    }

    try {
      const { data: logs, error } = await supabase
        .from('admin_operation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch operation logs: ${error.message}`);
      }

      return logs;
    } catch (error: any) {
      console.error('[AdminUserManagement] Get logs error:', error);
      return null;
    }
  };

  /**
   * Get diagnostic information for troubleshooting
   */
  const getDiagnosticInfo = () => {
    return {
      adminAccess: getDiagnostics(),
      createUserState,
      resetPasswordState,
      canCreateUsers: canManage('users'),
      canResetPasswords: canManage('users'),
      canAuditUsers: isAdmin
    };
  };

  return {
    // User management operations
    createUser,
    resetPassword,
    
    // Audit and logging
    auditUserSync,
    getOperationLogs,
    
    // State management
    createUserState,
    resetPasswordState,
    
    // Diagnostics
    getDiagnosticInfo,
    
    // Permissions
    canCreateUsers: canManage('users'),
    canResetPasswords: canManage('users'),
    canAuditUsers: isAdmin
  };
};