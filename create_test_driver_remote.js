import { createClient } from '@supabase/supabase-js';

// Your Supabase project URL (from client.ts)
const SUPABASE_URL = "https://dznbihypzmvcmradijqn.supabase.co";

// You need to get this from your Supabase dashboard: Settings > API > service_role key
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.log('📋 To get your service role key:');
  console.log('   1. Go to your Supabase dashboard');
  console.log('   2. Navigate to Settings > API');
  console.log('   3. Copy the "service_role" key (not the anon key)');
  console.log('   4. Set it as an environment variable:');
  console.log('      export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
  console.log('   5. Run this script again');
  process.exit(1);
}

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

    // Check if test driver already exists
    console.log('🔍 Checking if test driver already exists...');
    const { data: existingDriver, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'testdriver@nationalbusgroup.co.uk')
      .single();

    if (existingDriver) {
      console.log('ℹ️  Test driver already exists with ID:', existingDriver.id);
      return;
    }

    // Create Auth user first
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

    // Create profile using the Auth user ID
    console.log('📝 Creating profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authUser.user.id,
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
      // Clean up the Auth user if profile creation fails
      console.log('🧹 Cleaning up Auth user...');
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return;
    }

    console.log('✅ Profile created successfully:', profile);
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
