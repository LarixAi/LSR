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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the request body
    const { driver_id, training_type, training_name, due_date, notes } = await req.json()

    // Validate required fields
    if (!driver_id || !training_type || !training_name || !due_date) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: driver_id, training_type, training_name, due_date' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the admin user from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify the user is an admin
    const { data: adminProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role, organization_id')
      .eq('id', user.id)
      .single()

    if (profileError || !adminProfile || !['admin', 'council'].includes(adminProfile.role)) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin access required' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify the driver exists and belongs to the same organization
    const { data: driverProfile, error: driverError } = await supabase
      .from('profiles')
      .select('id, organization_id')
      .eq('id', driver_id)
      .eq('organization_id', adminProfile.organization_id)
      .single()

    if (driverError || !driverProfile) {
      return new Response(
        JSON.stringify({ error: 'Driver not found or not in your organization' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create the training assignment
    const { data: training, error: insertError } = await supabase
      .from('training_completions')
      .insert({
        driver_id,
        organization_id: adminProfile.organization_id,
        training_type,
        training_name,
        status: 'not_started',
        progress: 0,
        due_date,
        notes: notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting training:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to create training assignment' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Send notification to driver (you can implement this later)
    // For now, we'll just return success

    return new Response(
      JSON.stringify({ 
        success: true, 
        training,
        message: 'Training assigned successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in assign-driver-training:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
