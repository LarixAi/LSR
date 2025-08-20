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
    const { training_id, progress, status, completion_date } = await req.json()

    // Validate required fields
    if (!training_id || progress === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: training_id, progress' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate progress range
    if (progress < 0 || progress > 100) {
      return new Response(
        JSON.stringify({ error: 'Progress must be between 0 and 100' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the user from the request
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

    // Get the training record and verify ownership
    const { data: training, error: trainingError } = await supabase
      .from('training_completions')
      .select('*')
      .eq('id', training_id)
      .eq('driver_id', user.id)
      .single()

    if (trainingError || !training) {
      return new Response(
        JSON.stringify({ error: 'Training record not found or access denied' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Prepare update data
    const updateData: any = {
      progress,
      updated_at: new Date().toISOString()
    }

    // Update status if provided
    if (status) {
      updateData.status = status
    }

    // Update completion date if training is completed
    if (progress === 100 || status === 'completed') {
      updateData.completion_date = completion_date || new Date().toISOString()
      updateData.status = 'completed'
    }

    // Update the training record
    const { data: updatedTraining, error: updateError } = await supabase
      .from('training_completions')
      .update(updateData)
      .eq('id', training_id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating training:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update training progress' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        training: updatedTraining,
        message: 'Training progress updated successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in update-training-progress:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
