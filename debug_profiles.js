import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://dznbihypzmvcmradijqn.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bmJpaHlwem12Y21yYWRpanFuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk1NDU3NCwiZXhwIjoyMDcwNTMwNTc0fQ.1uw3IQ19133R_54MZFo6UFtkLJrsWBC0G3QZZkugbj0";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function debugProfiles() {
  try {
    console.log('🔍 Debugging profiles table...');
    
    // Get all profiles with their IDs
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, role, created_at')
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('❌ Error fetching profiles:', allError);
      return;
    }

    console.log('📋 All profiles:');
    allProfiles.forEach((profile, index) => {
      console.log(`${index + 1}. ID: ${profile.id}`);
      console.log(`   Email: ${profile.email}`);
      console.log(`   Name: ${profile.first_name} ${profile.last_name}`);
      console.log(`   Role: ${profile.role}`);
      console.log(`   Created: ${profile.created_at}`);
      console.log('');
    });

    // Check for profiles with the specific ID that's causing issues
    const problematicIds = [
      'caddfcea-fef6-4ee6-a99b-f9cdac8d84e5',
      'e17c2aff-5f9d-477d-b849-caa5ce8a5660'
    ];

    console.log('🔍 Checking for problematic IDs...');
    for (const id of problematicIds) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error(`❌ Error checking ID ${id}:`, error);
      } else if (profile) {
        console.log(`⚠️  Found profile with ID ${id}:`, profile);
      } else {
        console.log(`✅ No profile found with ID ${id}`);
      }
    }

    // Check for profiles with test driver email
    console.log('🔍 Checking for test driver email...');
    const { data: testDriverProfiles, error: testError } = await supabase
      .from('profiles')
      .select('*')
      .ilike('email', '%testdriver%');

    if (testError) {
      console.error('❌ Error checking test driver profiles:', testError);
    } else {
      console.log('📋 Profiles with testdriver in email:', testDriverProfiles);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugProfiles();

