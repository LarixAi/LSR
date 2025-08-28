import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RouteOptimizationRequest {
  route_id?: string
  stops: Array<{
    id?: string
    name: string
    address: string
    latitude: number
    longitude: number
    time_window_start?: string
    time_window_end?: string
    service_time?: number // in minutes
    priority?: number
  }>
  vehicle_constraints?: {
    capacity?: number
    working_hours_start?: string
    working_hours_end?: string
    max_distance?: number
  }
  optimization_type?: 'distance' | 'time' | 'cost'
}

interface OptimizedRoute {
  total_distance: number
  total_time: number
  total_cost: number
  optimized_stops: Array<{
    stop_id: string
    sequence: number
    arrival_time: string
    departure_time: string
    distance_to_next: number
    time_to_next: number
  }>
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

    const optimizationData: RouteOptimizationRequest = await req.json()

    if (!optimizationData.stops || optimizationData.stops.length < 2) {
      return new Response('At least 2 stops required for optimization', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    console.log(`Optimizing route with ${optimizationData.stops.length} stops`)

    // Simple route optimization algorithm (nearest neighbor with improvements)
    const optimizedRoute = await optimizeRoute(optimizationData)

    // Save optimized route if route_id provided
    if (optimizationData.route_id) {
      // Update route with optimization results
      const { error: routeUpdateError } = await supabase
        .from('routes')
        .update({
          estimated_distance: optimizedRoute.total_distance,
          estimated_duration: optimizedRoute.total_time,
          optimization_status: 'optimized',
          optimization_data: {
            type: optimizationData.optimization_type,
            total_distance: optimizedRoute.total_distance,
            total_time: optimizedRoute.total_time,
            total_cost: optimizedRoute.total_cost,
            optimized_at: new Date().toISOString()
          }
        })
        .eq('id', optimizationData.route_id)

      if (routeUpdateError) {
        console.error('Error updating route:', routeUpdateError)
      }

      // Update route stops with new sequence
      for (const stop of optimizedRoute.optimized_stops) {
        await supabase
          .from('route_stops')
          .update({
            sequence: stop.sequence,
            estimated_arrival_time: stop.arrival_time,
            estimated_departure_time: stop.departure_time
          })
          .eq('id', stop.stop_id)
      }
    }

    // Calculate and store route costs
    if (optimizationData.route_id) {
      const { data: costData } = await supabase
        .rpc('calculate_route_cost', {
          p_route_id: optimizationData.route_id
        })

      if (costData && costData.length > 0) {
        await supabase
          .from('route_costs')
          .upsert({
            route_id: optimizationData.route_id,
            organization_id: profile.organization_id,
            total_cost: costData[0].total_cost,
            distance_cost: costData[0].distance_cost,
            fuel_cost: costData[0].fuel_cost,
            time_cost: costData[0].time_cost,
            cost_breakdown: costData[0].breakdown
          }, {
            onConflict: 'route_id'
          })
      }
    }

    // Log activity
    await supabase.rpc('log_user_activity', {
      p_user_id: user.id,
      p_action: 'route_optimized',
      p_resource_type: 'route',
      p_resource_id: optimizationData.route_id,
      p_metadata: {
        stops_count: optimizationData.stops.length,
        total_distance: optimizedRoute.total_distance,
        total_time: optimizedRoute.total_time,
        optimization_type: optimizationData.optimization_type
      }
    })

    console.log(`Route optimization completed: ${optimizedRoute.total_distance}km, ${optimizedRoute.total_time}min`)

    return new Response(JSON.stringify({
      success: true,
      optimized_route: optimizedRoute,
      savings: {
        distance_saved: 0, // Would need original route to calculate
        time_saved: 0,
        cost_saved: 0
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Route optimization error:', error)
    return new Response('Internal server error', { 
      status: 500, 
      headers: corsHeaders 
    })
  }
})

async function optimizeRoute(data: RouteOptimizationRequest): Promise<OptimizedRoute> {
  const stops = [...data.stops]
  const optimizedStops: any[] = []
  
  // Start with first stop
  let currentStop = stops[0]
  let unvisited = stops.slice(1)
  let totalDistance = 0
  let totalTime = 0
  let currentTime = new Date()
  
  // Set working hours start
  if (data.vehicle_constraints?.working_hours_start) {
    const [hours, minutes] = data.vehicle_constraints.working_hours_start.split(':')
    currentTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
  } else {
    currentTime.setHours(8, 0, 0, 0) // Default 8 AM start
  }

  optimizedStops.push({
    stop_id: currentStop.id || `stop_0`,
    sequence: 0,
    arrival_time: currentTime.toISOString(),
    departure_time: new Date(currentTime.getTime() + (currentStop.service_time || 15) * 60000).toISOString(),
    distance_to_next: 0,
    time_to_next: 0
  })

  // Advance current time
  currentTime = new Date(currentTime.getTime() + (currentStop.service_time || 15) * 60000)

  // Nearest neighbor algorithm with time windows
  for (let i = 1; i < stops.length; i++) {
    let nearestStop = null
    let nearestDistance = Infinity
    let nearestIndex = -1

    for (let j = 0; j < unvisited.length; j++) {
      const candidate = unvisited[j]
      const distance = calculateDistance(
        currentStop.latitude,
        currentStop.longitude,
        candidate.latitude,
        candidate.longitude
      )

      // Apply optimization criteria
      let score = distance
      if (data.optimization_type === 'time') {
        score = distance / 50 * 60 // Assume 50 km/h average speed, convert to minutes
      } else if (data.optimization_type === 'cost') {
        score = distance * 1.5 // Assume £1.50 per km
      }

      // Check time window constraints
      const travelTime = distance / 50 * 60 // minutes
      const arrivalTime = new Date(currentTime.getTime() + travelTime * 60000)
      
      if (candidate.time_window_start) {
        const windowStart = new Date()
        const [hours, minutes] = candidate.time_window_start.split(':')
        windowStart.setHours(parseInt(hours), parseInt(minutes), 0, 0)
        
        if (arrivalTime < windowStart) {
          score += 1000 // Penalty for arriving too early
        }
      }

      if (candidate.time_window_end) {
        const windowEnd = new Date()
        const [hours, minutes] = candidate.time_window_end.split(':')
        windowEnd.setHours(parseInt(hours), parseInt(minutes), 0, 0)
        
        if (arrivalTime > windowEnd) {
          score += 5000 // Heavy penalty for arriving too late
        }
      }

      // Apply priority bonus
      if (candidate.priority) {
        score -= candidate.priority * 100
      }

      if (score < nearestDistance) {
        nearestDistance = score
        nearestStop = candidate
        nearestIndex = j
      }
    }

    if (nearestStop) {
      const distance = calculateDistance(
        currentStop.latitude,
        currentStop.longitude,
        nearestStop.latitude,
        nearestStop.longitude
      )
      
      const travelTime = distance / 50 * 60 // minutes
      totalDistance += distance
      totalTime += travelTime + (nearestStop.service_time || 15)

      // Update current time
      currentTime = new Date(currentTime.getTime() + (travelTime + (nearestStop.service_time || 15)) * 60000)

      optimizedStops.push({
        stop_id: nearestStop.id || `stop_${i}`,
        sequence: i,
        arrival_time: new Date(currentTime.getTime() - (nearestStop.service_time || 15) * 60000).toISOString(),
        departure_time: currentTime.toISOString(),
        distance_to_next: distance,
        time_to_next: travelTime
      })

      currentStop = nearestStop
      unvisited.splice(nearestIndex, 1)
    }
  }

  // Calculate total cost (simplified)
  const totalCost = totalDistance * 1.5 + (totalTime / 60) * 25 // £1.50/km + £25/hour

  return {
    total_distance: Math.round(totalDistance * 100) / 100,
    total_time: Math.round(totalTime),
    total_cost: Math.round(totalCost * 100) / 100,
    optimized_stops: optimizedStops
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}