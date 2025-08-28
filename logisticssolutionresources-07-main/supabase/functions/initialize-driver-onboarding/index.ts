
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { driverId } = await req.json()

    if (!driverId) {
      return new Response(
        JSON.stringify({ error: 'Driver ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Initializing onboarding tasks for driver:', driverId)

    // Get all onboarding tasks
    const { data: tasks, error: tasksError } = await supabaseAdmin
      .from('onboarding_tasks')
      .select('*')
      .eq('is_required', true)
      .order('sort_order')

    if (tasksError) {
      console.error('Error fetching onboarding tasks:', tasksError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch onboarding tasks' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create user onboarding tasks for the driver
    const userTasks = tasks.map(task => ({
      user_id: driverId,
      task_id: task.id,
      status: 'pending'
    }))

    const { error: insertError } = await supabaseAdmin
      .from('user_onboarding_tasks')
      .insert(userTasks)

    if (insertError) {
      console.error('Error creating user onboarding tasks:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to create onboarding tasks' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Successfully initialized onboarding tasks for driver')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Onboarding tasks initialized successfully',
        tasksCount: tasks.length
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error in initialize-driver-onboarding function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
