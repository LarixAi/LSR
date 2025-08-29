import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalyticsRequest {
  action: 'refresh' | 'stats' | 'optimize' | 'slow_queries'
  hours_back?: number
  organization_id?: string
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

    const { action, hours_back = 24, organization_id }: AnalyticsRequest = await req.json()

    console.log(`Performance analytics action: ${action}`)

    let result: any = {}

    switch (action) {
      case 'refresh':
        result = await refreshMaterializedViews(supabase)
        break

      case 'stats':
        result = await getPerformanceStats(supabase, organization_id)
        break

      case 'optimize':
        result = await optimizeDatabase(supabase, organization_id)
        break

      case 'slow_queries':
        result = await getSlowQueries(supabase, hours_back, organization_id)
        break

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Performance analytics error:', error)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function refreshMaterializedViews(supabase: any) {
  try {
    // Refresh fleet overview
    await supabase.rpc('sql', {
      query: 'REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_fleet_overview'
    })

    // Refresh driver performance
    await supabase.rpc('sql', {
      query: 'REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_driver_performance'
    })

    console.log('Materialized views refreshed successfully')

    return {
      success: true,
      message: 'Materialized views refreshed',
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Failed to refresh materialized views:', error)
    throw error
  }
}

async function getPerformanceStats(supabase: any, organizationId?: string) {
  try {
    // Get database performance stats
    const { data: dbStats, error: dbError } = await supabase
      .rpc('get_performance_stats')

    if (dbError) throw dbError

    // Get query performance stats
    let queryStatsQuery = supabase
      .from('query_performance_stats')
      .select('query_type, execution_time_ms, created_at')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (organizationId) {
      queryStatsQuery = queryStatsQuery.eq('organization_id', organizationId)
    }

    const { data: queryStats, error: queryError } = await queryStatsQuery

    if (queryError) throw queryError

    // Calculate averages
    const queryMetrics = (queryStats || []).reduce((acc: any, stat: any) => {
      const type = stat.query_type
      if (!acc[type]) {
        acc[type] = { total: 0, count: 0, times: [] }
      }
      acc[type].total += stat.execution_time_ms
      acc[type].count += 1
      acc[type].times.push(stat.execution_time_ms)
      return acc
    }, {})

    const processedMetrics = Object.entries(queryMetrics).map(([type, data]: [string, any]) => ({
      query_type: type,
      avg_time: Math.round(data.total / data.count),
      max_time: Math.max(...data.times),
      min_time: Math.min(...data.times),
      count: data.count
    }))

    return {
      database_stats: dbStats,
      query_metrics: processedMetrics,
      summary: {
        total_queries: queryStats?.length || 0,
        avg_execution_time: queryStats?.length ? 
          Math.round(queryStats.reduce((sum: number, s: any) => sum + s.execution_time_ms, 0) / queryStats.length) : 0
      }
    }
  } catch (error) {
    console.error('Failed to get performance stats:', error)
    throw error
  }
}

async function optimizeDatabase(supabase: any, organizationId?: string) {
  try {
    // Run table statistics update
    await supabase.rpc('optimize_table_stats')

    // Get unused indexes (simplified check)
    const { data: indexes, error: indexError } = await supabase.rpc('sql', {
      query: `
        SELECT 
          schemaname, 
          tablename, 
          indexname,
          pg_size_pretty(pg_relation_size(indexrelid)) as size
        FROM pg_stat_user_indexes 
        WHERE idx_scan = 0 
        AND schemaname = 'public'
        ORDER BY pg_relation_size(indexrelid) DESC
        LIMIT 10
      `
    })

    // Get table sizes
    const { data: tableSizes, error: sizeError } = await supabase.rpc('sql', {
      query: `
        SELECT 
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
          pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        LIMIT 10
      `
    })

    console.log('Database optimization completed')

    return {
      success: true,
      message: 'Database optimization completed',
      unused_indexes: indexes?.data || [],
      largest_tables: tableSizes?.data || [],
      recommendations: generateOptimizationRecommendations(tableSizes?.data || [])
    }
  } catch (error) {
    console.error('Failed to optimize database:', error)
    throw error
  }
}

async function getSlowQueries(supabase: any, hoursBack: number, organizationId?: string) {
  try {
    let query = supabase
      .from('query_performance_stats')
      .select('*')
      .gte('created_at', new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString())
      .gte('execution_time_ms', 1000) // Only queries taking more than 1 second
      .order('execution_time_ms', { ascending: false })
      .limit(50)

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    const { data, error } = await query

    if (error) throw error

    // Group by query type and calculate statistics
    const grouped = (data || []).reduce((acc: any, query: any) => {
      const type = query.query_type
      if (!acc[type]) {
        acc[type] = {
          query_type: type,
          total_count: 0,
          avg_time: 0,
          max_time: 0,
          total_time: 0,
          queries: []
        }
      }
      
      acc[type].total_count += 1
      acc[type].total_time += query.execution_time_ms
      acc[type].max_time = Math.max(acc[type].max_time, query.execution_time_ms)
      acc[type].queries.push(query)
      
      return acc
    }, {})

    // Calculate averages
    Object.values(grouped).forEach((group: any) => {
      group.avg_time = Math.round(group.total_time / group.total_count)
    })

    return {
      slow_queries: data || [],
      grouped_analysis: Object.values(grouped),
      summary: {
        total_slow_queries: data?.length || 0,
        time_period: `${hoursBack} hours`,
        slowest_query_time: data?.[0]?.execution_time_ms || 0
      }
    }
  } catch (error) {
    console.error('Failed to get slow queries:', error)
    throw error
  }
}

function generateOptimizationRecommendations(tableSizes: any[]): string[] {
  const recommendations: string[] = []

  tableSizes.forEach(table => {
    const sizeBytes = parseInt(table.size_bytes)
    
    if (sizeBytes > 100 * 1024 * 1024) { // > 100MB
      recommendations.push(
        `Consider partitioning table ${table.tablename} (${table.size}) for better performance`
      )
    }
    
    if (sizeBytes > 50 * 1024 * 1024) { // > 50MB
      recommendations.push(
        `Review indexing strategy for ${table.tablename} to optimize query performance`
      )
    }
  })

  if (tableSizes.length > 0) {
    recommendations.push('Run VACUUM ANALYZE on large tables regularly for optimal performance')
    recommendations.push('Consider implementing table partitioning for historical data')
  }

  return recommendations
}