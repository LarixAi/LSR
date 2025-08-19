import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://dznbihypzmvcmradijqn.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bmJpaHlwem12Y21yYWRpanFuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk1NDU3NCwiZXhwIjoyMDcwNTMwNTc0fQ.1uw3IQ19133R_54MZFo6UFtkLJrsWBC0G3QZZkugbj0";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestDriver() {
  try {
    console.log('🔗 Connecting to Supabase backend...');
    
    // First, get the organization ID from your admin profile
    console.log('📋 Looking up admin profile...');
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('email', 'transport@nationalbusgroup.co.uk')
      .single();

    if (adminError) {
      console.error('❌ Error fetching admin profile:', adminError);
      return;
    }

    const testOrgId = adminProfile.organization_id;
    console.log('✅ Found organization ID:', testOrgId);

    // Generate a new UUID for the profile
    const newUserId = crypto.randomUUID();
    console.log('🆔 Generated new user ID:', newUserId);

    // Create profile first with the generated ID
    console.log('📝 Creating profile first...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: newUserId,
        email: 'testdriver@nationalbusgroup.co.uk',
        first_name: 'Test',
        last_name: 'Driver',
        role: 'driver',
        organization_id: testOrgId,
        is_active: true,
        must_change_password: true
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error creating profile:', profileError);
      return;
    }

    console.log('✅ Profile created successfully:', profile);

    // Now create the Auth user with the same ID
    console.log('👤 Creating Auth user with same ID...');
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'testdriver@nationalbusgroup.co.uk',
      password: 'TempPass123!',
      email_confirm: true,
      user_metadata: {
        first_name: 'Test',
        last_name: 'Driver',
        role: 'driver'
      }
    });

    if (authError) {
      console.error('❌ Error creating Auth user:', authError);
      // Clean up the profile if Auth user creation fails
      console.log('🧹 Cleaning up profile...');
      await supabase
        .from('profiles')
        .delete()
        .eq('id', newUserId);
      return;
    }

    console.log('✅ Auth user created with ID:', authUser.user.id);
    console.log('\n🎉 Test driver created successfully!');
    console.log('📧 Email: testdriver@nationalbusgroup.co.uk');
    console.log('🔑 Password: TempPass123!');
    console.log('🆔 User ID:', authUser.user.id);
    console.log('\n💡 You can now test the password change functionality in your app!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createTestDriver();

