import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BackgroundTask {
  id: string
  task_type: string
  payload: any
  organization_id: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Processing background tasks...')

    // Get next task to process
    const { data: tasks, error: taskError } = await supabase
      .rpc('get_next_background_task')

    if (taskError) {
      console.error('Error fetching task:', taskError)
      return new Response('Task fetch error', { 
        status: 500, 
        headers: corsHeaders 
      })
    }

    if (!tasks || tasks.length === 0) {
      console.log('No tasks to process')
      return new Response(JSON.stringify({ message: 'No tasks to process' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const task: BackgroundTask = tasks[0]
    console.log(`Processing task: ${task.task_type} for org: ${task.organization_id}`)

    let success = false
    let errorMessage: string | null = null

    try {
      // Process different task types
      switch (task.task_type) {
        case 'send_notification':
          await processNotificationTask(supabase, task)
          success = true
          break

        case 'generate_report':
          await processReportTask(supabase, task)
          success = true
          break

        case 'sync_driver_locations':
          await processSyncLocationTask(supabase, task)
          success = true
          break

        case 'cleanup_old_data':
          await processCleanupTask(supabase, task)
          success = true
          break

        case 'send_email':
          await processEmailTask(supabase, task)
          success = true
          break

        default:
          throw new Error(`Unknown task type: ${task.task_type}`)
      }
    } catch (error) {
      console.error(`Task processing error:`, error)
      errorMessage = error.message
      success = false
    }

    // Mark task as completed or failed
    const { error: completeError } = await supabase
      .rpc('complete_background_task', {
        p_task_id: task.id,
        p_status: success ? 'completed' : 'failed',
        p_error_message: errorMessage
      })

    if (completeError) {
      console.error('Error completing task:', completeError)
    }

    console.log(`Task ${task.id} ${success ? 'completed' : 'failed'}`)

    return new Response(JSON.stringify({
      taskId: task.id,
      taskType: task.task_type,
      status: success ? 'completed' : 'failed',
      error: errorMessage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Background processor error:', error)
    return new Response('Internal server error', { 
      status: 500, 
      headers: corsHeaders 
    })
  }
})

async function processNotificationTask(supabase: any, task: BackgroundTask) {
  const { user_id, title, message, type } = task.payload

  await supabase
    .from('enhanced_notifications')
    .insert({
      user_id,
      organization_id: task.organization_id,
      title,
      body: message,
      type: type || 'info'
    })

  console.log(`Notification sent to user ${user_id}`)
}

async function processReportTask(supabase: any, task: BackgroundTask) {
  const { report_type, date_range } = task.payload

  // Generate report based on type
  let reportData: any = {}

  switch (report_type) {
    case 'fleet_summary':
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('*, maintenance_records(*)')
        .eq('organization_id', task.organization_id)

      reportData = {
        total_vehicles: vehicles?.length || 0,
        active_vehicles: vehicles?.filter(v => v.is_active).length || 0,
        maintenance_due: vehicles?.filter(v => 
          v.maintenance_records?.some(m => new Date(m.next_service_date) < new Date())
        ).length || 0
      }
      break

    case 'driver_performance':
      const { data: drivers } = await supabase
        .from('profiles')
        .select('*, jobs(*)')
        .eq('organization_id', task.organization_id)
        .eq('role', 'driver')

      reportData = {
        total_drivers: drivers?.length || 0,
        active_drivers: drivers?.filter(d => d.employment_status === 'active').length || 0,
        completed_jobs: drivers?.reduce((sum, d) => 
          sum + (d.jobs?.filter(j => j.status === 'completed').length || 0), 0
        ) || 0
      }
      break
  }

  // Store report in a reports table (would need to create this table)
  console.log(`Generated ${report_type} report:`, reportData)
}

async function processSyncLocationTask(supabase: any, task: BackgroundTask) {
  const { driver_ids } = task.payload

  // Sync driver locations from external GPS system
  for (const driverId of driver_ids) {
    try {
      // Get the latest location from the driver's device or GPS tracker
      const { data: latestLocation, error } = await supabase
        .from('driver_locations')
        .select('*')
        .eq('driver_id', driverId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error(`Error fetching location for driver ${driverId}:`, error)
        continue
      }

      // If no location exists, skip this driver
      if (!latestLocation) {
        console.log(`No location data available for driver ${driverId}`)
        continue
      }

      // Update the location with current timestamp
      const updatedLocation = {
        ...latestLocation,
        timestamp: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      await supabase
        .from('driver_locations')
        .upsert(updatedLocation, { onConflict: 'driver_id' })

      console.log(`Updated location for driver ${driverId}`)
    } catch (error) {
      console.error(`Failed to sync location for driver ${driverId}:`, error)
    }
  }

  console.log(`Processed location sync for ${driver_ids.length} drivers`)
}

async function processCleanupTask(supabase: any, task: BackgroundTask) {
  const { table_name, retention_days } = task.payload
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retention_days)

  const { data, error } = await supabase
    .from(table_name)
    .delete()
    .eq('organization_id', task.organization_id)
    .lt('created_at', cutoffDate.toISOString())

  if (error) {
    throw error
  }

  console.log(`Cleaned up old data from ${table_name}`)
}

async function processEmailTask(supabase: any, task: BackgroundTask) {
  const { to_email, subject, template, data } = task.payload

  // This would integrate with an email service like SendGrid or Resend
  // For now, just log the email details
  console.log(`Email task: ${subject} to ${to_email}`)
  console.log(`Template: ${template}`, data)

  // In a real implementation, you would:
  // 1. Load the email template
  // 2. Populate it with data
  // 3. Send via email service API
  // 4. Track delivery status
}