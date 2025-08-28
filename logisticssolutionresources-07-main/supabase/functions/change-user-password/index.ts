import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

interface ChangePasswordRequest {
  targetUserId?: string;
  targetEmail?: string;
  newPassword?: string;
  forceMustChange?: boolean; // default true
  adminSecret?: string; // optional override if provided
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const adminResetSecret = Deno.env.get("ADMIN_RESET_SECRET") ?? "";

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
  const supabaseAuthed = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });

  // Helper: paginate through auth users to find by email
  const findAuthUserIdByEmail = async (email: string): Promise<string | null> => {
    for (let page = 1; page <= 50; page++) {
      const { data, error } = await (supabaseAdmin as any).auth.admin.listUsers({ page, perPage: 1000 });
      if (error) {
        console.error('[change-user-password] listUsers page error', page, error);
        break;
      }
      const users = (data?.users || []) as any[];
      if (!users.length) break;
      const match = users.find((u) => (u.email || '').toLowerCase() === email.toLowerCase());
      if (match) return match.id as string;
    }
    return null;
  };

  try {
    const body: ChangePasswordRequest = await req.json();
    console.log("[change-user-password] Incoming request", { ...body, newPassword: body.newPassword ? "[REDACTED]" : undefined });

    // Check rate limiting for password changes
    const identifier = body.targetEmail || body.targetUserId || 'unknown';
    const { data: rateLimitCheck, error: rateLimitError } = await supabaseAdmin.rpc('check_auth_rate_limit', {
      user_identifier: identifier,
      max_attempts: 3,
      window_minutes: 15
    });

    if (rateLimitError || !rateLimitCheck) {
      console.error('Rate limit exceeded for password change:', identifier);
      
      // Log security event
      await supabaseAdmin.rpc('log_security_event', {
        event_type: 'rate_limit_exceeded',
        event_details: { 
          operation: 'password_change',
          identifier,
          ip: req.headers.get('x-forwarded-for') || 'unknown'
        },
        severity: 'warning'
      });

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Rate limit exceeded. Please try again later.' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 429 
        }
      );
    }

    // Authorization: either valid admin JWT or admin secret
    let authorized = false;
    let adminUserId: string | null = null;

    if (body.adminSecret && adminResetSecret && body.adminSecret === adminResetSecret) {
      authorized = true;
      console.log("[change-user-password] Authorized via admin secret");
    } else {
      const { data: userResult, error: userErr } = await supabaseAuthed.auth.getUser();
      if (userErr || !userResult?.user) {
        return new Response(
          JSON.stringify({ error: "Unauthorized", details: userErr?.message || "Missing/invalid JWT" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      adminUserId = userResult.user.id;
      
      // Use the new safe password change request function
      const { data: prepResult } = await supabaseAdmin.rpc('safe_password_change_request', {
        p_target_user_id: body.targetUserId,
        p_admin_user_id: adminUserId,
        p_new_password: body.newPassword
      });

      if (!prepResult?.success) {
        return new Response(
          JSON.stringify({ 
            error: prepResult?.error || "Permission verification failed",
            code: prepResult?.code || "permission_denied"
          }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      authorized = true;
      console.log("[change-user-password] Authorized via database function for admin user", adminUserId);
    }

    if (!authorized) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Resolve target auth user with improved error handling
    let targetAuthUserId: string | null = null;
    let targetEmail: string | null = body.targetEmail || null;
    let targetProfile: any = null;

    // First, get profile information regardless of auth user existence
    if (body.targetUserId) {
      const { data: prof, error: profErr } = await supabaseAdmin
        .from("profiles")
        .select("email, role, organization_id")
        .eq("id", body.targetUserId)
        .maybeSingle();

      if (prof) {
        targetProfile = prof;
        targetEmail = prof.email;
        console.log("[change-user-password] Found profile", { id: body.targetUserId, email: prof.email });
      } else {
        console.log("[change-user-password] Profile not found", profErr?.message);
      }

      // Now try to find existing auth user
      try {
        const { data: authUser, error: getByIdErr } = await supabaseAdmin.auth.admin.getUserById(body.targetUserId);
        if (!getByIdErr && authUser?.user) {
          targetAuthUserId = authUser.user.id;
          console.log("[change-user-password] Found existing auth user by ID", targetAuthUserId);
        } else {
          console.log("[change-user-password] Auth user not found by ID", getByIdErr?.message);
        }
      } catch (err) {
        console.log('[change-user-password] getUserById threw', err?.message || err);
      }
    }

    // If still no auth user id but we have an email, try to find via listUsers (paginated)
    if (!targetAuthUserId && targetEmail) {
      console.log("[change-user-password] Searching for existing auth user by email", targetEmail);
      targetAuthUserId = await findAuthUserIdByEmail(targetEmail);
      if (targetAuthUserId) {
        console.log("[change-user-password] Found existing auth user by email", targetEmail);
      }
    }

    // Handle auth user creation with proper duplicate handling
    let createdTemp: string | null = null;
    if (!targetAuthUserId && targetEmail) {
      console.log("[change-user-password] Creating new auth user for email", targetEmail);
      createdTemp = `TempPass${Math.floor(Math.random() * 10000)}!`;
      
      try {
        const { data: createRes, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email: targetEmail,
          password: createdTemp,
          email_confirm: true,
        });
        
        if (createErr) {
          console.error('[change-user-password] createUser error', createErr);
          // Always attempt to find existing user by email after any create error
          console.log('[change-user-password] Attempting to locate existing user by email after create error');
          const foundId = await findAuthUserIdByEmail(targetEmail);
          if (foundId) {
            targetAuthUserId = foundId;
            console.log('[change-user-password] Found existing auth user after create error', targetAuthUserId);
          }
        } else {
          targetAuthUserId = createRes?.user?.id ?? null;
          console.log('[change-user-password] Successfully created auth user for email', targetEmail);
        }
      } catch (err: any) {
        console.error('[change-user-password] Auth user creation threw error', err);
        // Try one more time to find existing user
        targetAuthUserId = await findAuthUserIdByEmail(targetEmail);
      }
    }

    if (!targetAuthUserId) {
      return new Response(
        JSON.stringify({
          error: "User not found in authentication system",
          code: "user_not_found",
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const finalPassword = body.newPassword && body.newPassword.length >= 8
      ? body.newPassword
      : (createdTemp ?? `TempPass${Math.floor(Math.random() * 10000)}!`);

    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(targetAuthUserId, {
      password: finalPassword,
    });

    if (updateErr) {
      console.error("[change-user-password] updateUserById error", updateErr);
      return new Response(
        JSON.stringify({ error: "Failed to update password", details: updateErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark profile to require password change and log operation
    const mustChange = body.forceMustChange !== false; // default true
    if (mustChange) {
      if (body.targetUserId) {
        await supabaseAdmin
          .from("profiles")
          .update({ must_change_password: true })
          .eq("id", body.targetUserId);
      } else if (targetEmail) {
        await supabaseAdmin
          .from("profiles")
          .update({ must_change_password: true })
          .eq("email", targetEmail);
      }
    }

// Log successful admin operation if we have an admin user and target profile
if (adminUserId && (body.targetUserId || targetEmail)) {
  try {
    await supabaseAdmin.rpc('log_admin_operation', {
      p_admin_user_id: adminUserId,
      p_target_user_id: body.targetUserId ?? null,
      p_target_email: targetEmail,
      p_operation_type: 'password_reset_completed',
      p_operation_details: {
        method: 'edge_function',
        auth_user_existed: targetAuthUserId !== null,
        created_new_auth_user: createdTemp !== null,
        temporary_password_generated: !body.newPassword
      },
      p_success: true,
      p_ip_address: req.headers.get('x-forwarded-for') || null,
      p_user_agent: req.headers.get('user-agent') || null
    });

    // Enhanced security event logging
    await supabaseAdmin.rpc('log_security_event', {
      event_type: 'admin_password_change',
      event_details: {
        target_user_id: body.targetUserId,
        target_email: targetEmail,
        admin_method: body.adminSecret ? 'admin_secret' : 'admin_jwt',
        new_user_created: createdTemp !== null
      },
      severity: 'info',
      user_id: adminUserId,
      ip_address: req.headers.get('x-forwarded-for') || null
    });
  } catch (logErr) {
    console.error('[change-user-password] Failed to log operation', logErr);
    // Don't fail the operation if logging fails
  }
}

    return new Response(
      JSON.stringify({
        success: true,
        message: "Password updated successfully",
        temporaryPassword: body.newPassword ? null : finalPassword,
        targetUserId: targetAuthUserId,
        targetEmail,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("[change-user-password] Unexpected error", e);
    return new Response(
      JSON.stringify({ error: "Unexpected error", details: e?.message || String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
