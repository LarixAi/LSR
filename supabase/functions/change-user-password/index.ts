import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('change-user-password function called');
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Supabase URL exists:', !!supabaseUrl);
    console.log('Service role key exists:', !!supabaseServiceKey);
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables');
      return new Response(
        JSON.stringify({ error: 'Missing environment variables' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create service role client for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body parsed successfully:', requestBody);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body', details: parseError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    let { targetUserId, newPassword, adminUserId } = requestBody;

    console.log('Extracted parameters:', { 
      targetUserId: !!targetUserId, 
      newPassword: !!newPassword, 
      adminUserId: !!adminUserId,
      targetUserIdValue: targetUserId,
      adminUserIdValue: adminUserId
    });

    if (!targetUserId || !newPassword || !adminUserId) {
      console.error('Missing required parameters:', { 
        targetUserId: !!targetUserId, 
        newPassword: !!newPassword, 
        adminUserId: !!adminUserId 
      });
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters', 
          details: { 
            targetUserId: !!targetUserId, 
            newPassword: !!newPassword, 
            adminUserId: !!adminUserId 
          } 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Verifying admin user:', adminUserId);

    // Verify the admin user has permission to change this user's password
    // Use service role to bypass RLS
    const { data: adminProfile, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('role, organization_id')
      .eq('id', adminUserId)
      .single()

    console.log('Admin profile query result:', { adminProfile, adminError });

    if (adminError) {
      console.error('Admin profile error:', adminError);
      return new Response(
        JSON.stringify({ 
          error: 'Admin user not found', 
          details: adminError.message,
          code: adminError.code 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!adminProfile) {
      console.error('Admin profile not found');
      return new Response(
        JSON.stringify({ error: 'Admin user not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Admin profile found:', adminProfile);

    // Check if admin has permission (admin or council role)
    if (adminProfile.role !== 'admin' && adminProfile.role !== 'council' && adminProfile.role !== 'super_admin') {
      console.error('Insufficient permissions for admin:', adminProfile.role);
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient permissions', 
          details: `Role ${adminProfile.role} is not authorized` 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Getting target user profile:', targetUserId);

    // Get the target user's profile to check organization
    // Use service role to bypass RLS
    const { data: targetProfile, error: targetError } = await supabaseAdmin
      .from('profiles')
      .select('organization_id, role, email')
      .eq('id', targetUserId)
      .single()

    console.log('Target profile query result:', { targetProfile, targetError });

    if (targetError) {
      console.error('Target profile error:', targetError);
      return new Response(
        JSON.stringify({ 
          error: 'Target user not found', 
          details: targetError.message,
          code: targetError.code 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!targetProfile) {
      console.error('Target profile not found');
      return new Response(
        JSON.stringify({ error: 'Target user not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Target profile found:', targetProfile);

    // Check if target user is in the same organization
    if (targetProfile.organization_id !== adminProfile.organization_id) {
      console.error('Organization mismatch:', { 
        adminOrg: adminProfile.organization_id, 
        targetOrg: targetProfile.organization_id 
      });
      return new Response(
        JSON.stringify({ 
          error: 'Can only change passwords for users in your organization',
          details: {
            adminOrg: adminProfile.organization_id,
            targetOrg: targetProfile.organization_id
          }
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if target user is a driver (admins shouldn't change other admin passwords)
    if (targetProfile.role !== 'driver') {
      console.error('Target user is not a driver:', targetProfile.role);
      return new Response(
        JSON.stringify({ 
          error: 'Can only change passwords for drivers',
          details: `Target user role is ${targetProfile.role}`
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Checking if user exists in Auth:', targetUserId);

    // First, check if the user exists in Auth
    const { data: authUser, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(targetUserId);

    let authUserExists = false;
    if (authUserError) {
      console.log('Auth user not found, will create one:', authUserError.message);
      authUserExists = false;
    } else if (authUser.user) {
      console.log('Auth user found:', authUser.user.email);
      authUserExists = true;
    } else {
      console.log('Auth user not found, will create one');
      authUserExists = false;
    }

    // If user doesn't exist in Auth, create them automatically
    if (!authUserExists) {
      console.log('Auth user not found for profile:', targetProfile.email);
      console.log('Creating auth user automatically...');
      
      try {
        // Generate a temporary password for the new auth user
        const tempPassword = `TempPass${Math.random().toString(36).substring(2, 8)}!`;
        
        const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: targetProfile.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            first_name: targetProfile.first_name || '',
            last_name: targetProfile.last_name || '',
            role: targetProfile.role || 'driver'
          }
        });

        if (createError) {
          console.error('Failed to create auth user:', createError);
          return new Response(
            JSON.stringify({ 
              error: 'Failed to create user in authentication system',
              details: createError.message,
              code: 'AUTH_USER_CREATION_FAILED'
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        console.log('Successfully created auth user:', newAuthUser.user.id);
        
        // Update the profile ID to match the new auth user ID if different
        if (newAuthUser.user.id !== targetUserId) {
          console.log('Updating profile ID to match new auth user ID...');
          const { error: updateProfileError } = await supabaseAdmin
            .from('profiles')
            .update({ id: newAuthUser.user.id })
            .eq('id', targetUserId);
            
          if (updateProfileError) {
            console.error('Failed to update profile ID:', updateProfileError);
            // Continue anyway, the auth user was created successfully
          } else {
            console.log('Profile ID updated successfully');
            // Update targetUserId to the new auth user ID
            targetUserId = newAuthUser.user.id;
          }
        }
        
        // Now proceed with password update using the new auth user
        console.log('Proceeding with password update for newly created auth user...');
        
      } catch (error) {
        console.error('Error creating auth user:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to create user in authentication system',
            details: error.message,
            code: 'AUTH_USER_CREATION_ERROR'
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    console.log('Updating password for existing auth user:', targetUserId);

    // Update the user's password using admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      targetUserId,
      { 
        password: newPassword,
        user_metadata: {
          password_changed_at: new Date().toISOString()
        }
      }
    )

    if (updateError) {
      console.error('Password update error:', updateError);
      return new Response(
        JSON.stringify({ 
          error: updateError.message,
          details: updateError
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update the profile to mark password as changed
    const { error: updateProfileError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        must_change_password: false,
        password_changed_at: new Date().toISOString()
      })
      .eq('id', targetUserId);

    if (updateProfileError) {
      console.error('Failed to update profile password change timestamp:', updateProfileError);
      // Don't fail here, the password was updated successfully
    }

    console.log('Password updated successfully for user:', targetUserId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password updated successfully',
        targetUser: {
          id: targetUserId,
          email: targetProfile.email
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error in change-user-password:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        stack: error.stack,
        type: error.constructor.name
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
