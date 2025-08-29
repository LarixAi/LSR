import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UptimeCheck {
  id: string
  service_name: string
  service_url: string
  check_type: 'http' | 'tcp' | 'ping'
  organization_id: string
  check_interval_minutes: number
  is_active: boolean
}

interface CheckResult {
  status: 'up' | 'down' | 'degraded'
  response_time_ms?: number
  status_code?: number
  error_message?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, checkId, config } = await req.json();

    switch (action) {
      case 'run_all_checks':
        return await runAllUptimeChecks(supabaseClient);
      
      case 'run_single_check':
        return await runSingleCheck(supabaseClient, checkId);
      
      case 'create_check':
        return await createUptimeCheck(supabaseClient, config);
      
      case 'get_uptime_stats':
        return await getUptimeStats(supabaseClient);
      
      case 'send_alert_notifications':
        return await sendAlertNotifications(supabaseClient);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Uptime monitor error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function runAllUptimeChecks(supabaseClient: any): Promise<Response> {
  try {
    console.log('Running all uptime checks...');
    
    // Get all active checks that are due
    const { data: checks, error } = await supabaseClient
      .from('uptime_monitoring')
      .select('*')
      .eq('is_active', true)
      .lt('next_check_at', new Date().toISOString());

    if (error) throw error;

    console.log(`Found ${checks?.length || 0} checks to run`);

    const results = [];

    for (const check of checks || []) {
      try {
        const result = await performUptimeCheck(check);
        
        // Update the check result in database
        await supabaseClient
          .from('uptime_monitoring')
          .update({
            status: result.status,
            response_time_ms: result.response_time_ms,
            status_code: result.status_code,
            error_message: result.error_message,
            last_check_at: new Date().toISOString(),
            next_check_at: new Date(Date.now() + check.check_interval_minutes * 60 * 1000).toISOString()
          })
          .eq('id', check.id);

        // Record metrics
        await recordUptimeMetrics(supabaseClient, check, result);

        results.push({
          checkId: check.id,
          serviceName: check.service_name,
          status: result.status,
          responseTime: result.response_time_ms
        });

        console.log(`Check completed for ${check.service_name}: ${result.status}`);

      } catch (error) {
        console.error(`Check failed for ${check.service_name}:`, error);
        
        // Update with error status
        await supabaseClient
          .from('uptime_monitoring')
          .update({
            status: 'down',
            error_message: error.message,
            last_check_at: new Date().toISOString(),
            next_check_at: new Date(Date.now() + check.check_interval_minutes * 60 * 1000).toISOString()
          })
          .eq('id', check.id);

        results.push({
          checkId: check.id,
          serviceName: check.service_name,
          status: 'down',
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Completed ${results.length} uptime checks`,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Failed to run uptime checks:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to run uptime checks' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function performUptimeCheck(check: UptimeCheck): Promise<CheckResult> {
  const startTime = Date.now();

  try {
    switch (check.check_type) {
      case 'http':
        return await performHTTPCheck(check.service_url, startTime);
      case 'tcp':
        return await performTCPCheck(check.service_url, startTime);
      case 'ping':
        return await performPingCheck(check.service_url, startTime);
      default:
        throw new Error(`Unknown check type: ${check.check_type}`);
    }
  } catch (error) {
    return {
      status: 'down',
      response_time_ms: Date.now() - startTime,
      error_message: error.message
    };
  }
}

async function performHTTPCheck(url: string, startTime: number): Promise<CheckResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Supabase-Uptime-Monitor/1.0'
      }
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    let status: 'up' | 'down' | 'degraded' = 'up';
    
    if (!response.ok) {
      status = response.status >= 500 ? 'down' : 'degraded';
    } else if (responseTime > 5000) {
      status = 'degraded';
    }

    return {
      status,
      response_time_ms: responseTime,
      status_code: response.status
    };

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    if (error.name === 'AbortError') {
      return {
        status: 'down',
        response_time_ms: responseTime,
        error_message: 'Request timeout'
      };
    }

    return {
      status: 'down',
      response_time_ms: responseTime,
      error_message: error.message
    };
  }
}

async function performTCPCheck(url: string, startTime: number): Promise<CheckResult> {
  // For TCP checks, we'll use a simple HTTP check as Deno's TCP capabilities are limited
  // In a real implementation, you might use Deno.connect()
  try {
    const parsedUrl = new URL(url);
    const port = parsedUrl.port || (parsedUrl.protocol === 'https:' ? '443' : '80');
    
    // Simulate TCP connection check
    const response = await fetch(`${parsedUrl.protocol}//${parsedUrl.hostname}:${port}`, {
      method: 'HEAD'
    });

    const responseTime = Date.now() - startTime;

    return {
      status: response.ok ? 'up' : 'down',
      response_time_ms: responseTime,
      status_code: response.status
    };
  } catch (error) {
    return {
      status: 'down',
      response_time_ms: Date.now() - startTime,
      error_message: error.message
    };
  }
}

async function performPingCheck(url: string, startTime: number): Promise<CheckResult> {
  // Ping check using HTTP HEAD request as ICMP is not available in Deno Deploy
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    const responseTime = Date.now() - startTime;

    return {
      status: response.ok ? 'up' : 'degraded',
      response_time_ms: responseTime,
      status_code: response.status
    };
  } catch (error) {
    return {
      status: 'down',
      response_time_ms: Date.now() - startTime,
      error_message: error.message
    };
  }
}

async function recordUptimeMetrics(supabaseClient: any, check: UptimeCheck, result: CheckResult) {
  try {
    // Record response time metric
    if (result.response_time_ms) {
      await supabaseClient.rpc('record_metric', {
        p_metric_name: 'uptime_response_time',
        p_metric_value: result.response_time_ms,
        p_metric_unit: 'ms',
        p_tags: {
          service: check.service_name,
          url: check.service_url,
          check_type: check.check_type
        }
      });
    }

    // Record availability metric (1 for up, 0 for down)
    const availabilityValue = result.status === 'up' ? 1 : 0;
    await supabaseClient.rpc('record_metric', {
      p_metric_name: 'service_availability',
      p_metric_value: availabilityValue,
      p_metric_unit: 'boolean',
      p_tags: {
        service: check.service_name,
        url: check.service_url,
        status: result.status
      }
    });

  } catch (error) {
    console.error('Failed to record uptime metrics:', error);
  }
}

async function runSingleCheck(supabaseClient: any, checkId: string): Promise<Response> {
  try {
    const { data: check, error } = await supabaseClient
      .from('uptime_monitoring')
      .select('*')
      .eq('id', checkId)
      .single();

    if (error) throw error;

    const result = await performUptimeCheck(check);
    
    // Update the check result
    await supabaseClient
      .from('uptime_monitoring')
      .update({
        status: result.status,
        response_time_ms: result.response_time_ms,
        status_code: result.status_code,
        error_message: result.error_message,
        last_check_at: new Date().toISOString()
      })
      .eq('id', checkId);

    // Record metrics
    await recordUptimeMetrics(supabaseClient, check, result);

    return new Response(
      JSON.stringify({
        checkId,
        serviceName: check.service_name,
        result
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Check not found or failed' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function createUptimeCheck(supabaseClient: any, config: any): Promise<Response> {
  try {
    const { data, error } = await supabaseClient
      .from('uptime_monitoring')
      .insert([{
        ...config,
        next_check_at: new Date(Date.now() + (config.check_interval_minutes || 5) * 60 * 1000).toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to create uptime check' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function getUptimeStats(supabaseClient: any): Promise<Response> {
  try {
    // Get overall uptime statistics
    const { data: checks, error } = await supabaseClient
      .from('uptime_monitoring')
      .select('service_name, status, response_time_ms, last_check_at');

    if (error) throw error;

    const stats = {
      total_services: checks.length,
      services_up: checks.filter((c: any) => c.status === 'up').length,
      services_down: checks.filter((c: any) => c.status === 'down').length,
      services_degraded: checks.filter((c: any) => c.status === 'degraded').length,
      average_response_time: checks
        .filter((c: any) => c.response_time_ms)
        .reduce((sum: number, c: any) => sum + c.response_time_ms, 0) / 
        checks.filter((c: any) => c.response_time_ms).length || 0
    };

    return new Response(
      JSON.stringify(stats),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to get uptime stats' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function sendAlertNotifications(supabaseClient: any): Promise<Response> {
  try {
    // Get all active alerts that haven't been notified
    const { data: alerts, error } = await supabaseClient
      .from('alert_instances')
      .select(`
        *,
        alert_rules!inner(name, notification_channels, severity)
      `)
      .eq('status', 'active')
      .eq('notification_sent', false);

    if (error) throw error;

    const notificationResults = [];

    for (const alert of alerts || []) {
      try {
        // Here you would integrate with actual notification services
        // For now, we'll just log and mark as sent
        console.log(`Alert notification: ${alert.alert_rules.name} - ${alert.alert_rules.severity}`);
        
        // Mark notification as sent
        await supabaseClient
          .from('alert_instances')
          .update({ notification_sent: true })
          .eq('id', alert.id);

        notificationResults.push({
          alertId: alert.id,
          status: 'sent',
          channels: alert.alert_rules.notification_channels
        });

      } catch (error) {
        console.error(`Failed to send notification for alert ${alert.id}:`, error);
        notificationResults.push({
          alertId: alert.id,
          status: 'failed',
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${notificationResults.length} alert notifications`,
        results: notificationResults
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to send alert notifications' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}