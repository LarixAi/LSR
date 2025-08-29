import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

interface CreateMissingAuthUserRequest {
  email: string;
  profileId?: string;
  password?: string;
  adminSecret?: string;
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
  const findAuthUserByEmail = async (email: string): Promise<any | null> => {
    for (let page = 1; page <= 50; page++) {
      const { data, error } = await (supabaseAdmin as any).auth.admin.listUsers({ page, perPage: 1000 });
      if (error) {
        console.error('[create-missing-auth-user] listUsers page error', page, error);
        break;
      }
      const users = (data?.users || []) as any[];
      if (!users.length) break;
      const match = users.find((u) => (u.email || '').toLowerCase() === email.toLowerCase());
      if (match) return match;
    }
    return null;
  };

  try {
    const body: CreateMissingAuthUserRequest = await req.json();
    console.log("[create-missing-auth-user] Incoming request", body);

    let email = body.email;

    // If only profileId provided, fetch email from profile
    if (!email && body.profileId) {
      const { data: prof, error: profErr } = await supabaseAdmin
        .from('profiles')
        .select('email')
        .eq('id', body.profileId)
        .maybeSingle();
      if (profErr) {
        return new Response(
          JSON.stringify({ error: 'Failed to load profile', details: profErr.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      email = prof?.email || '';
    }

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Authorization: either valid admin JWT or admin secret
    let authorized = false;

    if (body.adminSecret && adminResetSecret && body.adminSecret === adminResetSecret) {
      authorized = true;
      console.log("[create-missing-auth-user] Authorized via admin secret");
    } else {
      const { data: userResult, error: userErr } = await supabaseAuthed.auth.getUser();
      if (userErr || !userResult?.user) {
        return new Response(
          JSON.stringify({ error: "Unauthorized", details: userErr?.message || "Missing/invalid JWT" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const requesterId = userResult.user.id;
      const { data: profile, error: profileErr } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", requesterId)
        .single();

      if (profileErr) {
        console.error("[create-missing-auth-user] Failed to fetch requester profile", profileErr);
        return new Response(
          JSON.stringify({ error: "Failed to verify permissions" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const adminRoles = new Set(["admin", "council", "super_admin", "compliance_officer"]);
      if (!profile || !adminRoles.has(profile.role)) {
        return new Response(
          JSON.stringify({ error: "Forbidden - admin only" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      authorized = true;
      console.log("[create-missing-auth-user] Authorized via JWT for admin user", requesterId);
    }

    // Check if a user already exists with this email (paginated search)
    console.log("[create-missing-auth-user] Checking for existing auth user with email", email);
    const existing = await findAuthUserByEmail(email);
    if (existing) {
      console.log("[create-missing-auth-user] Auth user already exists", existing.id);
      // Ensure profile is marked to change password
      await supabaseAdmin.from('profiles').update({ must_change_password: true }).eq('email', email);
      return new Response(
        JSON.stringify({ success: true, message: 'User already exists', userId: existing.id }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const finalPassword = body.password && body.password.length >= 8
      ? body.password
      : `TempPass${Math.floor(Math.random() * 10000)}!`;

    console.log("[create-missing-auth-user] Creating new auth user for email", email);

    try {
      const { data: createRes, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: finalPassword,
        email_confirm: true,
      });

      if (createErr || !createRes?.user) {
        console.error("[create-missing-auth-user] createUser error", createErr);
        
        // Check if it's a duplicate error - this means user was created between our check and now
        if (createErr?.message?.includes('duplicate') || createErr?.message?.includes('already exists')) {
          console.log("[create-missing-auth-user] Duplicate error - user created concurrently, searching again");
          
          // Try to find the user that was created
          const fallback = await findAuthUserByEmail(email);
          if (fallback) {
            await supabaseAdmin.from('profiles').update({ must_change_password: true }).eq('email', email);
            return new Response(
              JSON.stringify({ success: true, message: 'User already exists (created concurrently)', userId: fallback.id }),
              { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
        
        return new Response(
          JSON.stringify({ error: "Failed to create user in authentication system", details: createErr?.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("[create-missing-auth-user] Successfully created auth user", createRes.user.id);
      
    } catch (err: any) {
      console.error("[create-missing-auth-user] Auth user creation threw error", err);
      
      // Try one more fallback search
      const fallback = await findAuthUserByEmail(email);
      if (fallback) {
        await supabaseAdmin.from('profiles').update({ must_change_password: true }).eq('email', email);
        return new Response(
          JSON.stringify({ success: true, message: 'User found after creation error', userId: fallback.id }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to create user in authentication system", details: err?.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark profile for password change if a matching profile exists
    await supabaseAdmin
      .from("profiles")
      .update({ must_change_password: true })
      .eq("email", email);

    // Respond with success and include created user id when available
    return new Response(
      JSON.stringify({
        success: true,
        message: "Auth user created successfully",
        // created user id may not be available if created in fallback flows
        userId: (await findAuthUserByEmail(email))?.id || null,
        temporaryPassword: body.password ? null : finalPassword,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("[create-missing-auth-user] Unexpected error", e);
    return new Response(
      JSON.stringify({ error: "Unexpected error", details: e?.message || String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
