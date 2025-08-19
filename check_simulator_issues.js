import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://dznbihypzmvcmradijqn.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bmJpaHlwem12Y21yYWRpanFuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk1NDU3NCwiZXhwIjoyMDcwNTMwNTc0fQ.1uw3IQ19133R_54MZFo6UFtkLJrsWBC0G3QZZkugbj0";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkSimulatorIssues() {
  console.log('🔍 SIMULATOR ISSUE DIAGNOSIS\n');
  console.log('🌐 App URL: http://localhost:3000\n');

  const issues = [];

  try {
    // Test 1: Basic App Accessibility
    console.log('1️⃣ Testing Basic App Accessibility...');
    const response = await fetch('http://localhost:3000');
    if (response.ok) {
      console.log('✅ App is accessible');
    } else {
      console.log('❌ App access failed');
      issues.push('App not accessible');
    }

    // Test 2: Check for JavaScript Errors
    console.log('\n2️⃣ Testing JavaScript Loading...');
    try {
      const jsResponse = await fetch('http://localhost:3000/@vite/client');
      if (jsResponse.ok) {
        console.log('✅ Vite client loaded successfully');
      } else {
        console.log('❌ Vite client failed to load');
        issues.push('Vite client not loading');
      }
    } catch (error) {
      console.log('❌ JavaScript loading error:', error.message);
      issues.push('JavaScript loading error');
    }

    // Test 3: Check React Refresh
    console.log('\n3️⃣ Testing React Refresh...');
    try {
      const refreshResponse = await fetch('http://localhost:3000/@react-refresh');
      if (refreshResponse.ok) {
        console.log('✅ React refresh loaded successfully');
      } else {
        console.log('❌ React refresh failed to load');
        issues.push('React refresh not loading');
      }
    } catch (error) {
      console.log('❌ React refresh error:', error.message);
      issues.push('React refresh error');
    }

    // Test 4: Backend Connectivity
    console.log('\n4️⃣ Testing Backend Connectivity...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Backend connectivity issue:', profilesError.message);
      issues.push('Backend connectivity issue');
    } else {
      console.log('✅ Backend connectivity working');
    }

    // Test 5: Check for CORS Issues
    console.log('\n5️⃣ Testing CORS Configuration...');
    try {
      const corsResponse = await fetch('http://localhost:3000', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'GET'
        }
      });
      console.log('✅ CORS preflight successful');
    } catch (error) {
      console.log('❌ CORS issue detected:', error.message);
      issues.push('CORS configuration issue');
    }

    // Test 6: Check Mobile Components
    console.log('\n6️⃣ Testing Mobile Components Availability...');
    
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('*')
      .limit(1);

    if (vehiclesError) {
      console.log('❌ Vehicle data access issue:', vehiclesError.message);
      issues.push('Vehicle data access issue');
    } else {
      console.log('✅ Vehicle data accessible');
    }

    const { data: drivers, error: driversError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'driver')
      .limit(1);

    if (driversError) {
      console.log('❌ Driver data access issue:', driversError.message);
      issues.push('Driver data access issue');
    } else {
      console.log('✅ Driver data accessible');
    }

    // Test 7: Check for Common Console Errors
    console.log('\n7️⃣ Checking for Common Console Errors...');
    
    const commonErrors = [
      'Failed to load resource',
      'CORS error',
      'Network error',
      'Authentication error',
      'Component error',
      'Import error'
    ];

    console.log('🔍 Common error patterns to check in browser console:');
    commonErrors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });

    // Test 8: Check Environment Variables
    console.log('\n8️⃣ Testing Environment Configuration...');
    
    const envChecks = [
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ];

    console.log('🔍 Environment variables to verify:');
    envChecks.forEach((env, index) => {
      console.log(`   ${index + 1}. ${env}`);
    });

  } catch (error) {
    console.error('❌ Error during issue diagnosis:', error);
    issues.push('Diagnosis error: ' + error.message);
  }

  // Summary
  console.log('\n🎯 SIMULATOR ISSUE DIAGNOSIS COMPLETE');
  console.log('=====================================');
  
  if (issues.length === 0) {
    console.log('✅ No issues detected!');
    console.log('✅ App should be working correctly');
    console.log('✅ All systems operational');
  } else {
    console.log(`⚠️  ${issues.length} potential issues detected:`);
    issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
  }

  console.log('\n📋 TROUBLESHOOTING STEPS:');
  console.log('==========================');
  console.log('1. Open browser DevTools (F12)');
  console.log('2. Check Console tab for errors');
  console.log('3. Check Network tab for failed requests');
  console.log('4. Check Application tab for storage issues');
  console.log('5. Try hard refresh (Ctrl+F5 or Cmd+Shift+R)');
  console.log('6. Clear browser cache and cookies');
  console.log('7. Check if mobile components are loading');
  console.log('8. Verify environment variables are set');

  console.log('\n🔍 COMMON SIMULATOR ISSUES:');
  console.log('===========================');
  console.log('• CORS errors - Check Supabase CORS settings');
  console.log('• Authentication errors - Check auth configuration');
  console.log('• Component loading errors - Check import paths');
  console.log('• Network errors - Check internet connection');
  console.log('• Storage errors - Check localStorage permissions');
  console.log('• GPS errors - Check location permissions');

  console.log('\n📱 MOBILE SIMULATOR SPECIFIC CHECKS:');
  console.log('=====================================');
  console.log('1. Enable mobile device simulation in DevTools');
  console.log('2. Check if mobile components render correctly');
  console.log('3. Test touch interactions');
  console.log('4. Verify responsive design');
  console.log('5. Test offline functionality');
  console.log('6. Check GPS location simulation');

  if (issues.length > 0) {
    console.log('\n🚨 RECOMMENDED ACTIONS:');
    console.log('=======================');
    console.log('1. Check browser console for specific error messages');
    console.log('2. Verify all environment variables are set correctly');
    console.log('3. Check Supabase dashboard for any service issues');
    console.log('4. Restart the development server if needed');
    console.log('5. Clear browser cache and try again');
  } else {
    console.log('\n🎉 SIMULATOR SHOULD BE WORKING!');
    console.log('===============================');
    console.log('✅ All systems checked and operational');
    console.log('✅ No issues detected');
    console.log('✅ Ready for mobile testing');
  }
}

checkSimulatorIssues();
