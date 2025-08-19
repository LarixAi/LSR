import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://dznbihypzmvcmradijqn.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bmJpaHlwem12Y21yYWRpanFuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk1NDU3NCwiZXhwIjoyMDcwNTMwNTc0fQ.1uw3IQ19133R_54MZFo6UFtkLJrsWBC0G3QZZkugbj0";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function backendHealthCheck() {
  console.log('🔍 Starting comprehensive backend health check...\n');

  const results = {
    database: { status: 'unknown', issues: [] },
    auth: { status: 'unknown', issues: [] },
    profiles: { status: 'unknown', issues: [] },
    organizations: { status: 'unknown', issues: [] },
    edgeFunctions: { status: 'unknown', issues: [] },
    rls: { status: 'unknown', issues: [] }
  };

  try {
    // 1. Test database connectivity
    console.log('1️⃣ Testing database connectivity...');
    const { data: dbTest, error: dbError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (dbError) {
      results.database.status = 'error';
      results.database.issues.push(`Database connection failed: ${dbError.message}`);
      console.log('❌ Database connection failed:', dbError.message);
    } else {
      results.database.status = 'ok';
      console.log('✅ Database connection successful');
    }

    // 2. Test auth system
    console.log('\n2️⃣ Testing auth system...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      results.auth.status = 'error';
      results.auth.issues.push(`Auth system error: ${authError.message}`);
      console.log('❌ Auth system error:', authError.message);
    } else {
      results.auth.status = 'ok';
      console.log(`✅ Auth system working (${authUsers.users.length} users found)`);
    }

    // 3. Check profiles table structure
    console.log('\n3️⃣ Checking profiles table structure...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (profilesError) {
      results.profiles.status = 'error';
      results.profiles.issues.push(`Profiles table error: ${profilesError.message}`);
      console.log('❌ Profiles table error:', profilesError.message);
    } else {
      results.profiles.status = 'ok';
      console.log(`✅ Profiles table working (${profiles.length} profiles found)`);
      
      // Check for orphaned profiles
      const orphanedProfiles = profiles.filter(p => !p.organization_id);
      if (orphanedProfiles.length > 0) {
        results.profiles.issues.push(`${orphanedProfiles.length} profiles without organization_id`);
        console.log(`⚠️  Found ${orphanedProfiles.length} profiles without organization_id`);
      }
    }

    // 4. Check organizations table
    console.log('\n4️⃣ Checking organizations table...');
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('*')
      .limit(5);
    
    if (orgsError) {
      results.organizations.status = 'error';
      results.organizations.issues.push(`Organizations table error: ${orgsError.message}`);
      console.log('❌ Organizations table error:', orgsError.message);
    } else {
      results.organizations.status = 'ok';
      console.log(`✅ Organizations table working (${orgs.length} organizations found)`);
    }

    // 5. Test Edge Functions
    console.log('\n5️⃣ Testing Edge Functions...');
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/check-missing-auth-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({})
      });
      
      if (response.ok) {
        results.edgeFunctions.status = 'ok';
        console.log('✅ Edge Functions accessible');
      } else {
        results.edgeFunctions.status = 'error';
        results.edgeFunctions.issues.push(`Edge Function test failed: ${response.status}`);
        console.log('❌ Edge Function test failed:', response.status);
      }
    } catch (edgeError) {
      results.edgeFunctions.status = 'error';
      results.edgeFunctions.issues.push(`Edge Function error: ${edgeError.message}`);
      console.log('❌ Edge Function error:', edgeError.message);
    }

    // 6. Test RLS policies
    console.log('\n6️⃣ Testing RLS policies...');
    try {
      // Test if we can read profiles with service role
      const { data: rlsTest, error: rlsError } = await supabase
        .from('profiles')
        .select('id, email')
        .limit(1);
      
      if (rlsError) {
        results.rls.status = 'error';
        results.rls.issues.push(`RLS policy error: ${rlsError.message}`);
        console.log('❌ RLS policy error:', rlsError.message);
      } else {
        results.rls.status = 'ok';
        console.log('✅ RLS policies working correctly');
      }
    } catch (rlsError) {
      results.rls.status = 'error';
      results.rls.issues.push(`RLS test error: ${rlsError.message}`);
      console.log('❌ RLS test error:', rlsError.message);
    }

    // 7. Check for specific issues
    console.log('\n7️⃣ Checking for specific issues...');
    
    // Check for profiles without corresponding auth users
    if (results.auth.status === 'ok' && results.profiles.status === 'ok') {
      const { data: orphanedProfiles, error: orphanedError } = await supabase
        .from('profiles')
        .select('id, email')
        .limit(10);
      
      if (!orphanedError && orphanedProfiles) {
        for (const profile of orphanedProfiles) {
          const { data: authUser, error: authCheckError } = await supabase.auth.admin.getUserById(profile.id);
          if (authCheckError && authCheckError.message.includes('User not found')) {
            results.profiles.issues.push(`Profile ${profile.email} has no corresponding auth user`);
            console.log(`⚠️  Profile ${profile.email} has no corresponding auth user`);
          }
        }
      }
    }

    // 8. Check for missing required columns
    console.log('\n8️⃣ Checking table structure...');
    const requiredColumns = ['id', 'email', 'first_name', 'last_name', 'role', 'organization_id', 'is_active'];
    if (profiles && profiles.length > 0) {
      const sampleProfile = profiles[0];
      const missingColumns = requiredColumns.filter(col => !(col in sampleProfile));
      if (missingColumns.length > 0) {
        results.profiles.issues.push(`Missing columns: ${missingColumns.join(', ')}`);
        console.log(`⚠️  Missing columns in profiles table: ${missingColumns.join(', ')}`);
      } else {
        console.log('✅ Profiles table has all required columns');
      }
    }

  } catch (error) {
    console.error('❌ Health check failed:', error);
  }

  // Summary
  console.log('\n📊 BACKEND HEALTH CHECK SUMMARY');
  console.log('================================');
  
  Object.entries(results).forEach(([component, result]) => {
    const status = result.status === 'ok' ? '✅' : result.status === 'error' ? '❌' : '⚠️';
    console.log(`${status} ${component.toUpperCase()}: ${result.status.toUpperCase()}`);
    if (result.issues.length > 0) {
      result.issues.forEach(issue => console.log(`   - ${issue}`));
    }
  });

  // Overall status
  const hasErrors = Object.values(results).some(r => r.status === 'error');
  const hasIssues = Object.values(results).some(r => r.issues.length > 0);
  
  console.log('\n🎯 OVERALL STATUS:');
  if (hasErrors) {
    console.log('❌ BACKEND HAS CRITICAL ERRORS - IMMEDIATE ATTENTION REQUIRED');
  } else if (hasIssues) {
    console.log('⚠️  BACKEND HAS MINOR ISSUES - RECOMMENDED TO FIX');
  } else {
    console.log('✅ BACKEND IS HEALTHY - ALL SYSTEMS OPERATIONAL');
  }

  return results;
}

backendHealthCheck();

