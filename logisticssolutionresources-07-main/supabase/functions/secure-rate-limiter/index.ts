
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RateLimitRequest {
  identifier: string;
  maxAttempts: number;
  windowMs: number;
  action: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { identifier, maxAttempts, windowMs, action }: RateLimitRequest = await req.json()

    if (!identifier || !maxAttempts || !windowMs || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const now = new Date()
    const windowStart = new Date(now.getTime() - windowMs)

    // Check current attempts within the window
    const { data: attempts, error: fetchError } = await supabase
      .from('security_audit_logs')
      .select('*')
      .eq('event_type', 'rate_limit_attempt')
      .gte('created_at', windowStart.toISOString())
      .eq('event_details->>identifier', identifier)
      .eq('event_details->>action', action)

    if (fetchError) {
      console.error('Error fetching rate limit data:', fetchError)
      throw fetchError
    }

    const currentAttempts = attempts?.length || 0

    if (currentAttempts >= maxAttempts) {
      // Log rate limit exceeded
      await supabase.rpc('log_security_event', {
        p_user_id: null,
        p_event_type: 'rate_limit_exceeded',
        p_event_details: {
          identifier,
          action,
          attempts: currentAttempts,
          maxAttempts,
          windowMs,
          timestamp: now.toISOString()
        }
      })

      return new Response(
        JSON.stringify({ 
          allowed: false, 
          message: 'Rate limit exceeded',
          resetTime: new Date(windowStart.getTime() + windowMs).toISOString()
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log the attempt
    await supabase.rpc('log_security_event', {
      p_user_id: null,
      p_event_type: 'rate_limit_attempt',
      p_event_details: {
        identifier,
        action,
        timestamp: now.toISOString()
      }
    })

    return new Response(
      JSON.stringify({ 
        allowed: true, 
        remaining: maxAttempts - currentAttempts - 1 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Rate limiter error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
