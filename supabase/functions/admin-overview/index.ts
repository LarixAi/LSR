// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getClient(req: Request) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: req.headers.get('Authorization') ?? '' },
    },
  });
}

export async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { ...corsHeaders } });
  }

  const supabase = getClient(req);

  try {
    // Jobs counts
    const [jobsTotalRes, jobsActiveRes] = await Promise.all([
      supabase.from('jobs').select('id', { count: 'exact', head: true }),
      supabase.from('jobs').select('id', { count: 'exact', head: true }).in('status', ['active', 'in_progress', 'assigned'])
    ]);

    const totalJobs = jobsTotalRes.count ?? 0;
    const activeJobs = jobsActiveRes.count ?? 0;

    // Drivers counts
    const [driversTotalRes, driversActiveRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'driver'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'driver').eq('is_active', true),
    ]);

    const totalDrivers = driversTotalRes.count ?? 0;
    const activeDrivers = driversActiveRes.count ?? 0;

    // Incidents counts
    const [incidentsTotalRes, incidentsOpenRes] = await Promise.all([
      supabase.from('incidents').select('id', { count: 'exact', head: true }),
      supabase.from('incidents').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    ]);

    const totalIncidents = incidentsTotalRes.count ?? 0;
    const openIncidents = incidentsOpenRes.count ?? 0;

    // Vehicles (optional)
    let totalVehicles = 0;
    let activeVehicles = 0;
    try {
      const [vehTotalRes, vehActiveRes] = await Promise.all([
        supabase.from('vehicles').select('id', { count: 'exact', head: true }),
        supabase.from('vehicles').select('id', { count: 'exact', head: true }).eq('is_active', true),
      ]);
      totalVehicles = vehTotalRes.count ?? 0;
      activeVehicles = vehActiveRes.count ?? 0;
    } catch (e: any) {
      // table may not exist; ignore
    }

    // Routes (optional)
    let totalRoutes = 0;
    try {
      const routesRes = await supabase.from('routes').select('id', { count: 'exact', head: true });
      totalRoutes = routesRes.count ?? 0;
    } catch (e: any) {
      // table may not exist; ignore
    }

    const result = {
      totalJobs,
      activeJobs,
      totalDrivers,
      activeDrivers,
      totalVehicles,
      activeVehicles,
      totalIncidents,
      openIncidents,
      totalRoutes,
    };

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 200,
    });
  } catch (error: any) {
    console.error('admin-overview error', error);
    return new Response(JSON.stringify({ error: error?.message ?? 'Unknown error' }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      status: 500,
    });
  }
}

Deno.serve(handler);
