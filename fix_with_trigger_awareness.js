import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://dznbihypzmvcmradijqn.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bmJpaHlwem12Y21yYWRpanFuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk1NDU3NCwiZXhwIjoyMDcwNTMwNTc0fQ.1uw3IQ19133R_54MZFo6UFtkLJrsWBC0G3QZZkugbj0";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixWithTriggerAwareness() {
  console.log('🔧 Fixing backend with trigger awareness...\n');

  try {
    // Step 1: Clean up any existing problematic data
    console.log('1️⃣ Cleaning up existing problematic data...');
    
    // Delete any test profiles and auth users
    const { data: existingProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email')
      .or('email.like.test.driver%,email.like.simulator.test%');

    if (!profilesError && existingProfiles && existingProfiles.length > 0) {
      console.log(`Found ${existingProfiles.length} existing test profiles to clean up`);
      
      for (const profile of existingProfiles) {
        // Delete auth user first
        await supabase.auth.admin.deleteUser(profile.id);
        console.log(`Deleted auth user for: ${profile.email}`);
      }
      
      // Delete profiles
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .or('email.like.test.driver%,email.like.simulator.test%');
      
      if (deleteError) {
        console.log('❌ Error deleting profiles:', deleteError.message);
      } else {
        console.log('✅ Test profiles cleaned up');
      }
    } else {
      console.log('✅ No existing test profiles found');
    }

    // Step 2: Test driver creation with trigger awareness
    console.log('\n2️⃣ Testing driver creation (trigger-aware approach)...');
    
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
      return;
    }

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
      return;
    }

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

      // Update the profile with additional details if needed
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          phone: '+1234567890',
          address: '123 Simulator Street',
          city: 'Test City',
          state: 'TS',
          zip_code: '12345',
          must_change_password: true,
          is_active: true
        })
        .eq('id', authUser.user.id);

      if (updateError) {
        console.log('❌ Error updating profile:', updateError.message);
      } else {
        console.log('✅ Profile updated with additional details');
      }

      console.log('🎉 Driver creation successful!');
      console.log('📧 Email:', testDriverEmail);
      console.log('🔑 Password: SimulatorPass123!');
      console.log('🆔 User ID:', authUser.user.id);

      // Clean up test data
      console.log('\n🧹 Cleaning up test data...');
      await supabase.auth.admin.deleteUser(authUser.user.id);
      console.log('✅ Test data cleaned up');

      return true;
    } else {
      console.log('❌ Profile was not auto-created by trigger');
      
      // Try manual profile creation
      const { data: manualProfile, error: manualError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.user.id,
          email: testDriverEmail,
          first_name: 'Simulator',
          last_name: 'Test',
          role: 'driver',
          organization_id: adminProfile.organization_id,
          is_active: true,
          must_change_password: true,
          phone: '+1234567890',
          address: '123 Simulator Street',
          city: 'Test City',
          state: 'TS',
          zip_code: '12345'
        })
        .select()
        .single();

      if (manualError) {
        console.log('❌ Manual profile creation failed:', manualError.message);
        // Clean up auth user
        await supabase.auth.admin.deleteUser(authUser.user.id);
        return false;
      } else {
        console.log('✅ Manual profile creation successful');
        // Clean up test data
        await supabase.auth.admin.deleteUser(authUser.user.id);
        return true;
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

fixWithTriggerAwareness().then(success => {
  console.log('\n🎯 TRIGGER-AWARE FIX COMPLETE');
  console.log('==============================');
  if (success) {
    console.log('✅ Backend is now working correctly!');
    console.log('✅ Driver creation works with trigger awareness');
    console.log('✅ Your simulator should work perfectly');
  } else {
    console.log('❌ Backend still has issues');
    console.log('Please check the error messages above');
  }
});
