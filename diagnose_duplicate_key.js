import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://dznbihypzmvcmradijqn.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bmJpaHlwem12Y21yYWRpanFuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk1NDU3NCwiZXhwIjoyMDcwNTMwNTc0fQ.1uw3IQ19133R_54MZFo6UFtkLJrsWBC0G3QZZkugbj0";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function diagnoseDuplicateKey() {
  console.log('🔍 Diagnosing duplicate key issue...\n');

  try {
    // 1. Check for existing test driver profiles
    console.log('1️⃣ Checking for existing test driver profiles...');
    const { data: existingProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, created_at')
      .or('email.like.test.driver%,email.like.simulator.test%');

    if (profilesError) {
      console.log('❌ Error checking profiles:', profilesError.message);
    } else {
      console.log(`Found ${existingProfiles.length} existing test profiles:`);
      existingProfiles.forEach(profile => {
        console.log(`  - ${profile.email} (ID: ${profile.id})`);
      });
    }

    // 2. Check for existing auth users with test emails
    console.log('\n2️⃣ Checking for existing auth users...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Error checking auth users:', authError.message);
    } else {
      const testAuthUsers = authUsers.users.filter(user => 
        user.email && (user.email.includes('test.driver') || user.email.includes('simulator.test'))
      );
      
      console.log(`Found ${testAuthUsers.length} test auth users:`);
      testAuthUsers.forEach(user => {
        console.log(`  - ${user.email} (ID: ${user.id})`);
      });
    }

    // 3. Check for orphaned auth users
    console.log('\n3️⃣ Checking for orphaned auth users...');
    if (!authError && !profilesError) {
      const orphanedUsers = authUsers.users.filter(authUser => {
        const hasProfile = existingProfiles.some(profile => profile.id === authUser.id);
        return !hasProfile && authUser.email && (authUser.email.includes('test.driver') || authUser.email.includes('simulator.test'));
      });
      
      console.log(`Found ${orphanedUsers.length} orphaned auth users:`);
      orphanedUsers.forEach(user => {
        console.log(`  - ${user.email} (ID: ${user.id}) - NO PROFILE`);
      });
    }

    // 4. Check for profiles without auth users
    console.log('\n4️⃣ Checking for profiles without auth users...');
    if (!authError && !profilesError) {
      const orphanedProfiles = existingProfiles.filter(profile => {
        const hasAuthUser = authUsers.users.some(authUser => authUser.id === profile.id);
        return !hasAuthUser;
      });
      
      console.log(`Found ${orphanedProfiles.length} profiles without auth users:`);
      orphanedProfiles.forEach(profile => {
        console.log(`  - ${profile.email} (ID: ${profile.id}) - NO AUTH USER`);
      });
    }

    // 5. Check the specific ID that's causing the duplicate key
    console.log('\n5️⃣ Checking for the specific duplicate key...');
    const testDriverEmail = `simulator.test.${Date.now()}@nationalbusgroup.co.uk`;
    console.log('📧 Test email:', testDriverEmail);
    
    // Get organization ID
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('email', 'transport@nationalbusgroup.co.uk')
      .single();

    if (adminError) {
      console.log('❌ Error getting admin profile:', adminError.message);
    } else {
      console.log('🏢 Organization ID:', adminProfile.organization_id);
      
      // Try to create auth user and see what ID it gets
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: testDriverEmail,
        password: 'TempPass123!',
        email_confirm: true,
        user_metadata: {
          first_name: 'Test',
          last_name: 'Driver',
          role: 'driver'
        }
      });

      if (authError) {
        console.log('❌ Auth user creation failed:', authError.message);
      } else {
        console.log('✅ Auth user created with ID:', authUser.user.id);
        
        // Check if this ID already exists in profiles
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('id', authUser.user.id)
          .maybeSingle();

        if (checkError) {
          console.log('❌ Error checking profile:', checkError.message);
        } else if (existingProfile) {
          console.log('🚨 DUPLICATE KEY FOUND!');
          console.log(`Profile with ID ${authUser.user.id} already exists:`, existingProfile.email);
        } else {
          console.log('✅ No duplicate found for this ID');
        }

        // Clean up the test auth user
        await supabase.auth.admin.deleteUser(authUser.user.id);
        console.log('🧹 Test auth user cleaned up');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }

  console.log('\n🎯 DIAGNOSIS COMPLETE');
  console.log('=====================');
  console.log('Check the output above to identify the source of the duplicate key issue.');
}

diagnoseDuplicateKey();
