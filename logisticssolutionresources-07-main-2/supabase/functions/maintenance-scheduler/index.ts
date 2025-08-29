import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MaintenanceScheduleRequest {
  vehicle_id: string
  maintenance_type: string
  frequency_days?: number
  priority?: string
  notes?: string
  schedule_date?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { 
        autoRefreshToken: false, 
        persistSession: false 
      },
      global: {
        headers: { Authorization: req.headers.get('Authorization')! }
      }
    })

    // Get user from request
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response('Unauthorized', { 
        status: 401, 
        headers: corsHeaders 
      })
    }

    // Get organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      return new Response('Organization not found', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    if (req.method === 'POST') {
      // Schedule maintenance
      const scheduleData: MaintenanceScheduleRequest = await req.json()

      // Verify access to vehicle
      const { data: vehicle } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', scheduleData.vehicle_id)
        .eq('organization_id', profile.organization_id)
        .single()

      if (!vehicle) {
        return new Response('Vehicle not found or unauthorized', { 
          status: 404, 
          headers: corsHeaders 
        })
      }

      // Calculate next due date
      const scheduledDate = scheduleData.schedule_date ? new Date(scheduleData.schedule_date) : new Date()
      const frequencyDays = scheduleData.frequency_days || getDefaultFrequency(scheduleData.maintenance_type)
      const nextDueDate = new Date(scheduledDate)
      nextDueDate.setDate(nextDueDate.getDate() + frequencyDays)

      // Create maintenance schedule
      const { data: schedule, error: scheduleError } = await supabase
        .from('maintenance_schedules')
        .insert({
          vehicle_id: scheduleData.vehicle_id,
          organization_id: profile.organization_id,
          maintenance_type: scheduleData.maintenance_type,
          frequency_days: frequencyDays,
          next_due_date: nextDueDate.toISOString().split('T')[0]
        })
        .select()
        .single()

      if (scheduleError) {
        console.error('Error creating maintenance schedule:', scheduleError)
        return new Response('Failed to create maintenance schedule', { 
          status: 500, 
          headers: corsHeaders 
        })
      }

      // Create maintenance request
      const { data: request, error: requestError } = await supabase
        .from('maintenance_requests')
        .insert({
          vehicle_id: scheduleData.vehicle_id,
          organization_id: profile.organization_id,
          requested_by: user.id,
          maintenance_type: scheduleData.maintenance_type,
          priority: scheduleData.priority || 'medium',
          description: `Scheduled ${scheduleData.maintenance_type} maintenance`,
          notes: scheduleData.notes,
          scheduled_date: scheduledDate.toISOString().split('T')[0],
          status: 'scheduled'
        })
        .select()
        .single()

      if (requestError) {
        console.error('Error creating maintenance request:', requestError)
        return new Response('Failed to create maintenance request', { 
          status: 500, 
          headers: corsHeaders 
        })
      }

      // Create notification for mechanics
      await supabase
        .from('background_tasks')
        .insert({
          task_type: 'send_notification',
          organization_id: profile.organization_id,
          payload: {
            recipient_role: 'mechanic',
            title: 'New Maintenance Scheduled',
            body: `${scheduleData.maintenance_type} scheduled for vehicle ${vehicle.vehicle_number}`,
            type: 'maintenance',
            metadata: {
              vehicle_id: scheduleData.vehicle_id,
              maintenance_request_id: request.id,
              maintenance_type: scheduleData.maintenance_type
            }
          }
        })

      // Log activity
      await supabase.rpc('log_user_activity', {
        p_user_id: user.id,
        p_action: 'maintenance_scheduled',
        p_resource_type: 'maintenance_request',
        p_resource_id: request.id,
        p_metadata: {
          vehicle_id: scheduleData.vehicle_id,
          maintenance_type: scheduleData.maintenance_type,
          next_due_date: nextDueDate.toISOString().split('T')[0]
        }
      })

      console.log(`Maintenance scheduled for vehicle ${vehicle.vehicle_number}: ${scheduleData.maintenance_type}`)

      return new Response(JSON.stringify({
        success: true,
        schedule: {
          id: schedule.id,
          vehicle_id: scheduleData.vehicle_id,
          maintenance_type: scheduleData.maintenance_type,
          next_due_date: nextDueDate.toISOString().split('T')[0],
          frequency_days: frequencyDays
        },
        request: {
          id: request.id,
          scheduled_date: scheduledDate.toISOString().split('T')[0],
          status: 'scheduled'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    } else if (req.method === 'GET') {
      // Get maintenance schedules and overdue items
      const url = new URL(req.url)
      const vehicleId = url.searchParams.get('vehicle_id')
      const includeOverdue = url.searchParams.get('include_overdue') === 'true'

      let query = supabase
        .from('maintenance_schedules')
        .select(`
          *,
          vehicles (
            vehicle_number,
            make,
            model,
            year
          )
        `)
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)

      if (vehicleId) {
        query = query.eq('vehicle_id', vehicleId)
      }

      const { data: schedules, error: schedulesError } = await query

      if (schedulesError) {
        console.error('Error fetching maintenance schedules:', schedulesError)
        return new Response('Failed to fetch maintenance schedules', { 
          status: 500, 
          headers: corsHeaders 
        })
      }

      let overdueItems: any[] = []
      if (includeOverdue) {
        const today = new Date().toISOString().split('T')[0]
        overdueItems = schedules?.filter(schedule => 
          schedule.next_due_date && schedule.next_due_date <= today
        ) || []
      }

      // Get upcoming maintenance requests
      const { data: upcomingRequests } = await supabase
        .from('maintenance_requests')
        .select(`
          *,
          vehicles (
            vehicle_number,
            make,
            model
          )
        `)
        .eq('organization_id', profile.organization_id)
        .in('status', ['scheduled', 'pending'])
        .gte('scheduled_date', new Date().toISOString().split('T')[0])
        .order('scheduled_date', { ascending: true })
        .limit(10)

      return new Response(JSON.stringify({
        schedules: schedules || [],
        overdue_items: overdueItems,
        upcoming_requests: upcomingRequests || []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    })

  } catch (error) {
    console.error('Maintenance scheduler error:', error)
    return new Response('Internal server error', { 
      status: 500, 
      headers: corsHeaders 
    })
  }
})

function getDefaultFrequency(maintenanceType: string): number {
  const frequencies: Record<string, number> = {
    'oil_change': 90,           // 3 months
    'tire_rotation': 180,       // 6 months
    'brake_inspection': 180,    // 6 months
    'annual_service': 365,      // 1 year
    'mot_test': 365,           // 1 year
    'safety_inspection': 90,    // 3 months
    'engine_service': 180,      // 6 months
    'transmission_service': 365, // 1 year
    'air_filter': 90,           // 3 months
    'fuel_filter': 180,         // 6 months
    'coolant_flush': 365,       // 1 year
    'battery_check': 180        // 6 months
  }

  return frequencies[maintenanceType] || 90 // Default to 3 months
}