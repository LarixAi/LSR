import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

interface PasswordResetRequest {
  targetUserId: string;
  resetType?: 'admin_reset' | 'force_change';
  notes?: string;
}

interface BulkPasswordResetRequest {
  targetUserIds: string[];
  resetType?: 'bulk_reset' | 'force_change';
  notes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the JWT token and get user
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(jwt);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the requesting user's organization and role
    const { data: requestingUser, error: userError } = await supabaseClient
      .from('profiles')
      .select('default_organization_id, role')
      .eq('id', user.id)
      .single();

    if (userError || !requestingUser?.default_organization_id) {
      console.error('Error getting requesting user organization:', userError);
      return new Response(
        JSON.stringify({ error: 'User organization not found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin privileges
  const { data: membership, error: membershipError } = await supabaseClient
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', requestingUser.default_organization_id)
      .eq('role', 'admin')
      .eq('status', 'active')
      .single();

    // Allow fallback to profile role if memberships check fails or returns no row
    const adminRoles = new Set(['admin', 'council', 'super_admin', 'compliance_officer']);
    const hasAdminMembership = !!membership && !membershipError;
    const hasAdminProfileRole = adminRoles.has(requestingUser.role);

    if (!hasAdminMembership && !hasAdminProfileRole) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions. Admin role required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestData = await req.json();
    const isBulkReset = Array.isArray(requestData.targetUserIds);
    
    if (isBulkReset) {
      return await handleBulkPasswordReset(supabaseClient, requestData as BulkPasswordResetRequest, user.id, requestingUser.default_organization_id);
    } else {
      return await handleSinglePasswordReset(supabaseClient, requestData as PasswordResetRequest, user.id, requestingUser.default_organization_id);
    }

  } catch (error: any) {
    console.error('Error in admin-password-reset function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

async function handleSinglePasswordReset(
  supabaseClient: any, 
  requestData: PasswordResetRequest, 
  adminUserId: string, 
  organizationId: string
): Promise<Response> {
  const { targetUserId, resetType = 'admin_reset', notes } = requestData;

  // Verify target user belongs to the same organization
  const { data: targetUser, error: targetUserError } = await supabaseClient
    .from('profiles')
    .select('email, first_name, last_name, organization_id')
    .eq('id', targetUserId)
    .single();

  if (targetUserError || !targetUser) {
    return new Response(
      JSON.stringify({ error: 'Target user not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (targetUser.organization_id !== organizationId) {
    return new Response(
      JSON.stringify({ error: 'Cannot reset password for user in different organization' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Generate secure temporary password
  const temporaryPassword = crypto.randomUUID().replace(/-/g, '').substring(0, 16);

  try {
    // Try to find existing auth user by email (paginate) or create one
    let authUserId = targetUserId;
    let createdNewAuthUser = false;

    let foundAuthUser: any | null = null;
    for (let page = 1; page <= 50; page++) {
      const { data, error } = await (supabaseClient as any).auth.admin.listUsers({ page, perPage: 1000 });
      if (error) {
        console.error('[admin-password-reset] listUsers error page', page, error);
        break;
      }
      const users = (data?.users || []) as any[];
      if (!users.length) break;
      const match = users.find((u: any) => ((u.email || '') as string).toLowerCase() === (targetUser.email || '').toLowerCase());
      if (match) { foundAuthUser = match; break; }
    }

    if (foundAuthUser?.id) {
      authUserId = foundAuthUser.id;
      const { error: pwErr } = await supabaseClient.auth.admin.updateUserById(authUserId, { password: temporaryPassword });
      if (pwErr) throw pwErr;
    } else {
      const { data: createRes, error: createErr } = await supabaseClient.auth.admin.createUser({
        email: targetUser.email,
        password: temporaryPassword,
        email_confirm: true,
      });
      if (createErr || !createRes?.user) {
        // Fallback: call create-missing-auth-user function with admin secret
        const adminResetSecret = Deno.env.get('ADMIN_RESET_SECRET') ?? '';
        const { data: cmData, error: cmError } = await supabaseClient.functions.invoke('create-missing-auth-user', {
          body: { email: targetUser.email, password: temporaryPassword, adminSecret: adminResetSecret }
        });
        if (cmError || !cmData?.success || !cmData?.userId) {
          // Final fallback: try updating by the provided ID in case it's valid
          const { error: updateErr } = await supabaseClient.auth.admin.updateUserById(targetUserId, { password: temporaryPassword });
          if (updateErr) throw (createErr ?? cmError ?? updateErr);
          authUserId = targetUserId;
        } else {
          authUserId = cmData.userId;
          createdNewAuthUser = true;
        }
      } else {
        authUserId = createRes.user.id;
        createdNewAuthUser = true;
      }
    }

    // Always force password change on next login after admin reset
    await supabaseClient
      .from('profiles')
      .update({ must_change_password: true })
      .eq('id', targetUserId);

    // Record the password reset (best-effort)
    try {
      await supabaseClient
        .from('password_resets')
        .insert([{
          user_id: targetUserId,
          organization_id: organizationId,
          requested_by: adminUserId,
          reset_type: resetType,
          temporary_password: temporaryPassword,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          status: 'pending',
          notes: notes
        }]);
    } catch (e) {
      console.warn('[admin-password-reset] password_resets insert skipped:', e?.message || e);
    }

    // Log in security audit (best-effort)
    try {
      await supabaseClient
        .from('security_audit_logs')
        .insert([{
          organization_id: organizationId,
          user_id: targetUserId,
          actor_id: adminUserId,
          event_type: 'password_reset',
          event_description: `Admin reset password for ${targetUser.first_name} ${targetUser.last_name}`,
          target_user_id: targetUserId,
          metadata: {
            reset_type: resetType,
            force_change: true,
            created_new_auth_user: createdNewAuthUser
          }
        }]);
    } catch (e) {
      console.warn('[admin-password-reset] security_audit_logs insert skipped:', e?.message || e);
    }

    // Send notification email (best-effort)
    try {
      await supabaseClient.functions.invoke('send-password-reset-notification', {
        body: {
          email: targetUser.email,
          firstName: targetUser.first_name,
          lastName: targetUser.last_name,
          temporaryPassword,
          resetType
        }
      });
    } catch (emailError) {
      console.warn('Failed to send password reset email:', emailError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Password reset successfully',
        temporaryPassword,
        userId: authUserId,
        createdNewAuthUser,
        name: `${targetUser.first_name} ${targetUser.last_name}`,
        email: targetUser.email,
        targetUser: {
          id: targetUserId,
          email: targetUser.email,
          name: `${targetUser.first_name} ${targetUser.last_name}`
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error resetting password:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to reset password', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

}

async function handleBulkPasswordReset(
  supabaseClient: any, 
  requestData: BulkPasswordResetRequest, 
  adminUserId: string, 
  organizationId: string
): Promise<Response> {
  const { targetUserIds, resetType = 'bulk_reset', notes } = requestData;

  if (!targetUserIds || targetUserIds.length === 0) {
    return new Response(
      JSON.stringify({ error: 'No target users specified' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Get target users and verify they belong to the same organization
  const { data: targetUsers, error: targetUsersError } = await supabaseClient
    .from('profiles')
    .select('id, email, first_name, last_name, organization_id')
    .in('id', targetUserIds)
    .eq('organization_id', organizationId);

  if (targetUsersError) {
    return new Response(
      JSON.stringify({ error: 'Failed to get target users', details: targetUsersError.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const results = [];
  const errors = [];

  for (const targetUser of targetUsers) {
    try {
      // Generate secure temporary password for each user
      const temporaryPassword = crypto.randomUUID().replace(/-/g, '').substring(0, 16);

      // Try to find existing auth user by email (paginate) or create one
      let authUserId = targetUser.id;
      let createdNewAuthUser = false;

      let foundAuthUser: any | null = null;
      for (let page = 1; page <= 50; page++) {
        const { data, error } = await (supabaseClient as any).auth.admin.listUsers({ page, perPage: 1000 });
        if (error) {
          console.error('[admin-password-reset] listUsers error page', page, error);
          break;
        }
        const users = (data?.users || []) as any[];
        if (!users.length) break;
        const match = users.find((u: any) => ((u.email || '') as string).toLowerCase() === (targetUser.email || '').toLowerCase());
        if (match) { foundAuthUser = match; break; }
      }

      if (foundAuthUser?.id) {
        authUserId = foundAuthUser.id;
        const { error: pwErr } = await supabaseClient.auth.admin.updateUserById(authUserId, { password: temporaryPassword });
        if (pwErr) throw pwErr;
      } else {
        const { data: createRes, error: createErr } = await supabaseClient.auth.admin.createUser({
          email: targetUser.email,
          password: temporaryPassword,
          email_confirm: true,
        });
        if (createErr || !createRes?.user) {
          // Fallback: call create-missing-auth-user function with admin secret
          const adminResetSecret = Deno.env.get('ADMIN_RESET_SECRET') ?? '';
          const { data: cmData, error: cmError } = await supabaseClient.functions.invoke('create-missing-auth-user', {
            body: { email: targetUser.email, password: temporaryPassword, adminSecret: adminResetSecret }
          });
          if (cmError || !cmData?.success || !cmData?.userId) {
            // Final fallback: try updating by the provided ID in case it's valid
            const { error: updateErr } = await supabaseClient.auth.admin.updateUserById(targetUser.id, { password: temporaryPassword });
            if (updateErr) throw (createErr ?? cmError ?? updateErr);
            authUserId = targetUser.id;
          } else {
            authUserId = cmData.userId;
            createdNewAuthUser = true;
          }
        } else {
          authUserId = createRes.user.id;
          createdNewAuthUser = true;
        }
      }

      // Always force password change on next login after admin reset
      await supabaseClient
        .from('profiles')
        .update({ must_change_password: true })
        .eq('id', targetUser.id);

      // Record the password reset (best-effort)
      try {
        await supabaseClient
          .from('password_resets')
          .insert([{
            user_id: targetUser.id,
            organization_id: organizationId,
            requested_by: adminUserId,
            reset_type: resetType,
            temporary_password: temporaryPassword,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
            notes: notes
          }]);
      } catch (e) {
        console.warn('[admin-password-reset] password_resets insert skipped:', e?.message || e);
      }

      // Log in security audit (best-effort)
      try {
        await supabaseClient
          .from('security_audit_logs')
          .insert([{
            organization_id: organizationId,
            user_id: targetUser.id,
            actor_id: adminUserId,
            event_type: 'bulk_password_reset',
            event_description: `Bulk password reset for ${targetUser.first_name} ${targetUser.last_name}`,
            target_user_id: targetUser.id,
            metadata: {
              reset_type: resetType,
              bulk_operation: true,
              created_new_auth_user: createdNewAuthUser
            }
          }]);
      } catch (e) {
        console.warn('[admin-password-reset] security_audit_logs insert skipped:', e?.message || e);
      }

      results.push({
        success: true,
        userId: authUserId,
        email: targetUser.email,
        name: `${targetUser.first_name} ${targetUser.last_name}`,
        temporaryPassword: temporaryPassword,
        createdNewAuthUser,
      });

    } catch (error: any) {
      console.error(`Error resetting password for user ${targetUser.id}:`, error);
      errors.push({
        userId: targetUser.id,
        email: targetUser.email,
        error: error.message
      });
    }
  }

  return new Response(
    JSON.stringify({ 
      success: errors.length === 0,
      message: `Password reset completed. ${results.length} successful, ${errors.length} failed.`,
      results: results,
      errors: errors.length > 0 ? errors : undefined
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

serve(handler);