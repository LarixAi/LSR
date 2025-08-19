import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://dznbihypzmvcmradijqn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bmJpaHlwem12Y21yYWRpanFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NTQ1NzQsImV4cCI6MjA3MDUzMDU3NH0.dS4mQBL0q_JhsZQF14KKB0nL2f3H--2hPoxXzitPOgo";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkCurrentStatus() {
  console.log('🔍 Checking Current Backend Status...\n');

  try {
    // Check 1: Basic connection
    console.log('1️⃣ Testing Basic Connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.error('❌ Connection failed:', connectionError.message);
      console.log('💡 This might indicate RLS recursion issues still exist');
      return;
    }

    console.log('✅ Basic connection successful');

    // Check 2: Check if audit log table exists
    console.log('\n2️⃣ Checking Audit Log System...');
    const { data: auditTest, error: auditError } = await supabase
      .from('security_audit_log')
      .select('count')
      .limit(1);

    if (auditError) {
      console.log('⚠️  Audit log table not found - SQL fixes may not be applied yet');
    } else {
      console.log('✅ Audit logging system is active');
    }

    // Check 3: Check if materialized views exist
    console.log('\n3️⃣ Checking Performance Optimization...');
    const { data: statsTest, error: statsError } = await supabase
      .from('mv_organization_stats')
      .select('count')
      .limit(1);

    if (statsError) {
      console.log('⚠️  Materialized views not found - Performance optimization may not be applied yet');
    } else {
      console.log('✅ Performance optimization is active');
    }

    // Check 4: Check if performance functions exist
    console.log('\n4️⃣ Checking Performance Functions...');
    const { data: perfTest, error: perfError } = await supabase
      .rpc('get_table_sizes');

    if (perfError) {
      console.log('⚠️  Performance functions not found - Performance optimization may not be applied yet');
    } else {
      console.log('✅ Performance monitoring functions are active');
    }

    // Check 5: Check Edge Function status
    console.log('\n5️⃣ Checking Edge Function Status...');
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/change-user-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          targetUserId: 'test',
          newPassword: 'test',
          adminUserId: 'test'
        })
      });

      if (response.status === 401) {
        console.log('✅ Edge Function is accessible (401 is expected without proper auth)');
      } else if (response.status === 404) {
        console.log('⚠️  Edge Function not found - may need to be deployed');
      } else {
        console.log(`✅ Edge Function responded with status: ${response.status}`);
      }
    } catch (error) {
      console.log('⚠️  Edge Function test failed:', error.message);
    }

    // Summary
    console.log('\n📊 CURRENT STATUS SUMMARY');
    console.log('==========================');
    console.log('✅ Basic Database Connection: Working');
    
    if (!auditError) {
      console.log('✅ Audit Logging System: Active');
    } else {
      console.log('❌ Audit Logging System: Not Applied');
    }
    
    if (!statsError) {
      console.log('✅ Performance Optimization: Active');
    } else {
      console.log('❌ Performance Optimization: Not Applied');
    }
    
    if (!perfError) {
      console.log('✅ Performance Monitoring: Active');
    } else {
      console.log('❌ Performance Monitoring: Not Applied');
    }

    console.log('\n💡 RECOMMENDATIONS:');
    if (auditError || statsError || perfError) {
      console.log('🔧 Execute the SQL fixes in your Supabase SQL Editor:');
      console.log('   1. CRITICAL_RLS_FIX_EXECUTE.sql');
      console.log('   2. AUDIT_LOGGING_SYSTEM.sql');
      console.log('   3. PERFORMANCE_OPTIMIZATION.sql');
    } else {
      console.log('🎉 All critical fixes appear to be applied!');
      console.log('🧪 Run the full test with authentication to verify everything works.');
    }

  } catch (error) {
    console.error('❌ Status check failed:', error);
  }
}

// Run the status check
checkCurrentStatus();
