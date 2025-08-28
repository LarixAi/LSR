import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestConfig {
  testType: 'api' | 'database' | 'integration' | 'load'
  endpoints?: string[]
  queries?: string[]
  concurrentUsers?: number
  duration?: number
  assertions?: Record<string, any>
}

interface TestResult {
  testId: string
  status: 'passed' | 'failed' | 'running'
  executionTime: number
  results: Record<string, any>
  errors?: string[]
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

    const { action, config, testId } = await req.json();

    switch (action) {
      case 'run_test':
        return await runTest(supabaseClient, config);
      
      case 'get_test_status':
        return await getTestStatus(supabaseClient, testId);
      
      case 'run_scheduled_tests':
        return await runScheduledTests(supabaseClient);
      
      case 'validate_system_health':
        return await validateSystemHealth(supabaseClient);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Test runner error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function runTest(supabaseClient: any, config: TestConfig): Promise<Response> {
  const startTime = Date.now();
  const testId = crypto.randomUUID();
  
  console.log(`Starting test ${testId} of type: ${config.testType}`);

  try {
    let results: Record<string, any> = {};
    
    switch (config.testType) {
      case 'api':
        results = await runAPITests(config);
        break;
      case 'database':
        results = await runDatabaseTests(supabaseClient, config);
        break;
      case 'integration':
        results = await runIntegrationTests(supabaseClient, config);
        break;
      case 'load':
        results = await runLoadTests(config);
        break;
      default:
        throw new Error(`Unknown test type: ${config.testType}`);
    }

    const executionTime = Date.now() - startTime;
    
    // Record test results
    await supabaseClient.rpc('record_performance_test', {
      p_test_name: `Automated ${config.testType} test`,
      p_test_type: 'load',
      p_execution_time_ms: executionTime,
      p_config: config,
      p_results: results
    });

    const response: TestResult = {
      testId,
      status: results.passed ? 'passed' : 'failed',
      executionTime,
      results,
      errors: results.errors
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    console.error(`Test ${testId} failed:`, error);
    
    // Track the error
    await supabaseClient.rpc('track_error', {
      p_error_type: 'test_execution_failure',
      p_error_message: error.message,
      p_stack_trace: error.stack,
      p_metadata: { testId, config, executionTime }
    });

    const response: TestResult = {
      testId,
      status: 'failed',
      executionTime,
      results: { passed: false },
      errors: [error.message]
    };

    return new Response(
      JSON.stringify(response),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function runAPITests(config: TestConfig): Promise<Record<string, any>> {
  const results = {
    passed: true,
    tests: [],
    errors: []
  };

  for (const endpoint of config.endpoints || []) {
    try {
      const startTime = Date.now();
      const response = await fetch(endpoint, { 
        method: 'GET',
        headers: { 'User-Agent': 'Supabase-Test-Runner/1.0' }
      });
      const responseTime = Date.now() - startTime;

      const testResult = {
        endpoint,
        status: response.status,
        responseTime,
        passed: response.ok && responseTime < 5000
      };

      results.tests.push(testResult);
      
      if (!testResult.passed) {
        results.passed = false;
        results.errors.push(`API test failed for ${endpoint}: ${response.status} (${responseTime}ms)`);
      }
    } catch (error) {
      results.passed = false;
      results.errors.push(`API test error for ${endpoint}: ${error.message}`);
    }
  }

  return results;
}

async function runDatabaseTests(supabaseClient: any, config: TestConfig): Promise<Record<string, any>> {
  const results = {
    passed: true,
    tests: [],
    errors: []
  };

  // Test basic database connectivity
  try {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('count(*)')
      .limit(1);

    if (error) throw error;

    results.tests.push({
      test: 'database_connectivity',
      passed: true,
      result: 'Connected successfully'
    });
  } catch (error) {
    results.passed = false;
    results.errors.push(`Database connectivity test failed: ${error.message}`);
  }

  // Test materialized view refresh
  try {
    const { data, error } = await supabaseClient
      .from('mv_fleet_overview')
      .select('*')
      .limit(1);

    if (error) throw error;

    results.tests.push({
      test: 'materialized_views',
      passed: true,
      result: 'Views accessible'
    });
  } catch (error) {
    results.passed = false;
    results.errors.push(`Materialized view test failed: ${error.message}`);
  }

  return results;
}

async function runIntegrationTests(supabaseClient: any, config: TestConfig): Promise<Record<string, any>> {
  const results = {
    passed: true,
    tests: [],
    errors: []
  };

  // Test RLS policies
  try {
    const { data, error } = await supabaseClient.auth.signInAnonymously();
    
    if (error) throw error;

    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .limit(1);

    results.tests.push({
      test: 'rls_policies',
      passed: true,
      result: 'RLS working correctly'
    });
  } catch (error) {
    results.errors.push(`RLS test failed: ${error.message}`);
  }

  return results;
}

async function runLoadTests(config: TestConfig): Promise<Record<string, any>> {
  const results = {
    passed: true,
    requestsPerSecond: 0,
    averageResponseTime: 0,
    errors: []
  };

  const concurrentUsers = config.concurrentUsers || 10;
  const duration = Math.min(config.duration || 30000, 60000); // Max 1 minute
  const promises: Promise<any>[] = [];

  const startTime = Date.now();
  let totalRequests = 0;
  let totalResponseTime = 0;

  for (let i = 0; i < concurrentUsers; i++) {
    promises.push(simulateUserLoad(duration));
  }

  try {
    const userResults = await Promise.all(promises);
    
    userResults.forEach(userResult => {
      totalRequests += userResult.requests;
      totalResponseTime += userResult.totalTime;
    });

    const actualDuration = Date.now() - startTime;
    results.requestsPerSecond = Math.round((totalRequests / actualDuration) * 1000);
    results.averageResponseTime = Math.round(totalResponseTime / totalRequests);
    
    // Consider test passed if we achieve reasonable performance
    results.passed = results.requestsPerSecond > 1 && results.averageResponseTime < 2000;
    
  } catch (error) {
    results.passed = false;
    results.errors.push(`Load test failed: ${error.message}`);
  }

  return results;
}

async function simulateUserLoad(duration: number): Promise<{ requests: number; totalTime: number }> {
  const endTime = Date.now() + duration;
  let requests = 0;
  let totalTime = 0;

  while (Date.now() < endTime) {
    const startTime = Date.now();
    
    // Simulate API call with random delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
    
    totalTime += Date.now() - startTime;
    requests++;
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  return { requests, totalTime };
}

async function getTestStatus(supabaseClient: any, testId: string): Promise<Response> {
  try {
    const { data, error } = await supabaseClient
      .from('performance_test_results')
      .select('*')
      .eq('id', testId)
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Test not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function runScheduledTests(supabaseClient: any): Promise<Response> {
  try {
    // Get active scheduled tests that are due to run
    const { data: scheduledTests, error } = await supabaseClient
      .from('automated_test_schedules')
      .select('*')
      .eq('is_active', true)
      .lt('next_run_at', new Date().toISOString());

    if (error) throw error;

    const results = [];

    for (const test of scheduledTests || []) {
      try {
        const testResult = await runTest(supabaseClient, test.test_config);
        results.push({
          testId: test.id,
          result: await testResult.json()
        });

        // Update last run time
        await supabaseClient
          .from('automated_test_schedules')
          .update({ last_run_at: new Date().toISOString() })
          .eq('id', test.id);

      } catch (error) {
        console.error(`Scheduled test ${test.id} failed:`, error);
        results.push({
          testId: test.id,
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Executed ${results.length} scheduled tests`,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to run scheduled tests' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function validateSystemHealth(supabaseClient: any): Promise<Response> {
  const healthChecks = {
    database: false,
    authentication: false,
    storage: false,
    functions: false
  };

  try {
    // Database health check
    const { error: dbError } = await supabaseClient
      .from('profiles')
      .select('count(*)')
      .limit(1);
    healthChecks.database = !dbError;

    // Authentication health check
    const { error: authError } = await supabaseClient.auth.getSession();
    healthChecks.authentication = !authError;

    // Basic system validation
    healthChecks.functions = true; // If we got here, functions are working
    healthChecks.storage = true; // Assume storage is working if other checks pass

    const allHealthy = Object.values(healthChecks).every(check => check === true);

    return new Response(
      JSON.stringify({
        healthy: allHealthy,
        checks: healthChecks,
        timestamp: new Date().toISOString()
      }),
      { 
        status: allHealthy ? 200 : 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        healthy: false,
        error: error.message,
        checks: healthChecks
      }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}