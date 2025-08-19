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
    
    // Check if test driver already exists
    const { data: existingDriver, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'testdriver@nationalbusgroup.co.uk')
      .maybeSingle();

    if (existingDriver) {
      console.log('ℹ️  Test driver already exists with ID:', existingDriver.id);
      return;
    }

    // Get organization ID
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('email', 'transport@nationalbusgroup.co.uk')
      .single();

    if (adminError) {
      console.error('❌ Error fetching admin profile:', adminError);
      return;
    }

    console.log('✅ Found organization ID:', adminProfile.organization_id);

    // Create Auth user
    console.log('👤 Creating Auth user...');
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
      return;
    }

    console.log('✅ Auth user created with ID:', authUser.user.id);

    // Create profile
    console.log('📝 Creating profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authUser.user.id,
        email: 'testdriver@nationalbusgroup.co.uk',
        first_name: 'Test',
        last_name: 'Driver',
        role: 'driver',
        organization_id: adminProfile.organization_id,
        is_active: true,
        must_change_password: true
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error creating profile:', profileError);
      // Clean up Auth user
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return;
    }

    console.log('✅ Profile created successfully');
    console.log('\n🎉 Test driver created successfully!');
    console.log('📧 Email: testdriver@nationalbusgroup.co.uk');
    console.log('🔑 Password: TempPass123!');
    console.log('🆔 User ID:', authUser.user.id);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createTestDriver();

