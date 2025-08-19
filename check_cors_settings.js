import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://dznbihypzmvcmradijqn.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bmJpaHlwem12Y21yYWRpanFuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk1NDU3NCwiZXhwIjoyMDcwNTMwNTc0fQ.1uw3IQ19133R_54MZFo6UFtkLJrsWBC0G3QZZkugbj0";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkCorsSettings() {
  console.log('🔍 Checking CORS settings and authentication...\n');

  try {
    // Test basic authentication
    console.log('1️⃣ Testing authentication flow...');
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message);
    } else if (session) {
      console.log('✅ Session found for user:', session.user.email);
    } else {
      console.log('ℹ️  No active session found');
    }

    // Test token refresh
    console.log('\n2️⃣ Testing token refresh...');
    
    if (session) {
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.log('❌ Token refresh error:', refreshError.message);
      } else {
        console.log('✅ Token refresh successful');
      }
    }

    // Check current domain
    console.log('\n3️⃣ Current domain information:');
    console.log('   - You need to add your current domain to Supabase CORS settings');
    console.log('   - Common domains to add:');
    console.log('     * http://localhost:3000 (development)');
    console.log('     * http://localhost:5173 (Vite dev server)');
    console.log('     * https://yourdomain.com (production)');
    console.log('     * https://*.yourdomain.com (subdomains)');

  } catch (error) {
    console.error('❌ Error checking CORS settings:', error);
  }
}

checkCorsSettings();
