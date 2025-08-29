import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LocationUpdate {
  vehicle_id: string
  driver_id: string
  latitude: number
  longitude: number
  speed?: number
  heading?: number
  accuracy?: number
  is_online?: boolean
  job_id?: string
  booking_id?: string
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

    if (req.method === 'POST') {
      // Update location
      const locationData: LocationUpdate = await req.json()

      // Verify driver owns this vehicle or is authorized
      const { data: assignment } = await supabase
        .from('driver_assignments')
        .select('*')
        .eq('driver_id', user.id)
        .eq('vehicle_id', locationData.vehicle_id)
        .eq('is_active', true)
        .single()

      if (!assignment) {
        return new Response('Unauthorized to update this vehicle', { 
          status: 403, 
          headers: corsHeaders 
        })
      }

      // Update driver location
      const { error: locationError } = await supabase
        .from('driver_locations')
        .upsert({
          driver_id: user.id,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          speed: locationData.speed,
          heading: locationData.heading,
          accuracy: locationData.accuracy,
          is_online: locationData.is_online ?? true,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'driver_id'
        })

      if (locationError) {
        console.error('Error updating location:', locationError)
        return new Response('Failed to update location', { 
          status: 500, 
          headers: corsHeaders 
        })
      }

      // Update booking tracking if applicable
      if (locationData.booking_id) {
        await supabase
          .from('booking_tracking')
          .upsert({
            booking_id: locationData.booking_id,
            driver_id: user.id,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            speed: locationData.speed,
            heading: locationData.heading,
            status: 'en_route'
          }, {
            onConflict: 'booking_id'
          })
      }

      console.log(`Location updated for driver ${user.id}, vehicle ${locationData.vehicle_id}`)

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    } else if (req.method === 'GET') {
      // Get vehicle locations for organization
      const url = new URL(req.url)
      const vehicleId = url.searchParams.get('vehicle_id')
      const driverId = url.searchParams.get('driver_id')

      // Get user's organization
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

      let query = supabase
        .from('driver_locations')
        .select(`
          *,
          profiles!driver_id (
            first_name,
            last_name,
            organization_id
          )
        `)

      if (vehicleId) {
        // Get driver for specific vehicle
        const { data: assignment } = await supabase
          .from('driver_assignments')
          .select('driver_id')
          .eq('vehicle_id', vehicleId)
          .eq('is_active', true)
          .single()
        
        if (assignment) {
          query = query.eq('driver_id', assignment.driver_id)
        }
      } else if (driverId) {
        query = query.eq('driver_id', driverId)
      }

      const { data: locations, error: locationsError } = await query

      if (locationsError) {
        console.error('Error fetching locations:', locationsError)
        return new Response('Failed to fetch locations', { 
          status: 500, 
          headers: corsHeaders 
        })
      }

      // Filter by organization
      const orgLocations = locations?.filter(loc => 
        loc.profiles?.organization_id === profile.organization_id
      ) || []

      return new Response(JSON.stringify({ locations: orgLocations }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    })

  } catch (error) {
    console.error('Vehicle tracking error:', error)
    return new Response('Internal server error', { 
      status: 500, 
      headers: corsHeaders 
    })
  }
})