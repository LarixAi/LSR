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

    // Check if test driver already exists in profiles
    console.log('🔍 Checking if test driver already exists in profiles...');
    const { data: existingProfile, error: checkProfileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'testdriver@nationalbusgroup.co.uk')
      .maybeSingle();

    if (existingProfile) {
      console.log('ℹ️  Test driver profile already exists with ID:', existingProfile.id);
      
      // Check if Auth user exists for this profile
      const { data: authUser, error: authCheckError } = await supabase.auth.admin.getUserById(existingProfile.id);
      
      if (authUser) {
        console.log('✅ Auth user also exists. Test driver is ready!');
        console.log('📧 Email: testdriver@nationalbusgroup.co.uk');
        console.log('🆔 User ID:', existingProfile.id);
        return;
      } else {
        console.log('⚠️  Profile exists but Auth user is missing. Creating Auth user...');
        
        // Create Auth user for existing profile
        const { data: newAuthUser, error: authCreateError } = await supabase.auth.admin.createUser({
          email: 'testdriver@nationalbusgroup.co.uk',
          password: 'TempPass123!',
          email_confirm: true,
          user_metadata: {
            first_name: 'Test',
            last_name: 'Driver',
            role: 'driver'
          }
        });

        if (authCreateError) {
          console.error('❌ Error creating Auth user for existing profile:', authCreateError);
          return;
        }

        console.log('✅ Auth user created for existing profile');
        console.log('📧 Email: testdriver@nationalbusgroup.co.uk');
        console.log('🔑 Password: TempPass123!');
        console.log('🆔 User ID:', existingProfile.id);
        return;
      }
    }

    // Check if Auth user exists but no profile
    console.log('🔍 Checking if Auth user exists...');
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing Auth users:', listError);
    } else {
      const testAuthUser = authUsers.users.find(user => user.email === 'testdriver@nationalbusgroup.co.uk');
      if (testAuthUser) {
        console.log('⚠️  Auth user exists but no profile. Creating profile...');
        
        // Create profile for existing Auth user
        const { data: newProfile, error: profileCreateError } = await supabase
          .from('profiles')
          .insert({
            id: testAuthUser.id,
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

        if (profileCreateError) {
          console.error('❌ Error creating profile for existing Auth user:', profileCreateError);
          return;
        }

        console.log('✅ Profile created for existing Auth user');
        console.log('📧 Email: testdriver@nationalbusgroup.co.uk');
        console.log('🔑 Password: TempPass123!');
        console.log('🆔 User ID:', testAuthUser.id);
        return;
      }
    }

    // Create both Auth user and profile from scratch
    console.log('👤 Creating new Auth user...');
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

