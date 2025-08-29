import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

interface CreateDriverRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  hireDate?: string;
  cdlNumber?: string;
  medicalCardExpiry?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  // Only handle POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
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

    // Create a separate client for JWT verification using anon key
    const verifyClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
    
    // Verify the JWT token and get user
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await verifyClient.auth.getUser(jwt);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the requesting user's organization (try both fields)
    const { data: requestingUser, error: userError } = await supabaseClient
      .from('profiles')
      .select('organization_id, default_organization_id, role')
      .eq('id', user.id)
      .single();

    // Use whichever organization_id field is available
    const userOrgId = requestingUser?.default_organization_id || requestingUser?.organization_id;

    if (userError || !userOrgId) {
      console.error('Error getting requesting user organization:', userError, 'User data:', requestingUser);
      return new Response(
        JSON.stringify({ error: 'User organization not found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin privileges in their organization
    const { data: membership, error: membershipError } = await supabaseClient
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', userOrgId)
      .eq('role', 'admin')
      .eq('status', 'active')
      .single();

    // Fallback: allow based on profile role
    const adminRoles = new Set(['admin', 'council', 'super_admin', 'compliance_officer']);
    const hasAdminMembership = !!membership && !membershipError;
    const hasAdminProfileRole = adminRoles.has(requestingUser.role);

    if (!hasAdminMembership && !hasAdminProfileRole) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions. Admin role required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestData: CreateDriverRequest = await req.json();
    console.log('Creating driver with data:', requestData);

    // Validate required fields
    if (!requestData.email || !requestData.firstName || !requestData.lastName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, firstName, lastName' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate a secure temporary password
    const temporaryPassword = crypto.randomUUID().replace(/-/g, '').substring(0, 16);

    // Ensure auth user exists (find or create) and set temp password
    let authUserId: string | null = null;
    let createdNewAuthUser = false;

    // Try find by email via pagination
    let foundAuthUser: any | null = null;
    for (let page = 1; page <= 50; page++) {
      const { data, error } = await (supabaseClient as any).auth.admin.listUsers({ page, perPage: 1000 });
      if (error) {
        console.error('[create-driver] listUsers error page', page, error);
        break;
      }
      const users = (data?.users || []) as any[];
      if (!users.length) break;
      const match = users.find((u: any) => ((u.email || '') as string).toLowerCase() === requestData.email.toLowerCase());
      if (match) { foundAuthUser = match; break; }
    }

    if (foundAuthUser?.id) {
      authUserId = foundAuthUser.id;
      const { error: pwErr } = await supabaseClient.auth.admin.updateUserById(authUserId, { password: temporaryPassword });
      if (pwErr) {
        console.warn('[create-driver] updateUserById after find failed, will proceed but mark must_change_password');
      }
    } else {
      const { data: createRes, error: createErr } = await supabaseClient.auth.admin.createUser({
        email: requestData.email,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: { first_name: requestData.firstName, last_name: requestData.lastName, role: 'driver' }
      });
      if (createErr || !createRes?.user) {
        // Fallback: call create-missing-auth-user via admin secret
        const adminResetSecret = Deno.env.get('ADMIN_RESET_SECRET') ?? '';
        const { data: cmData, error: cmError } = await supabaseClient.functions.invoke('create-missing-auth-user', {
          body: { email: requestData.email, password: temporaryPassword, adminSecret: adminResetSecret }
        });
        if (cmError || !cmData?.success || !cmData?.userId) {
          return new Response(
            JSON.stringify({ error: 'Failed to create user account', details: (createErr?.message || cmError?.message || 'Unknown') }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        authUserId = cmData.userId;
        createdNewAuthUser = true;
      } else {
        authUserId = createRes.user.id;
        createdNewAuthUser = true;
      }
    }

    if (!authUserId) {
      return new Response(
        JSON.stringify({ error: 'Failed to resolve authentication user' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create profile record with organization assignment
    const profileData = {
      id: authUserId,
      email: requestData.email,
      first_name: requestData.firstName,
      last_name: requestData.lastName,
      role: 'driver',
      phone: requestData.phone || null,
      address: requestData.address || null,
      city: requestData.city || null,
      state: requestData.state || null,
      zip_code: requestData.zipCode || null,
      hire_date: requestData.hireDate || null,
      cdl_number: requestData.cdlNumber || null,
      medical_card_expiry: requestData.medicalCardExpiry || null,
      is_active: true,
      must_change_password: true,
      organization_id: userOrgId,
      default_organization_id: userOrgId
    };

    // Create or update profile record with organization assignment
    const { data: existingProfile } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('id', authUserId)
      .maybeSingle();

    let profile: any = null;
    let profileError: any = null;

    if (existingProfile) {
      // Update existing profile (handles race with signup trigger)
      const { data: updated, error: updateErr } = await supabaseClient
        .from('profiles')
        .update({
          email: profileData.email,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          role: profileData.role,
          phone: profileData.phone,
          address: profileData.address,
          city: profileData.city,
          state: profileData.state,
          zip_code: profileData.zip_code,
          hire_date: profileData.hire_date,
          cdl_number: profileData.cdl_number,
          medical_card_expiry: profileData.medical_card_expiry,
          is_active: profileData.is_active,
          must_change_password: true,
          organization_id: profileData.organization_id,
          default_organization_id: profileData.default_organization_id
        })
        .eq('id', authUserId)
        .select()
        .single();
      profile = updated;
      profileError = updateErr;
    } else {
      // Insert new profile
      const { data: inserted, error: insertErr } = await supabaseClient
        .from('profiles')
        .insert([profileData])
        .select()
        .single();
      profile = inserted;
      profileError = insertErr;
    }

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Clean up the auth user if we failed to insert a new profile
      try { if (!existingProfile) { await supabaseClient.auth.admin.deleteUser(authUserId); } } catch (_) {}
      
      return new Response(
        JSON.stringify({ error: 'Failed to create driver profile', details: profileError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create membership record for the new driver (idempotent)
    const { data: existingMembership } = await supabaseClient
      .from('memberships')
      .select('id')
      .eq('user_id', authUserId)
      .eq('organization_id', userOrgId)
      .maybeSingle();

    if (!existingMembership) {
      const { error: membershipInsertError } = await supabaseClient
        .from('memberships')
        .insert([{
          user_id: authUserId,
          organization_id: userOrgId,
          role: 'driver',
          status: 'active',
          created_by: user.id
        }]);

      if (membershipInsertError) {
        console.error('Error creating membership:', membershipInsertError);
        // Clean up created records if profile was newly inserted
        try { /* do not delete auth user if profile pre-existed */ } catch (_) {}
        
        return new Response(
          JSON.stringify({ error: 'Failed to create driver membership', details: membershipInsertError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Log the driver creation in security audit (best-effort)
    try {
      await supabaseClient
        .from('security_audit_logs')
        .insert([{
          organization_id: userOrgId,
          user_id: authUserId,
          actor_id: user.id,
          event_type: 'driver_created',
          event_description: `Driver account created for ${requestData.firstName} ${requestData.lastName}`,
          target_user_id: authUserId,
          metadata: {
            email: requestData.email,
            temporary_password_generated: true,
            created_new_auth_user: createdNewAuthUser
          }
        }]);
    } catch (e) {
      console.warn('[create-driver] security_audit_logs insert skipped:', e?.message || e);
    }

    // Send credentials to driver via edge function (best effort)
    let emailSent = false;
    try {
      const credentialsResult = await supabaseClient.functions.invoke('send-driver-credentials', {
        body: {
          email: requestData.email,
          firstName: requestData.firstName,
          lastName: requestData.lastName,
          temporaryPassword: temporaryPassword,
          organizationName: 'Your Organization'
        }
      });

      if (!credentialsResult.error) {
        emailSent = true;
      } else {
        console.warn('Failed to send credentials email:', credentialsResult.error);
        // Log email failure (best-effort)
        try {
          await supabaseClient
            .from('security_audit_logs')
            .insert([{
              organization_id: userOrgId,
              actor_id: user.id,
              event_type: 'email_delivery_failed',
              event_description: `Failed to send credentials email to ${requestData.email}`,
              target_user_id: authUserId,
              metadata: { error: credentialsResult.error.message }
            }]);
        } catch (e) {
          console.warn('[create-driver] security_audit_logs (email failure) insert skipped:', e?.message || e);
        }
      }
    } catch (emailError) {
      console.warn('Failed to send credentials email:', emailError);
      // Don't fail the entire operation if email fails
    }

    console.log('Driver created successfully:', profile);

    return new Response(
      JSON.stringify({ 
        success: true, 
        driver: profile,
        temporaryPassword: temporaryPassword, // Return for admin to share if email fails
        emailSent: emailSent,
        message: emailSent 
          ? 'Driver created successfully. Login credentials have been sent to their email.'
          : 'Driver created successfully. Please share login credentials manually with the driver.'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in create-driver function:', error);
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

serve(handler);