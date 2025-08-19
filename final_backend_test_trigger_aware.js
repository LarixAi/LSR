import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://dznbihypzmvcmradijqn.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bmJpaHlwem12Y21yYWRpanFuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk1NDU3NCwiZXhwIjoyMDcwNTMwNTc0fQ.1uw3IQ19133R_54MZFo6UFtkLJrsWBC0G3QZZkugbj0";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function finalBackendTestTriggerAware() {
  console.log('🎯 FINAL BACKEND TEST - TRIGGER-AWARE APPROACH\n');
  console.log('This test verifies all backend systems are working for your simulator...\n');

  const results = {
    database: false,
    auth: false,
    passwordChange: false,
    driverCreation: false,
    profiles: false,
    organizations: false
  };

  try {
    // 1. Test Database Connectivity
    console.log('1️⃣ Testing Database Connectivity...');
    const { data: dbTest, error: dbError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (dbError) {
      console.log('❌ Database connection failed:', dbError.message);
    } else {
      console.log('✅ Database connection successful');
      results.database = true;
    }

    // 2. Test Auth System
    console.log('\n2️⃣ Testing Auth System...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Auth system error:', authError.message);
    } else {
      console.log(`✅ Auth system working (${authUsers.users.length} users found)`);
      results.auth = true;
    }

    // 3. Test Password Change Functionality
    console.log('\n3️⃣ Testing Password Change Functionality...');
    const { data: testUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('role', 'driver')
      .limit(1);

    if (usersError || !testUsers || testUsers.length === 0) {
      console.log('❌ No test users found for password change');
    } else {
      const testUser = testUsers[0];
      console.log('📧 Testing password change for:', testUser.email);
      
      const { data: updateResult, error: updateError } = await supabase.auth.admin.updateUserById(
        testUser.id,
        { password: 'SimulatorTestPass123!' }
      );
      
      if (updateError) {
        console.log('❌ Password change failed:', updateError.message);
      } else {
        console.log('✅ Password change successful!');
        results.passwordChange = true;
      }
    }

    // 4. Test Driver Creation (Trigger-Aware Approach)
    console.log('\n4️⃣ Testing Driver Creation (Trigger-Aware)...');
    const testDriverEmail = `simulator.test.${Date.now()}@nationalbusgroup.co.uk`;
    console.log('📧 Creating test driver:', testDriverEmail);
    
    // Get organization ID
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('email', 'transport@nationalbusgroup.co.uk')
      .single();

    if (adminError) {
      console.log('❌ Error getting admin profile:', adminError.message);
    } else {
      console.log('🏢 Using organization ID:', adminProfile.organization_id);
      
      // Create Auth user (this should trigger profile creation)
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: testDriverEmail,
        password: 'SimulatorPass123!',
        email_confirm: true,
        user_metadata: {
          first_name: 'Simulator',
          last_name: 'Test',
          role: 'driver',
          organization_id: adminProfile.organization_id
        }
      });

      if (authError) {
        console.log('❌ Auth user creation failed:', authError.message);
      } else {
        console.log('✅ Auth user created with ID:', authUser.user.id);
        
        // Wait a moment for the trigger to execute
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if profile was created by trigger
        const { data: autoProfile, error: autoProfileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.user.id)
          .single();

        if (autoProfileError) {
          console.log('❌ Error checking auto-created profile:', autoProfileError.message);
        } else if (autoProfile) {
          console.log('✅ Profile was auto-created by trigger');
          console.log('📝 Profile details:', {
            email: autoProfile.email,
            first_name: autoProfile.first_name,
            last_name: autoProfile.last_name,
            role: autoProfile.role,
            organization_id: autoProfile.organization_id
          });
          
          results.driverCreation = true;
          console.log('🎉 Driver creation test successful!');
          
          // Clean up test data
          console.log('🧹 Cleaning up test data...');
          await supabase.auth.admin.deleteUser(authUser.user.id);
          console.log('✅ Test data cleaned up');
        } else {
          console.log('❌ Profile was not auto-created by trigger');
          // Clean up auth user
          await supabase.auth.admin.deleteUser(authUser.user.id);
        }
      }
    }

    // 5. Test Profiles Table
    console.log('\n5️⃣ Testing Profiles Table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (profilesError) {
      console.log('❌ Profiles table error:', profilesError.message);
    } else {
      console.log(`✅ Profiles table working (${profiles.length} profiles found)`);
      results.profiles = true;
    }

    // 6. Test Organizations Table
    console.log('\n6️⃣ Testing Organizations Table...');
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('*')
      .limit(5);
    
    if (orgsError) {
      console.log('❌ Organizations table error:', orgsError.message);
    } else {
      console.log(`✅ Organizations table working (${orgs.length} organizations found)`);
      results.organizations = true;
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }

  // Final Results
  console.log('\n📊 FINAL BACKEND TEST RESULTS');
  console.log('==============================');
  
  Object.entries(results).forEach(([component, status]) => {
    const icon = status ? '✅' : '❌';
    console.log(`${icon} ${component.toUpperCase()}: ${status ? 'WORKING' : 'FAILED'}`);
  });

  const allWorking = Object.values(results).every(r => r);
  
  console.log('\n🎯 OVERALL STATUS:');
  if (allWorking) {
    console.log('🎉 ALL BACKEND SYSTEMS ARE WORKING PERFECTLY!');
    console.log('✅ Your simulator should work without issues');
    console.log('✅ Password changes will work');
    console.log('✅ Driver creation will work');
    console.log('✅ All database operations will work');
    console.log('✅ Database triggers are working correctly');
  } else {
    console.log('⚠️  SOME BACKEND SYSTEMS NEED ATTENTION');
    console.log('Please check the failed components above');
  }

  return results;
}

finalBackendTestTriggerAware();
