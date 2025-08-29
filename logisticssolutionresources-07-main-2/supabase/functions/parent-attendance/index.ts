import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const payload = await req.json().catch(() => null) as {
      child_id?: number;
      attendance_date?: string; // YYYY-MM-DD
      status?: "present" | "absent";
      notes?: string | null;
    } | null;

    if (!payload || !payload.child_id || !payload.status) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const childId = Number(payload.child_id);
    const attendanceDate = (payload.attendance_date || new Date().toISOString().slice(0, 10));
    const status = payload.status;
    const notes = payload.notes ?? null;

    // Fetch child and verify ownership
    const { data: child, error: childErr } = await supabaseAdmin
      .from('child_profiles')
      .select('id, parent_id, route_id, organization_id, first_name, last_name')
      .eq('id', childId)
      .maybeSingle();

    if (childErr || !child) {
      console.error('Child fetch error', childErr);
      return new Response(JSON.stringify({ error: "Child not found" }), { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    if (child.parent_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    // Upsert daily attendance
    const { error: upsertErr } = await supabaseAdmin
      .from('daily_attendance')
      .upsert({
        child_id: childId,
        attendance_date: attendanceDate,
        attendance_status: status,
        notes,
      }, { onConflict: 'child_id,attendance_date' });

    if (upsertErr) {
      console.error('Attendance upsert error', upsertErr);
      return new Response(JSON.stringify({ error: "Failed to update attendance" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    // Optionally log tracking event when absent
    if (status === 'absent') {
      const { error: trackErr } = await supabaseAdmin
        .from('child_tracking')
        .insert({
          child_id: childId,
          event_type: 'absent',
          organization_id: child.organization_id,
          created_by: user.id,
          notes,
        });
      if (trackErr) console.warn('child_tracking insert warning', trackErr);
    }

    // Find current driver assigned to child's route
    let driverId: string | null = null;
    if (child.route_id) {
      const { data: assignment, error: assignErr } = await supabaseAdmin
        .from('driver_assignments')
        .select('driver_id')
        .eq('route_id', child.route_id)
        .eq('active', true)
        .order('start_date', { ascending: false })
        .maybeSingle();
      if (!assignErr && assignment?.driver_id) driverId = assignment.driver_id as string;
    }

    // Notify driver if available
    if (driverId) {
      const title = status === 'absent' ? 'Child absent today' : 'Child attending today';
      const message = `${child.first_name} ${child.last_name} will be ${status === 'absent' ? 'absent' : 'attending'} on ${attendanceDate}.`;
      const { error: notifErr } = await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: driverId,
          organization_id: child.organization_id,
          type: status === 'absent' ? 'alert' : 'info',
          title,
          message,
          metadata: { child_id: childId, attendance_date: attendanceDate, status },
        });
      if (notifErr) console.warn('Driver notification insert warning', notifErr);
    }

    return new Response(JSON.stringify({ success: true, status, attendance_date: attendanceDate }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e) {
    console.error('Unhandled error in parent-attendance function', e);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
});