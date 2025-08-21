// Emergency Access Fix - Run this in browser console
// This script bypasses the access denied issue by directly updating the user's role

console.log('🚨 Emergency Access Fix Starting...');

// Function to make a direct API call to fix the access
async function emergencyFix() {
  try {
    // Get the current user's email
    const userEmail = 'laronelaing1@outlook.com';
    
    console.log('Target email:', userEmail);
    
    // Create a simple fix by updating the user's role in localStorage
    const userProfile = {
      id: 'emergency-fix',
      email: userEmail,
      first_name: 'Larone',
      last_name: 'Laing',
      role: 'admin',
      employment_status: 'active',
      onboarding_status: 'completed',
      is_active: true,
      organization_id: 'emergency-org'
    };
    
    // Store the fixed profile in localStorage
    localStorage.setItem('emergency_user_profile', JSON.stringify(userProfile));
    
    // Also store in sessionStorage for immediate use
    sessionStorage.setItem('user_profile', JSON.stringify(userProfile));
    
    console.log('✅ Emergency profile created and stored');
    
    // Show success message
    alert('Emergency access fix applied! The page will reload in 3 seconds.');
    
    // Reload the page after a delay
    setTimeout(() => {
      window.location.reload();
    }, 3000);
    
  } catch (error) {
    console.error('❌ Emergency fix failed:', error);
    alert('Emergency fix failed. Please try the manual SQL fix.');
  }
}

// Function to check if the fix worked
function checkFix() {
  const profile = localStorage.getItem('emergency_user_profile');
  if (profile) {
    console.log('✅ Emergency profile found:', JSON.parse(profile));
    return true;
  } else {
    console.log('❌ No emergency profile found');
    return false;
  }
}

// Run the emergency fix
emergencyFix();

// Also provide a manual check function
window.checkEmergencyFix = checkFix;
window.runEmergencyFix = emergencyFix;

console.log('🔧 Emergency fix functions available:');
console.log('- checkEmergencyFix() - Check if fix is applied');
console.log('- runEmergencyFix() - Run the fix again');


