import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://dznbihypzmvcmradijqn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bmJpaHlwem12Y21yYWRpanFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NTQ1NzQsImV4cCI6MjA3MDUzMDU3NH0.dS4mQBL0q_JhsZQF14KKB0nL2f3H--2hPoxXzitPOgo";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createTestDriverViaEdgeFunction() {
  try {
    console.log('🔗 Connecting to Supabase backend...');
    
    // First, sign in as admin to get the session
    console.log('🔐 Signing in as admin...');
    const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'transport@nationalbusgroup.co.uk',
      password: 'your-admin-password' // You'll need to provide this
    });

    if (signInError) {
      console.error('❌ Error signing in:', signInError);
      return;
    }

    console.log('✅ Signed in successfully');

    // Call the create-driver Edge Function
    console.log('📞 Calling create-driver Edge Function...');
    const { data, error } = await supabase.functions.invoke('create-driver', {
      body: {
        email: 'test.driver@nationalbusgroup.co.uk',
        firstName: 'Test',
        lastName: 'Driver',
        role: 'driver'
      }
    });

    if (error) {
      console.error('❌ Error calling create-driver function:', error);
      return;
    }

    console.log('✅ Test driver created successfully via Edge Function:', data);
    console.log('📧 Email: test.driver@nationalbusgroup.co.uk');
    console.log('🔑 Password: TempPass123!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createTestDriverViaEdgeFunction();

